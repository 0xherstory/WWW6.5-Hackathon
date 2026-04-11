import { useState } from "react";
import { ethers } from "ethers";
import DashboardPanel from "./DashboardPanel";
import { hasContractMethod } from "@/lib/contract";

interface Props {
  contract: ethers.Contract | null;
  address: string | null;
}

const MOCK_DAO_PROPOSALS = [
  { id: "EIP-042", title: "Increase alert threshold to 75", titleCn: "将警报阈值提高到 75", status: "Active 活跃", votes: 12 },
  { id: "EIP-041", title: "Add myopia risk factor weighting", titleCn: "增加近视风险因子权重", status: "Passed 通过", votes: 23 },
  { id: "EIP-040", title: "Update laser treatment scoring model", titleCn: "更新激光治疗评分模型", status: "Passed 通过", votes: 18 },
];

export default function AdminControls({ contract, address }: Props) {
  const [alertThresh, setAlertThresh] = useState(70);
  const [criticalThresh, setCriticalThresh] = useState(85);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const adminSupported = hasContractMethod(contract, "recalibrate");

  const handleSimulateRecalibrate = async () => {
    setLoading(true);
    setStatusMessage("");
    try {
      await new Promise(r => setTimeout(r, 1500));
      setStatusMessage(`[SIMULATION] Thresholds updated: Alert=${alertThresh}, Critical=${criticalThresh}\n[模拟] 阈值已更新：警报=${alertThresh}，危急=${criticalThresh}`);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-foreground font-body focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary";
  const labelClass = "block font-mono text-xs text-muted-foreground tracking-wider uppercase mb-1.5";

  return (
    <DashboardPanel title="Admin / DAO Controls" titleCn="管理员 / DAO 控制" tag="07 · Admin 管理" tagColor="magenta">
      <div className="mb-4 p-3 bg-magenta/10 border border-magenta/30 rounded-lg">
        <p className="font-mono text-xs text-magenta">
          {adminSupported
            ? "DAO admin functions detected in contract ABI / 已检测到合约 ABI 中的 DAO 管理函数"
            : "Simulation Mode — recalibrate not in current ABI. Demo data shown below.\n模拟模式 — 当前 ABI 不包含 recalibrate。以下为演示数据。"}
        </p>
      </div>

      <p className="text-muted-foreground text-sm mb-4 font-mono">
        DAO governance controls for risk model calibration
        <br />用于风险模型校准的 DAO 治理控制
      </p>

      <div className="mb-6">
        <p className="font-mono text-xs text-muted-foreground tracking-wider uppercase mb-3">ACTIVE PROPOSALS 活跃提案</p>
        <div className="space-y-2">
          {MOCK_DAO_PROPOSALS.map(p => (
            <div key={p.id} className="flex items-center justify-between bg-muted rounded-lg px-4 py-3">
              <div>
                <span className="font-mono text-xs text-primary mr-2">{p.id}</span>
                <span className="text-sm text-foreground">{p.title}</span>
                <span className="block text-xs text-muted-foreground">{p.titleCn}</span>
              </div>
              <div className="text-right">
                <span className={`font-mono text-xs px-2 py-0.5 rounded border ${p.status.includes("Active") ? "text-neon-green border-neon-green" : "text-muted-foreground border-border"}`}>{p.status}</span>
                <span className="block font-mono text-xs text-muted-foreground mt-1">{p.votes} votes 票</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelClass}>Alert Threshold 警报阈值</label>
          <input type="range" min={30} max={90} value={alertThresh} onChange={e => setAlertThresh(Number(e.target.value))} className="w-full mb-1" />
          <span className="font-mono text-xs text-foreground">{alertThresh}</span>
        </div>
        <div>
          <label className={labelClass}>Critical Threshold 危急阈值</label>
          <input type="range" min={50} max={100} value={criticalThresh} onChange={e => setCriticalThresh(Number(e.target.value))} className="w-full mb-1" />
          <span className="font-mono text-xs text-foreground">{criticalThresh}</span>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <p className="font-mono text-xs text-muted-foreground break-words whitespace-pre-line">{statusMessage}</p>
        </div>
      )}

      <button onClick={handleSimulateRecalibrate} disabled={loading || !address} className="w-full py-3 rounded-lg font-mono text-sm tracking-wider uppercase border border-magenta/50 bg-magenta/10 text-magenta hover:bg-magenta/20 transition-all disabled:opacity-50">
        {loading ? "Updating... 更新中..." : "Update Thresholds (Simulation) 更新阈值（模拟）"}
      </button>
    </DashboardPanel>
  );
}
