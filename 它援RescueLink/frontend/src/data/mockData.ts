export interface CaseItem {
  id: string;
  title: string;
  animalType: '猫' | '狗' | '其他';
  status: string;
  location: string;
  city: string;
  distance?: string;
  updatedAt: string;
  isUrgent: boolean;
  urgencyLevel: '一般' | '较急' | '紧急';
  image: string;
  description: string;
  contact: string;
  helpType: 'emergency' | 'supply' | 'foster' | 'adopt' | 'lost';
  urgentNeed?: string;
  heatValue: number;
  needs: NeedItem[];
  /** What the initiator has already done */
  initiatorDone: string[];
  timeline: TimelineItem[];
  evidences: EvidenceItem[];
}

export interface NeedItem {
  id: string;
  name: string;
  fulfilled: boolean;
  /** 'help' = real help needs (contact-based), 'spread' = spread support */
  category: 'help' | 'spread';
  desc?: string;
}

export interface TimelineItem {
  date: string;
  content: string;
  type: 'update' | 'milestone' | 'evidence';
}

export interface EvidenceItem {
  id: string;
  type: string;
  uploadedAt: string;
  confirmed: boolean;
  chainStatus?: 'pending' | 'stored' | 'not_stored';
  chainHash?: string;
  chainId?: string;
}

export interface ShopItem {
  id: string;
  name: string;
  price: string;
  points: number;
  image: string;
  category: string;
}

export interface GuideItem {
  id: string;
  title: string;
  summary: string;
  points: number;
  readTime: string;
  category: string;
}

export interface LostPetClue {
  id: string;
  petId: string;
  photo: string;
  time: string;
  location: string;
  lat: number;
  lng: number;
  note: string;
  status: '待确认' | '已采纳' | '已排除';
  submitter: string;
  points: number;
}

export interface ShelterItem {
  id: string;
  name: string;
  location: string;
  avatar: string;
  description: string;
  animalCount: number;
  supplyNeeds: ShelterSupplyNeed[];
  redeemableItems: ShelterRedeemItem[];
  feedbackMessages: string[];
  urgency: '日常' | '紧缺';
}

export interface ShelterSupplyNeed {
  id: string;
  name: string;
  pointsCost: number;
  fulfilled: boolean;
  desc?: string;
}

export interface ShelterRedeemItem {
  id: string;
  name: string;
  pointsCost: number;
  desc: string;
  shelterName: string;
}

export const mockUser = {
  name: 'Bala',
  avatar: '',
  totalPoints: 600,
  todayEarned: 35,
  todayRemaining: 65,
  level: '爱心守护者',
  badges: ['初心救助者', '助力先锋', '传播之星'],
  casesPublished: 3,
  casesFollowed: 8,
  helpsGiven: 12,
};

