# 🌿 Urban Flora

**Urban Flora** is a blockchain-based urban plant observation and recording application.  
It creates a unique digital identity for every plant in the city and records its lifecycle (germination, growth, flowering, fruiting, and leaf fall).

---

## ✨ Project Background

Plants in the city change every day, yet few people document them.

The goal of Urban Flora is:  
> To transform natural changes in the city into digital memories that are recordable, traceable, and shareable.

---

## 💡 Core Features

### 🌱 1. Create Plant NFTs
- Users can create a unique NFT for each plant  
- Record the plant name and location (e.g., “East Gate of the Park”)

### 📍 2. Plant Location Recording
- Mark plant locations using text or latitude/longitude  
- Avoid complex map integration and focus on core functionality  

### 🌸 3. Lifecycle Recording
Users can add observation records for plants:
- 🌱 Germination  
- 🌿 Growth  
- 🌸 Flowering  
- 🍎 Fruiting  
- 🍂 Leaf fall  

### 🕒 4. Growth Timeline Display
- Display the plant’s changes in a timeline format  
- Build a complete “life story” of the plant  

---

## 🏗️ Technical Architecture

```
Frontend (HTML + JS)
        ↓
Spring Boot Backend (Java)
        ↓
Smart Contract (Solidity)
```

---

## ⚙️ Tech Stack

### Blockchain
- Solidity  
- ERC721 (NFT standard)  
- OpenZeppelin  

### Frontend
- HTML  
- JavaScript  
- ethers.js  

### Backend
- Java  
- Spring Boot  

### Wallet
- MetaMask  

---

## 🔗 Core Contract Functions

- `createPlant()` — Create a plant NFT  
- `getPlant()` — Retrieve plant information  

---

## 🚀 Getting Started

### 1. Deploy Smart Contract
- Compile and deploy the contract using Remix  
- Obtain the contract address and ABI  

### 2. Start Backend Service

```bash
mvn spring-boot:run
```

Default address:

```
http://localhost:8080
```

---

### 3. Start Frontend

```
npm run dev
```

Default address:

```
http://localhost:8081
```

---

## 🎬 Demo Workflow

1. Connect wallet  
2. Create a plant NFT  
3. Query plant information  
4. Add observation records  
5. View the growth timeline  

---

## 🌍 Project Significance

Urban Flora is more than just an application—it is:

- A system for recording urban nature  
- A digital bridge connecting people and the environment  
- A tool that transforms “observation” into “long-term memory”  

---

## 🔮 Future Extensions

- Map visualization (mark plant locations)  
- Plant community (shared observations)  
- NFT achievement system  
- AI-based plant recognition (optional)  

---

## 👤 Author

- Yiran Cheng  

---

## 📌 License

MIT  