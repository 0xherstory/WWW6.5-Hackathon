=======
# Rate My Mentor 后端服务
黑客松项目后端，提供身份验证、AI结构化评分、IPFS加密存储、声誉数据聚合能力

## 技术栈
Node.js + Express + TypeScript + OpenAI GPT-4o + Pinata IPFS

## 快速启动
1. 复制 `.env.example` 为 `.env`，填写所有配置项
2. 执行 `npm install` 安装依赖
3. 执行 `npm run dev` 启动开发服务
4. 访问 http://localhost:3001/health 检查服务是否正常

## 接口文档
所有接口统一前缀：`/api/v1`
- 身份验证相关：`/auth`
- AI评分相关：`/ai`
- IPFS存储相关：`/ipfs`
- 声誉看板相关：`/reputation`
- 合约交互相关：`/contract`

backend/
├── .env.example              # 环境变量示例（不上传Git，仅本地填写）
├── .gitignore                # Git忽略规则文件
├── package.json              # 项目依赖与脚本配置
├── tsconfig.json             # TypeScript编译配置
├── README.md                 # 后端项目说明文档
└── src/
    ├── app.ts                # 项目入口文件
    ├── config/               # 统一配置管理模块
    │   ├── env.ts            # 环境变量加载与校验
    │   ├── openai.ts         # OpenAI API配置
    │   ├── pinata.ts         # IPFS Pinata配置
    │   ├── email.ts          # 邮箱OTP服务配置
    │   └── contract.ts       # 智能合约交互配置
    ├── types/                 # 类型定义（100%对齐产品最小字段表）
    │   ├── auth.types.ts     # 身份验证相关类型
    │   ├── review.types.ts   # 评价与AI评分维度类型
    │   └── common.types.ts   # 通用响应类型
    ├── middlewares/           # 全局中间件模块
    │   ├── error.middleware.ts # 全局错误处理中间件
    │   ├── validate.middleware.ts # 请求参数校验中间件
    │   └── logger.middleware.ts  # 请求日志中间件
    ├── utils/                 # 通用工具函数模块
    │   ├── response.util.ts  # 统一接口响应格式
    │   ├── encryption.util.ts # 评价内容AES加解密
    │   └── validator.util.ts # 参数校验工具
    ├── services/              # 核心业务服务层（所有核心逻辑在这里）
    │   ├── auth.service.ts   # 身份验证服务（邮箱OTP+Offer OCR）
    │   ├── ai.service.ts     # AI结构化评分提取服务
    │   ├── ipfs.service.ts   # IPFS加密存储服务
    │   ├── reputation.service.ts # 声誉看板数据聚合服务
    │   └── contract.service.ts # 链上合约交互服务
    ├── controllers/           # 接口控制层（处理请求与响应）
    │   ├── auth.controller.ts
    │   ├── ai.controller.ts
    │   ├── ipfs.controller.ts
    │   ├── reputation.controller.ts
    │   └── contract.controller.ts
    └── routes/                # 接口路由层（统一管理所有API）
        ├── auth.routes.ts
        ├── ai.routes.ts
        ├── ipfs.routes.ts
        ├── reputation.routes.ts
        ├── contract.routes.ts
        └── index.ts           # 路由总入口
<<<<<<< HEAD
>>>>>>> f459229 (后端代码)
=======
```

>>>>>>> 04d6931b6f3ff54d0864ea7d82069bf512b33508


严格按照我提供的商务风职场评价平台搜索结果页需求，生成完整可直接运行的前端页面代码，要求如下：

1.  技术栈硬性要求
    - 框架：Next.js 14 App Router + TypeScript
    - 样式：Tailwind CSS，必须使用我项目中已安装的shadcn/ui组件，禁止自定义CSS、禁止使用其他UI库，严格遵循与首页完全统一的商务风设计规范
    - Web3集成：钱包连接按钮使用项目已集成的RainbowKit ConnectButton组件，页面跳转用Next.js的Link组件，路由路径为/search
    - 路由与参数：使用useSearchParams获取URL中的query搜索关键词，useRouter处理搜索跳转，搜索后自动更新URL参数，支持企业名称+部门双维度搜索
    - 权限控制：用Wagmi的useAccount钩子获取钱包连接状态，判断用户SBT持有状态，实现对应的按钮权限控制

2.  页面结构与功能要求，100%贴合双维度搜索需求，无任何营销内容：
    - 顶部固定导航栏：与首页完全一致，包含平台LOGO、核心导航入口、全局搜索框、RainbowKit钱包连接按钮，滚动时固定在顶部，搜索框默认回填URL中的搜索关键词
    - 搜索结果头部区：面包屑导航、匹配结果统计（关键词高亮）、「全部结果/企业结果」切换Tab（带结果数量）、动态适配的筛选器（企业分类对应不同筛选选项）
    - 搜索结果列表区：
      1. 企业结果卡片：与原有规范完全一致，支持展开/折叠下属业务组，点击跳转到企业详情页，关键词高亮
      2. 具体评价结果卡片：单列商务卡片，包含职场Title、所在企业、部门、5个维度、关键词高亮，无需跳转
      3. 切换Tab、筛选排序时，列表自动刷新对应内容，支持全部结果混合展示、分类单独展示
    - 完整的状态处理：加载状态用shadcn/ui的skeleton组件实现商务风骨架屏；全分类无结果、单分类无结果、无业务组的空状态设计，带对应的引导按钮
    - 相关推荐区：匹配结果不足时展示热门企业推荐卡片，与首页样式完全统一
    - 底部合规提示与页脚：与首页完全一致
    - 核心交互：Tab切换、筛选排序、企业卡片展开/折叠、页面跳转、关键词高亮、权限控制全部正常运行

3.  设计规范严格执行（与首页100%统一）
    - 配色：主色#165DFF，辅助色#0E42D2，全页面使用低饱和度中性色体系，无高饱和亮色
    - 字体：Inter无衬线字体，严谨的字号和字重层级，符合B端商务阅读习惯
    - 组件：圆角4px-8px，极简浅边框，无强投影、无夸张动效，所有组件复用shadcn/ui，风格统一
    - 响应式：完全适配PC端、平板端、移动端，12列栅格布局，无排版错乱、内容溢出

4.  代码要求
    - 完整的TypeScript类型定义，无类型错误，无报错
    - 代码结构清晰，组件拆分合理，注释清晰，预留好链上数据对接位置
    - 用模拟数据填充页面，和合约返回的数据结构完全对齐，后续可直接替换
    - 所有交互效果正常，符合商务产品的交互逻辑
    - 代码可直接复制到项目src/app/search/page.tsx文件中运行，无任何冗余内容，全程突出职场评价的专业商务属性

生成完整的page.tsx代码，可直接使用。