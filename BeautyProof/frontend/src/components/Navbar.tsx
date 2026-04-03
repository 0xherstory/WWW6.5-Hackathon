import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTheme } from "@/hooks/useTheme";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { TooltipProvider } from "@/components/ui/tooltip";
import ThemeToggle from "@/components/navbar/ThemeToggle";
import LanguageSelector from "@/components/navbar/LanguageSelector";
import { MobileMenuButton, MobileMenuDropdown } from "@/components/navbar/MobileMenu";
import logoLight from "@/assets/beautyproof-logo1.png";
import logoDark from "@/assets/beautyproof-logo1-dark.png";

const navLinks = [
  { key: "nav.why", hash: "#why" },
  { key: "nav.wallet", hash: "#wallet" },
  { key: "nav.submit", hash: "#submit" },
  { key: "nav.query", hash: "#query" },
];

const sectionIds = navLinks.map((l) => l.hash.replace("#", ""));

const Navbar = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeId = useScrollSpy(sectionIds);

  const scrollTo = (hash: string) => {
    const el = document.querySelector(hash);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileOpen(false);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 shrink-0">
            <img src={theme === "dark" ? logoDark : logoLight} alt="BeautyProof" className="w-7 h-7" />
            <span className="text-sm font-display text-foreground tracking-tight hidden sm:inline">
              BeautyProof
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            {navLinks.map((link) => {
              const isActive = activeId === link.hash.replace("#", "");
              return (
                <button
                  key={link.hash}
                  onClick={() => scrollTo(link.hash)}
                  className={`text-xs transition-colors px-2.5 py-1.5 relative rounded-full ${
                    isActive
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-accent/60"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{t(link.key)}</span>
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
            <ThemeToggle />
            <LanguageSelector />
          </div>

          <div className="flex sm:hidden items-center gap-1">
            <ThemeToggle />
            <LanguageSelector />
            <MobileMenuButton open={mobileOpen} onToggle={() => setMobileOpen((v) => !v)} />
          </div>
        </div>

        <MobileMenuDropdown navLinks={navLinks} open={mobileOpen} onNavigate={scrollTo} activeHash={activeId ? `#${activeId}` : ""} />
      </nav>
    </TooltipProvider>
  );
};

export default Navbar;
