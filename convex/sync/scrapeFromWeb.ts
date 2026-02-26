"use node";

import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { ConvexError } from "convex/values";
import * as cheerio from "cheerio";

const STANDINGS_URL =
  "https://www.superliga.rs/sezona/tabela-takmicenja/";
const NAJAVA_KOLA_URL =
  "https://www.superliga.rs/sezona/najava-kola/";
const LOGO_BASE =
  "https://www.superliga.rs/wp-content/themes/newweb-theme/images/grbovi/";
const ARENA_LOGO_BASE =
  "https://www.superliga.rs/wp-content/themes/newweb-theme/images/arena-prenosi/";

/**
 * Scrapes the current SuperLiga standings from superliga.rs
 * and saves them into the database.
 */
export const scrapeStandings = action({
  args: {},
  handler: async (ctx): Promise<{ standings: number }> => {
    // 1) Fetch the page
    const res = await fetch(STANDINGS_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; FKMladostBot/1.0; +https://fkmladost.rs)",
        Accept: "text/html",
      },
    });

    if (!res.ok) {
      throw new ConvexError({
        code: "EXTERNAL_SERVICE_ERROR",
        message: `Greška pri učitavanju sajta superliga.rs: ${res.status}`,
      });
    }

    const html = await res.text();

    // 2) Parse HTML
    const $ = cheerio.load(html);
    const rows = $("table.preliminarno tbody tr");

    if (rows.length === 0) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message:
          "Tabela nije pronađena na superliga.rs. Moguće da je struktura sajta promenjena.",
      });
    }

    const standings: {
      position: number;
      team: string;
      played: number;
      wins: number;
      draws: number;
      losses: number;
      goalsFor: number;
      goalsAgainst: number;
      goalDifference: string;
      points: number;
      logoUrl: string;
      form: string;
      isHighlighted: boolean;
    }[] = [];

    rows.each((_, row) => {
      const cells = $(row).find("td");
      if (cells.length < 12) return;

      // Position
      const position = parseInt($(cells[0]).text().trim(), 10);

      // Logo URL from <img> tag
      const imgEl = $(cells[2]).find("img");
      let logoUrl = "";
      if (imgEl.length > 0) {
        const src = imgEl.attr("src") ?? "";
        // Make absolute if relative
        logoUrl = src.startsWith("http") ? src : `${LOGO_BASE}${src}`;
      }

      // Team name
      const team = $(cells[3]).text().trim();

      // Stats columns (indices 4-11)
      const played = parseInt($(cells[4]).text().trim(), 10) || 0;
      const wins = parseInt($(cells[5]).text().trim(), 10) || 0;
      const draws = parseInt($(cells[6]).text().trim(), 10) || 0;
      const losses = parseInt($(cells[7]).text().trim(), 10) || 0;
      const goalsFor = parseInt($(cells[8]).text().trim(), 10) || 0;
      const goalsAgainst = parseInt($(cells[9]).text().trim(), 10) || 0;
      const goalDifference = $(cells[10]).text().trim();
      const points = parseInt($(cells[11]).text().trim(), 10) || 0;

      // Highlight FK Mladost rows
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
          form: "", // superliga.rs doesn't show form on the table
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

    // 3) Save to database
    await ctx.runMutation(internal.sync.saveData.saveStandings, {
      standings,
    });

    return { standings: standings.length };
  },
});

const TEAM_PAGE_URL = "https://www.superliga.rs/tim/mladost/";

/**
 * Maps home team name (uppercase) to their stadium.
 * Used to auto-fill the stadium field during match sync.
 */
const STADIUM_MAP: Record<string, string> = {
  "CRVENA ZVEZDA": "Stadion Rajko Mitić, Beograd",
  "ČUKARIČKI": "Stadion Čukarički, Beograd",
  "IMT": "Stadion IMT, Novi Beograd",
  "JAVOR MATIS": "Stadion kraj Moravice, Ivanjica",
  "MLADOST": "SRC MR Radoš Milovanović, Lučani",
  "NAPREDAK": "Stadion Mladost, Kruševac",
  "NOVI PAZAR": "Gradski stadion, Novi Pazar",
  "OFK BEOGRAD": "Stadion Omladinski, Beograd",
  "PARTIZAN": "Stadion Partizana, Beograd",
  "RADNIČKI 1923": "Stadion Čika Dača, Kragujevac",
  "RADNIČKI NIŠ": "Stadion Čair, Niš",
  "RADNIK": "Gradski stadion, Surdulica",
  "SPARTAK ŽK": "Gradski stadion, Subotica",
  "SPARTAK": "Gradski stadion, Subotica",
  "TSC": "Stadion TSC, Bačka Topola",
  "VOJVODINA": "Stadion Karađorđe, Novi Sad",
  "ŽELEZNIČAR": "Stadion Železničar, Pančevo",
};

