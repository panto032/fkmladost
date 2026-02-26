"use node";

import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { ConvexError } from "convex/values";
import * as cheerio from "cheerio";

/**
 * fss.rs Kadetska Liga scraper
 * Uses ?script=lat for Latin characters
 */
const BASE_URL =
  "https://fss.rs/takmicenje/kadetska-liga-srbije-25-26/?script=lat";

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

/** Normalize team name from UPPERCASE to display name */
function normalizeName(raw: string): string {
  const trimmed = raw.trim();
  const KNOWN: Record<string, string> = {
    MLADOST: "Mladost",
    "CRVENA ZVEZDA": "Crvena Zvezda",
    PARTIZAN: "Partizan",
    VOJVODINA: "Vojvodina",
    "ČUKARIČKI DOO": "Čukarički",
    "ČUKARICKI DOO": "Čukarički",
    ČUKARIČKI: "Čukarički",
    TSC: "TSC",
    SPARTAK: "Spartak",
    "SPARTAK ZV": "Spartak",
    "SPARTAK ŽDREPČEVA KRV": "Spartak",
    IMT: "IMT",
    "IMT NOVI BEOGRAD": "IMT",
    VOŽDOVAC: "Voždovac",
    "OFK VRŠAC": "OFK Vršac",
    "NOVI PAZAR": "Novi Pazar",
    "RFK GRAFIČAR": "RFK Grafičar",
    GRAFIČAR: "RFK Grafičar",
    "RFK GRAFIČAR BEOGRAD": "RFK Grafičar",
    "REAL NIŠ": "Real Niš",
    TELEOPTIK: "Teleoptik",
    "011": "011",
    "VOŠINI KLINCI": "Vošini Klinci",
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
  PARTIZAN: "Zemun",
  VOJVODINA: "Veternik",
  ČUKARIČKI: "Beograd",
  "ČUKARIČKI DOO": "Beograd",
  TSC: "Bačka Topola",
  SPARTAK: "Subotica",
  "SPARTAK ZV": "Subotica",
  IMT: "Novi Beograd",
  "IMT NOVI BEOGRAD": "Novi Beograd",
  VOŽDOVAC: "Beograd",
  "OFK VRŠAC": "Vršac",
  "NOVI PAZAR": "Novi Pazar",
  "RFK GRAFIČAR": "Beograd",
  GRAFIČAR: "Beograd",
  "REAL NIŠ": "Niš",
  TELEOPTIK: "Zemun",
  "011": "Beograd",
  "VOŠINI KLINCI": "Novi Sad",
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

export const scrapeCadetLeagueStandings = action({
  args: {},
  handler: async (ctx): Promise<{ count: number }> => {
    const html = await fetchPage(BASE_URL);
    const $ = cheerio.load(html);

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

      const texts = cells.map((__, cell) => $(cell).text().trim()).get();

      const position = parseInt(texts[0], 10);
      if (isNaN(position)) return;

      // Detect layout: cell[1] might be crest image or name
      let nameIdx = 1;
      let statsStartIdx = 2;

      const cell1HasImg = $(cells[1]).find("img").length > 0;
      if (cell1HasImg) {
        nameIdx = 2;
        statsStartIdx = 3;
      } else {
        const maybeNum = parseInt(texts[1], 10);
        if (!isNaN(maybeNum) && texts.length <= 10) {
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
      internal.sync.saveCadetLeagueData.saveStandings,
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

export const scrapeCadetLeagueMatches = action({
  args: {},
  handler: async (ctx): Promise<{ count: number }> => {
    const html = await fetchPage(BASE_URL);
    const $ = cheerio.load(html);

    const matches: MatchRow[] = [];

    // Process both accordions (current + past rounds)
    const accordions = $("#accordion_current, #accordion");

    accordions.find(".card").each((_, card) => {
      const titleText = $(card).find(".fss-rezultati__title").text().trim();
      const roundMatch = titleText.match(/(\d+)\.\s*kolo/i);
      if (!roundMatch) return;
      const round = parseInt(roundMatch[1], 10);

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

          // Score
          const resultDivs = container.find(".fss-rezultati__result > div");
          let score: string | undefined;
          if (resultDivs.length >= 4) {
            const ordered: Array<{ order: number; text: string }> = [];
            resultDivs.each((___, div) => {
              const cls = $(div).attr("class") || "";
              const orderMatch = cls.match(/order-lg-(\d+)/);
              const order = orderMatch ? parseInt(orderMatch[1], 10) : 99;
              ordered.push({ order, text: $(div).text().trim() });
            });
            ordered.sort((a, b) => a.order - b.order);

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
      internal.sync.saveCadetLeagueData.saveMatches,
      { matches },
    );
    return { count: matches.length };
  },
});
