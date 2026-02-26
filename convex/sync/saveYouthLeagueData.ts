import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Replace all youthStandings rows with fresh scraped data.
 */
export const saveStandings = internalMutation({
  args: {
    standings: v.array(
      v.object({
        position: v.number(),
        club: v.string(),
        played: v.number(),
        won: v.number(),
        drawn: v.number(),
        lost: v.number(),
        goalsFor: v.number(),
        goalsAgainst: v.number(),
        goalDiff: v.number(),
        points: v.number(),
        isHighlighted: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("youthStandings").collect();
    for (const row of existing) {
      await ctx.db.delete(row._id);
    }
    for (const row of args.standings) {
      await ctx.db.insert("youthStandings", row);
    }
  },
});

/**
 * Replace all youthMatches rows with fresh scraped data.
 */
export const saveMatches = internalMutation({
  args: {
    matches: v.array(
      v.object({
        round: v.number(),
        date: v.string(),
        home: v.string(),
        away: v.string(),
        score: v.optional(v.string()),
        city: v.optional(v.string()),
        isHome: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("youthMatches").collect();
    for (const row of existing) {
      await ctx.db.delete(row._id);
    }
    for (const row of args.matches) {
      await ctx.db.insert("youthMatches", row);
    }
  },
});
