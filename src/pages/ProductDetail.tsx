import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, User, Heart, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useQuery } from "convex/react";
import { toast } from "sonner";

export default function ProductDetail() {
  const { id } = useParams();
  const [cart, setCart] = useState<any[]>([]);
  const navigate = useNavigate();

  // Redirect "new" route to dashboard (which handles auth redirect if needed)
  useEffect(() => {
    if (id === "new") {
      navigate("/dashboard");
    }
  }, [id, navigate]);

  // Only query when id is a real product id
  const product = useQuery(
    api.products.getById,
    id && id !== "new" ? ({ id: id as any }) : (undefined as any)
  );

  useEffect(() => {
    const savedCart = localStorage.getItem("ecofinds-cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ecofinds-cart", JSON.stringify(cart));
  }, [cart]);

  const handleAddToCart = () => {
    if (!product) return;

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

  if (product === undefined) {
    return (
      <div className="min-h-screen">
        <Navbar cartItemCount={cartItemCount} />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="glass-card rounded-2xl p-8 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-white/20 rounded-xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-white/20 rounded"></div>
                <div className="h-4 bg-white/20 rounded w-3/4"></div>
                <div className="h-6 bg-white/20 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="min-h-screen">
        <Navbar cartItemCount={cartItemCount} />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="glass-card rounded-2xl p-8 text-center">
            <h1 className="text-2xl font-bold text-white text-shadow mb-4">
              Product Not Found
            </h1>
            <p className="text-white/80 mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb w-96 h-96 bg-purple-400/30 -top-48 -left-48"></div>
        <div className="floating-orb w-80 h-80 bg-pink-400/30 top-1/4 -right-40" style={{ animationDelay: "2s" }}></div>
      </div>

      <Navbar cartItemCount={cartItemCount} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link to="/">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Image */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-xl">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-white/30 to-pink-300/30" />
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex space-x-2">
                    <Badge variant="secondary" className="glass text-white border-white/30">
                      {product.condition}
                    </Badge>
                    <Badge variant="outline" className="text-white border-white/30">
                      {product.category}
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-white text-shadow mb-4">
                  {product.title}
                </h1>

                <div className="text-4xl font-bold text-white text-shadow mb-6">
                  ${product.price}
                </div>
              </div>

              {product.description && (
                <div>
                  <h3 className="text-lg font-semibold text-white text-shadow mb-2">
                    Description
                  </h3>
                  <p className="text-white/80 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Location */}
              {product.city && (
                <div className="flex items-center text-white/80">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{product.city}</span>
                </div>
              )}

              {/* Seller Info */}
              {product.owner && (
                <div className="glass rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-white text-shadow mb-2">
                    Seller Information
                  </h3>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {product.owner.name || "Anonymous Seller"}
                      </p>
                      <p className="text-white/60 text-sm">
                        {product.owner.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6"
                >
                  Add to Cart - ${product.price}
                </Button>
                <Button
                  variant="outline"
                  className="w-full glass border-white/30 text-white hover:bg-white/10"
                >
                  Contact Seller
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}