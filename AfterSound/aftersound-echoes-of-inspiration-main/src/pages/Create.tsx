import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Mic, FileText, Music, Piano, Sparkles, Play, Plus, BookOpen } from "lucide-react";

const modes = [
  { id: "lyrics", iconEl: FileText, en: "Lyrics First", cn: "歌词优先" },
  { id: "melody", iconEl: Music, en: "Melody First", cn: "旋律优先" },
  { id: "chord", iconEl: Piano, en: "Chord First", cn: "和弦优先" },
];

const chordSuggestions = ["Am", "F", "C", "G", "Dm", "Em", "Bb", "E"];
const rhythmPatterns = ["4/4 Ballad", "3/4 Waltz", "6/8 Flow", "4/4 Pop"];
const emotionTags = ["Melancholy", "Hope", "Nostalgia", "Joy", "Rage", "Peace", "Love", "Loss"];

const rhymeBank: Record<string, { en: string[]; cn: string[] }> = {
  lyrics: {
    en: ["light/night/sight/right", "rain/pain/again/remain", "soul/whole/control/goal", "time/rhyme/climb/sublime", "heart/start/apart/art", "dream/stream/gleam/seem"],
    cn: ["天/边/年/前/眠", "风/中/空/红/梦", "情/声/城/生/明", "光/方/长/想/望", "心/人/深/真/新", "夜/月/雪/别/缺"],
  },
  melody: {
    en: ["C-D-E (ascending joy)", "E-D-C (descending calm)", "G-A-B (building tension)", "Pentatonic: C-D-E-G-A"],
    cn: ["C-D-E 上行（欢快）", "E-D-C 下行（平静）", "G-A-B 递进（紧张感）", "五声音阶: 宫-商-角-徵-羽"],
  },
  chord: {
    en: ["I-V-vi-IV (Pop standard)", "i-III-VII-VI (Emotional)", "I-vi-IV-V (50s progression)", "ii-V-I (Jazz standard)"],
    cn: ["I-V-vi-IV（流行标准）", "i-III-VII-VI（情绪型）", "I-vi-IV-V（50年代进行）", "ii-V-I（爵士标准）"],
  },
};

// Melody interval buttons
const intervals = ["Unison", "m2", "M2", "m3", "M3", "P4", "P5", "m6", "M6", "m7", "M7", "Oct"];
const scaleTypes = ["Major", "Minor", "Pentatonic", "Blues", "Dorian", "Mixolydian"];

