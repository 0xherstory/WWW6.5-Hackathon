# 🛡️ HerGuard

危险瞬间的不可篡改证人，全城女性的众包安全网络

一款基于 Avalanche 链的女性出行安全守护工具。结合极简交互与区块链最终性，打造「黑匣子存证-众包预警-极速脱身」的三位一体防护体系，让每一位女性在夜色中都不再孤立无援。

lovable网址：https://her-guard.lovable.app/

---

## 🌊 项目信息

- 参赛赛道：赛道 3
- 核心价值：生命安全存证 · 社区互助预警 · 数据不可篡改
- 产品定位：女性夜间出行安全工具，极简、硬核、秒级响应
- 技术栈：Lovable (Frontend) + node.js + Solidity + Avalanche
- 部署网络：Avalanche Fuji 测试网

---

## 🎯 痛点与背景

当前女性安全产品普遍存在以下技术与信任痛点：

- 证据易被销毁：歹徒抢夺手机后可轻易删除报警记录、短信或关闭 App 追踪。
- 中心化依赖：传统报警系统依赖公司服务器，若服务器宕机或数据被篡改，关键证据将丢失。
- 预警滞后性：周边用户无法实时获知附近的危险发生，缺乏有效的社区互助机制。
- 隐私与效率冲突：紧急联系人信息上链易泄露隐私，不上链则无法在极端情况下保证权限。

HerGuard 旨在通过 Avalanche 秒级确认 + 链上存证 彻底解决安全数据的"信任"问题。

---

## ✨ 产品定位

HerGuard 不是简单的报警器，也不是社交软件，而是：

- 你的数字黑匣子：发生意外时，它是永远无法被抹除的证人。
- 城市的哨兵：一人呼救，全城 HerGuard 用户的地图瞬间点亮。
- 心理的后盾：用最简单的交互，换取最确定的安全感。

---

## 🏗️ 核心功能

### 1. 众包危险预警地图 (On-chain Danger Map)

- 动作：长按 3 秒 SOS 触发。
- 机制：地理坐标立即同步至 Avalanche 全球节点。
- 效果：所有附近用户的 App 地图上秒级出现"红色预警圈"，实时提醒绕行，构建去中心化的安全哨所。

### 2. "防毁灭"数字黑匣子 (Evidence Vault)

- 逻辑：求救瞬间的 GPS 经纬度与时间戳强制写入智能合约。
- 价值：数据不可篡改、不可撤回。即便手机被砸毁，警方依然可以从链上调取最原始的求救第一现场。

### 3. 混合式紧急求助 (Hybrid Notification)

- 隐私安全：紧急联系人姓名与电话仅存储在手机本地（LocalStorage），保护用户社交隐私。
- 极速响应：触发 SOS 时，同步通过邮件向联系人发送带有求助者所在地址的求救信息，实现链下响应的"零延迟"。

### 4. 极简脱身术 (Quick Escape)

- 假来电功能：一键模拟真实来电界面，内置预录的威慑性语音（如："宝贝我到路口了，马上接你"）。
- 触觉反馈：长按触发时的震动引导，确保在极端紧张下操作不走样。

---

## 🔧 技术架构

用户交互 → Lovable 前端 → 获取 GPS → 触发双路并行逻辑（1. 链上存证 2. 链下邮件）

- 前端：Lovable 生成，采用高对比度、冷静的视觉风格。
- Web3：钱包连接 + 极简 Evidence 合约。
- 数据：敏感隐私本地存储，关键位置证据上链。
- 核心优势：利用 Avalanche 的 Sub-second Finality 实现预警秒级同步。

---

## 🧩 创新亮点

- 技术与人文的平衡：不盲目追求"全量上链"，将隐私（联系人）留给本地，将正义（证据）留给区块链。
- 利用 Avalanche 特性：精准切中 Avalanche 低延迟、高吞吐的特性。对于安全应用，1 秒和 10 秒的差别就是生与死的差别。
- 社会化监护理念：将个人安全升华为社区共生的安全地图，符合 Web3 众包、共享、互助的精神。
- 防御坏人逻辑：专门针对"手机被抢/被毁"场景设计，填补了传统安全 App 的逻辑空白。

---

## 📁 项目结构

```
HerGuard 采用 Web3 前端 + Node.js 后端 + Solidity 智能合约 的全栈设计。以下是基于源代码的结构划分：
1. 前端 UI 项目 (/HerGuard)
这是用户直接使用的 React 项目，文件结构如下：
src/components/：存放核心功能组件。
SOSButton.tsx：核心控制器，负责触发报警、调用后端 API 和发起区块链交易。
WalletConnect.tsx：处理 MetaMask 钱包连接状态。
src/lib/：存放核心逻辑库。
geocode.ts：处理地理位置逆编码，将坐标转为详细地址。
src/hooks/：存放自定义钩子。
useOfflineBuffer.ts：实现断网时的求救数据本地暂存逻辑。
2. 后端应急服务 (herguard-backend)
部署在 Render 上的独立服务：
server.js：基于 Express 的服务器，监听 10000 端口。
核心 API：POST /api/send-sos-sms，接收前端数据并触发 Nodemailer 发送求救邮件。
3. 智能合约层 (/contracts)
部署在区块链上的核心逻辑：
HerGuardShield.sol：Solidity 编写的存证合约，将求救时间、地点永久记录在 Avalanche 链上。
```

---

