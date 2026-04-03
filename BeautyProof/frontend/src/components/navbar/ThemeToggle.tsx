import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={toggleTheme}
          className="relative p-1.5 text-muted-foreground hover:text-foreground transition-colors overflow-hidden"
          aria-label="Toggle theme"
        >
          <AnimatePresence mode="wait" initial={false}>
            {theme === "light" ? (
              <motion.span
                key="moon"
                initial={{ y: -14, opacity: 0, rotate: -90 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 14, opacity: 0, rotate: 90 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="block"
              >
                <Moon className="w-3.5 h-3.5" />
              </motion.span>
            ) : (
              <motion.span
                key="sun"
                initial={{ y: -14, opacity: 0, rotate: -90 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 14, opacity: 0, rotate: 90 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="block"
              >
                <Sun className="w-3.5 h-3.5" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {theme === "light" ? "Dark mode" : "Light mode"}
      </TooltipContent>
    </Tooltip>
  );
};

export default ThemeToggle;
