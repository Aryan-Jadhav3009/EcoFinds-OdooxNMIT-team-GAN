import { Toaster } from "@/components/ui/sonner";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import AuthPage from "@/pages/Auth.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode, useEffect, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import "./index.css";
import Landing from "./pages/Landing.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import Cart from "./pages/Cart.tsx";
import NotFound from "./pages/NotFound.tsx";
import "./types/global.d.ts";

const convexUrl =
  (import.meta.env.VITE_CONVEX_URL as string) ||
  "https://harmless-tapir-303.convex.cloud"; // fallback for local runs

const convex = new ConvexReactClient(convexUrl);

const enableVlyToolbar =
  (import.meta.env.VITE_ENABLE_VLY_TOOLBAR as string) === "true";

// Lazy-load the toolbar to avoid module-level side effects unless enabled
const VlyToolbar = lazy(() =>
  import("../vly-toolbar-readonly.tsx").then((m) => ({ default: m.VlyToolbar })),
);

function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}

// Global error listeners to catch any silent runtime crashes
window.addEventListener("error", (e) => {
  console.error("Global error:", e.message, (e as ErrorEvent).error);
});
window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled rejection:", (e as PromiseRejectionEvent).reason);
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {enableVlyToolbar ? (
      <Suspense fallback={null}>
        <VlyToolbar />
      </Suspense>
    ) : null}
    <InstrumentationProvider>
      <ConvexAuthProvider client={convex}>
        <BrowserRouter>
          <RouteSyncer />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<AuthPage redirectAfterAuth="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </ConvexAuthProvider>
    </InstrumentationProvider>
  </StrictMode>,
);