"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { getPoolStatus, type PoolStatus } from "@/lib/web3/sanctuaryContract";

interface PoolStatusCardProps {
  showDetails?: boolean;
  onStatusChange?: (status: PoolStatus) => void;
}

// 拨付模式映射 - 颜色配置
const modeConfig = {
  normal: { color: 'text-green-600', bgColor: 'bg-green-50' },
  conservative: { color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  low: { color: 'text-orange-600', bgColor: 'bg-orange-50' },
  emergency: { color: 'text-red-600', bgColor: 'bg-red-50' },
};

export default function PoolStatusCard({ 
  showDetails = true, 
  onStatusChange 
}: PoolStatusCardProps) {
  const t = useTranslations('claim.pool');
  const [status, setStatus] = useState<PoolStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      setIsLoading(true);
      const poolStatus = await getPoolStatus();
      setStatus(poolStatus);
      onStatusChange?.(poolStatus);
      setIsLoading(false);
    };

    fetchStatus();
  }, [onStatusChange]);

  if (isLoading) {
    return (
      <div className="bg-white/50 backdrop-blur-sm border border-secondary/30 p-6">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-accent/20 border-t-accent" />
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="bg-white/50 backdrop-blur-sm border border-secondary/30 p-6">
        <p className="text-center text-muted">{t('waiting')}</p>
      </div>
    );
  }

  const modeInfo = modeConfig[status.mode] || modeConfig.emergency;
  const reserveRatio = 20; // Reserve ratio 20%

  return (
    <div className="bg-white/50 backdrop-blur-sm border border-secondary/30 p-6">
      <h3 className="text-lg font-medium text-text mb-4 text-center">
        💰 {t('title')}
      </h3>

      {/* 主要统计 */}
      <div className={`grid ${showDetails ? 'grid-cols-3' : 'grid-cols-2'} gap-4 text-center mb-4`}>
        <div>
          <p className="text-2xl font-serif text-accent">{parseFloat(status.balance).toFixed(4)} AVAX</p>
          <p className="text-xs text-muted">{t('balance')}</p>
        </div>
        <div>
          <p className="text-2xl font-serif text-accent">{status.claimCount}</p>
          <p className="text-xs text-muted">{t('helped')} {t('people')}</p>
        </div>
        {showDetails && (
          <div>
            <p className="text-2xl font-serif text-accent">{status.donationCount}</p>
            <p className="text-xs text-muted">{t('guardians')}</p>
          </div>
        )}
      </div>

      {/* 资金保护机制详情 */}
      {showDetails && (
        <div className="border-t border-secondary/20 pt-4 mb-4 space-y-3">
          {/* Reserve and Available */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-secondary/5 p-3 rounded">
              <p className="text-muted text-xs mb-1">{t('reserve', { ratio: reserveRatio })}</p>
              <p className="font-medium">{parseFloat(status.reserveAmount).toFixed(4)} AVAX</p>
            </div>
            <div className="bg-secondary/5 p-3 rounded">
              <p className="text-muted text-xs mb-1">{t('availableBalance')}</p>
              <p className="font-medium text-green-600">{parseFloat(status.available).toFixed(4)} AVAX</p>
            </div>
          </div>

          {/* Payout Mode and Dynamic Amount */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className={`p-3 rounded ${modeInfo.bgColor}`}>
              <p className="text-muted text-xs mb-1">{t('currentMode')}</p>
              <p className={`font-medium ${modeInfo.color}`}>{t(`mode.${status.mode}`)}</p>
            </div>
            <div className="bg-accent/5 p-3 rounded">
              <p className="text-muted text-xs mb-1">{t('dynamicAmount')}</p>
              <p className="font-medium text-accent">{parseFloat(status.currentClaimAmount).toFixed(4)} AVAX</p>
            </div>
          </div>
        </div>
      )}

      {/* 预警状态 */}
      <div className={`text-center py-2 rounded-lg text-sm ${
        status.isSufficient 
          ? "bg-green-50 text-green-700" 
          : "bg-amber-50 text-amber-700"
      }`}>
        {status.isSufficient 
          ? `✅ ${t('sufficient')}` 
          : `⚠️ ${t('insufficient')}`}
      </div>
    </div>
  );
}
