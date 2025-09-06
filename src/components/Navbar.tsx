import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Search, ShoppingCart, User, LogOut, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import ProductFormDialog from "@/components/ProductFormDialog";

interface NavbarProps {
  onSearch?: (query: string) => void;
  cartItemCount?: number;
}

export default function Navbar({ onSearch, cartItemCount = undefined as unknown as number | undefined }: NavbarProps) {
  const { isAuthenticated, user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);

  // Add: self-managed cart count to keep badge reliable across pages
  const [internalCartCount, setInternalCartCount] = useState<number>(0);

  useEffect(() => {
    const compute = () => {
      try {
        const raw = localStorage.getItem("ecofinds-cart");
        const arr = raw ? JSON.parse(raw) as Array<{ quantity: number }> : [];
        const count = arr.reduce((t, i) => t + (Number(i.quantity) || 0), 0);
        setInternalCartCount(count);
      } catch {
        setInternalCartCount(0);
      }
    };
    compute();

    const onStorage = (e: StorageEvent) => {
      if (e.key === "ecofinds-cart") compute();
    };
    const onVis = () => compute();
    window.addEventListener("storage", onStorage);
    window.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onVis);

    // lightweight polling as a last resort to capture same-tab updates promptly
    const id = window.setInterval(compute, 1000);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onVis);
      window.clearInterval(id);
    };
  }, []);

  const effectiveCount = typeof cartItemCount === "number" ? cartItemCount : internalCartCount;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleSellClick = () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    setCreateOpen(true);
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 glass-strong border-b border-white/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2"
            >
              <img
                src="/logo.svg"
                alt="EcoFinds"
                className="h-8 w-8"
              />
              <span className="text-xl font-bold text-shadow">EcoFinds</span>
            </motion.div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass border-white/30 text-white placeholder:text-white/70"
              />
            </div>
          </form>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link to="/cart">
              <Button variant="ghost" size="sm" className="relative text-white hover:bg-white/10">
                <ShoppingCart className="h-5 w-5" />
                {effectiveCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {effectiveCount}
                  </span>
                )}
              </Button>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleSellClick}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Sell
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-white hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    Sign In
                  </Button>
                </Link>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => navigate("/auth")}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add: Create Listing Dialog portal */}
      <ProductFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => {
          // Optionally send user to dashboard to see listing
          // Keep user on the page to continue shopping, minimal behavior:
          // toast already handled inside the dialog
        }}
      />
    </motion.nav>
  );
}