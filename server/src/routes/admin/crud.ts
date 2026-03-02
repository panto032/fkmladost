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

  app.post("/matches", async (request, reply) => {
    const body = request.body as Parameters<typeof db.match.create>[0]["data"];
    return reply.code(201).send(await db.match.create({ data: body }));
  });

  app.put("/matches/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    try {
      return await db.match.update({ where: { id: parseInt(id) }, data: body });
    } catch {
      return reply.code(404).send({ error: "Not found" });
    }
  });

  app.delete("/matches/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await db.match.delete({ where: { id: parseInt(id) } });
      return { success: true };
    } catch {
      return reply.code(404).send({ error: "Not found" });
    }
  });

  // ── STANDINGS ─────────────────────────────────────────────────────
  app.get("/standings", async () =>
    db.standing.findMany({ orderBy: { position: "asc" } })
  );

  app.post("/standings", async (request, reply) => {
    const body = request.body as Parameters<typeof db.standing.create>[0]["data"];
    return reply.code(201).send(await db.standing.create({ data: body }));
  });

  app.put("/standings/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    try {
      return await db.standing.update({ where: { id: parseInt(id) }, data: body });
    } catch {
      return reply.code(404).send({ error: "Not found" });
    }
  });

  app.delete("/standings/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await db.standing.delete({ where: { id: parseInt(id) } });
      return { success: true };
    } catch {
      return reply.code(404).send({ error: "Not found" });
    }
  });

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

  // ── DELETE ALL PLAYERS ────────────────────────────────────────────
  app.delete("/players/all", async () => {
    await db.player.deleteMany({});
    return { success: true };
  });

  // ── YOUTH LEAGUE ──────────────────────────────────────────────────
  app.post("/youth-league/standings", async (request, reply) => {
    const body = request.body as Parameters<typeof db.youthStanding.create>[0]["data"];
    return reply.code(201).send(await db.youthStanding.create({ data: body }));
  });
  app.put("/youth-league/standings/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    try { return await db.youthStanding.update({ where: { id: parseInt(id) }, data: body }); }
    catch { return reply.code(404).send({ error: "Not found" }); }
  });
  app.delete("/youth-league/standings/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try { await db.youthStanding.delete({ where: { id: parseInt(id) } }); return { success: true }; }
    catch { return reply.code(404).send({ error: "Not found" }); }
  });
  app.post("/youth-league/matches", async (request, reply) => {
    const body = request.body as Parameters<typeof db.youthMatch.create>[0]["data"];
    return reply.code(201).send(await db.youthMatch.create({ data: body }));
  });
  app.put("/youth-league/matches/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    try { return await db.youthMatch.update({ where: { id: parseInt(id) }, data: body }); }
    catch { return reply.code(404).send({ error: "Not found" }); }
  });
  app.delete("/youth-league/matches/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try { await db.youthMatch.delete({ where: { id: parseInt(id) } }); return { success: true }; }
    catch { return reply.code(404).send({ error: "Not found" }); }
  });
  app.post("/youth-league/scorers", async (request, reply) => {
    const body = request.body as Parameters<typeof db.youthScorer.create>[0]["data"];
    return reply.code(201).send(await db.youthScorer.create({ data: body }));
  });
  app.put("/youth-league/scorers/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    try { return await db.youthScorer.update({ where: { id: parseInt(id) }, data: body }); }
    catch { return reply.code(404).send({ error: "Not found" }); }
  });
  app.delete("/youth-league/scorers/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try { await db.youthScorer.delete({ where: { id: parseInt(id) } }); return { success: true }; }
    catch { return reply.code(404).send({ error: "Not found" }); }
  });

  // ── CADET LEAGUE ──────────────────────────────────────────────────
  app.post("/cadet-league/standings", async (request, reply) => {
    const body = request.body as Parameters<typeof db.cadetStanding.create>[0]["data"];
    return reply.code(201).send(await db.cadetStanding.create({ data: body }));
  });
  app.put("/cadet-league/standings/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    try { return await db.cadetStanding.update({ where: { id: parseInt(id) }, data: body }); }
    catch { return reply.code(404).send({ error: "Not found" }); }
  });
  app.delete("/cadet-league/standings/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try { await db.cadetStanding.delete({ where: { id: parseInt(id) } }); return { success: true }; }
    catch { return reply.code(404).send({ error: "Not found" }); }
  });
  app.post("/cadet-league/matches", async (request, reply) => {
    const body = request.body as Parameters<typeof db.cadetMatch.create>[0]["data"];
    return reply.code(201).send(await db.cadetMatch.create({ data: body }));
  });
  app.put("/cadet-league/matches/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    try { return await db.cadetMatch.update({ where: { id: parseInt(id) }, data: body }); }
    catch { return reply.code(404).send({ error: "Not found" }); }
  });
  app.delete("/cadet-league/matches/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try { await db.cadetMatch.delete({ where: { id: parseInt(id) } }); return { success: true }; }
    catch { return reply.code(404).send({ error: "Not found" }); }
  });
  app.post("/cadet-league/scorers", async (request, reply) => {
    const body = request.body as Parameters<typeof db.cadetScorer.create>[0]["data"];
    return reply.code(201).send(await db.cadetScorer.create({ data: body }));
  });
  app.put("/cadet-league/scorers/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    try { return await db.cadetScorer.update({ where: { id: parseInt(id) }, data: body }); }
    catch { return reply.code(404).send({ error: "Not found" }); }
  });
  app.delete("/cadet-league/scorers/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try { await db.cadetScorer.delete({ where: { id: parseInt(id) } }); return { success: true }; }
    catch { return reply.code(404).send({ error: "Not found" }); }
  });

  // ── PIONEER LEAGUE ────────────────────────────────────────────────
  app.post("/pioneer-league/standings", async (request, reply) => {
    const body = request.body as Parameters<typeof db.pioneerStanding.create>[0]["data"];
    return reply.code(201).send(await db.pioneerStanding.create({ data: body }));
  });
  app.put("/pioneer-league/standings/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    try { return await db.pioneerStanding.update({ where: { id: parseInt(id) }, data: body }); }
    catch { return reply.code(404).send({ error: "Not found" }); }
  });
  app.delete("/pioneer-league/standings/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try { await db.pioneerStanding.delete({ where: { id: parseInt(id) } }); return { success: true }; }
    catch { return reply.code(404).send({ error: "Not found" }); }
  });
  app.post("/pioneer-league/matches", async (request, reply) => {
    const body = request.body as Parameters<typeof db.pioneerMatch.create>[0]["data"];
    return reply.code(201).send(await db.pioneerMatch.create({ data: body }));
  });
  app.put("/pioneer-league/matches/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    try { return await db.pioneerMatch.update({ where: { id: parseInt(id) }, data: body }); }
    catch { return reply.code(404).send({ error: "Not found" }); }
  });
  app.delete("/pioneer-league/matches/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try { await db.pioneerMatch.delete({ where: { id: parseInt(id) } }); return { success: true }; }
    catch { return reply.code(404).send({ error: "Not found" }); }
  });

  // ── SUPER LEAGUE ──────────────────────────────────────────────────
  app.post("/super-league/standings", async (request, reply) => {
    const body = request.body as Parameters<typeof db.superLeagueStanding.create>[0]["data"];
    return reply.code(201).send(await db.superLeagueStanding.create({ data: body }));
  });
  app.put("/super-league/standings/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    try { return await db.superLeagueStanding.update({ where: { id: parseInt(id) }, data: body }); }
    catch { return reply.code(404).send({ error: "Not found" }); }
  });
  app.delete("/super-league/standings/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try { await db.superLeagueStanding.delete({ where: { id: parseInt(id) } }); return { success: true }; }
    catch { return reply.code(404).send({ error: "Not found" }); }
  });
  app.post("/super-league/matches", async (request, reply) => {
    const body = request.body as Parameters<typeof db.superLeagueMatch.create>[0]["data"];
    return reply.code(201).send(await db.superLeagueMatch.create({ data: body }));
  });
  app.put("/super-league/matches/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    try { return await db.superLeagueMatch.update({ where: { id: parseInt(id) }, data: body }); }
    catch { return reply.code(404).send({ error: "Not found" }); }
  });
  app.delete("/super-league/matches/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try { await db.superLeagueMatch.delete({ where: { id: parseInt(id) } }); return { success: true }; }
    catch { return reply.code(404).send({ error: "Not found" }); }
  });

  // ── USERS (admin only) ────────────────────────────────────────────
  app.get("/users", async () =>
    db.user.findMany({
      select: { id: true, username: true, name: true, email: true, role: true, createdAt: true },
    })
  );
}
