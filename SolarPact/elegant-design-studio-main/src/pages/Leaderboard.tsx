import { motion } from "framer-motion";
import { Trophy, Flame, Heart, Star, TrendingUp } from "lucide-react";
import { useState } from "react";

const tabs = [
  { key: "brave", label: "最勇敢用户", icon: Flame },
  { key: "mentor", label: "最强导师", icon: Star },
  { key: "hot", label: "最热需求", icon: TrendingUp },
];

const braveData = [
  { rank: 1, name: "用户 #3847", score: "12 次契约", success: "92%", sbt: 8 },
  { rank: 2, name: "用户 #1204", score: "9 次契约", success: "89%", sbt: 6 },
  { rank: 3, name: "用户 #7721", score: "8 次契约", success: "100%", sbt: 7 },
  { rank: 4, name: "用户 #5529", score: "7 次契约", success: "86%", sbt: 5 },
  { rank: 5, name: "用户 #9103", score: "6 次契约", success: "83%", sbt: 4 },
];

const mentorData = [
  { rank: 1, name: "导师 Alice", score: "4.9 评分", success: "95%", investments: 15 },
  { rank: 2, name: "导师 Carol", score: "4.8 评分", success: "90%", investments: 12 },
  { rank: 3, name: "导师 David", score: "4.7 评分", success: "88%", investments: 10 },
  { rank: 4, name: "导师 Eve", score: "4.6 评分", success: "85%", investments: 8 },
  { rank: 5, name: "导师 Bob", score: "4.5 评分", success: "82%", investments: 7 },
];

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState("brave");
  const data = activeTab === "brave" ? braveData : mentorData;

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
            排行<span className="text-gradient-primary">榜</span>
          </h1>
          <p className="text-muted-foreground mb-8">成长的路上，你不孤独</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "glass-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Portfolio card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-8 glow-primary"
        >
          <div className="flex items-center gap-3 mb-3">
            <Heart className="w-5 h-5 text-secondary" />
            <span className="font-display font-semibold">我的投资组合</span>
          </div>
          <p className="text-muted-foreground text-sm mb-2">
            "我投资了 <span className="text-primary font-semibold">5</span> 个需求，成功率{" "}
            <span className="text-primary font-semibold">80%</span>"
          </p>
          <div className="flex gap-2 mt-3">
            {["🌱", "🔥", "🔥", "⛰️", "🌱"].map((emoji, i) => (
              <div key={i} className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center text-lg">
                {emoji}
              </div>
            ))}
          </div>
        </motion.div>

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
                <div className="text-sm text-muted-foreground">{item.score}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-primary">{item.success}</div>
                <div className="text-xs text-muted-foreground">成功率</div>
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
            需求故事 <span className="text-gradient-nebula">NFT</span>
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { level: "🌱 萌芽", type: "小需求", reward: "勇气芽" },
              { level: "🔥 烈焰", type: "中需求", reward: "破壁者" },
              { level: "⛰️ 巅峰", type: "大需求", reward: "征服者" },
            ].map((nft) => (
              <div key={nft.level} className="glass-card p-4 text-center">
                <div className="text-2xl mb-2">{nft.level.split(" ")[0]}</div>
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
