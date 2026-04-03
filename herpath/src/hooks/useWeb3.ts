import { useState, useCallback, useEffect } from "react";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface Web3State {
  address: string | null;
  connected: boolean;
  network: number | null;
  loading: boolean;
  error: string | null;
}

const NFT_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || "";
const SBT_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_SBT_CONTRACT_ADDRESS || "";
const FUJI_CHAIN_ID = 43113;

export function useWeb3() {
  const [state, setState] = useState<Web3State>({
    address: null,
    connected: false,
    network: null,
    loading: true,
    error: null,
  });

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window === "undefined" || !window.ethereum) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "MetaMask or Web3 wallet not installed",
        }));
        return;
      }

      try {
        // Get connected accounts
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        // Get current chain ID
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });

        if (accounts.length > 0) {
          setState({
            address: accounts[0],
            connected: true,
            network: parseInt(chainId, 16),
            loading: false,
            error: null,
          });
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
          }));
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to check connection",
        }));
      }
    };

    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setState((prev) => ({
          ...prev,
          address: null,
          connected: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          address: accounts[0],
          connected: true,
        }));
      }
    };

    const handleChainChanged = (chainId: string) => {
      setState((prev) => ({
        ...prev,
        network: parseInt(chainId, 16),
      }));
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setState((prev) => ({
        ...prev,
        error: "MetaMask or Web3 wallet not installed",
      }));
      return false;
    }

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setState({
        address: accounts[0],
        connected: true,
        network: FUJI_CHAIN_ID,
        loading: false,
        error: null,
      });

      return true;
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to connect wallet",
      }));
      return false;
    }
  }, []);

  // Switch to Fuji network
  const switchToFuji = useCallback(async () => {
    if (!window.ethereum) {
      setState((prev) => ({
        ...prev,
        error: "MetaMask or Web3 wallet not installed",
      }));
      return false;
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${FUJI_CHAIN_ID.toString(16)}` }],
      });
      return true;
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${FUJI_CHAIN_ID.toString(16)}`,
                chainName: "Avalanche Fuji Testnet",
                rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
                nativeCurrency: {
                  name: "AVAX",
                  symbol: "AVAX",
                  decimals: 18,
                },
                blockExplorerUrls: ["https://testnet.snowtrace.io"],
              },
            ],
          });
          return true;
        } catch (addError) {
          setState((prev) => ({
            ...prev,
            error:
              addError instanceof Error
                ? addError.message
                : "Failed to add Fuji network",
          }));
          return false;
        }
      }
      setState((prev) => ({
        ...prev,
        error:
          switchError instanceof Error
            ? switchError.message
            : "Failed to switch network",
      }));
      return false;
    }
  }, []);

  // Mint NFT
  const mintNFT = useCallback(
    async (
      leaderType: "rbg" | "hillary",
      nftName: string,
      description: string
    ) => {
      if (!state.connected || !state.address) {
        setState((prev) => ({
          ...prev,
          error: "Wallet not connected",
        }));
        return null;
      }

      if (state.network !== FUJI_CHAIN_ID) {
        const switched = await switchToFuji();
        if (!switched) return null;
      }

      try {
        setState((prev) => ({ ...prev, loading: true }));

        // ABI for NFT minting (simplified)
        const nftABI = [
          {
            inputs: [
              { name: "to", type: "address" },
              { name: "leaderType", type: "string" },
              { name: "nftName", type: "string" },
              { name: "description", type: "string" },
            ],
            name: "mintNFT",
            outputs: [{ name: "", type: "uint256" }],
            stateMutability: "payable",
            type: "function",
          },
        ];

        const nftInterface = new (await import("ethers")).Interface(nftABI);

        // Estimate gas
        const data = nftInterface.encodeFunctionData("mintNFT", [
          state.address,
          leaderType,
          nftName,
          description,
        ]);

        // Send transaction
        const txHash = await window.ethereum.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: state.address,
              to: NFT_CONTRACT_ADDRESS,
              value: (BigInt(0.01) * BigInt(10) ** BigInt(18)).toString(16),
              data: data,
              gas: "0x186a0", // 100000 gas
            },
          ],
        });

        setState((prev) => ({ ...prev, loading: false }));
        return txHash;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Transaction failed";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMsg,
        }));
        return null;
      }
    },
    [state.connected, state.address, state.network, switchToFuji]
  );

  return {
    ...state,
    connectWallet,
    switchToFuji,
    mintNFT,
  };
}
