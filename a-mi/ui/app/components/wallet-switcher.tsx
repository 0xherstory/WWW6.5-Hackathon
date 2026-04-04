"use client";

import { useState } from "react";
import { getWalletErrorMessage, switchWallet } from "../lib/wallet";

type WalletSwitcherProps = {
  className?: string;
  buttonClassName?: string;
  messageClassName?: string;
};

export function WalletSwitcher({
  className,
  buttonClassName,
  messageClassName,
}: WalletSwitcherProps) {
  const [isSwitchingWallet, setIsSwitchingWallet] = useState(false);
  const [walletSwitchMessage, setWalletSwitchMessage] = useState("");

  const handleSwitchWallet = async () => {
    if (isSwitchingWallet) {
      return;
    }

    setIsSwitchingWallet(true);
    setWalletSwitchMessage("");

    try {
      const nextAddress = await switchWallet();
      setWalletSwitchMessage(nextAddress ? "钱包账户已切换" : "未切换钱包");
    } catch (error) {
      const message = getWalletErrorMessage(error);

      if (message === "MetaMask is not installed") {
        setWalletSwitchMessage("未检测到 MetaMask");
      } else if (message === "User rejected wallet connection") {
        setWalletSwitchMessage("钱包切换已取消");
      } else {
        setWalletSwitchMessage("未切换钱包");
      }
    } finally {
      setIsSwitchingWallet(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleSwitchWallet}
        disabled={isSwitchingWallet}
        className={buttonClassName}
      >
        {isSwitchingWallet ? "切换中..." : "切换钱包"}
      </button>
      {walletSwitchMessage ? (
        <p className={messageClassName}>{walletSwitchMessage}</p>
      ) : null}
    </div>
  );
}
