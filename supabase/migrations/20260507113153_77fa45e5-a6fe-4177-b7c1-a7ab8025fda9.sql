
-- Add name column to menu_pins for item identification (used by AI detection and multi-language)
ALTER TABLE public.menu_pins ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.menu_pins ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.menu_pins ADD COLUMN IF NOT EXISTS translations jsonb DEFAULT '{}'::jsonb;

-- Analytics: track menu views and pin clicks
CREATE TABLE IF NOT EXISTS public.menu_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN ('view', 'pin_click')),
  pin_id uuid REFERENCES public.menu_pins(id) ON DELETE SET NULL,
  page integer,
  language text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert events (public tracking)
CREATE POLICY "anyone insert events" ON public.menu_events FOR INSERT TO public WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_menu_events_created ON public.menu_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_menu_events_pin ON public.menu_events(pin_id);
