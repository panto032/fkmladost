import { v, ConvexError } from "convex/values";
import { mutation, query } from "../_generated/server";

async function requireAdmin(ctx: { auth: { getUserIdentity: () => Promise<{ tokenIdentifier: string } | null> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({ code: "UNAUTHENTICATED", message: "Niste prijavljeni" });
  }
  return identity;
}

/* ── Pioneer Standings ── */

export const getStandings = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pioneerStandings").withIndex("by_position").order("asc").collect();
  },
});

export const createStanding = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("pioneerStandings", args);
  },
});

export const updateStanding = mutation({
  args: {
    id: v.id("pioneerStandings"),
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
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...data } = args;
    await ctx.db.patch(id, data);
  },
});

export const removeStanding = mutation({
  args: { id: v.id("pioneerStandings") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

/* ── Pioneer Matches ── */

export const getMatches = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pioneerMatches").withIndex("by_round").order("asc").collect();
  },
});

export const createMatch = mutation({
  args: {
    round: v.number(),
    date: v.string(),
    home: v.string(),
    away: v.string(),
    score: v.optional(v.string()),
    city: v.optional(v.string()),
    isHome: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("pioneerMatches", args);
  },
});

export const updateMatch = mutation({
  args: {
    id: v.id("pioneerMatches"),
    round: v.number(),
    date: v.string(),
    home: v.string(),
    away: v.string(),
    score: v.optional(v.string()),
    city: v.optional(v.string()),
    isHome: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...data } = args;
    await ctx.db.patch(id, data);
  },
});

export const removeMatch = mutation({
  args: { id: v.id("pioneerMatches") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

/* ── Seed / Sync all pioneer league data at once ── */

export const seedPioneerLeague = mutation({
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
  handler: async (ctx, args): Promise<{ standings: number; matches: number }> => {
    await requireAdmin(ctx);

    // Clear existing data
    const oldStandings = await ctx.db.query("pioneerStandings").collect();
    for (const row of oldStandings) await ctx.db.delete(row._id);

    const oldMatches = await ctx.db.query("pioneerMatches").collect();
    for (const row of oldMatches) await ctx.db.delete(row._id);

    // Insert new data
    for (const row of args.standings) await ctx.db.insert("pioneerStandings", row);
    for (const row of args.matches) await ctx.db.insert("pioneerMatches", row);

    return {
      standings: args.standings.length,
      matches: args.matches.length,
    };
  },
});
