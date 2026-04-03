import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { BrowserProvider } from "ethers";
import { NETWORK } from "../config";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const clearWalletState = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setIsConnected(false);
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask or Core Wallet");
      return;
    }
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const web3Provider = new BrowserProvider(window.ethereum);
    const web3Signer = await web3Provider.getSigner();
    const network = await web3Provider.getNetwork();

    setAccount(accounts[0]);
    setProvider(web3Provider);
    setSigner(web3Signer);
    setChainId(Number(network.chainId));
    setIsConnected(true);
  }, []);

  const disconnect = useCallback(() => {
    // Wallet extensions generally do not allow dapps to force-disconnect.
    // This clears local app session state so users can intentionally disconnect in the UI.
    clearWalletState();
  }, [clearWalletState]);

  const switchToFuji = useCallback(async () => {
    if (!window.ethereum) return;
    const chainIdHex = "0x" + NETWORK.chainId.toString(16);
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
    } catch (error) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: chainIdHex,
              chainName: NETWORK.name,
              rpcUrls: [NETWORK.rpcUrl],
              nativeCurrency: { name: NETWORK.currency, symbol: NETWORK.currency, decimals: 18 },
              blockExplorerUrls: [NETWORK.blockExplorer],
            },
          ],
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        clearWalletState();
      } else {
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = (chainIdHex) => {
      setChainId(parseInt(chainIdHex, 16));
      connect();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    // Auto-connect if already authorized
    window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
      if (accounts.length > 0) connect();
    });

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [clearWalletState, connect]);

  return (
    <WalletContext.Provider
      value={{ account, provider, signer, chainId, isConnected, connect, disconnect, switchToFuji }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
