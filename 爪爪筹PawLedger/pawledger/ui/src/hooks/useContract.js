import React, { createContext, useContext, useMemo } from "react";
import { Contract, BrowserProvider } from "ethers";
import { CONTRACT_ADDRESSES } from "../config";
import PawLedgerABI from "../abis/PawLedger.json";
import PawTokenABI from "../abis/PawToken.json";
import PawAdoptionABI from "../abis/PawAdoption.json";
import { useWallet } from "./useWallet";

const ContractContext = createContext(null);

function resolveAbi(artifactOrAbi) {
  if (Array.isArray(artifactOrAbi)) return artifactOrAbi;
  if (artifactOrAbi && Array.isArray(artifactOrAbi.abi)) return artifactOrAbi.abi;
  return [];
}

export function ContractProvider({ children }) {
  const { signer, provider } = useWallet();

  const contracts = useMemo(() => {
    const runner = signer ?? provider;
    if (
      !runner ||
      !CONTRACT_ADDRESSES.PawLedger ||
      !CONTRACT_ADDRESSES.PawToken ||
      !CONTRACT_ADDRESSES.PawAdoption
    ) {
      return { pawLedger: null, pawToken: null, pawAdoption: null };
    }
    const pawLedgerAbi = resolveAbi(PawLedgerABI);
    const pawTokenAbi = resolveAbi(PawTokenABI);
    const pawAdoptionAbi = resolveAbi(PawAdoptionABI);

    return {
      pawLedger: new Contract(CONTRACT_ADDRESSES.PawLedger, pawLedgerAbi, runner),
      pawToken: new Contract(CONTRACT_ADDRESSES.PawToken, pawTokenAbi, runner),
      pawAdoption: new Contract(CONTRACT_ADDRESSES.PawAdoption, pawAdoptionAbi, runner),
    };
  }, [signer, provider]);

  return <ContractContext.Provider value={contracts}>{children}</ContractContext.Provider>;
}

export function useContract() {
  const ctx = useContext(ContractContext);
  if (!ctx) throw new Error("useContract must be used within ContractProvider");
  return ctx;
}
