interface ReceiptCardProps {
  entry: {
    id: string;
    date: Date;
    region: "guangzhou" | "shanghai" | "beijing";
    laborType: "餐饮与采买" | "清洁与收纳" | "育儿与照护" | "统筹与情绪劳动";
    minutes: number;
    note?: string;
    value: number;
    status: "pending" | "verified";
  };
}

const tagColors: Record<string, string> = {
  "餐饮与采买": "bg-sage-light text-sage",
  "清洁与收纳": "bg-accent text-accent-foreground",
  "育儿与照护": "bg-terracotta-light text-terracotta",
  "统筹与情绪劳动": "bg-golden/20 text-golden",
  default: "bg-muted text-muted-foreground",
};

const ReceiptCard = ({ entry }: ReceiptCardProps) => {
  const formattedDate = `${entry.date.getFullYear()}年${entry.date.getMonth() + 1}月${entry.date.getDate()}日`;

  const formattedValue = new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(entry.value);

  const regionLabel: Record<"guangzhou" | "shanghai" | "beijing", string> = {
    guangzhou: "广州",
    shanghai: "上海",
    beijing: "北京",
  };

  const statusPill =
    entry.status === "pending" ? (
      <div className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
        <span>⏳</span>
        <span className="font-medium">等待上链 (Pending)</span>
      </div>
    ) : (
      <div className="inline-flex items-center gap-1 rounded-full border border-sage/30 bg-sage-light/20 px-3 py-1 text-xs text-sage">
        <span>✅</span>
        <span className="font-medium">已确权 (Verified)</span>
      </div>
    );

  const tagClass = tagColors[entry.laborType] || tagColors.default;
  const hours = Math.floor(entry.minutes / 60);
  const remainMinutes = entry.minutes % 60;
  const formattedDuration = `${hours}小时${remainMinutes}分钟`;

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
      {/* Header row */}
      <div className="pb-3 mb-3 flex items-start justify-between gap-3 border-b border-dashed border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">
            {formattedDate}
          </span>
        </div>
        {statusPill}
      </div>

      {/* Main body */}
      <div className="space-y-2">
        <div className="text-lg font-extrabold text-foreground flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tagClass}`}>
            {entry.laborType}
          </span>
          <span>：{formattedDuration}</span>
        </div>

        {entry.note && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {entry.note}
          </p>
        )}
      </div>

      {/* Bottom row */}
      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <span>📍</span>
            <span className="font-medium">{regionLabel[entry.region]}</span>
          </div>
        </div>

        <div className="text-lg font-bold text-golden whitespace-nowrap">
          {formattedValue}
        </div>
      </div>
    </div>
  );
};

export default ReceiptCard;
