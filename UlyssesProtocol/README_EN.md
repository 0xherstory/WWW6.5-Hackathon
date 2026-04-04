# ⚓ Ulysses Protocol

> **"In a world where Code is Law, we provide the enforcement for willpower."**

Ulysses Protocol is a behavioral intervention protocol designed to address irrational investment behaviors across all Web3 scenarios. By codifying the **"Ulysses Pact"** into smart contracts, the protocol establishes a pre-set "violation cost" to forcibly extend the decision-making path of impulsive traders. 

While the current version focuses on **"Buy-Action Constraints,"** the underlying "Stake-Monitor-Penalty-Distribute" framework is designed as a generic layer that can be horizontally scaled to any transaction scenario requiring self-discipline.

---

## 🌟 Core Philosophy: From Macro Restraint to Micro Execution

### 1. Macro Narrative: Combating Intertemporal Choice Inconsistency
The high-frequency and high-volatility nature of Web3 trading often traps investors in "short-term impulses." Ulysses Protocol provides a **pre-commitment mechanism**, allowing users to set rules during their rational periods and have them strictly enforced by the system during impulsive periods.

### 2. Logical Convergence: From All Impulses to "Buy-Action" Constraints
While the protocol aims to resolve all irrational impulses (such as excessive leverage, over-trading, or panic selling), this initial phase focuses on **"Irrational Buying"**—the most destructive scenario. By locking specific token addresses, the protocol builds a physical defensive line against temptation.

---

## 💡 Application Scenarios

Based on the current buy-constraint contract, we have identified three core scenarios:

* **New Listing Cooling-off:** Targets the extreme bubbles in the first 15 minutes of a hot token launch. Users pre-stake to forcibly skip the most volatile and highest-risk "exit liquidity" phase.
* **High-Risk Asset Shield:** Targets impulsive speculation induced by social media (Twitter/Telegram). Users import high-risk, low-liquidity assets (e.g., Memes, speculative tokens) into a ban list while rational.
* **Revenge Trading Guard:** Targets emotional loss of control following a major deficit. Users set a 72-hour "lockout period" for specific tokens to block irrational attempts to "break even" through revenge heavy-positioning.

---

## 📈 Mathematical Model: Willpower Weighting & Fair Distribution

The protocol uses mathematical triggers to ensure the value of "self-discipline time" and achieve efficient wealth redistribution.

### 1. Willpower Weighting Formula
$$W = \sqrt{P \times \text{PRECISION}} \times \min(T, 3d)$$
* **Sub-linear Incentive:** By taking the square root of the principal ($P$), the protocol prevents whales from monopolizing rewards and increases the relative weight of "discipline duration" for average retail users.
* **Time Cap:** Setting $T$ to a maximum of 3 days aligns with psychological studies on the half-life of human impulses, encouraging high-frequency, short-cycle rational renewals.

### 2. Reward Accumulator (AccRewardPerWeight)
The protocol adopts an $O(1)$ complexity "Rainwater Collection" algorithm (similar to Uniswap V3). This ensures that regardless of the number of participants, the **"Emotional Tax"** collected from each Slash is distributed accurately and at a low Gas cost to all rational users currently in the pool.

---

## 🛠️ Tech Stack

* **Smart Contracts:** Solidity (OpenZeppelin) — Core logic implementation and asset escrow.
* **Development Environment:** Remix / Foundry — Contract development, testing, and deployment.
* **Monitoring:** Node.js Watcher Service — Violation judgment engine based on real-time event indexing.
* **Frontend:** Next.js + Tailwind CSS — Providing an intuitive "Willpower Progress Bar" interaction.
* **Web3 Interaction:** Wagmi / Viem — Standardized Web3 wallet connection and on-chain interaction.

---

## 🚀 Future Scaling Vision

The current "Buy-Action" logic is only the starting point for the Ulysses framework. Future iterations will utilize the same underlying protocol logic to expand into diverse fields:

* **Portfolio Rebalance Lock:** Users set asset allocation targets (e.g., 50% Stablecoins). If impulsive trading causes a deviation, a Slash is triggered to force a return to the conservative strategy.
* **Activity Circuit Breaker:** Targets over-trading addiction. Users set a daily transaction limit; excess trades incur high penalty costs, filtering out noise operations.
* **Cross-Protocol Ecosystem Integration:** Accessing DEX frontends via API to serve as a "Trading Cooling-off" middleware, offering self-discipline services to all Web3 traders.

---

## 📜 Epilogue

> **"In a world where Code is Law, we provide the enforcement for willpower. In the Web3 world, stop paying the 'Emotional Tax' and convert your discipline and rationality into on-chain yield."**

---

### 📝 Quick Start

```bash
# Clone the Repository
git clone [https://github.com/ninaliu9671/WWW6.5-Hackathon/UlyssesProtocol.git](https://github.com/ninaliu9671/WWW6.5-Hackathon/UlyssesProtocol.git)
cd UlyssesProtocol

# Install Dependencies
forge install

# Run Tests
forge test
