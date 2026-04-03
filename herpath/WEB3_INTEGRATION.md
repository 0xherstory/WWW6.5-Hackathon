# HerPath Web3 Integration

This document describes how HerPath integrates with blockchain technology (Avalanche Fuji testnet) for NFT minting and milestone tracking.

## Overview

HerPath uses two main smart contracts on Avalanche Fuji Testnet:

1. **HerPathNFT (ERC721)** - Collectible NFTs with automatic 90%/10% charity distribution
2. **HerPathSBT** - Soulbound Tokens (non-transferable achievements)

## Architecture

### Smart Contracts (Backend)

```
HerPathNFT.sol
├─ ERC721 standard compliance
├─ Mint NFTs with metadata
├─ Automatic fund distribution:
│  ├─ 90% to charity wallets
│  └─ 10% to project wallet
├─ Support for multiple leaders (RBG, Hillary)
└─ Events for on-chain tracking

HerPathSBT.sol
├─ ERC721 standard (non-transferable)
├─ Mint SBTs for milestones
├─ Per-player achievement tracking
├─ Level-based progression (1-5)
├─ Branch-specific tokens
└─ Narrative metadata storage
```

### Frontend Integration (Web3 Layer)

```
useWeb3 Hook (React)
├─ Wallet connection (MetaMask)
├─ Network switching (Fuji)
├─ Transaction signing
├─ Error handling
└─ State management
```

## Game Flow with Web3

### NFT Purchase Flow

```
Player in NFT Shop
    ↓
Clicks "Purchase NFT"
    ↓
NFTPurchaseModal shows:
├─ NFT details
├─ Price: 0.01 AVAX
├─ Charity impact explanation
└─ "Confirm Purchase" button
    ↓
Player clicks confirm
    ↓
useWeb3.mintNFT() called
    ↓
MetaMask Popup:
├─ Shows transaction details
├─ Recipient: HerPathNFT contract
├─ Value: 0.01 AVAX
└─ Gas estimate
    ↓
Player approves in MetaMask
    ↓
Transaction sent to Fuji
    ↓
Contract execution:
├─ Mint NFT to player
├─ Calculate funds:
│  ├─ 0.009 AVAX → Charity
│  └─ 0.001 AVAX → Project
└─ Emit events
    ↓
CharityModal shows impact:
├─ "Successfully purchased!"
├─ Charity organization info
├─ Real-time stats
└─ Transaction hash for verification
```

### Milestone SBT Flow

```
Player reaches threshold (3/6/9/12/15)
    ↓
MilestoneStoryModal appears:
├─ Shows narrative
├─ "铸造勋章" (Mint SBT) button
└─ Explains Soulbound nature
    ↓
Player clicks "铸造勋章"
    ↓
Frontend calls backend/admin API
    ↓
Admin approves and calls:
  HerPathSBT.mintSBT(
    player,
    sbtId,
    sbtName,
    sbtIcon,
    leaderType,
    branchName,
    level,
    situation,
    flavor
  )
    ↓
SBT minted to player address
    ↓
Player can view in wallet
├─ Non-transferable
├─ Shows full narrative metadata
└─ Contributes to achievement count
```

## Contract Interactions

### Minting NFTs

**From Frontend:**
```typescript
const txHash = await mintNFT(
  "rbg" || "hillary",
  "NFT Name",
  "Description"
);
// Returns transaction hash for tracking
```

**From Contract:**
```solidity
function mintNFT(
  address to,
  string memory leaderType,
  string memory nftName,
  string memory description
) public payable returns (uint256)
```

**Fund Distribution:**
- 0.01 AVAX input
- 0.009 AVAX (90%) → Charity wallet
- 0.001 AVAX (10%) → Project wallet
- Automatic distribution in single transaction

### Minting SBTs

**From Admin/Backend:**
```solidity
function mintSBT(
  address player,
  string memory sbtId,        // "rbg_eq_l5"
  string memory sbtName,      // "平权意识 Lv.5"
  string memory sbtIcon,      // "✦"
  string memory leaderType,   // "rbg"
  string memory branchName,   // "equality"
  uint256 level,              // 5
  string memory situation,    // Narrative
  string memory flavor        // Flavor text
) public onlyOwner returns (uint256)
```

## Metadata Storage

### NFT Metadata (On-Chain)

```typescript
struct NFTMetadata {
  string leaderType;    // "rbg" or "hillary"
  string nftName;       // User-facing name
  string description;   // Description text
  uint256 mintedAt;     // Timestamp
}
```

### SBT Metadata (On-Chain)

```typescript
struct SBTMetadata {
  string sbtId;         // "rbg_eq_l5"
  string sbtName;       // "平权意识 Lv.5"
  string sbtIcon;       // "✦"
  string leaderType;    // "rbg"
  string branchName;    // "equality"
  uint256 level;        // 1-5
  string situation;     // Detailed narrative
  string flavor;        // Quote or flavor
  uint256 mintedAt;     // Timestamp
}
```

## State Management

### Contract State Tracking

**HerPathNFT:**
```solidity
mapping(uint256 => NFTMetadata) public nftMetadata;
mapping(address => CharityInfo[]) public charityWallets;

uint256 public totalCharityDistributed;  // Total funds to charities
uint256 public totalProjectFunded;       // Total funds to project
```

