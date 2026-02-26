import { query } from "./_generated/server";

export const getPublished = query({
  args: {},
  handler: async (ctx) => {
    const articles = await ctx.db
      .query("news")
      .withIndex("by_published", (q) => q.eq("published", true))
      .order("desc")
      .collect();
    return articles;
  },
});

export const getLatest = query({
  args: {},
  handler: async (ctx) => {
    const articles = await ctx.db
      .query("news")
      .withIndex("by_published", (q) => q.eq("published", true))
      .order("desc")
      .take(3);
    return articles;
  },
});