/** Find stadium by home team name (flexible matching) */
function findStadium(teamName: string): string {
  const upper = teamName.toUpperCase().trim();
  if (STADIUM_MAP[upper]) return STADIUM_MAP[upper];
  for (const [key, val] of Object.entries(STADIUM_MAP)) {
    if (upper.includes(key) || key.includes(upper)) return val;
  }
  return "";
}

/**
 * Scrapes latest match data for FK Mladost from superliga.rs
 * – previous match (result) & next match (fixture), with team logos.
 * Also scrapes TV channel info from najava-kola page for the next match.
 */
export const scrapeMatches = action({
  args: {},
  handler: async (ctx): Promise<{ matches: number }> => {
    const res = await fetch(TEAM_PAGE_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; FKMladostBot/1.0; +https://fkmladost.rs)",
        Accept: "text/html",
      },
    });

    if (!res.ok) {
      throw new ConvexError({
        code: "EXTERNAL_SERVICE_ERROR",
        message: `Greška pri učitavanju stranice tima: ${res.status}`,
      });
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // 1) Build team name -> logo map from header badges
    const teamMap: Record<
      string,
      { displayName: string; logoUrl: string }
    > = {};
    $("img.grbovi").each((_, el) => {
      const alt = $(el).attr("alt") ?? "";
      const src = $(el).attr("src") ?? "";
      if (alt && src) {
        teamMap[alt.toUpperCase()] = { displayName: alt, logoUrl: src };
      }
    });

    // Flexible lookup: exact, then contains, then first-word prefix
    const findTeam = (
      rawName: string,
    ): { displayName: string; logoUrl: string } => {
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

    // 2) Parse the two ".prev-next-match" blocks
    const matchBlocks = $(".prev-next-match");

    if (matchBlocks.length === 0) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message:
          "Nisu pronađeni podaci o mečevima za FK Mladost na superliga.rs",
      });
    }

    // 2b) Scrape TV channel info from najava-kola for Mladost match
    let ourTvChannel = "";
    let ourTvLogoUrl = "";
    try {
      const naRes = await fetch(NAJAVA_KOLA_URL, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; FKMladostBot/1.0; +https://fkmladost.rs)",
          Accept: "text/html",
        },
      });
      if (naRes.ok) {
        const naHtml = await naRes.text();
        const n$ = cheerio.load(naHtml);
        n$(".najava-box").each((_, box) => {
          const teams = n$(box).find(".najava-timovi").text().trim().toUpperCase();
          if (teams.includes("MLADOST")) {
            const tvImg = n$(box).find("img[alt*='Arena']");
            if (tvImg.length > 0) {
              const src = tvImg.attr("src") ?? "";
              ourTvLogoUrl = src.startsWith("http") ? src : `https://www.superliga.rs${src}`;
              // Extract channel name from filename (e.g., A1P.png -> Arena Sport 1)
              const filename = src.split("/").pop() ?? "";
              const chMatch = filename.match(/A(\d+)/);
              ourTvChannel = chMatch ? `Arena Sport ${chMatch[1]}` : "Arena Sport";
            }
          }
        });
      }
    } catch {
      // TV channel is optional, don't fail if it can't be scraped
    }

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
      const label = $(block)
        .find("span.theme-color-2.fw-8")
        .first()
        .text()
        .trim();
      const isLast = label.toLowerCase().includes("prethodna");
      const type: "next" | "last" = isLast ? "last" : "next";

      // Date & time (format: "23.02.2026 16:00")
      const dateTimeText = $(block).find(".match-date").text().trim();
      const spaceIdx = dateTimeText.indexOf(" ");
      const datePart =
        spaceIdx > -1 ? dateTimeText.slice(0, spaceIdx) : dateTimeText;
      const timePart = spaceIdx > -1 ? dateTimeText.slice(spaceIdx + 1) : "";

      // Teams (uppercase on the site)
      const homeRaw = $(block).find(".match-home").text().trim();
      const awayRaw = $(block).find(".match-away").text().trim();
      if (!homeRaw || !awayRaw) return;

      const homeTeam = findTeam(homeRaw);
      const awayTeam = findTeam(awayRaw);

      // Scores – only present for played matches (class .match-result)
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
        // Add TV channel only for the next match
        tvChannel: !isLast ? ourTvChannel || undefined : undefined,
        tvChannelLogoUrl: !isLast ? ourTvLogoUrl || undefined : undefined,
      });
    });

    if (matches.length === 0) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Nisu pronađeni podaci o mečevima na superliga.rs",
      });
    }

    // 3) Save to database (replaces existing match records)
    await ctx.runMutation(internal.sync.saveData.saveMatches, { matches });

    return { matches: matches.length };
  },
});

