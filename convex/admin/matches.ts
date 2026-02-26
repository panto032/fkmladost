import { v, ConvexError } from "convex/values";
import { mutation, query } from "../_generated/server";

async function requireAdmin(ctx: { auth: { getUserIdentity: () => Promise<{ tokenIdentifier: string } | null> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({ code: "UNAUTHENTICATED", message: "Niste prijavljeni" });
  }
  return identity;
}

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("matches").order("desc").collect();
  },
});

export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("matches", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("matches"),
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
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...data } = args;
    await ctx.db.patch(id, data);
  },
});

export const remove = mutation({
  args: { id: v.id("matches") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});
