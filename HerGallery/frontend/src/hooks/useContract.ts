import { useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAccount, useWalletClient } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI, Exhibition, Submission } from '@/config/contract';
import { avalancheFuji } from 'viem/chains';

export function useExhibitions() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllExhibitions',
    query: { refetchInterval: 5000 },
  });
}

export function useExhibition(id: number) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getExhibition',
    args: [BigInt(id)],
    query: { enabled: id >= 0, refetchInterval: 5000 },
  });
}

export function useSubmissions(exhibitionId: number) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getSubmissions',
    args: [BigInt(exhibitionId)],
    query: { enabled: exhibitionId >= 0, refetchInterval: 5000 },
  });
}

export function useHasRecommended(exhibitionId: number, submissionId: number, user: string) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'hasRecommended',
    args: [BigInt(exhibitionId), BigInt(submissionId), user as `0x${string}`],
    query: { enabled: exhibitionId > 0 && submissionId > 0 && !!user },
  });
}

export function useCreationFee() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'CREATION_FEE',
  });
}

export function useUsername(address: string) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'usernames',
    args: [address as `0x${string}`],
    query: { enabled: !!address },
  });
}

export function useHasSetUsername(address: string) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'hasSetUsername',
    args: [address as `0x${string}`],
    query: { enabled: !!address },
  });
}

// Hook for direct viem transaction
export function useSetUsername(onSuccess?: () => void) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const { isLoading: isPending, isSuccess, isError, error } = useWaitForTransactionReceipt({
    hash: walletClient ? undefined as any : undefined,
  });

  const setUsername = async (username: string) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'setUsername',
      args: [username],
      account: address,
      chain: avalancheFuji,
    });

    onSuccess?.();
    return hash;
  };

  return { setUsername, isPending, isSuccess, error };
}

export function useCreateExhibition(onSuccess?: () => void) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const createExhibition = async (args: { title: string; contentHash: string; coverHash: string }) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'createExhibition',
      args: [args.title, args.contentHash, args.coverHash],
      value: BigInt('1000000000000000'), // 0.001 AVAX
      account: address,
      chain: avalancheFuji,
    });

    onSuccess?.();
    return hash;
  };

  return { createExhibition };
}

export function useSubmitToExhibition(onSuccess?: () => void) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const submitToExhibition = async (args: {
    exhibitionId: number;
    contentType: string;
    contentHash: string;
    title: string;
    description: string;
  }) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'submitToExhibition',
      args: [
        BigInt(args.exhibitionId),
        args.contentType,
        args.contentHash,
        args.title,
        args.description,
      ],
      account: address,
      chain: avalancheFuji,
    });

    onSuccess?.();
    return hash;
  };

  return { submitToExhibition };
}

export function useRecommend(onSuccess?: () => void) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const recommend = async (args: { exhibitionId: number; submissionId: number }) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'recommend',
      args: [BigInt(args.exhibitionId), BigInt(args.submissionId)],
      account: address,
      chain: avalancheFuji,
    });

    onSuccess?.();
    return hash;
  };

  return { recommend };
}

export function parseExhibition(raw: any): Exhibition | null {
  if (!raw) return null;
  return {
    id: Number(raw.id),
    title: raw.title,
    contentHash: raw.contentHash,
    coverHash: raw.coverHash,
    curator: raw.curator,
    createdAt: Number(raw.createdAt),
    isActive: raw.isActive,
    submissionCount: Number(raw.submissionCount),
  };
}

export function parseExhibitions(raw: any): Exhibition[] {
  if (!raw || !Array.isArray(raw)) return [];
  return raw.map(parseExhibition).filter(Boolean) as Exhibition[];
}

export function parseSubmission(raw: any): Submission | null {
  if (!raw) return null;
  return {
    id: Number(raw.id),
    exhibitionId: Number(raw.exhibitionId),
    contentType: raw.contentType,
    contentHash: raw.contentHash,
    title: raw.title,
    description: raw.description,
    creator: raw.creator,
    recommendCount: Number(raw.recommendCount),
    createdAt: Number(raw.createdAt),
  };
}

export function parseSubmissions(raw: any): Submission[] {
  if (!raw || !Array.isArray(raw)) return [];
  return raw.map(parseSubmission).filter(Boolean) as Submission[];
}
