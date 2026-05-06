import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ITEMS, PAGES, PAGE_ASPECT, formatPrice, type MenuItem } from "@/lib/menu-data";
import { usePrices, savePrice } from "@/lib/use-prices";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: Admin,
});

function parseInput(v: string): number | null {
  if (!v.trim()) return null;
  const n = parseFloat(v.replace(/\./g, "").replace(",", "."));
  return isNaN(n) ? null : n;
}

function Admin() {
  const { prices, loading } = usePrices();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // initialise drafts from loaded prices
  useEffect(() => {
    const next: Record<string, string> = {};
    for (const item of ITEMS) {
      const p = prices[item.id]?.price;
      next[item.id] = p == null ? "" : p.toFixed(2).replace(".", ",");
    }
    setDrafts((prev) => ({ ...next, ...prev }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const sections = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of ITEMS) {
      const arr = map.get(item.section) || [];
      arr.push(item);
      map.set(item.section, arr);
    }
    return Array.from(map.entries());
  }, []);

  const filled = ITEMS.filter((i) => prices[i.id]?.price != null).length;

  const handleBlur = async (id: string) => {
    const value = parseInput(drafts[id] || "");
    if (value === (prices[id]?.price ?? null)) return;
    setSavingId(id);
    try {
      await savePrice(id, { price: value });
      toast.success("Preço salvo", { description: formatPrice(value) || "removido" });
    } catch (e) {
      toast.error("Erro ao salvar", { description: String(e) });
    } finally {
      setSavingId(null);
    }
  };

  const getPos = (item: MenuItem) => {
    const row = prices[item.id];
    return {
      page: row?.page ?? item.page,
      x: row?.x ?? item.x,
      y: row?.y ?? item.y,
    };
  };

  const handleDragEnd = async (id: string, x: number, y: number, page: number) => {
    try {
      await savePrice(id, { x, y, page });
    } catch (e) {
      toast.error("Erro ao salvar posição", { description: String(e) });
    }
  };

  const scrollToItem = (id: string) => {
    setSelectedId(id);
    const el = document.getElementById(`row-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-neutral-900 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-bold" style={{ color: "oklch(0.7 0.18 40)" }}>
              HAVANNA
            </h1>
            <p className="text-[10px] uppercase tracking-widest opacity-70">
              Admin — Preços e posições
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="opacity-80">
              {filled} / {ITEMS.length} preenchidos
            </span>
            <Link
              to="/"
              className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20"
            >
              Ver cardápio
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <p className="mb-6 text-sm text-neutral-600">
          Digite o preço (salva ao sair do campo). <strong>Arraste o badge</strong> sobre a imagem para reposicionar.
          Para mover entre páginas, ajuste manualmente nos campos da linha.
        </p>

        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,640px)]">
          {/* Form */}
          <div className="space-y-6">
            {sections.map(([section, items]) => (
              <section
                key={section}
                className="overflow-hidden rounded-xl border border-neutral-200 bg-white"
              >
                <div className="border-b border-neutral-200 bg-neutral-900 px-4 py-2.5">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-white">
                    {section}
                  </h2>
                </div>
                <div className="divide-y divide-neutral-100">
                  {items.map((item) => {
                    const pos = getPos(item);
                    const isSelected = selectedId === item.id;
                    return (
                      <div
                        key={item.id}
                        id={`row-${item.id}`}
                        className={`flex flex-wrap items-center gap-3 px-4 py-2.5 transition-colors ${
                          isSelected ? "bg-orange-50" : ""
                        }`}
                        onMouseEnter={() => setSelectedId(item.id)}
                      >
                        <label
                          htmlFor={item.id}
                          className="min-w-0 flex-1 text-sm leading-tight text-neutral-800"
                        >
                          {item.label}
                        </label>
                        <div className="flex w-36 items-stretch overflow-hidden rounded-md border border-neutral-300 bg-white focus-within:ring-2 focus-within:ring-orange-400">
                          <span className="flex items-center bg-neutral-100 px-2 text-xs font-medium text-neutral-500">
                            R$
                          </span>
                          <Input
                            id={item.id}
                            inputMode="decimal"
                            placeholder="0,00"
                            value={drafts[item.id] ?? ""}
                            onChange={(e) =>
                              setDrafts((d) => ({ ...d, [item.id]: e.target.value }))
                            }
                            onBlur={() => handleBlur(item.id)}
                            className="border-0 text-right focus-visible:ring-0"
                          />
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                          <span>Pg</span>
                          <Input
                            type="number"
                            min={2}
                            max={6}
                            value={pos.page}
                            onChange={(e) => {
                              const p = parseInt(e.target.value);
                              if (!isNaN(p)) savePrice(item.id, { page: p });
                            }}
                            className="h-7 w-12 px-1 text-center text-xs"
                          />
                          <span className="ml-1">x</span>
                          <span className="w-9 text-right tabular-nums">{pos.x.toFixed(1)}</span>
                          <span>y</span>
                          <span className="w-9 text-right tabular-nums">{pos.y.toFixed(1)}</span>
                        </div>
                        {savingId === item.id && (
                          <span className="text-[10px] uppercase tracking-wide text-orange-500">
                            salvando
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {/* Preview com drag */}
          <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] lg:overflow-y-auto">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-500">
              Pré-visualização — arraste os preços
            </h3>
            <div className="space-y-3">
              {PAGES.map((page) => {
                const items = ITEMS.filter((i) => getPos(i).page === page.num);
                return (
                  <PagePreview
                    key={page.num}
                    pageNum={page.num}
                    src={page.src}
                    items={items}
                    getPos={getPos}
                    drafts={drafts}
                    pricesMap={prices}
                    selectedId={selectedId}
                    onSelect={scrollToItem}
                    onDragEnd={handleDragEnd}
                  />
                );
              })}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function PagePreview({
  pageNum,
  src,
  items,
  getPos,
  drafts,
  pricesMap,
  selectedId,
  onSelect,
  onDragEnd,
}: {
  pageNum: number;
  src: string;
  items: MenuItem[];
  getPos: (i: MenuItem) => { page: number; x: number; y: number };
  drafts: Record<string, string>;
  pricesMap: Record<string, { price: number | null }>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDragEnd: (id: string, x: number, y: number, page: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{ id: string; x: number; y: number } | null>(null);

  const startDrag = (e: React.PointerEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(id);
    const rect = containerRef.current!.getBoundingClientRect();

    const move = (ev: PointerEvent) => {
      const x = ((ev.clientX - rect.left) / rect.width) * 100;
      const y = ((ev.clientY - rect.top) / rect.height) * 100;
      setDragging({ id, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      const x = ((ev.clientX - rect.left) / rect.width) * 100;
      const y = ((ev.clientY - rect.top) / rect.height) * 100;
      const cx = Math.max(0, Math.min(100, x));
      const cy = Math.max(0, Math.min(100, y));
      onDragEnd(id, parseFloat(cx.toFixed(2)), parseFloat(cy.toFixed(2)), pageNum);
      setDragging(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-md bg-white shadow-sm"
      style={{ aspectRatio: `${PAGE_ASPECT}`, containerType: "inline-size" }}
    >
      <img
        src={src}
        alt={`Página ${pageNum}`}
        className="absolute inset-0 h-full w-full select-none object-cover"
        draggable={false}
      />
      {items.map((item) => {
        const pos = getPos(item);
        const live = dragging?.id === item.id ? dragging : null;
        const x = live ? live.x : pos.x;
        const y = live ? live.y : pos.y;
        const draftVal = drafts[item.id];
        const price =
          draftVal != null && draftVal !== ""
            ? parseInput(draftVal)
            : pricesMap[item.id]?.price;
        const isSelected = selectedId === item.id;
        return (
          <div
            key={item.id}
            onPointerDown={(e) => startDrag(e, item.id)}
            title={item.label}
            className={`absolute -translate-x-full -translate-y-1/2 cursor-grab whitespace-nowrap rounded-md px-1.5 py-0.5 text-[clamp(9px,1cqi,16px)] font-bold tracking-tight shadow-sm active:cursor-grabbing ${
              isSelected ? "ring-2 ring-orange-500 ring-offset-1" : ""
            }`}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              backgroundColor: "rgba(255, 248, 235, 0.95)",
              color: "oklch(0.58 0.18 35)",
              border: "1px solid oklch(0.58 0.18 35 / 0.4)",
              touchAction: "none",
            }}
          >
            {price != null ? formatPrice(price) : "R$ —"}
          </div>
        );
      })}
    </div>
  );
}
