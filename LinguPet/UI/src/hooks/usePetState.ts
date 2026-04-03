import { useCallback, useMemo, useState } from "react";
import { ethers } from "ethers";
import { getStage, getUnlockedAccessories } from "@/lib/gameData";

const CONTRACT_ADDRESS = "0x17af32d1E54fF01D55bc57B3af8BDBddc030D2E1";
const FUJI_RPC_URL = "https://api.avax-test.network/ext/bc/C/rpc";
const CONTRACT_ABI = [
  "function createPet(string language) external",
  "function logStudy(uint256 studyMinutes) external",
  "function mintPetNFT() external returns (uint256)",
  "function getPet(address owner) external view returns (uint256 xp, uint8 stage, string memory language, uint256 totalMinutes, bool minted)"
];

export interface PetState {
  created: boolean;
  language: string;
  xp: number;
  totalMinutes: number;
  hunger: number;
  happiness: number;
  streak: number;
  lastStudyDate: string | null;
  minted: boolean;
  equippedAccessory: string | null;
  unlockedAccessories: string[];
  dailyGoal: number;
  dailyProgress: number;
}

type InspectAddressResult = {
  address: string;
  status: "new" | "existing";
  pet: PetState;
};

const INITIAL_STATE: PetState = {
  created: false,
  language: "",
  xp: 0,
  totalMinutes: 0,
  hunger: 80,
  happiness: 80,
  streak: 0,
  lastStudyDate: null,
  minted: false,
  equippedAccessory: null,
  unlockedAccessories: [],
  dailyGoal: 15,
  dailyProgress: 0,
};

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function formatWalletLabel(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error !== null) {
    const maybeShortMessage = Reflect.get(error, "shortMessage");
    if (typeof maybeShortMessage === "string" && maybeShortMessage) return maybeShortMessage;
    const maybeReason = Reflect.get(error, "reason");
    if (typeof maybeReason === "string" && maybeReason) return maybeReason;
  }
  return "Something went wrong";
}

function mapOnchainPet(onchain: readonly [bigint, number, string, bigint, boolean]): PetState {
  const xp = Number(onchain[0]);

  return {
    ...INITIAL_STATE,
    created: true,
    xp,
    language: onchain[2],
    totalMinutes: Number(onchain[3]),
    minted: onchain[4],
    unlockedAccessories: getUnlockedAccessories(xp).map((accessory) => accessory.id),
  };
}

