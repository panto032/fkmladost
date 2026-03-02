import * as cheerio from "cheerio";
import { db } from "../db.js";

const YOUTH_URL = "https://fss.rs/takmicenje/omladinska-liga-srbije-25-26/?script=lat";
const CADET_URL = "https://fss.rs/takmicenje/kadetska-liga-srbije-25-26/?script=lat";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; FKMladostBot/1.0; +https://fkmladost.rs)",
  Accept: "text/html",
};

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.text();
}

function normalizeName(raw: string): string {
  const trimmed = raw.trim();
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
  return trimmed.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());
}

function isMladost(name: string): boolean {
  return name.toUpperCase().includes("MLADOST");
}

function parseDate(raw: string): string {
  const match = raw.trim().match(/(\d{2}\.\d{2}\.\d{4})/);
  return match ? match[1] : raw.trim();
}

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

type MatchRow = {
  round: number;
  date: string;
  home: string;
  away: string;
  score?: string;
  city?: string;
  isHome: boolean;
};

function scrapeStandingsFromHtml(html: string): StandingRow[] {
  const $ = cheerio.load(html);
  const tabelaTab = $("#fss-tabela");
  const table = tabelaTab.find("table").first();
  const rows = table.find("tbody tr");

  if (rows.length === 0) throw new Error("Standings table not found on fss.rs");

  const standings: StandingRow[] = [];

  rows.each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 5) return;

    const texts = cells.map((__, cell) => $(cell).text().trim()).get();
    const position = parseInt(texts[0], 10);
    if (isNaN(position)) return;

    let nameIdx = 1;
    let statsStartIdx = 2;

    const cell1HasImg = $(cells[1]).find("img").length > 0;
    if (cell1HasImg) {
      nameIdx = 2;
      statsStartIdx = 3;
    } else {
      const maybeNum = parseInt(texts[1], 10);
      if (!isNaN(maybeNum) && texts.length <= 10) return;
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

    standings.push({
      position,
      club: normalizeName(club),
      played,
      won,
      drawn,
      lost,
      goalsFor,
      goalsAgainst,
      goalDiff,
      points,
      isHighlighted: isMladost(club),
    });
  });

  return standings;
}

function scrapeMatchesFromHtml(html: string): MatchRow[] {
  const $ = cheerio.load(html);
  const matches: MatchRow[] = [];

  const accordions = $("#accordion_current, #accordion");
  accordions.find(".card").each((_, card) => {
    const titleText = $(card).find(".fss-rezultati__title").text().trim();
    const roundMatch = titleText.match(/(\d+)\.\s*kolo/i);
    if (!roundMatch) return;
    const round = parseInt(roundMatch[1], 10);

    $(card).find(".fss-rezultati__one").each((__, matchEl) => {
      const container = $(matchEl).find(".d-flex").first();
      const teamDivs = container.find(".fss-rezultati__one-teams .col-6");
      if (teamDivs.length < 2) return;

      const homeRaw = $(teamDivs[0]).text().trim();
      const awayRaw = $(teamDivs[1]).text().trim();
      if (!isMladost(homeRaw) && !isMladost(awayRaw)) return;

      const dateRaw = container.find(".fss-rezultati__one-date").text().trim();
      const date = parseDate(dateRaw);
      const cityRaw = container.find(".fss-rezultati__one-city").text().trim();
      const city = resolveCity(cityRaw, homeRaw) || undefined;

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
          if (homeGoals && awayGoals && /^\d+$/.test(homeGoals) && /^\d+$/.test(awayGoals)) {
            score = `${homeGoals}:${awayGoals}`;
          }
        }
      }

      matches.push({
        round,
        date,
        home: normalizeName(homeRaw),
        away: normalizeName(awayRaw),
        score,
        city,
        isHome: isMladost(homeRaw),
      });
    });
  });

  return matches.sort((a, b) => a.round - b.round);
}

// ── Youth League ─────────────────────────────────────────────────────

export async function scrapeYouthLeagueStandings(): Promise<{ count: number }> {
  const html = await fetchHtml(YOUTH_URL);
  const standings = scrapeStandingsFromHtml(html);
  if (standings.length === 0) throw new Error("No youth standings found");

  await db.youthStanding.deleteMany();
  await db.youthStanding.createMany({ data: standings });
  return { count: standings.length };
}

export async function scrapeYouthLeagueMatches(): Promise<{ count: number }> {
  const html = await fetchHtml(YOUTH_URL);
  const matches = scrapeMatchesFromHtml(html);
  if (matches.length === 0) throw new Error("No youth matches found for Mladost");

  await db.youthMatch.deleteMany();
  await db.youthMatch.createMany({ data: matches });
  return { count: matches.length };
}

// ── Cadet League ─────────────────────────────────────────────────────

export async function scrapeCadetLeagueStandings(): Promise<{ count: number }> {
  const html = await fetchHtml(CADET_URL);
  const standings = scrapeStandingsFromHtml(html);
  if (standings.length === 0) throw new Error("No cadet standings found");

  await db.cadetStanding.deleteMany();
  await db.cadetStanding.createMany({ data: standings });
  return { count: standings.length };
}

export async function scrapeCadetLeagueMatches(): Promise<{ count: number }> {
  const html = await fetchHtml(CADET_URL);
  const matches = scrapeMatchesFromHtml(html);
  if (matches.length === 0) throw new Error("No cadet matches found for Mladost");

  await db.cadetMatch.deleteMany();
  await db.cadetMatch.createMany({ data: matches });
  return { count: matches.length };
}
