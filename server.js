import { createServer } from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const port = Number(process.env.PORT || 3000);
const staticDir = resolve(root, "dist/client");
const serverEntries = [
  resolve(root, "dist/server/server.js"),
  resolve(root, ".output/server/index.mjs"),
];

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

let handlerPromise;

async function getHandler() {
  if (!handlerPromise) {
    const entry = serverEntries.find((file) => existsSync(file));
    if (!entry) {
      throw new Error(`Nenhum bundle SSR encontrado. Esperado: ${serverEntries.join(" ou ")}`);
    }

    handlerPromise = import(pathToFileURL(entry).href).then((module) => module.default ?? module);
  }

  return handlerPromise;
}

function sendStaticFile(req, res) {
  if (!req.url || !existsSync(staticDir)) return false;

  const pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
  const safePath = normalize(pathname).replace(/^([/\\])+/, "");
  const filePath = resolve(staticDir, safePath || "index.html");

  if (!filePath.startsWith(staticDir) || !existsSync(filePath)) return false;

  res.writeHead(200, {
    "content-type": mimeTypes[extname(filePath)] || "application/octet-stream",
    "cache-control": filePath.includes(`${join("", "assets")}/`) ? "public, max-age=31536000, immutable" : "public, max-age=60",
  });
  createReadStream(filePath).pipe(res);
  return true;
}

async function sendWebResponse(res, webResponse) {
  res.writeHead(webResponse.status, Object.fromEntries(webResponse.headers));
  if (!webResponse.body) return res.end();

  const reader = webResponse.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(Buffer.from(value));
  }
  res.end();
}

createServer(async (req, res) => {
  try {
    if (req.method === "GET" || req.method === "HEAD") {
      if (sendStaticFile(req, res)) return;
    }

    const handler = await getHandler();
    const origin = `http://${req.headers.host || `127.0.0.1:${port}`}`;
    const request = new Request(new URL(req.url || "/", origin), {
      method: req.method,
      headers: req.headers,
      body: req.method === "GET" || req.method === "HEAD" ? undefined : req,
      duplex: "half",
    });

    await sendWebResponse(res, await handler.fetch(request, process.env, {}));
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    res.end(error instanceof Error ? error.message : "Erro ao iniciar o servidor");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Cardapio server listening on http://127.0.0.1:${port}`);
});