import { supabase } from "@/integrations/supabase/client";

type PinPatch = {
  price?: number | null;
  label?: string | null;
  name?: string | null;
  description?: string | null;
  x?: number;
  y?: number;
  page?: number;
};

async function callAdminPins<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("admin-pins", { body });
  if (error) throw new Error(error.message);
  if (data && typeof data === "object" && "error" in data) {
    throw new Error((data as { error: string }).error);
  }
  return data as T;
}

export const adminLogin = ({ data }: { data: { password: string } }) => {
  return callAdminPins<{ ok: true }>({ action: "login", password: data.password });
};

export const adminCreatePin = ({
  data,
}: {
  data: { password: string; page: number; x: number; y: number; name?: string };
}) => {
  return callAdminPins({ action: "create", ...data });
};

export const adminUpdatePin = ({
  data,
}: {
  data: { password: string; id: string; patch: PinPatch };
}) => {
  return callAdminPins<{ ok: true }>({ action: "update", ...data });
};

export const adminDeletePin = ({ data }: { data: { password: string; id: string } }) => {
  return callAdminPins<{ ok: true }>({ action: "delete", ...data });
};

export const adminDeletePage = ({ data }: { data: { password: string; page: number } }) => {
  return callAdminPins<{ ok: true }>({ action: "delete_page", ...data });
};

export const adminAIDetect = ({
  data,
}: {
  data: { password: string; page: number; imageUrl: string };
}) => {
  return callAdminPins<{ created: Array<Record<string, unknown>> }>({ action: "ai_detect", ...data });
};

export const adminTranslate = ({ data }: { data: { password: string; target: "en" | "es" } }) => {
  return callAdminPins<{ translated: number }>({ action: "translate", ...data });
};

export const adminSetPrice = ({
  data,
}: {
  data: { password: string; item_id: string; price: number | null };
}) => {
  return callAdminPins<{ ok: true }>({ action: "set_price", ...data });
};
