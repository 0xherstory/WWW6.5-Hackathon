export interface Card {
  id: string;
  name: string;
  cnName: string;
  imagePath: string;      // 主路径（WebP）
  fallbackPath: string;   // 后备路径（PNG）
  trackId: number; // 轨迹ID: 1-6
  stage: number; // 阶段ID: 1-5
}

export interface WordCard {
  id: string;
  word: string;        // 中文词
  meaning: string;     // 中文含义
  enWord: string;      // 英文词
  enMeaning: string;   // 英文含义
  trackId?: number;    // 所属轨迹ID（1-6）
}

export interface EmotionTrack {
  id: number;
  name: string;
  description: string;
  color: string;
}

// 6组情绪轨迹配置
export const EMOTION_TRACKS: EmotionTrack[] = [
  {
    id: 1,
    name: "疗愈复原",
    description: "从创伤到释怀的疗愈之旅",
    color: "#4CAF50",
  },
  {
    id: 2,
    name: "潜能突破",
    description: "发现内在潜能与力量",
    color: "#2196F3",
  },
  {
    id: 3,
    name: "自我建构",
    description: "探索自我认同与成长",
    color: "#FFC107",
  },
  {
    id: 4,
    name: "关系演变",
    description: "理解人际关系的深层模式",
    color: "#FF5722",
  },
  {
    id: 5,
    name: "内在秩序",
    description: "建立内在的平衡与秩序",
    color: "#9C27B0",
  },
  {
    id: 6,
    name: "生命流转",
    description: "拥抱生命的变化与循环",
    color: "#00BCD4",
  },
];

