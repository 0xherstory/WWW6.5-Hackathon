import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LocaleProvider } from "./hooks/useLocale";
import { WalletProvider } from "./hooks/useWallet";
import { ContractProvider } from "./hooks/useContract";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import CaseBrowser from "./pages/CaseBrowser";
import CaseDetail from "./pages/CaseDetail";
import SubmitCase from "./pages/SubmitCase";
import RescuerDashboard from "./pages/RescuerDashboard";
import DonorDashboard from "./pages/DonorDashboard";
import ReviewerDashboard from "./pages/ReviewerDashboard";
import AdoptionBrowser from "./pages/AdoptionBrowser";
import AdoptionDetail from "./pages/AdoptionDetail";
import PublishPet from "./pages/PublishPet";
import PublisherDashboard from "./pages/PublisherDashboard";
import AdopterDashboard from "./pages/AdopterDashboard";

export default function App() {
  const baseUrl = import.meta.env.BASE_URL || "/";
  const basename = baseUrl === "/" ? "/" : baseUrl.replace(/\/+$/, "");

  return (
    <LocaleProvider>
      <WalletProvider>
        <ContractProvider>
          <BrowserRouter basename={basename}>
            <div className="min-h-screen flex flex-col bg-gray-50">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/cases" element={<CaseBrowser />} />
                  <Route path="/case/:id" element={<CaseDetail />} />
                  <Route path="/adoption/browse" element={<AdoptionBrowser />} />
                  <Route path="/adoption/:petId" element={<AdoptionDetail />} />
                  <Route path="/submit" element={<SubmitCase />} />
                  <Route path="/adoption/publish" element={<PublishPet />} />
                  <Route path="/dashboard/rescuer" element={<RescuerDashboard />} />
                  <Route path="/dashboard/donor" element={<DonorDashboard />} />
                  <Route path="/dashboard/reviewer" element={<ReviewerDashboard />} />
                  <Route path="/dashboard/publisher" element={<PublisherDashboard />} />
                  <Route path="/dashboard/adopter" element={<AdopterDashboard />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </ContractProvider>
      </WalletProvider>
    </LocaleProvider>
  );
}
