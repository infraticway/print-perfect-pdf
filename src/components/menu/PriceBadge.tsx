import { formatPrice } from "@/lib/menu-data";

type Props = {
  x: number;
  y: number;
  price: number | null | undefined;
};

/**
 * Badge de preço sobreposto à página do cardápio.
 * (x, y) são posições em % da imagem-pai (que tem position:relative).
 * O badge é ancorado pela borda DIREITA em x — o preço cresce para a esquerda.
 */
export function PriceBadge({ x, y, price }: Props) {
  if (price == null) return null;
  return (
    <div
      className="absolute -translate-x-full -translate-y-1/2 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[clamp(10px,1.05cqi,18px)] font-bold tracking-tight shadow-sm"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        backgroundColor: "rgba(255, 248, 235, 0.92)",
        color: "oklch(0.58 0.18 35)",
        border: "1px solid oklch(0.58 0.18 35 / 0.35)",
      }}
    >
      {formatPrice(price)}
    </div>
  );
}
