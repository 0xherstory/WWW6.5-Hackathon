import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Heart, Clock, Shield } from "lucide-react";

const legacyItems = [
  {
    titleEn: "Rain in June",
    titleCn: "六月的雨",
    owner: "Anonymous Creator",
    hash: "0xA3F7...92K1",
    timestamp: "2026-03-15",
    emotion: "Melancholy",
    type: "Music" as const,
  },
  {
    titleEn: "Morning Light Fragment",
    titleCn: "晨光碎片",
    owner: "Chen Wei",
    hash: "0xD8B2...47F3",
    timestamp: "2026-02-28",
    emotion: "Hope",
    type: "Idea" as const,
  },
  {
    titleEn: "Unfinished Lullaby",
    titleCn: "未完成的摇篮曲",
    owner: "Maria S.",
    hash: "0xE1C4...83AD",
    timestamp: "2026-01-10",
    emotion: "Love",
    type: "Music" as const,
  },
];

export default function DigitalLegacy() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-glow-pink/10 mb-4">
            <Heart className="w-8 h-8 text-glow-pink" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text mb-2">
            {t("Digital Legacy", "数字遗产")}
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t(
              "Even if you are gone, your inspiration remains forever.",
              "即使你不在了，你的灵感永存。"
            )}
          </p>
        </div>

        <div className="space-y-4">
          {legacyItems.map((item, i) => (
            <div key={i} className="glass-card p-6 gradient-border group hover:glow-purple transition-all duration-500">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-display font-semibold">{item.titleEn}</h3>
                  <p className="text-sm text-serif-cn text-muted-foreground">{item.titleCn}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs bg-glow-pink/10 text-glow-pink border border-glow-pink/20">
                  {item.type}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span>{item.owner}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.timestamp}
                </span>
                <span className="font-mono text-primary/70">{item.hash}</span>
                <span className="flex items-center gap-1 text-glow-cyan">
                  <Shield className="w-3 h-3" />
                  {t("Permanent", "永久保存")}
                </span>
              </div>
              <div className="mt-3">
                <span className="px-2 py-0.5 rounded-full text-xs bg-secondary text-muted-foreground">{item.emotion}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button variant="glow" size="lg" className="gap-2">
            <Heart className="w-4 h-4" />
            {t("Mark as Legacy", "标记为遗产")}
          </Button>
        </div>
      </div>
    </div>
  );
}
