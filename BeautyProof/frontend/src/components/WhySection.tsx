import { motion } from "framer-motion";
import { AlertCircle, FolderLock, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const WhySection = () => {
  const { t, isRTL } = useLanguage();

  const points = [
    { icon: AlertCircle, key: "why.point1" },
    { icon: FolderLock, key: "why.point2" },
    { icon: CheckCircle2, key: "why.point3" },
  ];

  return (
    <section className="py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl mx-auto"
      >
        <h2 className="text-xl md:text-2xl font-display text-foreground mb-5 text-center tracking-tight">
          {t("why.title")}
        </h2>
        <div className="space-y-3">
          {points.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: isRTL ? 20 : -20, scale: 0.97 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.45, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="flex items-start gap-3 bg-card rounded-lg border border-border/60 p-4 shadow-sm"
            >
              <p.icon className="w-[1.125rem] h-[1.125rem] text-primary mt-0.5 shrink-0" />
              <p className="text-[0.8125rem] text-foreground/85 leading-relaxed">{t(p.key)}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default WhySection;
