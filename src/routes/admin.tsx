import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ITEMS, PAGES, PAGE_ASPECT, formatPrice } from "@/lib/menu-data";
import { usePrices, savePrice } from "@/lib/use-prices";
import { PriceBadge } from "@/components/menu/PriceBadge";
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

  // initialise drafts from loaded prices
  useEffect(() => {
    const next: Record<string, string> = {};
    for (const item of ITEMS) {
      const p = prices[item.id];
      next[item.id] = p == null ? "" : p.toFixed(2).replace(".", ",");
    }
    setDrafts((prev) => ({ ...next, ...prev }));
    // only depend on initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const sections = useMemo(() => {
    const map = new Map<string, typeof ITEMS>();
    for (const item of ITEMS) {
      const arr = map.get(item.section) || [];
      arr.push(item);
      map.set(item.section, arr);
    }
    return Array.from(map.entries());
  }, []);

  const filled = ITEMS.filter((i) => prices[i.id] != null).length;

  const handleBlur = async (id: string) => {
    const value = parseInput(drafts[id] || "");
    if (value === prices[id]) return;
    setSavingId(id);
    try {
      await savePrice(id, value);
      toast.success("Preço salvo", { description: formatPrice(value) || "removido" });
    } catch (e) {
      toast.error("Erro ao salvar", { description: String(e) });
    } finally {
      setSavingId(null);
    }
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
              Admin — Preços do cardápio
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
          Os preços são salvos automaticamente ao sair do campo e aparecem em tempo real no cardápio público.
        </p>

        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,520px)]">
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
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 px-4 py-2.5"
                    >
                      <label
                        htmlFor={item.id}
                        className="flex-1 text-sm leading-tight text-neutral-800"
                      >
                        {item.label}
                      </label>
                      <div className="flex w-40 items-stretch overflow-hidden rounded-md border border-neutral-300 bg-white focus-within:ring-2 focus-within:ring-orange-400">
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
                      {savingId === item.id && (
                        <span className="text-[10px] uppercase tracking-wide text-orange-500">
                          salvando
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Preview pinned */}
          <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] lg:overflow-y-auto">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-500">
              Pré-visualização
            </h3>
            <div className="space-y-3">
              {PAGES.map((page) => {
                const items = ITEMS.filter((i) => i.page === page.num);
                return (
                  <div
                    key={page.num}
                    className="relative overflow-hidden rounded-md bg-white shadow-sm"
                    style={{ aspectRatio: `${PAGE_ASPECT}`, containerType: "inline-size" }}
                  >
                    <img
                      src={page.src}
                      alt={`Página ${page.num}`}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                    {items.map((item) => (
                      <PriceBadge
                        key={item.id}
                        x={item.x}
                        y={item.y}
                        price={
                          drafts[item.id] != null && drafts[item.id] !== ""
                            ? parseInput(drafts[item.id])
                            : prices[item.id]
                        }
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
