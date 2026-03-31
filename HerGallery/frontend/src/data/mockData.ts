export interface Exhibition {
  id: number;
  curator: string;
  title: string;
  coverHash: string;
  contentHash: string;
  createdAt: number;
  isActive: boolean;
  submissionCount: number;
}

export interface Submission {
  id: number;
  creator: string;
  contentType: number; // 0=二创, 1=证言, 2=截图, 3=链接
  contentHash: string;
  title: string;
  description: string;
  recommendCount: number;
  createdAt: number;
}

export const CONTENT_TYPES = ['二创', '证言', '截图', '链接'] as const;
export const CONTENT_ICONS = ['🎨', '💬', '📸', '🔗'] as const;

const now = Math.floor(Date.now() / 1000);

export const mockExhibitions: Exhibition[] = [
  {
    id: 1,
    curator: '0x7E3f1a2B8C9d4E5F6A7b8C9d0E1F2A3B4C5D6E7F',
    title: '她的星球 — 女性创作者群像',
    coverHash: '',
    contentHash: '',
    createdAt: now - 86400 * 3,
    isActive: true,
    submissionCount: 12,
  },
  {
    id: 2,
    curator: '0xAaBbCcDd1234567890AbCdEf1234567890AbCdEf',
    title: '数字花园 · 春日限定',
    coverHash: '',
    contentHash: '',
    createdAt: now - 86400 * 7,
    isActive: true,
    submissionCount: 8,
  },
  {
    id: 3,
    curator: '0x1234567890AbCdEf1234567890AbCdEf12345678',
    title: '链上记忆 — Web3 女性故事',
    coverHash: '',
    contentHash: '',
    createdAt: now - 86400 * 14,
    isActive: true,
    submissionCount: 24,
  },
  {
    id: 4,
    curator: '0xDeAdBeEf00000000000000000000000000000001',
    title: '像素之间 · 她们的世界',
    coverHash: '',
    contentHash: '',
    createdAt: now - 86400 * 1,
    isActive: true,
    submissionCount: 3,
  },
  {
    id: 5,
    curator: '0xCaFeBaBe00000000000000000000000000000002',
    title: '温柔的力量',
    coverHash: '',
    contentHash: '',
    createdAt: now - 86400 * 21,
    isActive: false,
    submissionCount: 31,
  },
  {
    id: 6,
    curator: '0xFaCeFeeD00000000000000000000000000000003',
    title: '无界 · 女性艺术探索',
    coverHash: '',
    contentHash: '',
    createdAt: now - 86400 * 5,
    isActive: true,
    submissionCount: 15,
  },
];

export const mockSubmissions: Submission[] = [
  {
    id: 1,
    creator: '0xAaBbCcDd1234567890AbCdEf1234567890AbCdEf',
    contentType: 0,
    contentHash: '',
    title: '星空下的她',
    description: '用数字画笔描绘了一位仰望星空的女性，象征着对未知的探索与勇气。',
    recommendCount: 18,
    createdAt: now - 86400 * 2,
  },
  {
    id: 2,
    creator: '0x1234567890AbCdEf1234567890AbCdEf12345678',
    contentType: 1,
    contentHash: '',
    title: '我的 Web3 旅程',
    description: '从零开始学习区块链，到成为社区贡献者。这条路虽然曲折，但每一步都值得。',
    recommendCount: 25,
    createdAt: now - 86400 * 1,
  },
  {
    id: 3,
    creator: '0xDeAdBeEf00000000000000000000000000000001',
    contentType: 2,
    contentHash: '',
    title: '第一次 Mint 的瞬间',
    description: '记录下第一次成功 Mint NFT 时的截图，那一刻的激动无法言喻。',
    recommendCount: 7,
    createdAt: now - 86400 * 3,
  },
  {
    id: 4,
    creator: '0xCaFeBaBe00000000000000000000000000000002',
    contentType: 3,
    contentHash: '',
    title: '推荐：女性 DAO 资源合集',
    description: '汇总了目前最活跃的几个女性 DAO 组织和学习资源。',
    recommendCount: 12,
    createdAt: now - 86400 * 4,
  },
  {
    id: 5,
    creator: '0xFaCeFeeD00000000000000000000000000000003',
    contentType: 0,
    contentHash: '',
    title: '破茧',
    description: '一幅关于突破与蜕变的插画作品，致敬每一位勇敢的她。',
    recommendCount: 30,
    createdAt: now - 86400 * 1,
  },
];
