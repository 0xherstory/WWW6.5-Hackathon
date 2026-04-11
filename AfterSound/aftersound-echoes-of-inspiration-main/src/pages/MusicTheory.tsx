import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Piano, Play, Star, ChevronDown, ChevronUp, Volume2, ExternalLink } from "lucide-react";
import * as Tone from "tone";

/* ───────── data ───────── */

const cardLessons = [
  {
    id: "scales",
    en: "Scales & Modes",
    cn: "音阶与调式",
    descEn: "Major, minor, pentatonic, and modal scales — the building blocks of melody.",
    descCn: "大调、小调、五声音阶与调式——旋律的基石。",
    level: "beginner",
    detailEn: [
      "A scale is a set of notes ordered by pitch. The major scale follows W-W-H-W-W-W-H intervals.",
      "Natural minor: W-H-W-W-H-W-W. Pentatonic removes the 4th and 7th.",
      "Modes (Dorian, Phrygian, Lydian…) shift the starting note of the major scale to create different moods.",
    ],
    detailCn: [
      "音阶是按音高排列的音符集合。大调音阶遵循 全-全-半-全-全-全-半 的音程关系。",
      "自然小调：全-半-全-全-半-全-全。五声音阶去掉了第4和第7音。",
      "调式（多利亚、弗里吉亚、利迪亚……）通过改变大调音阶的起始音来创造不同情绪。",
    ],
    notes: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"],
  },
  {
    id: "chords",
    en: "Chords & Harmony",
    cn: "和弦与和声",
    descEn: "Triads, seventh chords, inversions, and how harmony supports melody.",
    descCn: "三和弦、七和弦、转位——和声如何支撑旋律。",
    level: "beginner",
    detailEn: [
      "A chord is 3+ notes played together. Major triad = root + major 3rd + perfect 5th.",
      "Minor triad lowers the 3rd by a half step. Diminished lowers both 3rd and 5th.",
      "Seventh chords add a 4th note for richer color: Maj7, min7, dom7, dim7.",
    ],
    detailCn: [
      "和弦由3个或更多音符同时演奏。大三和弦 = 根音 + 大三度 + 纯五度。",
      "小三和弦降低三度半音。减三和弦同时降低三度和五度。",
      "七和弦增加第4个音以获得更丰富的色彩：大七、小七、属七、减七。",
    ],
    notes: ["C4", "E4", "G4"],
  },
  {
    id: "rhythm",
    en: "Rhythm & Time",
    cn: "节奏与拍子",
    descEn: "Time signatures, note values, syncopation, and groove.",
    descCn: "拍号、音符时值、切分音与律动。",
    level: "beginner",
    detailEn: [
      "Time signature: 4/4 means 4 quarter-note beats per measure. 3/4 = waltz feel.",
      "Note values: whole (4 beats), half (2), quarter (1), eighth (½), sixteenth (¼).",
      "Syncopation places emphasis on off-beats, creating tension and groove.",
    ],
    detailCn: [
      "拍号：4/4表示每小节4个四分音符拍。3/4 = 华尔兹感觉。",
      "音符时值：全音符(4拍)、二分(2拍)、四分(1拍)、八分(½拍)、十六分(¼拍)。",
      "切分音将重音放在弱拍上，制造张力与律动。",
    ],
    notes: ["C4"],
  },
  {
    id: "intervals",
    en: "Intervals",
    cn: "音程",
    descEn: "The distance between two notes — the DNA of melody and harmony.",
    descCn: "两个音之间的距离——旋律与和声的DNA。",
    level: "intermediate",
    detailEn: [
      "An interval is the distance between two pitches, measured in half steps.",
      "Perfect intervals: unison (0), 4th (5), 5th (7), octave (12).",
      "Major/minor: 2nd (2/1), 3rd (4/3), 6th (9/8), 7th (11/10).",
    ],
    detailCn: [
      "音程是两个音高之间的距离，以半音为单位衡量。",
      "纯音程：同度(0)、纯四度(5)、纯五度(7)、八度(12)。",
      "大/小音程：二度(2/1)、三度(4/3)、六度(9/8)、七度(11/10)。",
    ],
    notes: ["C4", "E4"],
  },
  {
    id: "songstructure",
    en: "Song Structure",
    cn: "歌曲结构",
    descEn: "Verse, chorus, bridge — how to build a complete song.",
    descCn: "主歌、副歌、桥段——如何构建一首完整的歌曲。",
    level: "intermediate",
    detailEn: [
      "Most pop songs follow Verse → Chorus → Verse → Chorus → Bridge → Chorus.",
      "The verse tells the story; the chorus delivers the emotional hook.",
      "A bridge provides contrast — new chords, new melody, new energy.",
    ],
    detailCn: [
      "大多数流行歌曲遵循 主歌→副歌→主歌→副歌→桥段→副歌 的结构。",
      "主歌讲述故事；副歌传递情感钩子。",
      "桥段提供对比——新的和弦、新的旋律、新的能量。",
    ],
    notes: ["C4", "G4", "A4", "F4"],
  },
  {
    id: "dynamics",
    en: "Dynamics & Expression",
    cn: "力度与表现",
    descEn: "Piano, forte, crescendo — controlling musical emotion.",
    descCn: "弱、强、渐强——控制音乐情感。",
    level: "advanced",
    detailEn: [
      "Dynamics range from ppp (very very soft) to fff (very very loud).",
      "Crescendo (gradually louder) and decrescendo (gradually softer) shape phrases.",
      "Articulation (staccato, legato, accent) adds character to individual notes.",
    ],
    detailCn: [
      "力度从ppp（非常非常弱）到fff（非常非常强）。",
      "渐强和渐弱塑造乐句的起伏。",
      "演奏法（断奏、连奏、重音）为单个音符增添性格。",
    ],
    notes: ["C4"],
  },
];

