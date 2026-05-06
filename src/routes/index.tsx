import { createFileRoute, Link } from "@tanstack/react-router";
import { PAGES, PAGE_ASPECT, formatPrice } from "@/lib/menu-data";
import { usePins } from "@/lib/use-pins";

export const Route = createFileRoute("/")({
  component: Cardapio,
});

function Cardapio() {
  const { pins, loading } = usePins();

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
          const pagePins = pins.filter((p) => p.page === page.num);
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
              {pagePins.map((pin) =>
                pin.price == null ? null : (
                  <div
                    key={pin.id}
                    className="absolute -translate-x-full -translate-y-1/2 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[clamp(10px,1.05cqi,18px)] font-bold tracking-tight shadow-sm"
                    style={{
                      left: `${pin.x}%`,
                      top: `${pin.y}%`,
                      backgroundColor: "rgba(255, 248, 235, 0.92)",
                      color: "oklch(0.58 0.18 35)",
                      border: "1px solid oklch(0.58 0.18 35 / 0.35)",
                    }}
                  >
                    {formatPrice(pin.price)}
                  </div>
                )
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
