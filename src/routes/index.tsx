import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { X, QrCode, Minus, Plus, Maximize2 } from "lucide-react";
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

const PIN_SCALE_KEY = "menu_pin_scale";
const PIN_SCALE_MIN = 0.6;
const PIN_SCALE_MAX = 1.6;
const PIN_SCALE_STEP = 0.15;

const BRAND = "oklch(0.55 0.16 38)";
const BRAND_DEEP = "oklch(0.42 0.14 38)";

function pinDisplayName(pin: Pin, lang: Lang): string {
  if (lang !== "pt" && pin.translations?.[lang]?.name) return pin.translations[lang]!.name!;
  return pin.name ?? pin.label ?? "";
}
function pinSearchHaystack(pin: Pin, lang: Lang): string {
  const parts: string[] = [];
  if (pin.name) parts.push(pin.name);
  if (pin.label) parts.push(pin.label);
  if (pin.description) parts.push(pin.description);
  if (lang !== "pt" && pin.translations?.[lang]) {
    if (pin.translations[lang]?.name) parts.push(pin.translations[lang]!.name!);
    if (pin.translations[lang]?.description) parts.push(pin.translations[lang]!.description!);
  }
  return parts.join(" ").toLowerCase();
}
function pinDisplayDesc(pin: Pin, lang: Lang): string | null {
  if (lang !== "pt" && pin.translations?.[lang]?.description) return pin.translations[lang]!.description!;
  return pin.description;
}

function clampScale(v: number) {
  return Math.max(PIN_SCALE_MIN, Math.min(PIN_SCALE_MAX, parseFloat(v.toFixed(2))));
}

