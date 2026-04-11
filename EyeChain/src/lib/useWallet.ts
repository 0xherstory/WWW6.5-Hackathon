import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { connectWallet, getContract } from "./contract";

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [loading, setLoading] = useState(false);

  const connect = useCallback(async () => {
    setLoading(true);
    try {
      const result = await connectWallet();
      if (result) {
        setAddress(result.address);
        setSigner(result.signer);
      }
    } catch (err: any) {
      console.error("Wallet connection failed:", err);
      alert(err.message || "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  }, []);

  const contract = signer ? getContract(signer) : null;

  return { address, signer, contract, loading, connect };
}
