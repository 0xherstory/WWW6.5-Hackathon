import { useState, useCallback, useEffect } from "react";
import { BrowserProvider, Contract, JsonRpcProvider } from "ethers";
import { MARKMEOW_ABI, MARKMEOW_ADDRESS, AVALANCHE_FUJI_CHAIN, AVALANCHE_FUJI_CHAIN_ID, AVALANCHE_FUJI_RPC } from "@/contracts/config";

const getEthereum = (): any => (window as any).ethereum;

export interface Web3State {
  account: string | null;
  isConnecting: boolean;
  contract: Contract | null;
  readContract: Contract | null;
  chainId: number | null;
  isCorrectChain: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchChain: () => Promise<void>;
}

export const useWeb3 = (): Web3State => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [contract, setContract] = useState<Contract | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  // Read-only contract via public RPC
  const readProvider = new JsonRpcProvider(AVALANCHE_FUJI_RPC);
  const readContract = new Contract(MARKMEOW_ADDRESS, MARKMEOW_ABI, readProvider);

  const isCorrectChain = chainId === AVALANCHE_FUJI_CHAIN_ID;

  const setupContract = useCallback(async (provider: BrowserProvider) => {
    const signer = await provider.getSigner();
    const c = new Contract(MARKMEOW_ADDRESS, MARKMEOW_ABI, signer);
    setContract(c);
  }, []);

  const connect = useCallback(async () => {
    const eth = getEthereum();
    if (!eth) {
      alert("请安装 MetaMask 钱包！");
      return;
    }
    setIsConnecting(true);
    try {
      const provider = new BrowserProvider(eth);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      const network = await provider.getNetwork();
      setChainId(Number(network.chainId));
      await setupContract(provider);
    } catch (err) {
      console.error("连接钱包失败:", err);
    } finally {
      setIsConnecting(false);
    }
  }, [setupContract]);

  const disconnect = useCallback(() => {
    setAccount(null);
    setContract(null);
    setChainId(null);
  }, []);

  const switchChain = useCallback(async () => {
    const eth = getEthereum();
    if (!eth) return;
    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: AVALANCHE_FUJI_CHAIN.chainId }],
      });
    } catch (err: any) {
      if (err.code === 4902) {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [AVALANCHE_FUJI_CHAIN],
        });
      }
    }
  }, []);

  useEffect(() => {
    const eth = getEthereum();
    if (!eth) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAccount(accounts[0]);
        const provider = new BrowserProvider(eth);
        setupContract(provider);
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      setChainId(parseInt(chainIdHex, 16));
      if (account) {
        const provider = new BrowserProvider(eth);
        setupContract(provider);
      }
    };

    eth.on("accountsChanged", handleAccountsChanged);
    eth.on("chainChanged", handleChainChanged);

    return () => {
      eth.removeListener?.("accountsChanged", handleAccountsChanged);
      eth.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [account, disconnect, setupContract]);

  return { account, isConnecting, contract, readContract, chainId, isCorrectChain, connect, disconnect, switchChain };
};
