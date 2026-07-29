import * as cheerio from "cheerio";
import { Prisma } from "@prisma/client";
import { db } from "../db.js";

const STANDINGS_URL = "https://www.superliga.rs/sezona/tabela-takmicenja/";
const SCHEDULE_URL = "https://www.superliga.rs/sezona/raspored-i-rezultati/";
const NAJAVA_KOLA_URL = "https://www.superliga.rs/sezona/najava-kola/";
const TEAM_PAGE_URL = "https://www.superliga.rs/tim/mladost/";
const LOGO_BASE =
  "https://www.superliga.rs/wp-content/themes/newweb-theme/images/grbovi/";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (compatible; FKMladostBot/1.0; +https://fkmladost.rs)",
  Accept: "text/html",
};

/**
 * Stadion domacina — rezerva za slucaj da raspored ne da mesto odigravanja.
 * Vrednosti su preuzete iz stvarnih podataka rasporeda superliga.rs za sezonu
 * 2026/27; nekoliko klubova ne igra u svom maticnom gradu.
 */
const STADIUM_MAP: Record<string, string> = {
  "CRVENA ZVEZDA": "Rajko Mitić, Beograd",
  "ČUKARIČKI": "Stadion FK Čukarički, Beograd",
  IMT: 'Gradski stadion "Lagator", Loznica',
  "MAČVA": "Stadion FK Mačva, Šabac",
  MLADOST: "SRC Mr Radoš Milovanović, Lučani",
  "NOVI PAZAR": "Gradski stadion, Novi Pazar",
  "OFK BEOGRAD": "SC FSS, Stara Pazova",
  PARTIZAN: "Stadion Partizana, Beograd",
  "RADNIČKI 1923": "Stadion Čika Dača, Kragujevac",
  "RADNIČKI NIŠ": "Gradski stadion Čair, Niš",
  "RADNIČKI": "Gradski stadion Čair, Niš",
  RADNIK: "Gradski stadion, Surdulica",
  VOJVODINA: "Karađorđe, Novi Sad",
  ZEMUN: 'Stadion "Dragan Džajić", Ub',
  ŽELEZNIČAR: "SC Mladost, Pančevo",
};

function findStadium(teamName: string): string {
  const upper = teamName.toUpperCase().trim();
  if (STADIUM_MAP[upper]) return STADIUM_MAP[upper];
  for (const [key, val] of Object.entries(STADIUM_MAP)) {
    if (upper.includes(key) || key.includes(upper)) return val;
  }
  return "";
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.text();
}

export async function scrapeStandings(): Promise<{ standings: number }> {
  const html = await fetchHtml(STANDINGS_URL);
  const $ = cheerio.load(html);
  // Vidi napomenu u scrapeSuperLeague.ts — regularni deo sezone koristi
  // table.preliminarno; playoff/playout tabele postoje tek u zavrsnici.
  const rows = $("table.preliminarno tbody tr");

  if (rows.length === 0) {
    throw new Error(
      "Tabela table.preliminarno nije pronađena na superliga.rs — verovatno je promenjena struktura stranice ili je liga ušla u playoff/playout fazu",
    );
  }

  const standings: Prisma.StandingCreateManyInput[] = [];

  rows.each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 11) return;

    const position = parseInt($(cells[0]).text().trim(), 10);
    const imgEl = $(cells[1]).find("img");
    let logoUrl = "";
    if (imgEl.length > 0) {
      const src = imgEl.attr("src") ?? "";
      logoUrl = src.startsWith("http") ? src : `${LOGO_BASE}${src}`;
    }

    const team = $(cells[2]).text().trim();
    const played = parseInt($(cells[3]).text().trim(), 10) || 0;
    const wins = parseInt($(cells[4]).text().trim(), 10) || 0;
    const draws = parseInt($(cells[5]).text().trim(), 10) || 0;
    const losses = parseInt($(cells[6]).text().trim(), 10) || 0;
    const goalsFor = parseInt($(cells[7]).text().trim(), 10) || 0;
    const goalsAgainst = parseInt($(cells[8]).text().trim(), 10) || 0;
    const goalDifference = $(cells[9]).text().trim();
    const points = parseInt($(cells[10]).text().trim(), 10) || 0;
    const isHighlighted = team.toLowerCase().includes("mladost");

    if (team && !isNaN(position)) {
      standings.push({
        position,
        team,
        played,
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst,
        goalDifference,
        points,
        logoUrl,
        form: "",
        isHighlighted,
      });
    }
  });

  if (standings.length === 0) throw new Error("No standings data found");

  await db.standing.deleteMany();
  await db.standing.createMany({ data: standings });

  return { standings: standings.length };
}

