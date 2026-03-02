import * as cheerio from "cheerio";
import { Prisma } from "@prisma/client";
import { db } from "../db.js";

const STANDINGS_URL = "https://www.superliga.rs/sezona/tabela-takmicenja/";
const NAJAVA_KOLA_URL = "https://www.superliga.rs/sezona/najava-kola/";
const TEAM_PAGE_URL = "https://www.superliga.rs/tim/mladost/";
const LOGO_BASE =
  "https://www.superliga.rs/wp-content/themes/newweb-theme/images/grbovi/";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (compatible; FKMladostBot/1.0; +https://fkmladost.rs)",
  Accept: "text/html",
};

const STADIUM_MAP: Record<string, string> = {
  "CRVENA ZVEZDA": "Stadion Rajko Mitić, Beograd",
  "ČUKARIČKI": "Stadion Čukarički, Beograd",
  IMT: "Stadion IMT, Novi Beograd",
  "JAVOR MATIS": "Stadion kraj Moravice, Ivanjica",
  MLADOST: "SRC MR Radoš Milovanović, Lučani",
  NAPREDAK: "Stadion Mladost, Kruševac",
  "NOVI PAZAR": "Gradski stadion, Novi Pazar",
  "OFK BEOGRAD": "Stadion Omladinski, Beograd",
  PARTIZAN: "Stadion Partizana, Beograd",
  "RADNIČKI 1923": "Stadion Čika Dača, Kragujevac",
  "RADNIČKI NIŠ": "Stadion Čair, Niš",
  RADNIK: "Gradski stadion, Surdulica",
  "SPARTAK ŽK": "Gradski stadion, Subotica",
  SPARTAK: "Gradski stadion, Subotica",
  TSC: "Stadion TSC, Bačka Topola",
  VOJVODINA: "Stadion Karađorđe, Novi Sad",
  ŽELEZNIČAR: "Stadion Železničar, Pančevo",
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
  const rows = $("table.preliminarno tbody tr");

  if (rows.length === 0) throw new Error("Standings table not found on superliga.rs");

  const standings: Prisma.StandingCreateManyInput[] = [];

  rows.each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 12) return;

    const position = parseInt($(cells[0]).text().trim(), 10);
    const imgEl = $(cells[2]).find("img");
    let logoUrl = "";
    if (imgEl.length > 0) {
      const src = imgEl.attr("src") ?? "";
      logoUrl = src.startsWith("http") ? src : `${LOGO_BASE}${src}`;
    }

    const team = $(cells[3]).text().trim();
    const played = parseInt($(cells[4]).text().trim(), 10) || 0;
    const wins = parseInt($(cells[5]).text().trim(), 10) || 0;
    const draws = parseInt($(cells[6]).text().trim(), 10) || 0;
    const losses = parseInt($(cells[7]).text().trim(), 10) || 0;
    const goalsFor = parseInt($(cells[8]).text().trim(), 10) || 0;
    const goalsAgainst = parseInt($(cells[9]).text().trim(), 10) || 0;
    const goalDifference = $(cells[10]).text().trim();
    const points = parseInt($(cells[11]).text().trim(), 10) || 0;
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
  const html = await fetchHtml(TEAM_PAGE_URL);
  const $ = cheerio.load(html);

  const teamMap: Record<string, { displayName: string; logoUrl: string }> = {};
  $("img.grbovi").each((_, el) => {
    const alt = $(el).attr("alt") ?? "";
    const src = $(el).attr("src") ?? "";
    if (alt && src) teamMap[alt.toUpperCase()] = { displayName: alt, logoUrl: src };
  });

  const findTeam = (rawName: string): { displayName: string; logoUrl: string } => {
    const upper = rawName.toUpperCase().trim();
    if (teamMap[upper]) return teamMap[upper];
    for (const [key, val] of Object.entries(teamMap)) {
      if (upper.includes(key) || key.includes(upper)) return val;
    }
    const firstWord = upper.split(" ")[0];
    if (firstWord) {
      for (const [key, val] of Object.entries(teamMap)) {
        if (key.startsWith(firstWord)) return val;
      }
    }
    return { displayName: rawName, logoUrl: "" };
  };

  // Scrape TV channel from najava-kola
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

  const matchBlocks = $(".prev-next-match");
  if (matchBlocks.length === 0) throw new Error("No match blocks found");

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

  matchBlocks.each((_, block) => {
    const label = $(block).find("span.theme-color-2.fw-8").first().text().trim();
    const isLast = label.toLowerCase().includes("prethodna");
    const type: "next" | "last" = isLast ? "last" : "next";

    const dateTimeText = $(block).find(".match-date").text().trim();
    const spaceIdx = dateTimeText.indexOf(" ");
    const datePart = spaceIdx > -1 ? dateTimeText.slice(0, spaceIdx) : dateTimeText;
    const timePart = spaceIdx > -1 ? dateTimeText.slice(spaceIdx + 1) : "";

    const homeRaw = $(block).find(".match-home").text().trim();
    const awayRaw = $(block).find(".match-away").text().trim();
    if (!homeRaw || !awayRaw) return;

    const homeTeam = findTeam(homeRaw);
    const awayTeam = findTeam(awayRaw);

    let homeScore: number | undefined;
    let awayScore: number | undefined;

    if (isLast) {
      const resultEls = $(block).find(".match-result");
      if (resultEls.length >= 2) {
        const hs = parseInt($(resultEls[0]).text().trim(), 10);
        const as_ = parseInt($(resultEls[1]).text().trim(), 10);
        if (!isNaN(hs)) homeScore = hs;
        if (!isNaN(as_)) awayScore = as_;
      }
    }

    matches.push({
      type,
      home: homeTeam.displayName,
      away: awayTeam.displayName,
      homeLogoUrl: homeTeam.logoUrl,
      awayLogoUrl: awayTeam.logoUrl,
      homeScore,
      awayScore,
      date: datePart,
      time: timePart,
      stadium: findStadium(homeTeam.displayName),
      competition: "Mozzart Bet Superliga",
      status: isLast ? "Završeno" : undefined,
      tvChannel: !isLast ? ourTvChannel || undefined : undefined,
      tvChannelLogoUrl: !isLast ? ourTvLogoUrl || undefined : undefined,
    });
  });

  if (matches.length === 0) throw new Error("No match data found");

  await db.match.deleteMany();
  for (const m of matches) {
    await db.match.create({ data: m });
  }

  return { matches: matches.length };
}

