import { v } from "convex/values";
import { query, internalMutation } from "./_generated/server";

/** Get the stored license */
export const get = query({
  args: {},
  handler: async (ctx) => {
    const licenses = await ctx.db.query("license").collect();
    return licenses[0] ?? null;
  },
});

/** Save/replace the stored license (internal only) */
export const saveLicense = internalMutation({
  args: {
    key: v.string(),
    status: v.string(),
    customerName: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    expiresAt: v.optional(v.string()),
    productName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Remove all existing license records
    const existing = await ctx.db.query("license").collect();
    for (const doc of existing) {
      await ctx.db.delete(doc._id);
    }

    // Insert the new one
    await ctx.db.insert("license", {
      key: args.key,
      status: args.status,
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      expiresAt: args.expiresAt,
      productName: args.productName,
      lastChecked: new Date().toISOString(),
    });
  },
});

/** Remove the stored license (for deactivation) */
export const removeLicense = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("license").collect();
    for (const doc of existing) {
      await ctx.db.delete(doc._id);
    }
  },
});
