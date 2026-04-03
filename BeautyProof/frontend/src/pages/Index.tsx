import { useState, useCallback } from "react";
import { motion } from "framer-motion";
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

const Index = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState("");
  const [queryResult, setQueryResult] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
    } catch (err) {
      console.error("Wallet connection failed", err);
    }
  }, []);

  const submitRecord = useCallback(
    async (data: {
      procedureType: string;
      productBatch: string;
      doctorId: string;
      notes: string;
    }) => {
      if (!account) {
        alert("Connect wallet first.");
        return;
      }
      setTxStatus("Submitting transaction…");
      setTimeout(() => {
        setTxStatus("Transaction submitted. Awaiting confirmation…");
      }, 1500);
    },
    [account]
  );

  const queryRecord = useCallback(
    async (index: string) => {
      if (!account) {
        alert("Connect wallet first.");
        return;
      }
      setQueryResult({
        procedureType: "Botox",
        productBatch: "BTX-2024-0042",
        doctorId: "DR-8812",
        notes: "Upper forehead, 20 units",
        timestamp: new Date().toLocaleString(),
        patient: account,
      });
    },
    [account]
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
          <WalletSection account={account} onConnect={connectWallet} />
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
