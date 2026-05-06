import { supabaseAdmin } from "@/integrations/supabase/client.server";

type PinPatch = {
  price?: number | null;
  label?: string | null;
  x?: number;
  y?: number;
  page?: number;
};

export function checkAdminPassword(password: unknown) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("Servidor não configurado");
  if (typeof password !== "string" || password !== expected) {
    throw new Error("Senha incorreta");
  }
}

export async function createMenuPin(input: { page: number; x: number; y: number }) {
  const { data: row, error } = await supabaseAdmin
    .from("menu_pins")
    .insert({ page: input.page, x: input.x, y: input.y, price: null, label: null })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return row;
}

export async function updateMenuPin(input: { id: string; patch: PinPatch }) {
  const { error } = await supabaseAdmin
    .from("menu_pins")
    .update({ ...input.patch, updated_at: new Date().toISOString() })
    .eq("id", input.id);

  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function deleteMenuPin(id: string) {
  const { error } = await supabaseAdmin.from("menu_pins").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}
