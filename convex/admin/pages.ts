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
    return await ctx.db.query("pages").order("desc").collect();
  },
});

export const create = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    content: v.string(),
    published: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    // Check for duplicate slug
    const existing = await ctx.db
      .query("pages")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (existing) {
      throw new ConvexError({ code: "CONFLICT", message: "Stranica sa ovim slug-om već postoji" });
    }
    return await ctx.db.insert("pages", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("pages"),
    slug: v.string(),
    title: v.string(),
    content: v.string(),
    published: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...data } = args;
    await ctx.db.patch(id, data);
  },
});

export const remove = mutation({
  args: { id: v.id("pages") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});