export async function scrapeRoundPreview(): Promise<{ roundNumber: number; matches: number }> {
  const html = await fetchHtml(NAJAVA_KOLA_URL);
  const $ = cheerio.load(html);

  const subtitle = $(".subtitle").text();
  const roundMatch = subtitle.match(/Kolo:\s*(\d+)/i);
  const roundNumber = roundMatch ? parseInt(roundMatch[1], 10) : 0;
  if (roundNumber === 0) throw new Error("Round number not found");

  const roundMatches: Prisma.RoundMatchCreateManyInput[] = [];

  $(".najava-box").each((_, box) => {
    const boxEl = $(box);
    const dateTimeEl = boxEl.find(".najava-time");
    const dateTimeParts = dateTimeEl.text().trim().split(/\s+/);
    const date = dateTimeParts[0] ?? "";
    const time = dateTimeParts[1] ?? "";

    const teamsText = boxEl.find(".najava-timovi").text().trim();
    const teamParts = teamsText.split(/\s*-\s*/);
    const home = (teamParts[0] ?? "").trim();
    const away = (teamParts[1] ?? "").trim();

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

    let reportUrl = "";
    const reportLink = boxEl.find("a.izvestaj-link, a.button");
    if (reportLink.length > 0) {
      const href = reportLink.first().attr("href") ?? "";
      reportUrl = href.startsWith("http") ? href : href ? `https://www.superliga.rs${href}` : "";
    }

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
  });

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

  let h2hTotalPlayed = 0, h2hHomeWins = 0, h2hDraws = 0,
    h2hAwayWins = 0, h2hHomeGoals = 0, h2hAwayGoals = 0;

  const h2hDiv = $(".h2h");
  const h2hCols = h2hDiv.children();
  h2hCols.each((_, col) => {
    const spans = $(col).find("span");
    const text = spans.map((__, s) => $(s).text().trim()).get();

    if ($(col).hasClass("h2h-total")) {
      spans.each((___, s) => {
        const val = parseInt($(s).text().trim(), 10);
        if (!isNaN(val) && val > 10) h2hTotalPlayed = val;
      });
    }

    if (text.includes("Uk. pobeda") && $(col).prev().find("span").length > 0) {
      const nums = $(col).prev().find("span")
        .map((___, s) => parseInt($(s).text().trim(), 10))
        .get()
        .filter((n: number) => !isNaN(n));
      if (nums.length >= 3) { h2hHomeWins = nums[0]; h2hDraws = nums[1]; h2hHomeGoals = nums[2]; }
    }

    if (text.includes("Uk. pobeda") && $(col).next().find("span").length > 0) {
      const nums = $(col).next().find("span")
        .map((___, s) => parseInt($(s).text().trim(), 10))
        .get()
        .filter((n: number) => !isNaN(n));
      if (nums.length >= 3) { h2hAwayWins = nums[0]; h2hDraws = nums[1]; h2hAwayGoals = nums[2]; }
    }
  });

  const previousMatches: Array<{ date: string; homeTeam: string; awayTeam: string; score: string }> = [];
  $(".previous-match").each((_, el) => {
    const date = $(el).find(".h2h-date").text().trim();
    const teamNames = $(el).find(".h2h-team-name span");
    const homeTeam = teamNames.eq(0).text().trim();
    const awayTeam = teamNames.eq(1).text().trim();
    const score = $(el).find(".h2h-result span").text().trim();
    if (date && homeTeam && awayTeam && score) previousMatches.push({ date, homeTeam, awayTeam, score });
  });

  const teamStats: Array<{ label: string; homeValue: string; awayValue: string }> = [];
  $("#tab-02 .stat-box").each((_, el) => {
    const spans = $(el).find(".stat-number span");
    const label = $(el).find(".stat-details span").text().trim();
    const homeValue = spans.eq(0).text().trim();
    const awayValue = spans.eq(1).text().trim();
    if (label && homeValue && awayValue) teamStats.push({ label, homeValue, awayValue });
  });

  const parseForm = (sectionEl: ReturnType<typeof $>) => {
    const form: Array<{ date: string; result: string; score: string; teams: string }> = [];
    sectionEl.find(".d-flex.justify-content-start.align-items-center.mb-10").each((_, row) => {
      const date = $(row).find(".form-date").text().trim();
      const result = $(row).find(".form-color div").text().trim();
      const score = $(row).find(".form-result span").text().trim();
      const teams = $(row).find(".form-teams span").text().trim().replace(/\s+/g, " ");
      if (date && score) form.push({ date, result, score, teams });
    });
    return form;
  };

  const formSections = $("#tab-01 .col-lg-6.mb-20");
  const homeForm = formSections.eq(0).length ? parseForm(formSections.eq(0)) : [];
  const awayForm = formSections.eq(1).length ? parseForm(formSections.eq(1)) : [];

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

function determinePosition(rawText: string): string | null {
  const t = rawText.toLowerCase()
    .replace(/č/g, "c").replace(/ć/g, "c")
    .replace(/š/g, "s").replace(/ž/g, "z").replace(/đ/g, "dj");
  if (t.includes("golman")) return "Golman";
  if (t.includes("odbran") || t.includes("defanz")) return "Odbrana";
  if (t.includes("vezn")) return "Vezni red";
  if (t.includes("napad")) return "Napad";
  return null;
}

export async function scrapePlayers(): Promise<{ players: number }> {
  const html = await fetchHtml(TEAM_PAGE_URL);
  const $ = cheerio.load(html);

  const players: Array<{
    name: string;
    number: number;
    position: string;
    imageUrl: string;
    superligaUrl?: string;
    appearances?: number;
    minutes?: number;
    goals?: number;
    assists?: number;
    goalsConceded?: number;
    yellowCards?: number;
  }> = [];

  const seenNames = new Set<string>();

  $(".owl-carousel").each((_, carousel) => {
    const carouselEl = $(carousel);
    const playerLinks = carouselEl.find("a[href*='/sezona/igrac/']");
    if (playerLinks.length === 0) return;
    if (carouselEl.closest(".istaknuti-igraci").length > 0) return;

    const carouselRow = carouselEl.closest(".row");
    let position = "Nepoznato";

    let prevEl = carouselRow.prev();
    for (let i = 0; i < 5 && prevEl.length > 0; i++) {
      const h3 = prevEl.find(".team-stat-title h3.title, .team-stat-title h2.title");
      if (h3.length > 0) {
        position = determinePosition(h3.first().text().trim()) ?? "Nepoznato";
        break;
      }
      if (prevEl.find(".owl-carousel").length > 0) break;
      prevEl = prevEl.prev();
    }

    playerLinks.each((__, link) => {
      const numberText = $(link).find(".blog-name-left span").text().trim();
      const number = parseInt(numberText, 10) || 0;
      const img = $(link).find("img.img-fluid");
      const name = (img.attr("alt") ?? "").trim();

      if (!name || seenNames.has(name.toLowerCase())) return;
      seenNames.add(name.toLowerCase());

      let imageUrl = (img.attr("src") ?? "").trim();
      if (imageUrl && !imageUrl.startsWith("http")) imageUrl = `https://www.superliga.rs${imageUrl}`;

      const href = $(link).attr("href") ?? "";
      const superligaUrl = href.startsWith("http") ? href : href ? `https://www.superliga.rs${href}` : "";

      let appearances: number | undefined, minutes: number | undefined,
        goals: number | undefined, assists: number | undefined,
        goalsConceded: number | undefined, yellowCards: number | undefined;

      $(link).find(".d-flex.justify-content-between .p-1").each((___, statEl) => {
        const title = $(statEl).find("img").attr("title") ?? "";
        const val = parseInt($(statEl).find("span").text().trim(), 10) || 0;
        const t = title.toLowerCase();
        if (t.includes("nastupi")) appearances = val;
        else if (t.includes("minut")) minutes = val;
        else if (t.includes("pogod") || t.includes("pogoc")) goals = val;
        else if (t.includes("asist")) assists = val;
        else if (t.includes("primljen")) goalsConceded = val;
        else if (t.includes("žut") || t.includes("zut")) yellowCards = val;
      });

      players.push({ name, number, position, imageUrl, superligaUrl, appearances, minutes, goals, assists, goalsConceded, yellowCards });
    });
  });

  if (players.length === 0) throw new Error("No players found");

  // Upsert by name
  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    const existing = await db.player.findFirst({ where: { name: p.name } });
    if (existing) {
      await db.player.update({
        where: { id: existing.id },
        data: { ...p, sortOrder: existing.sortOrder, isActive: true },
      });
    } else {
      await db.player.create({
        data: { ...p, sortOrder: i, isActive: true },
      });
    }
  }

  return { players: players.length };
}
