import type { FastifyInstance } from "fastify";
import { db } from "../db.js";

export async function newsRoutes(app: FastifyInstance) {
  app.get("/", async (request) => {
    const { category, limit, offset } = request.query as {
      category?: string;
      limit?: string;
      offset?: string;
    };

    const where = {
      published: true,
      ...(category ? { category } : {}),
    };

    const [items, total] = await Promise.all([
      db.news.findMany({
        where,
        orderBy: { sortDate: "desc" },
        take: limit ? parseInt(limit) : 20,
        skip: offset ? parseInt(offset) : 0,
        select: {
          id: true,
          title: true,
          excerpt: true,
          category: true,
          date: true,
          imageUrl: true,
          imageFileName: true,
        },
      }),
      db.news.count({ where }),
    ]);

    return { items, total };
  });

  app.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const news = await db.news.findFirst({
      where: { id: parseInt(id), published: true },
    });
    if (!news) return reply.code(404).send({ error: "Not found" });
    return news;
  });
}
