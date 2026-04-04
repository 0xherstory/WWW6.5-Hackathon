import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { BrowserProvider } from 'ethers';

interface WalletContextType {
  address: string | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async () => {
    if (!(window as any).ethereum) {
      alert('请安装 MetaMask 钱包扩展');
      return;
    }
    setIsConnecting(true);
    try {
      const provider = new BrowserProvider((window as any).ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      if (accounts.length > 0) {
        setAddress(accounts[0]);
      }
    } catch (err) {
      console.error('连接钱包失败:', err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
  }, []);

  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth) return;
    const handleAccountsChanged = (accounts: string[]) => {
      setAddress(accounts.length > 0 ? accounts[0] : null);
    };
    eth.on('accountsChanged', handleAccountsChanged);
    return () => eth.removeListener('accountsChanged', handleAccountsChanged);
  }, []);

  return (
    <WalletContext.Provider value={{ address, isConnecting, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};
