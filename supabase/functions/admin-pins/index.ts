import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type PinPatch = {
  price?: number | null;
  label?: string | null;
  name?: string | null;
  description?: string | null;
  translations?: Record<string, { name?: string; description?: string }> | null;
  x?: number;
  y?: number;
  page?: number;
};

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

function getDb() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Banco não configurado");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function detectMenuItems(imageUrl: string, page: number) {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY ausente");

  const systemPrompt = `Você analisa fotos de cardápio de cafeteria. Para cada item de menu visível na imagem, identifique:
- name: nome do produto (curto, como aparece no cardápio)
- description: descrição breve (se houver), ou null
- x: posição horizontal em PORCENTAGEM (0-100) onde o PREÇO deveria aparecer (geralmente após o nome do item, ou onde já existe um espaço para preço)
- y: posição vertical em PORCENTAGEM (0-100) da linha do nome do item
Retorne apenas itens reais de menu (ignore textos decorativos, títulos de seção, descrições de loja).`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: `Analise esta página ${page} do cardápio e extraia todos os itens.` },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "report_menu_items",
            description: "Lista os itens de menu detectados na imagem",
            parameters: {
              type: "object",
              properties: {
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      description: { type: "string" },
                      x: { type: "number" },
                      y: { type: "number" },
                    },
                    required: ["name", "x", "y"],
                  },
                },
              },
              required: ["items"],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "report_menu_items" } },
    }),
  });

  if (!response.ok) {
    const t = await response.text();
    throw new Error(`AI gateway: ${response.status} ${t.slice(0, 200)}`);
  }

  const data = await response.json();
  const call = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!call) throw new Error("IA não retornou itens");
  const args = JSON.parse(call.function.arguments);
  return args.items as Array<{ name: string; description?: string; x: number; y: number }>;
}

async function translatePins(pins: Array<{ id: string; name: string; description: string | null }>, target: string) {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY ausente");

  const langName = target === "en" ? "English" : target === "es" ? "Spanish" : "Portuguese";

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `Traduza nomes e descrições de itens de cafeteria para ${langName}. Mantenha nomes próprios em sua forma original (ex: "Dulce de Leche", "Espresso", "Havanna").`,
        },
        { role: "user", content: JSON.stringify(pins.map((p) => ({ id: p.id, name: p.name, description: p.description }))) },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "report_translations",
            parameters: {
              type: "object",
              properties: {
                translations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      name: { type: "string" },
                      description: { type: "string" },
                    },
                    required: ["id", "name"],
                  },
                },
              },
              required: ["translations"],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "report_translations" } },
    }),
  });

  if (!response.ok) throw new Error(`Tradução falhou: ${response.status}`);
  const data = await response.json();
  const call = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!call) throw new Error("IA não retornou traduções");
  return JSON.parse(call.function.arguments).translations as Array<{ id: string; name: string; description?: string }>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método inválido" }, 405);

  try {
    const body = await req.json();
    assertAdmin(body.password);

    if (body.action === "login") return json({ ok: true });

    const db = getDb();

    if (body.action === "create") {
      assertPercent(body.x, "x");
      assertPercent(body.y, "y");
      const { data, error } = await db
        .from("menu_pins")
        .insert({ page: body.page, x: body.x, y: body.y, price: null, label: null, name: body.name ?? null })
        .select("id, page, x, y, price, label, name, description, translations")
        .single();
      if (error) throw error;
      return json(data);
    }

    if (body.action === "update") {
      const patch: PinPatch = { ...body.patch };
      if (patch.x !== undefined) assertPercent(patch.x, "x");
      if (patch.y !== undefined) assertPercent(patch.y, "y");
      const { error } = await db
        .from("menu_pins")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", body.id);
      if (error) throw error;
      return json({ ok: true });
    }

    if (body.action === "delete") {
      const { error } = await db.from("menu_pins").delete().eq("id", body.id);
      if (error) throw error;
      return json({ ok: true });
    }

    if (body.action === "delete_page") {
      const { error } = await db.from("menu_pins").delete().eq("page", body.page);
      if (error) throw error;
      return json({ ok: true });
    }

    if (body.action === "ai_detect") {
      const items = await detectMenuItems(body.imageUrl, body.page);
      // Insert all detected pins (without prices)
      const rows = items.map((it) => ({
        page: body.page,
        x: Math.max(0, Math.min(100, it.x)),
        y: Math.max(0, Math.min(100, it.y)),
        name: it.name,
        description: it.description ?? null,
        price: null,
      }));
      if (rows.length === 0) return json({ created: [] });
      const { data, error } = await db
        .from("menu_pins")
        .insert(rows)
        .select("id, page, x, y, price, label, name, description, translations");
      if (error) throw error;
      return json({ created: data });
    }

    if (body.action === "set_price") {
      const itemId = body.item_id;
      if (typeof itemId !== "string" || !itemId) throw new Error("item_id inválido");
      const price = body.price;
      if (price !== null && (typeof price !== "number" || !Number.isFinite(price) || price < 0)) {
        throw new Error("price inválido");
      }
      const { error } = await db
        .from("menu_item_prices")
        .upsert({ item_id: itemId, price, updated_at: new Date().toISOString() });
      if (error) throw error;
      return json({ ok: true });
    }

    if (body.action === "translate") {
      const target = body.target as string;
      if (!["en", "es"].includes(target)) throw new Error("Idioma inválido");
      const { data: pins, error } = await db
        .from("menu_pins")
        .select("id, name, description, translations")
        .not("name", "is", null);
      if (error) throw error;
      const toTranslate = (pins ?? []).filter(
        (p: { translations: Record<string, unknown> | null }) => !p.translations?.[target],
      );
      if (toTranslate.length === 0) return json({ translated: 0 });

      // Process in batches of 20
      let total = 0;
      for (let i = 0; i < toTranslate.length; i += 20) {
        const batch = toTranslate.slice(i, i + 20);
        const trs = await translatePins(batch as never, target);
        for (const tr of trs) {
          const orig = batch.find((p: { id: string }) => p.id === tr.id) as
            | { translations: Record<string, unknown> | null }
            | undefined;
          if (!orig) continue;
          const newTranslations = { ...(orig.translations ?? {}), [target]: { name: tr.name, description: tr.description } };
          await db.from("menu_pins").update({ translations: newTranslations }).eq("id", tr.id);
          total++;
        }
      }
      return json({ translated: total });
    }

    return json({ error: "Ação inválida" }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    const status = error instanceof Error && error.name === "UnauthorizedError" ? 401 : 400;
    return json({ error: message }, status);
  }
});
