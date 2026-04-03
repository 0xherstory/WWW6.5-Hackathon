# HerPath Charity Wallet Configuration

After deploying smart contracts, you need to configure the actual charity wallet addresses for fund distribution.

## Current Configuration (Placeholders)

The deployed HerPathNFT contract currently has placeholder addresses. Replace these with real charitable organization wallets.

### RBG Leader Charities

**Branch 1: 法理精神 (Legal Spirit)**
- Organization: NAACP Legal Defense Fund
- Placeholder Address: `0x1234567890123456789012345678901234567890`
- Real Address: *(Get from organization)*
- Purpose: Fund legal aid and civil rights work
- Share: 45% of 90% charity funds

**Branch 2: 平权意识 (Equality Awareness)**
- Organization: Women's Fund
- Placeholder Address: `0x0987654321098765432109876543210987654321`
- Real Address: *(Get from organization)*
- Purpose: Support women's education and leadership
- Share: 45% of 90% charity funds

### Hillary Leader Charities

**Branch 1: 影响力 (Impact)**
- Organization: Clinton Foundation
- Placeholder Address: `0xabcdefabcdefabcdefabcdefabcdefabcdefabcd`
- Real Address: *(Get from organization)*
- Purpose: Global health and empowerment
- Share: 45% of 90% charity funds

**Branch 2: 韧性 (Resilience)**
- Organization: Girls Up
- Placeholder Address: `0xfedcbafedcbafedcbafedcbafedcbafedcbafedcb`
- Real Address: *(Get from organization)*
- Purpose: Support girls' education and leadership
- Share: 45% of 90% charity funds

## How to Update Charity Addresses

### Option 1: Using Update Script (Recommended)

1. Edit `contracts/scripts/updateCharities.js`:

```javascript
const CHARITIES = {
  rbg: [
    {
      address: "0x1111111111111111111111111111111111111111", // ← Update here
      name: "NAACP Legal Defense Fund",
      type: "legal_aid",
    },
    // ... more charities
  ],
  // ...
};
```

2. Run the update script:

```bash
cd contracts
npx hardhat run scripts/updateCharities.js --network fuji
```

### Option 2: Manual Web3 Call

Using ethers.js directly:

```javascript
import { ethers } from 'ethers';

const nftContractAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;
const nftABI = require('./contracts/deployments/abi/HerPathNFT.json');

const provider = new ethers.JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc');
const signer = provider.getSigner(); // Must be contract owner

const nftContract = new ethers.Contract(nftContractAddress, nftABI, signer);

// Update RBG charities
await nftContract.addCharityWallet(
  "rbg",
  "0x1111111111111111111111111111111111111111", // Real address
  "NAACP Legal Defense Fund",
  "legal_aid"
);

await nftContract.addCharityWallet(
  "rbg",
  "0x2222222222222222222222222222222222222222", // Real address
  "Women's Fund",
  "education"
);

// Update Hillary charities
await nftContract.addCharityWallet(
  "hillary",
  "0x3333333333333333333333333333333333333333", // Real address
  "Clinton Foundation",
  "health"
);

await nftContract.addCharityWallet(
  "hillary",
  "0x4444444444444444444444444444444444444444", // Real address
  "Girls Up",
  "education"
);
```

### Option 3: Block Explorer Interface

1. Go to [testnet.snowtrace.io](https://testnet.snowtrace.io)
2. Search for your NFT contract address
3. Click "Contract" tab
4. Click "Write Contract" (after connecting wallet)
5. Find `addCharityWallet` function
6. Fill in parameters:
   - `leaderType`: "rbg" or "hillary"
   - `charityWallet`: Real wallet address
   - `charityName`: Organization name
   - `charityType`: Category (legal_aid, education, health, etc.)
7. Click "Write"
8. Confirm in MetaMask

## Fund Distribution Logic

When a player purchases an NFT (0.01 AVAX):

```
0.01 AVAX = 10,000,000,000,000,000 Wei

Charity Funds (90%)  = 0.009 AVAX
├─ Goes to one charity wallet per transaction
└─ Current: uses first charity found (can be improved to distribute to both)

Project Funds (10%)  = 0.001 AVAX
└─ Goes to project wallet for operations
```

## Real-World Charities

### For Ruth Bader Ginsburg Branch

**NAACP Legal Defense Fund**
- Website: www.naacpldf.org
- Purpose: Civil rights litigation
- Donation Address: (Contact organization for blockchain wallet)
- Ethereum Address Example: 0x... (to be updated)

**Women's Fund**
- Website: www.womensfund.org
- Purpose: Women's education and leadership
- Donation Address: (Contact organization for blockchain wallet)
- Ethereum Address Example: 0x... (to be updated)

### For Hillary Clinton Branch

**Clinton Foundation**
- Website: www.clintonfoundation.org
- Purpose: Global health and empowerment
- Donation Address: (Contact organization for blockchain wallet)
- Ethereum Address Example: 0x... (to be updated)

**Girls Up (Camp Rising Sun)**
- Website: www.girlsup.org
- Purpose: Girls' education and leadership
- Donation Address: (Contact organization for blockchain wallet)
- Ethereum Address Example: 0x... (to be updated)

## Getting Real Charity Addresses

1. **Contact the organization directly**
   - Email their development/donations team
   - Ask for their Avalanche/Ethereum wallet address
   - Verify address through official channels

2. **Check official websites**
   - Some organizations list crypto donation addresses on their site
   - Look for "Donate with Crypto" pages

3. **Use Verification Services**
   - GiveWell, Charity Navigator, or similar services
   - May have verified cryptocurrency addresses

4. **Create Dedicated Wallets**
   - Generate new Avalanche addresses specifically for each charity
   - Ensure organization controls the private key
   - Document setup process with organization

## Important Notes

1. **Double-check addresses**: Typos will cause funds to go to wrong wallet
2. **Test first**: Run on testnet before mainnet deployment
3. **Verify with organization**: Confirm wallet address with charity leadership
4. **Keep records**: Document all wallet address changes and dates
5. **Update documentation**: Keep this file updated with real addresses

## Monitoring Charity Distributions

After updating addresses, you can monitor fund distributions:

1. **View NFT transfers**: https://testnet.snowtrace.io
   - Search for NFT contract
   - View token transfer events

2. **Track fund distribution**: 
   - Check charity wallet addresses on Snowtrace
   - Verify incoming transactions from contract

3. **Verify totals**:
   - HerPathNFT contract tracks `totalCharityDistributed`
   - Query via `ethers.js` or block explorer

Example query:

```javascript
const nftContract = new ethers.Contract(nftAddress, nftABI, provider);
const totalDistributed = await nftContract.totalCharityDistributed();
console.log("Total donated to charities:", ethers.formatEther(totalDistributed), "AVAX");
```

## Updating for Production (Mainnet)

When deploying to Avalanche C-Chain mainnet:

1. Get real charity addresses verified with organizations
2. Deploy new contracts with mainnet configuration
3. Update `.env.local` with mainnet contract addresses
4. Test thoroughly on testnet first
5. Deploy frontend with mainnet addresses
6. Announce real fundraising campaign
