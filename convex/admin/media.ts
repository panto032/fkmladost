import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

/** Admin: get all media items */
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: "Niste prijavljeni", code: "UNAUTHENTICATED" });
    }
    const items = await ctx.db.query("mediaItems").collect();
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

/** Admin: create media item */
export const create = mutation({
  args: {
    type: v.union(v.literal("image"), v.literal("video")),
    title: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    youtubeUrl: v.optional(v.string()),
    youtubeVideoId: v.optional(v.string()),
    published: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: "Niste prijavljeni", code: "UNAUTHENTICATED" });
    }

    const existing = await ctx.db.query("mediaItems").collect();
    const maxSort = existing.length > 0
      ? Math.max(...existing.map((d) => d.sortOrder))
      : 0;

    return await ctx.db.insert("mediaItems", {
      ...args,
      sortOrder: maxSort + 1,
    });
  },
});

/** Admin: update media item */
export const update = mutation({
  args: {
    id: v.id("mediaItems"),
    title: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    youtubeUrl: v.optional(v.string()),
    youtubeVideoId: v.optional(v.string()),
    published: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: "Niste prijavljeni", code: "UNAUTHENTICATED" });
    }

    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new ConvexError({ message: "Stavka nije pronađena", code: "NOT_FOUND" });
    }

    await ctx.db.patch(id, updates);
  },
});

/** Admin: remove media item */
export const remove = mutation({
  args: { id: v.id("mediaItems") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: "Niste prijavljeni", code: "UNAUTHENTICATED" });
    }

    const item = await ctx.db.get(args.id);
    if (!item) {
      throw new ConvexError({ message: "Stavka nije pronađena", code: "NOT_FOUND" });
    }

    // Delete image from storage if it exists
    if (item.imageStorageId) {
      await ctx.storage.delete(item.imageStorageId);
    }

    await ctx.db.delete(args.id);
  },
});
