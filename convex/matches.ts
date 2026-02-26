import { query } from "./_generated/server";
import { v } from "convex/values";

export const getByType = query({
  args: { type: v.union(v.literal("next"), v.literal("last")) },
  handler: async (ctx, args) => {
    const match = await ctx.db
      .query("matches")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .order("desc")
      .first();
    return match;
  },
});
