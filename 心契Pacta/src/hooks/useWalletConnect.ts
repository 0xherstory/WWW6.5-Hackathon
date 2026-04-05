import { useCallback, useEffect, useState } from "react";
import { useAccount, useBalance, useConnect, useChainId, useSwitchChain } from "wagmi";
import { formatEther } from "viem";
import { injected } from "wagmi/connectors";
import { avalancheFuji, FUJI_CHAIN_ID } from "@/lib/chains";
import { addFujiEthereumChain, isMetaMaskBrowser } from "@/lib/pacta";

export function useWalletConnect() {
  const [wrongNetworkOpen, setWrongNetworkOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isFuji = chainId === FUJI_CHAIN_ID;

  const { connectAsync, isPending: isConnecting, error: connectError } = useConnect();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();

  const { data: balance, refetch: refetchBalance } = useBalance({
    address,
    chainId: FUJI_CHAIN_ID,
    query: { enabled: Boolean(address) && isFuji },
  });

  useEffect(() => {
    if (isConnected && !isFuji) setWrongNetworkOpen(true);
    if (isConnected && isFuji) setWrongNetworkOpen(false);
  }, [isConnected, isFuji]);

  const shortAddress =
    address && address.length > 10 ? `${address.slice(0, 6)}…${address.slice(-4)}` : null;

  const balanceAvax =
    balance?.value !== undefined
      ? Number.parseFloat(formatEther(balance.value)).toFixed(4)
      : null;

  const connectMetaMask = useCallback(async () => {
    if (!isMetaMaskBrowser()) {
      window.open("https://metamask.io/download/", "_blank");
      throw new Error("请先安装 MetaMask");
    }
    await connectAsync({
      connector: injected(),
    });
    await refetchBalance();
  }, [connectAsync, refetchBalance]);

  const switchToFuji = useCallback(async () => {
    try {
      await switchChainAsync({ chainId: FUJI_CHAIN_ID });
    } catch {
      await addFujiEthereumChain();
      await switchChainAsync({ chainId: FUJI_CHAIN_ID });
    }
    await refetchBalance();
  }, [switchChainAsync, refetchBalance]);

  return {
    address,
    shortAddress,
    balanceAvax,
    isConnected,
    isFuji,
    chainId,
    /** 已连接但不在 Fuji */
    needsNetworkSwitch: isConnected && !isFuji,
    wrongNetworkOpen,
    setWrongNetworkOpen,
    connectMetaMask,
    isConnecting,
    connectError,
    switchToFuji,
    isSwitching,
    fujiChain: avalancheFuji,
  };
}
