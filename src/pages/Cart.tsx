import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation } from "convex/react";
import { toast } from "sonner";

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState<any[]>([]);
  const createOrder = useMutation(api.orders.create);

  useEffect(() => {
    const savedCart = localStorage.getItem("ecofinds-cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ecofinds-cart", JSON.stringify(cart));
  }, [cart]);

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }
    setCart(cart.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeItem = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
    toast.success("Item removed from cart");
  };

  const clearCart = () => {
    setCart([]);
    toast.success("Cart cleared");
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      await createOrder({
        items: cart.map(({ productId, title, price, quantity }) => ({
          productId: productId as any,
          title,
          price,
          quantity,
        })),
        total: total,
      });
      
      setCart([]);
      toast.success("Order placed successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to place order");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb w-96 h-96 bg-purple-400/30 -top-48 -left-48"></div>
        <div className="floating-orb w-80 h-80 bg-pink-400/30 top-1/4 -right-40" style={{ animationDelay: "2s" }}></div>
      </div>

      <Navbar cartItemCount={cartItemCount} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link to="/">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white text-shadow mb-8">
            Shopping Cart
          </h1>

          {cart.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center">
              <ShoppingBag className="h-16 w-16 text-white/40 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-white text-shadow mb-2">
                Your cart is empty
              </h2>
              <p className="text-white/80 mb-6">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Link to="/">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item, index) => (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card rounded-xl p-4"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden">
                        <img
                          src={item.imageUrl || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200"}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-shadow">
                          {item.title}
                        </h3>
                        <p className="text-white/60 text-sm">
                          ${item.price} each
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="text-white hover:bg-white/10 h-8 w-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-white font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="text-white hover:bg-white/10 h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-white">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.productId)}
                          className="text-red-400 hover:bg-red-400/10 mt-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    onClick={clearCart}
                    className="text-red-400 hover:bg-red-400/10"
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>

              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-xl p-6 h-fit"
              >
                <h2 className="text-xl font-semibold text-white text-shadow mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-white/80">
                    <span>Subtotal ({cartItemCount} items)</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t border-white/20 pt-3">
                    <div className="flex justify-between text-lg font-semibold text-white">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3"
                >
                  {isAuthenticated ? "Place Order" : "Sign In to Checkout"}
                </Button>

                {!isAuthenticated && (
                  <p className="text-white/60 text-sm text-center mt-3">
                    You need to sign in to complete your purchase
                  </p>
                )}
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}