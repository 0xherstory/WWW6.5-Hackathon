MVP产品说明书 V2.1(点击下载）

[HerGallery_MVP_v2.1.docx](attachment:672fc5fb-095e-42a3-94ec-eba5e6866346:HerGallery_MVP_v2.1.docx)

也可看以下的具体内容：

**HerGallery｜她的展厅**

MVP 产品功能规格书  v2.1  ·  2026-03-31

部署网络：Avalanche Fuji C-Chain  ·  开发周期：3 天

# **一、产品概述**

## **1.1 产品定位**

HerGallery 是一个女性主题的链上永久存证与策展平台。任何人都可以发起展厅、投稿内容、推荐或见证重要的声音——所有记录链上永存，无法删除。

## **1.2 核心价值**

| **价值** | **说明** |
| --- | --- |
| 永久存证 | 所有内容上链，不可删除、不可篡改 |
| 社区策展 | 推荐与见证机制让优质内容自然浮现 |
| 无需许可 | 任何人可发起展厅、投稿，无中心化审核 |
| 前端策展权 | 链上是档案馆，前端是展厅，flag 机制处理有害内容 |

## **1.3 内容治理立场**

HerGallery 记录公共事件和公开发布过的内容，不接受对私人个体未经同意的曝光。我们不删除任何链上证据，但保留前端策展权——链上是档案馆，前端是展厅，策展人可以决定展什么，但销毁档案是做不到的。

## **1.4 目标用户**

| **用户类型** | **使用场景** |
| --- | --- |
| 策展人 | 为女性事件/人物发起展厅，质押 0.001 AVAX 作为链上承诺，负责审核投稿 |
| 投稿者 | 向展厅投稿存证作品、证言、截图，待策展人审核通过后展出 |
| 推荐者 | 推荐优质投稿，帮助内容脱颖而出 |
| 见证人 | 见证投稿真实性，说明「我知道这件事发生过」 |
| 观众 | 浏览展厅内容，了解女性议题，可对平台或展厅进行打赏 |
| 合约拥有者 | 监管展厅，可 flag 违规展厅 |

# **二、核心流程**

MVP 完整流程如下：

- 策展人创建展厅（质押001 AVAX）
- 投稿人在展厅内提交投稿（内容上链，状态为 pending）
- 策展人审核投稿，选择批准或拒绝
- 批准 → 投稿状态变为 approved，前端展示在展厅中
- 拒绝 → 投稿状态变为 rejected，链上保留，前端不展示
- 观众浏览展厅，可对投稿进行推荐、见证，也可对平台或展厅打赏

# **三、功能模块详细说明**

## **3.1 展厅模块**

### **3.1.1 创建展厅**

| **字段** | **类型** | **必填** | **说明** |
| --- | --- | --- | --- |
| 标题 | string | 是 | 最长 50 字符 |
| 主题介绍 | Markdown 富文本 | 是 | 打包上传 IPFS，链上存哈希 |
| 封面图 | file | 是 | jpg/png，最大 2MB，存 IPFS |
| 标签 | 多选 | 是 | 最多 3 个：封号审查 / 二创作品 / 证言记录 / 历史档案 / 其他 |

**业务规则：**

- 创建需质押001 AVAX，这是链上承诺，不是手续费——证明展厅值得被建立
- 质押锁在合约里，满足条件后创建者可调用 withdrawStake 取回
- 创建者成为该展厅的「策展人」，拥有稿件审核权与 flag 权限

**交互流程：**

- 点击「创建展厅」（未连钱包则置灰并提示）
- 弹窗分两步：第一步填写标题、主题介绍、封面、标签；第二步确认质押
- 前端将主题介绍打包上传 IPFS，获得哈希
- 唤起 MetaMask 签名，等待链上确认
- 成功后跳转展厅详情页

### **3.1.2 展厅列表**

首页分两个区域展示：

**热门榜单（优质展厅）：**

- 排序算法：得分 = 推荐总数 × 0.7 + 投稿数 × 0.3，取前 3~5 名展示
- 推荐代表社区认可（权重7），投稿数代表活跃程度（权重 0.3）

**全部展厅列表：**

- 默认按创建时间倒序，支持按标签筛选
- 每张卡片显示：封面图、标题、标签 pills、投稿数、总推荐数、总见证人数、创建时间
- 无封面时显示带 HerGallery logo 的默认占位图

### **3.1.3 展厅详情页**

- 封面图横幅、展厅标题、主题介绍（从 IPFS 读取渲染 Markdown）
- 标签 pills、数据栏：投稿数 · 总推荐数 · 总见证人数 · 赏金池
- 策展人昵称（无昵称则显示地址缩略）
- 右上角「分享」按钮（复制链接）
- 右下角小字「在 Snowtrace 上验证此展厅」，点击跳转 testnet.snowtrace.io
- 投稿列表（仅展示 approved 状态投稿）
- 打赏展厅按钮
- 右下角悬浮「投稿」按钮（未连钱包时点击提示连接钱包）
- 策展人登录时，右上角额外显示「管理」入口，进入待审核列表

## **3.2 投稿模块**

### **3.2.1 投稿类型**

| 类型 | 主内容 | 附加字段（选填） | 存储方式 |
| --- | --- | --- | --- |
| **存证** | 图片上传（jpg/png，最大 2MB）+ 文字描述（上限 1000 字符），两者至少填一项 | URL 链接 | JSON 打包上传 IPFS，链上存哈希 |
| **二创** | 文字创作（上限 2000 字符）或图片上传（jpg/png，最大 2MB），二选一或同时提交 | URL 链接 | JSON 打包上传 IPFS，链上存哈希 |

**JSON 结构示例：**

`{ "type": "evidence", "text": "...", "imageHash": "Qm...", "link": "https://..." }
{ "type": "creation", "text": "...", "link": "https://..." }
{ "type": "creation", "imageHash": "Qm...", "link": "https://..." }
{ "type": "creation", "text": "...", "imageHash": "Qm...", "link": "https://..." }`

**业务规则：**

- 存证类型：图片和文字至少提交一项，URL 选填
- 二创类型：文字或图片至少提交一项，可同时提交，URL 选填
- 投稿提交后状态为 PENDING，等待策展人审核
- 链接内容可能失效，建议同时上传截图作为永久存证

**投稿前端流程：**

- 展厅详情页点击「我要投稿」
- 弹窗顶部两个 Tab：**存证 / 二创**
- 存证 Tab：图片上传区 + 文字输入框 + 选填 URL 输入框
- 二创 Tab：文字输入框 + 图片上传区（两者可同时填写）+ 选填 URL 输入框
- 前端打包 JSON 上传 IPFS 获得哈希
- 唤起 MetaMask 签名
- 成功后提示「投稿已提交，等待策展人审核」

### 3.5.2 投稿展示列表

展厅详情页投稿区域顶部设置两个**筛选标签**：

[ 存证 ]  [ 二创 ]

- 默认选中"存证"
- 点击「存证」标签：仅展示 type 为 evidence 的已批准投稿
- 点击「二创」标签：仅展示 type 为 creation 的已批准投稿
- 标签高亮显示当前选中状态
- 两个标签之外保留原有的排序选项（按推荐数 / 按时间）

**存证投稿卡片：**

- 右上角按钮「我要存证」
- 若有图片：显示图片缩略图
- 若有文字：显示前两行文字
- 若图片和文字均有：图片在左，文字在下截断预览
- 底部操作行：推荐数 + 推荐按钮 · 见证人数 + 见证按钮 · 分享按钮

**二创投稿卡片：**

- 右上角按钮「我要二创」
- 若有图片：显示图片缩略图
- 若为纯文字：显示前两行文字
- 若图文均有：图片在左，文字在下截断预览
- 底部操作行：推荐数 + 推荐按钮 · 见证人数 + 见证按钮 · 分享按钮

### **3.2.2 投稿列表**

- 默认只展示 approved 状态的投稿
- 排序选项：按推荐数 / 按时间 / 只看存证 / 只看二创

**每条投稿卡片：**

- 左上角类型标签（二创紫色 / 存证绿色）
- 内容预览（图片缩略图 / 文字前两行，从 IPFS 读取渲染）
- 投稿者昵称或地址缩略
- 底部操作行：推荐数 + 推荐按钮 · 见证人数 + 见证按钮 · 分享按钮

## **3.3 投稿审核模块（新增）**

原文档遗漏此模块，现补充完整。

**审核流程：**

- 投稿提交后，链上状态标记为 pending，前端展厅不显示
- 策展人在管理页面看到所有 pending 投稿列表
- 策展人点击「批准」→ 投稿状态变为 approved，前端展厅可见
- 策展人点击「拒绝」→ 投稿状态变为 rejected，链上永久保留，前端不展示

**合约层新增：**

| **新增内容** | **说明** |
| --- | --- |
| SubmissionStatus 枚举 | PENDING / APPROVED / REJECTED |
| Submission.status 字段 | 记录当前投稿审核状态 |
| approveSubmission(submissionId) | 批准展出，仅展厅策展人可调用 |
| rejectSubmission(submissionId) | 拒绝展出，仅展厅策展人可调用 |
| SubmissionApproved 事件 | 批准时触发 |
| SubmissionRejected 事件 | 拒绝时触发 |

## **3.4 推荐模块**

- 同一地址对同一 submissionId 只能推荐一次
- 推荐按钮：未推荐为空心，已推荐为填充高亮，状态差异要明显
- 推荐后推荐数实时 +1
- 投稿推荐数达到 10 时触发 RecommendMilestone 链上事件，前端弹出 POAP 徽章提示
- MVP 阶段不做防刷，V2 通过质押推荐成本解决


## **3.5 见证模块**

见证的语义是「我知道这件事是真实发生过的」，区别于推荐内容质量。

- 同一地址对同一 submissionId 只能见证一次
- 链上记录见证者地址列表
- 前端显示「X 人见证」
- 见证按钮点击后状态变化，显示「已见证」

## **3.6 打赏模块（新增）**

### **3.6.1 两级打赏体系**

| **打赏对象** | **说明** | **资金去向** |
| --- | --- | --- |
| 平台打赏 | 观众向整个 HerGallery 平台打赏 | 进入平台公共资金池（V2 用于治理） |
| 展厅打赏 | 观众向某个具体展厅打赏 | 直接归该展厅策展人所有，可随时提取 |

### **3.6.2 展厅赏金规则**

- 观众可在展厅详情页点击「打赏展厅」按钮，输入 AVAX 金额确认
- 赏金实时累积在展厅的 tipPool 中，详情页展示「赏金池：X AVAX」
- 策展人可随时调用 withdrawTips(exhibitionId) 提取全部赏金
- 展厅永久存在，不存在下架结算场景

### **3.6.3 合约层新增**

| **新增内容** | **说明** |
| --- | --- |
| Exhibition.tipPool 字段 | 记录该展厅累计赏金（AVAX） |
| tipPlatform() | 向平台打赏，payable |
| tipExhibition(exhibitionId) | 向展厅打赏，payable |
| withdrawTips(exhibitionId) | 策展人提取展厅赏金 |
| TipReceived 事件 | 收到打赏时触发 |
| TipsWithdrawn 事件 | 策展人提取赏金时触发 |

## **3.7 质押模块**

质押的语义是策展人对展厅质量的链上承诺，不是手续费。

| **条件** | **质押处理** |
| --- | --- |
| 展厅投稿数 ≥ 10 | 策展人可主动调用 withdrawStake 申请退还 |
| 展厅被 flag / 投诉成立 | 质押不退还，没收至合约 |
| 投稿数 < 10 时强制退出 | 质押不退还（V2 强制执行，MVP 合约预留字段） |

## **3.8 内容治理模块**

| **治理对象** | **执行权限** | **机制** |
| --- | --- | --- |
| 稿件 flag | 布展人（展厅创建者） | flagSubmission，前端不展示，链上保留 |
| 展厅 flag | 部署人（合约 owner） | flagExhibition，前端不展示，链上保留 |

**举报流程（MVP 简化版）：**

- 展厅列表 → 不合格展厅 → 用户举报 → 部署人审核 → flag

## **3.9 昵称模块**

- 每个地址只能设置一次昵称，不可更改
- 昵称 1~20 字符
- 有昵称则在所有位置显示昵称，无昵称则显示地址缩略（如..）

## **3.10 分享模块**

- 每个展厅和每条投稿均可生成分享链接
- 点击复制到剪贴板，显示「链接已复制」提示
- 纯前端实现，不需要改合约

# **⚠️ 与现有代码的冲突说明**

以下是 MVP_spec 与已部署合约/前端代码之间存在实质性冲突（非命名）的地方，需要在开发时做决策：

以下冲突已完成决策，Claude Code 请严格按决策结果执行，不需再询问。
C1：投稿类型系统变更（高影响）

新部署合约的 contentType 保持 string 类型，支持的合法值为 "evidence" 和 "creation"，废弃旧值 "art" / "testimony" / "screenshot" / "link"
前端 SubmitModal.tsx 重构为两个 Tab：存证（evidence）/ 二创（creation），不再使用旧的多类型选择
前端 SubmissionCard.tsx 做兼容处理：遇到旧值 "art" / "testimony" / "screenshot" / "link" 时，统一归入「存证」类型展示，打上绿色存证标签，不报错、不崩溃
所有新投稿只允许传入 "evidence" 或 "creation"，前端做枚举校验，禁止提交其他值

C2：recommend() 签名（无需操作，已对齐）
决策：无需修改，直接使用现有代码。

合约函数签名为 recommend(exhibitionId, submissionId)，共 2 个参数
前端调用已与此对齐，不需要任何改动
忽略文档历史版本中出现过的 endorse(submissionId) 单参数写法，那是旧版错误，已废弃

C3：hasRecommended ABI 参数数量（低影响）【需修正前端 ABI】
决策：修正前端 ABI，删除多余的 exhibitionId 参数。

合约中 hasRecommended 的实际 mapping 为 mapping(submissionId => mapping(address => bool))，Solidity 自动生成的 getter 只接受 2 个参数
前端 ABI 中错误地定义了 3 个参数（exhibitionId, submissionId, user），必须修正，否则调用必然报错
正确的 ABI 定义：

ts{
  name: 'hasRecommended',
  type: 'function',
  stateMutability: 'view',
  inputs: [
    { name: 'submissionId', type: 'uint256' },
    { name: 'user', type: 'address' }
  ],
  outputs: [{ name: '', type: 'bool' }]
}

找到项目中所有引用 hasRecommended 的 ABI 定义和调用处，统一修正为 2 个参数，移除 exhibitionId

# **四、智能合约规格**

## **4.1 数据结构**

enum SubmissionType { EVIDENCE, CREATION }
enum SubmissionStatus { PENDING, APPROVED, REJECTED }

struct Exhibition {
    uint256 id;
    address curator;
    string title;
    string contentHash;      // 主题介绍 IPFS 哈希
    string coverHash;        // 封面图 IPFS 哈希
    string[] tags;
    uint256 createdAt;
    bool stakeWithdrawn;
    bool flagged;
    uint256 tipPool;         // 新增：展厅赏金池
    uint256 submissionCount;
}

struct Submission {
    uint256 id;
    uint256 exhibitionId;
    address creator;
    SubmissionType subType;
    SubmissionStatus status;  // 新增
    string contentHash;
    string title;
    string description;
    uint256 createdAt;
    uint256 recommendCount;   // 托举数
    uint256 witnessCount;     // 见证数
    bool flagged;
}

## **4.2 核心函数**

| **函数** | **说明** |
| --- | --- |
createExhibition(title, contentHash, coverHash, tags) payable	创建展厅，质押 0.001 AVAX
submitToExhibition(exhibitionId, subType, contentHash, title, description)	投稿，初始状态 PENDING
approveSubmission(submissionId)	批准投稿展出，仅策展人
rejectSubmission(submissionId)	拒绝展出，仅策展人
recommend(exhibitionId, submissionId)	推荐，每地址每稿限一次
witness(submissionId)	见证，每地址每稿限一次
withdrawStake(exhibitionId)	取回质押，满足条件时可用
flagSubmission(submissionId)	稿件 flag，仅布展人
flagExhibition(exhibitionId)	展厅 flag，仅 owner
setUsername(username)	设置昵称，仅限一次
tipPlatform() payable	向平台打赏
tipExhibition(exhibitionId) payable	向展厅打赏
withdrawTips(exhibitionId)	策展人提取展厅赏金
getSubmissions(exhibitionId) view	获取展厅所有投稿 id
getExhibitionCount() / getSubmissionCount()	统计

## **4.3 合约事件**

| **事件** | **触发时机** |
| --- | --- |
4.3 合约事件
事件	触发时机
ExhibitionCreated	展厅创建
SubmissionCreated	投稿成功（状态 PENDING）
SubmissionApproved	投稿审核通过
SubmissionRejected	投稿审核拒绝
Recommended	推荐成功
Witnessed	见证成功
StakeWithdrawn	质押取回
SubmissionFlagged	稿件被 flag
ExhibitionFlagged	展厅被 flag
TipReceived	收到打赏
TipsWithdrawn	策展人提取赏金
FirstSubmission	用户首次投稿（POAP）
RecommendMilestone	投稿达 10 推荐（POAP）
UsernameSet	昵称设置

# **五、技术栈**

| **层** | **技术** | **版本** |
| --- | --- | --- |
| 智能合约 | Solidity | 0.8.19 |
| 开发框架 | Hardhat | 2.22.x |
| 部署网络 | Avalanche Fuji C-Chain | Chain ID: 43113 |
| 前端框架 | Vite + React + TypeScript | 18.x / 5.x |
| Web3 集成 | Wagmi + Viem | 3.x / 2.x |
| 钱包连接 | RainbowKit | 2.x |
| 样式 | TailwindCSS | 3.x |
| 文件存储 | IPFS / Web3.Storage | - |
| 动画 | Framer Motion | 12.x |

# **六、页面与路由清单**

| **页面** | **路由** | **核心内容** |
| --- | --- | --- |
| 首页 | / | Shero 区域、热门榜单、标签筛选、全部展厅列表、平台打赏入口 |
| 展厅详情 | /gallery/:id | 展厅信息、已批准投稿列表、推荐/见证/打赏操作 |
| 创建展厅 | 弹窗 | 两步填写：信息 → 确认质押 |
| 投稿 | 弹窗 | **两种类型 Tab（存证 / 二创）**，提交后提示等待审核 |
| 策展人管理 | 弹窗/侧边栏 | 待审核投稿列表，批准/拒绝操作，提取赏金 |
| 我的记录 | 侧边栏下拉 | 连钱包后可见，显示投稿历史和 POAP 徽章 |

# **七、验收标准**

| **模块** | **验收点** |
| --- | --- |
| 钱包 | 可连接 MetaMask，显示地址，切换网络提示 |
| 展厅创建 | 支持标签、Markdown 介绍、封面上传，质押成功 |
| 热门榜单 | 按权重算法正确排序 |
| 展厅详情 | Markdown 渲染正常，Snowtrace 链接可用，赏金池金额显示正确 |
| 投稿 | **存证和二创两种类型均可提交**，存证支持图片+文字，二创支持图文或纯文字或纯图片，URL 均选填，内容正确打包 IPFS，提交后显示 pending 提示 |
| 审核 | 策展人可在管理页看到 pending 投稿，批准后前端展示，拒绝后不显示 |
| 推荐 | 每地址每稿限一次，按钮状态正确 |
| 见证 | 每地址每稿限一次，显示「X 人见证」 |
| 打赏 | 平台打赏和展厅打赏均可发起，展厅赏金池数值实时更新，策展人可提取 |
| 质押 | 投稿数 ≥ 10 时可申请退还，被 flag 不退还 |
| 昵称 | 设置后全局替换地址显示 |
| 分享 | 复制链接正常，跳转正确 |
| Snowtrace | 合约地址和交易可在测试网浏览器查到 |

# **八、风险与应对**

| **风险** | **应对** |
| --- | --- |
| IPFS 上传慢 | 增加重试，demo 备用硬编码哈希 |
| 合约部署失败 | 本地充分测试，备用 RPC |
| 水龙头无测试币 | 提前领取 faucet.avax.network |
| 推荐被刷 | MVP 接受，V2 质押推荐成本解决，评委问则直说 |
| 时间不足 | 优先保证核心流程：连钱包→创建展厅→投稿→审核→推荐→Snowtrace 验证 |

*HerGallery · 她的展厅 · 每个她，都值得一个展厅*