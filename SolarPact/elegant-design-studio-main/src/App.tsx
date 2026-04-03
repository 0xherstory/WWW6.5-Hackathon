import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import StarField from "@/components/StarField";
import Index from "./pages/Index.tsx";
import Marketplace from "./pages/Marketplace.tsx";
import CreateNeed from "./pages/CreateNeed.tsx";
import BidPage from "./pages/BidPage.tsx";
import Growth from "./pages/Growth.tsx";
import Leaderboard from "./pages/Leaderboard.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const Layout = ({ children }: { children: React.ReactNode }) => (
  <>
    <StarField />
    <Navbar />
    {children}
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/marketplace" element={<Layout><Marketplace /></Layout>} />
          <Route path="/create" element={<Layout><CreateNeed /></Layout>} />
          <Route path="/bid/:id" element={<Layout><BidPage /></Layout>} />
          <Route path="/growth" element={<Layout><Growth /></Layout>} />
          <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
