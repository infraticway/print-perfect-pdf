import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ItemPrice = { item_id: string; price: number | null };

export function useItemPrices() {
  const [prices, setPrices] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data, error } = await supabase
        .from("menu_item_prices")
        .select("item_id, price");
      if (!mounted) return;
      if (error) console.error(error);
      else {
        const map: Record<string, number | null> = {};
        for (const row of (data ?? []) as ItemPrice[]) {
          map[row.item_id] = row.price == null ? null : Number(row.price);
        }
        setPrices(map);
      }
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel("menu_item_prices_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu_item_prices" },
        (payload) => {
          if (!mounted) return;
          if (payload.eventType === "DELETE") {
            const id = (payload.old as { item_id: string }).item_id;
            setPrices((prev) => {
              const next = { ...prev };
              delete next[id];
              return next;
            });
          } else {
            const row = payload.new as ItemPrice;
            setPrices((prev) => ({
              ...prev,
              [row.item_id]: row.price == null ? null : Number(row.price),
            }));
          }
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const setLocal = (itemId: string, price: number | null) => {
    setPrices((prev) => ({ ...prev, [itemId]: price }));
  };

  return { prices, loading, setLocal };
}
