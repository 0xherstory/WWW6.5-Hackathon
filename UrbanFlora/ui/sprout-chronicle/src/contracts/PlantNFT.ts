export const PLANT_NFT_ADDRESS = '0xbf53293FB2661BDc629ca1Cf733d25b41e60597F';

export const PLANT_NFT_ABI = [
  {
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'location', type: 'string' },
      { name: 'tokenURI', type: 'string' },
    ],
    name: 'createPlant',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