/**
 * Scrapes the full "Najava kola" (round preview) page from superliga.rs.
 * Gets all matches for the upcoming round with date, time, teams, stadium,
 * TV channel, referees, and officials.
 */
export const scrapeRoundPreview = action({
  args: {},
  handler: async (ctx): Promise<{ roundNumber: number; matches: number }> => {
    const res = await fetch(NAJAVA_KOLA_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; FKMladostBot/1.0; +https://fkmladost.rs)",
        Accept: "text/html",
      },
    });

    if (!res.ok) {
      throw new ConvexError({
        code: "EXTERNAL_SERVICE_ERROR",
        message: `Greška pri učitavanju najave kola: ${res.status}`,
      });
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Extract round number from subtitle (e.g., "Kolo: 25")
    const subtitle = $(".subtitle").text();
    const roundMatch = subtitle.match(/Kolo:\s*(\d+)/i);
    const roundNumber = roundMatch ? parseInt(roundMatch[1], 10) : 0;

    if (roundNumber === 0) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Nije pronađen broj kola na superliga.rs",
      });
    }

    const roundMatches: Array<{
      roundNumber: number;
      date: string;
      time: string;
      home: string;
      away: string;
      stadium: string;
      tvChannel: string;
      tvChannelLogoUrl: string;
      referee: string;
      assistantRef1: string;
      assistantRef2: string;
      fourthOfficial: string;
      delegate: string;
      refInspector: string;
      varRef: string;
      avarRef: string;
      reportUrl: string;
      isOurMatch: boolean;
    }> = [];

    $(".najava-box").each((_, box) => {
      const boxEl = $(box);

      // Date & time
      const dateTimeEl = boxEl.find(".najava-time");
      const dateTimeParts = dateTimeEl.text().trim().split(/\s+/);
      const date = dateTimeParts[0] ?? "";
      const time = dateTimeParts[1] ?? "";

      // Teams
      const teamsText = boxEl.find(".najava-timovi").text().trim();
      const teamParts = teamsText.split(/\s*-\s*/);
      const home = (teamParts[0] ?? "").trim();
      const away = (teamParts[1] ?? "").trim();

      // Stadium
      const stadium = boxEl.find(".text-muted.uppercase").first().text().trim();

      // TV channel from Arena Sport image
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

      // Referees - parse from .refs divs
      const refDivs = boxEl.find(".refs");
      let referee = "";
      let assistantRef1 = "";
      let assistantRef2 = "";
      let fourthOfficial = "";
      let delegate = "";
      let refInspector = "";
      let varRef = "";
      let avarRef = "";

      refDivs.each((_, refDiv) => {
        const refHtml = $(refDiv).html() ?? "";
        const lines = refHtml.split("<br>").map((l) =>
          l.replace(/<[^>]*>/g, "").trim()
        );

        for (const line of lines) {
          if (line.startsWith("Glavni sudija:")) {
            referee = line.replace("Glavni sudija:", "").trim();
          } else if (line.startsWith("1. pomoćni sudija:")) {
            assistantRef1 = line.replace("1. pomoćni sudija:", "").trim();
          } else if (line.startsWith("2. pomoćni sudija:")) {
            assistantRef2 = line.replace("2. pomoćni sudija:", "").trim();
          } else if (line.startsWith("Četvrti sudija:")) {
            fourthOfficial = line.replace("Četvrti sudija:", "").trim();
          } else if (line.startsWith("Delegat:")) {
            delegate = line.replace("Delegat:", "").trim();
          } else if (line.startsWith("Kontrolor suđenja:")) {
            refInspector = line.replace("Kontrolor suđenja:", "").trim();
          } else if (line.startsWith("VAR:")) {
            varRef = line.replace("VAR:", "").trim();
          } else if (line.startsWith("AVAR:")) {
            avarRef = line.replace("AVAR:", "").trim();
          }
        }
      });

      // Report link
      let reportUrl = "";
      const reportLink = boxEl.find("a.izvestaj-link, a.button");
      if (reportLink.length > 0) {
        const href = reportLink.first().attr("href") ?? "";
        reportUrl = href.startsWith("http") ? href : href ? `https://www.superliga.rs${href}` : "";
      }

      // Flag our team
      const isOurMatch =
        home.toUpperCase().includes("MLADOST") ||
        away.toUpperCase().includes("MLADOST");

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

    if (roundMatches.length === 0) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Nisu pronađene utakmice u najavi kola",
      });
    }

    await ctx.runMutation(internal.sync.saveData.saveRoundMatches, {
      roundMatches,
    });

    return { roundNumber, matches: roundMatches.length };
  },
});

