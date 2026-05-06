import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PAGES, formatPrice } from "@/lib/menu-data";
import { usePins, type Pin } from "@/lib/use-pins";
import { adminLogin, adminCreatePin, adminUpdatePin, adminDeletePin } from "@/lib/admin.functions";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: Admin,
});

const PASSWORD_KEY = "havanna_admin_pwd";

function parseInput(v: string): number | null {
  if (!v.trim()) return null;
  const n = parseFloat(v.replace(/\./g, "").replace(",", "."));
  return isNaN(n) ? null : n;
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
    } catch (err) {
      setError("Senha incorreta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-lg font-bold" style={{ color: "oklch(0.58 0.18 35)" }}>
          HAVANNA
        </h1>
        <p className="mb-4 text-xs uppercase tracking-widest text-neutral-500">Acesso restrito</p>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Senha</label>
        <Input
          type="password"
          autoFocus
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          placeholder="••••••••"
        />
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading || !pwd}
          className="mt-4 w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
        <div className="mt-3 text-center">
          <Link to="/" className="text-xs text-neutral-500 hover:underline">
            ← Voltar ao cardápio
          </Link>
        </div>
      </form>
    </div>
  );
}

function AdminBoard({ password, onLogout }: { password: string; onLogout: () => void }) {
  const { pins, loading, addPinLocal, updatePinLocal } = usePins();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filled = pins.filter((p) => p.price != null).length;

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-neutral-900 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-bold" style={{ color: "oklch(0.7 0.18 40)" }}>
              HAVANNA
            </h1>
            <p className="text-[10px] uppercase tracking-widest opacity-70">
              Admin — Pinos de preço
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="opacity-80">
              {filled} preços / {pins.length} pinos
            </span>
            <Link
              to="/"
              className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20"
            >
              Ver cardápio
            </Link>
            <button
              onClick={onLogout}
              className="rounded-md border border-white/20 px-3 py-1.5 text-xs font-medium hover:bg-white/10"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-4 px-4 py-6">
        <div className="rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-700">
          <p className="mb-1 font-semibold">Como usar</p>
          <ul className="list-disc space-y-0.5 pl-5 text-neutral-600">
            <li>
              <strong>Clique</strong> em qualquer ponto da imagem para criar um pino de preço ali.
            </li>
            <li>
              <strong>Arraste</strong> um pino existente para reposicionar.
            </li>
            <li>
              Clique em um pino para <strong>editar o preço</strong> ou <strong>remover</strong>.
            </li>
            <li>
              Pinos sem preço aparecem como{" "}
              <span className="rounded bg-neutral-200 px-1 text-[10px] font-bold">novo</span> e
              ficam ocultos no cardápio público.
            </li>
          </ul>
        </div>

        {loading && <p className="text-sm text-neutral-500">Carregando...</p>}

        {PAGES.map((page) => (
          <PageEditor
            key={page.num}
            password={password}
            pageNum={page.num}
            src={page.src}
            aspect={page.aspect}
            pins={pins.filter((p) => p.page === page.num)}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onLocalCreate={addPinLocal}
            onLocalMove={updatePinLocal}
          />
        ))}
      </main>
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
      const pin = await adminCreatePin({ data: { password, page: pageNum, x, y } });
      onSelect((pin as Pin).id);
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

  const moveDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!drag || !rect || drag.pointerId !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();

    const dxPx = e.clientX - drag.startClientX;
    const dyPx = e.clientY - drag.startClientY;
    if (!drag.moved && dxPx * dxPx + dyPx * dyPx > 16) drag.moved = true;

    const x = drag.originX + (dxPx / rect.width) * 100;
    const y = drag.originY + (dyPx / rect.height) * 100;
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
    } catch (err) {
      if (previous) onLocalMove(drag.id, previous);
      toast.error("Erro ao mover", { description: String(err) });
    }
  };

  return (
    <section className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-100 px-4 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-600">
          Página {pageNum}
        </h2>
        <span className="text-[11px] text-neutral-500">
          {pins.length} pinos · clique na imagem para adicionar
        </span>
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
          className="absolute inset-0 h-full w-full select-none object-cover"
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
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-grab whitespace-nowrap rounded px-1 py-px text-[clamp(7px,0.75cqi,13px)] font-bold leading-tight tracking-tight shadow-sm active:cursor-grabbing ${
                isSelected ? "z-20 ring-2 ring-orange-500 ring-offset-1" : "z-10"
              }`}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                backgroundColor: hasPrice
                  ? "rgba(255, 248, 235, 0.95)"
                  : "rgba(255, 220, 180, 0.95)",
                color: "oklch(0.45 0.18 35)",
                border: `1px solid oklch(0.58 0.18 35 / ${hasPrice ? 0.5 : 0.8})`,
                touchAction: "none",
              }}
            >
              {hasPrice ? formatPrice(pin.price) : "novo"}
            </div>
          );
        })}

        {selectedId && pins.some((p) => p.id === selectedId) && (
          <PinEditor
            password={password}
            pin={pins.find((p) => p.id === selectedId)!}
            onClose={() => onSelect(null)}
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
}: {
  password: string;
  pin: Pin;
  onClose: () => void;
}) {
  const [priceDraft, setPriceDraft] = useState(
    pin.price == null ? "" : pin.price.toFixed(2).replace(".", ","),
  );
  const [labelDraft, setLabelDraft] = useState(pin.label ?? "");

  const save = async () => {
    try {
      await adminUpdatePin({
        data: {
          password,
          id: pin.id,
          patch: {
            price: parseInput(priceDraft),
            label: labelDraft.trim() || null,
          },
        },
      });
      toast.success("Pino salvo");
      onClose();
    } catch (err) {
      toast.error("Erro ao salvar", { description: String(err) });
    }
  };

  const remove = async () => {
    if (!confirm("Remover este pino?")) return;
    try {
      await adminDeletePin({ data: { password, id: pin.id } });
      onClose();
    } catch (err) {
      toast.error("Erro ao remover", { description: String(err) });
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className="absolute right-3 top-3 z-30 w-64 rounded-lg border border-neutral-200 bg-white p-3 shadow-xl"
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-600">
          Editar pino
        </h3>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-700"
          aria-label="Fechar"
        >
          ✕
        </button>
      </div>

      <label className="mb-1 block text-[11px] font-medium text-neutral-500">Preço</label>
      <div className="mb-2 flex items-stretch overflow-hidden rounded-md border border-neutral-300">
        <span className="flex items-center bg-neutral-100 px-2 text-xs font-medium text-neutral-500">
          R$
        </span>
        <Input
          autoFocus
          inputMode="decimal"
          placeholder="0,00"
          value={priceDraft}
          onChange={(e) => setPriceDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          className="border-0 text-right focus-visible:ring-0"
        />
      </div>

      <label className="mb-1 block text-[11px] font-medium text-neutral-500">
        Rótulo (opcional, só você vê)
      </label>
      <Input
        placeholder="ex: Espresso Doppio"
        value={labelDraft}
        onChange={(e) => setLabelDraft(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && save()}
        className="mb-3 text-sm"
      />

      <div className="flex gap-2">
        <button
          onClick={save}
          className="flex-1 rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
        >
          Salvar
        </button>
        <button
          onClick={remove}
          className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
        >
          Remover
        </button>
      </div>
      <p className="mt-2 text-[10px] text-neutral-400">
        Posição: {pin.x.toFixed(1)}%, {pin.y.toFixed(1)}%
      </p>
    </div>
  );
}
