import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Zap, Users, Globe, Sparkles, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "情绪资产化",
    desc: "将情绪结构化，转化为链上可验证的成长任务资产",
    color: "text-primary",
  },
  {
    icon: Users,
    title: "成长互助网络",
    desc: "他人竞拍成为你的成长伙伴，用外部投资驱动行动",
    color: "text-secondary",
  },
  {
    icon: Shield,
    title: "智能合约保障",
    desc: "双向质押 + 自动结算，无需信任第三方",
    color: "text-accent",
  },
  {
    icon: Globe,
    title: "链上永久记录",
    desc: "每次行动生成不可转让的成长凭证（SBT）",
    color: "text-primary",
  },
];

const stats = [
  { value: "2,847", label: "活跃需求" },
  { value: "12,000+", label: "成长伙伴" },
  { value: "89%", label: "契约成功率" },
  { value: "$1.2M", label: "累计奖金池" },
];

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              基于 Avalanche 构建
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
              让女性的成长
              <br />
              <span className="text-gradient-primary">成为可投资的资产</span>
            </h1>

            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              全球首个「女性勇气预言机」——在这里，恐惧不再是弱点，
              而是一种可以被验证、被投资、被复利的资产。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/marketplace"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-amber-400 text-primary-foreground font-display font-semibold text-lg glow-primary hover:scale-105 transition-transform"
              >
                探索需求市场
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/create"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl glass-card text-foreground font-display font-semibold text-lg hover:bg-card/80 transition-colors"
              >
                发布我的需求
              </Link>
            </div>
          </motion.div>

          {/* Floating orb */}
          <motion.div
            className="absolute top-20 right-10 w-64 h-64 rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(circle, hsl(var(--secondary)), transparent)" }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 left-10 w-48 h-48 rounded-full opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle, hsl(var(--accent)), transparent)" }}
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.15, 0.3] }}
            transition={{ duration: 7, repeat: Infinity }}
          />
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-6 text-center"
              >
                <div className="font-display text-3xl font-bold text-gradient-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              四大核心<span className="text-gradient-nebula">模块</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              发布需求 → 竞拍伙伴 → 执行成长 → 结果结算
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="glass-card p-6 group hover:border-primary/30 transition-colors"
              >
                <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Flow */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              核心<span className="text-gradient-primary">流程</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-4">
            {[
              { step: "01", title: "发布需求", desc: "创建链上任务，存入奖金", icon: "🌱" },
              { step: "02", title: "竞拍伙伴", desc: "他人竞拍成为成长伙伴", icon: "🔥" },
              { step: "03", title: "签订契约", desc: "智能合约自动锁定质押", icon: "📜" },
              { step: "04", title: "执行打卡", desc: "每周链上记录成长行为", icon: "⚡" },
              { step: "05", title: "结果结算", desc: "自动分配奖金与NFT", icon: "🏆" },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-5 text-center relative"
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="text-xs text-primary font-display font-semibold mb-1">STEP {item.step}</div>
                <h3 className="font-display font-semibold mb-1">{item.title}</h3>
                <p className="text-muted-foreground text-xs">{item.desc}</p>
                {i < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 text-muted-foreground">→</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why blockchain */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl font-bold text-center mb-10">
              为什么必须用<span className="text-gradient-nebula">区块链</span>？
            </h2>
            <div className="space-y-4">
              {[
                { ability: "资金托管", problem: "防赖账", icon: Shield },
                { ability: "行为记录", problem: "防篡改", icon: Globe },
                { ability: "自动执行", problem: "无需信任", icon: Zap },
                { ability: "跨平台资产", problem: "NFT永久存在", icon: TrendingUp },
              ].map((item) => (
                <div key={item.ability} className="glass-card p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="font-display font-semibold">{item.ability}</span>
                    <span className="text-muted-foreground ml-2">— {item.problem}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 glow-secondary max-w-2xl mx-auto"
          >
            <h2 className="font-display text-3xl font-bold mb-4">
              我们把焦虑，变成了<span className="text-gradient-primary">生产力</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              这不是一个应用，这是全球第一个「女性勇气预言机」
            </p>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-secondary to-accent text-secondary-foreground font-display font-semibold glow-secondary hover:scale-105 transition-transform"
            >
              立即开始
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-border/30">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          <p>© 2026 Photosyn-Action. Built on Avalanche.</p>
          <p className="mt-1">让女性的成长成为可以被投资的资产</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
