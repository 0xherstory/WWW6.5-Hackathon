import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Search, Fingerprint, FileText, Mic, Upload, Info } from "lucide-react";

const dimensions = [
  {
    key: "melody",
    en: "Melody",
    cn: "旋律",
    score: 0,
    descEn: "Pitch sequence similarity based on interval patterns and contour analysis",
    descCn: "基于音程模式和旋律轮廓的音高序列相似度分析",
  },
  {
    key: "chord",
    en: "Chord Progression",
    cn: "和弦进行",
    score: 0,
    descEn: "Harmonic structure matching using roman numeral analysis and voicing patterns",
    descCn: "使用罗马数字分析和声型匹配的和声结构对比",
  },
  {
    key: "rhythm",
    en: "Rhythm",
    cn: "节奏",
    score: 0,
    descEn: "Rhythmic pattern fingerprinting including tempo, groove, and time signature analysis",
    descCn: "包含速度、律动和拍号分析的节奏模式指纹识别",
  },
  {
    key: "lyrics",
    en: "Lyrics",
    cn: "歌词",
    score: 0,
    descEn: "Text similarity via semantic embedding and n-gram overlap detection",
    descCn: "通过语义嵌入和n-gram重叠检测的文本相似度分析",
  },
  {
    key: "emotion",
    en: "Emotional Contour",
    cn: "情绪曲线",
    score: 0,
    descEn: "Valence-arousal trajectory matching across the piece's emotional arc",
    descCn: "贯穿作品情绪弧线的效价-唤醒轨迹匹配",
  },
  {
    key: "timbre",
    en: "Timbre & Mix",
    cn: "音色与混音",
    score: 0,
    descEn: "Spectral fingerprint comparison of instrumentation and production style",
    descCn: "乐器编配和制作风格的频谱指纹对比",
  },
];

type InputMode = "text" | "voice" | "file";

function mockScores() {
  return dimensions.map((d) => ({ ...d, score: Math.floor(Math.random() * 35) + 5 }));
}

export default function PlagiarismCheck() {
  const { t } = useLanguage();
  const [input, setInput] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [results, setResults] = useState<typeof dimensions | null>(null);
  const [checking, setChecking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [expandedDim, setExpandedDim] = useState<string | null>(null);

  const runCheck = () => {
    if (inputMode === "text" && !input.trim()) return;
    if (inputMode === "file" && !fileName) return;
    setChecking(true);
    setTimeout(() => {
      setResults(mockScores());
      setChecking(false);
    }, 1800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const totalScore = results ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length) : 0;

  const inputModes: { id: InputMode; icon: typeof FileText; en: string; cn: string }[] = [
    { id: "text", icon: FileText, en: "Text / Lyrics", cn: "文本 / 歌词" },
    { id: "voice", icon: Mic, en: "Voice / Melody", cn: "语音 / 旋律" },
    { id: "file", icon: Upload, en: "Upload Audio", cn: "上传音频" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Fingerprint className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text mb-2">
            {t("Music Plagiarism Check", "音乐查重")}
          </h1>
          <p className="text-muted-foreground">
            {t("Multi-modal, multi-dimensional originality analysis", "多模态、多维度原创性分析")}
          </p>
        </div>

        {/* Input Mode Tabs */}
        <div className="flex gap-2 mb-4 justify-center flex-wrap">
          {inputModes.map((m) => (
            <Button
              key={m.id}
              variant={inputMode === m.id ? "glow" : "glass"}
              size="sm"
              onClick={() => setInputMode(m.id)}
              className="gap-1.5"
            >
              <m.icon className="w-4 h-4" />
              {t(m.en, m.cn)}
            </Button>
          ))}
        </div>

        {/* Input Area */}
        <div className="glass-card p-6 gradient-border mb-8">
          {inputMode === "text" && (
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t(
                "Enter lyrics, describe a melody, or paste your musical idea...",
                "输入歌词、描述旋律或粘贴你的音乐灵感..."
              )}
              className="w-full bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground/50 min-h-[120px] text-sm"
            />
          )}

          {inputMode === "voice" && (
            <div className="flex flex-col items-center py-8 gap-4">
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all ${
                  isRecording
                    ? "border-destructive bg-destructive/20 animate-pulse"
                    : "border-primary bg-primary/10 hover:bg-primary/20"
                }`}
              >
                <Mic className={`w-8 h-8 ${isRecording ? "text-destructive" : "text-primary"}`} />
              </button>
              <p className="text-sm text-muted-foreground">
                {isRecording
                  ? t("Recording... tap to stop", "录音中... 点击停止")
                  : t("Tap to record melody or hum", "点击录制旋律或哼唱")}
              </p>
            </div>
          )}

          {inputMode === "file" && (
            <div className="flex flex-col items-center py-8 gap-4">
              <label className="cursor-pointer">
                <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-glass-border flex items-center justify-center hover:border-primary/50 transition-colors">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
              </label>
              {fileName ? (
                <p className="text-sm text-primary">{fileName}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("MP3, WAV, MIDI supported", "支持 MP3、WAV、MIDI 格式")}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end mt-3">
            <Button variant="glow" onClick={runCheck} disabled={checking} className="gap-2">
              <Search className="w-4 h-4" />
              {checking ? t("Analyzing...", "分析中...") : t("Check Originality", "检测原创性")}
            </Button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="glass-card p-4 gradient-border mb-8 flex gap-3 items-start">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground leading-relaxed">
            {t(
              "All on-chain original works automatically receive a full plagiarism report as proof of originality. The report covers 6 dimensions: melody, chord progression, rhythm, lyrics, emotional contour, and timbre.",
              "所有上链原创作品将自动获得完整的查重报告作为原创证明。报告涵盖6个维度：旋律、和弦进行、节奏、歌词、情绪曲线和音色。"
            )}
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="animate-fade-up space-y-6">
            {/* Overall */}
            <div className="glass-card p-8 gradient-border text-center">
              <p className="text-sm text-muted-foreground mb-2">{t("Overall Similarity Score", "综合相似度评分")}</p>
              <div className="text-6xl font-display font-bold gradient-text mb-2">{totalScore}%</div>
              <p className="text-sm text-glow-cyan">
                {totalScore < 30
                  ? t("✓ Highly Original", "✓ 高度原创")
                  : totalScore < 60
                  ? t("⚠ Moderate Similarity", "⚠ 中等相似度")
                  : t("⚠ High Similarity Detected", "⚠ 检测到高相似度")}
              </p>
            </div>

            {/* Dimension Bars */}
            <div className="glass-card p-6 gradient-border space-y-4">
              <h3 className="text-sm font-medium mb-2">{t("Dimensional Analysis", "维度分析")}</h3>
              {results.map((r) => (
                <div key={r.key}>
                  <button
                    onClick={() => setExpandedDim(expandedDim === r.key ? null : r.key)}
                    className="w-full text-left"
                  >
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-foreground/80 flex items-center gap-1.5">
                        {t(r.en, r.cn)}
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </span>
                      <span className="font-mono text-muted-foreground">{r.score}%</span>
                    </div>
                  </button>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${r.score}%`,
                        background: `linear-gradient(90deg, hsl(270 80% 70%), hsl(${r.score > 50 ? 0 : 190} 80% 60%))`,
                      }}
                    />
                  </div>
                  {expandedDim === r.key && (
                    <p className="text-xs text-muted-foreground mt-2 pl-1 animate-fade-in">
                      {t(r.descEn, r.descCn)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
