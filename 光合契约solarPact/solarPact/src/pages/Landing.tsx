import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Zap, Users, Globe, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import PlanetSystem from "@/components/PlanetSystem";

const Landing = () => {
  const { t, language } = useLanguage();

  const features = [
    { icon: Zap, title: t("emotionAsset"), desc: t("emotionAssetDesc"), color: "text-primary", glow: "glow-primary" },
    { icon: Users, title: t("growthNetwork"), desc: t("growthNetworkDesc"), color: "text-secondary", glow: "glow-secondary" },
    { icon: Shield, title: t("smartContract"), desc: t("smartContractDesc"), color: "text-accent", glow: "glow-accent" },
    { icon: Globe, title: t("onChainRecord"), desc: t("onChainRecordDesc"), color: "text-primary", glow: "glow-primary" },
  ];

  const stats = [
    { value: "2,847", label: t("activeNeeds") },
    { value: "12,000+", label: t("growthPartners") },
    { value: "89%", label: t("successRate") },
    { value: "$1.2M", label: t("totalPool") },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-28 pb-20 px-6 overflow-hidden" style={{ background: "hsl(230 25% 5%)" }}>
        {/* Subtle nebula */}
        <div className="absolute inset-0 opacity-30" style={{
          background: "radial-gradient(ellipse at 65% 40%, hsl(var(--primary) / 0.08) 0%, transparent 50%), radial-gradient(ellipse at 30% 70%, hsl(var(--accent) / 0.06) 0%, transparent 50%)"
        }} />

        <div className="container mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center min-h-[75vh]">
            {/* LEFT — brand + copy */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-lg"
            >
              {/* Brand lockup — prominent */}
              <div className="mb-8">
                <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
                  <span className="text-gradient-primary">光合契约</span>
                </h1>
                <p className="text-muted-foreground/50 text-xs font-display tracking-[0.35em] uppercase mt-2">
                  SolarPact Protocol
                </p>
              </div>

              {/* Core tagline */}
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground leading-snug mb-5">
                {language === "zh" ? "让女性成长" : "Turn women's growth"}
                <br />
                <span className="text-gradient-nebula">
                  {language === "zh" ? "成为链上资产" : "into on-chain assets"}
                </span>
              </h2>

              <p className="text-muted-foreground text-sm md:text-base max-w-md mb-8 leading-relaxed">
                {language === "zh"
                  ? "发布成长需求，匹配伙伴，用智能合约保障每一次蜕变。你的每一步成长，都将成为不可篡改的链上证明。"
                  : "Publish growth needs, match partners, and secure every transformation with smart contracts. Every step of your growth becomes an immutable on-chain proof."}
              </p>

              {/* Product signals */}
              <div className="flex items-center gap-4 mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/60 border border-border/30 text-muted-foreground text-[11px] font-mono">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  0x47...686e
                </div>
                <div className="text-muted-foreground/50 text-[11px] font-mono">
                  12 {language === "zh" ? "活跃契约" : "active contracts"}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/marketplace"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-sm hover:brightness-110 transition-all"
                >
                  {t("heroExplore")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/create"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-border/40 bg-card/20 backdrop-blur-sm text-foreground font-display font-medium text-sm hover:border-primary/30 transition-all"
                >
                  {t("heroPublish")}
                </Link>
              </div>
            </motion.div>

            {/* RIGHT — planet system */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-center relative"
            >
              <PlanetSystem />

              {/* Interactive hint labels around planet */}
              <motion.div
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                {[
                  language === "zh" ? "🌱 发布需求" : "🌱 Publish",
                  language === "zh" ? "🔗 链上验证" : "🔗 Verify",
                  language === "zh" ? "🏆 成长凭证" : "🏆 Proof",
                ].map((label) => (
                  <span
                    key={label}
                    className="text-[10px] text-muted-foreground/40 font-mono px-2 py-1 rounded-full border border-border/20 bg-card/20"
                  >
                    {label}
                  </span>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Brand ribbon */}
      <section className="relative overflow-hidden py-4 border-y border-border/15" style={{ background: "hsl(230 25% 6%)" }}>
        <motion.div
          className="flex whitespace-nowrap gap-12 text-muted-foreground/15 font-display text-lg tracking-[0.2em] uppercase"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="flex items-center gap-12">
              <span>光合契约</span>
              <span className="text-primary/20">·</span>
              <span>SolarPact</span>
              <span className="text-primary/20">·</span>
              <span>Growth Protocol</span>
              <span className="text-primary/20">·</span>
            </span>
          ))}
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="font-display text-4xl font-bold text-gradient-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
              {t("fourModules")}<span className="text-gradient-nebula">{t("modules")}</span>
            </h2>
            <p className="text-muted-foreground max-w-lg">
              {t("step01")} → {t("step02")} → {t("step04")} → {t("step05")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-8 group hover:border-primary/30 transition-all"
              >
                <div className={`w-14 h-14 rounded-2xl bg-muted/80 flex items-center justify-center mb-5 ${f.color} group-hover:${f.glow} transition-shadow`}>
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Flow */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
              {t("coreFlow")}<span className="text-gradient-primary">{t("flow")}</span>
            </h2>
          </motion.div>

          <div className="relative">
            <div className="hidden md:block absolute top-12 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

            <div className="grid md:grid-cols-5 gap-6">
              {[
                { step: "01", title: t("step01"), desc: t("step01Desc"), icon: "🌱" },
                { step: "02", title: t("step02"), desc: t("step02Desc"), icon: "🔥" },
                { step: "03", title: t("step03"), desc: t("step03Desc"), icon: "📜" },
                { step: "04", title: t("step04"), desc: t("step04Desc"), icon: "⚡" },
                { step: "05", title: t("step05"), desc: t("step05Desc"), icon: "🏆" },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  viewport={{ once: true }}
                  className="glass-card p-6 text-center relative"
                >
                  <div className="relative z-10">
                    <div className="w-10 h-10 mx-auto rounded-full bg-muted/80 border border-border/50 flex items-center justify-center text-xl mb-4">
                      {item.icon}
                    </div>
                    <div className="text-[10px] text-primary font-display font-bold tracking-widest uppercase mb-2">
                      Step {item.step}
                    </div>
                    <h3 className="font-display font-semibold text-sm mb-1">{item.title}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why blockchain */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl font-bold mb-10">
              {t("whyBlockchain")}<span className="text-gradient-nebula">{t("blockchain")}</span>？
            </h2>
            <div className="space-y-3">
              {[
                { ability: t("fundCustody"), problem: t("antiDefault"), icon: Shield },
                { ability: t("behaviorRecord"), problem: t("antiTamper"), icon: Globe },
                { ability: t("autoExecute"), problem: t("trustless"), icon: Zap },
                { ability: t("crossPlatform"), problem: t("nftPermanent"), icon: TrendingUp },
              ].map((item) => (
                <div key={item.ability} className="glass-card p-5 flex items-center gap-4 hover:border-primary/20 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center text-primary shrink-0">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="font-display font-semibold">{item.ability}</span>
                    <span className="text-muted-foreground ml-2 text-sm">— {item.problem}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-16 max-w-2xl mx-auto relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5" />
            <div className="relative">
              <h2 className="font-display text-3xl font-bold mb-4">
                {t("ctaTitle1")}<span className="text-gradient-primary">{t("ctaTitle2")}</span>
              </h2>
              <p className="text-muted-foreground mb-10">{t("ctaDesc")}</p>
              <Link
                to="/create"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-secondary to-accent text-secondary-foreground font-display font-semibold hover:scale-[1.03] transition-transform"
              >
                {t("startNow")}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/20">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-gradient-primary">光合契约</span>
            <span className="text-muted-foreground/40 text-xs font-mono">SolarPact</span>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-sm">{t("copyright")}</p>
            <p className="mt-1 text-xs text-muted-foreground/50">{t("footerSlogan")}</p>
          </div>
          <div className="text-muted-foreground/30 text-[10px] font-mono">
            v0.1.0-alpha
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
