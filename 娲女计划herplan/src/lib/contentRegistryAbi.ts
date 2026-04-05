/**
 * ContentRegistry 合约 ABI（Remix 编译产物 / 与链上部署一致）
 * `Web3ContentProof` 通过 `writeContract` 调用 `storeHash`；事件可供日后 `getLogs` 使用。
 */
export const contentRegistryAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "contentHash",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "author",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "ContentStored",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "contentHash",
        type: "bytes32",
      },
    ],
    name: "storeHash",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
