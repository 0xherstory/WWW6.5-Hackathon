import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { Music, Lightbulb, Shield, Fingerprint, BookOpen, Piano, Globe, Menu, X, GraduationCap, LogIn, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { path: "/create", icon: Music, en: "Create", cn: "创作" },
  { path: "/vault", icon: Lightbulb, en: "Idea Vault", cn: "灵感保险箱" },
  { path: "/playground", icon: Piano, en: "Playground", cn: "音乐实验" },
  { path: "/check", icon: Fingerprint, en: "Check", cn: "查重" },
  { path: "/legacy", icon: Shield, en: "Legacy", cn: "数字遗产" },
  { path: "/blockchain", icon: Shield, en: "Proof", cn: "链上证明" },
  { path: "/stories", icon: BookOpen, en: "Stories", cn: "故事" },
  { path: "/theory", icon: GraduationCap, en: "Theory", cn: "乐理" },
];

export default function Navbar() {
  const { lang, toggle, t } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-glass-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg font-display font-bold gradient-text">AfterSound</span>
          <span className="text-sm text-serif-cn text-muted-foreground">余音</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button variant={location.pathname === item.path ? "glass" : "ghost"} size="sm" className="gap-1.5">
                <item.icon className="w-3.5 h-3.5" />
                {t(item.en, item.cn)}
              </Button>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <Link to="/profile">
              <Button variant="ghost" size="sm" className="gap-1">
                <User className="w-3.5 h-3.5" />
                {t("Profile", "我的")}
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="gap-1">
                <LogIn className="w-3.5 h-3.5" />
                {t("Login", "登录")}
              </Button>
            </Link>
          )}
          <Button variant="ghost" size="sm" onClick={toggle} className="gap-1">
            <Globe className="w-3.5 h-3.5" />
            {lang === "en" ? "中文" : "EN"}
          </Button>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden glass border-t border-glass-border p-4 animate-fade-in">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} onClick={() => setOpen(false)}>
                <Button variant={location.pathname === item.path ? "glass" : "ghost"} className="w-full justify-start gap-2">
                  <item.icon className="w-4 h-4" />
                  {t(item.en, item.cn)}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
