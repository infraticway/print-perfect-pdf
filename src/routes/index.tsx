import { createFileRoute, Link } from "@tanstack/react-router";
import { ITEMS, PAGES, PAGE_ASPECT } from "@/lib/menu-data";
import { usePrices } from "@/lib/use-prices";
import { PriceBadge } from "@/components/menu/PriceBadge";

export const Route = createFileRoute("/")({
  component: Cardapio,
});

function Cardapio() {
  const { prices, loading } = usePrices();

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div>
          <h1 className="text-base font-bold tracking-tight" style={{ color: "oklch(0.58 0.18 35)" }}>
            HAVANNA
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-neutral-500">
            Cafeteria Argentina — Cardápio
          </p>
        </div>
        <Link
          to="/admin"
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Admin
        </Link>
      </div>

      <main className="mx-auto max-w-5xl space-y-4 p-2 sm:p-4">
        {loading && (
          <p className="text-center text-sm text-neutral-500">Carregando preços...</p>
        )}
        {PAGES.map((page) => {
          const items = ITEMS.filter((i) => i.page === page.num);
          return (
            <div
              key={page.num}
              className="relative w-full overflow-hidden rounded-lg bg-white shadow-sm"
              style={{ aspectRatio: `${PAGE_ASPECT}`, containerType: "inline-size" }}
            >
              <img
                src={page.src}
                alt={`Cardápio página ${page.num}`}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              {items.map((item) => (
                <PriceBadge key={item.id} x={item.x} y={item.y} price={prices[item.id]} />
              ))}
            </div>
          );
        })}
      </main>
    </div>
  );
}
