import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { X, QrCode } from "lucide-react";
import { PAGES, ITEMS, formatPrice, type MenuItem } from "@/lib/menu-data";
import { useItemPrices } from "@/lib/use-item-prices";
import { trackEvent } from "@/lib/analytics";
import { NativeQRCode } from "@/components/native-qr-code";

export const Route = createFileRoute("/")({
  component: Cardapio,
});

const SECTION_LABEL_FALLBACK: Record<number, string> = {
  1: "Capa",
  2: "Bebidas Quentes",
  3: "Bebidas Geladas",
  4: "Salgados & Sanduíches",
  5: "Doces & Tortas",
  6: "Alfajores & Para Levar",
  7: "Sobre",
};

const BRAND = "oklch(0.55 0.16 38)";
const BRAND_DEEP = "oklch(0.42 0.14 38)";

function Cardapio() {
  const { prices, loading } = useItemPrices();
  const [showQR, setShowQR] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  

  useEffect(() => {
    trackEvent("view", { language: "pt" });
  }, []);

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    trackEvent("pin_click", { pin_id: item.id, page: item.page, language: "pt" });
  };

  const renderPrices = (pageNum: number) => {
    const pageInfo = PAGES.find((p) => p.num === pageNum);
    const pageBg = pageInfo?.bg ?? "#fafbf6";

    const slots = new Map<string, { item: MenuItem; price: number }>();
    for (const item of ITEMS.filter((it) => it.page === pageNum)) {
      const price = prices[item.id];
      if (price == null) continue;
      const slotKey = `${item.page}:${item.x.toFixed(2)}:${item.y.toFixed(2)}`;
      if (!slots.has(slotKey)) slots.set(slotKey, { item, price });
    }

    return Array.from(slots.values()).map(({ item: it, price }) => {
      return (
        <span
          key={it.id}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleItemClick(it);
          }}
          role="button"
          tabIndex={0}
          aria-label={`${it.label}: ${formatPrice(price)}`}
          className="absolute -translate-y-1/2 cursor-pointer whitespace-nowrap font-bold leading-none tabular-nums tracking-tight active:scale-95"
          style={{
            left: `${it.x}%`,
            top: `${it.y}%`,
            color: BRAND,
            background: pageBg,
            padding: "0.18em 0.35em",
            borderRadius: "2px",
            fontSize: "clamp(6px, 1.05cqi, 11px)",
            boxShadow: `0 0 0 2px ${pageBg}`,
          }}
        >
          {formatPrice(price)}
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/95 shadow-[0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-3 py-2">
          <div className="min-w-0">
            <h1
              className="truncate text-[15px] font-bold leading-tight tracking-[0.18em]"
              style={{ color: BRAND }}
            >
              HAVANNA
            </h1>
            <p className="truncate text-[9px] font-medium uppercase tracking-[0.25em] text-stone-400">
              Cafeteria Argentina
            </p>
          </div>

          <button
            onClick={() => setShowQR(true)}
            aria-label="QR Code"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 active:bg-stone-100"
          >
            <QrCode className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex gap-1.5 overflow-x-auto border-t border-stone-100 px-3 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PAGES.map((p) => (
            <button
              key={p.num}
              onClick={() => {
                document
                  .getElementById(`page-${p.num}`)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="shrink-0 rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] font-medium tracking-wide text-stone-600 active:bg-stone-100"
            >
              {SECTION_LABEL_FALLBACK[p.num] ?? `Pág ${p.num}`}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl space-y-3 p-2 sm:space-y-4 sm:p-4">
        {loading && <p className="text-center text-sm text-stone-500">Carregando...</p>}

        {PAGES.map((page) => (
          <section key={page.num} id={`page-${page.num}`} className="w-full scroll-mt-32">
            <div
              className="relative block w-full overflow-hidden rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_-8px_rgba(0,0,0,0.08)] ring-1 ring-stone-200/60"
              style={{ aspectRatio: `${page.aspect}`, containerType: "inline-size" }}
            >
              <img
                src={page.src}
                alt={`Cardápio página ${page.num}`}
                className="absolute inset-0 h-full w-full select-none object-contain"
                draggable={false}
                loading={page.num <= 2 ? "eager" : "lazy"}
                decoding="async"
              />
              {renderPrices(page.num)}
            </div>
          </section>
        ))}
      </main>

      {selectedItem && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-stone-950/50 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setSelectedItem(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm overflow-hidden rounded-t-2xl bg-white shadow-2xl ring-1 ring-stone-200 sm:rounded-2xl"
          >
            <div className="px-5 pb-4 pt-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: BRAND }}>
                    {selectedItem.section}
                  </p>
                  <h3 className="text-xl font-bold leading-tight tracking-tight" style={{ color: BRAND_DEEP }}>
                    {selectedItem.label}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  aria-label="Fechar"
                  className="-mr-1 -mt-1 rounded-full p-1.5 text-stone-400 active:bg-stone-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-baseline gap-2 border-t border-stone-100 pt-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">Preço</span>
                <span className="text-2xl font-bold tabular-nums" style={{ color: BRAND }}>
                  {formatPrice(prices[selectedItem.id] ?? null)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showQR && <QRModal onClose={() => setShowQR(false)} />}
    </div>
  );
}

function QRModal({ onClose }: { onClose: () => void }) {
  const url = typeof window !== "undefined" ? window.location.origin : "";
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xs overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-stone-200"
      >
        <div className="px-6 pb-5 pt-6 text-center">
          <h3 className="text-sm font-bold tracking-[0.18em]" style={{ color: BRAND }}>
            HAVANNA
          </h3>
          <p className="mb-4 mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">
            Aponte a câmera
          </p>
          <div className="flex justify-center rounded-xl border border-stone-100 bg-white p-3">
            <NativeQRCode value={url} size={200} />
          </div>
          <p className="mt-3 break-all text-[10px] text-stone-400">{url}</p>
          <button
            onClick={onClose}
            className="mt-4 w-full rounded-md bg-stone-900 py-2 text-xs font-semibold tracking-wide text-white active:bg-stone-800"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
