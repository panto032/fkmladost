import { query } from "./_generated/server";

export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    // Return the single analytics row (replaced on each sync)
    return await ctx.db.query("matchAnalytics").first();
  },
});
