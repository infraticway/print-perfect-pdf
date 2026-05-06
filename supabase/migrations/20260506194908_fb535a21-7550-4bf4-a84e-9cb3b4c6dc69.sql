CREATE TABLE public.menu_pins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page INTEGER NOT NULL,
  x NUMERIC NOT NULL,
  y NUMERIC NOT NULL,
  price NUMERIC,
  label TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_pins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone read pins" ON public.menu_pins FOR SELECT USING (true);
CREATE POLICY "anyone insert pins" ON public.menu_pins FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone update pins" ON public.menu_pins FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anyone delete pins" ON public.menu_pins FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_pins;
ALTER TABLE public.menu_pins REPLICA IDENTITY FULL;