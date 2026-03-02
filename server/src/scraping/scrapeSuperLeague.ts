import * as cheerio from "cheerio";
import { Prisma } from "@prisma/client";
import { db } from "../db.js";

const STANDINGS_URL = "https://www.superliga.rs/sezona/tabela-takmicenja/";
const SCHEDULE_URL = "https://www.superliga.rs/sezona/raspored-i-rezultati/";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; FKMladostBot/1.0; +https://fkmladost.rs)",
  Accept: "text/html",
};

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

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.text();
}

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

export async function scrapeSuperLeagueStandings(): Promise<{ count: number }> {
  const html = await fetchHtml(STANDINGS_URL);
  const $ = cheerio.load(html);
  const rows = $("table.preliminarno tbody tr");

  if (rows.length === 0) throw new Error("SuperLeague standings table not found");

  const standings: Prisma.SuperLeagueStandingCreateManyInput[] = [];

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
      standings.push({ position, club, played, won, drawn, lost, goalsFor, goalsAgainst, goalDiff, points, isHighlighted });
    }
  });

  if (standings.length === 0) throw new Error("No super league standings found");

  await db.superLeagueStanding.deleteMany();
  await db.superLeagueStanding.createMany({ data: standings });
  return { count: standings.length };
}

export async function scrapeSuperLeagueMatches(): Promise<{ count: number }> {
  const html = await fetchHtml(SCHEDULE_URL);
  const $ = cheerio.load(html);

  const matches: Prisma.SuperLeagueMatchCreateManyInput[] = [];

  $("div.tab-pane").each((_, pane) => {
    const paneId = $(pane).attr("id") ?? "";
    const roundMatch = paneId.match(/kolo-(\d+)/);
    if (!roundMatch) return;
    const round = parseInt(roundMatch[1], 10);

    $(pane).find(".widget-single-match").each((__, matchEl) => {
      const participants = $(matchEl).find(".match-participants");
      const homeRaw = participants.find(".match-home").text().trim();
      const awayRaw = participants.find(".match-away").text().trim();

      if (!homeRaw.toLowerCase().includes("mladost") && !awayRaw.toLowerCase().includes("mladost")) return;

      const date = participants.find(".match-date").first().text().trim();
      const scoreText = participants.find(".match-result").text().trim();
      const score = scoreText && /^\d+:\d+$/.test(scoreText) ? scoreText : undefined;
      const venue = participants.find(".match-venue").text().trim();
      const city = extractCity(venue, homeRaw) || undefined;
      const isHome = homeRaw.toLowerCase().includes("mladost");

      matches.push({ round, date, home: homeRaw, away: awayRaw, score, city, isHome });
    });
  });

  matches.sort((a, b) => a.round - b.round);
  if (matches.length === 0) throw new Error("No super league matches found for Mladost");

  await db.superLeagueMatch.deleteMany();
  await db.superLeagueMatch.createMany({ data: matches });
  return { count: matches.length };
}
