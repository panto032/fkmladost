import { v, ConvexError } from "convex/values";
import { mutation, query } from "../_generated/server";

async function requireAdmin(ctx: { auth: { getUserIdentity: () => Promise<{ tokenIdentifier: string } | null> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({ code: "UNAUTHENTICATED", message: "Niste prijavljeni" });
  }
  return identity;
}

/* ── Youth Standings ── */

export const getStandings = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("youthStandings").withIndex("by_position").order("asc").collect();
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
    return await ctx.db.insert("youthStandings", args);
  },
});

export const updateStanding = mutation({
  args: {
    id: v.id("youthStandings"),
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
  args: { id: v.id("youthStandings") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

/* ── Youth Matches ── */

export const getMatches = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("youthMatches").withIndex("by_round").order("asc").collect();
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
    return await ctx.db.insert("youthMatches", args);
  },
});

export const updateMatch = mutation({
  args: {
    id: v.id("youthMatches"),
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
  args: { id: v.id("youthMatches") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

/* ── Youth Scorers ── */

export const getScorers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("youthScorers").withIndex("by_rank").order("asc").collect();
  },
});

export const createScorer = mutation({
  args: {
    rank: v.number(),
    name: v.string(),
    club: v.string(),
    goals: v.string(),
    isHighlighted: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("youthScorers", args);
  },
});

export const updateScorer = mutation({
  args: {
    id: v.id("youthScorers"),
    rank: v.number(),
    name: v.string(),
    club: v.string(),
    goals: v.string(),
    isHighlighted: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...data } = args;
    await ctx.db.patch(id, data);
  },
});

export const removeScorer = mutation({
  args: { id: v.id("youthScorers") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});