const interactiveLessons = [
  {
    id: "play-major",
    en: "Play a Major Scale",
    cn: "弹奏大调音阶",
    descEn: "Press the highlighted keys to play a C major scale.",
    descCn: "按下高亮的琴键来弹奏C大调音阶。",
    keys: [
      { note: "C4", label: "C", highlight: true },
      { note: "D4", label: "D", highlight: true },
      { note: "E4", label: "E", highlight: true },
      { note: "F4", label: "F", highlight: true },
      { note: "G4", label: "G", highlight: true },
      { note: "A4", label: "A", highlight: true },
      { note: "B4", label: "B", highlight: true },
      { note: "C5", label: "C", highlight: true },
    ],
  },
  {
    id: "play-minor",
    en: "Play a Minor Scale",
    cn: "弹奏小调音阶",
    descEn: "A natural minor: A B C D E F G A.",
    descCn: "A自然小调：A B C D E F G A。",
    keys: [
      { note: "A3", label: "A", highlight: true },
      { note: "B3", label: "B", highlight: true },
      { note: "C4", label: "C", highlight: true },
      { note: "D4", label: "D", highlight: true },
      { note: "E4", label: "E", highlight: true },
      { note: "F4", label: "F", highlight: true },
      { note: "G4", label: "G", highlight: true },
      { note: "A4", label: "A", highlight: true },
    ],
  },
  {
    id: "play-chords",
    en: "Play Common Chords",
    cn: "弹奏常见和弦",
    descEn: "Try C major (C-E-G), F major (F-A-C), G major (G-B-D).",
    descCn: "试试C大调和弦(C-E-G)、F大调(F-A-C)、G大调(G-B-D)。",
    keys: [
      { note: "C4", label: "C", highlight: true },
      { note: "D4", label: "D", highlight: false },
      { note: "E4", label: "E", highlight: true },
      { note: "F4", label: "F", highlight: true },
      { note: "G4", label: "G", highlight: true },
      { note: "A4", label: "A", highlight: true },
      { note: "B4", label: "B", highlight: true },
      { note: "C5", label: "C", highlight: true },
    ],
  },
];