export async function scrapeMatches(): Promise<{ matches: number }> {
  const html = await fetchHtml(SCHEDULE_URL);
  const $ = cheerio.load(html);

  // Scrape TV channel from najava-kola (optional)
  let ourTvChannel = "";
  let ourTvLogoUrl = "";
  try {
    const naHtml = await fetchHtml(NAJAVA_KOLA_URL);
    const n$ = cheerio.load(naHtml);
    n$(".najava-box").each((_, box) => {
      const teams = n$(box).find(".najava-timovi").text().trim().toUpperCase();
      if (teams.includes("MLADOST")) {
        const tvImg = n$(box).find("img[alt*='Arena']");
        if (tvImg.length > 0) {
          const src = tvImg.attr("src") ?? "";
          ourTvLogoUrl = src.startsWith("http") ? src : `https://www.superliga.rs${src}`;
          const filename = src.split("/").pop() ?? "";
          const chMatch = filename.match(/A(\d+)/);
          ourTvChannel = chMatch ? `Arena Sport ${chMatch[1]}` : "Arena Sport";
        }
      }
    });
  } catch {
    // TV channel is optional
  }

  type Entry = {
    home: string;
    away: string;
    homeLogoUrl: string;
    awayLogoUrl: string;
    homeScore?: number;
    awayScore?: number;
    date: string;
    time: string;
    dateObj: Date;
    isPlayed: boolean;
  };

  const mladostEntries: Entry[] = [];

  $(".widget-single-match").each((_, block) => {
    const $b = $(block);
    const participants = $b.find(".match-participants").first();

    const home = participants.find(".match-home").text().trim();
    const away = participants.find(".match-away").text().trim();
    if (!home || !away) return;
    if (
      !home.toLowerCase().includes("mladost") &&
      !away.toLowerCase().includes("mladost")
    ) return;

    const date = participants.find(".match-date").first().text().trim();
    const time = participants.find(".match-time").first().text().trim();

    const badgeText = $b.find(".match-bagde .badge").first().text().trim();
    const isPlayed = badgeText.toLowerCase().includes("odigran");

    const logos = $b.find(".match-team-logo img");
    const rawHomeLogo = (logos.eq(0).attr("src") ?? "").trim();
    const rawAwayLogo = (logos.eq(1).attr("src") ?? "").trim();
    const homeLogoUrl = rawHomeLogo.startsWith("http")
      ? rawHomeLogo
      : `${LOGO_BASE}${rawHomeLogo.replace(/^\/+/, "")}`;
    const awayLogoUrl = rawAwayLogo.startsWith("http")
      ? rawAwayLogo
      : `${LOGO_BASE}${rawAwayLogo.replace(/^\/+/, "")}`;

    const scoreText = participants.find(".match-result").first().text().trim();
    const scoreMatch = scoreText.match(/^(\d+)\s*:\s*(\d+)$/);
    const homeScore = scoreMatch ? parseInt(scoreMatch[1], 10) : undefined;
    const awayScore = scoreMatch ? parseInt(scoreMatch[2], 10) : undefined;

    // Parse "dd.mm.yyyy"
    const parts = date.split(".");
    const dateObj =
      parts.length === 3
        ? new Date(
            `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`,
          )
        : new Date(0);

    mladostEntries.push({
      home,
      away,
      homeLogoUrl,
      awayLogoUrl,
      homeScore,
      awayScore,
      date,
      time,
      dateObj,
      isPlayed,
    });
  });

  if (mladostEntries.length === 0) {
    throw new Error("Nije pronađena ni jedna Mladostova utakmica na rasporedu");
  }

  mladostEntries.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  const last = [...mladostEntries].reverse().find((m) => m.isPlayed);
  const next = mladostEntries.find((m) => !m.isPlayed);

  const matches: Array<{
    type: "next" | "last";
    home: string;
    away: string;
    homeLogoUrl: string;
    awayLogoUrl: string;
    homeScore?: number;
    awayScore?: number;
    date: string;
    time: string;
    stadium: string;
    competition: string;
    status?: string;
    tvChannel?: string;
    tvChannelLogoUrl?: string;
  }> = [];

  if (last) {
    matches.push({
      type: "last",
      home: last.home,
      away: last.away,
      homeLogoUrl: last.homeLogoUrl,
      awayLogoUrl: last.awayLogoUrl,
      homeScore: last.homeScore,
      awayScore: last.awayScore,
      date: last.date,
      time: last.time,
      stadium: findStadium(last.home),
      competition: "Mozzart Bet Superliga",
      status: "Završeno",
    });
  }

  if (next) {
    matches.push({
      type: "next",
      home: next.home,
      away: next.away,
      homeLogoUrl: next.homeLogoUrl,
      awayLogoUrl: next.awayLogoUrl,
      date: next.date,
      time: next.time,
      stadium: findStadium(next.home),
      competition: "Mozzart Bet Superliga",
      tvChannel: ourTvChannel || undefined,
      tvChannelLogoUrl: ourTvLogoUrl || undefined,
    });
  }

  if (matches.length === 0) {
    throw new Error("Nema ni prošle ni sledeće utakmice za prikaz");
  }

  await db.match.deleteMany();
  for (const m of matches) {
    await db.match.create({ data: m });
  }

  return { matches: matches.length };
}

