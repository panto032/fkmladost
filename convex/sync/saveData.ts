import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const saveStandings = internalMutation({
  args: {
    standings: v.array(
      v.object({
        position: v.number(),
        team: v.string(),
        played: v.number(),
        wins: v.number(),
        draws: v.number(),
        losses: v.number(),
        goalsFor: v.number(),
        goalsAgainst: v.number(),
        goalDifference: v.string(),
        points: v.number(),
        logoUrl: v.string(),
        form: v.string(),
        isHighlighted: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Delete all existing standings
    const existing = await ctx.db.query("standings").collect();
    for (const row of existing) {
      await ctx.db.delete(row._id);
    }
    // Insert new standings
    for (const row of args.standings) {
      await ctx.db.insert("standings", row);
    }
  },
});

export const saveMatches = internalMutation({
  args: {
    matches: v.array(
      v.object({
        type: v.union(v.literal("next"), v.literal("last")),
        home: v.string(),
        away: v.string(),
        homeLogoUrl: v.string(),
        awayLogoUrl: v.string(),
        homeScore: v.optional(v.number()),
        awayScore: v.optional(v.number()),
        date: v.string(),
        time: v.string(),
        stadium: v.string(),
        competition: v.string(),
        status: v.optional(v.string()),
        tvChannel: v.optional(v.string()),
        tvChannelLogoUrl: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("matches").collect();
    for (const row of existing) {
      await ctx.db.delete(row._id);
    }
    for (const match of args.matches) {
      await ctx.db.insert("matches", match);
    }
  },
});

export const saveRoundMatches = internalMutation({
  args: {
    roundMatches: v.array(
      v.object({
        roundNumber: v.number(),
        date: v.string(),
        time: v.string(),
        home: v.string(),
        away: v.string(),
        stadium: v.string(),
        tvChannel: v.string(),
        tvChannelLogoUrl: v.string(),
        referee: v.string(),
        assistantRef1: v.string(),
        assistantRef2: v.string(),
        fourthOfficial: v.string(),
        delegate: v.string(),
        refInspector: v.string(),
        varRef: v.string(),
        avarRef: v.string(),
        reportUrl: v.string(),
        isOurMatch: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Delete all existing round matches
    const existing = await ctx.db.query("roundMatches").collect();
    for (const row of existing) {
      await ctx.db.delete(row._id);
    }
    // Insert new round matches
    for (const match of args.roundMatches) {
      await ctx.db.insert("roundMatches", match);
    }
  },
});

const NO_PLAYER_IMG = "no-player-img";

/**
 * Upsert players scraped from superliga.rs:
 * – If a player with the same name exists, update number/position/imageUrl
 * – If not, insert a new player record
 * – Never deletes existing players (manual additions are preserved)
 */
export const savePlayers = internalMutation({
  args: {
    players: v.array(
      v.object({
        name: v.string(),
        number: v.number(),
        position: v.string(),
        imageUrl: v.string(),
        superligaUrl: v.optional(v.string()),
        appearances: v.optional(v.number()),
        minutes: v.optional(v.number()),
        goals: v.optional(v.number()),
        assists: v.optional(v.number()),
        goalsConceded: v.optional(v.number()),
        yellowCards: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("players").collect();
    const existingByName = new Map(
      existing.map((p) => [p.name.toLowerCase(), p]),
    );

    let nextSortOrder = existing.length;

    for (const scraped of args.players) {
      const match = existingByName.get(scraped.name.toLowerCase());

      // Optional stat fields to save
      const statFields = {
        ...(scraped.superligaUrl !== undefined
          ? { superligaUrl: scraped.superligaUrl }
          : {}),
        ...(scraped.appearances !== undefined
          ? { appearances: scraped.appearances }
          : {}),
        ...(scraped.minutes !== undefined ? { minutes: scraped.minutes } : {}),
        ...(scraped.goals !== undefined ? { goals: scraped.goals } : {}),
        ...(scraped.assists !== undefined ? { assists: scraped.assists } : {}),
        ...(scraped.goalsConceded !== undefined
          ? { goalsConceded: scraped.goalsConceded }
          : {}),
        ...(scraped.yellowCards !== undefined
          ? { yellowCards: scraped.yellowCards }
          : {}),
      };

      if (match) {
        // Always overwrite with scraped data
        await ctx.db.patch(match._id, {
          number: scraped.number,
          position: scraped.position,
          imageUrl: scraped.imageUrl,
          ...statFields,
        });
      } else {
        // Insert new player
        nextSortOrder++;
        await ctx.db.insert("players", {
          name: scraped.name,
          number: scraped.number,
          position: scraped.position,
          imageUrl: scraped.imageUrl,
          sortOrder: nextSortOrder,
          isActive: true,
          ...statFields,
        });
      }
    }
  },
});
