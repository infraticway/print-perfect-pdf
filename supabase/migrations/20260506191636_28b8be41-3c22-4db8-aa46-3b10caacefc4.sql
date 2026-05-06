ALTER TABLE public.menu_prices
  ADD COLUMN IF NOT EXISTS page integer,
  ADD COLUMN IF NOT EXISTS x numeric,
  ADD COLUMN IF NOT EXISTS y numeric;