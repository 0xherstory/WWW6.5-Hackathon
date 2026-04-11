import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Entry from "@/pages/Entry";
import Home from "@/pages/Home";
import Create from "@/pages/Create";
import IdeaVault from "@/pages/IdeaVault";
import Playground from "@/pages/Playground";
import PlagiarismCheck from "@/pages/PlagiarismCheck";
import DigitalLegacy from "@/pages/DigitalLegacy";
import BlockchainProof from "@/pages/BlockchainProof";
import Stories from "@/pages/Stories";
import MusicTheory from "@/pages/MusicTheory";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import ReturnToEntry from "@/components/ReturnToEntry";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Entry />} />
            <Route path="/home" element={<><Navbar /><ReturnToEntry /><Home /></>} />
            <Route path="/create" element={<><Navbar /><ReturnToEntry /><Create /></>} />
            <Route path="/vault" element={<><Navbar /><ReturnToEntry /><IdeaVault /></>} />
            <Route path="/playground" element={<><Navbar /><ReturnToEntry /><Playground /></>} />
            <Route path="/check" element={<><Navbar /><ReturnToEntry /><PlagiarismCheck /></>} />
            <Route path="/legacy" element={<><Navbar /><ReturnToEntry /><DigitalLegacy /></>} />
            <Route path="/blockchain" element={<><Navbar /><ReturnToEntry /><BlockchainProof /></>} />
            <Route path="/stories" element={<><Navbar /><ReturnToEntry /><Stories /></>} />
            <Route path="/theory" element={<><Navbar /><ReturnToEntry /><MusicTheory /></>} />
            <Route path="/auth" element={<><Navbar /><ReturnToEntry /><Auth /></>} />
            <Route path="/profile" element={<><Navbar /><ReturnToEntry /><Profile /></>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