// 6组情绪轨迹，每组5个阶段，共30张卡
export const IMAGE_CARDS: Card[] = [
  // 轨迹1：疗愈复原
  { id: "1-1", name: "Trauma", cnName: "创伤", imagePath: "/cards/images-webp/1-1.webp", fallbackPath: "/cards/images/1-1.png", trackId: 1, stage: 1 },
  { id: "1-2", name: "Protection/Isolation", cnName: "保护隔离", imagePath: "/cards/images-webp/1-2.webp", fallbackPath: "/cards/images/1-2.png", trackId: 1, stage: 2 },
  { id: "1-3", name: "Recovery", cnName: "复原", imagePath: "/cards/images-webp/1-3.webp", fallbackPath: "/cards/images/1-3.png", trackId: 1, stage: 3 },
  { id: "1-4", name: "Hope", cnName: "希望", imagePath: "/cards/images-webp/1-4.webp", fallbackPath: "/cards/images/1-4.png", trackId: 1, stage: 4 },
  { id: "1-5", name: "Letting Go", cnName: "放手", imagePath: "/cards/images-webp/1-5.webp", fallbackPath: "/cards/images/1-5.png", trackId: 1, stage: 5 },

  // 轨迹2：潜能突破
  { id: "2-1", name: "Potential", cnName: "潜能", imagePath: "/cards/images-webp/2-1.webp", fallbackPath: "/cards/images/2-1.png", trackId: 2, stage: 1 },
  { id: "2-2", name: "Resilience", cnName: "韧性", imagePath: "/cards/images-webp/2-2.webp", fallbackPath: "/cards/images/2-2.png", trackId: 2, stage: 2 },
  { id: "2-3", name: "Adaptability", cnName: "适应力", imagePath: "/cards/images-webp/2-3.webp", fallbackPath: "/cards/images/2-3.png", trackId: 2, stage: 3 },
  { id: "2-4", name: "Strength", cnName: "力量", imagePath: "/cards/images-webp/2-4.webp", fallbackPath: "/cards/images/2-4.png", trackId: 2, stage: 4 },
  { id: "2-5", name: "Integration", cnName: "整合", imagePath: "/cards/images-webp/2-5.webp", fallbackPath: "/cards/images/2-5.png", trackId: 2, stage: 5 },

  // 轨迹3：自我建构
  { id: "3-1", name: "Unconscious", cnName: "潜意识", imagePath: "/cards/images-webp/3-1.webp", fallbackPath: "/cards/images/3-1.png", trackId: 3, stage: 1 },
  { id: "3-2", name: "Aspiration", cnName: "渴望", imagePath: "/cards/images-webp/3-2.webp", fallbackPath: "/cards/images/3-2.png", trackId: 3, stage: 2 },
  { id: "3-3", name: "Self", cnName: "自我", imagePath: "/cards/images-webp/3-3.webp", fallbackPath: "/cards/images/3-3.png", trackId: 3, stage: 3 },
  { id: "3-4", name: "Joy", cnName: "喜悦", imagePath: "/cards/images-webp/3-4.webp", fallbackPath: "/cards/images/3-4.png", trackId: 3, stage: 4 },
  { id: "3-5", name: "Transformation", cnName: "转化", imagePath: "/cards/images-webp/3-5.webp", fallbackPath: "/cards/images/3-5.png", trackId: 3, stage: 5 },

  // 轨迹4：关系演变
  { id: "4-1", name: "Emotion", cnName: "情绪", imagePath: "/cards/images-webp/4-1.webp", fallbackPath: "/cards/images/4-1.png", trackId: 4, stage: 1 },
  { id: "4-2", name: "Dependency", cnName: "依赖", imagePath: "/cards/images-webp/4-2.webp", fallbackPath: "/cards/images/4-2.png", trackId: 4, stage: 2 },
  { id: "4-3", name: "Defense", cnName: "防御", imagePath: "/cards/images-webp/4-3.webp", fallbackPath: "/cards/images/4-3.png", trackId: 4, stage: 3 },
  { id: "4-4", name: "Relationships", cnName: "关系", imagePath: "/cards/images-webp/4-4.webp", fallbackPath: "/cards/images/4-4.png", trackId: 4, stage: 4 },
  { id: "4-5", name: "Collective", cnName: "集体", imagePath: "/cards/images-webp/4-5.webp", fallbackPath: "/cards/images/4-5.png", trackId: 4, stage: 5 },

  // 轨迹5：内在秩序
  { id: "5-1", name: "Inner World", cnName: "内心世界", imagePath: "/cards/images-webp/5-1.webp", fallbackPath: "/cards/images/5-1.png", trackId: 5, stage: 1 },
  { id: "5-2", name: "Nurture", cnName: "养育", imagePath: "/cards/images-webp/5-2.webp", fallbackPath: "/cards/images/5-2.png", trackId: 5, stage: 2 },
  { id: "5-3", name: "Control", cnName: "控制", imagePath: "/cards/images-webp/5-3.webp", fallbackPath: "/cards/images/5-3.png", trackId: 5, stage: 3 },
  { id: "5-4", name: "Complexity", cnName: "复杂性", imagePath: "/cards/images-webp/5-4.webp", fallbackPath: "/cards/images/5-4.png", trackId: 5, stage: 4 },
  { id: "5-5", name: "Balance", cnName: "平衡", imagePath: "/cards/images-webp/5-5.webp", fallbackPath: "/cards/images/5-5.png", trackId: 5, stage: 5 },

  // 轨迹6：生命流转
  { id: "6-1", name: "Journey", cnName: "旅程", imagePath: "/cards/images-webp/6-1.webp", fallbackPath: "/cards/images/6-1.png", trackId: 6, stage: 1 },
  { id: "6-2", name: "Masking", cnName: "伪装", imagePath: "/cards/images-webp/6-2.webp", fallbackPath: "/cards/images/6-2.png", trackId: 6, stage: 2 },
  { id: "6-3", name: "Diversity", cnName: "多样性", imagePath: "/cards/images-webp/6-3.webp", fallbackPath: "/cards/images/6-3.png", trackId: 6, stage: 3 },
  { id: "6-4", name: "Grief", cnName: "哀伤", imagePath: "/cards/images-webp/6-4.webp", fallbackPath: "/cards/images/6-4.png", trackId: 6, stage: 4 },
  { id: "6-5", name: "Cycle", cnName: "循环", imagePath: "/cards/images-webp/6-5.webp", fallbackPath: "/cards/images/6-5.png", trackId: 6, stage: 5 },
];

