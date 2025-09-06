import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { MapPin, Heart } from "lucide-react";
import { Link } from "react-router";

interface Product {
  _id: string;
  title: string;
  description?: string;
  price: number;
  category: string;
  condition: string;
  imageUrl?: string;
  city?: string;
  owner?: {
    name?: string;
    email?: string;
  };
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group"
    >
      <Link to={`/products/${product._id}`}>
        <div className="glass-card rounded-2xl overflow-hidden h-full transition-all duration-300 hover:shadow-2xl">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-white/30 to-pink-300/30" />
            )}
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="glass text-white border-white/30">
                {product.condition}
              </Badge>
            </div>
            <div className="absolute top-3 right-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 rounded-full p-2"
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-lg text-white text-shadow line-clamp-2">
                {product.title}
              </h3>
              <p className="text-white/80 text-sm line-clamp-2 mt-1">
                {product.description}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-white text-shadow">
                ${product.price}
              </span>
              <Badge variant="outline" className="text-white border-white/30">
                {product.category}
              </Badge>
            </div>

            {product.city && (
              <div className="flex items-center text-white/70 text-sm">
                <MapPin className="h-3 w-3 mr-1" />
                {product.city}
              </div>
            )}

            <Button
              onClick={handleAddToCart}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}