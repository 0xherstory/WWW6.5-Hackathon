import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrendingUp, Trophy, Shield, Coins, ArrowRight, Settings, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const Profile = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [publicGrowth, setPublicGrowth] = useState(false);
  const [publicRank, setPublicRank] = useState(false);

  if (!user) return null;

  const stats = [
    { label: language === "zh" ? "活跃契约" : "Active Contracts", value: "3", icon: Shield, color: "text-accent" },
    { label: language === "zh" ? "累计奖金" : "Total Bounty", value: "450 USDC", icon: Coins, color: "text-primary" },
    { label: language === "zh" ? "成功率" : "Success Rate", value: "89%", icon: TrendingUp, color: "text-emerald-400" },
    { label: language === "zh" ? "SBT 徽章" : "SBT Badges", value: "5", icon: Trophy, color: "text-secondary" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="container mx-auto max-w-2xl">
        {/* Avatar & Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 text-center mb-6"
        >
          <div className="relative inline-block mb-4">
            <img
              src={user.avatar}
              alt="avatar"
              className="w-24 h-24 rounded-full border-2 border-primary/40"
            />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm">
              {user.level === "seed" ? "🌱" : user.level === "breaker" ? "🔥" : "⛰️"}
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold mb-1">{user.displayAddress}</h1>
          <p className="text-sm text-muted-foreground mb-1">
            {user.role === "publisher"
              ? (language === "zh" ? "需求发布者" : "Demand Publisher")
              : (language === "zh" ? "成长伙伴" : "Growth Partner")}
          </p>
          <p className="text-sm text-primary">
            {user.level === "seed"
              ? (language === "zh" ? "🌱 勇气种子" : "🌱 Courage Seed")
              : user.level === "breaker"
              ? (language === "zh" ? "🔥 破壁者" : "🔥 Breaker")
              : (language === "zh" ? "⛰️ 征服者" : "⛰️ Conqueror")}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4 mb-6"
        >
          {stats.map((s, i) => (
            <div key={i} className="glass-card p-4 text-center">
              <s.icon className={`w-5 h-5 mx-auto mb-2 ${s.color}`} />
              <div className="font-display font-bold text-lg">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Privacy Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-display font-semibold">
              {language === "zh" ? "隐私设置" : "Privacy Settings"}
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {publicGrowth ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                <span className="text-sm">
                  {language === "zh" ? "公开我的成长追踪" : "Public Growth Tracking"}
                </span>
              </div>
              <button
                onClick={() => setPublicGrowth(!publicGrowth)}
                className={`w-11 h-6 rounded-full transition-colors relative ${publicGrowth ? "bg-primary" : "bg-muted"}`}
              >
                <div className={`w-5 h-5 rounded-full bg-foreground absolute top-0.5 transition-transform ${publicGrowth ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {publicRank ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                <span className="text-sm">
                  {language === "zh" ? "公开我的排行榜数据" : "Public Leaderboard Data"}
                </span>
              </div>
              <button
                onClick={() => setPublicRank(!publicRank)}
                className={`w-11 h-6 rounded-full transition-colors relative ${publicRank ? "bg-primary" : "bg-muted"}`}
              >
                <div className={`w-5 h-5 rounded-full bg-foreground absolute top-0.5 transition-transform ${publicRank ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            {language === "zh"
              ? "💡 关闭后，其他用户将无法看到你的个人成长记录和排行数据。区域/社群排行榜始终公开。"
              : "💡 When off, others cannot see your personal growth records or ranking. Community leaderboards remain public."}
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <Link
            to="/growth"
            className="glass-card p-5 flex items-center justify-between group hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="font-display font-semibold">
                {language === "zh" ? "我的成长追踪" : "My Growth Tracking"}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>

          <Link
            to="/leaderboard"
            className="glass-card p-5 flex items-center justify-between group hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-secondary" />
              <span className="font-display font-semibold">
                {language === "zh" ? "排行榜" : "Leaderboard"}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>

          <Link
            to="/marketplace"
            className="glass-card p-5 flex items-center justify-between group hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Coins className="w-5 h-5 text-accent" />
              <span className="font-display font-semibold">
                {language === "zh" ? "需求市场" : "Demand Market"}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;