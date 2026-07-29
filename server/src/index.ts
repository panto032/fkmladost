import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import staticFiles from "@fastify/static";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

import { config } from "./config.js";
import { verifyLicense, getLicenseState } from "./license.js";
import { authRoutes } from "./routes/auth.js";
import { newsRoutes } from "./routes/news.js";
import { publicRoutes } from "./routes/public.js";
import { adminNewsRoutes } from "./routes/admin/news.js";
import { adminCrudRoutes } from "./routes/admin/crud.js";
import { adminScrapeRoutes } from "./routes/admin/scrape.js";
import { uploadRoutes } from "./routes/admin/upload.js";
import { registerSeoRoutes, registerHtmlSeo } from "./seo/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = Fastify({
  logger: {
    level: config.nodeEnv === "development" ? "info" : "warn",
    transport:
      config.nodeEnv === "development"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
  },
});

// ── Plugins ───────────────────────────────────────────────────────────
await app.register(cors, {
  origin: [config.frontendUrl, "http://localhost:5173"],
  credentials: true,
});

await app.register(multipart, {
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Ensure uploads directory exists
await fs.mkdir(config.uploadDir, { recursive: true });

await app.register(staticFiles, {
  root: config.uploadDir,
  prefix: "/uploads/",
});

// ── License ──────────────────────────────────────────────────────────
await verifyLicense();

// ── Routes ────────────────────────────────────────────────────────────
await app.register(authRoutes, { prefix: "/api/auth" });
await app.register(newsRoutes, { prefix: "/api/news" });
await app.register(publicRoutes, { prefix: "/api" });

// License status endpoint (for frontend)
app.get("/api/license/status", async () => getLicenseState());

// Re-verify license on demand (e.g. after activation)
app.post("/api/license/recheck", async () => {
  await verifyLicense();
  return getLicenseState();
});

// Admin routes (license-gated)
import { requireLicense } from "./auth/middleware.js";
await app.register(async (adminScope) => {
  adminScope.addHook("preHandler", requireLicense);
  await adminScope.register(adminNewsRoutes, { prefix: "/api/admin/news" });
  await adminScope.register(adminCrudRoutes, { prefix: "/api/admin" });
  await adminScope.register(adminScrapeRoutes, { prefix: "/api/admin/scrape" });
  await adminScope.register(uploadRoutes, { prefix: "/api/admin/upload" });
});

// Health check
app.get("/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));

// ── SEO ───────────────────────────────────────────────────────────────
// robots.txt i sitemap.xml se serviraju uvek; sitemap cita vesti iz baze.
await registerSeoRoutes(app);

// ── Serve frontend (production) ──────────────────────────────────────
const clientDistPath = path.resolve(__dirname, "../../dist");

if (config.nodeEnv === "production") {
  // Mora pre staticFiles: hook presrece zahteve za HTML dokumente i ubacuje
  // meta tagove za trazenu rutu umesto da servira sirov index.html.
  await registerHtmlSeo(app, clientDistPath);

  await app.register(staticFiles, {
    root: clientDistPath,
    prefix: "/",
    decorateReply: false,
    wildcard: false,
  });

  // SPA fallback — serve index.html for all non-API, non-upload routes
  app.setNotFoundHandler(async (req, reply) => {
    if (req.url.startsWith("/api/") || req.url.startsWith("/uploads/")) {
      return reply.code(404).send({ error: "Not found" });
    }
    return reply.sendFile("index.html", clientDistPath);
  });
}

// ── Start ─────────────────────────────────────────────────────────────
try {
  await app.listen({ port: config.port, host: config.host });
  console.log(`Server running on http://${config.host}:${config.port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
