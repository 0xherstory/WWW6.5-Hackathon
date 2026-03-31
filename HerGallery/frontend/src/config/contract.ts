export const CONTRACT_ADDRESS = '0x320900FA245b5E44ebab6B5f2006E2187C83e396' as const;

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
    name: 'getAllExhibitions',
    outputs: [
      {
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'title', type: 'string' },
          { name: 'contentHash', type: 'string' },
          { name: 'coverHash', type: 'string' },
          { name: 'curator', type: 'address' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'isActive', type: 'bool' },
          { name: 'submissionCount', type: 'uint256' },
        ],
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_id', type: 'uint256' }],
    name: 'getExhibition',
    outputs: [
      {
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'title', type: 'string' },
          { name: 'contentHash', type: 'string' },
          { name: 'coverHash', type: 'string' },
          { name: 'curator', type: 'address' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'isActive', type: 'bool' },
          { name: 'submissionCount', type: 'uint256' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_exhibitionId', type: 'uint256' }],
    name: 'getSubmissions',
    outputs: [
      {
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'exhibitionId', type: 'uint256' },
          { name: 'contentType', type: 'string' },
          { name: 'contentHash', type: 'string' },
          { name: 'title', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'creator', type: 'address' },
          { name: 'recommendCount', type: 'uint256' },
          { name: 'createdAt', type: 'uint256' },
        ],
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_exhibitionId', type: 'uint256' }],
    name: 'getSubmissionCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: '_exhibitionId', type: 'uint256' },
      { name: '_submissionId', type: 'uint256' },
    ],
    name: 'recommend',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: '_exhibitionId', type: 'uint256' },
      { name: '_submissionId', type: 'uint256' },
      { name: 'user', type: 'address' },
    ],
    name: 'hasRecommended',
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
      { name: '_title', type: 'string' },
      { name: '_contentHash', type: 'string' },
      { name: '_coverHash', type: 'string' },
    ],
    name: 'createExhibition',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { name: '_exhibitionId', type: 'uint256' },
      { name: '_contentType', type: 'string' },
      { name: '_contentHash', type: 'string' },
      { name: '_title', type: 'string' },
      { name: '_description', type: 'string' },
    ],
    name: 'submitToExhibition',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'id', type: 'uint256' },
      { indexed: false, name: 'title', type: 'string' },
      { indexed: true, name: 'curator', type: 'address' },
    ],
    name: 'ExhibitionCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'submissionId', type: 'uint256' },
    ],
    name: 'FirstSubmission',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'creator', type: 'address' },
      { indexed: false, name: 'submissionId', type: 'uint256' },
      { indexed: false, name: 'recommendCount', type: 'uint256' },
    ],
    name: 'RecommendMilestone',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'submissionId', type: 'uint256' },
      { indexed: true, name: 'recommender', type: 'address' },
      { indexed: false, name: 'newCount', type: 'uint256' },
    ],
    name: 'Recommended',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'id', type: 'uint256' },
      { indexed: true, name: 'exhibitionId', type: 'uint256' },
      { indexed: true, name: 'creator', type: 'address' },
    ],
    name: 'SubmissionCreated',
    type: 'event',
  },
  {
    inputs: [{ name: '', type: 'address' }],
    name: 'usernames',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'address' }],
    name: 'hasSetUsername',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_username', type: 'string' }],
    name: 'setUsername',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export interface Exhibition {
  id: number;
  title: string;
  contentHash: string;
  coverHash: string;
  curator: string;
  createdAt: number;
  isActive: boolean;
  submissionCount: number;
}

export interface Submission {
  id: number;
  exhibitionId: number;
  contentType: string;
  contentHash: string;
  title: string;
  description: string;
  creator: string;
  recommendCount: number;
  createdAt: number;
}
