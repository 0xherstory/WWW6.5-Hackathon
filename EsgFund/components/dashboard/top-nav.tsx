"use client";

import { navItems } from "@/data/mock-dashboard";
import { useLanguage } from "@/components/i18n/language-context";

type TopNavProps = {
  walletAddress: string | null;
  hasProvider: boolean;
  isSepolia: boolean;
  connecting: boolean;
  walletError: string | null;
  onConnectWallet: () => void;
};

function formatAddress(address: string | null): string {
  if (!address) {
    return "-";
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function TopNav({
  walletAddress,
  hasProvider,
  isSepolia,
  connecting,
  walletError,
  onConnectWallet
}: TopNavProps) {
  const { language, setLanguage } = useLanguage();
  const isZh = language === "zh";
  const navLabelByHref: Record<string, string> = isZh
    ? {
        "#overview": "总览",
        "#esg-dashboard": "ESG看板",
        "#portfolio-allocation": "组合配置",
        "#simulator": "模拟器",
        "#architecture": "架构"
      }
    : {
        "#overview": "Overview",
        "#esg-dashboard": "ESG",
        "#portfolio-allocation": "Portfolio",
        "#simulator": "Policy",
        "#architecture": "Architecture"
      };

  return (
    <nav className="top-nav" aria-label="Primary">
      <div>
        <p className="brand-kicker">Reactive ESG Fund</p>
        <p className="brand-title">{isZh ? "机构级监控面板" : "Institutional Monitoring Console"}</p>
      </div>

      <ul className="nav-list">
        {navItems.map((item) => (
          <li key={item.href}>
            <a href={item.href}>{navLabelByHref[item.href] ?? item.label}</a>
          </li>
        ))}
      </ul>

      <div className="wallet-box">
        <div className="lang-toggle" role="group" aria-label="Language">
          <button type="button" className="wallet-btn" data-active={isZh} onClick={() => setLanguage("zh")}>
            中文
          </button>
          <button type="button" className="wallet-btn" data-active={!isZh} onClick={() => setLanguage("en")}>
            EN
          </button>
        </div>
        <button type="button" className="wallet-btn" onClick={onConnectWallet} disabled={connecting || !hasProvider}>
          {connecting ? (isZh ? "连接中..." : "Connecting...") : isZh ? "连接钱包" : "Connect Wallet"}
        </button>
        <p className="wallet-address">{formatAddress(walletAddress)}</p>
        <p className="wallet-network">
          {isZh ? "网络" : "Network"}: {walletAddress ? (isSepolia ? "Sepolia" : isZh ? "非 Sepolia" : "Not Sepolia") : isZh ? "未知" : "Unknown"}
        </p>
        {!hasProvider ? <p className="wallet-warning">{isZh ? "未检测到注入钱包（请安装 MetaMask）。" : "No injected wallet found (install MetaMask)."}</p> : null}
        {walletAddress && !isSepolia ? <p className="wallet-warning">{isZh ? "当前钱包不在 Sepolia，请切换网络。" : "Current wallet is not on Sepolia. Please switch network."}</p> : null}
        {walletError ? <p className="wallet-warning">{walletError}</p> : null}
      </div>
    </nav>
  );
}
