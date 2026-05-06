import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { MENU } from "./menu-data";

const BRAND = rgb(0.85, 0.32, 0.06); // Havanna orange
const DARK = rgb(0.1, 0.08, 0.06);
const MUTED = rgb(0.45, 0.42, 0.4);
const LINE = rgb(0.85, 0.82, 0.78);
const CREAM = rgb(0.99, 0.98, 0.94);

function formatPrice(v: string): string {
  const n = parseFloat(v.replace(",", "."));
  if (!v || isNaN(n)) return "—";
  return `R$ ${n.toFixed(2).replace(".", ",")}`;
}

export async function generatePdf(prices: Record<string, string>): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const W = 595.28; // A4
  const H = 841.89;
  const margin = 40;
  const colGap = 18;
  const cols = 2;
  const colW = (W - margin * 2 - colGap * (cols - 1)) / cols;

  let page = pdf.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: CREAM });

  const drawHeader = () => {
    page.drawRectangle({ x: 0, y: H - 60, width: W, height: 60, color: DARK });
    page.drawText("HAVANNA", { x: margin, y: H - 38, size: 22, font: bold, color: BRAND });
    page.drawText("CAFETERIA ARGENTINA", {
      x: W - margin - bold.widthOfTextAtSize("CAFETERIA ARGENTINA", 10),
      y: H - 32,
      size: 10,
      font: bold,
      color: rgb(1, 1, 1),
    });
    page.drawText("Cardápio - Tabela de Preços", {
      x: margin,
      y: H - 80,
      size: 12,
      font,
      color: MUTED,
    });
  };

  drawHeader();

  let col = 0;
  let y = H - 110;
  const colTop = H - 110;
  const bottom = 50;

  const colX = (c: number) => margin + c * (colW + colGap);

  const newColumnOrPage = (needed: number) => {
    if (y - needed < bottom) {
      col++;
      if (col >= cols) {
        page = pdf.addPage([W, H]);
        page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: CREAM });
        drawHeader();
        col = 0;
      }
      y = colTop;
    }
  };

  for (const section of MENU) {
    newColumnOrPage(60);
    // Section header
    page.drawRectangle({
      x: colX(col),
      y: y - 22,
      width: colW,
      height: 24,
      color: DARK,
    });
    page.drawText(section.title.toUpperCase(), {
      x: colX(col) + 10,
      y: y - 16,
      size: 11,
      font: bold,
      color: BRAND,
    });
    y -= 34;

    for (const item of section.items) {
      const priceStr = formatPrice(prices[item.id] || "");
      const priceW = bold.widthOfTextAtSize(priceStr, 10);
      const nameMaxW = colW - priceW - 16;

      // wrap name
      const words = item.name.split(" ");
      const lines: string[] = [];
      let line = "";
      for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (bold.widthOfTextAtSize(test, 10) <= nameMaxW) line = test;
        else {
          if (line) lines.push(line);
          line = w;
        }
      }
      if (line) lines.push(line);

      const itemH = lines.length * 12 + (item.desc ? 11 : 0) + 8;
      newColumnOrPage(itemH);

      // name lines
      for (let i = 0; i < lines.length; i++) {
        page.drawText(lines[i], {
          x: colX(col),
          y: y - 10 - i * 12,
          size: 10,
          font: bold,
          color: DARK,
        });
      }
      // price (right-aligned, on first line)
      page.drawText(priceStr, {
        x: colX(col) + colW - priceW,
        y: y - 10,
        size: 10,
        font: bold,
        color: BRAND,
      });
      y -= lines.length * 12;

      if (item.desc) {
        page.drawText(item.desc, {
          x: colX(col),
          y: y - 10,
          size: 8.5,
          font,
          color: MUTED,
        });
        y -= 11;
      }
      y -= 4;
      // separator
      page.drawLine({
        start: { x: colX(col), y: y - 1 },
        end: { x: colX(col) + colW, y: y - 1 },
        thickness: 0.5,
        color: LINE,
      });
      y -= 6;
    }
    y -= 8;
  }

  // footer on last page
  page.drawText("O melhooor dulce de leche argentino há 20 anos no Brasil.", {
    x: margin,
    y: 24,
    size: 8,
    font,
    color: MUTED,
  });

  return await pdf.save();
}
