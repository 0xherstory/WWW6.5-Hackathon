import { useReadContract } from 'wagmi';
import { useAccount, useWalletClient } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI, Exhibition, Submission } from '@/config/contract';
import { avalancheFuji } from 'viem/chains';
import { createPublicClient, http, parseEther } from 'viem';

const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http('https://avalanche-fuji-c-chain.publicnode.com'),
});

export interface UserSubmissionRecord extends Submission {
  exhibitionTitle: string;
}

export interface UserActivitySummary {
  submissions: UserSubmissionRecord[];
  myExhibitions: Exhibition[];
  hasFirstSubmissionBadge: boolean;
  hasFirstExhibitionBadge: boolean;
  milestoneBadges: Array<{
    submissionId: number;
    exhibitionId: number;
    exhibitionTitle: string;
    recommendCount: number;
  }>;
}

export interface HomeExhibitionRecord extends Exhibition {
  totalRecommends: number;
  totalWitnesses: number;
  hotScore: number;
  recentSubmissions: Submission[];
}

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
    query: { enabled: exhibitionId >= 0, refetchInterval: 5000, staleTime: 0 },
  });
}

export function usePendingSubmissions(exhibitionId: number) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getPendingSubmissions',
    args: [BigInt(exhibitionId)],
    query: { enabled: exhibitionId >= 0, refetchInterval: 5000 },
  });
}

export function useHasRecommended(submissionId: number, user: string) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'hasRecommended',
    args: [BigInt(submissionId), user as `0x${string}`],
    query: { enabled: submissionId >= 0 && !!user },
  });
}

export function useHasWitnessed(submissionId: number, user: string) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'hasWitnessed',
    args: [BigInt(submissionId), user as `0x${string}`],
    query: { enabled: submissionId >= 0 && !!user },
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

export function useHasSubmitted(address: string) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'hasSubmitted',
    args: [address as `0x${string}`],
    query: { enabled: !!address },
  });
}

export function useHasCreatedExhibition(address: string) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'hasCreatedExhibition',
    args: [address as `0x${string}`],
    query: { enabled: !!address },
  });
}

// Hook for direct viem transaction
export function useSetUsername(onSuccess?: () => void) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

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

    // Wait for transaction receipt before calling onSuccess
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === 'success') {
      onSuccess?.();
    }
    return hash;
  };

  return { setUsername };
}

export function useCreateExhibition(onSuccess?: () => void) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const createExhibition = async (args: { title: string; content: string; coverHash: string; tags: string[] }) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'createExhibition',
      args: [args.title, args.content, args.coverHash, args.tags],
      value: BigInt('1000000000000000'), // 0.001 AVAX
      account: address,
      chain: avalancheFuji,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === 'success') {
      onSuccess?.();
    }
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
    content: string;
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
        args.content,
        args.title,
        args.description,
      ],
      account: address,
      chain: avalancheFuji,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === 'success') {
      onSuccess?.();
    }
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

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === 'success') {
      onSuccess?.();
    }
    return hash;
  };

  return { recommend };
}

export function useWitness(onSuccess?: () => void) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const witness = async (submissionId: number) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'witness',
      args: [BigInt(submissionId)],
      account: address,
      chain: avalancheFuji,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === 'success') {
      onSuccess?.();
    }
    return hash;
  };

  return { witness };
}

export function useApproveSubmission(onSuccess?: () => void) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const approveSubmission = async (submissionId: number) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'approveSubmission',
      args: [BigInt(submissionId)],
      account: address,
      chain: avalancheFuji,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === 'success') {
      onSuccess?.();
    }
    return hash;
  };

  return { approveSubmission };
}

export function useRejectSubmission(onSuccess?: () => void) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const rejectSubmission = async (submissionId: number) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'rejectSubmission',
      args: [BigInt(submissionId)],
      account: address,
      chain: avalancheFuji,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === 'success') {
      onSuccess?.();
    }
    return hash;
  };

  return { rejectSubmission };
}

export function useContractOwner() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'owner',
  });
}

export function useWithdrawTips(onSuccess?: () => void) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const withdrawTips = async (exhibitionId: number) => {
    if (!walletClient || !address) throw new Error('Wallet not connected');
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'withdrawTips',
      args: [BigInt(exhibitionId)],
      account: address,
      chain: avalancheFuji,
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === 'success') onSuccess?.();
    return hash;
  };

  return { withdrawTips };
}

export function useWithdrawStake(onSuccess?: () => void) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const withdrawStake = async (exhibitionId: number) => {
    if (!walletClient || !address) throw new Error('Wallet not connected');
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'withdrawStake',
      args: [BigInt(exhibitionId)],
      account: address,
      chain: avalancheFuji,
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === 'success') onSuccess?.();
    return hash;
  };

  return { withdrawStake };
}

export function useFlagSubmission(onSuccess?: () => void) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const flagSubmission = async (submissionId: number) => {
    if (!walletClient || !address) throw new Error('Wallet not connected');
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'flagSubmission',
      args: [BigInt(submissionId)],
      account: address,
      chain: avalancheFuji,
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === 'success') onSuccess?.();
    return hash;
  };

  return { flagSubmission };
}

