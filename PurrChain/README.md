# PurrChain 🐱✨

<div align="center">
  <img src="./Favicon.ico" alt="PurrChain Logo" width="100">
  <br>
  <strong>Decentralized Cat Adoption Platform</strong>
  <br>
  Built on Avalanche C-Chain (Fuji Testnet)
</div>

---

Users support real animal shelters through **on-chain donations**, receive **dynamically evolving NFTs**, and raise virtual cats in an **idle placement game**.  
All funds are 100% transparent and traceable — donations go directly to shelter wallets, with the platform handling zero funds.

> **Every cat’s future, written on the blockchain.** 🐾

---

## 🚀 Try It Now

- **Testnet Demo**：[PurrChain Demo](https://purrchain.vercel.app/)
- **View All Contracts**：[Snowtrace Testnet Explorer](https://testnet.snowtrace.io) (search the contract addresses below)
- **Get Test AVAX**：[Avalanche Fuji Faucet](https://build.avax.network/console/primary-network/faucet)

**This is the Fuji Testnet version.** All operations use test tokens for full functionality.

---

## ✨ Key Features

- **Real Rescue + On-Chain Transparency**: Every donation goes directly to shelters and is visible on-chain in real time
- **Dynamically Evolving NFTs**: One real cat = 4 growth stages (Kitten → Junior → Adult → Genesis)
- **Idle Placement Game**: Stamina system, hunting, item shop, gacha, and equipment slots
- **Dual Adoption System**:
  - Cloud Adoption (donation unlocks growth NFTs)
  - Real Adoption (deposit + shelter visit → Genesis NFT)
- **$PURR Token**: In-game spending, welcome rewards, and burn-for-tokens
- **Fully Decentralized**: No platform custody — everything runs on smart contracts

---

## 📸 NFT Types

| Type             | How to Obtain                  | Purpose                          |
|------------------|--------------------------------|----------------------------------|
| **FamilyPortrait** | Free claim (once per address) | Onboarding pass + seasonal art  |
| **StarterCat**   | Free claim + choose real cat   | Starter cat that can grow       |
| **CloudAdopted** | Auto-mint after 0.1 AVAX donated | Cloud adoption growth NFT (3 stages) |
| **Genesis**      | Minted after successful real adoption visit | Real adoption exclusive NFT |
| **Collection**   | Chance drop from hunts         | Collectibles (Play / Companion / Sleep) |

---

## 🐱 Core Gameplay Flow

1. **New User Onboarding** → Free Family Portrait NFT + 20 $PURR + one starter cat
2. **Cloud Adoption** → Donate to support a real cat → Auto-receive growth NFT
3. **Daily Game Loop** → Hunt (idle) → Bring back fragments & Collection NFTs → Gacha & equip items
4. **Real Adoption** → Apply + pay deposit → Shelter visit passes → Receive Genesis NFT + refund

---

## 📦 Deployed Contracts (Fuji Testnet)

| Contract           | Address                                             | Snowtrace Link |
|--------------------|-----------------------------------------------------|----------------|
| CatRegistry        | `0x00eeC3763FAaA03A8d758C87E623Fb30318198bf`        | [View](https://testnet.snowtrace.io/address/0x00eeC3763FAaA03A8d758C87E623Fb30318198bf) |
| CatNFT             | `0xe0C9746BE2f5b09B130f21677E396Ced226372d9`        | [View](https://testnet.snowtrace.io/address/0xe0C9746BE2f5b09B130f21677E396Ced226372d9) |
| PurrToken          | `0xE9F6089908CC054dF4095f227566F0b3696279B1`        | [View](https://testnet.snowtrace.io/address/0xE9F6089908CC054dF4095f227566F0b3696279B1) |
| DonationVault      | `0x809FDA8D72823E6781A9aCbfCb7eb2193B2b2E7f`        | [View](https://testnet.snowtrace.io/address/0x809FDA8D72823E6781A9aCbfCb7eb2193B2b2E7f) |
| AdoptionVault      | `0x42b4E7784Daed2Ef06d9fC14D89Ee1d76454d08C`        | [View](https://testnet.snowtrace.io/address/0x42b4E7784Daed2Ef06d9fC14D89Ee1d76454d08C) |
| EquipmentNFT       | `0xE909bEe5bf2675967D720D586Dc749460163B149`        | [View](https://testnet.snowtrace.io/address/0xE909bEe5bf2675967D720D586Dc749460163B149) |
| GameContract       | `0x5A7425Cd5a5A7Febe1E1AcA81b4B5285005750F0`        | [View](https://testnet.snowtrace.io/address/0x5A7425Cd5a5A7Febe1E1AcA81b4B5285005750F0) |

---

## 🛠 Tech Stack

- **Blockchain**: Avalanche C-Chain (Fuji Testnet)
- **Smart Contracts**: Solidity ^0.8.20 + OpenZeppelin
- **NFT / Token**: ERC-721 + ERC-20
- **Storage**: IPFS (Pinata)
- **Dev Tools**: Hardhat + ethers.js

---

## 📄 More Documentation

- [Contract Source Code](./contracts)

---

## ⚠️ Important Notes

- This project is currently in **testnet stage** — all data and assets are for testing only
- Mainnet launch will support real AVAX donations
- Feel free to open Issues or PRs to help improve the real adoption flow!

---

**Love the project?**  
Give it a **Star ⭐** to show your support!  
Have questions or want to contribute? Just leave a message in Issues.

**PurrChain —— Because every cat deserves to be remembered forever.** 🐾✨
