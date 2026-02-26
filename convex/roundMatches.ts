import { query, internalQuery } from "./_generated/server";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("roundMatches").withIndex("by_round").order("asc").collect();
  },
});

/** Internal query used by the analytics scraper to find the Mladost reportUrl */
export const getAllInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("roundMatches").withIndex("by_round").order("asc").collect();
  },
});