export const mockCases: CaseItem[] = [
  {
    id: '1',
    title: '浦东新区受伤橘猫急需送医',
    animalType: '猫',
    status: '待送医',
    location: '浦东新区张江镇',
    city: '浦东新区',
    distance: '1.2km',
    updatedAt: '10分钟前',
    isUrgent: true,
    urgencyLevel: '紧急',
    image: '',
    description: '张江镇小区绿化带发现一只受伤橘猫，右前腿疑似骨折，精神较差，需要尽快送医治疗。',
    contact: '微信：rescue_sh_001',
    helpType: 'emergency',
    urgentNeed: '急需送医',
    heatValue: 86,
    initiatorDone: [
      '已拍照记录现场情况',
      '已完成基础临时安置',
      '正在联系附近可接诊医院',
    ],
    needs: [
      { id: 'n1', name: '协助转运', fulfilled: false, category: 'help', desc: '需要车辆协助送至张江附近宠物医院' },
      { id: 'n2', name: '临时安置', fulfilled: false, category: 'help', desc: '如今晚无法完成治疗，需1–3天临时照护' },
      { id: 'n3', name: '基础检查', fulfilled: false, category: 'help', desc: '首诊、拍片与基础处理' },
      { id: 'n4', name: '帮忙扩散', fulfilled: false, category: 'spread', desc: '分享到宠物群、朋友圈帮助更多人看到' },
    ],
    timeline: [
      { date: '2026-04-03 14:30', content: '在张江镇小区绿化带发现受伤橘猫', type: 'milestone' },
      { date: '2026-04-03 14:45', content: '已完成基础临时安置', type: 'update' },
      { date: '2026-04-03 15:00', content: '发布救助信息，等待送医资源', type: 'update' },
    ],
    evidences: [
      { id: 'e1', type: '现场照片', uploadedAt: '2026-04-03 14:32', confirmed: true, chainStatus: 'stored', chainHash: '0xab3f...7e2d', chainId: 'AVX-2026-0403-001' },
      { id: 'e2', type: '临时安置记录', uploadedAt: '2026-04-03 14:48', confirmed: true, chainStatus: 'pending' },
    ],
  },
  {
    id: '2',
    title: '流浪狗妈妈带4只幼崽需要寄养',
    animalType: '狗',
    status: '待安置',
    location: '浦东新区世纪公园',
    city: '浦东新区',
    distance: '3.8km',
    updatedAt: '1小时前',
    isUrgent: false,
    urgencyLevel: '较急',
    image: '',
    description: '世纪公园南门附近发现流浪狗妈妈带着4只幼崽，狗妈妈已绝育（耳标），幼崽约3周大，需要临时寄养。',
    contact: '微信：rescue_sh_002',
    helpType: 'foster',
    heatValue: 52,
    initiatorDone: [
      '已确认狗妈妈已绝育（耳标）',
      '已确认幼崽数量与基础情况',
      '已完成临时投喂',
    ],
    needs: [
      { id: 'n5', name: '寄养家庭', fulfilled: false, category: 'help', desc: '需要有经验的临时寄养家庭接手' },
      { id: 'n6', name: '基础体检', fulfilled: false, category: 'help', desc: '狗妈妈和幼崽的基础健康检查' },
      { id: 'n7', name: '领养接手', fulfilled: false, category: 'help', desc: '幼崽长大后需要领养人' },
      { id: 'n8', name: '帮忙扩散', fulfilled: false, category: 'spread', desc: '分享到领养群帮助更多人看到' },
    ],
    timeline: [
      { date: '2026-04-02 09:00', content: '在世纪公园南门发现狗妈妈和幼崽', type: 'milestone' },
      { date: '2026-04-02 11:00', content: '确认狗妈妈已绝育', type: 'update' },
      { date: '2026-04-03 08:00', content: '已完成临时投喂', type: 'update' },
    ],
    evidences: [
      { id: 'e3', type: '现场照片', uploadedAt: '2026-04-02 09:05', confirmed: true, chainStatus: 'stored', chainHash: '0xcd5e...9a1b', chainId: 'AVX-2026-0402-003' },
    ],
  },
  {
    id: '3',
    title: '陆家嘴绿地受伤白猫待治疗',
    animalType: '猫',
    status: '治疗中',
    location: '浦东新区陆家嘴',
    city: '浦东新区',
    distance: '5.4km',
    updatedAt: '3小时前',
    isUrgent: false,
    urgencyLevel: '一般',
    image: '',
    description: '陆家嘴中心绿地发现一只白色流浪猫，后腿有外伤，已送至附近宠物医院，目前在治疗中。',
    contact: '微信：rescue_sh_003',
    helpType: 'emergency',
    heatValue: 134,
    initiatorDone: [
      '已送至宠物医院',
      '已完成基础检查和清创',
      '已上传医院单据',
    ],
    needs: [
      { id: 'n10', name: '后续复查', fulfilled: false, category: 'help', desc: '术后需要定期复查' },
      { id: 'n11', name: '帮忙扩散', fulfilled: false, category: 'spread', desc: '分享帮助更多人关注' },
    ],
    timeline: [
      { date: '2026-04-03 08:00', content: '在陆家嘴中心绿地发现受伤白猫', type: 'milestone' },
      { date: '2026-04-03 09:30', content: '送至附近宠物医院', type: 'milestone' },
      { date: '2026-04-03 11:00', content: '完成基础检查和清创处理', type: 'update' },
    ],
    evidences: [
      { id: 'e4', type: '医院单据', uploadedAt: '2026-04-03 11:00', confirmed: true, chainStatus: 'stored', chainHash: '0xef12...3c4d', chainId: 'AVX-2026-0403-005' },
      { id: 'e5', type: '现场照片', uploadedAt: '2026-04-03 08:10', confirmed: true, chainStatus: 'stored', chainHash: '0x1234...5678', chainId: 'AVX-2026-0403-006' },
    ],
  },
  {
    id: '4',
    title: '被弃养泰迪寻找新家',
    animalType: '狗',
    status: '待安置',
    location: '浦东新区金桥',
    city: '浦东新区',
    distance: '6.1km',
    updatedAt: '昨天',
    isUrgent: false,
    urgencyLevel: '一般',
    image: '',
    description: '金桥国际小区门口发现一只约2岁泰迪被弃养，已完成体检和疫苗接种，性格温顺亲人，寻找领养人。',
    contact: '微信：rescue_sh_004',
    helpType: 'adopt',
    heatValue: 28,
    initiatorDone: [
      '已完成体检和疫苗接种',
      '已发布领养信息',
      '已临时寄养中',
    ],
    needs: [
      { id: 'n15', name: '领养接手', fulfilled: false, category: 'help', desc: '适合有养宠经验的领养人' },
      { id: 'n16', name: '帮忙扩散', fulfilled: false, category: 'spread', desc: '分享到领养群帮助找到合适主人' },
    ],
    timeline: [
      { date: '2026-03-30', content: '在金桥国际小区门口发现被弃养泰迪', type: 'milestone' },
      { date: '2026-04-01', content: '完成体检和疫苗接种', type: 'milestone' },
      { date: '2026-04-02', content: '发布领养信息', type: 'update' },
    ],
    evidences: [
      { id: 'e7', type: '体检报告', uploadedAt: '2026-04-01 14:00', confirmed: true, chainStatus: 'stored', chainHash: '0xaaaa...bbbb', chainId: 'AVX-2026-0401-010' },
    ],
  },
  {
    id: '5',
    title: '川沙路边发现受伤流浪犬',
    animalType: '狗',
    status: '治疗中',
    location: '浦东新区川沙',
    city: '浦东新区',
    distance: '9.3km',
    updatedAt: '2小时前',
    isUrgent: true,
    urgencyLevel: '紧急',
    image: '',
    description: '川沙镇路边发现一只受伤中型犬，后腿有明显外伤，已送至宠物医院，目前正在治疗中。',
    contact: '微信：rescue_sh_005',
    helpType: 'emergency',
    urgentNeed: '后续护理',
    heatValue: 67,
    initiatorDone: [
      '已成功救出并送至宠物医院',
      '已开始手术治疗',
      '已上传医院收治记录',
    ],
    needs: [
      { id: 'n18', name: '后续复查', fulfilled: false, category: 'help', desc: '术后需要定期复查' },
      { id: 'n19', name: '临时安置', fulfilled: false, category: 'help', desc: '出院后需要安静休养环境' },
      { id: 'n20', name: '领养接手', fulfilled: false, category: 'help', desc: '康复后寻找长期领养人' },
      { id: 'n21', name: '帮忙扩散', fulfilled: false, category: 'spread', desc: '分享帮助更多人看到' },
    ],
    timeline: [
      { date: '2026-04-03 10:00', content: '在川沙镇路边发现受伤流浪犬', type: 'milestone' },
      { date: '2026-04-03 11:30', content: '成功救出并送医', type: 'milestone' },
      { date: '2026-04-03 13:00', content: '开始手术治疗', type: 'update' },
    ],
    evidences: [
      { id: 'e8', type: '医院收治记录', uploadedAt: '2026-04-03 11:35', confirmed: true, chainStatus: 'pending' },
    ],
  },
];

