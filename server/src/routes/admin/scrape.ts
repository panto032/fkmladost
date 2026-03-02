import type { FastifyInstance } from "fastify";
import { authenticate } from "../../auth/middleware.js";
import {
  scrapeStandings,
  scrapeMatches,
  scrapeRoundPreview,
  scrapeMatchAnalytics,
  scrapePlayers,
} from "../../scraping/scrapeFromWeb.js";
import {
  scrapeYouthLeagueStandings,
  scrapeYouthLeagueMatches,
  scrapeCadetLeagueStandings,
  scrapeCadetLeagueMatches,
} from "../../scraping/scrapeFssLeagues.js";
import {
  scrapeSuperLeagueStandings,
  scrapeSuperLeagueMatches,
} from "../../scraping/scrapeSuperLeague.js";

type ScrapeResult = Record<string, unknown>;

async function run(
  fn: () => Promise<ScrapeResult>,
  reply: { code: (n: number) => { send: (o: unknown) => unknown } }
) {
  try {
    const result = await fn();
    return { success: true, ...result };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return reply.code(500).send({ success: false, error: message });
  }
}

export async function adminScrapeRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.post("/standings", async (_req, reply) =>
    run(scrapeStandings, reply)
  );

  app.post("/matches", async (_req, reply) =>
    run(scrapeMatches, reply)
  );

  app.post("/round-preview", async (_req, reply) =>
    run(scrapeRoundPreview, reply)
  );

  app.post("/match-analytics", async (_req, reply) =>
    run(scrapeMatchAnalytics, reply)
  );

  app.post("/players", async (_req, reply) =>
    run(scrapePlayers, reply)
  );

  app.post("/youth-league/standings", async (_req, reply) =>
    run(scrapeYouthLeagueStandings, reply)
  );

  app.post("/youth-league/matches", async (_req, reply) =>
    run(scrapeYouthLeagueMatches, reply)
  );

  app.post("/cadet-league/standings", async (_req, reply) =>
    run(scrapeCadetLeagueStandings, reply)
  );

  app.post("/cadet-league/matches", async (_req, reply) =>
    run(scrapeCadetLeagueMatches, reply)
  );

  app.post("/super-league/standings", async (_req, reply) =>
    run(scrapeSuperLeagueStandings, reply)
  );

  app.post("/super-league/matches", async (_req, reply) =>
    run(scrapeSuperLeagueMatches, reply)
  );

  // Sync all at once
  app.post("/all", async (_req, reply) => {
    const results: Record<string, unknown> = {};
    const errors: Record<string, string> = {};

    const tasks: [string, () => Promise<ScrapeResult>][] = [
      ["standings", scrapeStandings],
      ["matches", scrapeMatches],
      ["roundPreview", scrapeRoundPreview],
      ["matchAnalytics", scrapeMatchAnalytics],
      ["players", scrapePlayers],
      ["youthStandings", scrapeYouthLeagueStandings],
      ["youthMatches", scrapeYouthLeagueMatches],
      ["cadetStandings", scrapeCadetLeagueStandings],
      ["cadetMatches", scrapeCadetLeagueMatches],
      ["superLeagueStandings", scrapeSuperLeagueStandings],
      ["superLeagueMatches", scrapeSuperLeagueMatches],
    ];

    for (const [name, fn] of tasks) {
      try {
        results[name] = await fn();
      } catch (err) {
        errors[name] = err instanceof Error ? err.message : String(err);
      }
    }

    return { results, errors };
  });
}