/**
 * Mapira "kolo + slugovi timova" na URL izvestaja utakmice.
 *
 * Stranica najave kola vise ne sadrzi linkove ka izvestajima (klasa
 * .izvestaj-link je ugasena), ali stranica rasporeda ima <a href="/utakmica/…">
 * omotan oko bloka utakmice — doduse samo za odigrana i najskorija kola.
 * Za ostale se URL sklapa po istom obrascu i proverava jednim zahtevom, jer
 * slug ne prati uvek prikazano ime tima (npr. "Radnički Niš" -> "radnicki").
 */
async function resolveReportUrl(
  round: number,
  homeSlug: string,
  awaySlug: string,
  fromSchedule: Map<string, string>,
): Promise<string> {
  if (!homeSlug || !awaySlug) return "";

  const known = fromSchedule.get(`${round}|${homeSlug}-${awaySlug}`);
  if (known) return known;

  const guess = `https://www.superliga.rs/utakmica/${round}-kolo-${homeSlug}-${awaySlug}/`;
  try {
    const res = await fetch(guess, { headers: HEADERS });
    return res.ok ? guess : "";
  } catch {
    return "";
  }
}

/** Cita /utakmica/ linkove sa stranice rasporeda, kljucevane po kolu i timovima. */
async function fetchScheduleReportUrls(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    const $ = cheerio.load(await fetchHtml(SCHEDULE_URL));
    $("a[href*='/utakmica/']").each((_, link) => {
      const href = $(link).attr("href") ?? "";
      // Obrazac: /utakmica/<kolo>-kolo-<domacin>-<gost>/
      const m = /\/utakmica\/(\d+)-kolo-(.+?)\/?$/.exec(href);
      if (!m) return;
      map.set(`${m[1]}|${m[2]}`, href.startsWith("http") ? href : `https://www.superliga.rs${href}`);
    });
  } catch {
    // Bez rasporeda se oslanjamo iskljucivo na sklapanje URL-a.
  }
  return map;
}