export default function Create() {
  const { t } = useLanguage();
  const [mode, setMode] = useState("lyrics");
  const [text, setText] = useState("");
  const [story, setStory] = useState("");
  const [selectedChords, setSelectedChords] = useState<string[]>([]);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedScale, setSelectedScale] = useState("Major");

  const toggleChord = (c: string) =>
    setSelectedChords((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  const toggleEmotion = (e: string) =>
    setSelectedEmotions((prev) => (prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]));

  const currentRhymes = rhymeBank[mode] || rhymeBank.lyrics;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text mb-2">
          {t("Create", "创作")}
        </h1>
        <p className="text-muted-foreground mb-8">
          {t("Your voice. Your story. Your music.", "你的声音。你的故事。你的音乐。")}
        </p>

        {/* Mode Selection */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {modes.map((m) => (
            <Button
              key={m.id}
              variant={mode === m.id ? "glow" : "glass"}
              size="sm"
              onClick={() => setMode(m.id)}
              className="gap-1.5"
            >
              <m.iconEl className="w-4 h-4" />
              {t(m.en, m.cn)}
            </Button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Input - changes based on mode */}
          <div className="lg:col-span-2 space-y-6">
            {/* LYRICS MODE */}
            {mode === "lyrics" && (
              <>
                <div className="glass-card p-6 gradient-border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    {t("Write your lyrics", "写下你的歌词")}
                  </h3>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={t("Type your lyrics here...\n\nVerse 1:\n...", "在这里写下歌词...\n\n第一段:\n...")}
                    className="w-full bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground/50 min-h-[200px] text-sm leading-relaxed font-mono"
                  />
                </div>
                <div className="glass-card p-5 gradient-border">
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-glow-pink" />
                    {t("Rhyme Reference", "押韵参考")}
                  </h3>
                  <div className="space-y-2">
                    {currentRhymes.en.map((r, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs">
                        <span className="text-foreground/70 font-mono">{r}</span>
                        <span className="text-muted-foreground text-serif-cn">{currentRhymes.cn[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* MELODY MODE */}
            {mode === "melody" && (
              <>
                <div className="glass-card p-6 gradient-border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    {t("Build your melody", "构建旋律")}
                  </h3>
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2">{t("Scale", "音阶")}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {scaleTypes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedScale(s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                            selectedScale === s
                              ? "bg-glow-blue/20 text-glow-blue border border-glow-blue/30"
                              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">{t("Intervals", "音程")}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {intervals.map((iv) => (
                        <button
                          key={iv}
                          className="px-3 py-2 rounded-lg text-xs font-mono bg-secondary text-secondary-foreground hover:bg-primary/20 hover:text-primary transition-all"
                        >
                          {iv}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Voice input for melody */}
                <div className="glass-card p-6 gradient-border flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium mb-1">{t("Hum or Sing", "哼唱录入")}</h3>
                    <p className="text-xs text-muted-foreground">{t("Record your melody idea", "录制你的旋律灵感")}</p>
                  </div>
                  <Button
                    variant={isRecording ? "destructive" : "glow"}
                    size="icon"
                    className="w-14 h-14 rounded-full"
                    onClick={() => setIsRecording(!isRecording)}
                  >
                    <Mic className={`w-6 h-6 ${isRecording ? "animate-pulse" : ""}`} />
                  </Button>
                </div>
                <div className="glass-card p-5 gradient-border">
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-glow-pink" />
                    {t("Melodic Patterns", "旋律模式参考")}
                  </h3>
                  <div className="space-y-2">
                    {currentRhymes.en.map((r, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs">
                        <span className="text-foreground/70 font-mono">{r}</span>
                        <span className="text-muted-foreground text-serif-cn">{currentRhymes.cn[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* CHORD MODE */}
            {mode === "chord" && (
              <>
                <div className="glass-card p-6 gradient-border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    {t("Build your chord progression", "构建和弦进行")}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {chordSuggestions.map((c) => (
                      <button
                        key={c}
                        onClick={() => toggleChord(c)}
                        className={`px-4 py-3 rounded-xl text-sm font-mono transition-all ${
                          selectedChords.includes(c)
                            ? "bg-primary text-primary-foreground glow-purple scale-105"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  {selectedChords.length > 0 && (
                    <div className="bg-secondary/30 rounded-xl p-4 mt-2">
                      <p className="text-xs text-muted-foreground mb-1">{t("Your Progression", "你的和弦进行")}</p>
                      <p className="text-lg font-mono font-bold gradient-text">{selectedChords.join(" → ")}</p>
                    </div>
                  )}
                </div>
                <div className="glass-card p-6 gradient-border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    {t("Add lyrics over chords", "在和弦上填词")}
                  </h3>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={t("Write lyrics to match your chord feel...", "根据和弦感觉填写歌词...")}
                    className="w-full bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground/50 min-h-[120px] text-sm leading-relaxed"
                  />
                </div>
                <div className="glass-card p-5 gradient-border">
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-glow-pink" />
                    {t("Progression Reference", "进行参考")}
                  </h3>
                  <div className="space-y-2">
                    {currentRhymes.en.map((r, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs">
                        <span className="text-foreground/70 font-mono">{r}</span>
                        <span className="text-muted-foreground text-serif-cn">{currentRhymes.cn[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Story binding (all modes) */}
            <div className="glass-card p-6 gradient-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {t("Behind the Music — Your Story", "音乐背后 — 你的故事")}
              </h3>
              <textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder={t("What inspired this creation?", "是什么激发了这次创作？")}
                className="w-full bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground/50 min-h-[80px] text-sm"
              />
            </div>
          </div>

          {/* Sidebar Tools */}
          <div className="space-y-6">
            {/* Voice (for lyrics mode) */}
            {mode === "lyrics" && (
              <div className="glass-card p-5 gradient-border flex flex-col items-center gap-3">
                <h3 className="text-sm font-medium">{t("Voice Recording", "语音录入")}</h3>
                <Button
                  variant={isRecording ? "destructive" : "glow"}
                  size="icon"
                  className="w-14 h-14 rounded-full"
                  onClick={() => setIsRecording(!isRecording)}
                >
                  <Mic className={`w-6 h-6 ${isRecording ? "animate-pulse" : ""}`} />
                </Button>
                <p className="text-xs text-muted-foreground">{t("Speak your idea", "说出你的灵感")}</p>
              </div>
            )}

            {/* Chord Suggestions (lyrics/melody modes) */}
            {mode !== "chord" && (
              <div className="glass-card p-5 gradient-border">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  {t("Chord Suggestions", "和弦推荐")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {chordSuggestions.map((c) => (
                    <button
                      key={c}
                      onClick={() => toggleChord(c)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                        selectedChords.includes(c)
                          ? "bg-primary text-primary-foreground glow-purple"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                {selectedChords.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-3 font-mono">
                    {t("Progression:", "进行:")} {selectedChords.join(" → ")}
                  </p>
                )}
              </div>
            )}

            {/* Rhythm */}
            <div className="glass-card p-5 gradient-border">
              <h3 className="text-sm font-medium mb-3">{t("Rhythm Patterns", "节奏模式")}</h3>
              <div className="space-y-2">
                {rhythmPatterns.map((r) => (
                  <Button key={r} variant="ghost" size="sm" className="w-full justify-start text-xs">
                    <Play className="w-3 h-3 mr-2" />
                    {r}
                  </Button>
                ))}
              </div>
            </div>

            {/* Emotions */}
            <div className="glass-card p-5 gradient-border">
              <h3 className="text-sm font-medium mb-3">{t("Emotion Tags", "情绪标签")}</h3>
              <div className="flex flex-wrap gap-1.5">
                {emotionTags.map((e) => (
                  <button
                    key={e}
                    onClick={() => toggleEmotion(e)}
                    className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                      selectedEmotions.includes(e)
                        ? "bg-glow-pink/20 text-glow-pink border border-glow-pink/30"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="mt-8 flex justify-center">
          <Button variant="glow" size="xl" className="gap-2">
            <Plus className="w-5 h-5" />
            {t("Generate & Protect", "生成并保护")}
          </Button>
        </div>
      </div>
    </div>
  );
}
