# HerPath Deployment Checklist

Use this checklist to track your deployment progress.

## Prerequisites ✓

- [ ] Node.js 16+ installed (`node --version`)
- [ ] npm or yarn installed
- [ ] Git installed and configured
- [ ] MetaMask wallet extension installed
- [ ] GitHub account with repo access
- [ ] Vercel account (free tier works)

## Phase 1: Smart Contract Setup (10-15 minutes)

- [ ] Navigate to `herpath/contracts` directory
- [ ] Run `npm install` to install Hardhat and dependencies
- [ ] Copy `.env.example` to `.env.local`
- [ ] Edit `.env.local`:
  - [ ] Add your private key (without `0x` prefix)
  - [ ] (Optional) Add SnowTrace API key
- [ ] Run `npm run compile` to ensure contracts compile without errors
- [ ] Save the output - should show 2 contracts compiled successfully

## Phase 2: Get Test AVAX (5 minutes)

- [ ] Go to https://faucet.avax.network
- [ ] Connect MetaMask wallet
- [ ] Select Avalanche Fuji Testnet
- [ ] Request test AVAX (you'll get 2 AVAX)
- [ ] Wait for transaction to confirm (1-2 minutes)
- [ ] Verify AVAX appears in MetaMask balance

## Phase 3: Deploy Contracts to Fuji (5-10 minutes)

- [ ] In `herpath/contracts` directory, run: `npm run deploy:fuji`
- [ ] Wait for deployment to complete
- [ ] **SAVE THE OUTPUT** - copy these addresses:
  - [ ] HerPathNFT Address: `0x...`
  - [ ] HerPathSBT Address: `0x...`
- [ ] Verify `deployments/fuji-addresses.json` was created
- [ ] Check that `../.env.local` was generated with contract addresses

## Phase 4: Verify Contracts on Snowtrace (10 minutes)

- [ ] Go to https://testnet.snowtrace.io
- [ ] Search for your HerPathNFT contract address
- [ ] Verify it shows:
  - [ ] Contract name and symbol
  - [ ] Your deployment transaction
- [ ] Repeat for HerPathSBT contract address
- [ ] (Optional) Verify contracts on Snowtrace for code visibility

## Phase 5: Frontend Setup (5 minutes)

- [ ] Navigate back to `herpath` root directory
- [ ] Run `npm install` (if not already done)
- [ ] Verify `.env.local` exists with contract addresses:
  ```
  NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
  NEXT_PUBLIC_SBT_CONTRACT_ADDRESS=0x...
  NEXT_PUBLIC_NETWORK_ID=43113
  NEXT_PUBLIC_NETWORK_NAME=Avalanche Fuji
  NEXT_PUBLIC_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
  ```
- [ ] All values should be filled in

## Phase 6: Test Locally (10-15 minutes)

- [ ] Run `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Play through the game:
  - [ ] Click "新游戏" (New Game)
  - [ ] Complete flashback quiz (select a leader)
  - [ ] Play domain gameplay (draw 2-3 cards)
  - [ ] Navigate to NFT shop
- [ ] Test NFT purchase:
  - [ ] Click on an NFT
  - [ ] MetaMask should prompt for transaction
  - [ ] Approve the transaction
  - [ ] Wait for confirmation
  - [ ] Transaction should complete on Fuji
- [ ] Verify no console errors

## Phase 7: Prepare for Vercel Deployment (5 minutes)

- [ ] In root directory, run `npm run build`
- [ ] Verify build completes without errors
- [ ] Output should show:
  - [ ] `✓ Linting and type checking` completed
  - [ ] `.next` folder created
- [ ] Test production build locally:
  ```bash
  npm run build && npm start
  ```
- [ ] Open http://localhost:3000 and test basic gameplay

## Phase 8: Push to GitHub (5 minutes)

- [ ] Stage all changes:
  ```bash
  git add .
  ```
- [ ] Create commit:
  ```bash
  git commit -m "Add Avalanche Fuji smart contracts and Web3 integration"
  ```
- [ ] Push to your branch:
  ```bash
  git push origin dev_2
  ```
- [ ] Verify changes appear on GitHub

## Phase 9: Deploy to Vercel (10-15 minutes)

- [ ] Go to https://vercel.com
- [ ] Sign in with GitHub account
- [ ] Click "Add New..." → "Project"
- [ ] Find and select your repository
- [ ] Configure project:
  - [ ] Framework: **Next.js**
  - [ ] Root Directory: **herpath**
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `.next`
- [ ] Add Environment Variables:
  - [ ] Key: `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS`
    - Value: (from `.env.local`)
  - [ ] Key: `NEXT_PUBLIC_SBT_CONTRACT_ADDRESS`
    - Value: (from `.env.local`)
  - [ ] Key: `NEXT_PUBLIC_NETWORK_ID`
    - Value: `43113`
  - [ ] Key: `NEXT_PUBLIC_NETWORK_NAME`
    - Value: `Avalanche Fuji`
  - [ ] Key: `NEXT_PUBLIC_RPC_URL`
    - Value: `https://api.avax-test.network/ext/bc/C/rpc`
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete (2-5 minutes)
- [ ] **SAVE YOUR URL** - something like `https://herpath-xxx.vercel.app`

## Phase 10: Test Production Deployment (10 minutes)

- [ ] Open your Vercel URL in a new browser
- [ ] Verify the game loads
- [ ] Add MetaMask wallet to Fuji network (if not already added):
  - [ ] MetaMask should prompt automatically
  - [ ] Or manually: Settings → Networks → Add Network
    - [ ] Network Name: `Avalanche Fuji Testnet`
    - [ ] RPC URL: `https://api.avax-test.network/ext/bc/C/rpc`
    - [ ] Chain ID: `43113`
    - [ ] Currency: `AVAX`
    - [ ] Explorer: `https://testnet.snowtrace.io`
- [ ] Play through the game on production
- [ ] Test NFT purchase:
  - [ ] MetaMask should be on Fuji network
  - [ ] Purchase should work end-to-end
  - [ ] View transaction on Snowtrace

## Phase 11: Configure Real Charity Addresses (Optional but Recommended)

- [ ] Contact real charitable organizations:
  - [ ] NAACP Legal Defense Fund
  - [ ] Women's Fund
  - [ ] Clinton Foundation
  - [ ] Girls Up
- [ ] Request their Avalanche wallet addresses
- [ ] Update charity addresses in smart contract:
  - [ ] Option 1: Run `npm run updateCharities` in contracts directory
  - [ ] Option 2: Manually call via Snowtrace block explorer
  - [ ] Option 3: Update script and re-deploy (not recommended for testnet)
- [ ] Verify charity updates on block explorer

## Phase 12: Final Testing & Documentation

- [ ] Create a test NFT purchase and verify:
  - [ ] NFT appears in your wallet
  - [ ] Charity received funds (check Snowtrace)
  - [ ] Project received funds (check project wallet)
- [ ] Test SBT minting (if backend admin available):
  - [ ] Reach a milestone threshold
  - [ ] Mint SBT via admin dashboard
  - [ ] Verify SBT appears as non-transferable
- [ ] Document any issues or customizations made
- [ ] Share Vercel URL with team/stakeholders

## Troubleshooting

If you encounter issues, check these first:

### Deployment Issues
- [ ] Contracts didn't compile? Check Solidity version (0.8.20)
- [ ] Deployment failed? Check PRIVATE_KEY format (no 0x prefix)
- [ ] Not enough AVAX? Get more from faucet.avax.network

### Frontend Issues
- [ ] Build failed? Run `npm install` and try again
- [ ] Contract addresses not loaded? Check `.env.local` exists
- [ ] MetaMask not connecting? Check network is Fuji (43113)

### Transaction Issues
- [ ] Transaction rejected? Check you're on Fuji network
- [ ] "Insufficient funds"? Need gas money, get more test AVAX
- [ ] "Contract not found"? Verify contract address in `.env.local`

### After Deployment Issues
- [ ] Charity distribution not working? Update charity addresses (Phase 11)
- [ ] SBTs not minting? Verify admin has minting rights
- [ ] NFTs not showing in wallet? Check contract is ERC721 compliant

## Success Criteria

You've successfully deployed HerPath when:

- [x] Smart contracts deployed to Avalanche Fuji
- [x] Frontend deployed to Vercel
- [x] Game playable on production URL
- [x] NFT purchase works end-to-end
- [x] Charity funds distributed correctly
- [x] No console errors or unhandled rejections
- [x] MetaMask connects without issues
- [x] Transactions visible on Snowtrace

## Next Steps (After Successful Deployment)

### Short Term
- [ ] Share production URL with team
- [ ] Gather feedback on Web3 integration
- [ ] Fix any reported bugs
- [ ] Test on multiple browsers/devices

### Medium Term
- [ ] Update charity wallet addresses with real organizations
- [ ] Set up admin dashboard for SBT management
- [ ] Implement withdrawal system for charities
- [ ] Add more NFT designs and milestones

### Long Term
- [ ] Plan mainnet deployment strategy
- [ ] Audit contracts for production
- [ ] Set up monitoring and analytics
- [ ] Plan charity partnership announcements

## Resources

- [QUICK_START.md](./QUICK_START.md) - Fast setup guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment guide
- [CHARITY_ADDRESSES.md](./CHARITY_ADDRESSES.md) - Charity configuration
- [contracts/README.md](./contracts/README.md) - Contract documentation
- [Avalanche Docs](https://docs.avax.network/)
- [Vercel Docs](https://vercel.com/docs)
