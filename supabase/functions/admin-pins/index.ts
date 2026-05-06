import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type PinPatch = {
  price?: number | null;
  label?: string | null;
  x?: number;
  y?: number;
  page?: number;
};

type RequestBody =
  | { action: "login"; password: string }
  | { action: "create"; password: string; page: number; x: number; y: number }
  | { action: "update"; password: string; id: string; patch: PinPatch }
  | { action: "delete"; password: string; id: string };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function assertAdmin(password: unknown) {
  const expected = Deno.env.get("ADMIN_PASSWORD");
  if (!expected) throw new Error("Servidor não configurado");
  if (typeof password !== "string" || password !== expected) {
    const error = new Error("Senha incorreta");
    error.name = "UnauthorizedError";
    throw error;
  }
}

function assertPercent(value: unknown, field: string) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error(`${field} inválido`);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método inválido" }, 405);

  try {
    const body = (await req.json()) as RequestBody;
    assertAdmin(body.password);

    if (body.action === "login") return json({ ok: true });

    const url = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceRoleKey) throw new Error("Banco não configurado");

    const supabase = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    if (body.action === "create") {
      assertPercent(body.x, "x");
      assertPercent(body.y, "y");
      const { data, error } = await supabase
        .from("menu_pins")
        .insert({ page: body.page, x: body.x, y: body.y, price: null, label: null })
        .select("id, page, x, y, price, label")
        .single();
      if (error) throw error;
      return json(data);
    }

    if (body.action === "update") {
      const patch = { ...body.patch };
      if (patch.x !== undefined) assertPercent(patch.x, "x");
      if (patch.y !== undefined) assertPercent(patch.y, "y");
      const { error } = await supabase
        .from("menu_pins")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", body.id);
      if (error) throw error;
      return json({ ok: true });
    }

    if (body.action === "delete") {
      const { error } = await supabase.from("menu_pins").delete().eq("id", body.id);
      if (error) throw error;
      return json({ ok: true });
    }

    return json({ error: "Ação inválida" }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    const status = error instanceof Error && error.name === "UnauthorizedError" ? 401 : 400;
    return json({ error: message }, status);
  }
});
