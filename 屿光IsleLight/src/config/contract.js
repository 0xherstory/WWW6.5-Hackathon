// src/config/contract.js

// 合约地址 - 新部署的测试网合约
export const CONTRACT_ADDRESS = '0x44011ffB344443f5bfA8264b5caf7852Cc139bEB'

// 合约 ABI - 完整版本：支持打卡备注上链、分页查询
export const CONTRACT_ABI = [
  // ============ 写入函数 ============
  {
    "inputs": [
      { "internalType": "string", "name": "_contentHash", "type": "string" },
      { "internalType": "string", "name": "_title", "type": "string" }
    ],
    "name": "addLighthouse",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_cid", "type": "string" },
      { "internalType": "string", "name": "_thought", "type": "string" }
    ],
    "name": "checkIn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_nickname", "type": "string" }
    ],
    "name": "createIdentity",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  
  // ============ 事件 ============
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "cid", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "thought", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "CheckInAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "nickname", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "joinTime", "type": "uint256" }
    ],
    "name": "IdentityCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "title", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "contentHash", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "LighthouseAdded",
    "type": "event"
  },
  
  // ============ 错误 ============
  { "inputs": [], "name": "IdentityAlreadyExists", "type": "error" },
  { "inputs": [], "name": "IdentityNotExists", "type": "error" },
  { "inputs": [], "name": "NicknameEmpty", "type": "error" },
  { "inputs": [], "name": "NicknameTooLong", "type": "error" },
  { "inputs": [], "name": "StringTooLong", "type": "error" },
  { "inputs": [], "name": "TitleEmpty", "type": "error" },
  
  // ============ 常量 ============
  {
    "inputs": [],
    "name": "DEFAULT_PAGE_SIZE",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_NICKNAME_LENGTH",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_STRING_LENGTH",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  
  // ============ 查询函数 ============
  {
    "inputs": [],
    "name": "getAllLighthouses",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "contentHash", "type": "string" },
          { "internalType": "string", "name": "title", "type": "string" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "address", "name": "author", "type": "address" }
        ],
        "internalType": "struct IsleLight.Lighthouse[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }],
    "name": "getCheckInCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }],
    "name": "getIdentity",
    "outputs": [
      { "internalType": "string", "name": "nickname", "type": "string" },
      { "internalType": "uint256", "name": "joinTime", "type": "uint256" },
      { "internalType": "uint256", "name": "lighthouseCount", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getLighthouseCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_offset", "type": "uint256" },
      { "internalType": "uint256", "name": "_limit", "type": "uint256" }
    ],
    "name": "getLighthousesPaginated",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "contentHash", "type": "string" },
          { "internalType": "string", "name": "title", "type": "string" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "address", "name": "author", "type": "address" }
        ],
        "internalType": "struct IsleLight.Lighthouse[]",
        "name": "",
        "type": "tuple[]"
      },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMyCheckIns",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "string", "name": "cid", "type": "string" },
          { "internalType": "string", "name": "thought", "type": "string" }
        ],
        "internalType": "struct IsleLight.CheckIn[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_offset", "type": "uint256" },
      { "internalType": "uint256", "name": "_limit", "type": "uint256" }
    ],
    "name": "getMyCheckInsPaginated",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "string", "name": "cid", "type": "string" },
          { "internalType": "string", "name": "thought", "type": "string" }
        ],
        "internalType": "struct IsleLight.CheckIn[]",
        "name": "",
        "type": "tuple[]"
      },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMyIdentity",
    "outputs": [
      { "internalType": "string", "name": "nickname", "type": "string" },
      { "internalType": "uint256", "name": "joinTime", "type": "uint256" },
      { "internalType": "uint256", "name": "lighthouseCount", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }],
    "name": "getUserCheckIns",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "string", "name": "cid", "type": "string" },
          { "internalType": "string", "name": "thought", "type": "string" }
        ],
        "internalType": "struct IsleLight.CheckIn[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_user", "type": "address" },
      { "internalType": "uint256", "name": "_offset", "type": "uint256" },
      { "internalType": "uint256", "name": "_limit", "type": "uint256" }
    ],
    "name": "getUserCheckInsPaginated",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "string", "name": "cid", "type": "string" },
          { "internalType": "string", "name": "thought", "type": "string" }
        ],
        "internalType": "struct IsleLight.CheckIn[]",
        "name": "",
        "type": "tuple[]"
      },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }],
    "name": "getUserLighthouses",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "contentHash", "type": "string" },
          { "internalType": "string", "name": "title", "type": "string" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "address", "name": "author", "type": "address" }
        ],
        "internalType": "struct IsleLight.Lighthouse[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_user", "type": "address" },
      { "internalType": "uint256", "name": "_offset", "type": "uint256" },
      { "internalType": "uint256", "name": "_limit", "type": "uint256" }
    ],
    "name": "getUserLighthousesPaginated",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "contentHash", "type": "string" },
          { "internalType": "string", "name": "title", "type": "string" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "address", "name": "author", "type": "address" }
        ],
        "internalType": "struct IsleLight.Lighthouse[]",
        "name": "",
        "type": "tuple[]"
      },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  
  // ============ 状态变量查询 ============
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "hasIdentity",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "identities",
    "outputs": [
      { "internalType": "string", "name": "nickname", "type": "string" },
      { "internalType": "uint256", "name": "joinTime", "type": "uint256" },
      { "internalType": "uint256", "name": "lighthouseCount", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "lighthouses",
    "outputs": [
      { "internalType": "string", "name": "contentHash", "type": "string" },
      { "internalType": "string", "name": "title", "type": "string" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "address", "name": "author", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "userCheckIns",
    "outputs": [
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "string", "name": "cid", "type": "string" },
      { "internalType": "string", "name": "thought", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "userLighthouseIndices",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
]

// 搜索索引缓存 key
export const SEARCH_INDEX_KEY = 'IsleLight_search_index'
export const SEARCH_INDEX_TIMESTAMP_KEY = 'IsleLight_search_index_timestamp'
