import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CaseDetail from "./pages/CaseDetail";
import HelpCenter from "./pages/HelpCenter";
import Publish from "./pages/Publish";
import Profile from "./pages/Profile";
import Emergency from "./pages/channels/Emergency";
import Adoption from "./pages/channels/Adoption";
import LostPet from "./pages/channels/LostPet";
import Shelter from "./pages/channels/Shelter";
import CreateCase from "./pages/forms/CreateCase";
import AddRecord from "./pages/forms/AddRecord";
import PublishLostPet from "./pages/forms/PublishLostPet";
import Shop from "./pages/Shop";
import Guide from "./pages/Guide";
import LostPetMap from "./pages/LostPetMap";
import PublisherProfile from "./pages/PublisherProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/rescue" element={<Publish />} />
          <Route path="/publish" element={<Publish />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/case/:id" element={<CaseDetail />} />
          <Route path="/channel/emergency" element={<Emergency />} />
          <Route path="/channel/adoption" element={<Adoption />} />
          <Route path="/channel/lost-pet" element={<LostPet />} />
          <Route path="/channel/shelter" element={<Shelter />} />
          <Route path="/lost-pet-map" element={<LostPetMap />} />
          <Route path="/create-case" element={<CreateCase />} />
          <Route path="/add-record" element={<AddRecord />} />
          <Route path="/upload-evidence" element={<AddRecord />} />
          <Route path="/publish-lost-pet" element={<PublishLostPet />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/publisher/:id" element={<PublisherProfile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