export async function scrapeRoundPreview(): Promise<{ roundNumber: number; matches: number }> {
  const html = await fetchHtml(NAJAVA_KOLA_URL);
  const $ = cheerio.load(html);

  const subtitle = $(".subtitle").text();
  const roundMatch = subtitle.match(/Kolo:\s*(\d+)/i);
  const roundNumber = roundMatch ? parseInt(roundMatch[1], 10) : 0;
  if (roundNumber === 0) throw new Error("Round number not found");

  const scheduleUrls = await fetchScheduleReportUrls();
  const roundMatches: Prisma.RoundMatchCreateManyInput[] = [];
  const boxes = $(".najava-box").toArray();

  for (const box of boxes) {
    const boxEl = $(box);
    const dateTimeEl = boxEl.find(".najava-time");
    const dateTimeParts = dateTimeEl.text().trim().split(/\s+/);
    const date = dateTimeParts[0] ?? "";
    const time = dateTimeParts[1] ?? "";

    const teamsText = boxEl.find(".najava-timovi").text().trim();
    const teamParts = teamsText.split(/\s*-\s*/);
    const home = (teamParts[0] ?? "").trim();
    const away = (teamParts[1] ?? "").trim();

    // Slugovi timova iz linkova ka /tim/<slug>/ — pouzdaniji od pretvaranja
    // prikazanog imena, jer sajt koristi svoje skracenice.
    const teamSlugs = boxEl
      .find("a[href*='/tim/']")
      .map((_i, a) => ($(a).attr("href") ?? "").replace(/\/+$/, "").split("/").pop() ?? "")
      .get();

    const stadium = boxEl.find(".text-muted.uppercase").first().text().trim();

    let tvChannel = "";
    let tvChannelLogoUrl = "";
    const tvImg = boxEl.find("img[alt*='Arena']");
    if (tvImg.length > 0) {
      const src = tvImg.attr("src") ?? "";
      tvChannelLogoUrl = src.startsWith("http") ? src : `https://www.superliga.rs${src}`;
      const filename = src.split("/").pop() ?? "";
      const chMatch = filename.match(/A(\d+)/);
      tvChannel = chMatch ? `Arena Sport ${chMatch[1]}` : "Arena Sport";
    }

    let referee = "", assistantRef1 = "", assistantRef2 = "",
      fourthOfficial = "", delegate = "", refInspector = "",
      varRef = "", avarRef = "";

    boxEl.find(".refs").each((_, refDiv) => {
      const refHtml = $(refDiv).html() ?? "";
      const lines = refHtml.split("<br>").map((l) => l.replace(/<[^>]*>/g, "").trim());
      for (const line of lines) {
        if (line.startsWith("Glavni sudija:")) referee = line.replace("Glavni sudija:", "").trim();
        else if (line.startsWith("1. pomoćni sudija:")) assistantRef1 = line.replace("1. pomoćni sudija:", "").trim();
        else if (line.startsWith("2. pomoćni sudija:")) assistantRef2 = line.replace("2. pomoćni sudija:", "").trim();
        else if (line.startsWith("Četvrti sudija:")) fourthOfficial = line.replace("Četvrti sudija:", "").trim();
        else if (line.startsWith("Delegat:")) delegate = line.replace("Delegat:", "").trim();
        else if (line.startsWith("Kontrolor suđenja:")) refInspector = line.replace("Kontrolor suđenja:", "").trim();
        else if (line.startsWith("VAR:")) varRef = line.replace("VAR:", "").trim();
        else if (line.startsWith("AVAR:")) avarRef = line.replace("AVAR:", "").trim();
      }
    });

    const reportUrl = await resolveReportUrl(
      roundNumber,
      teamSlugs[0] ?? "",
      teamSlugs[1] ?? "",
      scheduleUrls,
    );

    const isOurMatch =
      home.toUpperCase().includes("MLADOST") || away.toUpperCase().includes("MLADOST");

    if (home && away) {
      roundMatches.push({
        roundNumber,
        date,
        time,
        home,
        away,
        stadium,
        tvChannel,
        tvChannelLogoUrl,
        referee,
        assistantRef1,
        assistantRef2,
        fourthOfficial,
        delegate,
        refInspector,
        varRef,
        avarRef,
        reportUrl,
        isOurMatch,
      });
    }
  }

  if (roundMatches.length === 0) throw new Error("No round matches found");

  await db.roundMatch.deleteMany();
  await db.roundMatch.createMany({ data: roundMatches });

  return { roundNumber, matches: roundMatches.length };
}

