import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const getAdmin = async () => supabaseAdmin;

function checkPassword(password: unknown) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("Servidor não configurado");
  if (typeof password !== "string" || password !== expected) {
    throw new Error("Senha incorreta");
  }
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    checkPassword(data.password);
    return { ok: true };
  });

export const adminCreatePin = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; page: number; x: number; y: number }) => d)
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const admin = await getAdmin();
    const { data: row, error } = await admin
      .from("menu_pins")
      .insert({ page: data.page, x: data.x, y: data.y, price: null, label: null })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminUpdatePin = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      password: string;
      id: string;
      patch: { price?: number | null; label?: string | null; x?: number; y?: number; page?: number };
    }) => d
  )
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const admin = await getAdmin();
    const { error } = await admin
      .from("menu_pins")
      .update({ ...data.patch, updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeletePin = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; id: string }) => d)
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const admin = await getAdmin();
    const { error } = await admin.from("menu_pins").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
