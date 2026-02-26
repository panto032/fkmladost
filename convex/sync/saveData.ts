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
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Delete existing matches
    const existing = await ctx.db.query("matches").collect();
    for (const row of existing) {
      await ctx.db.delete(row._id);
    }
    // Insert new matches
    for (const match of args.matches) {
      await ctx.db.insert("matches", match);
    }
  },
});
