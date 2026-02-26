import { query } from "./_generated/server";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("partners")
      .withIndex("by_sort_order")
      .order("asc")
      .collect();
  },
});
