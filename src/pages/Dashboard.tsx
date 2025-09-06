import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Plus, Package, ShoppingBag, Edit, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import ProductEditDialog from "@/components/ProductEditDialog";

export default function Dashboard() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);

  // Handlers: edit and delete listings
  const handleEditProduct = (id: string) => {
    setEditProductId(id);
    setEditOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    const confirmed = window.confirm("Delete this listing? This cannot be undone.");
    if (!confirmed) return;
    try {
      await deleteProduct({ id: id as any });
      toast.success("Listing deleted");
      if (editProductId === id) {
        setEditOpen(false);
        setEditProductId(null);
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete listing");
    }
  };

  const myProducts = useQuery(api.products.getMyProducts);
  const myOrders = useQuery(api.orders.getMyOrders);
  const deleteProduct = useMutation(api.products.remove);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card rounded-2xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb w-96 h-96 bg-purple-400/30 -top-48 -left-48"></div>
        <div className="floating-orb w-80 h-80 bg-pink-400/30 top-1/4 -right-40" style={{ animationDelay: "2s" }}></div>
      </div>

      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white text-shadow mb-2">
            Welcome back, {user?.name || "User"}!
          </h1>
          <p className="text-white/80 text-lg">
            Manage your listings and track your activity
          </p>
          <div className="mt-4">
            <Link to="/">
              <Button
                variant="outline"
                className="glass border-white/30 text-white hover:bg-white/10"
              >
                Browse Products
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/80">
                  My Listings
                </CardTitle>
                <Package className="h-4 w-4 text-white/60" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {myProducts?.length || 0}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/80">
                  Orders Placed
                </CardTitle>
                <ShoppingBag className="h-4 w-4 text-white/60" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {myOrders?.length || 0}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link to="/products/new">
              <Card className="glass-card border-white/20 hover:bg-white/15 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/80">
                    Add New Listing
                  </CardTitle>
                  <Plus className="h-4 w-4 text-white/60" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    Sell Item
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>

        {/* My Listings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white text-shadow">
              My Listings
            </h2>
            <Link to="/products/new">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Add New Product
              </Button>
            </Link>
          </div>

          {myProducts && myProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="glass-card rounded-2xl overflow-hidden"
                >
                  <div className="aspect-square overflow-hidden">
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
                  <div className="p-4">
                    <h3 className="font-semibold text-white text-shadow mb-2">
                      {product.title}
                    </h3>
                    <p className="text-white/80 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-bold text-white">
                        ${product.price}
                      </span>
                      <span className="text-white/60 text-sm">
                        {product.category}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProduct(product._id)}
                        className="w-full glass border-white/30 text-white hover:bg-white/10 flex-1"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProduct(product._id)}
                        className="glass border-red-400/30 text-red-400 hover:bg-red-400/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-8 text-center">
              <Package className="h-12 w-12 text-white/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white text-shadow mb-2">
                No listings yet
              </h3>
              <p className="text-white/80 mb-4">
                Start selling by creating your first product listing
              </p>
              <Link to="/products/new">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Listing
                </Button>
              </Link>
            </div>
          )}
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-white text-shadow mb-6">
            Recent Orders
          </h2>

          {myOrders && myOrders.length > 0 ? (
            <div className="space-y-4">
              {myOrders.slice(0, 5).map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="glass-card rounded-xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">
                        Order #{order._id.slice(-8)}
                      </p>
                      <p className="text-white/60 text-sm">
                        {order.items.length} item(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">
                        ${order.total}
                      </p>
                      <p className="text-white/60 text-sm">
                        {new Date(order._creationTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-8 text-center">
              <ShoppingBag className="h-12 w-12 text-white/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white text-shadow mb-2">
                No orders yet
              </h3>
              <p className="text-white/80">
                Your purchase history will appear here
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {editOpen && editProductId && (
        <ProductEditDialog
          productId={editProductId}
          open={editOpen}
          onOpenChange={(o) => {
            if (!o) setEditProductId(null);
            setEditOpen(o);
          }}
          onSuccess={() => {
            // No-op; reactive queries will refresh automatically
          }}
        />
      )}
    </div>
  );
}