# Product Requirements Document (PRD): Ulysses Protocol —— On-chain Rationality Anchoring Protocol

---

## 1. Executive Summary

### 1.1 Project Vision

**Ulysses Protocol** is a Web3 trading intervention tool designed based on behavioral finance. By constructing a "Ulysses Pact" via smart contracts, it aims to help investors hedge against future irrational impulses while in a rational state. The protocol transforms "trading willpower" into a game-theoretic behavior with economic incentives, addressing the prevalent FOMO-induced losses within the Web3 trading ecosystem.

### 1.2 Core Naming Allegory

The name is derived from the Greek myth of **Ulysses**, who faced the temptation of the Sirens. While still rational, Ulysses commanded his crew to bind him to the ship's mast and seal their own ears with wax to withstand the impending madness of the Sirens' song. This protocol serves as the digital "mast" for modern traders.

---

## 2. Project Background

### 2.1 Macro Perspective: "Intertemporal Irrationality" in Web3

In the Web3 trading ecosystem, investors face unprecedented psychological challenges. Due to 24/7 non-stop trading, extreme volatility, and social media information overload, investment behavior is often driven by the **striatum (desire)** rather than the **prefrontal cortex (rationality)**.

**The Spectrum of Irrational Buying:** Investor losses often stem from "that one second of impulse." This includes, but is not limited to:

- **FOMO (Fear of Missing Out):** Seeing an asset skyrocket in a short time, leading to extreme anxiety of losing a "once-in-a-lifetime" opportunity.
- **Herding Effect:** Blindly following "Smart Money" addresses or KOL calls without independent logic.
- **Revenge Trading:** Attempting to "break even" immediately after a loss by entering heavy positions, leading to emotional bottom-fishing.
- **False Prosperity Induction:** Being misled by fake trading volume in low-liquidity pools or AI-generated fake news, resulting in the purchase of worthless assets.

### 2.2 Core Pain Point: Lack of "Physical-Grade" Trading Brakes

Current Decentralized Exchange (DEX) design logic emphasizes "frictionless trading." While this improves efficiency, it amplifies human weaknesses. Centralized exchanges offer "cooling-off periods," but the Web3 on-chain environment lacks a mandatory, irreversible self-constraint mechanism.

### 2.3 Philosophical Foundation: The Ulysses Pact

The project incorporates the wisdom of Ulysses. Knowing the Sirens' song would cause him to lose his mind, he implemented:

- **Pre-commitment:** Setting rules while rational.
- **Automatic Execution:** Being bound to the mast by his crew.
- **Cost of Breaking:** Facing dire consequences if the impulse to break free was acted upon.

Ulysses Protocol codifies this philosophy: letting your rational self put shackles on your future impulsive self.

---

## 3. Use Cases and User Personas

### 3.1 Application Scenarios

- **Scenario A: The 24h Cooling-off for New Tokens**
    - **Pain Point:** Retail investors often rush into new tokens (e.g., hot Memecoins) within the first 15 minutes, only to become "exit liquidity."
    - **Solution:** Before a project launches, users force themselves to stake USDC and ban the purchase of that specific token for 24 hours.
    - **Significance:** Acts as a "rational brake" to effectively combat FOMO.
- **Scenario B: Anti-RugPull Shield**
    - **Pain Point:** Knowing certain tokens are high-risk "shitcoins," but being tempted by screenshots of gains on social media.
    - **Solution:** While rational, users import a "blacklist" of high-risk tokens into the ban list.
    - **Significance:** An on-chain self-discipline regulator, acting as an "anti-addiction system" for the wallet.
- **Scenario C: Revenge Trading Guard**
    - **Pain Point:** The urge to flip a loss into a profit immediately, usually resulting in even greater losses.
    - **Solution:** Immediately stake and lock a ban on the token that caused the loss for 3 days.
    - **Significance:** Builds an "emotional trading isolation wall."

### 3.2 User Persona: The "Conscious Addict"

Target users are retail investors who have Web3 experience and understand the dangers of FOMO but cannot control their "itchy hands" during actual operations. They crave a physical-grade tool to assist in self-regulation.

---

## 4. Core Functional Design (Product Logic)

### 4.1 Execution Flow: From Rationality to Constraint

