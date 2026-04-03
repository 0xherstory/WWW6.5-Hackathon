import { loadSOSHistory, SOSHistoryRecord } from "@/lib/localStorage";
import { useOfflineBuffer, OfflineSOSRecord } from "@/hooks/useOfflineBuffer";
import { shortenHash } from "@/hooks/useWallet";
import { Check, AlertTriangle, Clock } from "lucide-react";
import { useState, useEffect } from "react";

export default function EvidencePage() {
  const [history, setHistory] = useState<SOSHistoryRecord[]>([]);
  const { pendingRecords } = useOfflineBuffer();

  useEffect(() => {
    setHistory(loadSOSHistory());
  }, []);

  const formatTime = (ts: number) => {
    const d = new Date(ts * 1000);
    return d.toLocaleString("zh-CN");
  };

  const formatCoord = (v: number) => (v / 1_000_000).toFixed(6);

  return (
    <div className="flex flex-1 flex-col px-4 pb-20">
      <h2 className="mb-4 text-lg font-bold text-foreground">存证记录</h2>

      {pendingRecords.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-2 text-sm font-semibold text-sos-offline">
            待上链 ({pendingRecords.length})
          </h3>
          {pendingRecords.map((rec: OfflineSOSRecord, i: number) => (
            <div
              key={i}
              className="mb-2 rounded-lg border border-sos-offline/30 bg-sos-offline/10 p-3"
            >
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

      {history.length === 0 && pendingRecords.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
          <Clock className="h-10 w-10" />
          <span className="text-sm">暂无存证记录</span>
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-2">
          {history.map((rec, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center gap-2">
                {rec.status === "success" ? (
                  <Check className="h-4 w-4 text-sos-success" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-sos-offline" />
                )}
                <span
                  className={`text-xs font-medium ${
                    rec.status === "success" ? "text-sos-success" : "text-sos-offline"
                  }`}
                >
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
      )}
    </div>
  );
}