function Cardapio() {
  const { pins, loading } = usePins();
  const [search] = useState("");
  const [lang, setLang] = useState<Lang>("pt");
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [pinScale, setPinScale] = useState<number>(1);
  const [zoomPage, setZoomPage] = useState<{ src: string; aspect: number; num: number } | null>(null);

  useEffect(() => {
    const storedLang = localStorage.getItem("menu_lang") as Lang | null;
    if (storedLang) setLang(storedLang);
    const storedScale = localStorage.getItem(PIN_SCALE_KEY);
    if (storedScale) {
      const n = parseFloat(storedScale);
      if (!Number.isNaN(n)) setPinScale(clampScale(n));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("menu_lang", lang);
  }, [lang]);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(PIN_SCALE_KEY, String(pinScale));
  }, [pinScale]);

  useEffect(() => {
    trackEvent("view", { language: lang });
  }, [lang]);

  const matchingPinIds = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return new Set(
      pins.filter((p) => pinSearchHaystack(p, lang).includes(q)).map((p) => p.id),
    );
  }, [search, pins, lang]);

  const matchingPagesFromSearch = useMemo(() => {
    if (!matchingPinIds) return null;
    const pages = new Set<number>();
    pins.forEach((p) => {
      if (matchingPinIds.has(p.id)) pages.add(p.page);
    });
    return pages;
  }, [matchingPinIds, pins]);

  const handlePinClick = (pin: Pin) => {
    setSelectedPin(pin);
    trackEvent("pin_click", { pin_id: pin.id, page: pin.page, language: lang });
  };

  const decreaseScale = () => setPinScale((s) => clampScale(s - PIN_SCALE_STEP));
  const increaseScale = () => setPinScale((s) => clampScale(s + PIN_SCALE_STEP));

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5 sm:py-3">
          <div className="min-w-0">
            <h1
              className="truncate text-[15px] font-bold leading-tight tracking-[0.18em] sm:text-base"
              style={{ color: BRAND }}
            >
              HAVANNA
            </h1>
            <p className="truncate text-[9px] font-medium uppercase tracking-[0.25em] text-stone-400 sm:text-[10px]">
              Cafeteria Argentina
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Controle de tamanho do pino */}
            <div className="flex items-center overflow-hidden rounded-full border border-stone-200 bg-white">
              <button
                onClick={decreaseScale}
                disabled={pinScale <= PIN_SCALE_MIN + 0.001}
                aria-label="Diminuir cardápio"
                className="flex h-7 w-7 items-center justify-center text-stone-500 hover:bg-stone-50 disabled:opacity-30"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[34px] border-x border-stone-200 px-1 text-center text-[10px] font-semibold tabular-nums text-stone-500">
                {Math.round(pinScale * 100)}%
              </span>
              <button
                onClick={increaseScale}
                disabled={pinScale >= PIN_SCALE_MAX - 0.001}
                aria-label="Aumentar cardápio"
                className="flex h-7 w-7 items-center justify-center text-stone-500 hover:bg-stone-50 disabled:opacity-30"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              onClick={() => setShowQR(true)}
              aria-label="QR Code"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 hover:bg-stone-50"
            >
              <QrCode className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Tabs de seções (âncoras de rolagem) */}
        <nav className="flex gap-1.5 overflow-x-auto border-t border-stone-100 px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PAGES.map((p) => {
            const hasMatch = matchingPagesFromSearch?.has(p.num);
            const dim = matchingPagesFromSearch && !hasMatch;
            return (
              <button
                key={p.num}
                onClick={() => {
                  document
                    .getElementById(`page-${p.num}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium tracking-wide transition ${
                  dim
                    ? "border-stone-100 bg-stone-50 text-stone-300"
                    : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:text-stone-900"
                } ${hasMatch ? "ring-1 ring-offset-1" : ""}`}
                style={hasMatch ? { boxShadow: `inset 0 0 0 1px ${BRAND}` } : undefined}
              >
                {SECTION_LABEL_FALLBACK[p.num] ?? `Pág ${p.num}`}
              </button>
            );
          })}
        </nav>
      </header>

      <main
        className="mx-auto space-y-3 p-2 transition-[width] duration-200 sm:space-y-4 sm:p-4"
        style={{
          width: `min(${64 * pinScale}rem, calc(100vw * ${pinScale}))`,
          maxWidth: "none",
        }}
      >
        {loading && <p className="text-center text-sm text-stone-500">Carregando...</p>}

        {PAGES.map((page) => {
          const pagePins = pins.filter((p) => p.page === page.num);
          return (
            <section
              key={page.num}
              id={`page-${page.num}`}
              className="w-full scroll-mt-32"
            >
              <div
                className="relative w-full overflow-hidden rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_-8px_rgba(0,0,0,0.08)] ring-1 ring-stone-200/60"
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
                <button
                  onClick={() => setZoomPage({ src: page.src, aspect: page.aspect, num: page.num })}
                  aria-label="Ver em tela cheia"
                  className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-stone-700 shadow-md ring-1 ring-stone-200 backdrop-blur transition hover:bg-white hover:text-stone-900"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
                {pagePins.map((pin) => {
                  if (pin.price == null) return null;
                  const isMatch = matchingPinIds?.has(pin.id);
                  const dim = matchingPinIds && !isMatch;
                  return (
                    <button
                      key={pin.id}
                      onClick={() => handlePinClick(pin)}
                      aria-label={pinDisplayName(pin, lang) || formatPrice(pin.price)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer whitespace-nowrap rounded-[4px] font-semibold leading-none tabular-nums tracking-tight transition-transform duration-150 hover:scale-110 active:scale-95 ${
                        isMatch ? "z-10 scale-125 ring-2 ring-offset-1" : ""
                      } ${dim ? "opacity-25" : ""}`}
                      style={{
                        left: `${pin.x}%`,
                        top: `${pin.y}%`,
                        backgroundColor: "#fffaf0",
                        color: BRAND_DEEP,
                        border: `1px solid ${BRAND}`,
                        padding: "1px 3px",
                        fontSize: "clamp(6px, 0.85cqi, 11px)",
                        boxShadow: "0 1px 2px rgba(80, 30, 0, 0.15)",
                        ...(isMatch ? { ["--tw-ring-color" as string]: BRAND } : {}),
                      }}
                    >
                      {formatPrice(pin.price)}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>

      {/* Modal de detalhe do item */}
      {selectedPin && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/50 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setSelectedPin(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm overflow-hidden rounded-t-2xl bg-white shadow-2xl ring-1 ring-stone-200 sm:rounded-2xl"
          >
            <div className="px-5 pb-4 pt-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p
                    className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em]"
                    style={{ color: BRAND }}
                  >
                    Item do cardápio
                  </p>
                  <h3
                    className="text-xl font-bold leading-tight tracking-tight"
                    style={{ color: BRAND_DEEP }}
                  >
                    {pinDisplayName(selectedPin, lang) || formatPrice(selectedPin.price)}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedPin(null)}
                  aria-label="Fechar"
                  className="-mr-1 -mt-1 rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
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
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
                  Preço
                </span>
                <span className="text-2xl font-bold tabular-nums" style={{ color: BRAND }}>
                  {formatPrice(selectedPin.price)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal QR */}
      {showQR && <QRModal onClose={() => setShowQR(false)} />}

      {/* Modal de página em tela cheia */}
      {zoomPage && <PageZoomModal page={zoomPage} onClose={() => setZoomPage(null)} />}
    </div>
  );
}

function PageZoomModal({
  page,
  onClose,
}: {
  page: { src: string; aspect: number; num: number };
  onClose: () => void;
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
          Página {page.num} · pinça para dar zoom
        </span>
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div
        className="flex-1 overflow-auto overscroll-contain bg-stone-950"
        style={{ touchAction: "pinch-zoom" }}
      >
        <img
          src={page.src}
          alt={`Cardápio página ${page.num} ampliado`}
          draggable={false}
          className="block h-auto w-auto max-w-none select-none"
          style={{
            // Tamanho inicial generoso para já facilitar a leitura no celular
            minWidth: "180vw",
            minHeight: page.aspect < 1 ? "100vh" : undefined,
          }}
        />
      </div>
    </div>
  );
}

function QRModal({ onClose }: { onClose: () => void }) {
  const url = typeof window !== "undefined" ? window.location.origin : "";
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm"
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
            className="mt-4 w-full rounded-md bg-stone-900 py-2 text-xs font-semibold tracking-wide text-white hover:bg-stone-800"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
