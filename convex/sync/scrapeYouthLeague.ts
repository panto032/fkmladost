"use node";

import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { ConvexError } from "convex/values";
import * as cheerio from "cheerio";

/**
 * fss.rs Omladinska Liga scraper
 * Uses ?script=lat for Latin characters
 */
const BASE_URL =
  "https://fss.rs/takmicenje/omladinska-liga-srbije-25-26/?script=lat";

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
/*  Helpers                                                            */
/* ================================================================== */

/** Normalize team name from UPPERCASE to title case for display */
function normalizeName(raw: string): string {
  const trimmed = raw.trim();
  // Some special cases for known club names
  const KNOWN: Record<string, string> = {
    MLADOST: "Mladost L",
    "CRVENA ZVEZDA": "Crvena Zvezda",
    PARTIZAN: "Partizan",
    VOJVODINA: "Vojvodina",
    "ČUKARIČKI DOO": "Čukarički",
    "ČUKARICKI DOO": "Čukarički",
    ČUKARIČKI: "Čukarički",
    "OFK BEOGRAD": "OFK Beograd",
    TSC: "TSC",
    "SPARTAK ZV": "Spartak ZV",
    SPARTAK: "Spartak ZV",
    "SPARTAK ŽDREPČEVA KRV": "Spartak ZV",
    IMT: "IMT",
    "IMT NOVI BEOGRAD": "IMT Novi Beograd",
    NAPREDAK: "Napredak",
    "NAPREDAK KRUŠEVAC": "Napredak Kruševac",
    VOŽDOVAC: "Voždovac",
    "OFK VRŠAC": "OFK Vršac",
    "NOVI PAZAR": "Novi Pazar",
    "UŠĆE NOVI BEOGRAD": "Ušće Novi Beograd",
    "BORAC 1926": "Borac 1926",
    "RFK GRAFIČAR": "Grafičar Bg",
    GRAFIČAR: "Grafičar Bg",
    "RFK GRAFIČAR BEOGRAD": "Grafičar Bg",
  };
  const upper = trimmed.toUpperCase();
  if (KNOWN[upper]) return KNOWN[upper];
  // Fallback: title case
  return trimmed
    .toLowerCase()
    .replace(/(^|\s)\S/g, (c) => c.toUpperCase());
}

/** Check if a team name refers to Mladost */
function isMladost(name: string): boolean {
  return name.toUpperCase().includes("MLADOST");
}

/** Parse date from "01.03.2026. 11:00" → "01.03.2026" */
function parseDate(raw: string): string {
  const match = raw.trim().match(/(\d{2}\.\d{2}\.\d{4})/);
  return match ? match[1] : raw.trim();
}

/** City fallback by home team */
const CITY_MAP: Record<string, string> = {
  MLADOST: "Lučani",
  "CRVENA ZVEZDA": "Beograd",
  PARTIZAN: "Beograd",
  VOJVODINA: "Novi Sad",
  ČUKARIČKI: "Beograd",
  "ČUKARIČKI DOO": "Beograd",
  "OFK BEOGRAD": "Beograd",
  TSC: "Bačka Topola",
  SPARTAK: "Subotica",
  "SPARTAK ZV": "Subotica",
  IMT: "Novi Beograd",
  "IMT NOVI BEOGRAD": "Novi Beograd",
  NAPREDAK: "Kruševac",
  VOŽDOVAC: "Beograd",
  "OFK VRŠAC": "Vršac",
  "NOVI PAZAR": "Novi Pazar",
  "UŠĆE NOVI BEOGRAD": "Novi Beograd",
  "BORAC 1926": "Čačak",
  GRAFIČAR: "Beograd",
  "RFK GRAFIČAR": "Beograd",
};

