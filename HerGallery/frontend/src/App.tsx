import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { config } from "@/config/wagmi";
import { POAPProvider } from "@/context/POAPContext";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import ExhibitionDetailPage from "./pages/ExhibitionDetailPage";
import CreateExhibitionPage from "./pages/CreateExhibitionPage";
import ManageExhibitionPage from "./pages/ManageExhibitionPage";
import MyRecordsPage from "./pages/MyRecordsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const routerBasename = import.meta.env.DEV ? "/" : "/HerGallery";

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <POAPProvider>
        <BrowserRouter basename={routerBasename}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/gallery" element={<HomePage />} />
            <Route path="/create" element={<CreateExhibitionPage />} />
            <Route path="/me" element={<MyRecordsPage />} />
            <Route path="/exhibition/:id" element={<ExhibitionDetailPage />} />
            <Route path="/exhibition/:id/manage" element={<ManageExhibitionPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </POAPProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
