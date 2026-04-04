import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useSilentMode } from "@/hooks/useSilentMode";
import WalletConnect from "@/components/WalletConnect";
import TopBarToggles from "@/components/TopBarToggles";
import SOSButton from "@/components/SOSButton";
import OfflineBanner from "@/components/OfflineBanner";
import BottomNav from "@/components/BottomNav";
import MapPage from "@/components/MapPage";
import EvidencePage from "@/components/EvidencePage";
import SettingsPage from "@/components/SettingsPage";
import { Shield } from "lucide-react";

const CONTRACT_ADDRESS = "0x79B1A83d803213560BA5AF373FDcE54d1e84f18c";

export default function Index() {
  const [activeTab, setActiveTab] = useState<"sos" | "map" | "evidence" | "settings">("sos");
  const walletHook = useWallet(CONTRACT_ADDRESS);
  const { soundOn, toggleSound, isSilent, voiceDeterrent, customAudioUrl, saveCustomAudio } = useSilentMode();

  const { wallet } = walletHook;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold text-foreground">HerGuard</span>
        </div>
        <div className="flex items-center gap-3">
          <TopBarToggles soundOn={soundOn} onToggleSound={toggleSound} />
          <WalletConnect contractAddress={CONTRACT_ADDRESS} walletHook={walletHook} />
        </div>
      </header>

      {/* Network warning */}
      {wallet.isConnected && !wallet.isCorrectNetwork && (
        <div className="mx-4 mb-2 rounded-lg bg-wallet-warning/10 px-3 py-2 text-center text-xs text-wallet-warning">
          ⚠️ 请切换到 Avalanche Fuji C-Chain
        </div>
      )}

      {/* Offline banner */}
      <OfflineBanner
        contract={wallet.contract}
        isWalletConnected={wallet.isConnected}
        isCorrectNetwork={wallet.isCorrectNetwork}
        isSilent={isSilent}
      />

      {/* Main content */}
      <main className="flex flex-1 flex-col pb-16">
        {activeTab === "sos" && (
          <SOSButton
            contract={wallet.contract}
            walletAddress={wallet.address}
            isWalletConnected={wallet.isConnected}
            isCorrectNetwork={wallet.isCorrectNetwork}
            isSilent={isSilent}
            voiceDeterrent={voiceDeterrent}
            customAudioUrl={customAudioUrl}
          />
        )}
        {activeTab === "map" && <MapPage contract={wallet.contract} />}
        {activeTab === "evidence" && <EvidencePage contract={wallet.contract} />}
        {activeTab === "settings" && (
          <SettingsPage customAudioUrl={customAudioUrl} onSaveAudio={saveCustomAudio} />
        )}
      </main>

      {/* Bottom nav */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
