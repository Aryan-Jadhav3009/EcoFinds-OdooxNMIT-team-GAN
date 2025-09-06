import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// User roles
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
);
export type Role = Infer<typeof roleValidator>;

// Product categories
export const CATEGORIES = {
  FURNITURE: "furniture",
  ELECTRONICS: "electronics", 
  CLOTHING: "clothing",
  BOOKS: "books",
} as const;

export const categoryValidator = v.union(
  v.literal(CATEGORIES.FURNITURE),
  v.literal(CATEGORIES.ELECTRONICS),
  v.literal(CATEGORIES.CLOTHING),
  v.literal(CATEGORIES.BOOKS),
);
export type Category = Infer<typeof categoryValidator>;

// Product conditions
export const CONDITIONS = {
  NEW: "new",
  USED: "used",
} as const;

export const conditionValidator = v.union(
  v.literal(CONDITIONS.NEW),
  v.literal(CONDITIONS.USED),
);
export type Condition = Infer<typeof conditionValidator>;

const schema = defineSchema(
  {
    ...authTables,

    // users table is provided by authTables

    products: defineTable({
      title: v.string(),
      description: v.optional(v.string()),
      price: v.number(),
      category: categoryValidator,
      condition: conditionValidator,
      imageUrl: v.optional(v.string()),
      ownerId: v.id("users"),
      city: v.optional(v.string()),
      isApproved: v.optional(v.boolean()),
      // Add: storage-backed image support
      imageStorageId: v.optional(v.id("_storage")),
    })
      .index("by_owner", ["ownerId"])
      .index("by_category", ["category"])
      .index("by_approved", ["isApproved"])
      .searchIndex("search_title", {
        searchField: "title",
        filterFields: ["category", "isApproved"]
      }),

    orders: defineTable({
      userId: v.id("users"),
      items: v.array(v.object({
        productId: v.id("products"),
        title: v.string(),
        price: v.number(),
        quantity: v.number(),
      })),
      total: v.number(),
    }).index("by_user", ["userId"]),

    // Add: user_security table for post-auth password gate
    user_security: defineTable({
      userId: v.id("users"),
      passwordHash: v.string(), // hex-encoded SHA-256 hash
      salt: v.string(), // hex-encoded random salt
    }).index("by_userId", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;