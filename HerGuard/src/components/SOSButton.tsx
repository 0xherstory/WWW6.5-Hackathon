import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, AlertTriangle } from "lucide-react";
import { Contract } from "ethers";
import { playBeep, startDeterrentAudio, stopDeterrentAudio, isDeterrentPlaying_ } from "@/lib/audio";
import { addSOSHistory } from "@/lib/localStorage";
import { useOfflineBuffer } from "@/hooks/useOfflineBuffer";
import { shortenHash } from "@/hooks/useWallet";
import { toast } from "sonner";

type SOSState = "idle" | "pressing" | "loading" | "success" | "offline";

interface SOSButtonProps {
  contract: Contract | null;
  isWalletConnected: boolean;
  isCorrectNetwork: boolean;
  isSilent: boolean;
  voiceDeterrent: boolean;
  customAudioUrl: string | null;
}

export default function SOSButton({
  contract,
  isWalletConnected,
  isCorrectNetwork,
  isSilent,
  voiceDeterrent,
  customAudioUrl,
}: SOSButtonProps) {
  const [state, setState] = useState<SOSState>("idle");
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [showSafeButton, setShowSafeButton] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const startTimeRef = useRef<number>(0);
  const { addRecord } = useOfflineBuffer();

  const HOLD_DURATION = 3000;

  const triggerSOS = useCallback(async () => {
    setState("loading");

    if (!isSilent) {
      playBeep();
      const flashEl = document.getElementById("screen-flash");
      if (flashEl) {
        flashEl.classList.add("screen-flash");
        flashEl.style.opacity = "0.5";
        setTimeout(() => {
          flashEl.classList.remove("screen-flash");
          flashEl.style.opacity = "0";
        }, 300);
      }
    }

    let lat = 0, lng = 0;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        })
      );
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
    } catch {
      // fallback to 0,0
    }

    const latInt = Math.round(lat * 1_000_000);
    const lngInt = Math.round(lng * 1_000_000);

    addSOSHistory({
      latitude: latInt,
      longitude: lngInt,
      timestamp: Math.floor(Date.now() / 1000),
      status: "pending",
    });

    // Start deterrent audio if sound is on
    if (voiceDeterrent && !isSilent) {
      startDeterrentAudio(customAudioUrl);
      setShowSafeButton(true);
    }

    if (contract && isWalletConnected && isCorrectNetwork) {
      try {
        if (!isSilent) toast("正在上链...");
        const tx = await contract.triggerSOS(latInt, lngInt, "");
        const receipt = await tx.wait();
        const hash = receipt.hash || tx.hash;
        setTxHash(hash);
        setState("success");

        addSOSHistory({
          latitude: latInt,
          longitude: lngInt,
          timestamp: Math.floor(Date.now() / 1000),
          txHash: hash,
          status: "success",
        });

        if (!isSilent) toast.success("✅ 已安全存证");
        return;
      } catch {
        // Fall through to offline
      }
    }

    addRecord(lat, lng);
    setState("offline");
    if (!isSilent) toast("⚠️ 已本地存储，等待网络恢复");
  }, [contract, isWalletConnected, isCorrectNetwork, isSilent, voiceDeterrent, customAudioUrl, addRecord]);

  const handlePointerDown = useCallback(() => {
    if (state === "loading" || state === "success") return;
    setState("pressing");
    setProgress(0);
    setCountdown(3);
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(elapsed / HOLD_DURATION, 1);
      setProgress(pct);
      setCountdown(Math.max(0, 3 - Math.floor(elapsed / 1000)));

      if (pct >= 1) {
        clearInterval(intervalRef.current);
        triggerSOS();
      }
    }, 30);
  }, [state, triggerSOS]);

  const handlePointerUp = useCallback(() => {
    if (state === "pressing") {
      clearInterval(intervalRef.current);
      setState("idle");
      setProgress(0);
      setCountdown(3);
    }
  }, [state]);

  const handleSafe = () => {
    stopDeterrentAudio();
    setShowSafeButton(false);
    setState("idle");
    setProgress(0);
    setTxHash(null);
  };

  const resetAfterDelay = () => {
    setTimeout(() => {
      if (!isDeterrentPlaying_()) {
        setState("idle");
        setProgress(0);
        setTxHash(null);
      }
    }, 8000);
  };

  if (state === "success" || state === "offline") {
    resetAfterDelay();
  }

  const bgColor = {
    idle: "bg-sos",
    pressing: "bg-sos-pressing",
    loading: "bg-sos",
    success: "bg-sos-success",
    offline: "bg-sos-offline",
  }[state];

  const glowClass = {
    idle: "shadow-[0_0_40px_hsl(var(--sos-glow)),0_0_80px_hsl(var(--sos-glow))]",
    pressing: "shadow-[0_0_40px_hsl(var(--sos-pressing-glow)),0_0_80px_hsl(var(--sos-pressing-glow))]",
    loading: "shadow-[0_0_40px_hsl(var(--sos-glow)),0_0_80px_hsl(var(--sos-glow))]",
    success: "shadow-[0_0_40px_hsl(var(--sos-success-glow)),0_0_80px_hsl(var(--sos-success-glow))]",
    offline: "shadow-[0_0_30px_hsl(45_93%_58%/0.3)]",
  }[state];

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <div
        id="screen-flash"
        className="pointer-events-none fixed inset-0 z-[100] bg-primary opacity-0 transition-opacity"
      />

      <motion.button
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={`relative aspect-square w-[80vw] max-w-[360px] select-none rounded-full ${bgColor} ${glowClass} transition-colors duration-500`}
        whileTap={state === "idle" ? { scale: 0.95 } : {}}
        style={{ touchAction: "none" }}
      >
        {state === "pressing" && (
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="hsl(var(--foreground) / 0.15)" strokeWidth="3" />
            <motion.circle
              cx="50" cy="50" r="46" fill="none" stroke="hsl(var(--foreground))" strokeWidth="3"
              strokeLinecap="round" strokeDasharray={289} strokeDashoffset={289 * (1 - progress)}
            />
          </svg>
        )}

        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
          <AnimatePresence mode="wait">
            {state === "idle" && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-2">
                <span className="text-5xl font-black tracking-wider text-primary-foreground">SOS</span>
                <span className="text-lg font-bold text-primary-foreground/90">紧急求救</span>
              </motion.div>
            )}
            {state === "pressing" && (
              <motion.div key="pressing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-1">
                <span className="text-7xl font-black text-primary-foreground">{countdown}</span>
                <span className="text-sm text-primary-foreground/80">{Math.round(progress * 100)}%</span>
              </motion.div>
            )}
            {state === "loading" && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-2">
                <Loader2 className="h-14 w-14 animate-spin text-primary-foreground" />
                <span className="text-sm font-medium text-primary-foreground/80">正在上链...</span>
              </motion.div>
            )}
            {state === "success" && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-2">
                <Check className="h-16 w-16 text-primary-foreground" strokeWidth={3} />
                <span className="text-lg font-bold text-primary-foreground">已安全存证</span>
                {txHash && (
                  <a href={`https://testnet.snowtrace.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
                    className="font-mono text-xs text-primary-foreground/70 underline" onClick={(e) => e.stopPropagation()}>
                    {shortenHash(txHash)}
                  </a>
                )}
              </motion.div>
            )}
            {state === "offline" && (
              <motion.div key="offline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-2">
                <AlertTriangle className="h-14 w-14 text-background" />
                <span className="text-base font-bold text-background">已本地存储</span>
                <span className="text-xs text-background/70">等待网络恢复</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.button>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {state === "idle" && "长按 3 秒触发"}
        {state === "pressing" && "继续按住..."}
        {state === "loading" && "正在获取位置并上链"}
        {state === "success" && "存证已上链至 Avalanche"}
        {state === "offline" && "离线，数据已暂存本地"}
      </p>

      <AnimatePresence>
        {showSafeButton && (
          <motion.button
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            onClick={handleSafe}
            className="mt-6 rounded-full bg-sos-success px-8 py-3 text-base font-bold text-primary-foreground"
          >
            我已安全
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
