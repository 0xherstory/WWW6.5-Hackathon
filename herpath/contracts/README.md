# HerPath Smart Contracts

This directory contains the smart contracts for HerPath, a Web3-based female-leader narrative game on Avalanche Fuji testnet.

## Contracts

### HerPathNFT.sol

ERC721 contract for HerPath collectible NFTs with automatic charity distribution.

**Features:**
- Mint NFTs for leaders (Ruth Bader Ginsburg / Hillary Clinton)
- Automatic 90% charity / 10% project fund distribution
- Multiple charity wallet support per leader
- Metadata tracking for each NFT

**Key Functions:**
```solidity
// Mint an NFT (costs 0.01 AVAX)
function mintNFT(
  address to,
  string memory leaderType,
  string memory nftName,
  string memory description
) public payable returns (uint256)

// Add charity wallet for fund distribution
function addCharityWallet(
  string memory leaderType,
  address charityWallet,
  string memory charityName,
  string memory charityType
) public onlyOwner

// Get NFT metadata
function getNFTMetadata(uint256 tokenId) public view returns (NFTMetadata memory)
```

### HerPathSBT.sol

Soulbound Token (SBT) contract for milestone achievements.

**Features:**
- Non-transferable achievement tokens (true SBTs)
- Player-specific milestone tracking
- Multiple branches and levels per leader
- Detailed narrative and flavor text per SBT

**Key Functions:**
```solidity
// Mint an SBT (admin only)
function mintSBT(
  address player,
  string memory sbtId,
  string memory sbtName,
  string memory sbtIcon,
  string memory leaderType,
  string memory branchName,
  uint256 level,
  string memory situation,
  string memory flavor
) public onlyOwner returns (uint256)

// Check if player has an SBT
function hasSBT(address player, string memory sbtId) public view returns (bool)

// Get player's total SBT count
function getPlayerSBTCount(address player) public view returns (uint256)

// Revoke an SBT (for error recovery)
function revokeSBT(uint256 tokenId) public onlyOwner
```

## Setup

### Install Dependencies

```bash
npm install
```

### Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
PRIVATE_KEY=your_private_key_without_0x
AVALANCHE_FUJI_RPC=https://api.avax-test.network/ext/bc/C/rpc
```

### Compile

```bash
npm run compile
```

## Deployment

### Deploy to Avalanche Fuji Testnet

```bash
npm run deploy:fuji
```

This will:
1. Deploy both contracts
2. Save addresses to `deployments/fuji-addresses.json`
3. Save ABIs to `deployments/abi/`
4. Generate `../.env.local` for frontend

### Verify on Snowtrace (Optional)

```bash
npm run verify HerPathNFT 0x... -- --network fuji
npm run verify HerPathSBT 0x... -- --network fuji
```

Or visit [testnet.snowtrace.io](https://testnet.snowtrace.io) to verify manually.

## Testing

### Local Hardhat Tests

```bash
npx hardhat test
```

### Test on Fuji Testnet

1. Get test AVAX from [faucet.avax.network](https://faucet.avax.network)
2. Update charity wallet addresses in the deployed contract
3. Test NFT minting via the frontend

## Contract Addresses

After deployment, contract addresses are saved in `deployments/fuji-addresses.json`:

```json
{
  "nft": "0x...",
  "sbt": "0x...",
  "deployer": "0x...",
  "network": "fuji",
  "deployedAt": "2024-..."
}
```

## Architecture

### Fund Distribution Flow

```
Player Purchase (0.01 AVAX)
    ↓
HerPathNFT.mintNFT()
    ├─ Mint ERC721 token to player
    ├─ Calculate charity share: 90% = 0.009 AVAX
    ├─ Calculate project share: 10% = 0.001 AVAX
    ├─ Send to charity wallet
    ├─ Send to project wallet
    └─ Emit NFTMinted event
```

### Milestone System

```
Player Reaches Threshold
    ↓
Frontend detects milestone
    ├─ Shows milestone narrative modal
    └─ Player clicks "铸造勋章" (Mint SBT)
    ↓
Frontend calls Backend / Admin Panel
    ↓
Admin calls HerPathSBT.mintSBT()
    ├─ Mint SBT to player address
    ├─ Record in playerSBTs mapping
    └─ Emit SBTMinted event
```

## Key Addresses to Configure

### For RBG Leader
- Legal Aid Charity: (Update with real address)
- Women's Education Fund: (Update with real address)

### For Hillary Leader
- Clinton Foundation: (Update with real address)
- Girls Up (Education): (Update with real address)

### Project Wallet
- Initially uses deployer address
- Can be updated via `setProjectWallet()`

## Security Considerations

1. **SBT Non-Transferability**: Transfer functions are overridden to prevent token sales
2. **Ownership**: Only contract owner can mint SBTs and update charities
3. **Fund Distribution**: Automatic 90/10 split prevents misappropriation
4. **Gas Limits**: Functions set reasonable gas estimates for Fuji network

## Integration with Frontend

The frontend uses the contract addresses from environment variables:

```env
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_SBT_CONTRACT_ADDRESS=0x...
```

When a player purchases an NFT:
1. Frontend calls `HerPathNFT.mintNFT()` via Web3 (ethers.js)
2. MetaMask prompts user to confirm transaction
3. 0.01 AVAX is transferred from player to contract
4. Funds are automatically distributed to charities (90%) and project (10%)
5. NFT is minted to player's wallet
6. Frontend displays confirmation and charity impact

## Support

For issues or questions:
1. Check [Avalanche docs](https://docs.avax.network/)
2. Review [OpenZeppelin contracts](https://docs.openzeppelin.com/contracts/)
3. Check [Hardhat documentation](https://hardhat.org/docs)
