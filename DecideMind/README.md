DecideMind 是链上 AI 决策情绪助手。中文名就叫「定念」—— 定念，也是定心。用 AI 推演每一条前路的可能，用 Avalanche 链守住每一次抉择的真心，需要你愿意直面心里的犹豫，才能读懂它帮你剥离的情绪内耗，找回清醒的自己。
纠结的人如何从翻来覆去的拉扯里定下心来，迷茫的人如何像拆一份专属的成长礼物一样，在匿名的同频社区里接住多元的参考，在链上的印记里看见自己每一步的成长。
我们都走在人生的岔路口上，它陪你做选择，不是因为它能给你完美的标准答案，是因为它想帮你跳出情绪的内耗，也为了让你每一次笃定的前行，都有迹可循，都被好好记住。


DecisionMind 项目 README.md

DecisionMind - AI 决策助手 + 上链存证 + SBT 徽章系统

本项目是一款结合 AI 决策分析、区块链上链存证与 SBT 徽章激励的 Web3 应用，用户可通过 AI 分析决策利弊，将决策记录上链存证，并领取专属灵魂绑定徽章（SBT），全程基于 Avalanche Fuji 测试网实现。

📋 项目简介

核心功能：

- AI 决策分析：输入决策难题，AI 自动生成优势、风险、建议及置信度评分

- 上链存证：将 AI 分析结果永久存储到 Avalanche 区块链，不可篡改

- SBT 徽章激励：完成上链存证后，合约部署者可领取专属灵魂绑定徽章，不可转让

- 历史记录：本地存储用户决策历史，方便回溯查看

技术栈：Solidity（智能合约）+ Next.js（前端）+ Ethers.js（区块链交互）+ OpenZeppelin（合约开发）

🔧 环境准备

前置依赖

1. 安装 Node.js（v18+）和 npm/yarn

2. 安装 MetaMask 钱包，并切换至 Avalanche Fuji Testnet（雪崩测试网）

3. 获取 Fuji 测试网 AVAX（用于支付合约部署和交易 gas，可通过雪崩测试网 faucet 领取）

4. Remix 在线编辑器（用于部署智能合约，无需本地安装：https://remix.ethereum.org/）

📁 项目结构

DecisionMind/
├── contracts/          # 智能合约文件
│   ├── DecisionLog.sol # 决策存证合约（核心）
│   └── DecisionSBT.sol # SBT徽章合约（灵魂绑定）
├── app/                # Next.js 前端页面
│   ├── page.js         # 首页（决策问题输入）
│   ├── analysis/       # AI分析 + 上链存证页面
│   ├── history/        # 决策历史记录页面
│   └── badge/          # SBT徽章领取页面
└── README.md           # 项目说明文档

🔗 已部署合约地址（Avalanche Fuji Testnet）

无需重新部署，直接使用以下已部署合约：

- 决策存证合约（DecisionLog）：0xdC114568922614C9F3Be72225220e7bDc5ff50f0

- SBT徽章合约（DecisionSBT）：0x62E6c367e399eB7D7071754F80aDA7D716517960

🚀 快速启动（前端运行）

1. 克隆项目（若有）或直接将前端文件放入 Next.js 项目对应目录

2. 进入项目根目录，安装依赖：
        npm install
# 或
yarn install

3. 启动前端项目：
        npm run dev
# 或
yarn dev

4. 打开浏览器访问 http://localhost:3000，连接 MetaMask 钱包（确保切换至 Fuji 测试网）

📝 核心功能演示步骤

步骤 1：AI 决策分析

1. 首页输入决策难题（例如：“我该不该换工作？”）

2. 点击「开始 AI 分析」，等待 1.5 秒，AI 生成分析结果（优势、风险、建议、置信度）

步骤 2：上链存证

1. 在 AI 分析页面，点击「上链存证」按钮

2. MetaMask 弹出交易确认窗口，确认交易（消耗少量 Fuji 测试网 AVAX）

3. 交易确认后，提示“上链存证成功”，localStorage 标记存证状态，可前往徽章页领取 SBT

步骤 3：领取 SBT 徽章

1. 从首页或分析页进入「我的徽章」页面

2. 系统自动检测存证状态和钱包连接状态，确认已存证且未领取徽章

3. 点击「领取 SBT 徽章」，MetaMask 确认交易，交易成功后提示“领取成功”

4. 在 MetaMask 钱包中查看领取的 SBT 徽章（灵魂绑定，不可转让）

步骤 4：查看历史记录

1. 首页点击「历史记录」，查看所有 AI 分析过的决策记录

2. 记录包含决策问题、AI 建议和分析时间，支持本地回溯

⚠️ 注意事项

- 所有操作需在 Avalanche Fuji Testnet 完成，钱包网络需与合约部署网络一致

- SBT 徽章仅合约部署者可领取（合约权限为 onlyOwner），其他用户无法领取

- 上链存证后，localStorage 会记录存证状态，清除浏览器缓存会导致状态丢失，需重新上链

- 若重新部署合约，需同步更新前端对应合约地址，否则会导致区块链交互失败

- SBT 徽章为灵魂绑定代币，不可转让、不可交易，部署后无法修改此特性

🛠️ 合约核心说明

1. DecisionLog.sol（决策存证合约）

- 功能：存储用户决策问题、AI 分析结果、钱包地址和上链时间

- 核心方法：saveDecision(string question, string aiResult)（前端调用，实现上链存证）

- 辅助方法：getDecisionCount()（获取存证总数）、getDecisionByIndex(uint256 index)（查询单条存证）

2. DecisionSBT.sol（SBT 徽章合约）

- 功能：生成灵魂绑定徽章，完成存证后可领取，不可转让

- 核心方法：mintBadge(address user)（仅合约拥有者可调用，领取徽章）

- 核心特性：重写 transferFrom 和 safeTransferFrom 方法，禁用转让功能

- 防重复领取：通过 mapping(address => bool) hasMinted 记录用户领取状态

❌ 常见问题排查

1. 上链失败：检查钱包网络是否为 Fuji 测试网、是否有足够测试 AVAX、前端合约地址是否正确

2. SBT 领取失败：确认钱包是合约部署者（onlyOwner 权限）、已完成上链存证、未重复领取

3. 前端页面报错：检查依赖是否安装完整、MetaMask 是否正常连接、合约地址是否正确

4. 合约编译报错：确保 Solidity 编译器版本为 0.8.20，OpenZeppelin 依赖已正确导入

🎯 项目亮点

- Web2 + Web3 结合：AI 分析提升决策效率，区块链存证保证记录不可篡改

- SBT 激励：通过灵魂绑定徽章，增强用户参与感和专属感

- 操作简单：全程可视化操作，无需专业区块链知识，适合路演演示

- 全流程闭环：从 AI 分析 → 上链存证 → 徽章领取 → 历史回溯，形成完整用户链路
