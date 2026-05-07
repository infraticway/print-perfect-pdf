import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, X, QrCode, Globe } from "lucide-react";
import { PAGES, formatPrice } from "@/lib/menu-data";
import { usePins, type Pin } from "@/lib/use-pins";
import { trackEvent } from "@/lib/analytics";
import { Input } from "@/components/ui/input";
import { NativeQRCode } from "@/components/native-qr-code";

export const Route = createFileRoute("/")({
  component: Cardapio,
});

type Lang = "pt" | "en" | "es";

const LANG_LABELS: Record<Lang, string> = { pt: "PT", en: "EN", es: "ES" };
const SECTION_LABEL_FALLBACK: Record<number, string> = {
  1: "Capa",
  2: "Bebidas Quentes",
  3: "Bebidas Geladas",
  4: "Salgados & Sanduíches",
  5: "Doces & Tortas",
  6: "Alfajores & Para Levar",
  7: "Sobre",
};

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
  const [activePage, setActivePage] = useState<number>(PAGES[0].num);
  const [search, setSearch] = useState("");
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "pt";
    return (localStorage.getItem("menu_lang") as Lang) ?? "pt";
  });
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("menu_lang", lang);
  }, [lang]);

  useEffect(() => {
    trackEvent("view", { language: lang });
  }, [lang]);

  const matchingPinIds = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return new Set(
      pins
        .filter((p) => {
          const name = pinDisplayName(p, lang).toLowerCase();
          const desc = (pinDisplayDesc(p, lang) ?? "").toLowerCase();
          return name.includes(q) || desc.includes(q);
        })
        .map((p) => p.id),
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

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-2 sm:py-3">
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold tracking-tight" style={{ color: "oklch(0.58 0.18 35)" }}>
              HAVANNA
            </h1>
            <p className="truncate text-[10px] uppercase tracking-widest text-neutral-500">
              Cafeteria Argentina
            </p>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex overflow-hidden rounded-md border border-neutral-200">
              {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2 py-1 text-[11px] font-semibold transition ${
                    lang === l ? "bg-neutral-900 text-white" : "bg-white text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  {LANG_LABELS[l]}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowQR(true)}
              aria-label="QR Code"
              className="rounded-md border border-neutral-200 bg-white p-1.5 text-neutral-600 hover:bg-neutral-50"
            >
              <QrCode className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Busca */}
        <div className="border-t border-neutral-100 px-3 py-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                lang === "en"
                  ? "Search items..."
                  : lang === "es"
                    ? "Buscar items..."
                    : "Buscar item..."
              }
              className="h-9 pl-8 pr-8 text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs de seções */}
        <nav className="flex gap-1 overflow-x-auto border-t border-neutral-100 px-2 py-1.5">
          {PAGES.map((p) => {
            const hasMatch = matchingPagesFromSearch?.has(p.num);
            const dim = matchingPagesFromSearch && !hasMatch;
            return (
              <button
                key={p.num}
                onClick={() => setActivePage(p.num)}
                className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-medium transition ${
                  activePage === p.num
                    ? "bg-neutral-900 text-white"
                    : dim
                      ? "bg-neutral-50 text-neutral-300"
                      : "bg-white text-neutral-600 hover:bg-neutral-100"
                } ${hasMatch ? "ring-1 ring-orange-400" : "border border-neutral-200"}`}
              >
                {SECTION_LABEL_FALLBACK[p.num] ?? `Pág ${p.num}`}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl p-2 sm:p-4">
        {loading && <p className="text-center text-sm text-neutral-500">Carregando...</p>}

        {PAGES.filter((p) => p.num === activePage).map((page) => {
          const pagePins = pins.filter((p) => p.page === page.num);
          return (
            <div key={page.num} className="w-full overflow-auto touch-pan-x touch-pan-y">
              <div
                className="relative w-full overflow-hidden rounded-lg bg-white shadow-sm"
                style={{ aspectRatio: `${page.aspect}`, containerType: "inline-size" }}
              >
                <img
                  src={page.src}
                  alt={`Cardápio página ${page.num}`}
                  className="absolute inset-0 h-full w-full select-none object-contain"
                  draggable={false}
                />
                {pagePins.map((pin) => {
                  if (pin.price == null) return null;
                  const isMatch = matchingPinIds?.has(pin.id);
                  const dim = matchingPinIds && !isMatch;
                  return (
                    <button
                      key={pin.id}
                      onClick={() => handlePinClick(pin)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer whitespace-nowrap rounded px-[0.3cqi] py-[0.1cqi] text-[1.4cqi] font-bold leading-tight tracking-tight shadow-sm transition ${
                        isMatch ? "z-10 scale-125 ring-2 ring-orange-500" : ""
                      } ${dim ? "opacity-30" : ""}`}
                      style={{
                        left: `${pin.x}%`,
                        top: `${pin.y}%`,
                        backgroundColor: "rgba(255, 248, 235, 0.92)",
                        color: "oklch(0.58 0.18 35)",
                        border: "1px solid oklch(0.58 0.18 35 / 0.35)",
                      }}
                    >
                      {formatPrice(pin.price)}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        <p className="mt-3 text-center text-[11px] text-neutral-400">
          {lang === "en"
            ? "Pinch / double-tap to zoom"
            : lang === "es"
              ? "Pellizca o toca dos veces para hacer zoom"
              : "Use pinça ou toque duplo para dar zoom"}
        </p>
      </main>

      {/* Modal de detalhe do item */}
      {selectedPin && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          onClick={() => setSelectedPin(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="text-lg font-bold leading-tight" style={{ color: "oklch(0.45 0.18 35)" }}>
                {pinDisplayName(selectedPin, lang) || formatPrice(selectedPin.price)}
              </h3>
              <button onClick={() => setSelectedPin(null)} className="text-neutral-400 hover:text-neutral-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            {pinDisplayDesc(selectedPin, lang) && (
              <p className="mb-3 text-sm text-neutral-600">{pinDisplayDesc(selectedPin, lang)}</p>
            )}
            <p className="text-2xl font-bold" style={{ color: "oklch(0.58 0.18 35)" }}>
              {formatPrice(selectedPin.price)}
            </p>
          </div>
        </div>
      )}

      {/* Modal QR */}
      {showQR && <QRModal onClose={() => setShowQR(false)} />}

      <footer className="py-6 text-center">
        <Link to="/admin" className="text-[10px] text-neutral-300 hover:text-neutral-500">
          admin
        </Link>
      </footer>
    </div>
  );
}

function QRModal({ onClose }: { onClose: () => void }) {
  const url = typeof window !== "undefined" ? window.location.origin : "";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xs rounded-2xl bg-white p-6 text-center shadow-2xl"
      >
        <h3 className="mb-1 text-base font-bold" style={{ color: "oklch(0.58 0.18 35)" }}>
          HAVANNA
        </h3>
        <p className="mb-4 text-xs text-neutral-500">Aponte a câmera para acessar</p>
        <div className="flex justify-center rounded-lg bg-white p-3">
          <NativeQRCode value={url} size={200} />
        </div>
        <p className="mt-3 break-all text-[10px] text-neutral-400">{url}</p>
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-md bg-neutral-900 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
