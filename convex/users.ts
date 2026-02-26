import { ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";

export const updateCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }

    // Check if we've already stored this identity before.
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (user !== null) {
      // If user exists but has no role, check for pending invitation
      if (!user.role && identity.email) {
        const invitation = await ctx.db
          .query("invitations")
          .withIndex("by_email", (q) => q.eq("email", identity.email as string))
          .first();
        if (invitation && !invitation.accepted) {
          await ctx.db.patch(user._id, { role: invitation.role });
          await ctx.db.patch(invitation._id, { accepted: true });
        }
      }
      return user._id;
    }

    // Check if there's an invitation for this email
    let role: "admin" | "editor" | "viewer" | undefined;

    // First user gets admin role automatically
    const allUsers = await ctx.db.query("users").take(1);
    const isFirstUser = allUsers.length === 0;

    if (isFirstUser) {
      role = "admin";
    } else if (identity.email) {
      const invitation = await ctx.db
        .query("invitations")
        .withIndex("by_email", (q) => q.eq("email", identity.email as string))
        .first();
      if (invitation && !invitation.accepted) {
        role = invitation.role;
        await ctx.db.patch(invitation._id, { accepted: true });
      }
    }

    return await ctx.db.insert("users", {
      name: identity.name,
      email: identity.email,
      tokenIdentifier: identity.tokenIdentifier,
      role,
    });
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "Called getCurrentUser without authentication present",
      });
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    return user;
  },
});