**HerPathSBT:**
```solidity
mapping(uint256 => SBTMetadata) public sbtMetadata;
mapping(address => mapping(string => bool)) public playerSBTs;
mapping(address => uint256[]) public playerTokenIds;
```

### Frontend State (LocalStorage)

```typescript
// Game save state
{
  leader: "rbg" | "hillary",
  attributes: { legality: 0, equality: 0 },
  drawnCardIds: [],
  sbtsMinted: ["rbg_eq_l5"],
  milestone: null
}

// NFT ownership (simulated frontend)
{
  ownedNFTs: [{
    tokenId: 123,
    leaderType: "rbg",
    nftName: "Justice Bearer",
    mintedAt: 1234567890
  }]
}
```

## Network Configuration

### Avalanche Fuji Testnet
- **Chain ID**: 43113
- **RPC URL**: https://api.avax-test.network/ext/bc/C/rpc
- **Currency**: AVAX (18 decimals)
- **Block Explorer**: https://testnet.snowtrace.io
- **Block Time**: ~2-3 seconds
- **Gas Price**: ~25-50 nanoAVAX (very cheap)

### Environment Variables Required

```env
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_SBT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_NETWORK_ID=43113
NEXT_PUBLIC_NETWORK_NAME=Avalanche Fuji
NEXT_PUBLIC_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
```

## Wallet Integration

### MetaMask Connection Flow

1. **Detect Wallet**
   ```typescript
   if (window.ethereum) {
     // MetaMask is installed
   }
   ```

2. **Request Connection**
   ```typescript
   const accounts = await window.ethereum.request({
     method: 'eth_requestAccounts'
   });
   ```

3. **Switch Network**
   ```typescript
   await window.ethereum.request({
     method: 'wallet_switchEthereumChain',
     params: [{ chainId: '0xa869' }] // Fuji
   });
   ```

4. **Send Transaction**
   ```typescript
   const txHash = await window.ethereum.request({
     method: 'eth_sendTransaction',
     params: [{
       from: userAddress,
       to: contractAddress,
       value: '10000000000000000', // 0.01 AVAX in wei
       data: encodedFunctionData
     }]
   });
   ```

## Error Handling

### Common Errors and Recovery

| Error | Cause | Solution |
|-------|-------|----------|
| "MetaMask not installed" | Browser extension not found | Install MetaMask |
| "User rejected request" | User clicked deny in popup | Ask user to approve |
| "Insufficient funds" | Not enough gas money | Get test AVAX from faucet |
| "Contract not found" | Wrong address or network | Verify contract address and network |
| "Transaction failed" | Gas limit or execution error | Check parameters and retry |

## Security Considerations

### Smart Contract Security
- **SBT Non-Transferability**: Override transfer functions to prevent token sales
- **Ownership**: Only contract owner can mint SBTs
- **Fund Distribution**: Automatic split prevents fund misappropriation
- **Access Control**: Public functions limited, critical functions onlyOwner

### Frontend Security
- **No Private Keys**: Never store private keys in frontend
- **MetaMask Signing**: Always use MetaMask for transaction signing
- **Environment Variables**: Contract addresses stored in .env (public)
- **HTTPS Only**: Vercel enforces HTTPS

### Best Practices
- Test thoroughly on testnet before mainnet
- Audit contracts before mainnet deployment
- Implement rate limiting for transactions
- Monitor fund distributions
- Verify charity addresses with organizations

## Monitoring and Analytics

### On-Chain Monitoring

Track contract activity on Snowtrace:
1. Visit NFT contract on [testnet.snowtrace.io](https://testnet.snowtrace.io)
2. View:
   - Total transactions
   - Token holders
   - Transfer events
   - Mint events

### Event Logs

Contracts emit events for tracking:

```solidity
// HerPathNFT events
event NFTMinted(
  uint256 indexed tokenId,
  address indexed buyer,
  string leaderType,
  uint256 charityAmount,
  uint256 projectAmount
);

// HerPathSBT events
event SBTMinted(
  uint256 indexed tokenId,
  address indexed player,
  string indexed sbtId,
  string sbtName,
  string leaderType,
  uint256 level
);
```

### Frontend Analytics

Track user interactions:
```typescript
// Log when user attempts to purchase
console.log('NFT purchase initiated', {
  leader: leaderType,
  nftName,
  timestamp: Date.now()
});

// Log transaction result
console.log('NFT minted', {
  txHash,
  tokenId,
  buyer: userAddress
});
```

## Upgrading to Mainnet

When ready for production deployment:

1. **Deploy to Avalanche C-Chain** (mainnet)
   - Update Hardhat config for mainnet RPC
   - Increase private key security (hardware wallet)
   - Update gas estimates

2. **Update Environment Variables**
   ```env
   NEXT_PUBLIC_NETWORK_ID=43114  # Mainnet
   NEXT_PUBLIC_RPC_URL=https://api.avax.network/ext/bc/C/rpc
   ```

3. **Real Charity Addresses**
   - Update with verified charity wallet addresses
   - Coordinate with organizations
   - Set up fund withdrawal process

4. **Marketing & Launch**
   - Announce Web3 integration
   - Clarify charity partnerships
   - Provide transaction transparency

## References

- [Hardhat Documentation](https://hardhat.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Avalanche Documentation](https://docs.avax.network/)
- [ethers.js Documentation](https://docs.ethers.org/)
- [MetaMask Provider API](https://docs.metamask.io/guide/rpc-api.html)
