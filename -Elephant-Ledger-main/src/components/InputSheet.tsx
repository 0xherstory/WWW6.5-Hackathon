import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InputSheetProps {
  isOpen: boolean;
  onClose: () => void;
  calculateValueYen: (payload: { region: string; laborType: string; minutes: number }) => number;
  onAddToToday: (payload: { region: string; laborType: string; minutes: number; note?: string }) => void;
}

const quickMinutes = [
  { label: "10分钟", value: 10 },
  { label: "15分钟", value: 15 },
  { label: "30分钟", value: 30 },
  { label: "1小时", value: 60 },
  { label: "2小时", value: 120 },
];

const InputSheet = ({
  isOpen,
  onClose,
  calculateValueYen,
  onAddToToday,
}: InputSheetProps) => {
  const [region, setRegion] = useState<string>("guangzhou");
  const [laborType, setLaborType] = useState<string>("餐饮与采买");
  const [minutes, setMinutes] = useState<number>(30);
  const [note, setNote] = useState<string>("");

  const isValid = minutes > 0;

  useEffect(() => {
    if (!isOpen) return;
    // 每次打开都重置为默认值，避免上一次填写残留
    setRegion("guangzhou");
    setLaborType("餐饮与采买");
    setMinutes(30);
    setNote("");
  }, [isOpen]);

  const previewValueYen = useMemo(() => {
    if (!isValid) return 0;
    return calculateValueYen({ region, laborType, minutes });
  }, [calculateValueYen, region, laborType, minutes, isValid]);

  const handleAdd = () => {
    if (!isValid) return;
    onAddToToday({ region, laborType, minutes, note: note.trim() ? note.trim() : undefined });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl shadow-2xl animate-slide-in-right"
           style={{ animation: "slideUp 0.3s ease-out" }}>
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}</style>
        
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-muted rounded-full" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4">
          <h2 className="text-lg font-bold text-foreground">极简家务记账条</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>
        
        {/* Minimal form */}
        <div className="px-5 pb-6 space-y-5">
          {/* 地区选择 */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">地区选择</div>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="guangzhou">广州 (Guangzhou)</SelectItem>
                <SelectItem value="shanghai">上海</SelectItem>
                <SelectItem value="beijing">北京</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 劳动类型 */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">劳动类型</div>
            <Select value={laborType} onValueChange={setLaborType}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="餐饮与采买">餐饮与采买</SelectItem>
                <SelectItem value="清洁与收纳">清洁与收纳</SelectItem>
                <SelectItem value="育儿与照护">育儿与照护</SelectItem>
                <SelectItem value="统筹与情绪劳动">统筹与情绪劳动</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 劳动时长 */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-foreground">劳动时长</div>
            <div className="grid grid-cols-5 gap-2">
              {quickMinutes.map((q) => {
                const active = minutes === q.value;
                return (
                  <button
                    key={q.value}
                    type="button"
                    onClick={() => setMinutes(q.value)}
                    className={`px-2 py-2 rounded-xl border text-xs transition-all ${
                      active
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border hover:border-primary hover:bg-accent/50 text-muted-foreground"
                    }`}
                  >
                    {q.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">分钟（手动）</div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  className="w-28 rounded-xl"
                />
                <span className="text-sm text-muted-foreground">min</span>
              </div>
            </div>
          </div>

          {/* 备注（可选） */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">备注（可选）</div>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="写下你想记录的细节（例如：深度清洁/帮忙照护的具体内容）"
              className="min-h-[72px] resize-none rounded-xl border-border bg-muted/50 focus:bg-card"
            />
          </div>

          {/* 价值实时预览 */}
          <div className="flex flex-col gap-1">
            <div className="text-xs text-muted-foreground">
              价值实时预览：<span className="text-foreground font-semibold">¥{previewValueYen}</span>
            </div>
            <div className="text-[11px] text-muted-foreground/70">
              (计算依据：动态调用当地对应细分家政市场参考价)
            </div>
          </div>

          {/* Bottom actions */}
          <div className="pt-2">
            <Button
              type="button"
              onClick={handleAdd}
              variant="secondary"
              disabled={!isValid}
              className="w-full rounded-xl py-6"
            >
              确认并暂存 (Pending)
            </Button>
          </div>
        </div>
        
        {/* Safe area padding */}
        <div className="h-6" />
      </div>
    </>
  );
};

export default InputSheet;
