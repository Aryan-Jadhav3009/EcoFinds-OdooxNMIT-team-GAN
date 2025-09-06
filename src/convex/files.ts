"use node";

import { action } from "./_generated/server";

export const createUploadUrl = action({
  args: {},
  handler: async (ctx) => {
    // Use Convex API generateUploadUrl (not createUploadUrl)
    const url = await ctx.storage.generateUploadUrl();
    return { url };
  },
});