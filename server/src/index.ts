import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import staticFiles from "@fastify/static";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

import { config } from "./config.js";
import { authRoutes } from "./routes/auth.js";
import { newsRoutes } from "./routes/news.js";
import { publicRoutes } from "./routes/public.js";
import { adminNewsRoutes } from "./routes/admin/news.js";
import { adminCrudRoutes } from "./routes/admin/crud.js";
import { adminScrapeRoutes } from "./routes/admin/scrape.js";
import { uploadRoutes } from "./routes/admin/upload.js";

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

// ── Routes ────────────────────────────────────────────────────────────
await app.register(authRoutes, { prefix: "/api/auth" });
await app.register(newsRoutes, { prefix: "/api/news" });
await app.register(publicRoutes, { prefix: "/api" });

// Admin routes
await app.register(adminNewsRoutes, { prefix: "/api/admin/news" });
await app.register(adminCrudRoutes, { prefix: "/api/admin" });
await app.register(adminScrapeRoutes, { prefix: "/api/admin/scrape" });
await app.register(uploadRoutes, { prefix: "/api/admin/upload" });

// Health check
app.get("/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));

// ── Start ─────────────────────────────────────────────────────────────
try {
  await app.listen({ port: config.port, host: config.host });
  console.log(`Server running on http://${config.host}:${config.port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
