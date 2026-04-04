# ⚗️ Alcheme (炼金与自我)

---

> **Refine fragments, awaken true self.** > **精炼碎片，唤醒真我。**

🎬 演示视频：Alcheme 如何将个人成长的碎片转化为链上身份勋章

[![Demo Video](https://img.shields.io/badge/Demo-Video-red?style=for-the-badge&logo=youtube&logoColor=white)](https://youtu.be/08QBVLgxwdc)

[![Watch the demo](https://img.youtube.com/vi/08QBVLgxwdc/hqdefault.jpg)](https://youtu.be/08QBVLgxwdc)


[![Demo Video](https://img.shields.io/badge/Demo-Video-red?style=for-the-badge&logo=youtube&logoColor=white)](https://youtu.be/08QBVLgxwdc)

[![Watch the demo](https://img.youtube.com/vi/08QBVLgxwdc/hqdefault.jpg)](https://youtu.be/08QBVLgxwdc)

---

## 🌟 灵感来源 (The "Why")

在 Web2 时代，我们的成长数据被困在各个**中心化孤岛**（如 GitHub、微信、即刻）中。我们每天产生价值，却不拥有这些经历的“主权”。此外，传统的社交媒体和简历强迫我们贴上**垂直且单调的标签**，抹杀了作为“多维生命体”的丰富性。

**Alcheme** 是一个由 AI 驱动的“数字镜子”与炼金实验室。我们坚信：**你的所作所为、所思所想，构成了唯一的你。** 我们赋予你收集生命“晶石”的权利，并将它们精炼为不可篡改的 **SBT (灵魂绑定代币) 勋章**。

---

## 🚀 核心功能

### 1. ⛏️ 采集 (晶石 - Ore)

记录任何微小的进步、灵感或观点。无论是通过语音输入、文字记录，还是从外部应用（模拟接入）导入，每一件你认可的小事，都是一颗闪光的**晶石**。

### 2. 🔥 精炼 (卡牌 - Card)

在炼金锅炉中，将多颗晶石熔炼成一张**里程碑卡牌**。AI 将自动提取其中的成就意义，并为你生成绝美的、具有炼金术美学的艺术插画。

### 3. 👁️ 觉醒 (勋章 - Badge)

当你在某个领域积累了足够的里程碑，即可勾选多张卡牌“觉醒”为一个**身份勋章**（如：Web3 探险家）。勋章将作为 **SBT** 铸造上链，永久保存你的成长轨迹。

### 4. 🧬 进化 (持续增长 - Evolution)

身份不是静态的。你可以不断将新卡牌注入已有勋章，见证勋章随你一同进化。通过**六维雷达图**（智慧、韧性、感知等），实时观测多维度的真实自我。

---

## 🛠️ 技术栈

- **前端：**Next.js 14、React 18、TypeScript、Tailwind CSS、Framer Motion
- **Web3：**Avalanche Fuji 测试网、wagmi、viem、RainbowKit、WalletConnect
- **AI：**OpenAI API、DALL-E
- **后端：**Node.js、Express、Sharp、Supabase
- **智能合约：**Solidity ^0.8.20、Foundry、OpenZeppelin、灵魂绑定代币 SBT（Soulbound Token）
- **存储：**IPFS、Pinata

---

## 🎨 界面预览

| **1. 采集晶石** | **2. 炼金精炼** | **3. 身份觉醒** |
| --- | --- | --- |
| <img src="https://github.com/user-attachments/assets/c357f48c-9667-4247-a22f-0c20d65e655e" width="100%"> | <img src="https://github.com/user-attachments/assets/9032c333-57ad-429f-bf9f-629e48ea2a03" width="100%"> | <img src="https://github.com/user-attachments/assets/ca5ea008-ffbb-4ce0-b4a9-3d144a07588a" width="100%"> |

> *欢迎访问 **个人主页 (Profile)** 查看动态六维雷达图与进化的勋章墙！*
> 

---

## 📦 快速开始 (本地运行)

想要在本地启动 Alcheme Demo，请按照以下步骤操作：

```bash
# 1. 克隆仓库
git clone https://github.com/your-username/alcheme.git

# 2. 安装依赖
cd Alcheme/frontend
npm install
cd Alcheme/backend
npm install

# 3. 设置环境变量
根据自己信息修改前端、后端.env文件

# 4. 启动开发服务器
cd Alcheme/backend
npm run dev
cd Alcheme/frontend
npm run dev
```

打开 [Alcheme Live Demo](https://tux-assist-66534042.figma.site/awaken) 开启你的炼金之旅。

---

## ⚖️ Alcheme 哲学

- **非规则化**: 不设等级，不设模板。你的成长由你定义。
- **抗对比性**: 雷达图仅用于自我复盘，不用于他人比较。
- **可追溯的真实**: 每一份荣耀（勋章）背后，都有真实的汗水（晶石）支撑。

---

## 👥 团队成员 | The Alchemists

| **成员** | **角色** | **核心贡献** |
| --- | --- | --- |
| **Nina** | **Product Architect & UI/UX** | 发起项目愿景与产品逻辑构建；主导 AI 驱动的前端交互设计与开发；撰写 PRD 与 README；负责现场 Demo 路演。 |
| **Sniglet** | **Frontend Developer** | 负责前端页面架构实现、UI 细节打磨及响应式布局优化。 |
| **Scout** | **Backend & AI Engineer** | 构建后端服务架构；接入并调优大语言模型（LLM）与图像生成接口；负责业务数据持久化存储。 |
| **Thalia** | **Smart Contract & Integration** | 负责 Web3 智能合约（ERC-721/5192）编写与部署；主导整体技术栈联调（Integration），确保前后端与链上数据顺畅交互。 |
- *四位炼金术士，四天，一个去中心化的愿景。*
- *本项目于 [***Pink HerSolidity Hackathon***] 2026 期间由 ❤️ 驱动完成*

---
