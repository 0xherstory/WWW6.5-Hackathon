import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen, Music, Heart } from "lucide-react";

const stories = [
  {
    titleEn: "The Song I Never Finished",
    titleCn: "那首未完成的歌",
    authorEn: "Anonymous",
    authorCn: "匿名",
    storyEn: "I wrote this melody the night my grandmother passed. She used to hum it while cooking. I never finished it, but now it's protected forever.",
    storyCn: "我在祖母去世的那晚写下了这段旋律。她过去常在做饭时哼唱它。我从未完成它，但现在它被永远保护了。",
    emotion: "Nostalgia",
    likes: 234,
  },
  {
    titleEn: "3AM in Tokyo",
    titleCn: "东京凌晨三点",
    authorEn: "Yuki M.",
    authorCn: "Yuki M.",
    storyEn: "Couldn't sleep. The city was quiet for once. I recorded the silence between trains and turned it into this piece. Sometimes silence is the loudest inspiration.",
    storyCn: "睡不着。城市难得安静。我录下了列车之间的寂静，把它变成了这首作品。有时沉默是最响亮的灵感。",
    emotion: "Peace",
    likes: 187,
  },
  {
    titleEn: "Letters to No One",
    titleCn: "无人信笺",
    authorEn: "Alex Chen",
    authorCn: "Alex Chen",
    storyEn: "I started writing lyrics as unsent letters. They became songs nobody asked for but everyone seemed to need.",
    storyCn: "我开始把歌词写成未寄出的信。它们变成了没人要求但每个人似乎都需要的歌。",
    emotion: "Melancholy",
    likes: 312,
  },
];

export default function Stories() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text mb-2">
            {t("Behind the Music", "音乐背后")}
          </h1>
          <p className="text-muted-foreground">
            {t("Every creation has a story worth telling.", "每一次创作都有值得讲述的故事。")}
          </p>
        </div>

        <div className="space-y-6">
          {stories.map((s, i) => (
            <div key={i} className="glass-card p-8 gradient-border hover:glow-purple transition-all duration-500">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-display font-semibold mb-1">{t(s.titleEn, s.titleCn)}</h3>
                  <p className="text-sm text-muted-foreground">{t(s.authorEn, s.authorCn)}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs bg-primary/10 text-primary">{s.emotion}</span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed mb-4 italic">
                "{t(s.storyEn, s.storyCn)}"
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5" />
                  {s.likes}
                </span>
                <span className="flex items-center gap-1">
                  <Music className="w-3.5 h-3.5" />
                  {t("Has Music", "已有音乐")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
