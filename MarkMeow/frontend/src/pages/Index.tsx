import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatEther } from "ethers";
import { useWeb3 } from "@/hooks/useWeb3";
import CatCard from "@/components/CatCard";
import CatDetailModal from "@/components/CatDetailModal";
import CatFilters from "@/components/CatFilters";
import CatRegistrationForm from "@/components/CatRegistrationForm";
import DonationBox from "@/components/DonationBox";
import EventHistory from "@/components/EventHistory";
import WalletButton from "@/components/WalletButton";
import SEO from "@/components/SEO";
import { SidebarProvider, SidebarTrigger, Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Cat, Heart, PawPrint, Menu, ArrowUpDown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

type CatRow = {
  id: string;
  cat_id: string;
  gender: string;
  city: string;
  is_neutered: boolean;
  photo_url: string;
  created_at: string;
  neutered_at: string | null;
  neutered_proof_url: string | null;
};

const Index = () => {
  const web3 = useWeb3();
  const [cats, setCats] = useState<CatRow[]>([]);
  const [totalCats, setTotalCats] = useState(0);
  const [totalDonations, setTotalDonations] = useState("0");
  const [selectedCat, setSelectedCat] = useState<CatRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [filterGender, setFilterGender] = useState("all");
  const [filterCity, setFilterCity] = useState("");
  const [filterNeutered, setFilterNeutered] = useState("all");
  const [sortAsc, setSortAsc] = useState(true);
  const [catRegOpen, setCatRegOpen] = useState(false);
  const [donationOpen, setDonationOpen] = useState(false);

  const fetchCats = useCallback(async () => {
    let query = supabase.from("cats").select("*").order("created_at", { ascending: false });
    if (filterGender !== "all") query = query.eq("gender", filterGender);
    if (filterCity.trim()) query = query.ilike("city", `%${filterCity.trim()}%`);
    if (filterNeutered !== "all") query = query.eq("is_neutered", filterNeutered === "true");
    const { data } = await query;
    setCats((data as CatRow[]) || []);
  }, [filterGender, filterCity, filterNeutered]);

  const fetchStats = useCallback(async () => {
    try {
      if (web3.readContract) {
        const total = await web3.readContract.totalCats();
        setTotalCats(Number(total));
      }
    } catch {
      const { count } = await supabase.from("cats").select("*", { count: "exact", head: true });
      setTotalCats(count || 0);
    }

    try {
      if (web3.readContract) {
        const balance = await web3.readContract.getContractBalance();
        setTotalDonations(formatEther(balance));
      }
    } catch {
      setTotalDonations("0");
    }
  }, [web3.readContract]);

  useEffect(() => { fetchCats(); }, [fetchCats]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleRefresh = () => { fetchCats(); fetchStats(); };

  return (
    <>
      <SEO title="MARKME🐱W - 流浪猫绝育登记" description="基于区块链的流浪猫绝育登记平台" canonicalUrl="/" />
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <Sidebar collapsible="offcanvas" className="border-r border-border">
            <SidebarContent className="p-4 space-y-6">
              <div className="bg-primary/10 rounded-lg p-3 text-center">
                <span className="text-xs text-muted-foreground">已登记猫咪总数（链上）</span>
                <p className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
                  <PawPrint className="w-5 h-5" />
                  {totalCats}
                </p>
              </div>
              <Collapsible open={catRegOpen} onOpenChange={setCatRegOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full flex items-center justify-between px-2 py-2 h-auto">
                    <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Cat className="w-4 h-4" /> 猫咪登记
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${catRegOpen ? "rotate-180" : ""}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <CatRegistrationForm onRegistered={handleRefresh} contract={web3.contract} account={web3.account} />
                </CollapsibleContent>
              </Collapsible>
              <Collapsible open={donationOpen} onOpenChange={setDonationOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full flex items-center justify-between px-2 py-2 h-auto">
                    <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Heart className="w-4 h-4" /> 捐款箱
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${donationOpen ? "rotate-180" : ""}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <DonationBox totalDonations={totalDonations} onDonated={handleRefresh} contract={web3.contract} account={web3.account} />
                </CollapsibleContent>
              </Collapsible>
              <EventHistory readContract={web3.readContract} />
            </SidebarContent>
          </Sidebar>

          <div className="flex-1 flex flex-col min-h-screen">
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <SidebarTrigger>
                    <Menu className="w-5 h-5" />
                  </SidebarTrigger>
                  <h1 className="text-lg font-bold text-foreground">MARKME🐱W</h1>
                </div>
                <WalletButton web3={web3} />
              </div>
            </header>

            <div className="px-4 py-3 flex items-center gap-3">
              <div className="flex-1">
                <CatFilters
                  gender={filterGender} city={filterCity} neutered={filterNeutered}
                  onGenderChange={setFilterGender} onCityChange={setFilterCity} onNeuteredChange={setFilterNeutered}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 text-xs gap-1"
                onClick={() => setSortAsc((prev) => !prev)}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                ID {sortAsc ? "正序" : "倒序"}
              </Button>
            </div>

            <main className="flex-1 px-4 pb-8">
              {cats.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  <PawPrint className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>暂无猫咪记录，快去登记第一只猫咪吧！</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[...cats].sort((a, b) => {
                    const aId = parseInt(a.cat_id) || 0;
                    const bId = parseInt(b.cat_id) || 0;
                    return sortAsc ? aId - bId : bId - aId;
                  }).map((cat) => (
                    <CatCard key={cat.id} cat={cat} onClick={() => { setSelectedCat(cat); setModalOpen(true); }} />
                  ))}
                </div>
              )}
            </main>

            <footer className="border-t border-border px-4 py-3 text-center text-xs text-muted-foreground">
              🐾 关爱流浪猫，从绝育开始 · Powered by Avalanche Fuji Testnet
            </footer>
          </div>
        </div>
      </SidebarProvider>

      <CatDetailModal
        cat={selectedCat} open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedCat(null); }}
        onUpdated={handleRefresh}
        contract={web3.contract} account={web3.account}
      />
    </>
  );
};

export default Index;
