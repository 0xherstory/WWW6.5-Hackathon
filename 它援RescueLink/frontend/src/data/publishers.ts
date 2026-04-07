export type AccountType = 'personal' | 'shelter';

export interface Publisher {
  id: string;
  name: string;
  avatar: string;
  type: AccountType;
  city: string;
  bio: string;
  totalPoints: number;
  casesPublished: number;
  updatesCount: number;
  helpsReceived: number;
  followers: number;
  // Shelter-specific
  certifiedShelter?: boolean;
  longTermNeeds?: string[];
}

export const mockPublishers: Publisher[] = [
  {
    id: 'p1',
    name: '小王救助中',
    avatar: '',
    type: 'personal',
    city: '北京',
    bio: '独立救助人，关注朝阳区流浪猫群护。每周末定期巡查投喂。',
    totalPoints: 860,
    casesPublished: 3,
    updatesCount: 12,
    helpsReceived: 28,
    followers: 45,
  },
  {
    id: 'p2',
    name: '喵星小院',
    avatar: '',
    type: 'shelter',
    city: '上海',
    bio: '专注流浪猫狗TNR与领养的民间救助小院，已运营4年，累计救助超过300只。',
    totalPoints: 4200,
    casesPublished: 18,
    updatesCount: 86,
    helpsReceived: 210,
    followers: 520,
    certifiedShelter: true,
    longTermNeeds: ['猫粮 50斤/月', '猫砂 30袋/月', '驱虫药', '协助转运'],
  },
  {
    id: 'p3',
    name: 'TNR广州站',
    avatar: '',
    type: 'shelter',
    city: '广州',
    bio: '天河区社区猫TNR执行团队，与多家宠物医院合作，定期开展绝育计划。',
    totalPoints: 3600,
    casesPublished: 12,
    updatesCount: 54,
    helpsReceived: 160,
    followers: 380,
    certifiedShelter: true,
    longTermNeeds: ['绝育名额', '术后护理用品', '运输笼具', '协助转运'],
  },
  {
    id: 'p4',
    name: '成都领养君',
    avatar: '',
    type: 'personal',
    city: '成都',
    bio: '帮助被弃养的毛孩子找到新家，坚持科学领养、负责到底。',
    totalPoints: 520,
    casesPublished: 5,
    updatesCount: 20,
    helpsReceived: 35,
    followers: 88,
  },
  {
    id: 'p5',
    name: '深圳流浪犬救助',
    avatar: '',
    type: 'personal',
    city: '深圳',
    bio: '关注深圳南山区流浪犬救助，致力于紧急医疗救助和转运。',
    totalPoints: 720,
    casesPublished: 4,
    updatesCount: 15,
    helpsReceived: 42,
    followers: 67,
  },
];

// Map case IDs to publisher IDs
export const casePublisherMap: Record<string, string> = {
  '1': 'p1',
  '2': 'p2',
  '3': 'p3',
  '4': 'p4',
  '5': 'p5',
};

export const getPublisherForCase = (caseId: string): Publisher | undefined => {
  const publisherId = casePublisherMap[caseId];
  return mockPublishers.find((p) => p.id === publisherId);
};
