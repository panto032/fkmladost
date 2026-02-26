import { v, ConvexError } from "convex/values";
import { query, mutation } from "./_generated/server";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel.d.ts";

/** Reusable helper: get the currently authenticated user */
async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({ message: "Niste prijavljeni", code: "UNAUTHENTICATED" });
  }
  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();
  if (!user) {
    throw new ConvexError({ message: "Korisnik nije pronađen", code: "NOT_FOUND" });
  }
  return user;
}

/** Only admins may manage the team */
async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);
  if (user.role !== "admin") {
    throw new ConvexError({ message: "Nemate dozvolu za ovu akciju", code: "FORBIDDEN" });
  }
  return user;
}

/** List all registered users (admin only) */
export const listMembers = query({
  args: {},
  handler: async (ctx): Promise<Doc<"users">[]> => {
    await requireAdmin(ctx);
    return await ctx.db.query("users").collect();
  },
});

/** Update a user's role (admin only) */
export const updateRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    // Prevent removing your own admin role
    if (args.userId === admin._id && args.role !== "admin") {
      throw new ConvexError({
        message: "Ne možete ukloniti sopstvenu admin ulogu",
        code: "BAD_REQUEST",
      });
    }

    await ctx.db.patch(args.userId, { role: args.role });
  },
});

/** Remove a team member (admin only) — resets role to undefined */
export const removeMember = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    if (args.userId === admin._id) {
      throw new ConvexError({
        message: "Ne možete ukloniti sebe iz tima",
        code: "BAD_REQUEST",
      });
    }

    await ctx.db.patch(args.userId, { role: undefined });
  },
});