function hasPetOnchain(onchain: readonly [bigint, number, string, bigint, boolean]) {
  return Number(onchain[0]) > 0 || Number(onchain[3]) > 0 || Boolean(onchain[2]) || onchain[4];
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function usePetState() {
  const [pet, setPet] = useState<PetState>(INITIAL_STATE);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [ownerAddress, setOwnerAddress] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const readContract = useMemo(
    () => new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, new ethers.JsonRpcProvider(FUJI_RPC_URL)),
    [],
  );

  const wallet = walletAddress ? formatWalletLabel(walletAddress) : null;
  const isOwnerWallet = Boolean(
    walletAddress && ownerAddress && walletAddress.toLowerCase() === ownerAddress.toLowerCase(),
  );

  const requireOwnerWallet = useCallback(() => {
    if (!walletAddress || !contract) {
      throw new Error("Please connect the owner wallet first");
    }

    if (!ownerAddress || walletAddress.toLowerCase() !== ownerAddress.toLowerCase()) {
      throw new Error("Please connect the same wallet as the address you entered");
    }

    return contract;
  }, [contract, ownerAddress, walletAddress]);

  const inspectAddress = useCallback(async (address: string): Promise<InspectAddressResult> => {
    if (!ethers.isAddress(address)) {
      throw new Error("Please enter a valid wallet address");
    }

    const normalizedAddress = ethers.getAddress(address);
    setLoading(true);

    try {
      const onchain = (await readContract.getPet(normalizedAddress)) as readonly [bigint, number, string, bigint, boolean];
      const nextPet = hasPetOnchain(onchain) ? mapOnchainPet(onchain) : INITIAL_STATE;
      const status = nextPet.created ? "existing" : "new";

      setOwnerAddress(normalizedAddress);
      setPet(nextPet);

      return {
        address: normalizedAddress,
        status,
        pet: nextPet,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [readContract]);

  const connectWallet = useCallback(async (expectedAddress?: string) => {
    if (!window.ethereum) {
      throw new Error("Please install MetaMask");
    }

    setLoading(true);

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      if (network.chainId !== 43113n) {
        throw new Error("Please switch to Avalanche Fuji Testnet in MetaMask");
      }

      const signer = await provider.getSigner();
      const address = ethers.getAddress(await signer.getAddress());
      const signerContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setWalletAddress(address);
      setContract(signerContract);

      if (expectedAddress && address.toLowerCase() !== expectedAddress.toLowerCase()) {
        throw new Error("Connected wallet does not match the address you entered");
      }

      if (!ownerAddress) {
        setOwnerAddress(address);
      }

      return address;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [ownerAddress]);

  const createPet = useCallback(async (language: string) => {
    const writableContract = requireOwnerWallet();
    setLoading(true);

    try {
      const tx = await writableContract.createPet(language);
      await tx.wait();

      setPet({
        ...INITIAL_STATE,
        created: true,
        language,
      });
    } catch (error) {
      throw new Error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [requireOwnerWallet]);

  const logStudy = useCallback(async (minutes: number) => {
    const writableContract = requireOwnerWallet();
    setLoading(true);

    try {
      const tx = await writableContract.logStudy(minutes);
      await tx.wait();

      const signer = writableContract.runner as ethers.Signer;
      const addr = await signer.getAddress();
      const onchain = (await writableContract.getPet(addr)) as readonly [bigint, number, string, bigint, boolean];
      const newXp = Number(onchain[0]);

      setPet((prev) => {
        const today = getToday();
        const isNewDay = prev.lastStudyDate !== today;
        const wasYesterday =
          prev.lastStudyDate ===
          new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        let newStreak = prev.streak;
        if (isNewDay) {
          newStreak = wasYesterday || prev.streak === 0 ? prev.streak + 1 : 1;
        }
        const prevUnlocked = prev.unlockedAccessories;
        const allUnlocked = getUnlockedAccessories(newXp).map((a) => a.id);
        const newUnlocked = allUnlocked.filter((id) => !prevUnlocked.includes(id));
        return {
          ...prev,
          xp: newXp,
          totalMinutes: Number(onchain[3]),
          happiness: Math.min(100, prev.happiness + 5),
          hunger: Math.max(0, prev.hunger - 3),
          streak: newStreak,
          lastStudyDate: today,
          dailyProgress: isNewDay ? minutes : prev.dailyProgress + minutes,
          unlockedAccessories: [...new Set([...prevUnlocked, ...newUnlocked])],
        };
      });
    } catch (error) {
      throw new Error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [requireOwnerWallet]);

  const feedPet = useCallback(() => {
    setPet((prev) => ({
      ...prev,
      hunger: Math.min(100, prev.hunger + 20),
      happiness: Math.min(100, prev.happiness + 5),
    }));
  }, []);

  const playWithPet = useCallback(() => {
    setPet((prev) => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 15),
      hunger: Math.max(0, prev.hunger - 5),
    }));
  }, []);

  const quizReward = useCallback((correct: boolean) => {
    setPet((prev) => ({
      ...prev,
      xp: prev.xp + (correct ? 25 : 5),
      happiness: Math.min(100, prev.happiness + (correct ? 10 : 2)),
      unlockedAccessories: [
        ...new Set([
          ...prev.unlockedAccessories,
          ...getUnlockedAccessories(prev.xp + (correct ? 25 : 5)).map((a) => a.id),
        ]),
      ],
    }));
  }, []);

  const equipAccessory = useCallback((id: string | null) => {
    setPet((prev) => ({ ...prev, equippedAccessory: id }));
  }, []);

  const mintNFT = useCallback(async () => {
    const writableContract = requireOwnerWallet();
    setLoading(true);

    try {
      const tx = await writableContract.mintPetNFT();
      await tx.wait();
      setPet((prev) => ({ ...prev, minted: true }));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [requireOwnerWallet]);

  const resetPetFlow = useCallback(() => {
    setOwnerAddress(null);
    setPet(INITIAL_STATE);
  }, []);

  const stage = getStage(pet.xp);

  return {
    pet,
    wallet,
    walletAddress,
    ownerAddress,
    isOwnerWallet,
    stage,
    loading,
    inspectAddress,
    connectWallet,
    createPet,
    logStudy,
    feedPet,
    playWithPet,
    quizReward,
    equipAccessory,
    mintNFT,
    resetPetFlow,
  };
}
