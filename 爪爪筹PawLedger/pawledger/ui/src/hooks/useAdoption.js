import { useState, useEffect, useCallback } from "react";
import { useContract } from "./useContract";
import { useWallet } from "./useWallet";

function safeAt(value, index) {
  return value?.[index];
}

function normalizePet(raw, id) {
  return {
    petId: Number(raw?.petId ?? safeAt(raw, 0) ?? id),
    publisher: raw?.publisher ?? safeAt(raw, 1),
    petName: raw?.petName ?? safeAt(raw, 2) ?? "",
    breed: raw?.breed ?? safeAt(raw, 3) ?? "",
    age: Number(raw?.age ?? safeAt(raw, 4) ?? 0),
    description: raw?.description ?? safeAt(raw, 5) ?? "",
    imageUrl: raw?.imageUrl ?? safeAt(raw, 6) ?? "",
    isAdopted: Boolean(raw?.isAdopted ?? safeAt(raw, 7) ?? false),
    totalApplyCount: Number(raw?.totalApplyCount ?? safeAt(raw, 8) ?? 0),
  };
}

function normalizeApply(raw) {
  return {
    applyId: Number(raw?.applyId ?? safeAt(raw, 0) ?? 0),
    petId: Number(raw?.petId ?? safeAt(raw, 1) ?? 0),
    adopter: raw?.adopter ?? safeAt(raw, 2),
    applyMessage: raw?.applyMessage ?? safeAt(raw, 3) ?? "",
    applyTime: Number(raw?.applyTime ?? safeAt(raw, 4) ?? 0),
    status: Number(raw?.status ?? safeAt(raw, 5) ?? 0),
  };
}

function normalizeRealName(raw) {
  return {
    isVerified: Boolean(raw?.isVerified ?? safeAt(raw, 0) ?? false),
    nameHash: raw?.nameHash ?? safeAt(raw, 1) ?? "",
    idCardHash: raw?.idCardHash ?? safeAt(raw, 2) ?? "",
    phoneHash: raw?.phoneHash ?? safeAt(raw, 3) ?? "",
    registerTime: Number(raw?.registerTime ?? safeAt(raw, 4) ?? 0),
  };
}

async function sha256Hex(value) {
  if (!globalThis.crypto?.subtle?.digest) {
    throw new Error("WEB_CRYPTO_UNAVAILABLE");
  }

  try {
    const source = new TextEncoder().encode(value.trim());
    const digest = await globalThis.crypto.subtle.digest("SHA-256", source);
    const bytes = new Uint8Array(digest);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch (error) {
    throw new Error(error?.message || "Hashing failed");
  }
}

export function useAdoption() {
  const { pawAdoption } = useContract();
  const { account } = useWallet();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPets = useCallback(async () => {
    if (!pawAdoption) {
      setPets([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const total = Number(await pawAdoption.petTotalCount());
      if (total === 0) {
        setPets([]);
        return;
      }
      const ids = Array.from({ length: total }, (_, i) => i + 1);
      const rawPets = await Promise.all(ids.map((id) => pawAdoption.petAdoptions(id)));
      setPets(rawPets.map((raw, idx) => normalizePet(raw, ids[idx])));
    } catch (e) {
      setError(e.message || "Failed to fetch pets");
    } finally {
      setLoading(false);
    }
  }, [pawAdoption]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const getPet = useCallback(
    async (petId) => {
      if (!pawAdoption) return null;
      const raw = await pawAdoption.petAdoptions(petId);
      return normalizePet(raw, Number(petId));
    },
    [pawAdoption]
  );

  const getApplications = useCallback(
    async (petId) => {
      if (!pawAdoption) return [];
      const ids = await pawAdoption.getPetApplyList(petId);
      if (!ids || ids.length === 0) return [];
      const rawApplies = await Promise.all(ids.map((id) => pawAdoption.adoptionApplies(id)));
      return rawApplies.map(normalizeApply);
    },
    [pawAdoption]
  );

  const getMyApplications = useCallback(async () => {
    if (!pawAdoption || !account) return [];
    const total = Number(await pawAdoption.applyTotalCount());
    if (total === 0) return [];

    const ids = Array.from({ length: total }, (_, i) => i + 1);
    const rawApplies = await Promise.all(ids.map((id) => pawAdoption.adoptionApplies(id)));
    const normalized = rawApplies.map(normalizeApply);
    return normalized.filter(
      (item) => item.adopter && item.adopter.toLowerCase() === account.toLowerCase()
    );
  }, [pawAdoption, account]);

  const getRealName = useCallback(
    async (target = account) => {
      if (!pawAdoption || !target) return null;
      const raw = await pawAdoption.adopterRealNames(target);
      return normalizeRealName(raw);
    },
    [pawAdoption, account]
  );

  const registerRealName = useCallback(
    async ({ name, idCard, phone }) => {
      if (!pawAdoption) throw new Error("Contract not connected");
      const nameHash = await sha256Hex(name);
      const idCardHash = await sha256Hex(idCard);
      const phoneHash = await sha256Hex(phone);

      const tx = await pawAdoption.adopterRealNameRegister(nameHash, idCardHash, phoneHash);
      await tx.wait();
      return tx;
    },
    [pawAdoption]
  );

  const submitApply = useCallback(
    async (petId, applyMessage) => {
      if (!pawAdoption) throw new Error("Contract not connected");
      const tx = await pawAdoption.submitAdoptionApply(petId, applyMessage);
      await tx.wait();
      return tx;
    },
    [pawAdoption]
  );

  return {
    pets,
    loading,
    error,
    fetchPets,
    refresh: fetchPets,
    getPet,
    getApplications,
    getMyApplications,
    getRealName,
    registerRealName,
    submitApply,
  };
}
