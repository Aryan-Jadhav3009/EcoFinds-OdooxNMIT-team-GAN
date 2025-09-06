import Navbar from "@/components/Navbar";
import ProductList from "@/components/ProductList";
import SearchFilters from "@/components/SearchFilters";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, Recycle, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useQuery } from "convex/react";
import { toast } from "sonner";

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [cart, setCart] = useState<any[]>([]);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("ecofinds-cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("ecofinds-cart", JSON.stringify(cart));
  }, [cart]);

  const products = useQuery(api.products.list, {
    category: selectedCategory || undefined,
    search: searchQuery || undefined,
    limit: 20,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAddToCart = (product: any) => {
    const existingItem = cart.find(item => item.productId === product._id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product._id,
        title: product.title,
        price: product.price,
        quantity: 1,
        imageUrl: product.imageUrl,
      }]);
    }
    toast.success("Added to cart!");
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb w-96 h-96 bg-purple-400/30 -top-48 -left-48"></div>
        <div className="floating-orb w-80 h-80 bg-pink-400/30 top-1/4 -right-40" style={{ animationDelay: "2s" }}></div>
        <div className="floating-orb w-64 h-64 bg-blue-400/30 bottom-1/4 left-1/4" style={{ animationDelay: "4s" }}></div>
      </div>

      <Navbar onSearch={handleSearch} cartItemCount={cartItemCount} />

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white text-shadow mb-6">
              Find Your Next
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {" "}Treasure
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 text-shadow mb-8 max-w-3xl mx-auto">
              Discover unique, sustainable products from your community. Buy, sell, and give items a second life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={isAuthenticated ? "/dashboard" : "/auth"}>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-4">
                  {isAuthenticated ? "Go to Dashboard" : "Get Started"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="glass border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4"
                onClick={() =>
                  document
                    .getElementById("products-section")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
              >
                Browse Products
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white text-shadow mb-4">
              Why Choose EcoFinds?
            </h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Join our community of conscious consumers making a positive impact
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Leaf,
                title: "Sustainable Shopping",
                description: "Reduce waste by giving products a second life and supporting circular economy."
              },
              {
                icon: Users,
                title: "Community Driven",
                description: "Connect with local sellers and buyers in your area for authentic experiences."
              },
              {
                icon: Recycle,
                title: "Easy Selling",
                description: "Turn your unused items into cash with our simple listing process."
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="glass-card rounded-2xl p-6 text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-white text-shadow mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/80">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products-section" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white text-shadow mb-4">
              Featured Products
            </h2>
            <p className="text-white/80 text-lg">
              Discover amazing finds from our community
            </p>
          </motion.div>

          <SearchFilters
            onCategoryChange={setSelectedCategory}
            onSortChange={setSelectedSort}
            selectedCategory={selectedCategory}
            selectedSort={selectedSort}
          />

          <ProductList
            products={products || []}
            onAddToCart={handleAddToCart}
            loading={products === undefined}
          />
        </div>
      </section>
    </div>
  );
}