// 字卡配置 - 30个字卡，按6组轨迹分组，每组5个
export const WORD_CARDS = [
  { id: "w1", word: "创伤", meaning: "曾经受伤的地方，也是成长的印记", enWord: "Trauma", enMeaning: "Where we were hurt, also marks our growth", trackId: 1 },
  { id: "w2", word: "保护隔离", meaning: "为自己筑起安全的边界，也是疗愈的开始", enWord: "Protection/Isolation", enMeaning: "Building safe boundaries for healing", trackId: 1 },
  { id: "w3", word: "复原", meaning: "受伤后自我修复、重新生长的能力", enWord: "Recovery", enMeaning: "The ability to heal and regrow after injury", trackId: 1 },
  { id: "w4", word: "希望", meaning: "黑暗中依然相信光明的力量", enWord: "Hope", enMeaning: "The power to believe in light even in darkness", trackId: 1 },
  { id: "w5", word: "放手", meaning: "如落叶般释然，放下的智慧", enWord: "Letting Go", enMeaning: "The wisdom of release, like falling leaves", trackId: 1 },
  { id: "w6", word: "潜能", meaning: "尚未绽放的无限可能", enWord: "Potential", enMeaning: "Infinite possibilities yet to bloom", trackId: 2 },
  { id: "w7", word: "韧性", meaning: "风雨中弯曲但不折断的生命力", enWord: "Resilience", enMeaning: "Life force that bends but never breaks", trackId: 2 },
  { id: "w8", word: "适应力", meaning: "如水般随环境而变的柔韧", enWord: "Adaptability", enMeaning: "Flexibility that flows like water", trackId: 2 },
  { id: "w9", word: "力量", meaning: "在逆境中依然挺立的内在能量", enWord: "Strength", enMeaning: "Inner energy that stands tall through adversity", trackId: 2 },
  { id: "w10", word: "整合", meaning: "将碎片化的自我融为一体", enWord: "Integration", enMeaning: "Unifying fragmented parts of self", trackId: 2 },
  { id: "w11", word: "潜意识", meaning: "内心深处未被察觉的真实", enWord: "Unconscious", enMeaning: "The unnoticed truth deep within", trackId: 3 },
  { id: "w12", word: "渴望", meaning: "内心深处真实的向往与追求", enWord: "Aspiration", enMeaning: "True longings from the heart", trackId: 3 },
  { id: "w13", word: "自我", meaning: "回归最原始、最本真的自己", enWord: "Self", enMeaning: "Returning to our most authentic self", trackId: 3 },
  { id: "w14", word: "喜悦", meaning: "发自内心的轻盈与欢欣", enWord: "Joy", enMeaning: "Lightness and delight from within", trackId: 3 },
  { id: "w15", word: "转化", meaning: "破茧成蝶的生命蜕变", enWord: "Transformation", enMeaning: "Life's metamorphosis, like a butterfly emerging", trackId: 3 },
  { id: "w16", word: "情绪", meaning: "如四季般自然起伏的感受", enWord: "Emotion", enMeaning: "Feelings that rise and fall like seasons", trackId: 4 },
  { id: "w17", word: "依赖", meaning: "与滋养我们的人事物建立联结", enWord: "Dependency", enMeaning: "Connection with what nourishes us", trackId: 4 },
  { id: "w18", word: "防御", meaning: "保护自己的柔软内心", enWord: "Defense", enMeaning: "Protecting our tender inner heart", trackId: 4 },
  { id: "w19", word: "关系", meaning: "与他人、与世界建立的纽带", enWord: "Relationships", enMeaning: "Bonds with others and the world", trackId: 4 },
  { id: "w20", word: "集体", meaning: "与万物共同生长的共生智慧", enWord: "Collective", enMeaning: "The wisdom of growing together with all life", trackId: 4 },
  { id: "w21", word: "内心世界", meaning: "探索内心深处的风景与秘密", enWord: "Inner World", enMeaning: "Exploring the landscape and secrets within", trackId: 5 },
  { id: "w22", word: "养育", meaning: "用爱浇灌自己与他人", enWord: "Nurture", enMeaning: "Watering ourselves and others with love", trackId: 5 },
  { id: "w23", word: "控制", meaning: "放下执念，找到掌控与放手的平衡", enWord: "Control", enMeaning: "Finding balance between holding on and letting go", trackId: 5 },
  { id: "w24", word: "复杂性", meaning: "接纳生活本就纷繁的全貌", enWord: "Complexity", enMeaning: "Embracing life's intricate fullness", trackId: 5 },
  { id: "w25", word: "平衡", meaning: "在动静之间找到和谐", enWord: "Balance", enMeaning: "Finding harmony between movement and stillness", trackId: 5 },
  { id: "w26", word: "旅程", meaning: "生命是一场不断探索的远行", enWord: "Journey", enMeaning: "Life as an ever-unfolding exploration", trackId: 6 },
  { id: "w27", word: "伪装", meaning: "卸下面具，看见真实的自己", enWord: "Masking", enMeaning: "Removing masks to see our true selves", trackId: 6 },
  { id: "w28", word: "多样性", meaning: "接纳生命中不同的色彩与可能", enWord: "Diversity", enMeaning: "Embracing life's different colors and possibilities", trackId: 6 },
  { id: "w29", word: "哀伤", meaning: "如秋叶般自然凋零的情绪", enWord: "Grief", enMeaning: "Emotions that fade naturally like autumn leaves", trackId: 6 },
  { id: "w30", word: "循环", meaning: "生命的轮回，周而复始的智慧", enWord: "Cycle", enMeaning: "The wisdom of life's endless cycles", trackId: 6 },
];

export function getCardById(id: string): Card | undefined {
  return IMAGE_CARDS.find((card) => card.id === id);
}

export function getCardsByTrack(trackId: number): Card[] {
  return IMAGE_CARDS.filter((card) => card.trackId === trackId);
}

export function getRandomCards(count: number): Card[] {
  const shuffled = [...IMAGE_CARDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// 字卡相关函数
export function getWordCardById(id: string): WordCard | undefined {
  return WORD_CARDS.find((card) => card.id === id);
}

export function getWordCardsByTrack(trackId: number): WordCard[] {
  return WORD_CARDS.filter((card) => card.trackId === trackId);
}

export function getRandomWordCards(count: number): WordCard[] {
  const shuffled = [...WORD_CARDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