export const mockLostPets = [
  { id: 'l1', type: '狗', name: '豆豆', location: '上海市徐汇区衡山路', lostDate: '2026-03-30', features: '白色比熊，左耳有棕色斑', contact: '微信：find_pet_002', lat: 31.214, lng: 121.448, reward: '¥500', mode: 'reward' as const },
  { id: 'l2', type: '狗', name: '大黄', location: '上海市浦东新区世纪公园', lostDate: '2026-04-01', features: '黄色中华田园犬，戴红色项圈', contact: '微信：find_pet_004', lat: 31.218, lng: 121.544, reward: '¥300', mode: 'reward' as const },
  { id: 'l3', type: '狗', name: 'Lucky', location: '上海市静安区南京西路', lostDate: '2026-04-02', features: '棕色泰迪，穿蓝色衣服', contact: '微信：find_pet_005', lat: 31.229, lng: 121.450, reward: '', mode: 'reward' as const },
];

export interface SpottedPet {
  id: string;
  photo: string;
  time: string;
  location: string;
  description: string;
  submitter: string;
  animalType: '猫' | '狗' | '其他';
  status: '待认领' | '已匹配' | '已关闭';
}

export const mockSpottedPets: SpottedPet[] = [
  { id: 'sp1', photo: '', time: '2026-04-03 16:20', location: '徐汇区复兴西路', description: '一只白色小型犬在路边徘徊，看起来很干净，疑似走失', submitter: '热心市民A', animalType: '狗', status: '待认领' },
  { id: 'sp2', photo: '', time: '2026-04-03 09:45', location: '浦东新区陆家嘴花园', description: '发现一只棕色泰迪在绿化带附近，穿着衣服，不怕人', submitter: '热心市民B', animalType: '狗', status: '已匹配' },
  { id: 'sp3', photo: '', time: '2026-04-02 18:30', location: '静安区愚园路', description: '一只黄色中型犬在小区门口等了很久，有红色项圈', submitter: '热心市民C', animalType: '狗', status: '待认领' },
];

