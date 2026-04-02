import { motion } from "framer-motion";
import { Trophy, Flame, Heart, Star, TrendingUp, Eye, EyeOff, Globe, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

type LeaderboardItem = {
  rank: number;
  name: string;
  score: string;
  scoreEn?: string;
  success: string;
  members?: number;
  sbt?: number;
  investments?: number;
};

const tabs = [
  { key: "community", labelZh: "社群排行", labelEn: "Community", icon: Globe },
  { key: "brave", labelZh: "最勇敢用户", labelEn: "Bravest Users", icon: Flame },
  { key: "partner", labelZh: "最佳伙伴", labelEn: "Best Partners", icon: Star },
  { key: "hot", labelZh: "最热需求", labelEn: "Trending", icon: TrendingUp },
];

const communityData: LeaderboardItem[] = [
  { rank: 1, name: "Web3 Women DAO", score: "328 契约", scoreEn: "328 contracts", success: "91%", members: 1240 },
  { rank: 2, name: "SheBuilds", score: "215 契约", scoreEn: "215 contracts", success: "88%", members: 890 },
  { rank: 3, name: "Women in DeFi", score: "189 契约", scoreEn: "189 contracts", success: "93%", members: 670 },
];

const braveData: LeaderboardItem[] = [
  { rank: 1, name: "用户 #3847", score: "12 次契约", scoreEn: "12 contracts", success: "92%", sbt: 8 },
  { rank: 2, name: "用户 #1204", score: "9 次契约", scoreEn: "9 contracts", success: "89%", sbt: 6 },
  { rank: 3, name: "用户 #7721", score: "8 次契约", scoreEn: "8 contracts", success: "100%", sbt: 7 },
  { rank: 4, name: "用户 #5529", score: "7 次契约", scoreEn: "7 contracts", success: "86%", sbt: 5 },
  { rank: 5, name: "用户 #9103", score: "6 次契约", scoreEn: "6 contracts", success: "83%", sbt: 4 },
];

const partnerData: LeaderboardItem[] = [
  { rank: 1, name: "Alice", score: "4.9 评分", scoreEn: "4.9 rating", success: "95%", investments: 15 },
  { rank: 2, name: "Carol", score: "4.8 评分", scoreEn: "4.8 rating", success: "90%", investments: 12 },
  { rank: 3, name: "David", score: "4.7 评分", scoreEn: "4.7 rating", success: "88%", investments: 10 },
  { rank: 4, name: "Eve", score: "4.6 评分", scoreEn: "4.6 rating", success: "85%", investments: 8 },
  { rank: 5, name: "Bob", score: "4.5 评分", scoreEn: "4.5 rating", success: "82%", investments: 7 },
];

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState("community");
  const { user } = useAuth();
  const { language } = useLanguage();
  const [showMyData, setShowMyData] = useState(true);

  const getData = (): LeaderboardItem[] => {
    if (activeTab === "community") return communityData;
    if (activeTab === "brave") return braveData;
    return partnerData;
  };
  const data = getData();

  const getRankColor = (rank: number) => {
    if (rank === 1) return "from-primary to-amber-400";
    if (rank === 2) return "from-muted-foreground to-foreground";
    if (rank === 3) return "from-amber-700 to-amber-500";
    return "from-muted to-muted";
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="container mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-2">
            <Trophy className="inline w-8 h-8 text-primary mr-2" />
            {language === "zh" ? "排行" : "Leader"}
            <span className="text-gradient-primary">{language === "zh" ? "榜" : "board"}</span>
          </h1>
          <p className="text-muted-foreground mb-8">
            {language === "zh" ? "成长的路上，你不孤独" : "You're not alone on this journey"}
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "glass-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {language === "zh" ? tab.labelZh : tab.labelEn}
            </button>
          ))}
        </div>

        {/* My Portfolio (personal, privacy-gated) */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 mb-8 glow-primary"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-secondary" />
                <span className="font-display font-semibold">
                  {language === "zh" ? "我的投资组合" : "My Portfolio"}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({language === "zh" ? "仅自己可见" : "Private"})
                </span>
              </div>
              <button
                onClick={() => setShowMyData(!showMyData)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title={showMyData ? "Hide" : "Show"}
              >
                {showMyData ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            {showMyData ? (
              <>
                <p className="text-muted-foreground text-sm mb-2">
                  {language === "zh" ? (
                    <>我投资了 <span className="text-primary font-semibold">5</span> 个需求，成功率 <span className="text-primary font-semibold">80%</span></>
                  ) : (
                    <>Invested in <span className="text-primary font-semibold">5</span> demands, <span className="text-primary font-semibold">80%</span> success rate</>
                  )}
                </p>
                <div className="flex gap-2 mt-3">
                  {["🌱", "🔥", "🔥", "⛰️", "🌱"].map((emoji, i) => (
                    <div key={i} className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center text-lg">
                      {emoji}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm italic">
                {language === "zh" ? "数据已隐藏" : "Data hidden"}
              </p>
            )}
          </motion.div>
        )}

        {/* Community notice */}
        {activeTab === "community" && (
          <div className="mb-4 p-3 rounded-xl bg-accent/5 border border-accent/20 text-xs text-muted-foreground flex items-center gap-2">
            <Globe className="w-4 h-4 text-accent shrink-0" />
            {language === "zh"
              ? "社群/区域排行榜对所有用户公开可见"
              : "Community leaderboards are publicly visible to all users"}
          </div>
        )}

        {activeTab !== "community" && (
          <div className="mb-4 p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-primary shrink-0" />
            {language === "zh"
              ? "个人排行数据默认私密，用户可在个人主页选择公开"
              : "Personal ranking data is private by default. Users can choose to make it public in their profile."}
          </div>
        )}

        {/* Rankings */}
        <div className="space-y-3">
          {data.map((item, i) => (
            <motion.div
              key={item.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className="glass-card p-5 flex items-center gap-4 hover:border-primary/30 transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRankColor(
                  item.rank
                )} flex items-center justify-center font-display font-bold text-primary-foreground text-sm shrink-0`}
              >
                {item.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-semibold">{item.name}</div>
                <div className="text-sm text-muted-foreground">
                  {language === "zh" ? item.score : item.scoreEn || item.score}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-primary">{item.success}</div>
                <div className="text-xs text-muted-foreground">
                  {language === "zh" ? "成功率" : "Success"}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* NFT Stories */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <h2 className="font-display text-xl font-bold mb-4">
            {language === "zh" ? "需求故事 " : "Demand Story "}
            <span className="text-gradient-nebula">NFT</span>
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { level: "🌱", reward: language === "zh" ? "勇气芽" : "Courage Seed", type: language === "zh" ? "初级需求" : "Starter" },
              { level: "🔥", reward: language === "zh" ? "破壁者" : "Breaker", type: language === "zh" ? "进阶需求" : "Advanced" },
              { level: "⛰️", reward: language === "zh" ? "征服者" : "Conqueror", type: language === "zh" ? "高级需求" : "Elite" },
            ].map((nft) => (
              <div key={nft.reward} className="glass-card p-4 text-center">
                <div className="text-2xl mb-2">{nft.level}</div>
                <div className="font-display font-semibold text-sm mb-1">{nft.reward}</div>
                <div className="text-xs text-muted-foreground">{nft.type}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;
