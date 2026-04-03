# HerPath Quick Start Guide

Get HerPath running locally and deployed to Avalanche Fuji in 5 steps.

## 1. Local Development (5 minutes)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:3000 and test the game locally (no blockchain required).

## 2. Deploy Smart Contracts to Fuji (10 minutes)

```bash
# Get test AVAX first:
# → Visit https://faucet.avax.network
# → Connect MetaMask wallet
# → Request 2 AVAX

# Then deploy contracts:
cd contracts
npm install
cp .env.example .env.local
# Edit .env.local and add your private key

npm run deploy:fuji
```

The deployment will output your contract addresses and automatically create `../.env.local`.

## 3. Test NFT Purchasing Locally (5 minutes)

```bash
# Back in root directory
npm run dev
```

1. Go to http://localhost:3000
2. Complete a game session
3. Try to purchase an NFT
4. MetaMask will prompt you to confirm the transaction
5. Transaction will execute on Fuji testnet

## 4. Deploy Frontend to Vercel (5 minutes)

```bash
# Push to GitHub
git add .
git commit -m "Deploy HerPath with Web3 contracts"
git push origin dev_2
```

Then:
1. Go to https://vercel.com
2. Click "Add New Project"
3. Select the repository
4. Set Root Directory to `herpath`
5. In Environment Variables, add:
   ```
   NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=[from deployment]
   NEXT_PUBLIC_SBT_CONTRACT_ADDRESS=[from deployment]
   NEXT_PUBLIC_NETWORK_ID=43113
   NEXT_PUBLIC_NETWORK_NAME=Avalanche Fuji
   NEXT_PUBLIC_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
   ```
6. Click Deploy

## 5. Test on Production Vercel URL (5 minutes)

1. Go to your Vercel deployment URL
2. MetaMask will automatically detect Fuji network
3. Play the game and purchase NFTs from production

---

## Full Guide

For detailed setup, troubleshooting, and advanced configuration, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Common Commands

```bash
# Development
npm run dev          # Start dev server

# Smart Contracts
cd contracts
npm run compile      # Compile Solidity
npm run deploy:fuji  # Deploy to testnet
npm run test         # Run tests

# Frontend
npm run build        # Build for production
npm start            # Start production server
```

## Verify on Fuji Testnet

After deployment, verify your contracts are working:

1. Open https://testnet.snowtrace.io
2. Search for your NFT contract address
3. You should see:
   - Contract name: HerPathNFT
   - Recent transactions from your deployment
   - Charity distribution transfers

## Need Help?

- **MetaMask not connecting?** → See "Troubleshooting" in DEPLOYMENT.md
- **Contract not found?** → Check contract address in .env.local
- **Not enough test AVAX?** → Get more from faucet.avax.network
- **Transaction failed?** → Check gas limits or network status
