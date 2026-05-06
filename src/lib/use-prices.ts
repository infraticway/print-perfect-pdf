import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Prices = Record<string, number | null>;

export function usePrices() {
  const [prices, setPrices] = useState<Prices>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data, error } = await supabase.from("menu_prices").select("item_id, price");
      if (!mounted) return;
      if (error) {
        console.error(error);
      } else {
        const map: Prices = {};
        for (const row of data || []) map[row.item_id] = row.price;
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
          const row = (payload.new ?? payload.old) as { item_id: string; price: number | null };
          if (!row?.item_id) return;
          setPrices((prev) => {
            const next = { ...prev };
            if (payload.eventType === "DELETE") delete next[row.item_id];
            else next[row.item_id] = row.price;
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

export async function savePrice(itemId: string, value: number | null) {
  const { error } = await supabase
    .from("menu_prices")
    .upsert({ item_id: itemId, price: value, updated_at: new Date().toISOString() });
  if (error) throw error;
}
