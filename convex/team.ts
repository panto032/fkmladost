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

/** List team members — users with a role (admin only) */
export const listMembers = query({
  args: {},
  handler: async (ctx): Promise<Doc<"users">[]> => {
    await requireAdmin(ctx);
    const allUsers = await ctx.db.query("users").collect();
    return allUsers.filter((u) => u.role !== undefined);
  },
});

/** List pending invitations (admin only) */
export const listInvitations = query({
  args: {},
  handler: async (ctx): Promise<Doc<"invitations">[]> => {
    await requireAdmin(ctx);
    return await ctx.db.query("invitations").collect();
  },
});

/** Send an invitation (admin only) */
export const sendInvitation = mutation({
  args: {
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const normalizedEmail = args.email.trim().toLowerCase();

    // Check if invitation already exists
    const existing = await ctx.db
      .query("invitations")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .first();
    if (existing) {
      throw new ConvexError({
        message: "Pozivnica za ovaj email već postoji",
        code: "CONFLICT",
      });
    }

    // Check if user already exists with a role
    const allUsers = await ctx.db.query("users").collect();
    const existingUser = allUsers.find(
      (u) => u.email?.toLowerCase() === normalizedEmail && u.role
    );
    if (existingUser) {
      throw new ConvexError({
        message: "Korisnik sa ovim emailom već ima ulogu",
        code: "CONFLICT",
      });
    }

    await ctx.db.insert("invitations", {
      email: normalizedEmail,
      role: args.role,
      invitedBy: admin._id,
      accepted: false,
    });
  },
});

/** Cancel/delete an invitation (admin only) */
export const cancelInvitation = mutation({
  args: { invitationId: v.id("invitations") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.invitationId);
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
