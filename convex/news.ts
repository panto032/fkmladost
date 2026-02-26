import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getPublished = query({
  args: {},
  handler: async (ctx) => {
    const articles = await ctx.db
      .query("news")
      .withIndex("by_published_and_sort_date", (q) => q.eq("published", true))
      .order("desc")
      .collect();
    return Promise.all(
      articles.map(async (article) => {
        const resolvedImageUrl = article.imageStorageId
          ? await ctx.storage.getUrl(article.imageStorageId)
          : null;
        return {
          ...article,
          resolvedImageUrl: resolvedImageUrl || article.imageUrl,
        };
      }),
    );
  },
});

export const getLatest = query({
  args: {},
  handler: async (ctx) => {
    const articles = await ctx.db
      .query("news")
      .withIndex("by_published_and_sort_date", (q) => q.eq("published", true))
      .order("desc")
      .take(3);
    return Promise.all(
      articles.map(async (article) => {
        const resolvedImageUrl = article.imageStorageId
          ? await ctx.storage.getUrl(article.imageStorageId)
          : null;
        return {
          ...article,
          resolvedImageUrl: resolvedImageUrl || article.imageUrl,
        };
      }),
    );
  },
});

export const getById = query({
  args: { id: v.id("news") },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.id);
    if (!article) return null;
    const resolvedImageUrl = article.imageStorageId
      ? await ctx.storage.getUrl(article.imageStorageId)
      : null;
    return {
      ...article,
      resolvedImageUrl: resolvedImageUrl || article.imageUrl,
    };
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
