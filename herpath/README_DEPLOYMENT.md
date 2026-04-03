# HerPath - Web3 Deployment Setup

HerPath is now fully configured for deployment to Avalanche Fuji testnet and Vercel.

## What's Been Set Up

### Smart Contracts (Solidity)

**Location**: `herpath/contracts/`

1. **HerPathNFT.sol**
   - ERC721 standard compliant
   - Mint collectible NFTs at 0.01 AVAX each
   - Automatic 90%/10% distribution to charity and project wallets
   - Support for multiple leaders (RBG, Hillary)

2. **HerPathSBT.sol**
   - Non-transferable achievement tokens
   - Mint SBTs for milestone milestones
   - Per-player achievement tracking
   - Full narrative metadata storage

### Deployment Configuration

**Location**: `herpath/contracts/`

- `hardhat.config.js` - Network configuration for Fuji testnet
- `package.json` - Dependencies and scripts
- `.env.example` - Template for environment variables
- `scripts/deploy.js` - Automated deployment script
- `scripts/updateCharities.js` - Charity wallet management

### Frontend Integration

**Location**: `herpath/src/`

- `hooks/useWeb3.ts` - React hook for wallet connection and NFT minting
  - Connects MetaMask wallet
  - Switches to Fuji network automatically
  - Signs and sends transactions
  - Handles errors gracefully

### Documentation

- **QUICK_START.md** - Fast 5-step setup guide
- **DEPLOYMENT.md** - Comprehensive deployment instructions
- **DEPLOYMENT_CHECKLIST.md** - Step-by-step checklist with milestones
- **WEB3_INTEGRATION.md** - Technical integration details
- **CHARITY_ADDRESSES.md** - Charity configuration guide
- **contracts/README.md** - Contract-specific documentation

## Files Added/Modified

### New Files

```
herpath/
├── contracts/
│   ├── package.json
│   ├── hardhat.config.js
│   ├── .env.example
│   ├── contracts/
│   │   ├── HerPathNFT.sol
│   │   └── HerPathSBT.sol
│   ├── scripts/
│   │   ├── deploy.js
│   │   └── updateCharities.js
│   ├── deployments/
│   │   ├── fuji-addresses.json (created after deploy)
│   │   └── abi/
│   │       ├── HerPathNFT.json
│   │       └── HerPathSBT.json
│   └── README.md
├── src/
│   └── hooks/
│       └── useWeb3.ts
├── .env.local.example
├── QUICK_START.md
├── DEPLOYMENT.md
├── DEPLOYMENT_CHECKLIST.md
├── WEB3_INTEGRATION.md
└── CHARITY_ADDRESSES.md
```

### Modified Files

- `package.json` - Added `ethers` dependency for Web3 integration

## How to Deploy

### Option 1: Quick Start (5 minutes)

For experienced developers:

```bash
# Get test AVAX from faucet.avax.network

cd herpath/contracts
npm install
cp .env.example .env.local
# Edit .env.local with your private key
npm run deploy:fuji

# Back in root
npm install
npm run dev
# Test at http://localhost:3000
```

### Option 2: Detailed Guide (10 minutes)

