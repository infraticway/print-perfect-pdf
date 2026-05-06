import { supabase } from "@/integrations/supabase/client";

type PinPatch = {
  price?: number | null;
  label?: string | null;
  x?: number;
  y?: number;
  page?: number;
};

async function callAdminPins<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("admin-pins", { body });
  if (error) throw new Error(error.message);
  return data as T;
}

export const adminLogin = ({ data }: { data: { password: string } }) => {
  return callAdminPins<{ ok: true }>({ action: "login", password: data.password });
};

export const adminCreatePin = ({ data }: { data: { password: string; page: number; x: number; y: number } }) => {
  return callAdminPins({ action: "create", ...data });
};

export const adminUpdatePin = ({ data }: { data: { password: string; id: string; patch: PinPatch } }) => {
  return callAdminPins<{ ok: true }>({ action: "update", ...data });
};

export const adminDeletePin = ({ data }: { data: { password: string; id: string } }) => {
  return callAdminPins<{ ok: true }>({ action: "delete", ...data });
};
