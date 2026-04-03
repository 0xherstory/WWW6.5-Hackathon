export type Locale = "zh" | "en";

export const messages = {
  zh: {
    brand: "月经小屋",
    tagline: "No Uterus, No Opinion",
    langZh: "中",
    langEn: "EN",
    switchToZh: "切换到中文",
    switchToEn: "Switch to English",
    heroBadge: "姐妹同盟 · 身体主权",
    heroSubtitle: "一个永远不会被删除的身体感受记录空间",
    ctaEnter: "进入月经小屋",
    ctaEnterClosing: "现在进入月经小屋",
    ctaLearnMore: "了解更多",
    whyTitle: "为什么我们要做月经小屋？",
    whyPoints: [
      {
        label: "表达权（不能说）",
        body: "晋江女性小说被锁，女性的叙事被系统性审查。",
      },
      {
        label: "身体自主权（不能提）",
        body: "女性身体的真实体验被系统性否认，疼痛被否认。",
      },
      {
        label: "财产权（不能争）",
        body: "女性的经济安全与财产权被系统性危害，在不知情的情况下成为「抵押物」。",
      },
      {
        label: "冠姓权（不能有）",
        body: "血脉被隐，母系传承被抹除。",
      },
    ],
    blockchainTitle: "为什么选择区块链？",
    blockchainCards: [
      {
        title: "永恒不灭 Permanent",
        desc: "你的话语永远无法被删除或审查",
      },
      {
        title: "去中心化 Decentralized",
        desc: "反映了女性天然的关怀与联盟精神",
      },
      {
        title: "匿名自由 Anonymous",
        desc: "自由分享而无需担心被评判",
      },
      {
        title: "公开共鸣",
        desc: "让姐妹们看到「原来不止我一个人」",
      },
    ],
    whatTitle: "月经小屋 — Your Forever Body Archive",
    whatBody:
      "一个极简的去中心化应用（dApp），女性可以匿名书写自己的身体与生命经历。每一条记录都永久存储在区块链与 IPFS 上，成为不可篡改的永恒档案。",
    howTitle: "使用流程",
    howSteps: [
      { primary: "连接钱包", secondary: "Connect Wallet" },
      { primary: "匿名书写日记", secondary: "Write Anonymous Diary" },
      { primary: "永久上链存储", secondary: "Log to IPFS + Chain" },
      { primary: "浏览姐妹分享", secondary: "Browse Sisters' Stories" },
    ],
    mvpTitle: "Hackathon MVP Features",
    mvpItems: [
      "连接钱包",
      "匿名记录文字",
      "查看自己的记录",
      "浏览公开帖子",
    ],
    trackTitle: "Life & Co-existence 生命与共生",
    trackSubtitle: "身体主权 · 关怀力量 · 姐妹同盟",
    trackBody:
      "通过去中心化技术，重建女性之间的情感联结，让每一位女性知道：「我不孤单」。",
    futureTitle: "未来愿景",
    futureCards: [
      {
        title: "互助网络",
        text: "让经验与支持在链上温柔流动，彼此照亮每一段旅程。",
      },
      {
        title: "物资捐赠",
        text: "以透明、可信的方式汇聚善意，把关怀送到真正需要的地方。",
      },
      {
        title: "线下活动",
        text: "从数字小屋走向真实相聚，拥抱、倾听与共同成长。",
      },
    ],
    closingQuote:
      "「在数字世界里，夺回叙事、共享体验、守护自己、筑牢根基的安全空间。」",
    footer: "月经小屋 · Menstrual Hut · 温柔记录，永恒相伴",
  },
  en: {
    brand: "Menstrual Hut",
    tagline: "No Uterus, No Opinion",
    langZh: "中",
    langEn: "EN",
    switchToZh: "Switch to Chinese",
    switchToEn: "Switch to English",
    heroBadge: "Sisterhood · Bodily sovereignty",
    heroSubtitle:
      "A space for embodied experience that can never be erased",
    ctaEnter: "Enter Menstrual Hut",
    ctaEnterClosing: "Enter Menstrual Hut now",
    ctaLearnMore: "Learn more",
    whyTitle: "Why we built Menstrual Hut",
    whyPoints: [
      {
        label: "Right to speak (silenced)",
        body: "Women’s fiction locked on Jinjiang; women’s narratives systematically censored.",
      },
      {
        label: "Bodily autonomy (unspeakable)",
        body: "Women’s lived experience systematically denied; pain denied.",
      },
      {
        label: "Property rights (can’t contest)",
        body: "Women’s economic safety and property rights systematically undermined—made “collateral” without informed consent.",
      },
      {
        label: "Lineage & naming (disallowed)",
        body: "Bloodlines hidden; matrilineal continuity erased.",
      },
    ],
    blockchainTitle: "Why blockchain?",
    blockchainCards: [
      {
        title: "Permanent",
        desc: "Your words cannot be deleted or censored.",
      },
      {
        title: "Decentralized",
        desc: "Aligned with care, solidarity, and mutual aid among women.",
      },
      {
        title: "Anonymous",
        desc: "Share freely without fear of judgment.",
      },
      {
        title: "Public resonance",
        desc: "So sisters see: “I’m not the only one.”",
      },
    ],
    whatTitle: "Menstrual Hut — Your Forever Body Archive",
    whatBody:
      "A minimal dApp where women can anonymously write about their bodies and lives. Each entry is stored permanently on-chain and on IPFS—an immutable archive.",
    howTitle: "How it works",
    howSteps: [
      { primary: "Connect wallet", secondary: "连接钱包" },
      { primary: "Write anonymously", secondary: "匿名书写日记" },
      { primary: "Log to IPFS + chain", secondary: "永久上链存储" },
      { primary: "Browse sisters’ stories", secondary: "浏览姐妹分享" },
    ],
    mvpTitle: "Hackathon MVP",
    mvpItems: [
      "Wallet connection",
      "Anonymous text entries",
      "View your own records",
      "Browse public posts",
    ],
    trackTitle: "Life & Co-existence",
    trackSubtitle: "Bodily sovereignty · Care · Sisterhood",
    trackBody:
      "With decentralized tech, we rebuild emotional connection among women—so every woman knows: “I am not alone.”",
    futureTitle: "What’s next",
    futureCards: [
      {
        title: "Mutual aid network",
        text: "Let knowledge and support flow on-chain—gently lighting each other’s way.",
      },
      {
        title: "Material donations",
        text: "Gather goodwill in a transparent, trustworthy way—care reaches those who need it.",
      },
      {
        title: "In-person gatherings",
        text: "From the digital hut to real-world hugs, listening, and growth together.",
      },
    ],
    closingQuote:
      "“In the digital world: reclaim the narrative, share experience, protect yourself, and root a safer space.”",
    footer: "Menstrual Hut · Gentle records, lasting companionship",
  },
} as const;
