import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const list = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.search) {
      const products = await ctx.db
        .query("products")
        .withSearchIndex("search_title", (q) => {
          let searchQuery = q.search("title", args.search!);
          if (args.category) {
            searchQuery = searchQuery.eq("category", args.category as any);
          }
          return searchQuery.eq("isApproved", true);
        })
        .take(args.limit || 20);

      const productsWithOwners = await Promise.all(
        products.map(async (product: any) => {
          const owner = await ctx.db.get(product.ownerId);
          const ownerDoc = owner as any;

          // Add: compute imageUrl from storage if missing
          let computedImageUrl = product.imageUrl;
          if (!computedImageUrl && product.imageStorageId) {
            const url = await ctx.storage.getUrl(product.imageStorageId);
            if (url) computedImageUrl = url; // avoid assigning null
          }

          return {
            ...product,
            imageUrl: computedImageUrl,
            owner: ownerDoc ? { name: ownerDoc.name, email: ownerDoc.email } : null,
          };
        })
      );

      return productsWithOwners;
    } else {
      let query;
      if (args.category) {
        query = ctx.db
          .query("products")
          .withIndex("by_category", (q) => q.eq("category", args.category as any));
      } else {
        query = ctx.db
          .query("products")
          .withIndex("by_approved", (q) => q.eq("isApproved", true));
      }

      const products = await query.order("desc").take(args.limit || 20);

      const productsWithOwners = await Promise.all(
        products.map(async (product: any) => {
          const owner = await ctx.db.get(product.ownerId);
          const ownerDoc = owner as any;

          // Add: compute imageUrl from storage if missing
          let computedImageUrl = product.imageUrl;
          if (!computedImageUrl && product.imageStorageId) {
            const url = await ctx.storage.getUrl(product.imageStorageId);
            if (url) computedImageUrl = url; // avoid assigning null
          }

          return {
            ...product,
            imageUrl: computedImageUrl,
            owner: ownerDoc ? { name: ownerDoc.name, email: ownerDoc.email } : null,
          };
        })
      );

      return productsWithOwners;
    }
  },
});

export const getById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) return null;

    const owner = await ctx.db.get(product.ownerId);
    const ownerDoc = owner as any;

    // Add: compute imageUrl from storage if missing
    let computedImageUrl = product.imageUrl;
    if (!computedImageUrl && product.imageStorageId) {
      const url = await ctx.storage.getUrl(product.imageStorageId);
      if (url) computedImageUrl = url;
    }

    return {
      ...product,
      imageUrl: computedImageUrl,
      owner: ownerDoc ? { name: ownerDoc.name, email: ownerDoc.email } : null,
    };
  },
});

export const getMyProducts = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("products")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    category: v.string(),
    condition: v.string(),
    imageUrl: v.optional(v.string()),
    city: v.optional(v.string()),
    // Add: accept storage id
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Must be authenticated to create products");

    return await ctx.db.insert("products", {
      title: args.title,
      description: args.description,
      price: args.price,
      category: args.category as any,
      condition: args.condition as any,
      imageUrl: args.imageUrl,
      city: args.city,
      ownerId: user._id,
      isApproved: true,
      imageStorageId: args.imageStorageId,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    category: v.optional(v.string()),
    condition: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    city: v.optional(v.string()),
    // Add: allow updating storage id
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Must be authenticated");

    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found");
    if (product.ownerId !== user._id) throw new Error("Not authorized");

    const { id, ...updates } = args;
    const typedUpdates: any = {};

    if (updates.title !== undefined) typedUpdates.title = updates.title;
    if (updates.description !== undefined) typedUpdates.description = updates.description;
    if (updates.price !== undefined) typedUpdates.price = updates.price;
    if (updates.category !== undefined) typedUpdates.category = updates.category;
    if (updates.condition !== undefined) typedUpdates.condition = updates.condition;
    if (updates.imageUrl !== undefined) typedUpdates.imageUrl = updates.imageUrl;
    if (updates.city !== undefined) typedUpdates.city = updates.city;
    if (updates.imageStorageId !== undefined) typedUpdates.imageStorageId = updates.imageStorageId;

    return await ctx.db.patch(id, typedUpdates);
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Must be authenticated");

    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found");
    if (product.ownerId !== user._id) throw new Error("Not authorized");

    return await ctx.db.delete(args.id);
  },
});