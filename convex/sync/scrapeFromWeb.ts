"use node";

import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { ConvexError } from "convex/values";
import * as cheerio from "cheerio";

const STANDINGS_URL =
  "https://www.superliga.rs/sezona/tabela-takmicenja/";
const LOGO_BASE =
  "https://www.superliga.rs/wp-content/themes/newweb-theme/images/grbovi/";

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
 * Scrapes latest match data for FK Mladost from superliga.rs
 * – previous match (result) & next match (fixture), with team logos.
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
        stadium: "",
        competition: "Mozzart Bet Superliga",
        status: isLast ? "Završeno" : undefined,
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
