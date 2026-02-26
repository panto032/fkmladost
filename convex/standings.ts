import { query } from "./_generated/server";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("standings")
      .withIndex("by_position")
      .order("asc")
      .collect();
  },
});
