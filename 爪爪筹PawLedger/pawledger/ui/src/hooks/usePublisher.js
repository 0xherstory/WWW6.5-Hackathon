import { useState, useCallback } from "react";
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

export function usePublisher() {
  const { pawAdoption } = useContract();
  const { account } = useWallet();
  const [loading, setLoading] = useState(false);

  const publishPet = useCallback(
    async ({ petName, breed, age, description, imageUrl }) => {
      if (!pawAdoption) throw new Error("Contract not connected");
      setLoading(true);
      try {
        const tx = await pawAdoption.publishPetAdoption(
          petName,
          breed,
          Number(age),
          description,
          imageUrl
        );
        await tx.wait();
        return tx;
      } finally {
        setLoading(false);
      }
    },
    [pawAdoption]
  );

  const auditApplication = useCallback(
    async (applyId, isPass) => {
      if (!pawAdoption) throw new Error("Contract not connected");
      setLoading(true);
      try {
        const tx = await pawAdoption.auditAdoptionApply(applyId, Boolean(isPass));
        await tx.wait();
        return tx;
      } finally {
        setLoading(false);
      }
    },
    [pawAdoption]
  );

  const getMyPets = useCallback(async () => {
    if (!pawAdoption || !account) return [];
    const total = Number(await pawAdoption.petTotalCount());
    if (total === 0) return [];

    const ids = Array.from({ length: total }, (_, i) => i + 1);
    const rawPets = await Promise.all(ids.map((id) => pawAdoption.petAdoptions(id)));
    const pets = rawPets.map((raw, idx) => normalizePet(raw, ids[idx]));

    return pets.filter(
      (pet) => pet.publisher && pet.publisher.toLowerCase() === account.toLowerCase()
    );
  }, [pawAdoption, account]);

  const getPetApplications = useCallback(
    async (petId) => {
      if (!pawAdoption) return [];
      const ids = await pawAdoption.getPetApplyList(petId);
      if (!ids || ids.length === 0) return [];

      const rawApplies = await Promise.all(ids.map((id) => pawAdoption.adoptionApplies(id)));
      return rawApplies.map(normalizeApply);
    },
    [pawAdoption]
  );

  return {
    loading,
    publishPet,
    auditApplication,
    getMyPets,
    getPetApplications,
  };
}