const videoLessons = [
  {
    id: "v1",
    en: "How Music Theory Actually Works",
    cn: "乐理到底是怎么回事",
    descEn: "A beginner-friendly overview of music theory concepts with real song examples.",
    descCn: "用真实歌曲示例讲解乐理概念的入门概览。",
    duration: "12 min",
    thumbnail: "🎵",
    contentEn: [
      "Music theory is simply the language we use to describe what we hear.",
      "Every song you love follows patterns — learning theory helps you understand and create those patterns.",
      "Key concepts: pitch (high/low), rhythm (timing), harmony (layered notes), dynamics (volume), timbre (tone color).",
      "Think of theory as a map — you can explore without it, but it helps you find amazing places faster.",
    ],
    contentCn: [
      "乐理只是我们用来描述所听到的音乐的语言。",
      "你喜欢的每首歌都遵循一定的模式——学习乐理帮助你理解和创造这些模式。",
      "核心概念：音高、节奏、和声、力度、音色。",
      "把乐理想象成一张地图——没有它你也能探索，但有了它你能更快找到美妙之处。",
    ],
  },
  {
    id: "v2",
    en: "The Circle of Fifths Explained",
    cn: "五度圈详解",
    descEn: "Master the most important diagram in music theory.",
    descCn: "掌握乐理中最重要的图表。",
    duration: "8 min",
    thumbnail: "⭕",
    contentEn: [
      "The Circle of Fifths arranges all 12 keys in a circle, each a perfect 5th apart.",
      "Moving clockwise: C → G → D → A → E → B → F# → C# (adding sharps).",
      "Moving counter-clockwise: C → F → Bb → Eb → Ab → Db → Gb (adding flats).",
      "Adjacent keys share most notes — great for modulation and chord progressions.",
    ],
    contentCn: [
      "五度圈将12个调排列成圆圈，每个相距纯五度。",
      "顺时针移动：C → G → D → A → E → B → F# → C#（增加升号）。",
      "逆时针移动：C → F → Bb → Eb → Ab → Db → Gb（增加降号）。",
      "相邻的调共享大部分音符——非常适合转调和和弦进行。",
    ],
  },
  {
    id: "v3",
    en: "Chord Progressions That Move People",
    cn: "打动人心的和弦进行",
    descEn: "Learn the most popular progressions used in hit songs worldwide.",
    descCn: "学习全球热门歌曲中最常用的和弦进行。",
    duration: "15 min",
    thumbnail: "🎹",
    contentEn: [
      "I-V-vi-IV: The most common pop progression (C-G-Am-F). Used in thousands of hits.",
      "ii-V-I: The jazz standard. Creates strong harmonic motion toward resolution.",
      "I-vi-IV-V: The '50s progression'. Classic, nostalgic, timeless.",
      "vi-IV-I-V: Starting on the minor chord creates an emotional, anthemic feel.",
    ],
    contentCn: [
      "I-V-vi-IV：最常见的流行和弦进行（C-G-Am-F）。用于成千上万的热门歌曲。",
      "ii-V-I：爵士标准进行。创造强烈的和声运动走向解决。",
      "I-vi-IV-V：'50年代进行'。经典、怀旧、永恒。",
      "vi-IV-I-V：从小调和弦开始，创造情感化、颂歌般的感觉。",
    ],
  },
];

const sponsors = [
  { name: "ToneBox", tagline: "Smart MIDI Controllers", url: "#" },
  { name: "SoundBridge", tagline: "Free DAW for Creators", url: "#" },
  { name: "HarmonyAI", tagline: "AI-Powered Practice", url: "#" },
];

/* ───────── component ───────── */

