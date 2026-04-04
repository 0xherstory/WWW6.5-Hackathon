# VitalMint

## 1. Project Overview

### 1.1 Project Background
Women's health management has long faced three major pain points: **data silos**, **privacy concerns**, and **lack of personalized intervention**. Most existing apps only serve as record-keeping tools and store data on centralized servers, leaving users unable to truly control their own health data or obtain actionable, long-term health insights.

### 1.2 Core Concept
**"Observing Cyclical Order, Minting Vitality"**  
VitalMint views the female menstrual cycle and physical state as a dynamic, decodable system, transforming health behaviors and data into quantifiable vitality assets through AI + Web3 technology.

### 1.3 Product Positioning
VitalMint is a **personal health intelligence manager designed specifically for women, based on Web3 technology**.  
- Target Users: Women who care about their health, diet, and lifestyle quality.  
- Differentiation: User-owned privacy sovereignty (blockchain) + AI-driven cycle prediction and nutritional advice + token incentive闭环.

---

## 2. Core Functional Modules

### 2.1 Cycle & Symptom Tracking
- Record menstrual cycles, chronic disease symptoms, emotional fluctuations, skin conditions (acne, eczema, etc.).
- Support custom symptom tags (e.g., headache, breast tenderness, fatigue index).
- Calendar view + cycle phase prediction (Follicular, Ovulation, Luteal, Menstrual).

### 2.2 Diet & Lifestyle Logging
- Photo-based or manual food logging (AI-assisted recognition of nutrients and inflammatory index).
- Sleep duration/quality, stress level, exercise type and duration, with optional integration with wearable devices or manual entry.
- Linked with cycle phases to recommend "anti-inflammatory foods or low-intensity exercise suitable for this phase."

### 2.3 AI Health Insights & Alerts
- **Personalized Baseline Modeling**: Establish the user's "normal range of fluctuation" based on at least one complete cycle of data.
- **Anomaly Alerts**: e.g., delayed cycle, abnormal bleeding, persistent high inflammation patterns (estimated via proxy indicators like IL-6/CRP).
- **Actionable Advice**: e.g., "On day 5 of the luteal phase, consider increasing magnesium and Omega-3 intake, and reducing high-glycemic foods."

### 2.4 Web3 Privacy & Data Sovereignty
- User health data **is not uploaded to centralized servers** but is encrypted and stored on decentralized storage networks (e.g., IPFS/Arweave), with only the user holding the private key.
- Option to contribute **anonymized aggregate data** to research institutions (requires user-signed authorization) and receive token rewards.
- Blockchain records **data hashes and access logs**, ensuring auditability without tampering.

### 2.5 Token Incentive Mechanism (VitalMint Token, VMT)
- **Health Behavior Mining**: Earn VMT for completing daily full data records and suggested actions (e.g., anti-inflammatory diet check-in, sleep goal achieved).
- **Data Contribution Mining**: Earn additional VMT by authorizing anonymized data for women's health research.
- **Token Utilities**:
  - Redeem for partner brands' women's health products (probiotics, menstrual cups, supplements).
  - Participate in DAO governance voting (deciding research funding directions or product iteration priorities).

---

## 3. Technical Architecture (Planned)

| Layer | Technology Selection | Description |
|-------|----------------------|-------------|
| Client | Flutter (iOS/Android) | Cross-platform + local encrypted database (SQLCipher) |
| AI Engine | TensorFlow Lite + Cloud Fine-tuning Model | On-device inference for cycle prediction + cloud aggregated model updates (no raw data exposure) |
| Blockchain | Ethereum L2 (Polygon / Arbitrum) | Low-cost proof of existence + token contract |
| Storage | IPFS + Filecoin | User encrypted data sharded storage, only hash on-chain |
| Identity | Web3Auth / WalletConnect | Low-friction wallet creation (supports email social recovery) |

---

## 4. Data Flow & Privacy Protection

1. **User records** → Local encryption → Generate data hash  
2. **Hash on-chain** (user signed) → Proves existence of a health record at a certain time  
3. **Encrypted data** → Sharded storage to IPFS (user controls decryption key)  
4. **AI Inference**:  
   - Optional: Download public aggregated model, run inference locally (maximum privacy)   
5. **Authorized Sharing**: User authorizes via smart contract → Research institution gets temporary decryption permission → VMT reward automatically triggered

---

## 5. Roadmap (Suggested MVP to v2.0)

### Phase 0: MVP (3 months)
- [ ] Basic cycle recording + symptom tags  
- [ ] Simple AI cycle prediction (based on historical length)  
- [ ] Wallet creation (custodial mode)  
- [ ] IPFS encrypted storage + hash on-chain  
- [ ] Daily check-in mining (VMT airdrop)

### Phase 1: Alpha (2 months)
- [ ] Diet/sleep/stress logging  
- [ ] AI inflammatory index assessment  
- [ ] Cycle phase personalized recommendations  
- [ ] Data contribution authorization flow & research dashboard

### Phase 2: Beta (3 months)
- [ ] On-device large model (cycle health assistant chat)  
- [ ] Anomaly alert push (intermenstrual bleeding, long cycle alert)  
- [ ] DAO governance module (VMT voting)

### Phase 3: Official v1.0
- [ ] Multi-language + compliance certifications (GDPR / California Privacy Law)  
- [ ] Partner brand marketplace (token redemption)  
- [ ] Open source core contracts & privacy protocols

---

## 6. Risks & Mitigation

| Risk | Impact | Mitigation Strategy |
|------|--------|----------------------|
| User unfamiliarity with Web3 wallet operations | High | Adopt social recovery + gasless transactions (meta-transactions) |
| Legal risks from AI health advice | High | Clear disclaimer: not a medical device, advice for reference only; introduce disclaimer flow |
| Token price volatility affecting incentive expectations | Medium | Reward pegged to stablecoin value (e.g., 1 VMT ≈ $0.01), buyback mechanism |
| Data storage cost increases with user growth | Medium | Phased cleanup of expired data + user-paid expansion (via VMT) |

---

## 7. Team Roles

- Yubei: PM
- Maiheer: Frontend
- Shisan: Operations

---

## 8. Appendix

### 8.1 Glossary
- **Data Hash**: A fixed-length string uniquely representing the original data, recorded on-chain without exposing content.  
- **Token (VMT)**: ERC-20 token used for incentives and governance.

### 8.2 Reference Competitors
- Traditional: Clue, Flo  
- Web3 Health: Heartrate, Sweat Economy  
- Differentiation Focus: **Menstrual cycle + chronic conditions + data sovereignty + female-specific research contribution**