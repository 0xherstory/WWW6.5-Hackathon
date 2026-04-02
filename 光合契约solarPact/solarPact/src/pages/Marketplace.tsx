import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, Filter, Clock, Coins, Users, ArrowRight, Star, Sparkles, Crown, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { contractActions } from "@/lib/contracts";

type ChainGoal = {
  id: number;
  title: string;
  bounty: number;
  deadline: number;
  creator: string;
};

type MarketNeed = {
  id: string;
  realId?: number;
  title: string;
  titleEn?: string;
  category: string;
  description: string;
  descEn?: string;
  bounty: number;
  bids: number;
  deadline: string;
  deadlineEn?: string;
  level?: string;
  author: string;
  authorEn?: string;
  status: string;
  isReal: boolean;
  goal?: string;
};

const categories = ["全部", "职场", "婚恋", "自我", "健康", "转型"];
const categoriesEn: Record<string, string> = {
  "全部": "All", "职场": "Career", "婚恋": "Relationship",
  "自我": "Self", "健康": "Health", "转型": "Transformation",
};

const sponsoredChallenges = [
  {
    id: "s1",
    title: "Web3 Women 30天编程挑战",
    titleEn: "Web3 Women 30-Day Coding Challenge",
    brand: "Avalanche Foundation",
    bounty: 5000,
    participants: 128,
    gradient: "from-primary via-amber-400 to-secondary",
    icon: "⚡",
  },
  {
    id: "s2",
    title: "职场女性领导力计划",
    titleEn: "Women's Leadership Program",
    brand: "SheDAO",
    bounty: 3000,
    participants: 67,
    gradient: "from-accent via-secondary to-pink-400",
    icon: "👑",
  },
  {
    id: "s3",
    title: "心理韧性21天训练营",
    titleEn: "21-Day Mental Resilience Bootcamp",
    brand: "MindFi x SolarPact",
    bounty: 2000,
    participants: 89,
    gradient: "from-emerald-400 via-cyan-400 to-accent",
    icon: "🧠",
  },
];

