-- Lock down menu_pins writes — only server (service role) can modify.
-- Public reads stay open so the menu page works without login.
DROP POLICY IF EXISTS "anyone insert pins" ON public.menu_pins;
DROP POLICY IF EXISTS "anyone update pins" ON public.menu_pins;
DROP POLICY IF EXISTS "anyone delete pins" ON public.menu_pins;