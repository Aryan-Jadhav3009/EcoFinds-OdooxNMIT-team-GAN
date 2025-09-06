import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Return whether the current user has a password and, if applicable, the salt for verification
export const getMySecurity = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return { hasPassword: false as const, salt: null as string | null };

    const row = await ctx.db
      .query("user_security")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (!row) return { hasPassword: false as const, salt: null };

    return { hasPassword: true as const, salt: row.salt };
  },
});

// Set or update password hash+salt for the current user
export const setPassword = mutation({
  args: {
    passwordHash: v.string(),
    salt: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("user_security")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        passwordHash: args.passwordHash,
        salt: args.salt,
      });
      return;
    }

    await ctx.db.insert("user_security", {
      userId: user._id,
      passwordHash: args.passwordHash,
      salt: args.salt,
    });
  },
});

// Verify a supplied client-side hash matches stored
export const verifyPassword = query({
  args: {
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return { ok: false };

    const row = await ctx.db
      .query("user_security")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (!row) return { ok: false };
    return { ok: row.passwordHash === args.passwordHash };
  },
});
