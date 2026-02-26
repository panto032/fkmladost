"use node";

import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { ConvexError } from "convex/values";
import * as cheerio from "cheerio";

const STANDINGS_URL = "https://www.superliga.rs/sezona/tabela-takmicenja/";
const SCHEDULE_URL = "https://www.superliga.rs/sezona/raspored-i-rezultati/";

/** Fetch HTML with bot-friendly headers */
async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; FKMladostBot/1.0; +https://fkmladost.rs)",
      Accept: "text/html",
    },
  });
  if (!res.ok) {
    throw new ConvexError({
      code: "EXTERNAL_SERVICE_ERROR",
      message: `Greška pri učitavanju ${url}: ${res.status}`,
    });
  }
  return res.text();
}

/* ================================================================== */
/*  1) Standings scraper                                               */
/* ================================================================== */

/**
 * Scrapes the Super Liga standings from superliga.rs/sezona/tabela-takmicenja/
 * and saves to the superLeagueStandings table.
 */
export const scrapeSuperLeagueStandings = action({
  args: {},
  handler: async (ctx): Promise<{ count: number }> => {
    const html = await fetchPage(STANDINGS_URL);
    const $ = cheerio.load(html);
    const rows = $("table.preliminarno tbody tr");

    if (rows.length === 0) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message:
          "Tabela nije pronađena na superliga.rs. Moguće da je struktura sajta promenjena.",
      });
    }

    const standings: Array<{
      position: number;
      club: string;
      played: number;
      won: number;
      drawn: number;
      lost: number;
      goalsFor: number;
      goalsAgainst: number;
      goalDiff: number;
      points: number;
      isHighlighted: boolean;
    }> = [];

    rows.each((_, row) => {
      const cells = $(row).find("td");
      if (cells.length < 12) return;

      const position = parseInt($(cells[0]).text().trim(), 10);
      const club = $(cells[3]).text().trim();
      const played = parseInt($(cells[4]).text().trim(), 10) || 0;
      const won = parseInt($(cells[5]).text().trim(), 10) || 0;
      const drawn = parseInt($(cells[6]).text().trim(), 10) || 0;
      const lost = parseInt($(cells[7]).text().trim(), 10) || 0;
      const goalsFor = parseInt($(cells[8]).text().trim(), 10) || 0;
      const goalsAgainst = parseInt($(cells[9]).text().trim(), 10) || 0;
      const goalDiff = parseInt($(cells[10]).text().trim(), 10) || 0;
      const points = parseInt($(cells[11]).text().trim(), 10) || 0;
      const isHighlighted = club.toLowerCase().includes("mladost");

      if (club && !isNaN(position)) {
        standings.push({
          position,
          club,
          played,
          won,
          drawn,
          lost,
          goalsFor,
          goalsAgainst,
          goalDiff,
          points,
          isHighlighted,
        });
      }
    });

    if (standings.length === 0) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Nisu pronađeni podaci u tabeli na superliga.rs",
      });
    }

    await ctx.runMutation(
      internal.sync.saveSuperLeagueData.saveStandings,
      { standings },
    );
    return { count: standings.length };
  },
});

/* ================================================================== */
/*  2) Matches scraper                                                 */
/* ================================================================== */

/** City fallback by home team when venue text can't be parsed */
const CITY_MAP: Record<string, string> = {
  MLADOST: "Lučani",
  "CRVENA ZVEZDA": "Beograd",
  PARTIZAN: "Beograd",
  VOJVODINA: "Novi Sad",
  "ČUKARIČKI": "Pančevo",
  "OFK BEOGRAD": "Stara Pazova",
  TSC: "Bačka Topola",
  "RADNIČKI 1923": "Kragujevac",
  "RADNIČKI NIŠ": "Niš",
  "NOVI PAZAR": "Novi Pazar",
  "ŽELEZNIČAR": "Pančevo",
  NAPREDAK: "Kruševac",
  SPARTAK: "Subotica",
  "SPARTAK ŽK": "Subotica",
  RADNIK: "Surdulica",
  IMT: "Beograd",
  "JAVOR MATIS": "Ivanjica",
};

/** Extract city from venue string, fallback to CITY_MAP */
function extractCity(venue: string, homeTeam: string): string {
  if (venue) {
    const parts = venue.split(",");
    if (parts.length > 1) return parts[parts.length - 1].trim();
  }
  const upper = homeTeam.toUpperCase().trim();
  if (CITY_MAP[upper]) return CITY_MAP[upper];
  for (const [key, val] of Object.entries(CITY_MAP)) {
    if (upper.includes(key) || key.includes(upper)) return val;
  }
  return "";
}

/**
 * Scrapes all Mladost matches from superliga.rs/sezona/raspored-i-rezultati/
 * and saves to the superLeagueMatches table.
 *
 * HTML structure: each round is a div.tab-pane#kolo-{n} containing
 * .widget-single-match blocks with .match-participants holding
 * .match-date, .match-home, .match-result, .match-away, .match-venue.
 */
export const scrapeSuperLeagueMatches = action({
  args: {},
  handler: async (ctx): Promise<{ count: number }> => {
    const html = await fetchPage(SCHEDULE_URL);
    const $ = cheerio.load(html);

    const matches: Array<{
      round: number;
      date: string;
      home: string;
      away: string;
      score?: string;
      city?: string;
      isHome: boolean;
    }> = [];

    // Each round is a tab-pane with id "kolo-{n}"
    $("div.tab-pane").each((_, pane) => {
      const paneId = $(pane).attr("id") ?? "";
      const roundMatch = paneId.match(/kolo-(\d+)/);
      if (!roundMatch) return;
      const round = parseInt(roundMatch[1], 10);

      $(pane).find(".widget-single-match").each((_, matchEl) => {
        const participants = $(matchEl).find(".match-participants");

        const homeRaw = participants.find(".match-home").text().trim();
        const awayRaw = participants.find(".match-away").text().trim();

        // Only keep Mladost matches
        const homeLower = homeRaw.toLowerCase();
        const awayLower = awayRaw.toLowerCase();
        if (!homeLower.includes("mladost") && !awayLower.includes("mladost")) {
          return;
        }

        // Date (first .match-date inside .match-participants)
        const date = participants.find(".match-date").first().text().trim();

        // Score — only valid if "N:N" pattern
        const scoreText = participants.find(".match-result").text().trim();
        const score =
          scoreText && /^\d+:\d+$/.test(scoreText) ? scoreText : undefined;

        // Venue → city
        const venue = participants.find(".match-venue").text().trim();
        const city = extractCity(venue, homeRaw) || undefined;

        const isHome = homeLower.includes("mladost");

        matches.push({ round, date, home: homeRaw, away: awayRaw, score, city, isHome });
      });
    });

    // Sort by round ascending
    matches.sort((a, b) => a.round - b.round);

    if (matches.length === 0) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message:
          "Nisu pronađene utakmice Mladosti u rasporedu na superliga.rs",
      });
    }

    await ctx.runMutation(
      internal.sync.saveSuperLeagueData.saveMatches,
      { matches },
    );
    return { count: matches.length };
  },
});