Follow the step-by-step instructions in [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

### Option 3: Vercel Deployment (15 minutes)

1. Deploy contracts to Fuji (see above)
2. Push to GitHub: `git push origin dev_2`
3. Connect to Vercel
4. Add environment variables
5. Deploy

See [DEPLOYMENT.md](./DEPLOYMENT.md#part-3-deploy-to-vercel) for detailed steps.

## Key Information

### Test Network (Fuji)
- **Chain ID**: 43113
- **RPC URL**: https://api.avax-test.network/ext/bc/C/rpc
- **Currency**: Test AVAX (free from faucet)
- **Explorer**: https://testnet.snowtrace.io

### Required Tools
- MetaMask wallet (browser extension)
- Node.js 16+ with npm
- Hardhat (installed with contracts)
- Vercel account (free tier)

### Test AVAX Faucet
https://faucet.avax.network

### What You Get After Deployment
1. Smart contracts on Avalanche Fuji testnet
2. Contract addresses to use in frontend
3. Frontend deployed to Vercel
4. Working NFT purchase system
5. Automated charity fund distribution

## Architecture Overview

```
Frontend (Vercel)
    ↓ (MetaMask)
    ↓ (ethers.js)
    ↓
Avalanche Fuji Testnet
    ├─ HerPathNFT Contract
    │  ├─ Mint NFTs
    │  └─ Distribute Funds (90% charity, 10% project)
    └─ HerPathSBT Contract
       ├─ Mint Achievement Tokens
       └─ Track Milestones
    ↓
    Charity Wallets (receive 90% of funds)
    Project Wallet (receive 10% of funds)
```

## What Each Component Does

### Game Flow (No Blockchain)
- Start menu with new/continue/exit
- Flashback quiz to select leader (RBG or Hillary)
- Domain gameplay with card selections
- Attribute progression system
- Milestone system (3/6/9/12/15 levels)

### Web3 Integration
- **NFT Purchase**: 0.01 AVAX → HerPathNFT contract
- **Fund Distribution**: Automatic 90%/10% split
- **SBT Minting**: Admin mints achievement tokens
- **Wallet Connection**: MetaMask integration
- **Network Switching**: Auto-detect or switch to Fuji

### Charity System
- Configurable charity wallet addresses per leader
- Automatic fund distribution on NFT purchase
- Transparency via block explorer
- Real-time impact statistics

## Next Steps After Deployment

### Immediate (Day 1)
1. ✓ Deploy contracts to Fuji
2. ✓ Deploy frontend to Vercel
3. Test NFT purchase end-to-end
4. Verify funds go to charity wallets

### Short Term (Week 1)
1. Update charity wallet addresses with real organizations
2. Test with real funds (small amounts)
3. Share deployed URL with team
4. Gather feedback

### Medium Term (Month 1)
1. Set up admin dashboard for SBT management
2. Implement withdrawal system for charities
3. Add more NFT designs
4. Monitor fund distributions

### Long Term (Production)
1. Audit contracts for security
2. Deploy to Avalanche mainnet
3. Launch public campaign
4. Onboard charity partners

## Troubleshooting

### Deployment Fails
- Check private key format (no `0x` prefix)
- Ensure enough test AVAX for gas
- Verify `hardhat.config.js` has correct RPC URL

### Frontend Won't Connect to Blockchain
- Check contract addresses in `.env.local`
- Verify MetaMask is on Fuji network
- Clear browser cache

### Transactions Rejected
- Not enough gas money? Get more test AVAX
- Wrong network? Switch to Fuji (43113)
- Contract not found? Verify address is correct

See [DEPLOYMENT.md Troubleshooting](./DEPLOYMENT.md#troubleshooting) for more help.

## Support & Resources

### Documentation
- [QUICK_START.md](./QUICK_START.md) - Fast setup
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Full guide
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Detailed checklist
- [WEB3_INTEGRATION.md](./WEB3_INTEGRATION.md) - Technical details

### External Resources
- [Avalanche Documentation](https://docs.avax.network/)
- [Hardhat Docs](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [ethers.js Docs](https://docs.ethers.org/)
- [MetaMask API](https://docs.metamask.io/)

## Summary

HerPath is now ready for Web3 deployment! The complete setup includes:

✓ Smart contracts (HerPathNFT + HerPathSBT)
✓ Deployment scripts (Hardhat)
✓ Frontend Web3 integration (useWeb3 hook)
✓ Configuration templates (.env files)
✓ Comprehensive documentation
✓ Step-by-step deployment guides
✓ Troubleshooting resources

You can now:
1. Deploy contracts to Avalanche Fuji
2. Test locally with MetaMask
3. Deploy frontend to Vercel
4. Launch your Web3 game!

For detailed instructions, see [QUICK_START.md](./QUICK_START.md) or [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md).
