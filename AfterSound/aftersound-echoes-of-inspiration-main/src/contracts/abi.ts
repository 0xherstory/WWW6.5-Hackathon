// ABI for MusicRegistry.sol
export const MUSIC_REGISTRY_ABI = [
  "function storeHash(bytes32 _hash) public",
  "function isDuplicate(bytes32 _hash) public view returns (bool)",
  "function getCount() public view returns (uint256)",
  "function getHash(uint256 index) public view returns (bytes32)",
  "function verifyHash(bytes32 _hash) public view returns (bool exists, address creator, uint256 time)",
  "function hashExists(bytes32) public view returns (bool)",
  "function creators(bytes32) public view returns (address)",
  "function timestamps(bytes32) public view returns (uint256)",
  "event HashStored(bytes32 indexed hash, address indexed creator, uint256 timestamp)",
] as const;

// Avalanche Fuji Testnet
export const CHAIN_CONFIG = {
  chainId: "0xa869",
  chainIdDecimal: 43113,
  chainName: "Avalanche Fuji Testnet",
  rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
  blockExplorerUrls: ["https://testnet.snowtrace.io"],
  nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
};

// TODO: Deploy contract and update this address
export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";
