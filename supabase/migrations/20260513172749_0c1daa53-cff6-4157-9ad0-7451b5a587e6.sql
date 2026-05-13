CREATE TABLE IF NOT EXISTS public.menu_item_prices (
  item_id text PRIMARY KEY,
  price numeric,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_item_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read prices" ON public.menu_item_prices FOR SELECT USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_item_prices;