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
