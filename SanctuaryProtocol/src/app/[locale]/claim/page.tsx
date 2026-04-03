"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useAccount } from "wagmi";
import { 
  getPoolStatus, 
  getDynamicClaimAmount,
  claimWithEmailVerification,
  type PoolStatus 
} from "@/lib/web3/sanctuaryContract";
import { useClaimStore } from "@/stores/claimStore";
import WalletButton from "@/components/wallet/WalletButton";

interface RequirementCheck {
  id: string;
  label: string;
  passed: boolean;
}

export default function ClaimPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { 
    isVerified, 
    emailHash, 
    setIsClaiming, 
    setHasClaimed, 
    setClaimAmount, 
    setClaimTxHash 
  } = useClaimStore();

  const [poolStatus, setPoolStatus] = useState<PoolStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dynamicClaimAmount, setDynamicClaimAmount] = useState<string>("0");
  const [isClaimingNow, setIsClaimingNow] = useState(false);
  const [claimError, setClaimError] = useState("");

  const [requirements, setRequirements] = useState<RequirementCheck[]>([
    { id: "wallet", label: t('claim.requirements.wallet'), passed: false },
    { id: "completed", label: t('claim.requirements.completed'), passed: false },
    { id: "timeSpent", label: t('claim.requirements.timeSpent'), passed: false },
    { id: "wordCount", label: t('claim.requirements.wordCount'), passed: false },
    { id: "verified", label: t('claim.requirements.verified'), passed: false },
  ]);

  useEffect(() => {
    const fetchPoolStatus = async () => {
      setIsLoading(true);
      
      // 获取资金池状态
      const status = await getPoolStatus();
      setPoolStatus(status);
      
      // 获取动态领取金额
      const claimAmount = await getDynamicClaimAmount();
      setDynamicClaimAmount(claimAmount);
      
      // 检查本地存储的日记数据
      const storedJournal = localStorage.getItem("oh-card-current-journal");
      if (storedJournal) {
        try {
          const journal = JSON.parse(storedJournal);
          const timeSpent = journal.startTime 
            ? Math.floor((Date.now() - new Date(journal.startTime).getTime()) / 1000 / 60)
            : 0;
          const wordCount = journal.content?.length || 0;

          setRequirements(prev => prev.map(req => {
            switch (req.id) {
              case "wallet":
                return { ...req, passed: isConnected };
              case "completed":
                return { ...req, passed: !!journal.content };
              case "timeSpent":
                return { ...req, passed: timeSpent >= 3 };
              case "wordCount":
                return { ...req, passed: wordCount >= 50 };
              case "verified":
                return { ...req, passed: isVerified };
              default:
                return req;
            }
          }));
        } catch (e) {
          console.error("Failed to parse journal:", e);
        }
      } else {
        // 更新钱包连接状态和验证状态
        setRequirements(prev => prev.map(req => {
          if (req.id === "wallet") return { ...req, passed: isConnected };
          if (req.id === "verified") return { ...req, passed: isVerified };
          return req;
        }));
      }

      setIsLoading(false);
    };

    fetchPoolStatus();
    // 每 30 秒刷新一次
    const interval = setInterval(fetchPoolStatus, 30000);
    return () => clearInterval(interval);
  }, [t, isConnected, isVerified]);

  const allRequirementsMet = requirements.every(r => r.passed);
  const canApply = poolStatus && parseFloat(poolStatus.available) > 0 && allRequirementsMet && isVerified && emailHash;

  const handleClaim = async () => {
    if (!canApply || !emailHash) return;
    
    setIsClaimingNow(true);
    setClaimError("");
    setIsClaiming(true);

    try {
      const txHash = await claimWithEmailVerification(emailHash as `0x${string}`);
      
      if (txHash) {
        // 保存交易记录（按钱包地址隔离）
        const storageKey = address ? `oh-card-transactions-${address}` : 'oh-card-transactions';
        const existingTransactions = JSON.parse(localStorage.getItem(storageKey) || '[]');
        existingTransactions.push({
          type: 'claim',
          txHash: txHash,
          timestamp: Date.now(),
          amount: dynamicClaimAmount,
          description: t('claim.txDescription', { amount: dynamicClaimAmount })
        });
        localStorage.setItem(storageKey, JSON.stringify(existingTransactions));

        // 更新 claim store
        setHasClaimed(true);
        setClaimAmount(dynamicClaimAmount);
        setClaimTxHash(txHash);
        
        // 跳转到成功页面
        router.push(`/${locale}/success`);
      } else {
        setClaimError(t('claim.error.failed'));
      }
    } catch (error) {
      console.error("Claim error:", error);
      setClaimError(t('claim.error.generic'));
    } finally {
      setIsClaimingNow(false);
      setIsClaiming(false);
    }
  };

  const handleVerifyEmail = () => {
    router.push(`/${locale}/verification`);
  };

  const handleNotToday = () => {
    router.push(`/${locale}/sanctuary`);
  };

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-accent/30" />
            <div className="w-1.5 h-1.5 border border-accent/50 rotate-45" />
            <div className="w-8 h-px bg-accent/30" />
          </div>

          <h1 className="text-h2 font-serif text-text mb-4">
            {t('claim.title')}
          </h1>
          <p className="text-body text-accent mb-2 italic">
            {t('claim.intro')}
          </p>
          <p className="text-small text-muted">
            {t('claim.description')}
          </p>
        </div>

        {/* 钱包连接按钮 */}
        <div className="flex justify-center mb-8">
          <WalletButton />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent/20 border-t-accent" />
          </div>
        ) : (
          <>
            <div className="relative bg-white border border-secondary p-6 mb-6">
              <span className="absolute top-3 left-3 w-2 h-2 border-t border-l border-accent/30" />
              <span className="absolute top-3 right-3 w-2 h-2 border-t border-r border-accent/30" />
              <span className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-accent/30" />
              <span className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-accent/30" />
              
              <h2 className="text-h3 font-serif text-text mb-4 text-center">
                {t('claim.pool.title')}
              </h2>
              
              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div>
                  <p className="text-h3 font-serif text-accent">{poolStatus?.balance || "0"} AVAX</p>
                  <p className="text-tag text-muted">{t('claim.pool.balance')}</p>
                  <p className="text-tag text-muted/60 mt-1">
                    {t('claim.pool.available')}: {poolStatus?.available || "0"}
                  </p>
                </div>
                <div>
                  <p className="text-h3 font-serif text-accent">{poolStatus?.claimCount || 0}</p>
                  <p className="text-tag text-muted">{t('claim.pool.helped')} {t('claim.pool.people')}</p>
                </div>
                <div>
                  <p className="text-h3 font-serif text-accent">{poolStatus?.donationCount || 0}</p>
                  <p className="text-tag text-muted">{t('claim.pool.guardians')}</p>
                </div>
              </div>

              {/* 动态领取金额 */}
              <div className="text-center py-3 mb-4 border border-accent/20 bg-accent/5">
                <p className="text-body text-text">
                  {t('claim.currentClaim')}: <span className="font-medium text-accent">{dynamicClaimAmount} AVAX</span>
                </p>
              </div>

              <div className={`text-center py-3 border ${
                poolStatus && parseFloat(poolStatus.available) > 0
                  ? "border-green-200 bg-green-50/50 text-green-700" 
                  : "border-amber-200 bg-amber-50/50 text-amber-700"
              }`}>
                {poolStatus && parseFloat(poolStatus.available) > 0
                  ? t('claim.pool.sufficient')
                  : t('claim.pool.insufficient')}
              </div>
            </div>

            <div className="relative bg-white border border-secondary p-6 mb-6">
              <span className="absolute top-3 left-3 w-2 h-2 border-t border-l border-accent/30" />
              <span className="absolute top-3 right-3 w-2 h-2 border-t border-r border-accent/30" />
              <span className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-accent/30" />
              <span className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-accent/30" />
              
              <h2 className="text-h3 font-serif text-text mb-4">
                {t('claim.requirements.title')}
              </h2>
              
              <div className="space-y-3">
                {requirements.map((req) => (
                  <div 
                    key={req.id}
                    className={`flex items-center gap-3 p-3 border ${
                      req.passed ? "border-green-200 bg-green-50/30" : "border-secondary bg-secondary/10"
                    }`}
                  >
                    <div className={`w-5 h-5 flex items-center justify-center border ${
                      req.passed 
                        ? "border-accent bg-accent text-light" 
                        : "border-secondary text-muted"
                    }`}>
                      {req.passed ? "✓" : "○"}
                    </div>
                    <span className={req.passed ? "text-text" : "text-muted"}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {claimError && (
              <div className="mb-6 p-4 border border-error bg-error/5 text-error text-center">
                {claimError}
              </div>
            )}

            <div className="space-y-4">
              {!isVerified ? (
                <button
                  onClick={handleVerifyEmail}
                  className="group relative w-full py-4 border border-accent bg-accent text-light hover:bg-transparent hover:text-text transition-all duration-300"
                >
                  <span className="relative z-10 text-sm tracking-wider">{t('claim.actions.verifyEmail')}</span>
                  <span className="absolute top-1 left-1 w-2 h-2 border-t border-l border-light/50 group-hover:border-accent/50 transition-colors" />
                  <span className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-light/50 group-hover:border-accent/50 transition-colors" />
                </button>
              ) : (
                <button
                  onClick={handleClaim}
                  disabled={!canApply || isClaimingNow}
                  className={`group relative w-full py-4 border transition-all duration-300 ${
                    canApply && !isClaimingNow
                      ? "border-accent bg-accent text-light hover:bg-transparent hover:text-text"
                      : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <span className="relative z-10 text-sm tracking-wider">
                    {isClaimingNow
                      ? t('claim.actions.claiming')
                      : !poolStatus || parseFloat(poolStatus.available) <= 0
                        ? t('claim.pool.insufficient')
                        : t('claim.actions.claim')
                    }
                  </span>
                  {canApply && !isClaimingNow && (
                    <>
                      <span className="absolute top-1 left-1 w-2 h-2 border-t border-l border-light/50 group-hover:border-accent/50 transition-colors" />
                      <span className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-light/50 group-hover:border-accent/50 transition-colors" />
                    </>
                  )}
                </button>
              )}

              <button
                onClick={handleNotToday}
                className="group relative w-full py-3 border border-secondary text-muted hover:border-accent hover:text-text transition-all duration-300"
              >
                <span className="relative z-10 text-sm tracking-wider">{t('claim.actions.notToday')}</span>
                <span className="absolute top-1 left-1 w-2 h-2 border-t border-l border-secondary/50 group-hover:border-accent/50 transition-colors" />
                <span className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-secondary/50 group-hover:border-accent/50 transition-colors" />
              </button>
            </div>

            {!allRequirementsMet && (
              <p className="text-center text-tag text-muted mt-4">
                {t('claim.requirements.hint')}
              </p>
            )}
          </>
        )}

        <div className="mt-12 text-center">
          <button
            onClick={() => router.push(`/${locale}/launch`)}
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors"
          >
            <span>←</span>
            <span>{t('nav.back')}</span>
          </button>
        </div>
      </div>
    </main>
  );
}
