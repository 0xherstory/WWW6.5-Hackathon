import { useState } from "react";
import DashboardPanel from "./DashboardPanel";

interface AccessRequest {
  id: number;
  researcher: string;
  purpose: string;
  purposeCn: string;
  status: "Pending" | "Approved";
}

const MOCK_REQUESTS: AccessRequest[] = [
  { id: 1, researcher: "Dr. Zhang — Beijing Eye Institute 张医生 — 北京眼科研究所", purpose: "Myopia progression study", purposeCn: "近视进展研究", status: "Pending" },
  { id: 2, researcher: "Oxford Retinal Lab 牛津视网膜实验室", purpose: "AI-based retinal screening", purposeCn: "基于AI的视网膜筛查", status: "Pending" },
  { id: 3, researcher: "WHO Vision Programme 世卫组织视力计划", purpose: "Global eye health statistics", purposeCn: "全球眼健康统计", status: "Approved" },
];

export default function DataAccessRequests({ address }: { address: string | null }) {
  const [requests, setRequests] = useState<AccessRequest[]>(MOCK_REQUESTS);

  const handleApprove = (id: number) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "Approved" as const } : r));
  };

  return (
    <DashboardPanel title="Data Access Requests" titleCn="数据访问请求" tag="05 · Requests 请求" tagColor="cyan">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left font-mono text-xs text-muted-foreground py-2 pr-4">RESEARCHER 研究者</th>
              <th className="text-left font-mono text-xs text-muted-foreground py-2 pr-4">PURPOSE 目的</th>
              <th className="text-left font-mono text-xs text-muted-foreground py-2 pr-4">STATUS 状态</th>
              <th className="text-right font-mono text-xs text-muted-foreground py-2">ACTION 操作</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(r => (
              <tr key={r.id} className="border-b border-border/50">
                <td className="py-3 pr-4 text-foreground text-xs">{r.researcher}</td>
                <td className="py-3 pr-4 text-muted-foreground">{r.purpose}<br/><span className="text-xs">{r.purposeCn}</span></td>
                <td className="py-3 pr-4">
                  <span className={`font-mono text-xs px-2 py-0.5 rounded border ${r.status === "Approved" ? "text-neon-green border-neon-green/50" : "text-amber border-amber/50"}`}>
                    {r.status === "Approved" ? "Approved 已批准" : "Pending 待审"}
                  </span>
                </td>
                <td className="py-3 text-right">
                  {r.status === "Pending" && (
                    <button onClick={() => handleApprove(r.id)} disabled={!address} className="font-mono text-xs px-3 py-1 rounded border border-primary/50 text-primary hover:bg-primary/10 transition-all disabled:opacity-50">
                      Approve 批准
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardPanel>
  );
}
