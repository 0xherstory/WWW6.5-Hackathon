import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTheme } from "@/hooks/useTheme";
import logoLight from "@/assets/beautyproof-logo2.png";
import logoDark from "@/assets/beautyproof-logo1-dark.png";

const HeroSection = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();

  return (
    <section className="pt-8 pb-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl mx-auto"
      >
        <div className="flex flex-col items-center justify-center">
          <motion.img
            src={theme === "dark" ? logoDark : logoLight}
            alt="BeautyProof"
            width={480}
            height={480}
            className="w-[20rem] h-auto md:w-[28rem]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-sm md:text-base font-medium text-primary/80 tracking-widest uppercase mt-1 mb-3"
        >
          {t("hero.subtitle")}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="text-muted-foreground text-[0.8125rem] leading-relaxed max-w-sm mx-auto"
        >
          {t("hero.description")}
        </motion.p>
      </motion.div>
    </section>
  );
};

export default HeroSection;
