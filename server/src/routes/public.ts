import type { FastifyInstance } from "fastify";
import { db } from "../db.js";

export async function publicRoutes(app: FastifyInstance) {
  // Matches (last + next)
  app.get("/matches", async () => {
    const matches = await db.match.findMany({ orderBy: { type: "asc" } });
    return matches;
  });

  // Standings
  app.get("/standings", async () => {
    return db.standing.findMany({ orderBy: { position: "asc" } });
  });

  // Players
  app.get("/players", async (request) => {
    const { position } = request.query as { position?: string };
    return db.player.findMany({
      where: {
        isActive: true,
        ...(position ? { position } : {}),
      },
      orderBy: [{ position: "asc" }, { sortOrder: "asc" }],
    });
  });

  // Partners
  app.get("/partners", async () => {
    return db.partner.findMany({ orderBy: { sortOrder: "asc" } });
  });

  // Pages
  app.get("/pages/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const page = await db.page.findFirst({ where: { slug, published: true } });
    if (!page) return reply.code(404).send({ error: "Not found" });
    return page;
  });

  // Round matches (current round)
  app.get("/round-matches", async () => {
    return db.roundMatch.findMany({ orderBy: { roundNumber: "asc" } });
  });

  // Match analytics (H2H)
  app.get("/match-analytics", async (request, reply) => {
    const analytics = await db.matchAnalytics.findFirst({
      orderBy: { roundNumber: "desc" },
    });
    if (!analytics) return reply.code(404).send({ error: "No analytics found" });
    return analytics;
  });

  // Youth league
  app.get("/youth-league/standings", async () => {
    return db.youthStanding.findMany({ orderBy: { position: "asc" } });
  });

  app.get("/youth-league/matches", async () => {
    return db.youthMatch.findMany({ orderBy: { round: "asc" } });
  });

  app.get("/youth-league/scorers", async () => {
    return db.youthScorer.findMany({ orderBy: { rank: "asc" } });
  });

  // Cadet league
  app.get("/cadet-league/standings", async () => {
    return db.cadetStanding.findMany({ orderBy: { position: "asc" } });
  });

  app.get("/cadet-league/matches", async () => {
    return db.cadetMatch.findMany({ orderBy: { round: "asc" } });
  });

  app.get("/cadet-league/scorers", async () => {
    return db.cadetScorer.findMany({ orderBy: { rank: "asc" } });
  });

  // Pioneer league
  app.get("/pioneer-league/standings", async () => {
    return db.pioneerStanding.findMany({ orderBy: { position: "asc" } });
  });

  app.get("/pioneer-league/matches", async () => {
    return db.pioneerMatch.findMany({ orderBy: { round: "asc" } });
  });

  // Super league
  app.get("/super-league/standings", async () => {
    return db.superLeagueStanding.findMany({ orderBy: { position: "asc" } });
  });

  app.get("/super-league/matches", async () => {
    return db.superLeagueMatch.findMany({ orderBy: { round: "asc" } });
  });

  // Documents
  app.get("/documents", async (request) => {
    const { category } = request.query as { category?: string };
    return db.document.findMany({
      where: {
        published: true,
        ...(category ? { category } : {}),
      },
      orderBy: { sortOrder: "asc" },
    });
  });

  // Media
  app.get("/media", async (request) => {
    const { type, category } = request.query as {
      type?: "image" | "video";
      category?: string;
    };
    return db.mediaItem.findMany({
      where: {
        published: true,
        ...(type ? { type } : {}),
        ...(category ? { category } : {}),
      },
      orderBy: { sortOrder: "asc" },
    });
  });

  // Contact form
  app.post("/contact", async (request, reply) => {
    const { name, email, subject, message } = request.body as {
      name: string;
      email: string;
      subject: string;
      message: string;
    };

    if (!name || !email || !subject || !message) {
      return reply.code(400).send({ error: "All fields required" });
    }

    await db.contactMessage.create({
      data: { name, email, subject, message, isRead: false },
    });

    return { success: true };
  });
}
