import { mutation } from "./_generated/server";

export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    // Create demo user
    const demoUserId = await ctx.db.insert("users", {
      name: "Demo User",
      email: "demo@ecofinds.test",
    });

    // Seed products
    const products = [
      {
        title: "Vintage Wooden Coffee Table",
        description: "Beautiful handcrafted wooden coffee table with rustic charm. Perfect for living rooms.",
        price: 150,
        category: "furniture",
        condition: "used",
        imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500",
        city: "San Francisco",
        ownerId: demoUserId,
        isApproved: true,
      },
      {
        title: "MacBook Pro 13-inch M2",
        description: "Barely used MacBook Pro with M2 chip. Excellent condition, includes charger.",
        price: 1200,
        category: "electronics",
        condition: "used",
        imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
        city: "New York",
        ownerId: demoUserId,
        isApproved: true,
      },
      {
        title: "Designer Winter Coat",
        description: "Warm and stylish winter coat from premium brand. Size M.",
        price: 80,
        category: "clothing",
        condition: "used",
        imageUrl: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=500",
        city: "Chicago",
        ownerId: demoUserId,
        isApproved: true,
      },
      {
        title: "Programming Books Collection",
        description: "Set of 5 programming books including JavaScript, Python, and React guides.",
        price: 45,
        category: "books",
        condition: "used",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
        city: "Austin",
        ownerId: demoUserId,
        isApproved: true,
      },
      {
        title: "Modern Office Chair",
        description: "Ergonomic office chair with lumbar support. Great for home office setup.",
        price: 200,
        category: "furniture",
        condition: "new",
        imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500",
        city: "Seattle",
        ownerId: demoUserId,
        isApproved: true,
      },
      {
        title: "iPhone 14 Pro",
        description: "Latest iPhone in excellent condition. Unlocked and ready to use.",
        price: 900,
        category: "electronics",
        condition: "used",
        imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500",
        city: "Los Angeles",
        ownerId: demoUserId,
        isApproved: true,
      },
      {
        title: "Vintage Leather Jacket",
        description: "Classic leather jacket with timeless style. Size L.",
        price: 120,
        category: "clothing",
        condition: "used",
        imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500",
        city: "Miami",
        ownerId: demoUserId,
        isApproved: true,
      },
      {
        title: "Art History Textbooks",
        description: "Complete set of art history textbooks for college courses.",
        price: 60,
        category: "books",
        condition: "used",
        imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500",
        city: "Boston",
        ownerId: demoUserId,
        isApproved: true,
      },
      {
        title: "Dining Table Set",
        description: "Beautiful dining table with 4 chairs. Perfect for small families.",
        price: 300,
        category: "furniture",
        condition: "used",
        imageUrl: "https://images.unsplash.com/photo-1549497538-303791108f95?w=500",
        city: "Denver",
        ownerId: demoUserId,
        isApproved: true,
      },
      {
        title: "Gaming Laptop",
        description: "High-performance gaming laptop with RTX graphics. Perfect for gaming and work.",
        price: 800,
        category: "electronics",
        condition: "used",
        imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500",
        city: "Portland",
        ownerId: demoUserId,
        isApproved: true,
      },
    ];

    for (const product of products) {
      await ctx.db.insert("products", {
        ...product,
        category: product.category as any,
        condition: product.condition as any,
      });
    }

    return { message: "Seed data created successfully", userId: demoUserId };
  },
});
