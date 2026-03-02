import type { FastifyInstance } from "fastify";
import { db } from "../../db.js";
import { authenticate } from "../../auth/middleware.js";

/**
 * Admin CRUD routes for all simple entities
 */
export async function adminCrudRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  // ── MATCHES ──────────────────────────────────────────────────────
  app.get("/matches", async () => db.match.findMany({ orderBy: { type: "asc" } }));

  app.put("/matches/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    try {
      return await db.match.update({ where: { id: parseInt(id) }, data: body });
    } catch {
      return reply.code(404).send({ error: "Not found" });
    }
  });

  // ── STANDINGS ─────────────────────────────────────────────────────
  app.get("/standings", async () =>
    db.standing.findMany({ orderBy: { position: "asc" } })
  );

  // ── PLAYERS ───────────────────────────────────────────────────────
  app.get("/players", async () =>
    db.player.findMany({ orderBy: [{ position: "asc" }, { sortOrder: "asc" }] })
  );

  app.post("/players", async (request, reply) => {
    const body = request.body as Record<string, unknown>;
    const player = await db.player.create({ data: body as Parameters<typeof db.player.create>[0]["data"] });
    return reply.code(201).send(player);
  });

  app.put("/players/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    try {
      return await db.player.update({ where: { id: parseInt(id) }, data: body });
    } catch {
      return reply.code(404).send({ error: "Not found" });
    }
  });

  app.delete("/players/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await db.player.delete({ where: { id: parseInt(id) } });
      return { success: true };
    } catch {
      return reply.code(404).send({ error: "Not found" });
    }
  });

  // ── PARTNERS ──────────────────────────────────────────────────────
  app.get("/partners", async () =>
    db.partner.findMany({ orderBy: { sortOrder: "asc" } })
  );

  app.post("/partners", async (request, reply) => {
    const body = request.body as Parameters<typeof db.partner.create>[0]["data"];
    return reply.code(201).send(await db.partner.create({ data: body }));
  });

  app.put("/partners/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    try {
      return await db.partner.update({ where: { id: parseInt(id) }, data: body });
    } catch {
      return reply.code(404).send({ error: "Not found" });
    }
  });

  app.delete("/partners/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await db.partner.delete({ where: { id: parseInt(id) } });
      return { success: true };
    } catch {
      return reply.code(404).send({ error: "Not found" });
    }
  });

  // ── PAGES ─────────────────────────────────────────────────────────
  app.get("/pages", async () => db.page.findMany({ orderBy: { slug: "asc" } }));

  app.post("/pages", async (request, reply) => {
    const body = request.body as Parameters<typeof db.page.create>[0]["data"];
    return reply.code(201).send(await db.page.create({ data: body }));
  });

  app.put("/pages/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    try {
      return await db.page.update({ where: { id: parseInt(id) }, data: body });
    } catch {
      return reply.code(404).send({ error: "Not found" });
    }
  });

  app.delete("/pages/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await db.page.delete({ where: { id: parseInt(id) } });
      return { success: true };
    } catch {
      return reply.code(404).send({ error: "Not found" });
    }
  });

  // ── DOCUMENTS ─────────────────────────────────────────────────────
  app.get("/documents", async () =>
    db.document.findMany({ orderBy: { sortOrder: "asc" } })
  );

  app.post("/documents", async (request, reply) => {
    const body = request.body as Parameters<typeof db.document.create>[0]["data"];
    return reply.code(201).send(await db.document.create({ data: body }));
  });

  app.put("/documents/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    try {
      return await db.document.update({ where: { id: parseInt(id) }, data: body });
    } catch {
      return reply.code(404).send({ error: "Not found" });
    }
  });

  app.delete("/documents/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await db.document.delete({ where: { id: parseInt(id) } });
      return { success: true };
    } catch {
      return reply.code(404).send({ error: "Not found" });
    }
  });

  // ── MEDIA ─────────────────────────────────────────────────────────
  app.get("/media", async () =>
    db.mediaItem.findMany({ orderBy: { sortOrder: "asc" } })
  );

  app.post("/media", async (request, reply) => {
    const body = request.body as Parameters<typeof db.mediaItem.create>[0]["data"];
    return reply.code(201).send(await db.mediaItem.create({ data: body }));
  });

  app.put("/media/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    try {
      return await db.mediaItem.update({ where: { id: parseInt(id) }, data: body });
    } catch {
      return reply.code(404).send({ error: "Not found" });
    }
  });

  app.delete("/media/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await db.mediaItem.delete({ where: { id: parseInt(id) } });
      return { success: true };
    } catch {
      return reply.code(404).send({ error: "Not found" });
    }
  });

  // ── CONTACT MESSAGES ──────────────────────────────────────────────
  app.get("/contact-messages", async () =>
    db.contactMessage.findMany({ orderBy: { createdAt: "desc" } })
  );

  app.put("/contact-messages/:id/read", async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      return await db.contactMessage.update({
        where: { id: parseInt(id) },
        data: { isRead: true },
      });
    } catch {
      return reply.code(404).send({ error: "Not found" });
    }
  });

  app.delete("/contact-messages/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await db.contactMessage.delete({ where: { id: parseInt(id) } });
      return { success: true };
    } catch {
      return reply.code(404).send({ error: "Not found" });
    }
  });

  // ── USERS (admin only) ────────────────────────────────────────────
  app.get("/users", async () =>
    db.user.findMany({
      select: { id: true, username: true, name: true, email: true, role: true, createdAt: true },
    })
  );
}
