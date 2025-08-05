import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Success from "./pages/Success";
import HowToAddARToShopify from "./pages/how-to/HowToAddARToShopify";
import USDZvsGLB from "./pages/how-to/USDZvsGLB";
import WooCommerce3D from "./pages/how-to/WooCommerce3D";
import Cheap3DModeling from "./pages/how-to/Cheap3DModeling";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/success" element={<Success />} />
          <Route path="/how-to-add-ar-to-shopify" element={<HowToAddARToShopify />} />
          <Route path="/usdz-vs-glb-3d-formats" element={<USDZvsGLB />} />
          <Route path="/3d-models-for-woocommerce" element={<WooCommerce3D />} />
          <Route path="/cheap-3d-modeling-alternative" element={<Cheap3DModeling />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
