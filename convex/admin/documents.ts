import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

/** Admin: get all documents */
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: "Niste prijavljeni", code: "UNAUTHENTICATED" });
    }
    const docs = await ctx.db.query("documents").collect();
    docs.sort((a, b) => a.sortOrder - b.sortOrder);

    return Promise.all(
      docs.map(async (doc) => {
        const fileUrl = await ctx.storage.getUrl(doc.fileStorageId);
        return { ...doc, fileUrl };
      }),
    );
  },
});

/** Admin: create a document */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    fileStorageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    published: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: "Niste prijavljeni", code: "UNAUTHENTICATED" });
    }

    // Get max sort order
    const existing = await ctx.db.query("documents").collect();
    const maxSort = existing.length > 0
      ? Math.max(...existing.map((d) => d.sortOrder))
      : 0;

    return await ctx.db.insert("documents", {
      ...args,
      sortOrder: maxSort + 1,
    });
  },
});

/** Admin: update a document */
export const update = mutation({
  args: {
    id: v.id("documents"),
    title: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    fileStorageId: v.optional(v.id("_storage")),
    fileName: v.optional(v.string()),
    fileType: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    published: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: "Niste prijavljeni", code: "UNAUTHENTICATED" });
    }

    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new ConvexError({ message: "Dokument nije pronađen", code: "NOT_FOUND" });
    }

    const updates: Record<string, unknown> = {
      title: args.title,
      description: args.description,
      category: args.category,
      published: args.published,
    };

    // Only update file fields if new file was uploaded
    if (args.fileStorageId) {
      updates.fileStorageId = args.fileStorageId;
    }
    if (args.fileName) {
      updates.fileName = args.fileName;
    }
    if (args.fileType) {
      updates.fileType = args.fileType;
    }
    if (args.fileSize !== undefined) {
      updates.fileSize = args.fileSize;
    }

    await ctx.db.patch(args.id, updates);
  },
});

/** Admin: remove a document */
export const remove = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: "Niste prijavljeni", code: "UNAUTHENTICATED" });
    }

    const doc = await ctx.db.get(args.id);
    if (!doc) {
      throw new ConvexError({ message: "Dokument nije pronađen", code: "NOT_FOUND" });
    }

    // Delete file from storage
    await ctx.storage.delete(doc.fileStorageId);
    await ctx.db.delete(args.id);
  },
});
