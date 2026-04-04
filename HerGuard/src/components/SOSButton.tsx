import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, AlertTriangle, Share2, Mail, Copy } from "lucide-react";
import { Contract } from "ethers";
import { playBeep, startDeterrentAudio, stopDeterrentAudio, isDeterrentPlaying_ } from "@/lib/audio";
import { addSOSHistory } from "@/lib/localStorage";
import { useOfflineBuffer } from "@/hooks/useOfflineBuffer";
import { shortenHash } from "@/hooks/useWallet";
import { reverseGeocode, generateShareData } from "@/lib/geocode";
import { loadContacts } from "@/lib/emergencyContacts";
import { toast } from "sonner";

type SOSState = "idle" | "pressing" | "loading" | "success" | "offline";

interface SOSButtonProps {
  contract: Contract | null;
  walletAddress: string | null;
  isWalletConnected: boolean;
  isCorrectNetwork: boolean;
  isSilent: boolean;
  voiceDeterrent: boolean;
  customAudioUrl: string | null;
}

export default function SOSButton({
  contract,
  walletAddress,
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
  const [shareData, setShareData] = useState<{ mapLink: string; text: string; smsBody: string } | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const startTimeRef = useRef<number>(0);
  const { addRecord } = useOfflineBuffer();

  const HOLD_DURATION = 3000;

  const triggerSOS = useCallback(async () => {
    setState("loading");

    // 1. 播放声音和闪光
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

    // 2. 获取地理位置
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
      // 失败则默认为 0,0
    }

    const latInt = Math.round(lat * 1_000_000);
    const lngInt = Math.round(lng * 1_000_000);

    // 3. 【核心改动】立即发送后端邮件，不等区块链
    const addressPromise = reverseGeocode(lat, lng);
    const contacts = loadContacts();

    // 启动一个不带 await 的异步任务发送邮件，防止区块链报错导致程序中断
    (async () => {
      try {
        const address = await addressPromise;
        if (contacts.length > 0) {
          const payload = {
            walletAddress: walletAddress || "",
            latitude: Number(lat) || 0,
            longitude: Number(lng) || 0,
            address: address || "未知位置",
            emergencyContacts: contacts.map((c) => ({
              name: c.name,
              email: c.email,
            })),
          };
          console.log("🚀 正在紧急发送邮件到后端...", payload);
          const resp = await fetch("https://herguard-backend.onrender.com/api/send-sos-sms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (resp.ok && !isSilent) toast.success("📧 求救邮件已发出！");
        }
      } catch (err) {
        console.error("邮件发送失败:", err);
      }
    })();

    // 4. 启动音频防卫
    if (voiceDeterrent && !isSilent) {
      startDeterrentAudio(customAudioUrl);
      setShowSafeButton(true);
    }

    // 5. 最后再尝试区块链存证（即使报错也不会影响邮件）
    if (contract && isWalletConnected && isCorrectNetwork) {
      try {
        if (!isSilent) toast("正在尝试区块链存证...");
        const tx = await contract.triggerSOS(latInt, lngInt, "");
        const receipt = await tx.wait();
        setTxHash(receipt.hash || tx.hash);
        setState("success");
        if (!isSilent) toast.success("✅ 区块链已存证");
      } catch (e) {
        console.error("区块链存证报错（可能是 SOS ID 问题）:", e);
        addRecord(lat, lng);
        setState("offline");
        if (!isSilent) toast("⚠️ 存证未成功，已暂存本地");
      }
    } else {
      addRecord(lat, lng);
      setState("offline");
    }

    // 生成分享数据
    const address = await addressPromise;
    setShareData(generateShareData(lat, lng, address));
    
  }, [contract, walletAddress, isWalletConnected, isCorrectNetwork, isSilent, voiceDeterrent, customAudioUrl, addRecord]);

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
    setShareData(null);
  };

  const handleCopyShare = () => {
    if (!shareData) return;
    navigator.clipboard.writeText(shareData.text).then(() => toast.success("已复制到剪贴板")).catch(() => {});
  };

  const handleEmailShare = () => {
    if (!shareData) return;
    const contacts = loadContacts();
    const emails = contacts.map((c) => c.email).join(",");
    window.open(`mailto:${emails}?subject=${encodeURIComponent("[紧急求救] HerGuard")}&body=${encodeURIComponent(shareData.text)}`, "_self");
  };

  const handleWhatsAppShare = () => {
    if (!shareData) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareData.text)}`, "_blank");
  };

  const resetAfterDelay = () => {
    setTimeout(() => {
      if (!isDeterrentPlaying_()) {
        setState("idle");
        setProgress(0);
        setTxHash(null);
        setShareData(null);
      }
    }, 30000);
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
        className={`relative aspect-square w-[70vw] max-w-[320px] select-none rounded-full ${bgColor} ${glowClass} transition-colors duration-500`}
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

      <p className="mt-4 text-center text-sm text-muted-foreground">
        {state === "idle" && "长按 3 秒触发"}
        {state === "pressing" && "继续按住..."}
        {state === "loading" && "正在获取位置并上链"}
        {state === "success" && "存证已上链至 Avalanche"}
        {state === "offline" && "离线，数据已暂存本地"}
      </p>

      {/* Share buttons */}
      <AnimatePresence>
        {shareData && (state === "success" || state === "offline") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="mt-4 flex flex-col items-center gap-2 w-full max-w-xs"
          >
            <p className="text-xs text-muted-foreground">📍 分享位置给紧急联系人</p>
            <div className="flex gap-2 w-full">
              <button onClick={handleEmailShare} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground">
                <Mail className="h-3.5 w-3.5" /> 邮件
              </button>
              <button onClick={handleWhatsAppShare} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground">
                <Share2 className="h-3.5 w-3.5" /> WhatsApp
              </button>
              <button onClick={handleCopyShare} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground">
                <Copy className="h-3.5 w-3.5" /> 复制
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSafeButton && (
          <motion.button
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            onClick={handleSafe}
            className="mt-4 rounded-full bg-sos-success px-8 py-3 text-base font-bold text-primary-foreground"
          >
            我已安全
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