export const mockClues: LostPetClue[] = [
  { id: 'c1', petId: 'l1', photo: '', time: '2026-04-02 15:30', location: '徐汇区衡山路地铁站附近', lat: 31.214, lng: 121.448, note: '看到一只白色比熊在路边徘徊', status: '已采纳', submitter: '热心市民A', points: 15 },
  { id: 'c2', petId: 'l1', photo: '', time: '2026-04-03 08:15', location: '徐汇区复兴西路', lat: 31.210, lng: 121.440, note: '早上遛弯看到一只白色小狗从绿化带跑过', status: '待确认', submitter: '热心市民B', points: 10 },
  { id: 'c3', petId: 'l2', photo: '', time: '2026-04-03 11:40', location: '浦东新区世纪公园东门', lat: 31.218, lng: 121.544, note: '看到一只黄色中型犬戴红色项圈，在草坪上', status: '待确认', submitter: '热心市民C', points: 10 },
  { id: 'c4', petId: 'l3', photo: '', time: '2026-04-01 19:00', location: '静安区南京西路', lat: 31.229, lng: 121.450, note: '看到一只棕色泰迪穿蓝色衣服在商场附近', status: '已采纳', submitter: '热心市民D', points: 15 },
];

export const mockAdoptions = [
  { id: 'a1', type: '猫', name: '花花', age: '约1岁', gender: '母', location: '上海', status: '可领养', features: '三花猫，已绝育已免疫', character: '亲人粘人' },
  { id: 'a2', type: '狗', name: '旺财', age: '约3岁', gender: '公', location: '上海', status: '可领养', features: '中华田园犬，已绝育', character: '温顺听话' },
  { id: 'a3', type: '猫', name: '雪球', age: '约6个月', gender: '公', location: '上海', status: '待审核', features: '白色长毛，蓝眼睛', character: '活泼好动' },
];

