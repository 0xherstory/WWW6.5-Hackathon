# Eternal Garden

> A Web3-native, women-friendly hospice & digital legacy community — **where every life blooms eternally**.

**中文说明:** [README.md](../README.md)

---

## What This Project Is

**Eternal Garden** is a Web3 community product for end-of-life care: it uses decentralized technology to help users **own their data**, connect spiritual support, practical help, and creative hospice-style services, so the end of life is not a lonely goodbye but a dignified, meaningful **bloom**.

**Core ideas:** user sovereignty over data, life stories preserved with integrity, mutual aid in the community.

---

## Problems We Address

- **Emotional & spiritual needs** — beyond pure medical or funeral workflows: unfulfilled wishes, listening, and companionship.  
- **Data silos & privacy** — medical records, last wishes, and stories scattered and hard to control; on-chain identity and encrypted / decentralized storage let users truly **hold** their information.  
- **Fragmented services** — wishes, archives, mutual aid, and post-life arrangements are split across providers; the product unifies them through modules such as **wish plaza**, **life-story archive**, and **mutual-aid board**.  
- **Isolation** — anonymous sharing circles, companion matching, and task claiming build a trustworthy support network.

**Why Web3:** on-chain attestations and smart contracts, IPFS/Arweave-style storage, DAO + token incentives for mutual aid, and privacy tech such as ZKPs — aligned with our product and technical roadmap in the business plan.

---

## Product Scope (Aligned with the Business Plan)

| Area | Features |
|------|-----------|
| **Community & emotional support** | Anonymous / pseudonymous sharing circles, life-story archive (narrative + access control concepts), companion matching |
| **Material & mutual aid** | Mutual-aid task board, wish publishing & claiming, token incentives (e.g. **BLOOM**) |
| **Signature flows** | **Wish list** — express and fulfill end-of-life wishes; moments can feed the life-story layer |
| **Digital legacy & afterlife** | Digital will, assets & beneficiary flows (demo + on-chain hooks), eco-burial / cloud memorial UI blocks |
| **On-chain demo** | Wallet connect, testnet contract calls (e.g. recording wishes / memories on chain) |

This repository is an **MVP / demo** implementation: some flows are simulated or testnet-only, suitable for hackathons and investor demos.

---

## Tech Stack (This Repo)

| Layer | Stack |
|-------|--------|
| App | Next.js (App Router), React, TypeScript |
| Web3 | wagmi, viem, RainbowKit |
| Chain | Avalanche Fuji (testnet); the plan also mentions L2 / Polygon for future scaling |
| Styling | Tailwind CSS |
| Static copy | `ui/static-web/` — plain HTML/CSS/JS for static hosting or teaching |

---

## Local Development

```bash
cd 永恒花园EternalGarden/ui
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:3000`).

Production build (webpack; recommended for this project):

```bash
npm run build
npm start
```

---

## Deployment (Vercel)

If the Git repo contains other projects, set Vercel **Root Directory** to **`永恒花园EternalGarden/ui`**. See [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md).

---

## Business & Vision (Summary)

- **Differentiation:** vs. traditional providers — data sovereignty, crowd-sourced wishes, community governance; vs. generic Web3 social — vertical hospice focus, structured legacy narratives, non-speculative incentive design.  
- **Business model (planned):** commissions on wish/creative services, marketplace take rates, premium services, B2B white-label, etc.; **BLOOM** token for governance, incentives, and staking (subject to real-world compliance).  
- **Vision:** everyone, regardless of gender or circumstance, can be treated with dignity before the end; their stories heard, remembered, and continued in the digital world in their own way.

The full narrative is in the Chinese business plan document: *「永恒花园」Web3 临终关怀社区商业计划书*.

---

## Repository Layout

```text
永恒花园EternalGarden/
├── README.md
├── docs/
├── contracts/
├── backend/
└── ui/
```

| Path | Role |
|------|------|
| `ui/app/` | Next.js routes and UI |
| `ui/static-web/` | Static HTML/JS variant without the Next toolchain |
| `contracts/` | Solidity contracts |
| `backend/` | Standalone backend (placeholder) |
| `docs/` | Docs and deployment notes |

---

## License & Disclaimer

Built for learning, hackathons, and demos. Medical, testamentary, and token matters require professional products and legal advice in production.

---

**Eternal Garden — Where Every Life Blooms Eternally.**
