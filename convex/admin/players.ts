import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

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
    return await ctx.db
      .query("players")
      .withIndex("by_sort_order")
      .order("asc")
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    number: v.number(),
    position: v.string(),
    imageUrl: v.string(),
    nationality: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    sortOrder: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("players", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("players"),
    name: v.string(),
    number: v.number(),
    position: v.string(),
    imageUrl: v.string(),
    nationality: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    sortOrder: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...data } = args;
    await ctx.db.patch(id, data);
  },
});

export const remove = mutation({
  args: { id: v.id("players") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});
