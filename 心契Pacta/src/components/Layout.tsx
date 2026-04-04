import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { HabitCategory } from "@/data/habitsData";
import WalletConnect from "./WalletConnect";
import { Menu, X } from "lucide-react";
import MicroHabitReferenceSidebar from "./MicroHabitReferenceSidebar";

const navItems: { path: string; category?: HabitCategory; label: string }[] = [
  { path: "/", label: "首页" },
  { path: "/create", label: "✍️ 创建微习惯" },
  { path: "/mental", category: "mental", label: "🧠 脑力" },
  { path: "/physical", category: "physical", label: "💪 身体" },
  { path: "/diet", category: "diet", label: "🥗 饮食" },
  { path: "/happiness", category: "happiness", label: "😊 幸福" },
  { path: "/business", category: "business", label: "💼 商业" },
  { path: "/productivity", category: "productivity", label: "🚀 生产力" },
  { path: "/challenges", label: "📅 我的挑战" },
  { path: "/overview", label: "📈 用户总览" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const isHome = location.pathname === "/";
  const sidebarEnabled = !isHome;

  return (
    <div className="min-h-screen flex flex-col relative isolate overflow-hidden">
      <div className="watercolor-bg-effects" aria-hidden="true">
        <span className="wash-orb orb-a" />
        <span className="wash-orb orb-b" />
        <span className="wash-orb orb-c" />
        <span className="spark-layer" />
      </div>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[hsl(40_38%_98%_/0.72)] backdrop-blur-md border-b border-[hsl(var(--border)_/_0.65)] shadow-[0_1px_0_rgba(255,255,255,0.6)_inset]">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-3xl font-hand font-bold text-foreground">心契</span>
            <span className="text-sm text-muted-foreground hidden sm:inline">Pacta</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ink-underline ${
                  location.pathname === item.path
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <WalletConnect />
            <button className="lg:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t border-border"
            >
              <div className="container py-3 flex flex-col gap-1">
                {navItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={`px-3 py-2 rounded-md text-sm ${
                      location.pathname === item.path
                        ? "text-primary font-semibold bg-primary/5"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Main */}
      <main className="flex-1 container py-8 relative z-10">
        <div className="flex gap-6 items-start">
          <MicroHabitReferenceSidebar enabled={sidebarEnabled} />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 relative z-10">
        <div className="container text-center text-sm text-muted-foreground">
          <p className="font-hand text-lg">心契 Pacta — 你的承诺，链上生效</p>
          <p className="mt-1">Avalanche Fuji Testnet · 全球节点见证</p>
        </div>
      </footer>
    </div>
  );
}
