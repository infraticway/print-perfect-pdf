import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { FileDown } from "lucide-react";
import { PAGES, ITEMS, formatPrice, type MenuItem } from "@/lib/menu-data";
import { useItemPrices } from "@/lib/use-item-prices";
import { adminLogin, adminSetPrice } from "@/lib/admin.functions";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: Admin,
});

const PASSWORD_KEY = "havanna_admin_pwd";
const PDF_A4_LANDSCAPE = { width: 841.89, height: 595.28 };
const PDF_A4_PORTRAIT = { width: 595.28, height: 841.89 };

function parseInput(v: string): number | null {
  if (!v.trim()) return null;
  const n = parseFloat(v.replace(/\./g, "").replace(",", "."));
  return isNaN(n) ? null : n;
}

function formatInput(v: number | null | undefined): string {
  if (v == null) return "";
  return v.toFixed(2).replace(".", ",");
}

function textBytes(text: string) {
  return new TextEncoder().encode(text);
}

function base64ToBytes(value: string) {
  const raw = atob(value.split(",")[1] ?? value);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

async function loadImage(src: string) {
  const image = new Image();
  image.decoding = "async";
  image.src = src;
  await image.decode();
  return image;
}

async function renderPageImage(page: (typeof PAGES)[number], prices: Record<string, number | null>) {
  const width = 1600;
  const height = Math.round(width / page.aspect);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, width, height);
  const img = await loadImage(page.src);
  const ratio = Math.min(width / img.naturalWidth, height / img.naturalHeight);
  const drawW = img.naturalWidth * ratio;
  const drawH = img.naturalHeight * ratio;
  const drawX = (width - drawW) / 2;
  const drawY = (height - drawH) / 2;
  ctx.drawImage(img, drawX, drawY, drawW, drawH);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 22px Arial, sans-serif";
  for (const item of ITEMS.filter((it) => it.page === page.num)) {
    const price = prices[item.id];
    if (price == null) continue;
    const text = formatPrice(price);
    const x = (item.x / 100) * width;
    const y = (item.y / 100) * height;
    const metrics = ctx.measureText(text);
    const badgeW = metrics.width + 18;
    const badgeH = 30;
    ctx.fillStyle = "rgba(255, 248, 235, 0.96)";
    ctx.strokeStyle = "#9b3f18";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x - badgeW / 2, y - badgeH / 2, badgeW, badgeH, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#9b3f18";
    ctx.fillText(text, x, y + 1);
  }
  return { bytes: base64ToBytes(canvas.toDataURL("image/jpeg", 0.86)), width, height, aspect: page.aspect };
}

