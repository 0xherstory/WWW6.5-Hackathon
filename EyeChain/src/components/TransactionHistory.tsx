import { useEffect, useState } from "react";
import { ethers } from "ethers";
import DashboardPanel from "./DashboardPanel";
import { flagToSymptoms, hasContractMethod } from "@/lib/contract";

interface Props {
  contract: ethers.Contract | null;
  address: string | null;
}

interface RiskEvent {
  timestamp: number;
  accelLoad: number;
  postureLoad: number;
  durationScore: number;
  symptomsFlag: number;
  totalRisk: number;
  simulated?: boolean;
}

const MOCK_EVENTS: RiskEvent[] = [
  { timestamp: Date.now() / 1000 - 86400, accelLoad: 35, postureLoad: 65, durationScore: 40, symptomsFlag: 3, totalRisk: 52, simulated: true },
  { timestamp: Date.now() / 1000 - 172800, accelLoad: 90, postureLoad: 85, durationScore: 65, symptomsFlag: 5, totalRisk: 78, simulated: true },
  { timestamp: Date.now() / 1000 - 259200, accelLoad: 10, postureLoad: 10, durationScore: 10, symptomsFlag: 0, totalRisk: 22, simulated: true },
];

export default function TransactionHistory({ contract, address }: Props) {
  const [events, setEvents] = useState<RiskEvent[]>([]);
  const [supported, setSupported] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [useMock, setUseMock] = useState(false);

  const fetchHistory = async () => {
    if (!contract || !address) return;

    setLoading(true);
    setMessage("");

    try {
      if (!hasContractMethod(contract, "getHistory")) {
        setSupported(false);
        setUseMock(true);
        setEvents(MOCK_EVENTS);
        setMessage("Simulation Mode — getHistory not in current ABI. Demo data shown.\n模拟模式 — 当前 ABI 不包含 getHistory。显示演示数据。");
        return;
      }

      setSupported(true);
      setUseMock(false);
      const history = await (contract as any).getHistory(address);
      const normalized = history.map((e: any) => ({
        timestamp: Number(e.timestamp),
        accelLoad: Number(e.accelLoad),
        postureLoad: Number(e.postureLoad),
        durationScore: Number(e.durationScore),
        symptomsFlag: Number(e.symptomsFlag),
        totalRisk: Number(e.totalRisk),
      })).reverse();

      setEvents(normalized);
      if (normalized.length === 0) {
        setMessage("No events recorded yet / 暂无风险事件记录");
      }
    } catch (err: any) {
      console.error("Failed to fetch history:", err);
      setUseMock(true);
      setEvents(MOCK_EVENTS);
      setMessage("Fallback to demo data due to error / 因错误回退至演示数据");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!contract || !address) {
      setEvents([]);
      setMessage("");
      return;
    }
    fetchHistory();
  }, [contract, address]);

  return (
    <DashboardPanel title="Transaction History" titleCn="交易历史" tag="06 · History 历史" tagColor="cyan">
      {!address ? (
        <p className="text-muted-foreground font-mono text-sm">Connect wallet to view history<br/>连接钱包查看历史</p>
      ) : (
        <>
          {useMock && (
            <div className="mb-3 p-3 bg-amber/10 border border-amber/30 rounded-lg">
              <p className="font-mono text-xs text-amber">{message}</p>
            </div>
          )}

          {events.length === 0 ? (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-muted-foreground font-mono text-sm break-words">{message || "No events recorded yet / 暂无记录"}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left font-mono text-xs text-muted-foreground py-2">#</th>
                    <th className="text-left font-mono text-xs text-muted-foreground py-2">TIME 时间</th>
                    <th className="text-left font-mono text-xs text-muted-foreground py-2">RISK 风险</th>
                    <th className="text-left font-mono text-xs text-muted-foreground py-2">ACCEL 加速</th>
                    <th className="text-left font-mono text-xs text-muted-foreground py-2">POSTURE 姿态</th>
                    <th className="text-left font-mono text-xs text-muted-foreground py-2">SYMPTOMS 症状</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((e, i) => {
                    const symptoms = flagToSymptoms(e.symptomsFlag);
                    const symList = Object.entries(symptoms).filter(([, v]) => v).map(([k]) => k);

                    return (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-2 text-muted-foreground font-mono">{events.length - i}{e.simulated ? " *" : ""}</td>
                        <td className="py-2 text-foreground font-mono text-xs">{new Date(e.timestamp * 1000).toLocaleString()}</td>
                        <td className="py-2">
                          <span className={`font-heading font-bold ${e.totalRisk >= 85 ? "text-destructive" : e.totalRisk >= 70 ? "text-amber" : "text-neon-green"}`}>
                            {e.totalRisk}
                          </span>
                        </td>
                        <td className="py-2 text-foreground">{e.accelLoad}</td>
                        <td className="py-2 text-foreground">{e.postureLoad}</td>
                        <td className="py-2 text-muted-foreground text-xs">{symList.length > 0 ? symList.join(", ") : "— 无"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <button onClick={fetchHistory} disabled={loading || !address} className="mt-4 px-4 py-2 rounded-lg font-mono text-xs tracking-wider uppercase border border-primary/50 text-primary hover:bg-primary/10 transition-all disabled:opacity-50">
            {loading ? "Loading... 加载中..." : "Refresh History 刷新历史"}
          </button>
        </>
      )}
    </DashboardPanel>
  );
}
