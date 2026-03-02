import type { FastifyInstance } from "fastify";
import { authenticate } from "../../auth/middleware.js";
import { config } from "../../config.js";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

export async function uploadRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.post("/", async (request, reply) => {
    const data = await request.file();
    if (!data) return reply.code(400).send({ error: "No file uploaded" });

    const ext = path.extname(data.filename).toLowerCase();
    const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf", ".svg"];
    if (!allowed.includes(ext)) {
      return reply.code(400).send({ error: "File type not allowed" });
    }

    const uniqueName = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(config.uploadDir, uniqueName);

    await fs.mkdir(config.uploadDir, { recursive: true });

    const buffer = await data.toBuffer();
    await fs.writeFile(filePath, buffer);

    return {
      fileName: uniqueName,
      url: `/uploads/${uniqueName}`,
      originalName: data.filename,
      size: buffer.length,
      mimeType: data.mimetype,
    };
  });
}
