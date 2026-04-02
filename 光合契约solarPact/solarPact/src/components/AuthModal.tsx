import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, Loader2, UserCircle, Megaphone, HandHelping, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const AuthModal = () => {
  const { user, isAuthenticated, isConnecting, showAuthModal, setShowAuthModal, connectWallet, setRole, disconnect } = useAuth();
  const { t, language } = useLanguage();

  if (!showAuthModal) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        onClick={() => setShowAuthModal(false)}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md glass-card p-8 glow-primary"
        >
          <button
            onClick={() => setShowAuthModal(false)}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {!isAuthenticated ? (
            /* Connect Wallet Step */
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center">
                <Wallet className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">{t("connectWallet")}</h2>
              <p className="text-muted-foreground text-sm mb-8">
                {t("loginRequiredDesc")}
              </p>
              
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-amber-400 text-primary-foreground font-display font-semibold text-lg glow-primary hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    连接中...
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5" />
                    MetaMask / WalletConnect
                  </>
                )}
              </button>
              
              <div className="mt-4 flex gap-3">
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="flex-1 py-3 rounded-xl glass-card text-sm font-medium hover:bg-card/80 transition-colors flex items-center justify-center gap-2"
                >
                  <UserCircle className="w-4 h-4" />
                  Demo 模式
                </button>
              </div>
            </div>
          ) : (
            /* Connected — Role Selection or Switch */
            <div>
              <div className="flex flex-col items-center mb-6">
                <img
                  src={user.avatar}
                  alt="avatar"
                  className="w-16 h-16 rounded-full border-2 border-primary/30 mb-2"
                />
                <h2 className="font-display text-xl font-bold">{user.displayAddress}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {user.role === "publisher" ? t("rolePublisher") : t("rolePartner")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user.level === "seed" ? t("levelSeed") : user.level === "breaker" ? t("levelBreaker") : t("levelConqueror")}
                  </span>
                </div>
              </div>

              <h3 className="text-center font-display font-semibold text-lg mb-4">
                {language === "zh" ? "切换角色身份" : "Switch Role"}
              </h3>
              
              <div className="space-y-4">
                <button
                  onClick={() => { setRole("publisher"); setShowAuthModal(false); }}
                  className={`w-full p-4 rounded-xl glass-card transition-all group text-left flex items-start gap-4 ${
                    user.role === "publisher" ? "border-primary/50 bg-primary/5 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]" : "hover:border-primary/50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-shadow ${
                    user.role === "publisher" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary group-hover:glow-primary"
                  }`}>
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display font-semibold group-hover:text-primary transition-colors">
                        {t("rolePublisher")}
                      </h4>
                      {user.role === "publisher" && (
                        <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                          {language === "zh" ? "当前" : "Current"}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs">{t("rolePublisherDesc")}</p>
                  </div>
                </button>
                
                <button
                  onClick={() => { setRole("partner"); setShowAuthModal(false); }}
                  className={`w-full p-4 rounded-xl glass-card transition-all group text-left flex items-start gap-4 ${
                    user.role === "partner" ? "border-secondary/50 bg-secondary/5 shadow-[0_0_15px_rgba(var(--secondary-rgb),0.1)]" : "hover:border-secondary/50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-shadow ${
                    user.role === "partner" ? "bg-secondary text-secondary-foreground" : "bg-secondary/10 text-secondary group-hover:glow-secondary"
                  }`}>
                    <HandHelping className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display font-semibold group-hover:text-secondary transition-colors">
                        {t("rolePartner")}
                      </h4>
                      {user.role === "partner" && (
                        <span className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-full">
                          {language === "zh" ? "当前" : "Current"}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs">{t("rolePartnerDesc")}</p>
                  </div>
                </button>
              </div>

              <button
                onClick={() => { disconnect(); setShowAuthModal(false); }}
                className="mt-6 w-full py-2 text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                {t("disconnect")}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;
