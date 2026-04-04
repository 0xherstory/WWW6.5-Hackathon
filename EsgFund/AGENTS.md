# AGENTS.md

## Project Overview
This project is a hackathon MVP called **Reactive ESG Fund**.

It is a policy-driven Web3 fund demo that automatically rebalances portfolio allocations based on ESG score changes and controversy events, instead of reacting to price movements.



Core flow:
Off-chain ESG score calculation -> Oracle update -> Reactive trigger -> Portfolio rebalance

## Tech Stack
- Frontend: Next.js + TypeScript
- Styling: Tailwind CSS
- Backend: minimal Next.js Route Handlers
- Database: SQLite
- Smart Contracts: Solidity
- Wallet: MetaMask
- Network: Sepolia
- IDE: Cursor with Codex

## Product Scope
Must include:
- Single-page dashboard
- ESG methodology section
- ESG dashboard table
- Portfolio allocation
- Event simulator
- Execution timeline
- Minimal backend with 4 APIs
- SQLite database
- EsgOracle contract
- ReactiveEsgPortfolio contract
- EsgReactivePolicy contract
- Mock ERC20 assets

Out of scope:
- No full data pipeline
- No cron jobs
- No authentication
- No real DEX integration
- No IPFS
- No multi-user system
- No multi-chain support

## Database Scope
Only three tables:
- protocols
- score_history
- events

## Backend Scope
Only four APIs:
- GET /api/protocols
- POST /api/calculate-score
- GET /api/history
- GET /api/events

## ESG Model Rules
Use this scoring framework:
- Environmental max 25
- Social max 35
- Governance max 40
- Total score max 100

Rating mapping:
- 85-100 AAA
- 75-84 AA
- 65-74 A
- 55-64 BBB
- 45-54 BB
- below 45 B

## Reactive Policy Rules
- If rating falls from A or above to BBB => reduce exposure
- If rating falls to BB or below => exit position
- If severe incident is reported => exit position
- If rating rises to AA or above => increase exposure

## Coding Guidelines
- Communicate with me in Chinese
- Keep code, variable names, comments, and files in English
- Prefer minimal, readable implementations
- Avoid unnecessary abstractions
- Do not introduce extra services or dependencies unless clearly needed
- Keep the frontend single-page and demo-friendly
- Use simple accounting in the portfolio contract instead of real swaps
- Keep assumptions explicit in comments

## Workflow Rules
- Before major code changes, briefly explain the plan in Chinese
- Implement one module at a time
- Do not silently refactor unrelated files
- Keep blockchain integration separate from UI work until basic pages are ready
- Prefer hackathon speed and clarity over over-engineering

## Priority Order
1. Frontend shell
2. Minimal backend and database
3. ESG scoring model
4. Frontend-backend integration
5. Oracle + Portfolio contracts
6. Wallet integration
7. Reactive integration
8. Timeline and final demo polish

## 交互
1. 永远用中文回复