export async function scrapeMatchAnalytics(): Promise<{ success: boolean }> {
  const ourMatch = await db.roundMatch.findFirst({ where: { isOurMatch: true } });
  if (!ourMatch?.reportUrl) {
    throw new Error("No Mladost match or reportUrl found. Sync round preview first.");
  }

  const html = await fetchHtml(ourMatch.reportUrl);
  const $ = cheerio.load(html);

  // Od sezone 2026/27 statistika je u tabeli .h2h-table unutar taba INFO
  // (#tab-01). Format redova:
  //   zaglavlje       -> [DOMACIN, "", GOST]                       (3 celije)
  //   statistika      -> [vrednost, "", NAZIV, "", vrednost]       (5 celija)
  //   forma           -> ["? W", "FORMA", "? D D"]                 (3 celije)
  const teamStats: Array<{ label: string; homeValue: string; awayValue: string }> = [];
  let homeFormLetters: string[] = [];
  let awayFormLetters: string[] = [];

  $(".h2h-table tr").each((_, row) => {
    const cells = $(row)
      .find("td, th")
      .map((__, c) => $(c).text().replace(/\s+/g, " ").trim())
      .get();

    if (cells.length === 5) {
      const [homeValue, , label, , awayValue] = cells;
      if (label && (homeValue || awayValue)) {
        teamStats.push({ label, homeValue, awayValue });
      }
      return;
    }

    if (cells.length === 3 && cells[1].toUpperCase().includes("FORMA")) {
      homeFormLetters = cells[0].split(/\s+/).filter(Boolean);
      awayFormLetters = cells[2].split(/\s+/).filter(Boolean);
    }
  });

  // Sajt vise ne daje datume i rezultate uz formu — samo slova W/D/L
  // (i "?" za neodigrano). Prikaz nizom bedzeva i dalje radi.
  const toForm = (letters: string[]) =>
    letters.map((result) => ({ date: "", result, score: "", teams: "" }));
  const homeForm = toForm(homeFormLetters);
  const awayForm = toForm(awayFormLetters);

  const previousMatches: Array<{ date: string; homeTeam: string; awayTeam: string; score: string }> = [];
  $(".previous-match").each((_, el) => {
    const date = $(el).find(".h2h-date").text().trim();
    // .h2h-team-name je sam <span>, a ne omotac oko njega kao ranije.
    const teamNames = $(el).find(".h2h-team-name");
    const homeTeam = teamNames.eq(0).text().trim();
    const awayTeam = teamNames.eq(1).text().trim();
    // Rezultat je u dva odvojena <span class="h2h-prev-result">.
    const goals = $(el)
      .find(".h2h-prev-result")
      .map((__, s) => $(s).text().trim())
      .get();

    if (date && homeTeam && awayTeam && goals.length >= 2) {
      previousMatches.push({ date, homeTeam, awayTeam, score: `${goals[0]}:${goals[1]}` });
    }
  });

  // Zbirni medjusobni skor vise ne postoji kao gotov blok (.h2h / .h2h-total),
  // pa se racuna iz spiska prethodnih susreta. Golovi i pobede se pripisuju
  // timovima iz aktuelne utakmice, bez obzira ko je tada bio domacin.
  const key = (s: string) => s.toUpperCase().replace(/[^A-ZŠĐČĆŽ0-9]/g, "");
  const currentHomeKey = key(ourMatch.home);

  let h2hTotalPlayed = 0, h2hHomeWins = 0, h2hDraws = 0,
    h2hAwayWins = 0, h2hHomeGoals = 0, h2hAwayGoals = 0;

  for (const pm of previousMatches) {
    const [a, b] = pm.score.split(":").map((n) => parseInt(n.trim(), 10));
    if (isNaN(a) || isNaN(b)) continue;

    const prevHomeIsCurrentHome = key(pm.homeTeam) === currentHomeKey;
    const homeGoals = prevHomeIsCurrentHome ? a : b;
    const awayGoals = prevHomeIsCurrentHome ? b : a;

    h2hTotalPlayed++;
    h2hHomeGoals += homeGoals;
    h2hAwayGoals += awayGoals;
    if (homeGoals > awayGoals) h2hHomeWins++;
    else if (homeGoals < awayGoals) h2hAwayWins++;
    else h2hDraws++;
  }

  await db.matchAnalytics.deleteMany();
  await db.matchAnalytics.create({
    data: {
      roundNumber: ourMatch.roundNumber,
      home: ourMatch.home,
      away: ourMatch.away,
      reportUrl: ourMatch.reportUrl,
      h2hTotalPlayed,
      h2hHomeWins,
      h2hDraws,
      h2hAwayWins,
      h2hHomeGoals,
      h2hAwayGoals,
      previousMatches,
      teamStats,
      homeForm,
      awayForm,
    },
  });

  return { success: true };
}

interface ScrapedPlayer {
  name: string;
  number: number;
  imageUrl: string;
  superligaUrl: string;
  appearances?: number;
  minutes?: number;
  goals?: number;
  yellowCards?: number;
}

