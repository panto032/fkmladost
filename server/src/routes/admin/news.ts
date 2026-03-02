import type { FastifyInstance } from "fastify";
import { db } from "../../db.js";
import { authenticate } from "../../auth/middleware.js";
import path from "path";
import fs from "fs/promises";
import { config } from "../../config.js";

export async function adminNewsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  // List all news (including unpublished)
  app.get("/", async (request) => {
    const { category, limit, offset } = request.query as {
      category?: string;
      limit?: string;
      offset?: string;
    };

    const where = category ? { category } : {};
    const [items, total] = await Promise.all([
      db.news.findMany({
        where,
        orderBy: { sortDate: "desc" },
        take: limit ? parseInt(limit) : 50,
        skip: offset ? parseInt(offset) : 0,
      }),
      db.news.count({ where }),
    ]);

    return { items, total };
  });

  app.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const news = await db.news.findUnique({ where: { id: parseInt(id) } });
    if (!news) return reply.code(404).send({ error: "Not found" });
    return news;
  });

  app.post("/", async (request, reply) => {
    const body = request.body as {
      title: string;
      excerpt: string;
      content: string;
      category: string;
      date: string;
      sortDate: string;
      imageUrl: string;
      published: boolean;
    };

    const news = await db.news.create({ data: body });
    return reply.code(201).send(news);
  });

  app.put("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Partial<{
      title: string;
      excerpt: string;
      content: string;
      category: string;
      date: string;
      sortDate: string;
      imageUrl: string;
      published: boolean;
    }>;

    try {
      const news = await db.news.update({
        where: { id: parseInt(id) },
        data: body,
      });
      return news;
    } catch {
      return reply.code(404).send({ error: "Not found" });
    }
  });

  app.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const news = await db.news.findUnique({ where: { id: parseInt(id) } });
      if (news?.imageFileName) {
        const filePath = path.join(config.uploadDir, news.imageFileName);
        await fs.unlink(filePath).catch(() => {});
      }
      await db.news.delete({ where: { id: parseInt(id) } });
      return { success: true };
    } catch {
      return reply.code(404).send({ error: "Not found" });
    }
  });
}