/**
 * Position name mapping from superliga.rs section headers
 * to our internal position values.
 */
const POSITION_MAP: Record<string, string> = {
  golmani: "Golman",
  odbrana: "Odbrana",
  defanzivci: "Odbrana",
  "vezni igrači": "Vezni red",
  vezni: "Vezni red",
  "napadači": "Napad",
  napad: "Napad",
};

const NO_PLAYER_IMG_MARKER = "no-player-img";

/**
 * Scrapes first-team player data for FK Mladost from superliga.rs.
 * Extracts name, jersey number, position and photo for each player.
 * Uses upsert logic: updates existing players by name, inserts new ones.
 */
export const scrapePlayers = action({
  args: {},
  handler: async (ctx): Promise<{ players: number }> => {
    const res = await fetch(TEAM_PAGE_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; FKMladostBot/1.0; +https://fkmladost.rs)",
        Accept: "text/html",
      },
    });

    if (!res.ok) {
      throw new ConvexError({
        code: "EXTERNAL_SERVICE_ERROR",
        message: `Greška pri učitavanju stranice tima: ${res.status}`,
      });
    }

    const html = await res.text();
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

    // Each position group has a .team-stat-title with <h3> followed by
    // a sibling .row containing an .owl-carousel with player cards.
    $(".team-stat-title").each((_, el) => {
      const h3 = $(el).find("h3.title");
      if (h3.length === 0) return;

      const headerText = h3.text().trim().toLowerCase();
      const position = POSITION_MAP[headerText];
      if (!position) return; // skip non-position headers

      // Carousel is in the next .row sibling
      const titleRow = $(el).closest(".row");
      const carouselRow = titleRow.next();
      const carousel = carouselRow.find(".owl-carousel");
      if (carousel.length === 0) return;

      carousel.find("a[href*='/sezona/igrac/']").each((_, link) => {
        // Jersey number
        const numberText = $(link)
          .find(".blog-name-left span")
          .text()
          .trim();
        const number = parseInt(numberText, 10) || 0;

        // Name from <img alt="...">
        const img = $(link).find("img.img-fluid");
        const name = (img.attr("alt") ?? "").trim();
        let imageUrl = (img.attr("src") ?? "").trim();

        // Make URL absolute if relative
        if (imageUrl && !imageUrl.startsWith("http")) {
          imageUrl = `https://www.superliga.rs${imageUrl}`;
        }

        // Player profile URL
        const href = $(link).attr("href") ?? "";
        const superligaUrl = href.startsWith("http")
          ? href
          : href
            ? `https://www.superliga.rs${href}`
            : "";

        // Stats from the carousel card (appearances, minutes, goals/assists)
        let appearances: number | undefined;
        let minutes: number | undefined;
        let goals: number | undefined;
        let assists: number | undefined;
        let goalsConceded: number | undefined;
        let yellowCards: number | undefined;

        $(link)
          .find(".d-flex.justify-content-between .p-1")
          .each((__, statEl) => {
            const title = $(statEl).find("img").attr("title") ?? "";
            const val =
              parseInt($(statEl).find("span").text().trim(), 10) || 0;
            const t = title.toLowerCase();
            if (t.includes("nastupi")) appearances = val;
            else if (t.includes("minut")) minutes = val;
            else if (t.includes("pogod") || t.includes("pogoc"))
              goals = val;
            else if (t.includes("asist")) assists = val;
            else if (t.includes("primljen")) goalsConceded = val;
            else if (t.includes("žut") || t.includes("zut"))
              yellowCards = val;
          });

        if (name) {
          players.push({
            name,
            number,
            position,
            imageUrl,
            superligaUrl,
            appearances,
            minutes,
            goals,
            assists,
            goalsConceded,
            yellowCards,
          });
        }
      });
    });

    if (players.length === 0) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message:
          "Nisu pronađeni podaci o igračima na superliga.rs",
      });
    }

    // Upsert into database
    await ctx.runMutation(internal.sync.saveData.savePlayers, { players });

    return { players: players.length };
  },
});