export const mockShelters: ShelterItem[] = [
  {
    id: 'sh1',
    name: '浦东流浪猫救助小院',
    location: '上海 · 浦东新区',
    avatar: '',
    description: '专注社区流浪猫TNR与救助，目前收容32只猫咪，日常运营需要持续物资支持。',
    animalCount: 32,
    urgency: '紧缺',
    supplyNeeds: [
      { id: 'sn1', name: '猫粮 50斤', pointsCost: 150, fulfilled: false, desc: '日常口粮，约可维持2周' },
      { id: 'sn2', name: '猫砂 20袋', pointsCost: 100, fulfilled: false, desc: '膨润土猫砂，每周消耗约10袋' },
      { id: 'sn3', name: '驱虫药 30支', pointsCost: 80, fulfilled: true, desc: '体内外驱虫' },
    ],
    redeemableItems: [
      { id: 'ri1', name: '买给小院：猫粮5斤装', pointsCost: 50, desc: '直接寄送到小院，含物流追踪', shelterName: '浦东流浪猫救助小院' },
      { id: 'ri2', name: '买给小院：猫砂5袋', pointsCost: 40, desc: '直接寄送到小院，含物流追踪', shelterName: '浦东流浪猫救助小院' },
    ],
    feedbackMessages: [
      '感谢大家上周捐赠的猫粮，32只毛孩子吃得很开心！',
      '本月已完成3只社区猫的绝育手术，谢谢每一位支持者。',
    ],
  },
  {
    id: 'sh2',
    name: '浦东爱心狗狗之家',
    location: '上海 · 浦东新区',
    avatar: '',
    description: '收容被弃养和流浪狗只，提供医疗、寄养和领养服务，目前照护18只狗狗。',
    animalCount: 18,
    urgency: '日常',
    supplyNeeds: [
      { id: 'sn4', name: '狗粮 80斤', pointsCost: 200, fulfilled: false, desc: '大中型犬粮，约可维持10天' },
      { id: 'sn5', name: '笼子 5个', pointsCost: 120, fulfilled: false, desc: '中型犬用不锈钢笼' },
      { id: 'sn6', name: '垫子 10个', pointsCost: 60, fulfilled: true, desc: '保暖棉垫' },
    ],
    redeemableItems: [
      { id: 'ri3', name: '买给小院：狗粮10斤装', pointsCost: 60, desc: '直接寄送到小院，含物流追踪', shelterName: '浦东爱心狗狗之家' },
    ],
    feedbackMessages: [
      '上个月有2只狗狗成功被领养，感谢大家的扩散！',
      '新到了一批垫子，狗狗们终于不用睡硬地板了。',
    ],
  },
  {
    id: 'sh3',
    name: '徐汇社区猫TNR基地',
    location: '上海 · 徐汇区',
    avatar: '',
    description: '社区猫绝育与管理基地，与多家医院合作开展TNR计划。',
    animalCount: 45,
    urgency: '日常',
    supplyNeeds: [
      { id: 'sn7', name: '绝育名额 x10', pointsCost: 300, fulfilled: false, desc: '每只含手术费及术后观察' },
      { id: 'sn8', name: '术后恢复用品', pointsCost: 80, fulfilled: false },
    ],
    redeemableItems: [
      { id: 'ri4', name: '买给小院：术后营养罐头x6', pointsCost: 45, desc: '直接寄送到小院，含物流追踪', shelterName: '徐汇社区猫TNR基地' },
    ],
    feedbackMessages: [
      '第11期TNR计划圆满完成，共绝育12只社区猫。',
    ],
  },
];

export const mockShelterNeeds = [
  { id: 's1', shelter: '浦东流浪猫救助小院', location: '上海', needs: ['猫粮 50斤', '猫砂 20袋', '驱虫药 30支'], points: 400, urgency: '日常' },
  { id: 's2', shelter: '浦东爱心狗狗之家', location: '上海', needs: ['狗粮 80斤', '笼子 5个', '垫子 10个'], points: 600, urgency: '紧缺' },
  { id: 's3', shelter: '徐汇社区猫TNR基地', location: '上海', needs: ['绝育名额 10个', '术后恢复用品', '协助转运'], points: 800, urgency: '日常' },
];

