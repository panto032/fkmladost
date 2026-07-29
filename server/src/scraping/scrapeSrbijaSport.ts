/**
 * Scraper za pionirsku ligu sa srbijasport.net.
 *
 * FSS objavljuje omladinsku i kadetsku ligu, ali ne i pionirsku, pa se ona do
 * sada unosila rucno. srbijasport.net je pokriva i zgodno uz svaku utakmicu
 * ubacuje JSON-LD SportsEvent, sto je stabilnije od parsiranja HTML-a.
 *
 * VAZNO: srbijasport koristi poseban ID lige za svaku sezonu (8114 je
 * 2025-2026), pa se URL ne moze predvideti kao kod fss.rs. Kad pocne nova
 * sezona, novi URL se podesava kroz PIONEER_LEAGUE_URL bez izmene koda —
 * nadje se na srbijasport.net i prekopira.
 */

import * as cheerio from "cheerio";
import { db } from "../db.js";

const PIONEER_LEAGUE_URL = (
  process.env.PIONEER_LEAGUE_URL ??
  "https://srbijasport.net/league/8114-prva-pionirska-liga-fsrzs"
).replace(/\/+$/, "");

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; FKMladostBot/1.0; +https://fkmladost.rs)",
  Accept: "text/html",
};

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} pri čitanju ${url}`);
  return res.text();
}

function isMladost(name: string): boolean {
  return name.toUpperCase().includes("MLADOST");
}

// ── Tabela ────────────────────────────────────────────────────────────

export async function scrapePioneerLeagueStandings(): Promise<{ count: number }> {
  const $ = cheerio.load(await fetchHtml(`${PIONEER_LEAGUE_URL}/standings`));

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

  $("table.ssnet-table tr").each((_, row) => {
    const cells = $(row).find("td");
    // Red tabele: [pozicija, strelica, klub, odigrano, pob, ner, por,
    // dati, primljeni, gol-razlika, bodovi]. Prazni redovi su razdvajaci
    // izmedju zona (Evropa, ispadanje) i nemaju celije.
    if (cells.length < 11) return;

    const position = parseInt($(cells[0]).text().trim(), 10);
    if (isNaN(position)) return;

    // Ime i grad su odvojeni elementi; uzimamo samo ime da se poklopi sa
    // nazivima iz JSON-LD-a na stranici rezultata.
    const nameCell = $(cells[2]);
    const club = (nameCell.find(".team-name").text() || nameCell.text()).trim();
    if (!club) return;

    const num = (i: number) => parseInt($(cells[i]).text().trim().replace("+", ""), 10) || 0;

    standings.push({
      position,
      club,
      played: num(3),
      won: num(4),
      drawn: num(5),
      lost: num(6),
      goalsFor: num(7),
      goalsAgainst: num(8),
      goalDiff: num(9),
      points: num(10),
      isHighlighted: isMladost(club),
    });
  });

  if (standings.length === 0) {
    throw new Error(
      `Tabela pionirske lige nije pronađena na ${PIONEER_LEAGUE_URL} — proveri da li je PIONEER_LEAGUE_URL podešen na tekuću sezonu`,
    );
  }

  await db.pioneerStanding.deleteMany();
  await db.pioneerStanding.createMany({ data: standings });
  return { count: standings.length };
}

// ── Utakmice ──────────────────────────────────────────────────────────

interface SportsEvent {
  homeTeam?: { name?: string };
  awayTeam?: { name?: string };
  description?: string;
  startDate?: string;
  location?: { name?: string };
}

/** Cita SportsEvent zapise iz JSON-LD blokova stranice. */
function parseEvents(html: string): SportsEvent[] {
  const events: SportsEvent[] = [];
  const blocks = html.matchAll(
    /<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g,
  );

  for (const [, raw] of blocks) {
    try {
      const parsed = JSON.parse(raw.trim());
      for (const item of Array.isArray(parsed) ? parsed : [parsed]) {
        if (item?.homeTeam?.name && item?.awayTeam?.name) events.push(item);
      }
    } catch {
      // Blok koji nije validan JSON preskacemo.
    }
  }

  return events;
}

/** "2026-06-06T13:00:00+02:00" -> "06.06.2026" */
function formatDate(iso: string | undefined): string {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : "";
}

/**
 * Rezultat stoji na kraju opisa, u dva oblika:
 *   "Mladost (L) – Smederevo 1924 6:0"
 *   "Mladost (L) – Radnički (V) 4:1. (2:1)"   <- uz poluvreme u zagradi
 *
 * Uzima se prvi rezultat, jer je on konacan. Godine u imenima klubova
 * ("Radnički 1923", "Apolon 2018") ne smetaju jer nemaju dvotacku.
 * Neodigrane utakmice nemaju rezultat.
 */
function parseScore(description: string | undefined): string | undefined {
  const m = /(\d+)\s*:\s*(\d+)/.exec(description ?? "");
  return m ? `${m[1]}:${m[2]}` : undefined;
}

export async function scrapePioneerLeagueMatches(): Promise<{ count: number }> {
  const gamesUrl = `${PIONEER_LEAGUE_URL}/games`;
  const firstPage = await fetchHtml(gamesUrl);

  // Broj kola se cita iz padajuceg menija za izbor kola.
  const rounds = [...firstPage.matchAll(/switchRound\((\d+)\)/g)].map((m) =>
    parseInt(m[1], 10),
  );
  const maxRound = rounds.length > 0 ? Math.max(...rounds) : 1;

  const matches: Array<{
    round: number;
    date: string;
    home: string;
    away: string;
    score?: string;
    city?: string;
    isHome: boolean;
  }> = [];

  const collect = (round: number, html: string) => {
    for (const ev of parseEvents(html)) {
      const home = (ev.homeTeam?.name ?? "").trim();
      const away = (ev.awayTeam?.name ?? "").trim();
      if (!home || !away) continue;
      if (!isMladost(home) && !isMladost(away)) continue;

      matches.push({
        round,
        date: formatDate(ev.startDate),
        home,
        away,
        score: parseScore(ev.description),
        city: ev.location?.name?.trim() || undefined,
        isHome: isMladost(home),
      });
    }
  };

  // Svaka strana kola je zaseban zahtev; idu u malim grupama da ne
  // opterecujemo srbijasport.net. Kolo koje padne ne rusi ceo sync.
  const BATCH = 3;
  for (let start = 1; start <= maxRound; start += BATCH) {
    const batch: number[] = [];
    for (let r = start; r < start + BATCH && r <= maxRound; r++) batch.push(r);

    await Promise.all(
      batch.map(async (round) => {
        try {
          collect(round, await fetchHtml(`${gamesUrl}?round=${round}`));
        } catch {
          // Preskacemo kolo koje se ne moze ucitati.
        }
      }),
    );
  }

  if (matches.length === 0) {
    throw new Error(
      "Nije pronađena nijedna utakmica Mladosti u pionirskoj ligi — proveri da li je PIONEER_LEAGUE_URL podešen na tekuću sezonu",
    );
  }

  matches.sort((a, b) => a.round - b.round);

  await db.pioneerMatch.deleteMany();
  await db.pioneerMatch.createMany({ data: matches });
  return { count: matches.length };
}
