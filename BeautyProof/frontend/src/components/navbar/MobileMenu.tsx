import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface NavLink {
  key: string;
  hash: string;
}

interface MobileMenuButtonProps {
  open: boolean;
  onToggle: () => void;
}

interface MobileMenuDropdownProps {
  navLinks: NavLink[];
  open: boolean;
  onNavigate: (hash: string) => void;
  activeHash?: string;
}

export const MobileMenuButton = ({ open, onToggle }: MobileMenuButtonProps) => (
  <button
    onClick={onToggle}
    className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
    aria-label="Toggle menu"
  >
    <AnimatePresence mode="wait" initial={false}>
      {open ? (
        <motion.span
          key="close"
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="block"
        >
          <X className="w-5 h-5" />
        </motion.span>
      ) : (
        <motion.span
          key="menu"
          initial={{ rotate: 90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: -90, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="block"
        >
          <Menu className="w-5 h-5" />
        </motion.span>
      )}
    </AnimatePresence>
  </button>
);

export const MobileMenuDropdown = ({ navLinks, open, onNavigate, activeHash }: MobileMenuDropdownProps) => {
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="sm:hidden overflow-hidden bg-background/95 backdrop-blur-md border-b border-border/40"
        >
          <div className="max-w-2xl mx-auto px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link, i) => {
              const isActive = activeHash === link.hash;
              return (
                <motion.button
                  key={link.hash}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  onClick={() => onNavigate(link.hash)}
                  className={`text-start text-sm transition-colors px-3 py-2.5 rounded-md ${
                    isActive
                      ? "text-foreground bg-accent/60 font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  {t(link.key)}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
