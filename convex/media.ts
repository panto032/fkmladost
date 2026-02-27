import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/** Public: get published images */
export const getPublishedImages = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db
      .query("mediaItems")
      .withIndex("by_type_and_published", (q) =>
        q.eq("type", "image").eq("published", true),
      )
      .collect();
    items.sort((a, b) => a.sortOrder - b.sortOrder);

    return Promise.all(
      items.map(async (item) => {
        const imageUrl = item.imageStorageId
          ? await ctx.storage.getUrl(item.imageStorageId)
          : null;
        return { ...item, imageUrl };
      }),
    );
  },
});

/** Public: get published videos */
export const getPublishedVideos = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db
      .query("mediaItems")
      .withIndex("by_type_and_published", (q) =>
        q.eq("type", "video").eq("published", true),
      )
      .collect();
    items.sort((a, b) => a.sortOrder - b.sortOrder);
    return items;
  },
});

/** Public: get all unique categories for published items */
export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("mediaItems").collect();
    const published = items.filter((i) => i.published);
    const cats = new Set(published.map((i) => i.category));
    return Array.from(cats).sort();
  },
});

/** Generate upload URL for image storage */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
