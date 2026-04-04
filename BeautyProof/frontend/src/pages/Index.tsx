import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ethers } from "ethers";
import HeroSection from "@/components/HeroSection";
import WhySection from "@/components/WhySection";
import WalletSection from "@/components/WalletSection";
import RecordForm from "@/components/RecordForm";
import QuerySection from "@/components/QuerySection";
import Navbar from "@/components/Navbar";
import SectionDivider from "@/components/SectionDivider";
import ScrollToTop from "@/components/ScrollToTop";
import ScrollProgress from "@/components/ScrollProgress";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { useLanguage } from "@/i18n/LanguageContext";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const CONTRACT_ADDRESS = "0xfF0519eF2d0dA815396Ea375B5BAC7ebE294d842";

const ABI = [
  "function recordProcedure(string _procedureType, string _productBatch, string _doctorId, string _notes)",
  "function getProcedure(uint256 _index) view returns (address user, string procedureType, string productBatch, string doctorId, string notes, uint256 timestamp)"
];

const Index = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [networkName, setNetworkName] = useState<string>("Unknown Network");
  const [txStatus, setTxStatus] = useState("");
  const [queryResult, setQueryResult] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  const resolveNetworkName = (chainId?: string) => {
    switch (chainId) {
      case "0xa869":
        return "Avalanche Fuji Testnet";
      case "0xaa36a7":
        return "Sepolia Testnet";
      default:
        return "Unknown Network";
    }
  };

  const syncWalletState = useCallback(async () => {
    if (!window.ethereum) {
      setAccount(null);
      setNetworkName("Unknown Network");
      return;
    }

    try {
      const isUnlocked =
        window.ethereum._metamask?.isUnlocked
          ? await window.ethereum._metamask.isUnlocked()
          : true;

      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      setNetworkName(resolveNetworkName(chainId));

      if (!isUnlocked) {
        setAccount(null);
        return;
      }

      const accounts = await window.ethereum.request({ method: "eth_accounts" });

      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        setAccount(null);
      }
    } catch (err) {
      console.error("Failed to sync wallet state:", err);
      setAccount(null);
      setNetworkName("Unknown Network");
    }
  }, []);

  useEffect(() => {
    syncWalletState();

    const interval = setInterval(() => {
      syncWalletState();
    }, 1500);

    const handleAccountsChanged = (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        setAccount(null);
      } else {
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = (chainId: string) => {
      setNetworkName(resolveNetworkName(chainId));
      syncWalletState();
    };

    if (window.ethereum) {
      window.ethereum.on?.("accountsChanged", handleAccountsChanged);
      window.ethereum.on?.("chainChanged", handleChainChanged);
    }

    return () => {
      clearInterval(interval);
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [syncWalletState]);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask.");
      return;
    }

    try {
      const isUnlocked =
        window.ethereum._metamask?.isUnlocked
          ? await window.ethereum._metamask.isUnlocked()
          : true;

      if (!isUnlocked) {
        alert("Please unlock MetaMask first.");
        setAccount(null);
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        alert("No wallet account found.");
        setAccount(null);
        return;
      }

      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      setNetworkName(resolveNetworkName(chainId));
      setAccount(accounts[0]);
    } catch (err) {
      console.error("Wallet connection failed", err);
      setAccount(null);
    }
  }, []);

  const ensureUnlocked = useCallback(async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask.");
      return false;
    }

    const isUnlocked =
      window.ethereum._metamask?.isUnlocked
        ? await window.ethereum._metamask.isUnlocked()
        : true;

    if (!isUnlocked) {
      alert("Please unlock MetaMask first.");
      setAccount(null);
      return false;
    }

    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (!accounts || accounts.length === 0) {
      alert("Please connect your wallet first.");
      setAccount(null);
      return false;
    }

    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    if (chainId !== "0xa869") {
      alert("Please switch to Avalanche Fuji Testnet.");
      return false;
    }

    return true;
  }, []);

  const submitRecord = useCallback(
    async (data: {
      procedureType: string;
      productBatch: string;
      doctorId: string;
      notes: string;
    }) => {
      const ok = await ensureUnlocked();
      if (!ok) return;

      try {
        setTxStatus("Waiting for wallet confirmation...");

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

        const tx = await contract.recordProcedure(
          data.procedureType,
          data.productBatch,
          data.doctorId,
          data.notes
        );

        setTxStatus("Transaction submitted. Waiting for confirmation...");

        await tx.wait();

        setTxStatus("Transaction confirmed on Avalanche Fuji ✅");
      } catch (err: any) {
        console.error("Submit failed:", err);
        setTxStatus(
          `Transaction failed: ${err?.reason || err?.shortMessage || err?.message || "Unknown error"}`
        );
      }
    },
    [ensureUnlocked]
  );

  const queryRecord = useCallback(
    async (index: string) => {
      const ok = await ensureUnlocked();
      if (!ok) return;

      try {
        const safeIndex = index?.trim() || "0";

        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

        const result = await contract.getProcedure(BigInt(safeIndex));

        setQueryResult({
          patient: result.user,
          procedureType: result.procedureType,
          productBatch: result.productBatch,
          doctorId: result.doctorId,
          notes: result.notes,
          timestamp: new Date(Number(result.timestamp) * 1000).toLocaleString(),
        });
      } catch (err: any) {
        console.error("Query failed:", err);
        alert(
          `Query failed: ${err?.reason || err?.shortMessage || err?.message || "Unknown error"}`
        );
      }
    },
    [ensureUnlocked]
  );

  return (
    <div className="relative min-h-screen bg-background pt-14">
      {loading && <LoadingSkeleton onLoaded={() => setLoading(false)} />}
      <Navbar />
      <ScrollToTop />
      <ScrollProgress />

      <div className="max-w-2xl mx-auto px-4 pb-16">
        <HeroSection />

        <SectionDivider />
        <div id="why" className="scroll-mt-16">
          <WhySection />
        </div>

        <SectionDivider />
        <div id="wallet" className="scroll-mt-16">
          <WalletSection
            account={account}
            onConnect={connectWallet}
            networkName={networkName}
          />
        </div>

        <SectionDivider />
        <div className="py-6 grid gap-6 md:grid-cols-2 md:max-w-none max-w-md mx-auto md:mx-0">
          <div id="submit" className="scroll-mt-16">
            <RecordForm
              onSubmit={submitRecord}
              status={txStatus}
              disabled={!account}
            />
          </div>

          <div id="query" className="scroll-mt-16">
            <QuerySection
              onQuery={queryRecord}
              result={queryResult}
              disabled={!account}
            />
          </div>
        </div>

        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 pt-6 border-t border-border/40 text-center text-xs text-muted-foreground space-y-1"
        >
          <p>{t("footer.text")}</p>
          <p>{t("footer.subtitle")}</p>
        </motion.footer>
      </div>
    </div>
  );
};

export default Index;
