import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createPublicClient,
  formatEther,
  getAddress,
  http,
  type Address,
} from "viem";
import { avalancheFuji } from "viem/chains";

/** Fuji C-Chain testnet */
export const FUJI_CHAIN_ID_HEX = "0xA869" as const;

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

function getErrorCode(err: unknown): number | null {
  if (err && typeof err === "object" && "code" in err) {
    const c = (err as { code: unknown }).code;
    return typeof c === "number" ? c : null;
  }
  return null;
}

async function addAndSwitchToFuji(eth: Eip1193Provider): Promise<void> {
  const explorer = avalancheFuji.blockExplorers?.default?.url;
  const addParams = {
    chainId: FUJI_CHAIN_ID_HEX,
    chainName: "Avalanche Fuji C-Chain",
    nativeCurrency: {
      name: "Avalanche",
      symbol: "AVAX",
      decimals: 18,
    },
    rpcUrls: [...avalancheFuji.rpcUrls.default.http],
    blockExplorerUrls: explorer ? [explorer] : [],
  };

  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: FUJI_CHAIN_ID_HEX }],
    });
  } catch (err: unknown) {
    if (getErrorCode(err) === 4902) {
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [addParams],
      });
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: FUJI_CHAIN_ID_HEX }],
      });
      return;
    }
    throw err;
  }
}

export interface Web3ContextValue {
  address: Address | null;
  chainId: string | null;
  isConnected: boolean;
  isFujiChain: boolean;
  balanceLabel: string | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  /** 再次请求切换到 Fuji（发交易前可调用） */
  ensureFuji: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextValue | null>(null);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<Address | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [balanceLabel, setBalanceLabel] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const publicClient = useMemo(
    () =>
      createPublicClient({
        chain: avalancheFuji,
        transport: http(),
      }),
    [],
  );

  const refreshBalanceFor = useCallback(
    async (addr: Address) => {
      const wei = await publicClient.getBalance({ address: addr });
      const avax = formatEther(wei);
      const n = Number.parseFloat(avax);
      const display = Number.isFinite(n) ? n.toFixed(4) : avax;
      setBalanceLabel(`${display} AVAX`);
    },
    [publicClient],
  );

  const readChainId = useCallback(async (eth: Eip1193Provider) => {
    const id = (await eth.request({ method: "eth_chainId" })) as string;
    setChainId(id);
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!address) {
      setBalanceLabel(null);
      return;
    }
    try {
      await refreshBalanceFor(address);
    } catch {
      setBalanceLabel("—");
    }
  }, [address, refreshBalanceFor]);

  const ensureFuji = useCallback(async () => {
    const eth = window.ethereum;
    if (!eth?.request) {
      throw new Error("NO_WALLET");
    }
    await addAndSwitchToFuji(eth);
    await readChainId(eth);
  }, [readChainId]);

  const connect = useCallback(async () => {
    const eth = window.ethereum;
    if (!eth?.request) {
      throw new Error("NO_WALLET");
    }

    setIsConnecting(true);
    try {
      const accounts = (await eth.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (!accounts?.length) {
        setAddress(null);
        setChainId(null);
        setBalanceLabel(null);
        throw new Error("NO_ACCOUNTS");
      }

      const addr = getAddress(accounts[0]);
      setAddress(addr);

      await addAndSwitchToFuji(eth);
      await readChainId(eth);
      await refreshBalanceFor(addr);
    } catch (e) {
      setAddress(null);
      setChainId(null);
      setBalanceLabel(null);
      throw e;
    } finally {
      setIsConnecting(false);
    }
  }, [readChainId, refreshBalanceFor]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setChainId(null);
    setBalanceLabel(null);
  }, []);

  useEffect(() => {
    const eth = window.ethereum;
    if (!eth?.on || !eth.removeListener) return;

    const onAccounts = (accs: unknown) => {
      const list = accs as string[] | undefined;
      if (!list?.length) {
        disconnect();
        return;
      }
      try {
        const addr = getAddress(list[0]);
        setAddress(addr);
        void refreshBalanceFor(addr);
      } catch {
        disconnect();
      }
    };

    const onChain = () => {
      void (async () => {
        try {
          await readChainId(eth);
          if (address) await refreshBalanceFor(address);
        } catch {
          setChainId(null);
        }
      })();
    };

    eth.on("accountsChanged", onAccounts);
    eth.on("chainChanged", onChain);

    return () => {
      eth.removeListener?.("accountsChanged", onAccounts);
      eth.removeListener?.("chainChanged", onChain);
    };
  }, [address, disconnect, readChainId, refreshBalanceFor]);

  const isFujiChain =
    chainId?.toLowerCase() === FUJI_CHAIN_ID_HEX.toLowerCase();

  const value = useMemo<Web3ContextValue>(
    () => ({
      address,
      chainId,
      isConnected: Boolean(address),
      isFujiChain,
      balanceLabel,
      isConnecting,
      connect,
      disconnect,
      refreshBalance,
      ensureFuji,
    }),
    [
      address,
      chainId,
      isFujiChain,
      balanceLabel,
      isConnecting,
      connect,
      disconnect,
      refreshBalance,
      ensureFuji,
    ],
  );

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3(): Web3ContextValue {
  const ctx = useContext(Web3Context);
  if (!ctx) {
    throw new Error("useWeb3 must be used within Web3Provider");
  }
  return ctx;
}
