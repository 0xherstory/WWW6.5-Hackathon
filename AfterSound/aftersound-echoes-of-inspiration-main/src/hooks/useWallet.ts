import { useState, useCallback, useEffect } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { CHAIN_CONFIG } from "@/contracts/abi";

const getEthereum = () => (window as any).ethereum;

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [chainCorrect, setChainCorrect] = useState(false);

  const checkChain = useCallback(async () => {
    const eth = getEthereum();
    if (!eth) return false;
    const chainId = await eth.request({ method: "eth_chainId" });
    return chainId === CHAIN_CONFIG.chainId;
  }, []);

  const switchChain = useCallback(async () => {
    const eth = getEthereum();
    if (!eth) return;
    try {
      await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: CHAIN_CONFIG.chainId }] });
    } catch (err: any) {
      if (err.code === 4902) {
        await eth.request({ method: "wallet_addEthereumChain", params: [CHAIN_CONFIG] });
      }
    }
  }, []);

  const connect = useCallback(async () => {
    const eth = getEthereum();
    if (!eth) { window.open("https://metamask.io/download/", "_blank"); return; }
    setConnecting(true);
    try {
      const provider = new BrowserProvider(eth);
      await provider.send("eth_requestAccounts", []);
      const correct = await checkChain();
      if (!correct) await switchChain();
      const s = await provider.getSigner();
      const addr = await s.getAddress();
      setSigner(s);
      setAddress(addr);
      setChainCorrect(true);
    } catch (e) {
      console.error("Wallet connect failed:", e);
    } finally {
      setConnecting(false);
    }
  }, [checkChain, switchChain]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setSigner(null);
    setChainCorrect(false);
  }, []);

  useEffect(() => {
    const eth = getEthereum();
    if (!eth) return;
    const handleChange = () => { setAddress(null); setSigner(null); };
    eth.on?.("accountsChanged", handleChange);
    eth.on?.("chainChanged", () => window.location.reload());
    return () => {
      eth.removeListener?.("accountsChanged", handleChange);
      eth.removeListener?.("chainChanged", () => {});
    };
  }, []);

  return { address, signer, connecting, chainCorrect, connect, disconnect, hasMetaMask: typeof window !== "undefined" && !!getEthereum() };
}
