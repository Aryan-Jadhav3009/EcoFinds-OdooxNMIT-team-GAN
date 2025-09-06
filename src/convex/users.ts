import { getAuthUserId } from "@convex-dev/auth/server";
import { query, QueryCtx } from "./_generated/server";

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 * Usage: const signedInUser = await ctx.runQuery(api.authHelpers.currentUser);
 * THIS FUNCTION IS READ-ONLY. DO NOT MODIFY.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    try {
      const user = await getCurrentUser(ctx);
      if (user === null) {
        return null;
      }
      return user;
    } catch (e) {
      // Fail-safe: never crash client if auth lookup fails
      return null;
    }
  },
});

/**
 * Use this function internally to get the current user data. Remember to handle the null user case.
 * @param ctx
 * @returns
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  try {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    // Guard db get
    try {
      return await ctx.db.get(userId);
    } catch {
      return null;
    }
  } catch {
    return null;
  }
};