const Marketplace = () => {
  const { t, language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");
  const [realNeeds, setRealNeeds] = useState<ChainGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadGoals = async () => {
      try {
        setIsLoading(true);
        const goals = await contractActions.getGoals();
        setRealNeeds(goals);
      } catch (error) {
        console.error("Failed to load goals:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadGoals();
  }, []);

  const mockNeeds = [
    { id: "mock-1", title: "30天内完成职场转型计划", titleEn: "30-Day Career Transformation", category: "职场", description: "从传统行业转向Web3，需要有经验的导师指导", descEn: "Transition to Web3 with experienced mentoring", bounty: 200, bids: 5, deadline: "14天", deadlineEn: "14 days", level: "🔥", author: "匿名用户 #3847", authorEn: "Anon #3847", status: "竞拍中", isReal: false },
    { id: "mock-2", title: "建立每日冥想习惯", titleEn: "Build Daily Meditation Habit", category: "健康", description: "坚持21天每日冥想15分钟", descEn: "21 days of 15-min daily meditation", bounty: 50, bids: 3, deadline: "21天", deadlineEn: "21 days", level: "🌱", author: "匿名用户 #1204", authorEn: "Anon #1204", status: "竞拍中", isReal: false },
    { id: "mock-3", title: "完成个人品牌打造", titleEn: "Build Personal Brand", category: "自我", description: "从零开始建立社交媒体个人品牌", descEn: "Build social media personal brand from scratch", bounty: 500, bids: 12, deadline: "30天", deadlineEn: "30 days", level: "⛰️", author: "匿名用户 #7721", authorEn: "Anon #7721", status: "进行中", isReal: false },
    { id: "mock-4", title: "走出一段感情", titleEn: "Overcome a Breakup", category: "婚恋", description: "需要一位有心理咨询经验的伙伴帮助我重建信心", descEn: "Need a partner with counseling experience", bounty: 150, bids: 8, deadline: "28天", deadlineEn: "28 days", level: "🔥", author: "匿名用户 #5529", authorEn: "Anon #5529", status: "竞拍中", isReal: false },
    { id: "mock-5", title: "学会公开演讲", titleEn: "Master Public Speaking", category: "职场", description: "克服社交恐惧，完成3次公开演讲", descEn: "Overcome social anxiety, complete 3 speeches", bounty: 300, bids: 6, deadline: "45天", deadlineEn: "45 days", level: "⛰️", author: "匿名用户 #9103", authorEn: "Anon #9103", status: "竞拍中", isReal: false },
    { id: "mock-6", title: "减脂10斤健康计划", titleEn: "Lose 10kg Health Plan", category: "健康", description: "科学饮食+运动，每周打卡记录体脂变化", descEn: "Scientific diet + exercise with weekly tracking", bounty: 100, bids: 4, deadline: "60天", deadlineEn: "60 days", level: "🔥", author: "匿名用户 #2288", authorEn: "Anon #2288", status: "进行中", isReal: false },
  ] satisfies MarketNeed[];

  const allNeeds: MarketNeed[] = [
    ...realNeeds
      .slice()
      .reverse()
      .map((g) => {
        const now = Math.floor(Date.now() / 1000);
        const remainingSeconds = Number(g.deadline) - now;
        const remainingDays = Math.max(0, Math.floor(remainingSeconds / 86400));

        const titleMatch = g.title.match(/\[(.*?)\]\s*(.*)/);
        const category = titleMatch?.[1] || "其他";
        const title = titleMatch?.[2]?.split("\n")[0] || g.title.split("\n")[0];

        const descriptionPart = g.title.split("Description: ")[1]?.split("Goal: ")[0] || "";
        const goalPart = g.title.split("Goal: ")[1] || "";

        return {
          id: `contract-${g.id}`,
          realId: g.id,
          title,
          category,
          description: descriptionPart || g.title,
          goal: goalPart,
          bounty: g.bounty,
          bids: 0,
          isReal: true,
          deadline: `${remainingDays}天`,
          status: "竞拍中",
          author: `${g.creator.slice(0, 6)}...${g.creator.slice(-4)}`,
        };
      }),
    ...mockNeeds,
  ];

  const filtered = allNeeds.filter((n) => {
    const matchCat = activeCategory === "全部" || n.category === activeCategory;
    const matchSearch = n.title.includes(searchQuery) || n.description.includes(searchQuery);
    return matchCat && matchSearch;
  });

  // Auto-scroll sponsored challenges
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let pos = 0;
    const interval = setInterval(() => {
      pos += 1;
      if (pos >= el.scrollWidth - el.clientWidth) pos = 0;
      el.scrollTo({ left: pos, behavior: "smooth" });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="container mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            {t("marketTitle")}<span className="text-gradient-primary">{t("market")}</span>
          </h1>
          <p className="text-muted-foreground mb-8">{t("marketDesc")}</p>
        </motion.div>

        {/* Sponsored Challenges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-lg">
              {language === "zh" ? "品牌赞助挑战" : "Brand Sponsored Challenges"}
            </h2>
            <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 border border-primary/30 text-primary font-medium">
              {t("sponsored")}
            </span>
          </div>

          <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {sponsoredChallenges.map((sc, i) => (
              <motion.div
                key={sc.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="sponsored-card min-w-[300px] sm:min-w-[340px] p-5 cursor-pointer group"
              >
                <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${sc.gradient} rounded-xl`} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{sc.icon}</span>
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-primary">
                      <Star className="w-3 h-3 fill-primary" />
                      {t("sponsored")}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-base mb-1 group-hover:text-gradient-primary transition-colors">
                    {language === "zh" ? sc.title : sc.titleEn}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">by {sc.brand}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Coins className="w-3 h-3 text-primary" />
                      {sc.bounty} USDC
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {sc.participants} {language === "zh" ? "参与" : "joined"}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Filter className="w-4 h-4" />
            {t("filter")}
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {language === "zh" ? cat : categoriesEn[cat] || cat}
            </button>
          ))}
        </div>

        {/* Opportunity Matching Banner */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-8 p-4 rounded-xl bg-gradient-to-r from-accent/10 via-secondary/10 to-primary/10 border border-accent/20 flex items-center gap-3"
            >
              <Sparkles className="w-5 h-5 text-accent shrink-0" />
              <div className="flex-1">
                <span className="text-sm font-medium">{language === "zh" ? "🎯 智能匹配" : "🎯 Smart Matching"}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {language === "zh" ? "根据你的技能和兴趣推荐最适合的需求" : "Recommending tasks based on your skills and interests"}
                </span>
              </div>
              <button className="text-xs text-accent hover:text-accent/80 transition-colors whitespace-nowrap">
                {language === "zh" ? "查看推荐 →" : "View Matches →"}
              </button>
            </motion.div>

            {/* Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((need, i) => (
                <motion.div
                  key={`${need.id}-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`glass-card p-6 hover:border-primary/30 transition-all group ${
                    need.status === "进行中" ? "status-star" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                      {language === "zh" ? need.category : categoriesEn[need.category] || need.category}
                    </span>
                    <span className="text-sm">{"🔥"}</span>
                  </div>

                  <h3 className="font-display font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {need.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {need.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-primary" />
                      {need.bounty} AVAX
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {need.bids} {t("bids")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {need.deadline}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {need.author}
                    </span>
                    <Link
                      to={`/bid/${need.realId ?? need.id}`}
                      className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                        need.status === "竞拍中"
                          ? "text-primary hover:text-primary/80"
                          : "text-secondary hover:text-secondary/80"
                      }`}
                    >
                      {need.status === "竞拍中" ? (language === "zh" ? "立即参与" : "Bid Now") : (language === "zh" ? "查看详情" : "Details")}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