/**
 * Cita zbirnu statistiku sa stranice pojedinacnog igraca.
 *
 * Od sezone 2026/27 timska stranica vise ne nosi statistiku uz karticu igraca,
 * pa se ona dohvata sa /sezona/igrac/… gde stoji u .counter blokovima
 * (<label>NASTUPI</label> + <span class="timer">2</span>).
 *
 * Asistencije i primljeni golovi se vise ne objavljuju, pa se ne vracaju —
 * pozivalac ih namerno ostavlja netaknutim u bazi.
 */
type PlayerStats = Pick<
  ScrapedPlayer,
  "appearances" | "minutes" | "goals" | "yellowCards"
>;

async function fetchPlayerStats(url: string): Promise<PlayerStats> {
  const $ = cheerio.load(await fetchHtml(url));
  const stats: PlayerStats = {};

  $(".counter").each((_, el) => {
    const label = $(el).find("label").text().trim().toLowerCase();
    const value = parseInt($(el).find("span.timer").text().trim(), 10);
    if (isNaN(value)) return;

    if (label.includes("nastup")) stats.appearances = value;
    else if (label.includes("minut")) stats.minutes = value;
    else if (label.includes("golova") || label.includes("gol")) {
      // "GOLOVA" da, ali "AUTOGOLOVI" ne — to je zaseban podatak.
      if (!label.includes("auto")) stats.goals = value;
    } else if (label.includes("žut") || label.includes("zut")) {
      stats.yellowCards = value;
    }
  });

  return stats;
}

export async function scrapePlayers(): Promise<{ players: number }> {
  const html = await fetchHtml(TEAM_PAGE_URL);
  const $ = cheerio.load(html);

  const players: ScrapedPlayer[] = [];
  const seenNames = new Set<string>();

  // Sve kartice igraca su u jednoj sekciji "Postava"; podela po pozicijama
  // (Golmani/Odbrana/Vezni red/Napad) vise ne postoji na sajtu.
  $("a[href*='/sezona/igrac/']").each((_, link) => {
    const el = $(link);

    // Ime je od 2026/27 u .blog-name-right (span = ime, h5 = prezime);
    // atribut alt na slici je sada prazan.
    const nameBox = el.find(".blog-name-right");
    const firstName = nameBox.find("span").first().text().trim();
    const lastName = nameBox.find("h5").first().text().trim();
    const name = `${firstName} ${lastName}`.replace(/\s+/g, " ").trim();

    if (!name || seenNames.has(name.toLowerCase())) return;
    seenNames.add(name.toLowerCase());

    const number = parseInt(el.find(".blog-name-left span").first().text().trim(), 10) || 0;

    let imageUrl = (el.find("img.img-fluid").attr("src") ?? "").trim();
    if (imageUrl && !imageUrl.startsWith("http")) {
      imageUrl = `https://www.superliga.rs${imageUrl}`;
    }

    const href = el.attr("href") ?? "";
    const superligaUrl = href.startsWith("http")
      ? href
      : href
        ? `https://www.superliga.rs${href}`
        : "";

    players.push({ name, number, imageUrl, superligaUrl });
  });

  if (players.length === 0) {
    throw new Error(
      "Nije pronađen nijedan igrač na superliga.rs — verovatno je promenjena struktura timske stranice",
    );
  }

  // Statistika trazi po jedan zahtev na igraca; ide u malim grupama da ne
  // zasipamo superliga.rs. Neuspeh na jednom igracu ne rusi ceo sync.
  const BATCH = 5;
  for (let i = 0; i < players.length; i += BATCH) {
    const batch = players.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (p) => {
        if (!p.superligaUrl) return;
        try {
          Object.assign(p, await fetchPlayerStats(p.superligaUrl));
        } catch {
          // Bez statistike — postojece vrednosti u bazi ostaju netaknute.
        }
      }),
    );
  }

  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    const existing = await db.player.findFirst({ where: { name: p.name } });
    if (existing) {
      // position, assists i goalsConceded se namerno ne diraju: superliga.rs
      // ih vise ne objavljuje, pa ostaju onakvi kakvim ih je admin podesio.
      await db.player.update({
        where: { id: existing.id },
        data: { ...p, sortOrder: existing.sortOrder, isActive: true },
      });
    } else {
      await db.player.create({
        data: { ...p, position: "Nepoznato", sortOrder: i, isActive: true },
      });
    }
  }

  return { players: players.length };
}
