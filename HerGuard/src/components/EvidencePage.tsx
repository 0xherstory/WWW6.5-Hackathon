import { loadSOSHistory, SOSHistoryRecord } from "@/lib/localStorage";
import { useOfflineBuffer, OfflineSOSRecord } from "@/hooks/useOfflineBuffer";
import { shortenHash, shortenAddress } from "@/hooks/useWallet";
import { Check, AlertTriangle, Clock, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Contract } from "ethers";

interface ChainRecord {
  sosId: number;
  caller: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  isActive: boolean;
  emergencyContact: string;
}

interface EvidencePageProps {
  contract: Contract | null;
}

export default function EvidencePage({ contract }: EvidencePageProps) {
  const [localHistory, setLocalHistory] = useState<SOSHistoryRecord[]>([]);
  const [chainRecords, setChainRecords] = useState<ChainRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const { pendingRecords } = useOfflineBuffer();

  // Load local history
  useEffect(() => {
    setLocalHistory(loadSOSHistory());
  }, []);

  // Fetch ALL records from chain
  useEffect(() => {
    if (!contract) return;
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      try {
        const total = Number(await contract.getTotalSOSCount());
        const records: ChainRecord[] = [];
        for (let id = 1; id <= total; id++) {
          try {
            const rec = await contract.getSOSRecord(id);
            records.push({
              sosId: id,
              caller: rec[0],
              latitude: Number(rec[1]),
              longitude: Number(rec[2]),
              timestamp: Number(rec[3]),
              isActive: rec[4],
              emergencyContact: rec[5],
            });
          } catch { /* skip */ }
        }
        if (!cancelled) setChainRecords(records);
      } catch { /* ignore */ }
      if (!cancelled) setLoading(false);
    };
    fetch();
    return () => { cancelled = true; };
  }, [contract]);

  const formatTime = (ts: number) => new Date(ts * 1000).toLocaleString("zh-CN");
  const formatCoord = (v: number) => (v / 1_000_000).toFixed(6);

  return (
    <div className="flex flex-1 flex-col px-4 pb-20">
      <h2 className="mb-4 text-lg font-bold text-foreground">存证记录</h2>

      {/* Pending offline records */}
      {pendingRecords.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-2 text-sm font-semibold text-sos-offline">
            待上链 ({pendingRecords.length})
          </h3>
          {pendingRecords.map((rec: OfflineSOSRecord, i: number) => (
            <div key={i} className="mb-2 rounded-lg border border-sos-offline/30 bg-sos-offline/10 p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-sos-offline" />
                <span className="text-xs text-sos-offline">等待网络恢复</span>
              </div>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {formatCoord(rec.latitude)}, {formatCoord(rec.longitude)}
              </p>
              <p className="text-xs text-muted-foreground">{formatTime(rec.timestamp)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Chain records */}
      {loading && (
        <div className="mb-4 flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">正在从链上加载记录...</span>
        </div>
      )}

      {chainRecords.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-2 text-sm font-semibold text-primary">
            链上记录 ({chainRecords.length})
          </h3>
          <div className="space-y-2">
            {chainRecords.map((rec) => (
              <div key={rec.sosId} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-center gap-2">
                  {rec.isActive ? (
                    <AlertTriangle className="h-4 w-4 text-sos" />
                  ) : (
                    <Check className="h-4 w-4 text-sos-success" />
                  )}
                  <span className={`text-xs font-medium ${rec.isActive ? "text-sos" : "text-sos-success"}`}>
                    {rec.isActive ? "活跃求救" : "已解除"} #{rec.sosId}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {formatTime(rec.timestamp)}
                  </span>
                </div>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  📍 {formatCoord(rec.latitude)}, {formatCoord(rec.longitude)}
                </p>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                  👤 {shortenAddress(rec.caller)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Local-only records */}
      {localHistory.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
            本地记录 ({localHistory.length})
          </h3>
          <div className="space-y-2">
            {localHistory.map((rec, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-center gap-2">
                  {rec.status === "success" ? (
                    <Check className="h-4 w-4 text-sos-success" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-sos-offline" />
                  )}
                  <span className={`text-xs font-medium ${rec.status === "success" ? "text-sos-success" : "text-sos-offline"}`}>
                    {rec.status === "success" ? "已上链" : "本地存储"}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {formatTime(rec.timestamp)}
                  </span>
                </div>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {formatCoord(rec.latitude)}, {formatCoord(rec.longitude)}
                </p>
                {rec.txHash && (
                  <a
                    href={`https://testnet.snowtrace.io/tx/${rec.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block font-mono text-xs text-primary underline"
                  >
                    TX: {shortenHash(rec.txHash)}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && chainRecords.length === 0 && localHistory.length === 0 && pendingRecords.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
          <Clock className="h-10 w-10" />
          <span className="text-sm">{contract ? "暂无存证记录" : "连接钱包后可查看链上记录"}</span>
        </div>
      )}
    </div>
  );
}
