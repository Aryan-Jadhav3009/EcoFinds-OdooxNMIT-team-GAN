import { motion } from "framer-motion";
import ProductCard from "./ProductCard";

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

interface ProductListProps {
  products: Product[];
  onAddToCart?: (product: Product) => void;
  loading?: boolean;
}

export default function ProductList({ products, onAddToCart, loading }: ProductListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass-card rounded-2xl p-4 animate-pulse">
            <div className="aspect-square bg-white/20 rounded-lg mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-white/20 rounded"></div>
              <div className="h-3 bg-white/20 rounded w-3/4"></div>
              <div className="h-6 bg-white/20 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="glass-card rounded-2xl p-8 max-w-md mx-auto">
          <h3 className="text-xl font-semibold text-white text-shadow mb-2">
            No products found
          </h3>
          <p className="text-white/80">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {products.map((product, index) => (
        <motion.div
          key={product._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ProductCard product={product} onAddToCart={onAddToCart} />
        </motion.div>
      ))}
    </motion.div>
  );
}
