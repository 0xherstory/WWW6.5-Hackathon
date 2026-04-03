export const CONTRACT_ADDRESS = '0xB76Bf0228C2eFBED7c6D2b7C28fFe202Db5C37e8' as const;

export const AVALANCHE_FUJI = {
  id: 43113,
  name: 'Avalanche Fuji',
  nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://api.avax-test.network/ext/bc/C/rpc'] },
  },
  blockExplorers: {
    default: { name: 'SnowTrace', url: 'https://testnet.snowtrace.io' },
  },
  testnet: true,
} as const;

const exhibitionComponents = [
  { name: 'id', type: 'uint256' },
  { name: 'curator', type: 'address' },
  { name: 'title', type: 'string' },
  { name: 'contentHash', type: 'string' },
  { name: 'coverHash', type: 'string' },
  { name: 'tags', type: 'string[]' },
  { name: 'createdAt', type: 'uint256' },
  { name: 'stakeWithdrawn', type: 'bool' },
  { name: 'flagged', type: 'bool' },
  { name: 'tipPool', type: 'uint256' },
  { name: 'submissionCount', type: 'uint256' },
] as const;

const submissionComponents = [
  { name: 'id', type: 'uint256' },
  { name: 'exhibitionId', type: 'uint256' },
  { name: 'creator', type: 'address' },
  { name: 'contentType', type: 'string' },
  { name: 'status', type: 'uint8' },
  { name: 'contentHash', type: 'string' },
  { name: 'title', type: 'string' },
  { name: 'description', type: 'string' },
  { name: 'createdAt', type: 'uint256' },
  { name: 'recommendCount', type: 'uint256' },
  { name: 'witnessCount', type: 'uint256' },
  { name: 'flagged', type: 'bool' },
] as const;

export const CONTRACT_ABI = [
  {
    inputs: [],
    name: 'CREATION_FEE',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MIN_SUBMISSIONS_FOR_STAKE_WITHDRAWAL',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllExhibitions',
    outputs: [{ components: exhibitionComponents, name: '', type: 'tuple[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'exhibitionId', type: 'uint256' }],
    name: 'getExhibition',
    outputs: [{ components: exhibitionComponents, name: '', type: 'tuple' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'exhibitionId', type: 'uint256' }],
    name: 'getSubmissions',
    outputs: [{ components: submissionComponents, name: '', type: 'tuple[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'exhibitionId', type: 'uint256' }],
    name: 'getPendingSubmissions',
    outputs: [{ components: submissionComponents, name: '', type: 'tuple[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'exhibitionId', type: 'uint256' }],
    name: 'getSubmissionCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getExhibitionCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTotalSubmissionCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'exhibitionId', type: 'uint256' },
      { name: 'submissionId', type: 'uint256' },
    ],
    name: 'recommend',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'submissionId', type: 'uint256' }, { name: 'user', type: 'address' }],
    name: 'hasRecommended',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'submissionId', type: 'uint256' }, { name: 'user', type: 'address' }],
    name: 'hasWitnessed',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'hasSubmitted',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'title', type: 'string' },
      { name: 'contentHash', type: 'string' },
      { name: 'coverHash', type: 'string' },
      { name: 'tags', type: 'string[]' },
    ],
    name: 'createExhibition',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'exhibitionId', type: 'uint256' },
      { name: 'contentType', type: 'string' },
      { name: 'contentHash', type: 'string' },
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
    ],
    name: 'submitToExhibition',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'submissionId', type: 'uint256' }],
    name: 'approveSubmission',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'submissionId', type: 'uint256' }],
    name: 'rejectSubmission',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'submissionId', type: 'uint256' }],
    name: 'witness',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'tipPlatform',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ name: 'exhibitionId', type: 'uint256' }],
    name: 'tipExhibition',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ name: 'exhibitionId', type: 'uint256' }],
    name: 'withdrawTips',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'exhibitionId', type: 'uint256' }],
    name: 'withdrawStake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'submissionId', type: 'uint256' }],
    name: 'flagSubmission',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'exhibitionId', type: 'uint256' }],
    name: 'flagExhibition',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'usernames',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'hasSetUsername',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'username', type: 'string' }],
    name: 'setUsername',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  evidence: '存证',
  creation: '二创',
  art: '存证',
  testimony: '存证',
  screenshot: '存证',
  link: '存证',
};

export const SUBMISSION_STATUS_LABELS: Record<number, string> = {
  0: '待审核',
  1: '已通过',
  2: '已拒绝',
};

export interface Exhibition {
  id: number;
  curator: string;
  title: string;
  contentHash: string;
  coverHash: string;
  tags: string[];
  createdAt: number;
  stakeWithdrawn: boolean;
  flagged: boolean;
  tipPool: number;
  submissionCount: number;
}

export interface Submission {
  id: number;
  exhibitionId: number;
  creator: string;
  contentType: string;
  status: number;
  contentHash: string;
  title: string;
  description: string;
  createdAt: number;
  recommendCount: number;
  witnessCount: number;
  flagged: boolean;
}
