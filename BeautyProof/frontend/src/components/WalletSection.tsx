import { motion } from "framer-motion";
import { Wallet, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

const WalletSection = ({
  account,
  onConnect,
}: {
  account: string | null;
  onConnect: () => void;
}) => {
  const { t } = useLanguage();

  return (
    <section className="py-6">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md mx-auto"
      >
        <div className="bg-card rounded-xl border border-border/60 p-6 text-center space-y-4 shadow-sm">
          <div className="flex items-center justify-center gap-2 text-foreground">
            <Wallet className="w-[1.125rem] h-[1.125rem]" />
            <h2 className="text-lg font-display tracking-tight">{t("wallet.title")}</h2>
          </div>

          {!account ? (
            <Button id="connectButton" onClick={onConnect} className="w-full text-sm">
              {t("wallet.connect")}
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm text-success">
                <Wifi className="w-4 h-4" />
                <span>{t("wallet.connected")}</span>
              </div>
              <p
                id="walletAddress"
                className="text-xs text-muted-foreground font-mono break-all bg-muted/60 rounded-md px-3 py-2"
              >
                {account}
              </p>
            </div>
          )}

          <p id="networkStatus" className="text-xs text-muted-foreground">
            {account ? t("wallet.network") : t("wallet.noWallet")}
          </p>
        </div>
      </motion.div>
    </section>
  );
};

export default WalletSection;
