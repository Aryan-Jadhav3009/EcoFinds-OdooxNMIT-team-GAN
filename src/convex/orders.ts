import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const create = mutation({
  args: {
    items: v.array(v.object({
      productId: v.id("products"),
      title: v.string(),
      price: v.number(),
      quantity: v.number(),
    })),
    total: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Must be authenticated to place orders");

    return await ctx.db.insert("orders", {
      userId: user._id,
      items: args.items,
      total: args.total,
    });
  },
});

export const getMyOrders = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});
