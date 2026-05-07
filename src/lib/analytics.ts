import { supabase } from "@/integrations/supabase/client";

export async function trackEvent(
  event_type: "view" | "pin_click",
  data: { pin_id?: string; page?: number; language?: string } = {},
) {
  try {
    await supabase.from("menu_events").insert({
      event_type,
      pin_id: data.pin_id ?? null,
      page: data.page ?? null,
      language: data.language ?? null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 200) : null,
    });
  } catch (e) {
    // Silently ignore — analytics shouldn't block UX
    console.warn("analytics failed", e);
  }
}
