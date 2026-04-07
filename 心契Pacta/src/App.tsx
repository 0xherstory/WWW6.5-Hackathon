import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { wagmiConfig } from "@/lib/wagmi-config";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Mental from "./pages/Mental";
import Physical from "./pages/Physical";
import Diet from "./pages/Diet";
import Happiness from "./pages/Happiness";
import Business from "./pages/Business";
import Productivity from "./pages/Productivity";
import Challenges from "./pages/Challenges";
import Overview from "./pages/Overview";
import CreateHabits from "./pages/CreateHabits";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/create" element={<CreateHabits />} />
              <Route path="/mental" element={<Mental />} />
              <Route path="/physical" element={<Physical />} />
              <Route path="/diet" element={<Diet />} />
              <Route path="/happiness" element={<Happiness />} />
              <Route path="/business" element={<Business />} />
              <Route path="/productivity" element={<Productivity />} />
              <Route path="/challenges" element={<Challenges />} />
              <Route path="/overview" element={<Overview />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