## 📌 核心价值

HerGuard 让安全感不再依附于手机硬件。当她按下按钮的那一刻，整个 Avalanche 网络都成了她的证人。在属于她的黑暗中，HerGuard 为她点亮退路，也为周围的女性点亮前路。

# 🛡️ HerGuard (English Version)
An immutable witness in dangerous moments, a crowdsourced safety network for women.

A women's travel safety tool based on the Avalanche blockchain. Combining minimalist interaction with blockchain finality, it creates a "Black Box Evidence - Crowdsourced Alert - Rapid Escape" trinity protection system, ensuring no woman stands alone in the dark.

Lovable URL: https://her-guard.lovable.app/

## 🌊 Project Information
Track: Track 3

Core Values: Life Safety Evidence · Community Mutual Aid · Data Immutability

Product Positioning: A minimalist, hardcore, sub-second response safety tool for women's nighttime travel

Tech Stack: Lovable (Frontend) + Node.js + Solidity + Avalanche

Deployment Network: Avalanche Fuji Testnet

## 🎯 Pain Points & Background
Current women's safety products face significant technical and trust issues:

Easily Destroyed Evidence: Perpetrators can easily delete records or turn off tracking after seizing a phone.

Centralized Dependency: Traditional systems rely on private servers; if they crash or data is tampered with, key evidence is lost.

Delayed Warnings: Nearby users cannot learn of local dangers in real-time, lacking an effective mutual aid mechanism.

Privacy vs. Efficiency: Putting emergency contacts on-chain risks privacy, while keeping them off-chain may compromise access in extreme cases.

HerGuard utilizes Avalanche's sub-second finality and on-chain evidence storage to fundamentally solve the "trust" issue of safety data.

## ✨ Product Positioning
HerGuard is not just an alarm; it is:

Your Digital Black Box: An unerasable witness when accidents occur.

The City's Sentry: When one calls for help, the maps of all HerGuard users light up instantly.

A Psychological Anchor: Minimalist interaction for maximum certainty of safety.

## 🏗️ Core Features
1. On-chain Crowdsourced Danger Map
Action: Triggered by pressing SOS for 3 seconds.

Mechanism: Geographic coordinates are immediately synchronized to Avalanche global nodes.

Effect: A "Red Alert Zone" appears on nearby users' maps within seconds, building a decentralized safety outpost.

2. "Anti-Destruction" Digital Evidence Vault
Logic: GPS coordinates and timestamps are forcibly written into the smart contract at the moment of the distress call.

Value: Data is immutable and irrevocable. Even if the phone is destroyed, police can retrieve the original scene data from the chain.

3. Hybrid Notification System
Privacy First: Emergency contact names and numbers are stored only in local storage to protect social privacy.

Instant Response: When SOS is triggered, a help message with the user's address is sent via email to contacts with "zero latency."

4. Quick Escape Tactics
Fake Call: Simulates a realistic incoming call interface with pre-recorded deterrent audio (e.g., "Babe, I'm at the intersection, see you in a minute").

Haptic Feedback: Vibration guidance during long-press triggers ensures successful operation under extreme stress.

## 🔧 Technical Architecture
User Interaction → Lovable Frontend → Get GPS → Dual-Path Logic (1. On-chain Evidence | 2. Off-chain Email)

Frontend: Generated by Lovable, using a high-contrast, calm visual style.

Web3: Wallet connection + minimalist Evidence contract.

Data: Sensitive privacy is stored locally; critical location evidence is stored on-chain.

Core Advantage: Uses Avalanche's Sub-second Finality for real-time alert synchronization.

## 🧩 Innovation Highlights
Balance of Tech & Humanity: Prioritizes privacy (contacts) locally while keeping justice (evidence) on the blockchain.

Leveraging Avalanche: Perfectly fits Avalanche's low-latency, high-throughput nature; in safety apps, the difference between 1 and 10 seconds is life and death.

Social Guardianship: Transforms personal safety into a community-shared safety map, embodying Web3 crowdsourcing and mutual aid spirits.

Anti-Perpetrator Logic: Specifically designed for "phone stolen/destroyed" scenarios, filling a gap in traditional safety apps.

## 📁 Project Structure
HerGuard utilizes a full-stack design consisting of a Web3 Frontend, Node.js Backend, and Solidity Smart Contracts.

1. Frontend UI Project (/HerGuard)
Built with React, the structure is as follows:

src/components/: Core functional components.

SOSButton.tsx: Main Controller handling distress triggers, backend API calls, and blockchain transactions.

WalletConnect.tsx: Manages MetaMask wallet connection status.

src/lib/: Core logic libraries.

geocode.ts: Handles reverse geocoding (coordinates to address).

src/hooks/: Custom hooks.

useOfflineBuffer.ts: Logic for local data buffering during network outages.

2. Emergency Backend Service (herguard-backend)
Independent service deployed on Render:

server.js: Express-based server listening on Port 10000.

Core API: POST /api/send-sos-sms receives frontend data and triggers Nodemailer for distress emails.

3. Smart Contract Layer (/contracts)
Core logic deployed on-chain:

HerGuardShield.sol: A Solidity contract that permanently records the time and location of distress signals on the Avalanche network.

## 📌 Core Value
HerGuard ensures safety no longer depends solely on phone hardware. The moment she presses the button, the entire Avalanche network becomes her witness. In her darkness, HerGuard lights the way back for her and the way forward for all women.
