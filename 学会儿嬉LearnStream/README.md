# 学会儿嬉 LearnStream

> 语言学习 · 游戏化互动 · 链上足迹

**学会儿嬉 LearnStream** 是一个 Web3 语言学习游戏社区。用户上传学习资料，AI 自动生成匹配难度的游戏；所有学习行为（打卡、笔记、游戏通关）全部上链，形成不可篡改的成长足迹；社区支持点赞、投币和双语弹幕鼓励，让学习告别孤单，让进步真实可证。

---

## 🎯 核心功能

- 📈 **链上成长轨迹**：每一次学习都记录在 Avalanche 测试网上，形成永久可验证的学习档案。
- 🤖 **AI 智能出题**：上传任意学习资料（笔记、单词表），自动生成单词匹配、选择题等互动游戏。
- 💬 **双语弹幕社区**：支持一键切换母语/学习语言，互相鼓励，温暖陪伴。

---

## 🛠️ 技术栈

- **智能合约**：Solidity (部署于 Avalanche Fuji 测试网)
- **后端**：Node.js + Express
- **前端**：HTML/CSS/JS + Ethers.js
- **数据库**：MongoDB (可选，用于存储用户资料)
- **AI 生成**：OpenAI API / 文心一言 (根据笔记生成题目)

---

## 📦 本地运行指南

### 环境要求

- Node.js (v18 或更高)
- npm 或 yarn
- MetaMask 浏览器插件 (用于连接钱包)

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/iris0502wang/WWW6.5-Hackathon.git
   cd WWW6.5-Hackathon/学会儿嬉LearnStream

   npm install --registry=https://registry.npmmirror.com
PORT=3000
MONGODB_URI=你的数据库地址
CONTRACT_ADDRESS=你的合约地址
PRIVATE_KEY=你的部署私钥（仅后端使用）
OPENAI_API_KEY=你的API密钥（可选）
启动后端服务

bash
node server.js
或

bash
npm start
看到 Server running on port 3000 即启动成功。

访问前端
浏览器打开 http://localhost:3000

⛓️ 智能合约
LearningRecord.sol：记录学习行为（打卡、上传笔记、游戏通关），发放代币奖励。

LearnToken.sol：ERC20 奖励代币。

部署网络：Avalanche Fuji 测试网

合约地址（示例）：待补充

🧪 测试与演示
连接钱包：点击“连接钱包”，使用 MetaMask 切换到 Avalanche Fuji 测试网。

每日打卡：点击打卡按钮，确认 MetaMask 交易，代币余额会增加。

上传笔记：输入文本笔记，后端调用 AI 生成题目（需配置 API）。

弹幕墙：预设鼓励语，未来可对接链上评论。

⚠️ 当前版本登录功能为演示模式，可直接进入主界面体验核心功能。

📁 项目结构
text
学会儿嬉LearnStream/
├── api/                # 后端路由
├── contracts/          # Solidity 合约源码
├── models/             # 数据库模型（需队友补充 LearningData.js）
├── public/             # 前端静态文件
├── services/           # 业务逻辑
├── server.js           # 入口文件
├── package.json
└── README.md
👥 团队分工
区块链：负责合约编写、部署、链上交互

前端：UI 设计、钱包连接、页面交互

后端/AI：API 开发、AI 出题集成、数据库管理

文档/路演：PPT、演示视频、项目介绍

🚧 待完成事项
对接 AI 出题 API
部署到公网服务器（可选）

📄 许可证
MIT

🙏 致谢
本作品为 Herstory 共学营黑客松参赛项目，感谢所有队友的共同努力。

学会儿嬉 LearnStream – 你的每一次嬉戏，都会变成链上足迹。