function makePdf(images: Array<{ bytes: Uint8Array; width: number; height: number; aspect: number }>) {
  const chunks: BlobPart[] = [];
  const offsets: number[] = [0];
  let offset = 0;
  const push = (chunk: string | Uint8Array) => {
    const bytes = typeof chunk === "string" ? textBytes(chunk) : chunk;
    chunks.push(typeof chunk === "string" ? chunk : new Uint8Array(bytes));
    offset += bytes.length;
  };
  const startObject = (id: number) => {
    offsets[id] = offset;
    push(`${id} 0 obj\n`);
  };

  const pageIds = images.map((_, i) => 3 + i * 3);
  push("%PDF-1.3\n%\xFF\xFF\xFF\xFF\n");
  startObject(1);
  push("<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  startObject(2);
  push(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>\nendobj\n`);

  images.forEach((image, i) => {
    const pageId = 3 + i * 3;
    const contentId = pageId + 1;
    const imageId = pageId + 2;
    const pageSize = image.aspect >= 1 ? PDF_A4_LANDSCAPE : PDF_A4_PORTRAIT;
    const imageRatio = image.width / image.height;
    let drawW = pageSize.width;
    let drawH = drawW / imageRatio;
    if (drawH > pageSize.height) {
      drawH = pageSize.height;
      drawW = drawH * imageRatio;
    }
    const x = (pageSize.width - drawW) / 2;
    const y = (pageSize.height - drawH) / 2;
    const commands = `q\n${drawW.toFixed(2)} 0 0 ${drawH.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm\n/Im${i + 1} Do\nQ\n`;

    startObject(pageId);
    push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageSize.width} ${pageSize.height}] /Resources << /XObject << /Im${i + 1} ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>\nendobj\n`);
    startObject(contentId);
    push(`<< /Length ${textBytes(commands).length} >>\nstream\n${commands}endstream\nendobj\n`);
    startObject(imageId);
    push(`<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.bytes.length} >>\nstream\n`);
    push(image.bytes);
    push("\nendstream\nendobj\n");
  });

  const xref = offset;
  push(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`);
  for (let i = 1; i < offsets.length; i++) push(`${String(offsets[i]).padStart(10, "0")} 00000 n \n`);
  push(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(chunks, { type: "application/pdf" });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function Admin() {
  const [password, setPassword] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(PASSWORD_KEY);
    if (stored) setPassword(stored);
  }, []);

  if (!password) {
    return (
      <Login
        onSuccess={(pwd) => {
          sessionStorage.setItem(PASSWORD_KEY, pwd);
          setPassword(pwd);
        }}
      />
    );
  }

  return (
    <AdminBoard
      password={password}
      onLogout={() => {
        sessionStorage.removeItem(PASSWORD_KEY);
        setPassword(null);
      }}
    />
  );
}

function Login({ onSuccess }: { onSuccess: (pwd: string) => void }) {
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await adminLogin({ data: { password: pwd } });
      onSuccess(pwd);
    } catch {
      setError("Senha incorreta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-bold" style={{ color: "oklch(0.58 0.18 35)" }}>HAVANNA</h1>
        <p className="mb-4 text-xs uppercase tracking-widest text-neutral-500">Acesso restrito</p>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Senha</label>
        <Input type="password" autoFocus value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="••••••••" />
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading || !pwd}
          className="mt-4 w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
        <div className="mt-3 text-center">
          <Link to="/" className="text-xs text-neutral-500 hover:underline">← Voltar ao cardápio</Link>
        </div>
      </form>
    </div>
  );
}

function AdminBoard({ password, onLogout }: { password: string; onLogout: () => void }) {
  const { prices, loading, setLocal } = useItemPrices();
  const [activePage, setActivePage] = useState<number>(2);
  const [exporting, setExporting] = useState(false);

  const filled = useMemo(
    () => ITEMS.filter((it) => prices[it.id] != null).length,
    [prices],
  );

  const pageItems = useMemo(
    () => ITEMS.filter((it) => it.page === activePage),
    [activePage],
  );

  const editablePages = PAGES.filter((p) => ITEMS.some((it) => it.page === p.num));

  const handleExportPDF = async () => {
    setExporting(true);
    toast.info("Gerando PDF...");
    try {
      const images = [];
      for (const page of PAGES) images.push(await renderPageImage(page, prices));
      const pdf = makePdf(images);
      downloadBlob(pdf, `havanna-cardapio-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("PDF baixado");
    } catch (err) {
      toast.error("Erro no PDF", { description: String(err) });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-neutral-900 text-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-3 py-3 sm:px-6">
          <div>
            <h1 className="text-base font-bold sm:text-lg" style={{ color: "oklch(0.7 0.18 40)" }}>HAVANNA</h1>
            <p className="text-[10px] uppercase tracking-widest opacity-70">Painel administrativo</p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            <span className="hidden text-xs opacity-80 sm:inline">{filled}/{ITEMS.length} preços</span>
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="flex items-center gap-1 rounded-md bg-orange-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              <FileDown className="h-3.5 w-3.5" />
              {exporting ? "Gerando..." : "Salvar PDF"}
            </button>
            <Link to="/" className="rounded-md bg-white/10 px-2 py-1 text-xs hover:bg-white/20">Cardápio</Link>
            <button onClick={onLogout} className="rounded-md border border-white/20 px-2 py-1 text-xs hover:bg-white/10">Sair</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-3 py-4 sm:px-6">
        {loading && <p className="text-sm text-neutral-500">Carregando...</p>}

        <div className="mb-3 flex flex-wrap gap-1 rounded-lg border border-neutral-200 bg-white p-3">
          {editablePages.map((p) => {
            const total = ITEMS.filter((it) => it.page === p.num).length;
            const done = ITEMS.filter((it) => it.page === p.num && prices[it.id] != null).length;
            return (
              <button
                key={p.num}
                onClick={() => setActivePage(p.num)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                  activePage === p.num
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                Pág {p.num} <span className="opacity-60">({done}/{total})</span>
              </button>
            );
          })}
        </div>

        <PriceList
          key={activePage}
          password={password}
          items={pageItems}
          prices={prices}
          onSaved={(itemId, price) => setLocal(itemId, price)}
        />
      </main>
    </div>
  );
}

function PriceList({
  password,
  items,
  prices,
  onSaved,
}: {
  password: string;
  items: MenuItem[];
  prices: Record<string, number | null>;
  onSaved: (itemId: string, price: number | null) => void;
}) {
  const sections = useMemo(() => {
    const map: Record<string, MenuItem[]> = {};
    for (const it of items) {
      (map[it.section] ??= []).push(it);
    }
    return Object.entries(map);
  }, [items]);

  return (
    <div className="space-y-4">
      {sections.map(([section, list]) => (
        <div key={section} className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-600">
            {section}
          </div>
          <ul className="divide-y divide-neutral-100">
            {list.map((it) => (
              <PriceRow
                key={it.id}
                password={password}
                item={it}
                initialPrice={prices[it.id] ?? null}
                onSaved={onSaved}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function PriceRow({
  password,
  item,
  initialPrice,
  onSaved,
}: {
  password: string;
  item: MenuItem;
  initialPrice: number | null;
  onSaved: (itemId: string, price: number | null) => void;
}) {
  const [value, setValue] = useState<string>(formatInput(initialPrice));
  const [saving, setSaving] = useState(false);
  const lastSaved = useRef<string>(formatInput(initialPrice));

  // Keep input in sync if upstream price changes (e.g. realtime from another window)
  useEffect(() => {
    const formatted = formatInput(initialPrice);
    if (formatted !== lastSaved.current) {
      lastSaved.current = formatted;
      setValue(formatted);
    }
  }, [initialPrice]);

  const commit = async () => {
    if (value === lastSaved.current) return;
    const parsed = parseInput(value);
    setSaving(true);
    try {
      await adminSetPrice({ data: { password, item_id: item.id, price: parsed } });
      lastSaved.current = formatInput(parsed);
      setValue(lastSaved.current);
      onSaved(item.id, parsed);
    } catch (err) {
      toast.error("Erro ao salvar", { description: String(err) });
      setValue(lastSaved.current);
    } finally {
      setSaving(false);
    }
  };

  return (
    <li className="flex items-center gap-3 px-4 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-neutral-800">{item.label}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-neutral-400">R$</span>
        <Input
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              (e.target as HTMLInputElement).blur();
            }
          }}
          placeholder="0,00"
          className="h-8 w-24 text-right text-sm tabular-nums"
        />
        {saving && <span className="text-[10px] text-neutral-400">…</span>}
      </div>
    </li>
  );
}
