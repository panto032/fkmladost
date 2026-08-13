import type { FastifyInstance } from "fastify";
import { authenticate } from "../../auth/middleware.js";
import { config } from "../../config.js";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import sharp from "sharp";

// Fotografije sa telefona/foto-aparata cesto stizu na 3000-4000px sirine i po
// nekoliko MB — na sajtu se nikad ne prikazuju vece od hero sekcije. PageSpeed
// je bas ovakve slike flagovao ("Improve image delivery", "Avoid enormous
// network payloads"). Zato se ovde smanjuju/kompresuju pre cuvanja; gif i svg
// se ne diraju (animacija bi pukla / vec je vektor pa je sitan).
const RESIZABLE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MAX_WIDTH = 1920;

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

    let buffer = await data.toBuffer();

    if (RESIZABLE_EXT.has(ext)) {
      try {
        const image = sharp(buffer).rotate(); // rotate() bez argumenata: primeni EXIF orijentaciju
        const resized = image.resize({ width: MAX_WIDTH, withoutEnlargement: true });
        buffer =
          ext === ".png"
            ? await resized.png({ compressionLevel: 9 }).toBuffer()
            : ext === ".webp"
              ? await resized.webp({ quality: 82 }).toBuffer()
              : await resized.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
      } catch (err) {
        // Nevalidna/oštećena slika — sacuvaj original umesto da zahtev padne.
        app.log.warn({ err, filename: data.filename }, "upload: neuspesna optimizacija slike, cuvam original");
      }
    }

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
