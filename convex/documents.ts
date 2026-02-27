import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/** Public: get all published documents ordered by sortOrder */
export const getPublished = query({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db
      .query("documents")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    // Sort by sortOrder ascending
    docs.sort((a, b) => a.sortOrder - b.sortOrder);

    return Promise.all(
      docs.map(async (doc) => {
        const fileUrl = await ctx.storage.getUrl(doc.fileStorageId);
        return { ...doc, fileUrl };
      }),
    );
  },
});

/** Generate upload URL for file storage */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
