import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { X, QrCode, Expand } from "lucide-react";
import { PAGES, formatPrice } from "@/lib/menu-data";
import { usePins, type Pin } from "@/lib/use-pins";
import { trackEvent } from "@/lib/analytics";
import { NativeQRCode } from "@/components/native-qr-code";

export const Route = createFileRoute("/")({
  component: Cardapio,
});

type Lang = "pt" | "en" | "es";

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

function pinDisplayName(pin: Pin, lang: Lang): string {
  if (lang !== "pt" && pin.translations?.[lang]?.name) return pin.translations[lang]!.name!;
  return pin.name ?? pin.label ?? "";
}
function pinDisplayDesc(pin: Pin, lang: Lang): string | null {
  if (lang !== "pt" && pin.translations?.[lang]?.description) return pin.translations[lang]!.description!;
  return pin.description;
}

function Cardapio() {
  const { pins, loading } = usePins();
  const [lang] = useState<Lang>("pt");
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [zoomPage, setZoomPage] = useState<{ src: string; aspect: number; num: number } | null>(null);

  useEffect(() => {
    trackEvent("view", { language: lang });
  }, [lang]);

  const handlePinClick = (pin: Pin) => {
    setSelectedPin(pin);
    trackEvent("pin_click", { pin_id: pin.id, page: pin.page, language: lang });
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

        {/* Tabs de seções */}
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

        {PAGES.map((page) => {
          const pagePins = pins.filter((p) => p.page === page.num && p.price != null);

          return (
            <section key={page.num} id={`page-${page.num}`} className="w-full scroll-mt-32">
              <button
                type="button"
                onClick={() => setZoomPage({ src: page.src, aspect: page.aspect, num: page.num })}
                className="group relative block w-full overflow-hidden rounded-xl bg-white text-left shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_-8px_rgba(0,0,0,0.08)] ring-1 ring-stone-200/60"
                style={{ aspectRatio: `${page.aspect}`, containerType: "inline-size" }}
                aria-label={`Ampliar página ${page.num}`}
              >
                <img
                  src={page.src}
                  alt={`Cardápio página ${page.num}`}
                  className="absolute inset-0 h-full w-full select-none object-contain"
                  draggable={false}
                  loading={page.num <= 2 ? "eager" : "lazy"}
                  decoding="async"
                />

                <div className="pointer-events-none absolute right-2 top-2 z-20 flex items-center gap-1.5 rounded-full bg-stone-900/85 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-lg backdrop-blur">
                  <Expand className="h-3 w-3" />
                  <span>Ampliar</span>
                </div>

                {pagePins.map((pin) => (
                  <span
                    key={pin.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handlePinClick(pin);
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={pinDisplayName(pin, lang) || formatPrice(pin.price)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer whitespace-nowrap font-bold leading-none tabular-nums tracking-tight active:scale-95"
                    style={{
                      left: `${pin.x}%`,
                      top: `${pin.y}%`,
                      color: BRAND_DEEP,
                      fontSize: "clamp(8px, 1.5cqi, 14px)",
                      textShadow:
                        "0 0 2px #fffaf0, 0 0 2px #fffaf0, 0 0 3px #fffaf0, 0 1px 2px rgba(255,250,240,0.9)",
                    }}
                  >
                    {formatPrice(pin.price)}
                  </span>
                ))}
              </button>
            </section>
          );
        })}
      </main>

      {/* Modal de detalhe do item */}
      {selectedPin && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-stone-950/50 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setSelectedPin(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm overflow-hidden rounded-t-2xl bg-white shadow-2xl ring-1 ring-stone-200 sm:rounded-2xl"
          >
            <div className="px-5 pb-4 pt-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: BRAND }}>
                    Item do cardápio
                  </p>
                  <h3 className="text-xl font-bold leading-tight tracking-tight" style={{ color: BRAND_DEEP }}>
                    {pinDisplayName(selectedPin, lang) || formatPrice(selectedPin.price)}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedPin(null)}
                  aria-label="Fechar"
                  className="-mr-1 -mt-1 rounded-full p-1.5 text-stone-400 active:bg-stone-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {pinDisplayDesc(selectedPin, lang) && (
                <p className="mb-4 text-sm leading-relaxed text-stone-600">
                  {pinDisplayDesc(selectedPin, lang)}
                </p>
              )}
              <div className="flex items-baseline gap-2 border-t border-stone-100 pt-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">Preço</span>
                <span className="text-2xl font-bold tabular-nums" style={{ color: BRAND }}>
                  {formatPrice(selectedPin.price)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showQR && <QRModal onClose={() => setShowQR(false)} />}

      {zoomPage && (
        <PageZoomModal
          page={zoomPage}
          pins={pins.filter((p) => p.page === zoomPage.num)}
          lang={lang}
          onClose={() => setZoomPage(null)}
          onPinClick={handlePinClick}
        />
      )}
    </div>
  );
}

function PageZoomModal({
  page,
  pins,
  lang,
  onClose,
  onPinClick,
}: {
  page: { src: string; aspect: number; num: number };
  pins: Pin[];
  lang: Lang;
  onClose: () => void;
  onPinClick: (pin: Pin) => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-stone-950/95">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-white">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
          Página {page.num} · arraste para mover
        </span>
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div
        className="flex-1 overflow-auto overscroll-contain bg-stone-950"
        style={{ touchAction: "pan-x pan-y pinch-zoom", WebkitOverflowScrolling: "touch" }}
      >
        <div
          className="relative mx-auto"
          style={{
            width: "220vw",
            maxWidth: "none",
            aspectRatio: `${page.aspect}`,
            containerType: "inline-size",
          }}
        >
          <img
            src={page.src}
            alt={`Cardápio página ${page.num} ampliado`}
            draggable={false}
            className="absolute inset-0 block h-full w-full select-none object-contain"
          />
          {pins.map((pin) => {
            if (pin.price == null) return null;
            return (
              <button
                key={pin.id}
                onClick={() => onPinClick(pin)}
                aria-label={pinDisplayName(pin, lang) || formatPrice(pin.price)}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer whitespace-nowrap rounded-[6px] font-semibold leading-none tabular-nums tracking-tight active:scale-95"
                style={{
                  left: `${pin.x}%`,
                  top: `${pin.y}%`,
                  backgroundColor: "#fffaf0",
                  color: BRAND_DEEP,
                  border: `1.5px solid ${BRAND}`,
                  padding: "3px 6px",
                  fontSize: "clamp(10px, 1.1cqi, 16px)",
                  boxShadow: "0 2px 6px rgba(80, 30, 0, 0.25)",
                }}
              >
                {formatPrice(pin.price)}
              </button>
            );
          })}
        </div>
      </div>
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