export function useFlagExhibition(onSuccess?: () => void) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const flagExhibition = async (exhibitionId: number) => {
    if (!walletClient || !address) throw new Error('Wallet not connected');
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'flagExhibition',
      args: [BigInt(exhibitionId)],
      account: address,
      chain: avalancheFuji,
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === 'success') onSuccess?.();
    return hash;
  };

  return { flagExhibition };
}

export function useTipExhibition(onSuccess?: () => void) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const tipExhibition = async (exhibitionId: number, amountInAvax: string) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    const normalizedAmount = amountInAvax.trim();
    if (!normalizedAmount || Number(normalizedAmount) <= 0) {
      throw new Error('Tip amount must be greater than 0');
    }

    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'tipExhibition',
      args: [BigInt(exhibitionId)],
      value: parseEther(normalizedAmount),
      account: address,
      chain: avalancheFuji,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === 'success') {
      onSuccess?.();
    }
    return hash;
  };

  return { tipExhibition };
}

export function useTipPlatform(onSuccess?: () => void) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const tipPlatform = async (amountInAvax: string) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    const normalizedAmount = amountInAvax.trim();
    if (!normalizedAmount || Number(normalizedAmount) <= 0) {
      throw new Error('打赏金额必须大于 0');
    }

    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'tipPlatform',
      args: [],
      value: parseEther(normalizedAmount),
      account: address,
      chain: avalancheFuji,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === 'success') {
      onSuccess?.();
    }
    return hash;
  };

  return { tipPlatform };
}

export function parseExhibition(raw: any): Exhibition | null {
  if (!raw) return null;
  return {
    id: Number(raw.id),
    curator: raw.curator,
    title: raw.title,
    content: raw.content,
    coverHash: raw.coverHash,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    createdAt: Number(raw.createdAt),
    stakeWithdrawn: Boolean(raw.stakeWithdrawn),
    flagged: Boolean(raw.flagged),
    tipPool: Number(raw.tipPool),
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
    creator: raw.creator,
    contentType: raw.contentType,
    status: Number(raw.status),
    content: raw.content,
    title: raw.title,
    description: raw.description,
    recommendCount: Number(raw.recommendCount),
    createdAt: Number(raw.createdAt),
    witnessCount: Number(raw.witnessCount),
    flagged: Boolean(raw.flagged),
  };
}

export function parseSubmissions(raw: any): Submission[] {
  if (!raw || !Array.isArray(raw)) return [];
  return raw.map(parseSubmission).filter(Boolean) as Submission[];
}

export async function fetchUserActivity(address: string): Promise<UserActivitySummary> {
  const normalizedAddress = address.toLowerCase();

  const [rawExhibitions, rawHasSubmitted, rawHasCreatedExhibition] = await Promise.all([
    publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'getAllExhibitions',
    }),
    publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'hasSubmitted',
      args: [address as `0x${string}`],
    }),
    publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'hasCreatedExhibition',
      args: [address as `0x${string}`],
    }),
  ]);

  const exhibitions = parseExhibitions(rawExhibitions);
  const submissionGroups = await Promise.all(
    exhibitions.map(async (exhibition) => {
      const rawSubmissions = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getSubmissions',
        args: [BigInt(exhibition.id)],
      });

      return {
        exhibition,
        submissions: parseSubmissions(rawSubmissions),
      };
    })
  );

  const submissions = submissionGroups
    .flatMap(({ exhibition, submissions }) =>
      submissions
        .filter((submission) => submission.creator.toLowerCase() === normalizedAddress)
        .map((submission) => ({
          ...submission,
          exhibitionTitle: exhibition.title,
        }))
    )
    .sort((left, right) => right.createdAt - left.createdAt);

  const milestoneBadges = submissions
    .filter((submission) => submission.recommendCount >= 10)
    .map((submission) => ({
      submissionId: submission.id,
      exhibitionId: submission.exhibitionId,
      exhibitionTitle: submission.exhibitionTitle,
      recommendCount: submission.recommendCount,
    }));

  const myExhibitions = exhibitions
    .filter((exhibition) => exhibition.curator.toLowerCase() === normalizedAddress)
    .sort((a, b) => b.createdAt - a.createdAt);

  return {
    submissions,
    myExhibitions,
    hasFirstSubmissionBadge: Boolean(rawHasSubmitted),
    hasFirstExhibitionBadge: Boolean(rawHasCreatedExhibition),
    milestoneBadges,
  };
}

export async function fetchHomeExhibitions(): Promise<HomeExhibitionRecord[]> {
  const rawExhibitions = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllExhibitions',
  });

  const exhibitions = parseExhibitions(rawExhibitions).filter((exhibition) => !exhibition.flagged);

  const enriched = await Promise.all(
    exhibitions.map(async (exhibition) => {
      const rawSubmissions = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getSubmissions',
        args: [BigInt(exhibition.id)],
      });

      const submissions = parseSubmissions(rawSubmissions).filter(
        (submission) => submission.status === 1 && !submission.flagged
      );
      const recentSubmissions = submissions.slice(0, 3);
      const totalRecommends = submissions.reduce((sum, submission) => sum + submission.recommendCount, 0);
      const totalWitnesses = submissions.reduce((sum, submission) => sum + submission.witnessCount, 0);

      return {
        ...exhibition,
        totalRecommends,
        totalWitnesses,
        hotScore: totalRecommends * 0.7 + exhibition.submissionCount * 0.3,
        recentSubmissions,
      };
    })
  );

  return enriched;
}
