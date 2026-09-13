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

/** Ako se ne moze optimizovati (nevalidna/osteceena slika), vraca originalni buffer. */
async function optimizeImageBuffer(
  buffer: Buffer,
  ext: string,
  onError: (err: unknown) => void,
): Promise<Buffer> {
  if (!RESIZABLE_EXT.has(ext)) return buffer;
  try {
    const image = sharp(buffer).rotate(); // rotate() bez argumenata: primeni EXIF orijentaciju
    const resized = image.resize({ width: MAX_WIDTH, withoutEnlargement: true });
    return ext === ".png"
      ? await resized.png({ compressionLevel: 9 }).toBuffer()
      : ext === ".webp"
        ? await resized.webp({ quality: 82 }).toBuffer()
        : await resized.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  } catch (err) {
    onError(err);
    return buffer;
  }
}

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

    const original = await data.toBuffer();
    const buffer = await optimizeImageBuffer(original, ext, (err) =>
      app.log.warn({ err, filename: data.filename }, "upload: neuspesna optimizacija slike, cuvam original"),
    );

    await fs.writeFile(filePath, buffer);

    return {
      fileName: uniqueName,
      url: `/uploads/${uniqueName}`,
      originalName: data.filename,
      size: buffer.length,
      mimeType: data.mimetype,
    };
  });

  // Sharp pipeline iznad vazi samo za NOVE upload-e. Slike sacuvane pre nego
  // sto je ovaj kod dodat (ili uploadovane u medjuvremenu greskom procesa)
  // ostaju velike — SEO brief ih ponovo flaguje iz kola u kolo ("Improve
  // image delivery", "Avoid enormous network payloads" za konkretne
  // /uploads/*.png i *.jpeg fajlove). Ova ruta prodje kroz sve postojece
  // fajlove i preskoci ih kroz isti pipeline, preskacuci one koje su vec
  // dovoljno male da ne vredi trositi CPU na njih.
  const ALREADY_SMALL_BYTES = 300 * 1024;

  app.post("/reoptimize", async (_request, reply) => {
    let files: string[];
    try {
      files = await fs.readdir(config.uploadDir);
    } catch (err) {
      return reply.code(500).send({ error: "Ne mogu da pročitam uploads direktorijum", details: String(err) });
    }

    const results: { fileName: string; before: number; after: number }[] = [];
    let skipped = 0;
    let failed = 0;

    for (const fileName of files) {
      const ext = path.extname(fileName).toLowerCase();
      if (!RESIZABLE_EXT.has(ext)) continue;

      const filePath = path.join(config.uploadDir, fileName);
      try {
        const before = await fs.readFile(filePath);
        if (before.length <= ALREADY_SMALL_BYTES) {
          skipped++;
          continue;
        }

        let hadError = false;
        const after = await optimizeImageBuffer(before, ext, () => {
          hadError = true;
        });
        if (hadError) {
          failed++;
          continue;
        }

        // Ne prepisuj ako "optimizacija" nije stvarno smanjila fajl (npr.
        // slika je vec bila kompresovana na sirini manjoj od MAX_WIDTH).
        if (after.length < before.length) {
          await fs.writeFile(filePath, after);
          results.push({ fileName, before: before.length, after: after.length });
        } else {
          skipped++;
        }
      } catch (err) {
        failed++;
        app.log.warn({ err, fileName }, "reoptimize: greška pri obradi fajla");
      }
    }

    const savedBytes = results.reduce((sum, r) => sum + (r.before - r.after), 0);
    return { optimized: results.length, skipped, failed, savedBytes, files: results };
  });
}