function resolveCity(scraped: string, homeTeamRaw: string): string {
  if (scraped && scraped !== "/") return scraped;
  const upper = homeTeamRaw.toUpperCase().trim();
  if (CITY_MAP[upper]) return CITY_MAP[upper];
  for (const [key, val] of Object.entries(CITY_MAP)) {
    if (upper.includes(key) || key.includes(upper)) return val;
  }
  return "";
}

/* ================================================================== */
/*  1) Standings scraper                                               */
/* ================================================================== */

type StandingRow = {
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
};

export const scrapeYouthLeagueStandings = action({
  args: {},
  handler: async (ctx): Promise<{ count: number }> => {
    const html = await fetchPage(BASE_URL);
    const $ = cheerio.load(html);

    // The standings table is inside #fss-tabela
    const tabelaTab = $("#fss-tabela");
    const table = tabelaTab.find("table").first();
    const rows = table.find("tbody tr");

    if (rows.length === 0) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message:
          "Tabela nije pronađena na fss.rs. Moguće da je struktura sajta promenjena.",
      });
    }

    const standings: StandingRow[] = [];

    rows.each((_, row) => {
      const cells = $(row).find("td");
      if (cells.length < 5) return;

      // FSS table columns: #, (Grb), Ime, U, P, N, I, G+, G-, +/-, Bod
      // Sometimes has different number of columns, so we parse by known order
      const texts = cells.map((__, cell) => $(cell).text().trim()).get();

      // First cell is position number
      const position = parseInt(texts[0], 10);
      if (isNaN(position)) return;

      // Find the club name cell — skip any image-only cells
      // Typically: [0]=pos, [1]=crest(img), [2]=name, [3]=played, [4]=won, [5]=drawn, [6]=lost, [7]=gf, [8]=ga, [9]=gd, [10]=points
      // OR:         [0]=pos, [1]=name, [2]=played, [3]=won, [4]=drawn, [5]=lost, [6]=gf, [7]=ga, [8]=gd, [9]=points
      // Detect: if cell[1] is a number (played), then name is missing a separate cell
      let nameIdx = 1;
      let statsStartIdx = 2;

      // Check if cell 1 has an image (crest) — if so, name is cell 2
      const cell1HasImg = $(cells[1]).find("img").length > 0;
      if (cell1HasImg) {
        nameIdx = 2;
        statsStartIdx = 3;
      } else {
        // Check if cell 1 is a number (then it's a stats cell, name is embedded)
        const maybeNum = parseInt(texts[1], 10);
        if (!isNaN(maybeNum) && texts.length <= 10) {
          // Name might be part of position cell, unusual — skip
          return;
        }
      }

      const club = texts[nameIdx] || "";
      if (!club) return;

      const played = parseInt(texts[statsStartIdx], 10) || 0;
      const won = parseInt(texts[statsStartIdx + 1], 10) || 0;
      const drawn = parseInt(texts[statsStartIdx + 2], 10) || 0;
      const lost = parseInt(texts[statsStartIdx + 3], 10) || 0;
      const goalsFor = parseInt(texts[statsStartIdx + 4], 10) || 0;
      const goalsAgainst = parseInt(texts[statsStartIdx + 5], 10) || 0;

      // Goal diff might be displayed as "+19" or "-2" or "0"
      const gdRaw = texts[statsStartIdx + 6] || "0";
      const goalDiff = parseInt(gdRaw.replace("+", ""), 10) || 0;

      const points = parseInt(texts[statsStartIdx + 7], 10) || 0;

      const normalizedClub = normalizeName(club);
      const isHighlighted = isMladost(club);

      standings.push({
        position,
        club: normalizedClub,
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
    });

    if (standings.length === 0) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Nisu pronađeni podaci u tabeli na fss.rs",
      });
    }

    await ctx.runMutation(
      internal.sync.saveYouthLeagueData.saveStandings,
      { standings },
    );
    return { count: standings.length };
  },
});

/* ================================================================== */
/*  2) Matches scraper                                                 */
/* ================================================================== */

