import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Lock, Wallet, ShieldAlert } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isAuthenticated, setShowAuthModal } = useAuth();
  const { t } = useLanguage();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 text-center max-w-md glow-accent"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center">
            <Lock className="w-10 h-10 text-accent" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">{t("loginRequired")}</h2>
          <p className="text-muted-foreground mb-8">{t("loginRequiredDesc")}</p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-amber-400 text-primary-foreground font-display font-semibold glow-primary hover:scale-105 transition-transform"
          >
            <Wallet className="w-5 h-5" />
            {t("connectWallet")}
          </button>
        </motion.div>
      </div>
    );
  }

  // Role not yet selected
  if (!user?.role) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 text-center max-w-md glow-primary"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">{t("selectRoleFirst")}</h2>
          <p className="text-muted-foreground mb-8">{t("selectRoleFirstDesc")}</p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-amber-400 text-primary-foreground font-display font-semibold glow-primary hover:scale-105 transition-transform"
          >
            {t("selectRole")}
          </button>
        </motion.div>
      </div>
    );
  }

  // Wrong role
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 text-center max-w-md glow-secondary"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary/10 border border-secondary/30 flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-secondary" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">{t("wrongRole")}</h2>
          <p className="text-muted-foreground mb-8">
            {t("wrongRoleDesc")}
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-secondary/30 text-secondary font-display font-semibold hover:bg-secondary/10 transition-colors"
          >
            {t("switchRole")}
          </button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
