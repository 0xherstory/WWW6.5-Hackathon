import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Lock, Mic, Plus, Eye, EyeOff, Shield, Clock } from "lucide-react";

interface Idea {
  id: string;
  text: string;
  hash: string;
  timestamp: string;
  isPrivate: boolean;
  type: "text" | "voice";
}

const mockIdeas: Idea[] = [
  {
    id: "1",
    text: "A melody about walking through rain, feeling the weight of goodbye...",
    hash: "0x7A3F...E92K",
    timestamp: "2026-03-28T14:32:00Z",
    isPrivate: true,
    type: "text",
  },
  {
    id: "2",
    text: "Hummed melody — minor key, slow tempo, piano with rain sounds",
    hash: "0xB1C8...F47D",
    timestamp: "2026-03-27T09:15:00Z",
    isPrivate: false,
    type: "voice",
  },
  {
    id: "3",
    text: "Words that taste like winter morning coffee, bittersweet and warm",
    hash: "0xD4E2...A83B",
    timestamp: "2026-03-25T21:45:00Z",
    isPrivate: true,
    type: "text",
  },
];

function generateHash() {
  const chars = "0123456789ABCDEF";
  let h = "0x";
  for (let i = 0; i < 4; i++) h += chars[Math.floor(Math.random() * 16)];
  h += "...";
  for (let i = 0; i < 4; i++) h += chars[Math.floor(Math.random() * 16)];
  return h;
}

export default function IdeaVault() {
  const { t } = useLanguage();
  const [ideas, setIdeas] = useState<Idea[]>(mockIdeas);
  const [newIdea, setNewIdea] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [justSaved, setJustSaved] = useState<string | null>(null);

  const saveIdea = () => {
    if (!newIdea.trim()) return;
    const idea: Idea = {
      id: Date.now().toString(),
      text: newIdea,
      hash: generateHash(),
      timestamp: new Date().toISOString(),
      isPrivate,
      type: "text",
    };
    setIdeas([idea, ...ideas]);
    setNewIdea("");
    setJustSaved(idea.id);
    setTimeout(() => setJustSaved(null), 3000);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 glow-purple">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text mb-2">
            {t("Idea Vault", "灵感保险箱")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "Your inspiration is time-stamped and protected from the first second.",
              "你的灵感从第一秒起就被加上时间戳并受到保护。"
            )}
          </p>
        </div>

        {/* Input */}
        <div className="glass-card p-6 gradient-border mb-8">
          <textarea
            value={newIdea}
            onChange={(e) => setNewIdea(e.target.value)}
            placeholder={t(
              "Write your idea, lyric fragment, or inspiration...",
              "写下你的灵感、歌词片段或创意..."
            )}
            className="w-full bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground/50 min-h-[100px] text-sm leading-relaxed mb-4"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="glass" size="icon" className="rounded-full">
                <Mic className="w-4 h-4" />
              </Button>
              <button
                onClick={() => setIsPrivate(!isPrivate)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {isPrivate ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {isPrivate ? t("Private", "私密") : t("Public", "公开")}
              </button>
            </div>
            <Button variant="glow" onClick={saveIdea} className="gap-2">
              <Shield className="w-4 h-4" />
              {t("Protect Idea", "保护灵感")}
            </Button>
          </div>
        </div>

        {/* Ideas */}
        <div className="space-y-4">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className={`glass-card p-5 gradient-border transition-all duration-500 ${
                justSaved === idea.id ? "glow-purple scale-[1.02]" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <p className="text-sm text-foreground/90 leading-relaxed flex-1">{idea.text}</p>
                <div className="flex items-center gap-1 shrink-0">
                  {idea.isPrivate ? (
                    <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                  ) : (
                    <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(idea.timestamp).toLocaleDateString()}
                </span>
                <span className="font-mono text-primary/80">{idea.hash}</span>
                <span className="ml-auto flex items-center gap-1 text-glow-cyan">
                  <Shield className="w-3 h-3" />
                  {t("Protected", "已保护")}
                </span>
              </div>
              {justSaved === idea.id && (
                <div className="mt-3 text-xs text-glow-cyan animate-fade-in">
                  ✓ {t("Your inspiration is now time-stamped and protected", "你的灵感已被加上时间戳并保护")}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
