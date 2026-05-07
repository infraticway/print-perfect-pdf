import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Sparkles, Trash2, Search, Languages, FileDown, BarChart3, Undo2, Plus } from "lucide-react";
import { PAGES, formatPrice } from "@/lib/menu-data";
import { usePins, type Pin } from "@/lib/use-pins";
import {
  adminLogin,
  adminCreatePin,
  adminUpdatePin,
  adminDeletePin,
  adminAIDetect,
  adminTranslate,
  adminDeletePage,
} from "@/lib/admin.functions";
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

function encodePdfText(text: string) {
  return text.replace(/[\\()]/g, "\\$&").replace(/[\r\n]+/g, " ");
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

async function renderPageImage(page: (typeof PAGES)[number], pins: Pin[]) {
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
  pins.forEach((pin) => {
    if (pin.price == null) return;
    const text = formatPrice(pin.price);
    const x = (pin.x / 100) * width;
    const y = (pin.y / 100) * height;
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
  });
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

type UndoAction =
  | { kind: "delete"; pin: Pin }
  | { kind: "update"; id: string; before: Partial<Pin> };

function AdminBoard({ password, onLogout }: { password: string; onLogout: () => void }) {
  const { pins, loading, addPinLocal, addPinsLocal, updatePinLocal, removePinLocal } = usePins();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<number>(PAGES[0].num);
  const [tab, setTab] = useState<"editor" | "list" | "stats">("editor");
  const [search, setSearch] = useState("");
  const [translating, setTranslating] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const undoStack = useRef<UndoAction[]>([]);

  const filled = pins.filter((p) => p.price != null).length;
  const pagePins = pins.filter((p) => p.page === activePage);

  const pushUndo = (action: UndoAction) => {
    undoStack.current.push(action);
    if (undoStack.current.length > 50) undoStack.current.shift();
  };

  const undo = useCallback(async () => {
    const action = undoStack.current.pop();
    if (!action) {
      toast.info("Nada para desfazer");
      return;
    }
    try {
      if (action.kind === "delete") {
        const { pin } = action;
        const created = (await adminCreatePin({
          data: { password, page: pin.page, x: pin.x, y: pin.y },
        })) as Pin;
        // Restore name/price/etc
        await adminUpdatePin({
          data: {
            password,
            id: created.id,
            patch: {
              price: pin.price,
              name: pin.name,
              description: pin.description,
              label: pin.label,
            },
          },
        });
        addPinLocal({ ...created, ...pin, id: created.id });
        toast.success("Pino restaurado");
      } else {
        await adminUpdatePin({ data: { password, id: action.id, patch: action.before } });
        updatePinLocal(action.id, action.before);
        toast.success("Alteração desfeita");
      }
    } catch (err) {
      toast.error("Falha ao desfazer", { description: String(err) });
    }
  }, [password, addPinLocal, updatePinLocal]);

  // Atalhos de teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA") return;
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      } else if (e.key === "Escape") {
        setSelectedId(null);
      } else if (e.key === "Delete" && selectedId) {
        const pin = pins.find((p) => p.id === selectedId);
        if (pin && confirm("Remover este pino?")) {
          adminDeletePin({ data: { password, id: selectedId } })
            .then(() => {
              pushUndo({ kind: "delete", pin });
              removePinLocal(selectedId);
              setSelectedId(null);
              toast.success("Removido");
            })
            .catch((err) => toast.error("Erro", { description: String(err) }));
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, pins, password, undo, removePinLocal]);

  const handleAIDetect = async () => {
    if (!confirm(`Usar IA para detectar todos os itens da página ${activePage}? Os pinos sugeridos serão criados (sem preço, você revisa depois).`)) return;
    const page = PAGES.find((p) => p.num === activePage)!;
    const imageUrl = `${window.location.origin}${page.src}`;
    toast.info("IA analisando a página... pode demorar 20-40s");
    try {
      const result = await adminAIDetect({ data: { password, page: activePage, imageUrl } });
      addPinsLocal(result.created as Pin[]);
      toast.success(`IA criou ${result.created.length} pinos`);
    } catch (err) {
      toast.error("Erro na detecção", { description: String(err) });
    }
  };

  const handleTranslate = async (target: "en" | "es") => {
    setTranslating(target);
    try {
      const result = await adminTranslate({ data: { password, target } });
      toast.success(`${result.translated} itens traduzidos para ${target.toUpperCase()}`);
    } catch (err) {
      toast.error("Erro na tradução", { description: String(err) });
    } finally {
      setTranslating(null);
    }
  };

  const handleClearPage = async () => {
    if (!confirm(`Remover TODOS os pinos da página ${activePage}? Isso não pode ser desfeito.`)) return;
    try {
      await adminDeletePage({ data: { password, page: activePage } });
      pagePins.forEach((p) => removePinLocal(p.id));
      toast.success("Página limpa");
    } catch (err) {
      toast.error("Erro", { description: String(err) });
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    toast.info("Gerando PDF...");
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      let first = true;
      for (const page of PAGES) {
        const node = document.getElementById(`export-page-${page.num}`);
        if (!node) continue;
        const canvas = await html2canvas(node, { useCORS: true, scale: 2, backgroundColor: "#ffffff" });
        const img = canvas.toDataURL("image/jpeg", 0.85);
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const ratio = canvas.width / canvas.height;
        let w = pageW, h = pageW / ratio;
        if (h > pageH) { h = pageH; w = pageH * ratio; }
        if (!first) pdf.addPage();
        first = false;
        pdf.addImage(img, "JPEG", (pageW - w) / 2, (pageH - h) / 2, w, h);
      }
      pdf.save(`havanna-cardapio-${new Date().toISOString().slice(0, 10)}.pdf`);
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
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-3 py-3 sm:px-6">
          <div>
            <h1 className="text-base font-bold sm:text-lg" style={{ color: "oklch(0.7 0.18 40)" }}>HAVANNA</h1>
            <p className="text-[10px] uppercase tracking-widest opacity-70">Painel administrativo</p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            <span className="hidden text-xs opacity-80 sm:inline">{filled}/{pins.length} pinos</span>
            <button onClick={undo} title="Desfazer (Ctrl+Z)" className="rounded-md bg-white/10 p-1.5 hover:bg-white/20">
              <Undo2 className="h-3.5 w-3.5" />
            </button>
            <Link to="/" className="rounded-md bg-white/10 px-2 py-1 text-xs hover:bg-white/20">Cardápio</Link>
            <button onClick={onLogout} className="rounded-md border border-white/20 px-2 py-1 text-xs hover:bg-white/10">Sair</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-white/10 bg-neutral-800">
          <div className="mx-auto flex max-w-7xl gap-1 px-3 sm:px-6">
            {(["editor", "list", "stats"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`border-b-2 px-3 py-2 text-xs font-medium transition ${
                  tab === t ? "border-orange-400 text-white" : "border-transparent text-white/60 hover:text-white"
                }`}
              >
                {t === "editor" ? "Editor visual" : t === "list" ? "Lista de itens" : "Estatísticas"}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6">
        {loading && <p className="text-sm text-neutral-500">Carregando...</p>}

        {tab === "editor" && (
          <>
            {/* Toolbar de ações por página */}
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-white p-3">
              <div className="flex flex-wrap gap-1">
                {PAGES.map((p) => (
                  <button
                    key={p.num}
                    onClick={() => setActivePage(p.num)}
                    className={`rounded-md px-2 py-1 text-xs font-medium ${
                      activePage === p.num ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    Pág {p.num}
                  </button>
                ))}
              </div>
              <div className="ml-auto flex flex-wrap gap-1.5">
                <button
                  onClick={handleAIDetect}
                  className="flex items-center gap-1 rounded-md bg-orange-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-orange-600"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Detectar com IA
                </button>
                <button
                  onClick={handleClearPage}
                  className="flex items-center gap-1 rounded-md border border-red-300 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Limpar página
                </button>
              </div>
            </div>

            <PageEditor
              key={activePage}
              password={password}
              pageNum={activePage}
              src={PAGES.find((p) => p.num === activePage)!.src}
              aspect={PAGES.find((p) => p.num === activePage)!.aspect}
              pins={pagePins}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onLocalCreate={addPinLocal}
              onLocalMove={updatePinLocal}
              onLocalRemove={(id, pin) => {
                pushUndo({ kind: "delete", pin });
                removePinLocal(id);
              }}
              onLocalUpdate={(id, before) => {
                pushUndo({ kind: "update", id, before });
              }}
            />

            <p className="mt-2 text-[11px] text-neutral-500">
              Atalhos: <kbd className="rounded bg-neutral-200 px-1">Ctrl+Z</kbd> desfazer ·{" "}
              <kbd className="rounded bg-neutral-200 px-1">Delete</kbd> remover pino selecionado ·{" "}
              <kbd className="rounded bg-neutral-200 px-1">Esc</kbd> fechar editor
            </p>
          </>
        )}

        {tab === "list" && (
          <ListView
            password={password}
            pins={pins}
            search={search}
            setSearch={setSearch}
            updatePinLocal={updatePinLocal}
            removePinLocal={removePinLocal}
            pushUndo={pushUndo}
            onTranslate={handleTranslate}
            translating={translating}
            onExportPDF={handleExportPDF}
            exporting={exporting}
          />
        )}

        {tab === "stats" && <StatsView />}
      </main>

      {/* Render oculto para exportação PDF */}
      <div className="fixed left-[-99999px] top-0">
        {PAGES.map((page) => {
          const ps = pins.filter((p) => p.page === page.num);
          return (
            <div
              key={page.num}
              id={`export-page-${page.num}`}
              className="relative bg-white"
              style={{ width: 1600, aspectRatio: page.aspect, containerType: "inline-size" }}
            >
              <img src={page.src} crossOrigin="anonymous" alt="" className="absolute inset-0 h-full w-full object-contain" />
              {ps.map((pin) =>
                pin.price == null ? null : (
                  <div
                    key={pin.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded px-1 py-0.5 text-[14px] font-bold shadow-sm"
                    style={{
                      left: `${pin.x}%`,
                      top: `${pin.y}%`,
                      backgroundColor: "rgba(255, 248, 235, 0.95)",
                      color: "oklch(0.58 0.18 35)",
                      border: "1px solid oklch(0.58 0.18 35 / 0.5)",
                    }}
                  >
                    {formatPrice(pin.price)}
                  </div>
                ),
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PageEditor({
  password,
  pageNum,
  src,
  aspect,
  pins,
  selectedId,
  onSelect,
  onLocalCreate,
  onLocalMove,
  onLocalRemove,
  onLocalUpdate,
}: {
  password: string;
  pageNum: number;
  src: string;
  aspect: number;
  pins: Pin[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onLocalCreate: (pin: Pin) => void;
  onLocalMove: (id: string, patch: Partial<Pin>) => void;
  onLocalRemove: (id: string, pin: Pin) => void;
  onLocalUpdate: (id: string, before: Partial<Pin>) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{ id: string; x: number; y: number } | null>(null);
  const dragRef = useRef<{
    id: string;
    pointerId: number;
    startClientX: number;
    startClientY: number;
    originX: number;
    originY: number;
    x: number;
    y: number;
    moved: boolean;
  } | null>(null);

  const coordsFromEvent = (clientX: number, clientY: number) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.max(0, Math.min(100, parseFloat(x.toFixed(2)))),
      y: Math.max(0, Math.min(100, parseFloat(y.toFixed(2)))),
    };
  };

  const handleBackgroundClick = async (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget && !(e.target as HTMLElement).dataset.bg) return;
    const { x, y } = coordsFromEvent(e.clientX, e.clientY);
    try {
      const pin = (await adminCreatePin({ data: { password, page: pageNum, x, y } })) as Pin;
      onLocalCreate(pin);
      onSelect(pin.id);
    } catch (err) {
      toast.error("Erro ao criar pino", { description: String(err) });
    }
  };

  const startDrag = (e: React.PointerEvent<HTMLDivElement>, pin: Pin) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      id: pin.id,
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      originX: pin.x,
      originY: pin.y,
      x: pin.x,
      y: pin.y,
      moved: false,
    };
    setDragging(null);
  };

  const SNAP = 0.7; // % distance to snap
  const moveDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!drag || !rect || drag.pointerId !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    const dxPx = e.clientX - drag.startClientX;
    const dyPx = e.clientY - drag.startClientY;
    if (!drag.moved && dxPx * dxPx + dyPx * dyPx > 16) drag.moved = true;
    let x = drag.originX + (dxPx / rect.width) * 100;
    let y = drag.originY + (dyPx / rect.height) * 100;
    // Snap to other pins
    for (const p of pins) {
      if (p.id === drag.id) continue;
      if (Math.abs(p.x - x) < SNAP) x = p.x;
      if (Math.abs(p.y - y) < SNAP) y = p.y;
    }
    drag.x = Math.max(0, Math.min(100, parseFloat(x.toFixed(2))));
    drag.y = Math.max(0, Math.min(100, parseFloat(y.toFixed(2))));
    if (drag.moved) setDragging({ id: drag.id, x: drag.x, y: drag.y });
  };

  const endDrag = async (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.releasePointerCapture(e.pointerId);
    dragRef.current = null;
    setDragging(null);
    if (!drag.moved) {
      onSelect(drag.id);
      return;
    }
    const pin = pins.find((p) => p.id === drag.id);
    const previous = pin ? { x: pin.x, y: pin.y } : null;
    onLocalMove(drag.id, { x: drag.x, y: drag.y });
    try {
      await adminUpdatePin({ data: { password, id: drag.id, patch: { x: drag.x, y: drag.y } } });
      if (previous) onLocalUpdate(drag.id, previous);
    } catch (err) {
      if (previous) onLocalMove(drag.id, previous);
      toast.error("Erro ao mover", { description: String(err) });
    }
  };

  return (
    <section className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-100 px-4 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-600">Página {pageNum}</h2>
        <span className="text-[11px] text-neutral-500">{pins.length} pinos · clique para adicionar</span>
      </div>
      <div
        ref={containerRef}
        onClick={handleBackgroundClick}
        className="relative w-full cursor-crosshair"
        style={{ aspectRatio: `${aspect}`, containerType: "inline-size" }}
      >
        <img
          src={src}
          alt={`Página ${pageNum}`}
          data-bg="1"
          draggable={false}
          className="absolute inset-0 h-full w-full select-none object-contain"
        />
        {pins.map((pin) => {
          const live = dragging?.id === pin.id ? dragging : null;
          const x = live ? live.x : pin.x;
          const y = live ? live.y : pin.y;
          const isSelected = selectedId === pin.id;
          const hasPrice = pin.price != null;
          return (
            <div
              key={pin.id}
              onPointerDown={(e) => startDrag(e, pin)}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-grab whitespace-nowrap rounded px-[0.3cqi] py-[0.1cqi] text-[1.4cqi] font-bold leading-tight tracking-tight shadow-sm active:cursor-grabbing ${
                isSelected ? "z-20 ring-2 ring-orange-500 ring-offset-1" : "z-10"
              }`}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                backgroundColor: hasPrice ? "rgba(255, 248, 235, 0.95)" : "rgba(255, 220, 180, 0.95)",
                color: "oklch(0.45 0.18 35)",
                border: `1px solid oklch(0.58 0.18 35 / ${hasPrice ? 0.5 : 0.8})`,
                touchAction: "none",
              }}
              title={pin.name ?? undefined}
            >
              {hasPrice ? formatPrice(pin.price) : pin.name ? pin.name.slice(0, 14) : "novo"}
            </div>
          );
        })}

        {selectedId && pins.some((p) => p.id === selectedId) && (
          <PinEditor
            password={password}
            pin={pins.find((p) => p.id === selectedId)!}
            onClose={() => onSelect(null)}
            onLocalUpdate={onLocalMove}
            onLocalRemove={onLocalRemove}
            pushUpdate={onLocalUpdate}
          />
        )}
      </div>
    </section>
  );
}

function PinEditor({
  password,
  pin,
  onClose,
  onLocalUpdate,
  onLocalRemove,
  pushUpdate,
}: {
  password: string;
  pin: Pin;
  onClose: () => void;
  onLocalUpdate: (id: string, patch: Partial<Pin>) => void;
  onLocalRemove: (id: string, pin: Pin) => void;
  pushUpdate: (id: string, before: Partial<Pin>) => void;
}) {
  const [priceDraft, setPriceDraft] = useState(pin.price == null ? "" : pin.price.toFixed(2).replace(".", ","));
  const [nameDraft, setNameDraft] = useState(pin.name ?? "");

  const save = async () => {
    const before: Partial<Pin> = { price: pin.price, name: pin.name };
    const patch = { price: parseInput(priceDraft), name: nameDraft.trim() || null };
    onLocalUpdate(pin.id, patch);
    try {
      await adminUpdatePin({ data: { password, id: pin.id, patch } });
      pushUpdate(pin.id, before);
      toast.success("Salvo");
      onClose();
    } catch (err) {
      onLocalUpdate(pin.id, before);
      toast.error("Erro ao salvar", { description: String(err) });
    }
  };

  const remove = async () => {
    if (!confirm("Remover este pino?")) return;
    try {
      await adminDeletePin({ data: { password, id: pin.id } });
      onLocalRemove(pin.id, pin);
      onClose();
    } catch (err) {
      toast.error("Erro", { description: String(err) });
    }
  };

  const duplicate = async () => {
    try {
      const newX = Math.min(100, pin.x + 3);
      const newY = Math.min(100, pin.y + 3);
      const created = (await adminCreatePin({ data: { password, page: pin.page, x: newX, y: newY } })) as Pin;
      await adminUpdatePin({
        data: { password, id: created.id, patch: { price: pin.price, name: pin.name } },
      });
      onLocalUpdate(created.id, { ...created, price: pin.price, name: pin.name });
      toast.success("Duplicado");
    } catch (err) {
      toast.error("Erro", { description: String(err) });
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className="absolute right-3 top-3 z-30 w-72 rounded-lg border border-neutral-200 bg-white p-3 shadow-xl"
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-600">Editar pino</h3>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700" aria-label="Fechar">✕</button>
      </div>

      <label className="mb-1 block text-[11px] font-medium text-neutral-500">Nome do item</label>
      <Input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} placeholder="ex: Espresso Doppio" className="mb-2 text-sm" />

      <label className="mb-1 block text-[11px] font-medium text-neutral-500">Preço</label>
      <div className="mb-3 flex items-stretch overflow-hidden rounded-md border border-neutral-300">
        <span className="flex items-center bg-neutral-100 px-2 text-xs font-medium text-neutral-500">R$</span>
        <Input
          inputMode="decimal"
          placeholder="0,00"
          value={priceDraft}
          onChange={(e) => setPriceDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          className="border-0 text-right focus-visible:ring-0"
        />
      </div>

      <div className="flex gap-1.5">
        <button onClick={save} className="flex-1 rounded-md bg-neutral-900 px-2 py-1.5 text-xs font-medium text-white hover:bg-neutral-800">
          Salvar
        </button>
        <button onClick={duplicate} className="rounded-md border border-neutral-300 px-2 py-1.5 text-xs hover:bg-neutral-50" title="Duplicar">
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button onClick={remove} className="rounded-md border border-red-300 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="mt-2 text-[10px] text-neutral-400">Pos: {pin.x.toFixed(1)}%, {pin.y.toFixed(1)}%</p>
    </div>
  );
}

function ListView({
  password,
  pins,
  search,
  setSearch,
  updatePinLocal,
  removePinLocal,
  pushUndo,
  onTranslate,
  translating,
  onExportPDF,
  exporting,
}: {
  password: string;
  pins: Pin[];
  search: string;
  setSearch: (v: string) => void;
  updatePinLocal: (id: string, patch: Partial<Pin>) => void;
  removePinLocal: (id: string) => void;
  pushUndo: (a: UndoAction) => void;
  onTranslate: (target: "en" | "es") => void;
  translating: string | null;
  onExportPDF: () => void;
  exporting: boolean;
}) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pins;
    return pins.filter(
      (p) => (p.name ?? "").toLowerCase().includes(q) || (p.label ?? "").toLowerCase().includes(q),
    );
  }, [search, pins]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-white p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar item..." className="pl-8" />
        </div>
        <button
          onClick={() => onTranslate("en")}
          disabled={translating !== null}
          className="flex items-center gap-1 rounded-md border border-neutral-300 px-2 py-1.5 text-xs hover:bg-neutral-50 disabled:opacity-50"
        >
          <Languages className="h-3.5 w-3.5" /> {translating === "en" ? "Traduzindo..." : "Traduzir EN"}
        </button>
        <button
          onClick={() => onTranslate("es")}
          disabled={translating !== null}
          className="flex items-center gap-1 rounded-md border border-neutral-300 px-2 py-1.5 text-xs hover:bg-neutral-50 disabled:opacity-50"
        >
          <Languages className="h-3.5 w-3.5" /> {translating === "es" ? "Traduzindo..." : "Traduzir ES"}
        </button>
        <button
          onClick={onExportPDF}
          disabled={exporting}
          className="flex items-center gap-1 rounded-md bg-neutral-900 px-2 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          <FileDown className="h-3.5 w-3.5" /> {exporting ? "Gerando..." : "Exportar PDF"}
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-[11px] uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-3 py-2">Pág</th>
              <th className="px-3 py-2">Nome</th>
              <th className="px-3 py-2 w-32">Preço</th>
              <th className="px-3 py-2 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-neutral-400">Nenhum item</td>
              </tr>
            )}
            {filtered.map((pin) => (
              <ListRow
                key={pin.id}
                password={password}
                pin={pin}
                onUpdate={updatePinLocal}
                onRemove={(id, p) => {
                  pushUndo({ kind: "delete", pin: p });
                  removePinLocal(id);
                }}
                pushUpdate={(id, before) => pushUndo({ kind: "update", id, before })}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ListRow({
  password,
  pin,
  onUpdate,
  onRemove,
  pushUpdate,
}: {
  password: string;
  pin: Pin;
  onUpdate: (id: string, patch: Partial<Pin>) => void;
  onRemove: (id: string, pin: Pin) => void;
  pushUpdate: (id: string, before: Partial<Pin>) => void;
}) {
  const [name, setName] = useState(pin.name ?? "");
  const [price, setPrice] = useState(pin.price == null ? "" : pin.price.toFixed(2).replace(".", ","));

  useEffect(() => setName(pin.name ?? ""), [pin.name]);
  useEffect(() => setPrice(pin.price == null ? "" : pin.price.toFixed(2).replace(".", ",")), [pin.price]);

  const save = async () => {
    const newName = name.trim() || null;
    const newPrice = parseInput(price);
    if (newName === pin.name && newPrice === pin.price) return;
    const before: Partial<Pin> = { name: pin.name, price: pin.price };
    onUpdate(pin.id, { name: newName, price: newPrice });
    try {
      await adminUpdatePin({ data: { password, id: pin.id, patch: { name: newName, price: newPrice } } });
      pushUpdate(pin.id, before);
    } catch (err) {
      onUpdate(pin.id, before);
      toast.error("Erro", { description: String(err) });
    }
  };

  const remove = async () => {
    if (!confirm(`Remover "${pin.name ?? "item"}"?`)) return;
    try {
      await adminDeletePin({ data: { password, id: pin.id } });
      onRemove(pin.id, pin);
    } catch (err) {
      toast.error("Erro", { description: String(err) });
    }
  };

  return (
    <tr className="border-t border-neutral-100 hover:bg-neutral-50">
      <td className="px-3 py-2 text-xs text-neutral-500">{pin.page}</td>
      <td className="px-3 py-1">
        <Input value={name} onChange={(e) => setName(e.target.value)} onBlur={save} className="h-8 border-transparent bg-transparent text-sm hover:border-neutral-200 focus:border-neutral-300" placeholder="(sem nome)" />
      </td>
      <td className="px-3 py-1">
        <Input value={price} onChange={(e) => setPrice(e.target.value)} onBlur={save} onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} className="h-8 border-transparent bg-transparent text-right text-sm hover:border-neutral-200 focus:border-neutral-300" placeholder="0,00" inputMode="decimal" />
      </td>
      <td className="px-3 py-1">
        <button onClick={remove} className="rounded p-1 text-neutral-400 hover:bg-red-50 hover:text-red-600">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  );
}

function StatsView() {
  const [stats, setStats] = useState<{ views: number; clicks: number; topPins: Array<{ pin_id: string; name: string | null; clicks: number }>; viewsByLang: Record<string, number> } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const [{ data: views }, { data: clicks }] = await Promise.all([
        supabase.from("menu_events").select("language", { count: "exact" }).eq("event_type", "view").gte("created_at", since),
        supabase.from("menu_events").select("pin_id", { count: "exact" }).eq("event_type", "pin_click").gte("created_at", since),
      ]);

      const viewsByLang: Record<string, number> = {};
      (views ?? []).forEach((v: { language: string | null }) => {
        const k = v.language ?? "—";
        viewsByLang[k] = (viewsByLang[k] ?? 0) + 1;
      });

      const clicksMap = new Map<string, number>();
      (clicks ?? []).forEach((c: { pin_id: string | null }) => {
        if (!c.pin_id) return;
        clicksMap.set(c.pin_id, (clicksMap.get(c.pin_id) ?? 0) + 1);
      });
      const topIds = Array.from(clicksMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
      const { data: pinNames } = await supabase
        .from("menu_pins")
        .select("id, name")
        .in("id", topIds.map(([id]) => id));
      const nameMap = new Map((pinNames ?? []).map((p: { id: string; name: string | null }) => [p.id, p.name]));

      setStats({
        views: views?.length ?? 0,
        clicks: clicks?.length ?? 0,
        topPins: topIds.map(([id, c]) => ({ pin_id: id, name: nameMap.get(id) ?? "(sem nome)", clicks: c })),
        viewsByLang,
      });
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className="text-sm text-neutral-500">Carregando estatísticas...</p>;
  if (!stats) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card label="Visualizações (30 dias)" value={stats.views} icon={<BarChart3 className="h-4 w-4" />} />
        <Card label="Cliques em itens" value={stats.clicks} icon={<BarChart3 className="h-4 w-4" />} />
        <Card label="Idiomas" value={Object.entries(stats.viewsByLang).map(([k, v]) => `${k.toUpperCase()} ${v}`).join(" · ") || "—"} icon={<Languages className="h-4 w-4" />} />
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-neutral-700">Itens mais vistos</h3>
        {stats.topPins.length === 0 ? (
          <p className="text-sm text-neutral-400">Nenhum clique registrado ainda</p>
        ) : (
          <ol className="space-y-1.5 text-sm">
            {stats.topPins.map((p, i) => (
              <li key={p.pin_id} className="flex items-center justify-between gap-2 border-b border-neutral-100 pb-1.5 last:border-0">
                <span className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-400">{i + 1}.</span>
                  <span>{p.name}</span>
                </span>
                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">{p.clicks}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function Card({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-3">
      <div className="mb-1 flex items-center gap-1.5 text-xs text-neutral-500">{icon}<span>{label}</span></div>
      <p className="text-xl font-bold text-neutral-900">{value}</p>
    </div>
  );
}
