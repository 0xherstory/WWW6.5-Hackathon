import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";

export type UserRole = "publisher" | "partner" | null;

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: "accountsChanged", handler: (accounts: string[]) => void) => void;
  removeListener?: (event: "accountsChanged", handler: (accounts: string[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

interface User {
  address: string;
  displayAddress: string;
  role: UserRole;
  level: "seed" | "breaker" | "conqueror";
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isConnecting: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  connectWallet: (existingAddress?: unknown) => Promise<void>;
  disconnect: () => void;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const generateMockAddress = () => {
  const chars = "0123456789abcdef";
  let addr = "0x";
  for (let i = 0; i < 40; i++) {
    addr += chars[chars.length - 1 - Math.floor(Math.random() * chars.length)];
  }
  return addr;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("solarpact_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const connectingRef = React.useRef(false);

  const disconnect = useCallback(() => {
    setUser(null);
    localStorage.removeItem("solarpact_user");
  }, []);

  const connectWallet = useCallback(async (existingAddress?: unknown) => {
    if (connectingRef.current) return;
    
    setIsConnecting(true);
    connectingRef.current = true;
    
    try {
      let address: string;

      if (typeof existingAddress === "string") {
        address = existingAddress;
      } else if (!window.ethereum) {
        console.warn("MetaMask not found, using mock account for preview.");
        address = generateMockAddress();
      } else {
        const provider = new ethers.BrowserProvider(window.ethereum as unknown as ethers.Eip1193Provider);
        const accounts = await provider.send("eth_accounts", []);
        if (Array.isArray(accounts) && accounts.length > 0) {
          address = String(accounts[0]);
        } else {
          const requestedAccounts = await provider.send("eth_requestAccounts", []);
          address = String(requestedAccounts[0]);
        }
      }

      if (address) {
        const newUser: User = {
          address,
          displayAddress: `${address.slice(0, 6)}...${address.slice(-4)}`,
          role: null,
          level: "seed",
          avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${address.slice(2, 8)}`,
        };
        setUser(newUser);
        localStorage.setItem("solarpact_user", JSON.stringify(newUser));
      }
    } catch (error: unknown) {
      const code = (error as { code?: number }).code;
      if (code === -32002) {
        console.warn("Wallet request already pending, please wait.");
      } else {
        console.error("Failed to connect wallet:", error);
      }
    } finally {
      setIsConnecting(false);
      connectingRef.current = false;
    }
  }, []);

  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect();
    } else if (user && accounts[0] !== user.address) {
      connectWallet(accounts[0]);
    }
  }, [user, connectWallet, disconnect]);

  useEffect(() => {
    if (window.ethereum?.on) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        }
      };
    }
  }, [handleAccountsChanged]);

  const setRole = useCallback((role: UserRole) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, role };
      localStorage.setItem("solarpact_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isConnecting,
        showAuthModal,
        setShowAuthModal,
        connectWallet,
        disconnect,
        setRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
