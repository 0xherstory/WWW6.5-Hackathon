import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Store, PlusCircle, TrendingUp, Trophy, Wallet, Globe, LogOut, ChevronDown, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, setShowAuthModal, disconnect } = useAuth();
  const { t, toggleLanguage, language } = useLanguage();
  const [showProfile, setShowProfile] = useState(false);

  const navItems = [
    { path: "/", label: t("navHome"), icon: Sparkles },
    { path: "/marketplace", label: t("navMarket"), icon: Store },
    { path: "/create", label: t("navCreate"), icon: PlusCircle },
    { path: "/growth", label: t("navGrowth"), icon: TrendingUp },
    { path: "/leaderboard", label: t("navLeaderboard"), icon: Trophy },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-t-0 border-x-0 rounded-none">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">
            {language === "zh" ? "光合" : "Solar"}
            <span className="text-gradient-primary">{language === "zh" ? "契约" : "Pact"}</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-primary/10 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">{language === "zh" ? "EN" : "中文"}</span>
          </button>

          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
              >
                <img src={user.avatar} alt="" className="w-5 h-5 rounded-full" />
                <span className="hidden sm:inline">{user.displayAddress}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 w-56 glass-card p-3 space-y-2"
                >
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    {user.role === "publisher" ? t("rolePublisher") : t("rolePartner")}
                    <span className="ml-2">
                      {user.level === "seed" ? "🌱" : user.level === "breaker" ? "🔥" : "⛰️"}
                    </span>
                  </div>
                  <button
                    onClick={() => { navigate("/profile"); setShowProfile(false); }}
                    className="w-full px-3 py-2 text-sm text-left rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5" />
                    {language === "zh" ? "个人主页" : "My Profile"}
                  </button>
                  <button
                    onClick={() => { setShowAuthModal(true); setShowProfile(false); }}
                    className="w-full px-3 py-2 text-sm text-left rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {t("selectRole")}
                  </button>
                  <button
                    onClick={() => { disconnect(); setShowProfile(false); }}
                    className="w-full px-3 py-2 text-sm text-left rounded-lg hover:bg-destructive/10 text-destructive transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {t("disconnect")}
                  </button>
                </motion.div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">{t("connectWallet")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex justify-around py-2 border-t border-border/30">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 text-xs ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;