export default function MusicTheory() {
  const { t } = useLanguage();
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [activeInteractive, setActiveInteractive] = useState(0);
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);
  const synthRef = useRef<Tone.PolySynth | null>(null);

  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.2, release: 0.8 },
    }).toDestination();
    return () => { synthRef.current?.dispose(); };
  }, []);

  const playNote = async (note: string) => {
    await Tone.start();
    synthRef.current?.triggerAttackRelease(note, "8n");
  };

  const playSequence = async (notes: string[]) => {
    await Tone.start();
    const now = Tone.now();
    notes.forEach((n, i) => {
      synthRef.current?.triggerAttackRelease(n, "8n", now + i * 0.35);
    });
  };

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const levelColor: Record<string, string> = {
    beginner: "bg-green-500/20 text-green-400",
    intermediate: "bg-accent/20 text-accent",
    advanced: "bg-primary/20 text-primary",
  };

  const il = interactiveLessons[activeInteractive];

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-up">
          <h1 className="text-4xl md:text-5xl font-display gradient-text mb-3">
            {t("Music Theory Classroom", "乐理知识课堂")}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t(
              "Learn the language of music — from scales to song structure, with interactive demos.",
              "学习音乐的语言——从音阶到歌曲结构，配有互动演示。"
            )}
          </p>
        </div>

        {/* Sponsor bar */}
        <div className="glass-card p-4 mb-10 flex flex-wrap items-center justify-center gap-6">
          <span className="text-xs text-muted-foreground uppercase tracking-widest">
            {t("Sponsored by", "赞助商")}
          </span>
          {sponsors.map((s) => (
            <a
              key={s.name}
              href={s.url}
              className="flex items-center gap-2 text-sm text-foreground/80 hover:text-primary transition-colors"
            >
              <Star className="w-3.5 h-3.5 text-primary" />
              <span className="font-medium">{s.name}</span>
              <span className="text-muted-foreground text-xs hidden sm:inline">— {s.tagline}</span>
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </a>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="cards" className="space-y-8">
          <TabsList className="glass w-full sm:w-auto grid grid-cols-3 gap-1">
            <TabsTrigger value="cards" className="gap-1.5">
              <BookOpen className="w-4 h-4" />
              {t("Cards", "卡片课程")}
            </TabsTrigger>
            <TabsTrigger value="interactive" className="gap-1.5">
              <Piano className="w-4 h-4" />
              {t("Interactive", "互动教程")}
            </TabsTrigger>
            <TabsTrigger value="articles" className="gap-1.5">
              <Play className="w-4 h-4" />
              {t("Articles", "图文课程")}
            </TabsTrigger>
          </TabsList>

          {/* ─── TAB 1 : Card lessons ─── */}
          <TabsContent value="cards">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {cardLessons.map((lesson) => {
                const open = expandedCards.has(lesson.id);
                return (
                  <Card
                    key={lesson.id}
                    className="glass-card border-glass-border hover:border-primary/40 transition-all cursor-pointer group"
                    onClick={() => toggleCard(lesson.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge className={levelColor[lesson.level] + " border-0 text-[10px]"}>
                          {lesson.level}
                        </Badge>
                        {open ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <CardTitle className="text-lg mt-2">{t(lesson.en, lesson.cn)}</CardTitle>
                      <CardDescription>{t(lesson.descEn, lesson.descCn)}</CardDescription>
                    </CardHeader>
                    {open && (
                      <CardContent className="animate-fade-in space-y-3">
                        <ul className="space-y-2 text-sm text-foreground/80">
                          {(t(lesson.detailEn.join("|"), lesson.detailCn.join("|"))).split("|").map((p, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                        <Button
                          size="sm"
                          variant="glass"
                          className="gap-1.5 mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            playSequence(lesson.notes);
                          }}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          {t("Listen", "试听")}
                        </Button>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ─── TAB 2 : Interactive piano ─── */}
          <TabsContent value="interactive">
            <div className="grid lg:grid-cols-[280px_1fr] gap-6">
              {/* Lesson list */}
              <div className="flex lg:flex-col gap-2">
                {interactiveLessons.map((l, i) => (
                  <Button
                    key={l.id}
                    variant={i === activeInteractive ? "glass" : "ghost"}
                    className="justify-start text-left whitespace-normal h-auto py-3"
                    onClick={() => setActiveInteractive(i)}
                  >
                    <div>
                      <div className="font-medium text-sm">{t(l.en, l.cn)}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{t(l.descEn, l.descCn)}</div>
                    </div>
                  </Button>
                ))}
              </div>

              {/* Piano area */}
              <div className="glass-card p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-display gradient-text">{t(il.en, il.cn)}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t(il.descEn, il.descCn)}</p>
                </div>

                <div className="flex gap-1 justify-center flex-wrap">
                  {il.keys.map((k, i) => (
                    <button
                      key={i}
                      onClick={() => playNote(k.note)}
                      className={`
                        w-14 h-36 rounded-xl border transition-all duration-150 flex flex-col items-center justify-end pb-3 text-xs font-medium
                        active:scale-95
                        ${k.highlight
                          ? "bg-primary/20 border-primary/50 text-primary hover:bg-primary/30 hover:shadow-[0_0_20px_hsl(270_80%_70%/0.3)]"
                          : "bg-secondary border-glass-border text-muted-foreground hover:bg-secondary/80"
                        }
                      `}
                    >
                      <span className="text-lg mb-1">{k.label}</span>
                      <span className="text-[10px] opacity-60">{k.note}</span>
                    </button>
                  ))}
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="glow"
                    onClick={() => playSequence(il.keys.map((k) => k.note))}
                    className="gap-2"
                  >
                    <Play className="w-4 h-4" />
                    {t("Play All", "全部播放")}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ─── TAB 3 : Articles / video-style ─── */}
          <TabsContent value="articles">
            <div className="space-y-5">
              {videoLessons.map((v) => {
                const isOpen = expandedVideo === v.id;
                return (
                  <Card
                    key={v.id}
                    className="glass-card border-glass-border hover:border-primary/30 transition-all overflow-hidden"
                  >
                    <div
                      className="flex items-center gap-4 p-5 cursor-pointer"
                      onClick={() => setExpandedVideo(isOpen ? null : v.id)}
                    >
                      <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center text-3xl shrink-0">
                        {v.thumbnail}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-lg">{t(v.en, v.cn)}</h3>
                        <p className="text-sm text-muted-foreground truncate">{t(v.descEn, v.descCn)}</p>
                      </div>
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {v.duration}
                      </Badge>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                      )}
                    </div>
                    {isOpen && (
                      <div className="px-5 pb-5 animate-fade-in">
                        <div className="border-t border-glass-border pt-4 space-y-3">
                          {(t(v.contentEn.join("|"), v.contentCn.join("|"))).split("|").map((p, i) => (
                            <p key={i} className="text-sm text-foreground/85 leading-relaxed">
                              {p}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Bottom sponsor */}
        <div className="mt-16 glass-card p-6 text-center">
          <p className="text-xs text-muted-foreground mb-3 uppercase tracking-widest">
            {t("Become a Sponsor", "成为赞助商")}
          </p>
          <p className="text-sm text-foreground/70 max-w-md mx-auto mb-4">
            {t(
              "Reach thousands of music creators and learners. Contact us for partnership.",
              "触达数千名音乐创作者和学习者。联系我们洽谈合作。"
            )}
          </p>
          <Button variant="outline" size="sm">
            {t("Contact Us", "联系我们")}
          </Button>
        </div>
      </div>
    </div>
  );
}
