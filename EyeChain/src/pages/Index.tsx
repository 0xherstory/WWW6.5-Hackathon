import { useState } from "react";
import { useWallet } from "@/lib/useWallet";
import ConnectWallet from "@/components/ConnectWallet";
import UserRegistration from "@/components/UserRegistration";
import SubmitRiskEvent from "@/components/SubmitRiskEvent";
import type { RiskSubmission } from "@/components/SubmitRiskEvent";
import HealthDataOverview from "@/components/HealthDataOverview";
import DataSharing from "@/components/DataSharing";
import DataAccessRequests from "@/components/DataAccessRequests";
import TransactionHistory from "@/components/TransactionHistory";
import AdminControls from "@/components/AdminControls";
import RiskMonitoringDiagram from "@/components/RiskMonitoringDiagram";
import EducationalContext from "@/components/EducationalContext";
import HealthWisdomCenter from "@/components/HealthWisdomCenter";
import MedicalLog from "@/components/MedicalLog";

const NAV_ITEMS = [
  "Connect 连接", "Register 注册", "Risk 风险", "Overview 概览",
  "Monetize 变现", "Requests 请求", "History 历史", "Admin 管理",
  "Algorithm 算法", "Learn 学习", "Wiki 百科", "Log 日志",
];

export default function Index() {
  const { address, contract, loading, connect } = useWallet();
  const [lastSubmission, setLastSubmission] = useState<RiskSubmission | null>(null);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto">
          {NAV_ITEMS.map((item, i) => (
            <button
              key={item}
              onClick={() => scrollTo(`section-${i}`)}
              className="font-mono text-xs px-3 py-1.5 rounded border border-border text-muted-foreground hover:border-primary hover:text-primary transition-all whitespace-nowrap tracking-wider uppercase"
            >
              {item}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div id="section-0"><ConnectWallet address={address} loading={loading} onConnect={connect} /></div>
        <div id="section-1"><UserRegistration contract={contract} address={address} /></div>
        <div id="section-2"><SubmitRiskEvent contract={contract} address={address} onRiskSubmitted={setLastSubmission} /></div>
        <div id="section-3"><HealthDataOverview contract={contract} address={address} /></div>
        <div id="section-4"><DataSharing address={address} lastSubmission={lastSubmission} /></div>
        <div id="section-5"><DataAccessRequests address={address} /></div>
        <div id="section-6"><TransactionHistory contract={contract} address={address} /></div>
        <div id="section-7"><AdminControls contract={contract} address={address} /></div>
        <div id="section-8"><RiskMonitoringDiagram /></div>
        <div id="section-9"><EducationalContext /></div>
        <div id="section-10"><HealthWisdomCenter lastSubmission={lastSubmission} /></div>
        <div id="section-11"><MedicalLog /></div>

        <footer className="mt-12 border-t border-border/50 pt-6 pb-8 text-center">
          <p className="font-mono text-xs text-muted-foreground tracking-widest">
            EYECHAIN · AVALANCHE FUJI TESTNET · v2026.SUSTAIN.v1
          </p>
          <p className="font-mono text-xs text-muted-foreground tracking-wider mt-1">
            眼链 · 雪崩 Fuji 测试网 · v2026.SUSTAIN.v1
          </p>
        </footer>
      </main>
    </div>
  );
}
