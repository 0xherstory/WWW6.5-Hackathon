import { useEffect, useState } from "react";
import { useOfflineBuffer } from "@/hooks/useOfflineBuffer";
import { Contract } from "ethers";
import { addSOSHistory } from "@/lib/localStorage";
import { toast } from "sonner";

interface OfflineBannerProps {
  contract: Contract | null;
  isWalletConnected: boolean;
  isCorrectNetwork: boolean;
  isSilent: boolean;
}

export default function OfflineBanner({
  contract,
  isWalletConnected,
  isCorrectNetwork,
  isSilent,
}: OfflineBannerProps) {
  const { pendingRecords, removeRecord } = useOfflineBuffer();
  const [isRetrying, setIsRetrying] = useState(false);

  const canRetry = contract && isWalletConnected && isCorrectNetwork;
  const count = pendingRecords.length;

  useEffect(() => {
    // Check on mount if there are pending records
  }, []);

  if (count === 0) return null;

  const handleRetry = async () => {
    if (!contract || isRetrying) return;
    setIsRetrying(true);

    for (let i = pendingRecords.length - 1; i >= 0; i--) {
      const rec = pendingRecords[i];
      try {
        const tx = await contract.triggerSOS(rec.latitude, rec.longitude, "");
        const receipt = await tx.wait();
        addSOSHistory({
          latitude: rec.latitude,
          longitude: rec.longitude,
          timestamp: rec.timestamp,
          txHash: receipt.hash || tx.hash,
          status: "success",
        });
        removeRecord(i);
      } catch {
        break;
      }
    }

    setIsRetrying(false);
    if (!isSilent) toast.success("补发完成");
  };

  return (
    <div className="mx-4 mb-3 rounded-lg border border-sos-offline/30 bg-sos-offline/10 px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-sos-offline">
          您有 {count} 条未发送的安全存证
        </span>
        <button
          onClick={handleRetry}
          disabled={!canRetry || isRetrying}
          className="rounded-md bg-sos-offline/20 px-3 py-1 text-xs font-medium text-sos-offline transition-colors hover:bg-sos-offline/30 disabled:opacity-50"
        >
          {isRetrying ? "补发中..." : "补发"}
        </button>
      </div>
    </div>
  );
}
