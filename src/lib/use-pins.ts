import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Pin = {
  id: string;
  page: number;
  x: number;
  y: number;
  price: number | null;
  label: string | null;
};

export function usePins() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("menu_pins")
        .select("id, page, x, y, price, label");
      if (!mounted) return;
      if (error) console.error(error);
      else setPins((data ?? []) as Pin[]);
      setLoading(false);
    };

    load();

    const channel = supabase
      .channel("menu_pins_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu_pins" },
        (payload) => {
          if (!mounted) return;
          setPins((prev) => {
            if (payload.eventType === "DELETE") {
              const id = (payload.old as { id: string }).id;
              return prev.filter((p) => p.id !== id);
            }
            const row = payload.new as Pin;
            const idx = prev.findIndex((p) => p.id === row.id);
            if (idx === -1) return [...prev, row];
            const next = [...prev];
            next[idx] = row;
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

  return { pins, loading };
}