type MatchRow = {
  round: number;
  date: string;
  home: string;
  away: string;
  score?: string;
  city?: string;
  isHome: boolean;
};

/**
 * Scrapes all rounds from fss.rs Omladinska Liga page.
 * Filters only Mladost matches and saves to youthMatches table.
 *
 * HTML structure:
 * - #accordion_current: current/upcoming rounds
 * - #accordion: past rounds
 * Each round is a .card with .fss-rezultati__title containing "19. kolo"
 * Each match is a .fss-rezultati__one with date, city, teams, result divs
 */
export const scrapeYouthLeagueMatches = action({
  args: {},
  handler: async (ctx): Promise<{ count: number }> => {
    const html = await fetchPage(BASE_URL);
    const $ = cheerio.load(html);

    const matches: MatchRow[] = [];

    // Process both accordions (current + past rounds)
    const accordions = $("#accordion_current, #accordion");

    accordions.find(".card").each((_, card) => {
      // Extract round number from title like "19. kolo"
      const titleText = $(card).find(".fss-rezultati__title").text().trim();
      const roundMatch = titleText.match(/(\d+)\.\s*kolo/i);
      if (!roundMatch) return;
      const round = parseInt(roundMatch[1], 10);

      // Each match in this round
      $(card)
        .find(".fss-rezultati__one")
        .each((__, matchEl) => {
          const container = $(matchEl).find(".d-flex").first();

          // Teams
          const teamDivs = container.find(
            ".fss-rezultati__one-teams .col-6",
          );
          if (teamDivs.length < 2) return;
          const homeRaw = $(teamDivs[0]).text().trim();
          const awayRaw = $(teamDivs[1]).text().trim();

          // Only keep Mladost matches
          if (!isMladost(homeRaw) && !isMladost(awayRaw)) return;

          // Date
          const dateRaw = container
            .find(".fss-rezultati__one-date")
            .text()
            .trim();
          const date = parseDate(dateRaw);

          // City
          const cityRaw = container
            .find(".fss-rezultati__one-city")
            .text()
            .trim();
          const city = resolveCity(cityRaw, homeRaw) || undefined;

          // Score: parse from .fss-rezultati__result divs
          // The result has 4 divs with order classes. Collect texts sorted by lg order.
          const resultDivs = container.find(".fss-rezultati__result > div");
          let score: string | undefined;
          if (resultDivs.length >= 4) {
            // Sort by order-lg-N class to get correct desktop order
            const ordered: Array<{ order: number; text: string }> = [];
            resultDivs.each((___, div) => {
              const cls = $(div).attr("class") || "";
              const orderMatch = cls.match(/order-lg-(\d+)/);
              const order = orderMatch ? parseInt(orderMatch[1], 10) : 99;
              ordered.push({ order, text: $(div).text().trim() });
            });
            ordered.sort((a, b) => a.order - b.order);

            // Desktop order: [homeGoals, separator, separator, awayGoals]
            // If all "/", match not played
            const allSlash = ordered.every((d) => d.text === "/");
            if (!allSlash) {
              const homeGoals = ordered[0]?.text || "";
              const awayGoals = ordered[3]?.text || "";
              if (
                homeGoals &&
                awayGoals &&
                /^\d+$/.test(homeGoals) &&
                /^\d+$/.test(awayGoals)
              ) {
                score = `${homeGoals}:${awayGoals}`;
              }
            }
          }

          const home = normalizeName(homeRaw);
          const away = normalizeName(awayRaw);
          const isHome = isMladost(homeRaw);

          matches.push({ round, date, home, away, score, city, isHome });
        });
    });

    // Sort by round ascending
    matches.sort((a, b) => a.round - b.round);

    if (matches.length === 0) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message:
          "Nisu pronađene utakmice Mladosti u rasporedu na fss.rs",
      });
    }

    await ctx.runMutation(
      internal.sync.saveYouthLeagueData.saveMatches,
      { matches },
    );
    return { count: matches.length };
  },
});
