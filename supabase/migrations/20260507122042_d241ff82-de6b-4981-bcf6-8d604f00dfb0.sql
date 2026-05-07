DROP POLICY IF EXISTS "anyone insert events" ON public.menu_events;

CREATE POLICY "anyone insert valid events" ON public.menu_events
FOR INSERT TO public
WITH CHECK (
  event_type IN ('view', 'pin_click')
  AND (language IS NULL OR language IN ('pt', 'en', 'es'))
  AND (user_agent IS NULL OR length(user_agent) <= 500)
  AND (page IS NULL OR (page >= 0 AND page <= 1000))
);