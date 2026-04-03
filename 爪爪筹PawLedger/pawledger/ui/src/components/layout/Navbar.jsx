import { Link, useLocation } from "react-router-dom";
import { useLocale } from "../../hooks/useLocale";
import { useWallet } from "../../hooks/useWallet";
import { useUserRole } from "../../hooks/useUserRole";
import WalletConnect from "../wallet/WalletConnect";
import LanguageToggle from "./LanguageToggle";
import RoleIndicator from "./RoleIndicator";

export default function Navbar() {
  const { t } = useLocale();
  const { isConnected } = useWallet();
  const { isReviewer, isDonor } = useUserRole();
  const location = useLocation();

  const linkClass = (path) =>
    `text-sm transition-colors ${
      location.pathname === path
        ? "text-emerald-600 font-medium"
        : "text-gray-600 hover:text-gray-900"
    }`;

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo + links */}
          <div className="flex items-center gap-6">
            <Link to="/" className="font-bold text-gray-900 text-base tracking-tight">
              🐾 {t("app.name")}
            </Link>
            <div className="hidden md:flex items-center gap-5">
              <Link to="/" className={linkClass("/")}>{t("nav.home")}</Link>
              <Link to="/cases" className={linkClass("/cases")}>{t("nav.cases")}</Link>
              <Link to="/adoption/browse" className={linkClass("/adoption/browse")}>{t("nav.adoption")}</Link>
              {isConnected && (
                <Link to="/submit" className={linkClass("/submit")}>{t("nav.submit")}</Link>
              )}
              {isConnected && (
                <Link to="/adoption/publish" className={linkClass("/adoption/publish")}>{t("nav.adoption_publish")}</Link>
              )}
              {isConnected && (
                <Link to="/dashboard/rescuer" className={linkClass("/dashboard/rescuer")}>
                  {t("nav.dashboard.rescuer")}
                </Link>
              )}
              {isConnected && (
                <Link to="/dashboard/publisher" className={linkClass("/dashboard/publisher")}>{t("nav.dashboard.publisher")}</Link>
              )}
              {isConnected && (
                <Link to="/dashboard/adopter" className={linkClass("/dashboard/adopter")}>{t("nav.dashboard.adopter")}</Link>
              )}
              {isDonor && (
                <Link to="/dashboard/donor" className={linkClass("/dashboard/donor")}>
                  {t("nav.dashboard.donor")}
                </Link>
              )}
              {isReviewer && (
                <Link to="/dashboard/reviewer" className={linkClass("/dashboard/reviewer")}>
                  {t("nav.dashboard.reviewer")}
                </Link>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <RoleIndicator />
            <LanguageToggle />
            <WalletConnect />
          </div>
        </div>

        {/* Mobile quick links */}
        <div className="md:hidden flex items-center gap-4 overflow-x-auto py-2 border-t border-gray-100">
          <Link to="/cases" className={linkClass("/cases")}>{t("nav.cases")}</Link>
          <Link to="/adoption/browse" className={linkClass("/adoption/browse")}>{t("nav.adoption")}</Link>
          {isConnected && (
            <Link to="/adoption/publish" className={linkClass("/adoption/publish")}>{t("nav.adoption_publish")}</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
