import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MENU } from "@/lib/menu-data";
import { generatePdf } from "@/lib/generate-pdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/")({
  component: Index,
});

const STORAGE_KEY = "havanna-prices-v1";

function Index() {
  const [prices, setPrices] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  });
  const [generating, setGenerating] = useState(false);

  const totalItems = useMemo(
    () => MENU.reduce((s, sec) => s + sec.items.length, 0),
    []
  );
  const filledCount = Object.values(prices).filter((v) => v && v.trim()).length;

  const update = (id: string, v: string) => {
    const cleaned = v.replace(/[^\d,.]/g, "");
    const next = { ...prices, [id]: cleaned };
    setPrices(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const bytes = await generatePdf(prices);
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Cardapio_Havanna_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setGenerating(false);
    }
  };

  const handleClear = () => {
    if (confirm("Limpar todos os preços?")) {
      setPrices({});
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-foreground text-background">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "oklch(0.7 0.18 40)" }}>
              HAVANNA
            </h1>
            <p className="text-xs uppercase tracking-widest opacity-70">
              Gerador de Cardápio
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs opacity-80">
              {filledCount} / {totalItems} preenchidos
            </span>
            <Button variant="outline" onClick={handleClear} className="text-foreground">
              Limpar
            </Button>
            <Button onClick={handleGenerate} disabled={generating}>
              {generating ? "Gerando..." : "Gerar PDF"}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <p className="mb-8 text-sm text-muted-foreground">
          Preencha os preços (o layout do PDF é fixo e organizado por seção). Os valores são salvos automaticamente neste navegador.
        </p>

        <div className="space-y-8">
          {MENU.map((section) => (
            <section
              key={section.id}
              className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
            >
              <div className="bg-foreground px-5 py-3">
                <h2 className="text-lg font-semibold text-background">
                  {section.title}
                </h2>
              </div>
              <div className="grid gap-x-6 gap-y-4 p-5 md:grid-cols-2 lg:grid-cols-3">
                {section.items.map((item) => (
                  <div key={item.id} className="space-y-1.5">
                    <label
                      htmlFor={item.id}
                      className="block text-sm font-medium leading-tight"
                    >
                      {item.name}
                      {item.desc && (
                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                          — {item.desc}
                        </span>
                      )}
                    </label>
                    <div className="flex items-stretch overflow-hidden rounded-md border border-input focus-within:ring-2 focus-within:ring-ring">
                      <span className="flex items-center bg-muted px-3 text-xs font-medium text-muted-foreground">
                        R$
                      </span>
                      <Input
                        id={item.id}
                        inputMode="decimal"
                        placeholder="0,00"
                        value={prices[item.id] || ""}
                        onChange={(e) => update(item.id, e.target.value)}
                        className="border-0 focus-visible:ring-0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="sticky bottom-4 mt-10 flex justify-end">
          <Button size="lg" onClick={handleGenerate} disabled={generating} className="shadow-lg">
            {generating ? "Gerando PDF..." : "Gerar PDF do Cardápio"}
          </Button>
        </div>
      </main>
    </div>
  );
}
