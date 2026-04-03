import { useState, useCallback, useEffect } from "react";
import { BrowserProvider, Contract } from "ethers";

const AVALANCHE_FUJI_CHAIN_ID = 43113;
const FUJI_CHAIN_CONFIG = {
  chainId: "0xA869",
  chainName: "Avalanche Fuji C-Chain",
  nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
  rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
  blockExplorerUrls: ["https://testnet.snowtrace.io/"],
};

const CONTRACT_ABI = [
  "function triggerSOS(uint256 _latitude, uint256 _longitude, string memory _emergencyContact) public returns (uint256)",
  "function cancelSOS(uint256 _sosId) public",
  "function getActiveAlerts() public view returns (uint256[])",
  "function getContractInfo() public view returns (string name, string version, uint256 totalSOSRecords)",
  "function getLatestSOSRecord(address _user) public view returns (uint256 sosId, uint256 latitude, uint256 longitude, uint256 timestamp, bool isActive)",
  "function getSOSRecord(uint256 _sosId) public view returns (address, uint256, uint256, uint256, bool, string)",
  "function getTotalSOSCount() public view returns (uint256)",
  "function getUserSOSHistory(address _user) public view returns (uint256[])",
  "function isDangerZone(uint256 _latitude, uint256 _longitude) public view returns (bool, uint256)",
  "function sosRecordCount() public view returns (uint256)",
];

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  provider: BrowserProvider | null;
  contract: Contract | null;
}

export function useWallet(contractAddress: string) {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isCorrectNetwork: false,
    provider: null,
    contract: null,
  });

  const updateWalletState = useCallback(async () => {
    const eth = (window as any).ethereum;
    if (!eth) return;
    try {
      const accounts: string[] = await eth.request({ method: "eth_accounts" });
      const chainIdHex: string = await eth.request({ method: "eth_chainId" });
      const chainId = parseInt(chainIdHex, 16);
      if (accounts.length > 0) {
        const provider = new BrowserProvider(eth);
        const signer = await provider.getSigner();
        const contract = contractAddress
          ? new Contract(contractAddress, CONTRACT_ABI, signer)
          : null;
        setWallet({
          address: accounts[0],
          chainId,
          isConnected: true,
          isCorrectNetwork: chainId === AVALANCHE_FUJI_CHAIN_ID,
          provider,
          contract,
        });
      } else {
        setWallet((prev) => ({
          ...prev,
          address: null,
          isConnected: false,
          provider: null,
          contract: null,
        }));
      }
    } catch {
      // silent
    }
  }, [contractAddress]);

  const connect = useCallback(async () => {
    const eth = (window as any).ethereum;
    if (!eth) {
      alert("请安装 MetaMask 或 Core 钱包");
      return;
    }
    await eth.request({ method: "eth_requestAccounts" });
    await updateWalletState();
  }, [updateWalletState]);

  const disconnect = useCallback(() => {
    setWallet({
      address: null,
      chainId: null,
      isConnected: false,
      isCorrectNetwork: false,
      provider: null,
      contract: null,
    });
  }, []);

  const switchToFuji = useCallback(async () => {
    const eth = (window as any).ethereum;
    if (!eth) return;
    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: FUJI_CHAIN_CONFIG.chainId }],
      });
    } catch (e: any) {
      if (e.code === 4902) {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [FUJI_CHAIN_CONFIG],
        });
      }
    }
    await updateWalletState();
  }, [updateWalletState]);

  useEffect(() => {
    updateWalletState();
    const eth = (window as any).ethereum;
    if (eth) {
      eth.on("accountsChanged", updateWalletState);
      eth.on("chainChanged", updateWalletState);
      return () => {
        eth.removeListener("accountsChanged", updateWalletState);
        eth.removeListener("chainChanged", updateWalletState);
      };
    }
  }, [updateWalletState]);

  return { wallet, connect, disconnect, switchToFuji };
}

export function shortenAddress(addr: string) {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

export function shortenHash(hash: string) {
  return hash.slice(0, 6) + "..." + hash.slice(-4);
}