1. **Stage I: Cooling-off Setup**
    
    During a calm market period, the user enters a "Ban List" (contract addresses), sets a "Ban Duration," and deposits a USDC stake via the protocol frontend.
    
2. **Stage II: On-chain Monitoring**
    
    The protocol's background "Watcher" monitors the user's wallet in real-time. If the user interacts with a contract on the ban list (Swap/Transfer), it is flagged as a violation.
    
3. **Stage III: Willpower Settlement (Slash & Reward)**
    - **Challenge Failed:** The staked amount is immediately **Slashed** (forfeited) and flows into the global reward pool.
    - **Challenge Succeeded:** Upon expiration, the user redeems the principal and claims a share of the "Emotional Tax" from the reward pool based on their weight.

### 4.2 Core Mathematical Model: Willpower Weighting & Distribution

### 4.2.1 Weight Calculation Formula

To ensure fairness and prevent whale monopoly, the protocol introduces a sub-linear incentive model:

$$W = \sqrt{P \times \text{PRECISION}} \times \min(T, 3d)$$

- **$\sqrt{P}$ (Sub-linear Principal):** Increasing the principal by 100x only increases the weight by 10x. This ensures that the "self-discipline duration" of smaller users carries a higher relative weight.
- **$3d$ (Emotional Half-life Cap):** Based on psychological research, 3 days is sufficient to cover most irrational impulses. Setting a cap encourages users to perform "short-cycle, high-frequency" rational renewals.

### 4.2.2 Reward Distribution: AccRewardPerWeight Accumulator

The protocol utilizes a "Rainwater Collection" algorithm (similar to Uniswap V3) to achieve $O(1)$ complexity for on-chain reward distribution:

- **Global Index Update:** Whenever a violator is Slashed, the global variable `Acc` increases:
    
    $$\Delta \text{Acc} = \frac{\text{Slash Amount}}{\sum W}$$
    
- **User Settlement:** When a user successfully completes a challenge, the reward is:
    
    $$\text{Reward} = W_{\text{user}} \times (\text{Acc}_{\text{exit}} - \text{Acc}_{\text{entry}})$$
    
- **Technical Advantage:** Regardless of the number of users, each transaction only updates 2-3 storage slots, significantly optimizing Gas consumption.

---

## 5. Roadmap and Future Vision

### 5.1 Overcoming Technical Limitations: Building a "Physical Barrier"

The current Demo relies on backend monitoring and post-facto Slashing. Future iterations will evolve toward pre-emptive interception:

- **DID & Biometric Integration:** Integrating **WorldID** or **Privy** to bind the "Ban Pact" to personal identity (Face/Iris) rather than just a wallet address, preventing users from bypassing constraints with new accounts.
- **Account Abstraction (AA) Integration:** Using **ERC-4337** smart wallets, users can set Ulysses as a "trading strategy plugin." During the ban period, the wallet layer will directly reject signature requests for banned contracts.

### 5.2 Horizontal Scenario Expansion: Holistic "Trading Therapy"

- **Stop-Loss Cooling-off:** If a daily account loss reaches 20%, a 24-hour total account lock is triggered.
- **Leverage Circuit Breaker:** For users prone to "tilting" in the futures market, a maximum leverage limit is enforced.
- **Sleep Protection Mode:** Setting "Late-night Trading Bans" to prevent poor decision-making during fatigue.

### 5.3 Commercial Vision: A New Paradigm for Web3 Wealth Transfer

- **"Emotional Tax" Clearing House:** Ulysses aims to become the "Rationality Liquidity Pool" of Web3. A portion of forfeited funds can be injected into the protocol treasury for token buybacks or security audits.
- **B2B Embedded Partnerships:** Collaborating with DEXs (e.g., Uniswap) or Wallets (e.g., MetaMask) to pop up a Ulysses Challenge option when a user attempts to buy a high-risk asset.
- **Social Pressure Betting:** Introducing a "Guardian Mode" where a portion of the Slash penalty is distributed to the user's designated social circle, leveraging social pressure to enhance discipline.

---

## 6. Conclusion

The ultimate vision of Ulysses Protocol is to become the psychological infrastructure of Web3. We do not seek to change human nature; instead, we use mathematics and smart contracts to forge a sturdy suit of armor for fragile humanity.

**"In a world where Code is Law, we return Rationality to the throne."**