export const mockShopItems: ShopItem[] = [
  // 猫用品
  { id: 'sh1', name: '皇家猫粮 2kg', price: '¥68', points: 20, image: '', category: '猫用品' },
  { id: 'sh2', name: '猫砂 10L 豆腐砂', price: '¥35', points: 10, image: '', category: '猫用品' },
  { id: 'sh3', name: '猫罐头 6连罐', price: '¥45', points: 15, image: '', category: '猫用品' },
  { id: 'sh4', name: '猫抓板 瓦楞纸', price: '¥19', points: 8, image: '', category: '猫用品' },
  // 狗用品
  { id: 'sh5', name: '狗粮 5kg 通用型', price: '¥89', points: 25, image: '', category: '狗用品' },
  { id: 'sh6', name: '牵引绳 可伸缩', price: '¥29', points: 10, image: '', category: '狗用品' },
  { id: 'sh7', name: '狗零食 鸡肉干', price: '¥25', points: 8, image: '', category: '狗用品' },
  { id: 'sh8', name: '狗窝 保暖垫 M码', price: '¥59', points: 18, image: '', category: '狗用品' },
  // 医疗
  { id: 'sh9', name: '体外驱虫滴剂 3支', price: '¥55', points: 15, image: '', category: '医疗' },
  { id: 'sh10', name: '宠物急救包', price: '¥39', points: 12, image: '', category: '医疗' },
  { id: 'sh11', name: '术后恢复营养膏', price: '¥32', points: 10, image: '', category: '医疗' },
  // 文创
  { id: 'sh12', name: '它援定制帆布袋', price: '¥39', points: 15, image: '', category: '文创' },
  { id: 'sh13', name: '流浪猫明信片套装', price: '¥25', points: 10, image: '', category: '文创' },
  { id: 'sh14', name: '它援联名T恤', price: '¥89', points: 35, image: '', category: '文创' },
  { id: 'sh15', name: '流浪动物日历', price: '¥35', points: 15, image: '', category: '文创' },
];

export const mockGuides: GuideItem[] = [
  { id: 'g1', title: '发现流浪动物怎么办？', summary: '新手救助第一步指南', points: 10, readTime: '3分钟', category: '入门' },
  { id: 'g2', title: '如何安全捕捉受伤流浪猫', summary: '工具准备与操作要点', points: 10, readTime: '5分钟', category: '技能' },
  { id: 'g3', title: '送医前的急救处理', summary: '基础伤口处理与保温方法', points: 15, readTime: '4分钟', category: '技能' },
  { id: 'g4', title: '寄养须知：给临时家庭的建议', summary: '寄养前需要准备什么', points: 10, readTime: '5分钟', category: '寄养' },
  { id: 'g5', title: '负责任的领养：你准备好了吗？', summary: '领养前的自我评估', points: 10, readTime: '6分钟', category: '领养' },
];

export const helpActions = [
  { id: 'h1', name: '分享救助案例', desc: '将案例分享到朋友圈或群聊', points: 5, icon: '📤', daily: true },
  { id: 'h2', name: '阅读救助指南', desc: '学习一篇救助知识文章', points: 10, icon: '📖', daily: true },
  { id: 'h3', name: '邀请新用户', desc: '邀请朋友加入它援', points: 20, icon: '👥', daily: false },
  { id: 'h4', name: '逛逛公益商城', desc: '购买公益商品获得助力值', points: 15, icon: '🛍️', daily: true },
  { id: 'h5', name: '提供寄养线索', desc: '知道可以寄养的家庭？告诉我们', points: 15, icon: '🏠', daily: false },
  { id: 'h6', name: '提供领养线索', desc: '帮助流浪动物找到新家', points: 15, icon: '💛', daily: false },
  { id: 'h7', name: '协助转运', desc: '参与现场救助或运输', points: 30, icon: '🤝', daily: false },
  { id: 'h8', name: '上传可信凭证', desc: '为案例补充真实记录', points: 10, icon: '📋', daily: true },
];

export const caseHelpActions = [
  { id: 'ch1', name: '顶一顶', desc: '帮它增加热力值，让更多人看到', icon: '🐾' },
  { id: 'ch2', name: '联系发起人', desc: '直接联系发起人确认如何帮助', icon: '📞' },
  { id: 'ch3', name: '帮忙扩散', desc: '生成海报或复制文案分享出去', icon: '📤' },
];
