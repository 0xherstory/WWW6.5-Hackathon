Project:  ESG Fund

Goal:
Build a hackathon MVP for event-driven sustainable investing in Web3.

Rules:
- Reply to the user in Chinese
- Keep code and repository files in English
- Do not add a full data pipeline
- Do not add cron jobs
- Do not add authentication
- Do not add IPFS
- Do not add real DEX integration
- Keep the frontend single-page
- Keep the backend minimal with only 4 API routes
- Keep the database minimal with only 3 tables
- Use SQLite
- Use Sepolia as the target network
- Use a simple accounting-based portfolio model
- Keep all implementations hackathon-sized and easy to demo
- Explain the plan before making major code changes
- Do not refactor unrelated files

Core flow:
Off-chain ESG score calculation -> Oracle update -> Reactive trigger -> Portfolio rebalance

Frontend:
- single-page dashboard
- ESG methodology
- portfolio allocation
- event simulator
- timeline

Backend:
- minimal backend only
- 4 route handlers
- SQLite or Prisma + SQLite
- no authentication
- no cron jobs
- no external API automation in v1

Smart contracts:
- MockERC20
- EsgOracle
- ReactiveEsgPortfolio
- EsgReactivePolicy

Out of scope:
- no full data pipeline
- no real DEX swap
- no institutional-grade live ESG data