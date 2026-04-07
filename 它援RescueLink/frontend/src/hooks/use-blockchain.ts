import { useState, useEffect } from 'react';
import { FUJI_CHAIN_HEX, switchNetwork } from '@/lib/blockchain';

export function useBlockchain() {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const ethereum = window.ethereum;
    if (!ethereum) return;

    // Get initial values
    ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
      if (accounts && accounts.length > 0) setAccount(accounts[0]);
    });

    ethereum.request({ method: 'eth_chainId' }).then((id: string) => {
      setChainId(id);
    });

    // Listen for changes
    const handleAccountsChanged = (accounts: string[]) => {
      setAccount(accounts && accounts.length > 0 ? accounts[0] : null);
    };

    const handleChainChanged = (id: string) => {
      setChainId(id);
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  const connect = async () => {
    const ethereum = window.ethereum;
    if (!ethereum) {
      alert('请安装钱包，如 MetaMask');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        await switchNetwork();
      }
    } catch (err) {
      console.error('Failed to connect wallet', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const isCorrectNetwork = chainId?.toLowerCase() === FUJI_CHAIN_HEX.toLowerCase();

  return {
    account,
    chainId,
    isConnecting,
    isCorrectNetwork,
    connect,
    switchNetwork,
  };
}
