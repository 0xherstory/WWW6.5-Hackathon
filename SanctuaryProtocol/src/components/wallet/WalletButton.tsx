"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useTranslations } from "next-intl";

export default function WalletButton() {
  const t = useTranslations();

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // 等待挂载
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready && account && chain && (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="px-4 py-2 bg-primary text-white text-sm border border-primary hover:bg-primary-light transition-all duration-300 flex items-center gap-2"
                  >
                    <span className="hidden sm:inline">🔗</span>
                    <span>{t('wallet.connect')}</span>
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="px-3 py-2 bg-white text-error text-sm border border-error hover:bg-error/5 transition-all duration-300"
                  >
                    {t('wallet.wrongNetwork')}
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="hidden sm:flex items-center gap-2 px-3 py-2 bg-secondary text-text text-sm border border-secondary hover:border-accent transition-all duration-300"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 16,
                          height: 16,
                          borderRadius: 999,
                          overflow: "hidden",
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            style={{ width: 16, height: 16 }}
                          />
                        )}
                      </div>
                    )}
                    <span>{chain.name}</span>
                  </button>

                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="px-3 py-2 bg-primary text-white text-sm border border-primary hover:bg-primary-light transition-all duration-300"
                  >
                    <span className="hidden sm:inline">{account.displayName}</span>
                    <span className="sm:hidden">{account.displayName.slice(0, 6)}...</span>
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
