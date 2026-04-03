# HerPath Deployment Guide

This guide will walk you through deploying HerPath to the Avalanche Fuji testnet and Vercel.

## Prerequisites

- Node.js 16+ installed
- MetaMask wallet extension installed
- Git account for version control
- Avalanche Fuji testnet AVAX for deployment (get from [faucet.avax.network](https://faucet.avax.network))

## Part 1: Smart Contract Deployment to Avalanche Fuji

### 1.1 Setup Contract Environment

```bash
cd herpath/contracts
npm install
cp .env.example .env.local
```

### 1.2 Configure Environment Variables

Edit `herpath/contracts/.env.local`:

```env
# Your private key (WITHOUT 0x prefix)
PRIVATE_KEY=your_private_key_here

# Avalanche Fuji RPC (default is public)
AVALANCHE_FUJI_RPC=https://api.avax-test.network/ext/bc/C/rpc

# Optional: SnowTrace API key for verification
SNOWTRACE_API_KEY=your_snowtrace_api_key_here
```

### 1.3 Get Test AVAX

1. Go to [faucet.avax.network](https://faucet.avax.network)
2. Connect with your MetaMask wallet
3. Request test AVAX (you'll receive 2 AVAX for deployment)

### 1.4 Deploy Contracts

```bash
npm run compile
npm run deploy:fuji
```

The deployment script will:
- Compile the smart contracts
- Deploy HerPathNFT contract
- Deploy HerPathSBT contract
- Save contract addresses to `contracts/deployments/fuji-addresses.json`
- Generate `../.env.local` with contract addresses

**Save the output contract addresses** - you'll need these for the frontend.

### 1.5 Verify Contracts (Optional)

Visit [testnet.snowtrace.io](https://testnet.snowtrace.io) to verify your contracts are deployed:

1. Search for your contract address
2. Copy the bytecode and verify on Snowtrace (or use `npm run verify`)

## Part 2: Frontend Configuration

### 2.1 Install Frontend Dependencies

```bash
cd ../
npm install
```

The deployment script should have already created `.env.local` with contract addresses.

### 2.2 Verify Environment Variables

Check that `herpath/.env.local` contains:

```env
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_SBT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_NETWORK_ID=43113
NEXT_PUBLIC_NETWORK_NAME=Avalanche Fuji
NEXT_PUBLIC_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
```

### 2.3 Test Locally

```bash
npm run dev
```

Navigate to `http://localhost:3000`:
1. Click "新游戏" (New Game)
2. Complete the flashback quiz
3. Play through the domain game
4. Try to purchase an NFT
5. You should be prompted to connect MetaMask and approve the transaction

## Part 3: Deploy to Vercel

### 3.1 Push to GitHub

```bash
cd /Users/jliu/code/herstory/herpath/WWW6.5-Hackathon
git add .
git commit -m "Add smart contracts and Web3 integration"
git push origin dev_2
```

### 3.2 Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Select the `herpath-WWW6.5-Hackathon` repository
5. Configure project:
   - **Root Directory**: `herpath`
   - **Framework**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3.3 Set Environment Variables in Vercel

In Vercel project settings → Environment Variables:

```
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS = 0x...
NEXT_PUBLIC_SBT_CONTRACT_ADDRESS = 0x...
NEXT_PUBLIC_NETWORK_ID = 43113
NEXT_PUBLIC_NETWORK_NAME = Avalanche Fuji
NEXT_PUBLIC_RPC_URL = https://api.avax-test.network/ext/bc/C/rpc
```

### 3.4 Deploy

Click "Deploy" button in Vercel. Your app will be live at `https://your-project.vercel.app`

## Part 4: Update Charity Wallet Addresses (Important!)

The deployed contracts have placeholder charity wallet addresses. You need to update these:

### 4.1 Update Charity Wallets

Use the following script to update charity wallet addresses:

```bash
# In herpath/contracts directory
npx hardhat run scripts/updateCharities.js --network fuji
```

Or manually call the contract:

```javascript
// Using ethers.js
const nftContract = await ethers.getContractAt("HerPathNFT", NFT_ADDRESS);

// For RBG charities
await nftContract.addCharityWallet(
  "rbg",
  "0xRBG_LEGAL_AID_WALLET",
  "NAACP Legal Defense Fund",
  "legal_aid"
);

await nftContract.addCharityWallet(
  "rbg",
  "0xRBG_EDUCATION_WALLET",
  "Women's Fund",
  "education"
);

// For Hillary charities
await nftContract.addCharityWallet(
  "hillary",
  "0xHILLARY_HEALTH_WALLET",
  "Clinton Foundation",
  "health"
);

await nftContract.addCharityWallet(
  "hillary",
  "0xHILLARY_EDUCATION_WALLET",
  "Girls Up",
  "education"
);
```

## Part 5: Testing on Testnet

### 5.1 Test NFT Purchase

1. Open your deployed app on Vercel
2. Complete a game session
3. Try to purchase an NFT from the shop
4. MetaMask will prompt you to confirm the transaction
5. You'll receive:
   - The NFT on your wallet
   - 90% of AVAX sent to charity address
   - 10% of AVAX sent to project wallet

### 5.2 Test SBT Minting

SBTs are minted automatically when you reach milestones. To verify:

1. Check your wallet on [testnet.snowtrace.io](https://testnet.snowtrace.io)
2. Search for the SBT contract address
3. View the "Token Holders" tab to see SBT distribution

## Troubleshooting

### MetaMask won't connect

1. Ensure Avalanche Fuji is added to MetaMask
2. Click the network dropdown → Add Network
3. Enter:
   - Network Name: Avalanche Fuji Testnet
   - RPC URL: https://api.avax-test.network/ext/bc/C/rpc
   - Chain ID: 43113
   - Currency Symbol: AVAX
   - Block Explorer: https://testnet.snowtrace.io

### Transaction fails with "Insufficient funds"

- Get more test AVAX from [faucet.avax.network](https://faucet.avax.network)
- Each NFT purchase requires 0.01 AVAX + gas fees (~$0.01 equivalent)

### Contract not found at address

- Verify the contract address is correct in `.env.local`
- Check [testnet.snowtrace.io](https://testnet.snowtrace.io) to confirm deployment
- Ensure you're on Fuji testnet (chainId 43113)

### Charity distribution not working

- Update charity wallet addresses (see Part 4)
- Ensure charity wallets are valid Avalanche addresses
- Check transaction logs on Snowtrace to verify fund transfers

## Next Steps

1. **Mainnet Deployment** (When ready for production):
   - Deploy contracts to Avalanche C-Chain
   - Update RPC endpoints and network IDs
   - Deploy frontend to production Vercel

2. **Enhanced Features**:
   - Add admin dashboard for charity management
   - Implement withdrawal system for charities
   - Add more NFTs and milestones
   - Create marketplace for trading (if SBTs become transferable)

3. **Security**:
   - Audit contracts on Certora or other services
   - Implement rate limiting on frontend
   - Add security headers to Vercel deployment
