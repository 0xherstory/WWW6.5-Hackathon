// Network and contract configuration
export const NETWORK = {
  chainId: 43113,
  name: "Avalanche Fuji Testnet",
  rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
  currency: "AVAX",
  blockExplorer: "https://testnet.snowtrace.io",
};

// Fill in after deployment
export const CONTRACT_ADDRESSES = {
  PawToken: "0x2B3F619dF5d9b4f855cC2a634a2db4E4A9837267",
  PawLedger: "0x7C2BBb15Cc5becD532ad10B696C35ebbDbFE92C3", // ERC1967Proxy
  PawAdoption: "0xa666392dc14B8dECc3b3BD4FF9e790821444e03F",
};
