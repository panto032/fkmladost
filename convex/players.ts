import { query } from "./_generated/server";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("players")
      .withIndex("by_active_and_sort", (q) => q.eq("isActive", true))
      .order("asc")
      .collect();
  },
});
