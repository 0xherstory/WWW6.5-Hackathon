import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PoolStatus } from '@/lib/web3/sanctuaryContract';

interface ClaimStore {
  isVerifying: boolean;
  isVerified: boolean;
  email: string;
  emailHash: string;

  isClaiming: boolean;
  hasClaimed: boolean;
  claimAmount: string;
  claimTxHash: string;

  poolStatus: PoolStatus | null;

  setIsVerifying: (verifying: boolean) => void;
  setIsVerified: (verified: boolean) => void;
  setEmail: (email: string) => void;
  setEmailHash: (hash: string) => void;
  
  setIsClaiming: (claiming: boolean) => void;
  setHasClaimed: (claimed: boolean) => void;
  setClaimAmount: (amount: string) => void;
  setClaimTxHash: (hash: string) => void;
  
  updatePoolStatus: (status: PoolStatus) => void;
  
  reset: () => void;
}

const initialState = {
  isVerifying: false,
  isVerified: false,
  email: '',
  emailHash: '',
  isClaiming: false,
  hasClaimed: false,
  claimAmount: '0',
  claimTxHash: '',
  poolStatus: null,
};

export const useClaimStore = create<ClaimStore>()(
  persist(
    (set) => ({
      ...initialState,

      setIsVerifying: (isVerifying) => set({ isVerifying }),
      setIsVerified: (isVerified) => set({ isVerified }),
      setEmail: (email) => set({ email }),
      setEmailHash: (emailHash) => set({ emailHash }),
      
      setIsClaiming: (isClaiming) => set({ isClaiming }),
      setHasClaimed: (hasClaimed) => set({ hasClaimed }),
      setClaimAmount: (claimAmount) => set({ claimAmount }),
      setClaimTxHash: (claimTxHash) => set({ claimTxHash }),
      
      updatePoolStatus: (poolStatus) => set({ poolStatus }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'oh-card-claim-store',
      partialize: (state) => ({
        isVerified: state.isVerified,
        emailHash: state.emailHash,
        hasClaimed: state.hasClaimed,
      }),
    }
  )
);
