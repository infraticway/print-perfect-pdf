import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PriceRow = {
  price: number | null;
  page: number | null;
  x: number | null;
  y: number | null;
};
export type Prices = Record<string, PriceRow>;

export function usePrices() {
  const [prices, setPrices] = useState<Prices>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("menu_prices")
        .select("item_id, price, page, x, y");
      if (!mounted) return;
      if (error) console.error(error);
      else {
        const map: Prices = {};
        for (const row of data || [])
          map[row.item_id] = {
            price: row.price,
            page: row.page,
            x: row.x,
            y: row.y,
          };
        setPrices(map);
      }
      setLoading(false);
    };

    load();

    const channel = supabase
      .channel("menu_prices_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu_prices" },
        (payload) => {
          if (!mounted) return;
          const row = (payload.new ?? payload.old) as {
            item_id: string;
            price: number | null;
            page: number | null;
            x: number | null;
            y: number | null;
          };
          if (!row?.item_id) return;
          setPrices((prev) => {
            const next = { ...prev };
            if (payload.eventType === "DELETE") delete next[row.item_id];
            else
              next[row.item_id] = {
                price: row.price,
                page: row.page,
                x: row.x,
                y: row.y,
              };
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { prices, loading };
}

export async function savePrice(
  itemId: string,
  patch: Partial<{ price: number | null; page: number; x: number; y: number }>
) {
  const { error } = await supabase
    .from("menu_prices")
    .upsert({
      item_id: itemId,
      ...patch,
      updated_at: new Date().toISOString(),
    });
  if (error) throw error;
}
