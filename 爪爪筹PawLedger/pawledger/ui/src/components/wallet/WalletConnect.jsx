import { useWallet } from "../../hooks/useWallet";
import { useLocale } from "../../hooks/useLocale";
import { NETWORK } from "../../config";
import Button from "../common/Button";

export default function WalletConnect() {
  const { account, chainId, isConnected, connect, disconnect, switchToFuji } = useWallet();
  const { t } = useLocale();

  const wrongNetwork = isConnected && chainId !== NETWORK.chainId;

  if (!isConnected) {
    return (
      <Button onClick={connect} size="sm">
        {t("wallet.connect")}
      </Button>
    );
  }

  if (wrongNetwork) {
    return (
      <Button onClick={switchToFuji} variant="danger" size="sm">
        {t("wallet.switch_network")}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-lg">
      <div className="flex items-center gap-2 px-1">
        <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" />
        <span className="text-emerald-700 font-mono text-xs">
          {account.slice(0, 6)}…{account.slice(-4)}
        </span>
      </div>
      <Button onClick={disconnect} variant="ghost" size="sm" className="text-xs">
        {t("wallet.disconnect")}
      </Button>
    </div>
  );
}
