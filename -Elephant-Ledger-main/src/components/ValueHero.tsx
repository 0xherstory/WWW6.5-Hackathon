interface ValueHeroProps {
  totalMinutes: number;
  totalValue: number;
  className?: string;
}

const formatDuration = (minutes: number) => {
  const safeMinutes = Math.max(0, Math.floor(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const remainMinutes = safeMinutes % 60;
  return `${hours}小时${remainMinutes}分钟`;
};

const ValueHero = ({ totalMinutes, totalValue, className = "" }: ValueHeroProps) => {
  const formattedValue = new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(totalValue);

  return (
    <div className={`relative ${className}`}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/50 to-transparent rounded-3xl" />
      
      <div className="relative px-6 py-8">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground tracking-wide mb-2">累计确权总价值</p>
            <h2 className="text-3xl md:text-4xl font-extrabold value-shimmer">{formattedValue}</h2>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground tracking-wide mb-2">累计贡献时长</p>
            <h2 className="text-3xl md:text-4xl font-extrabold value-shimmer">{formatDuration(totalMinutes)}</h2>
          </div>
        </div>

        <p className="mt-4 text-center text-xs md:text-sm text-muted-foreground">
          注：金额依据家政市场细分参考价动态生成，旨在展现隐性劳动经济价值，仅供参考，不代表法庭最终裁量标准。
        </p>
      </div>
    </div>
  );
};

export default ValueHero;
