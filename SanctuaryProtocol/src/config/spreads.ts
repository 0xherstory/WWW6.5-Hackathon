export type SpreadType = "single" | "three" | "five" | "seven" | "ten";

export interface SpreadPosition {
  name: string;
  gridArea: string; // CSS grid-area
  description?: string;
}

export interface Spread {
  type: SpreadType;
  name: string;
  description: string;
  cardCount: number;
  positions: SpreadPosition[];
  gridTemplate: string; // CSS grid-template-areas
  gridCols: number; // 网格列数
  gridRows: number; // 网格行数
}

export const SPREADS: Record<SpreadType, Spread> = {
  single: {
    type: "single",
    name: "单卡探索",
    description: "抽取一张卡牌，获取当下的指引",
    cardCount: 1,
    positions: [
      { name: "当下指引", gridArea: "center" }
    ],
    gridTemplate: `"center"`,
    gridCols: 1,
    gridRows: 1,
  },
  three: {
    type: "three",
    name: "过去-现在-未来",
    description: "三张卡牌，看见时间的流动",
    cardCount: 3,
    positions: [
      { name: "过去的影响", gridArea: "past", description: "影响当下的过去因素" },
      { name: "现在的状态", gridArea: "present", description: "当前的真实状况" },
      { name: "未来的可能", gridArea: "future", description: "可能的发展方向" },
    ],
    gridTemplate: `"past present future"`,
    gridCols: 3,
    gridRows: 1,
  },
  five: {
    type: "five",
    name: "十字牌阵",
    description: "深入探索问题的核心与解决之道",
    cardCount: 5,
    positions: [
      { name: "现状", gridArea: "center", description: "当前状况的核心" },
      { name: "挑战", gridArea: "top", description: "面临的阻碍或挑战" },
      { name: "过去", gridArea: "left", description: "过去的根基" },
      { name: "未来", gridArea: "right", description: "未来的走向" },
      { name: "潜在", gridArea: "bottom", description: "潜在的可能性" },
    ],
    gridTemplate: `
      ". top ."
      "left center right"
      ". bottom ."
    `,
    gridCols: 3,
    gridRows: 3,
  },
  seven: {
    type: "seven",
    name: "七星探索",
    description: "完整的身心灵探索之旅",
    cardCount: 7,
    positions: [
      { name: "王冠", gridArea: "crown", description: "灵性层面，最高指引" },
      { name: "智慧", gridArea: "wisdom", description: "直觉与洞察" },
      { name: "理解", gridArea: "understanding", description: "理性与认知" },
      { name: "美丽", gridArea: "beauty", description: "心轮，平衡与和谐" },
      { name: "胜利", gridArea: "victory", description: "情感与行动" },
      { name: "荣耀", gridArea: "glory", description: "理性与表达" },
      { name: "王国", gridArea: "kingdom", description: "物质世界，身体与当下" },
    ],
    gridTemplate: `
      ". . crown . ."
      "wisdom . . . understanding"
      ". . beauty . ."
      "victory . . . glory"
      ". . kingdom . ."
    `,
    gridCols: 5,
    gridRows: 5,
  },
  ten: {
    type: "ten",
    name: "生命之树",
    description: "卡巴拉生命之树，完整的十质点探索",
    cardCount: 10,
    positions: [
      { name: "王冠", gridArea: "kether", description: "Kether - 神圣意志，灵性源头" },
      { name: "智慧", gridArea: "chokmah", description: "Chokmah - 直觉智慧，阳性力量" },
      { name: "理解", gridArea: "binah", description: "Binah - 理性理解，阴性容器" },
      { name: "慈悲", gridArea: "chesed", description: "Chesed - 慈悲与爱，扩张之力" },
      { name: "严厉", gridArea: "gevurah", description: "Gevurah - 纪律与界限，收缩之力" },
      { name: "美丽", gridArea: "tiferet", description: "Tiferet - 心轮中心，平衡与和谐" },
      { name: "胜利", gridArea: "netzach", description: "Netzach - 情感与坚持，永恒之力" },
      { name: "荣耀", gridArea: "hod", description: "Hod - 理性与荣耀，思维之光" },
      { name: "基础", gridArea: "yesod", description: "Yesod - 潜意识与梦境，连接之桥" },
      { name: "王国", gridArea: "malkuth", description: "Malkuth - 物质世界，显化之果" },
    ],
    gridTemplate: `
      ". . kether . ."
      "chokmah . . . binah"
      ". chesed . gevurah ."
      ". . tiferet . ."
      "netzach . . . hod"
      ". . yesod . ."
      ". . malkuth . ."
    `,
    gridCols: 5,
    gridRows: 7,
  },
};

// 统一的卡牌尺寸计算规则
// 基于容器宽度和网格行列数自动计算
export function getCardSize(spread: Spread) {
  // 容器最大宽度约为 520px (左侧区块宽度)
  const containerWidth = 520;
  // 卡牌间距 - 减小间距让卡牌更大
  const gap = 8;

  // 计算每列可用宽度（使用 100% 可用空间）
  const availableWidth = (containerWidth - (spread.gridCols - 1) * gap) / spread.gridCols;

  // 图卡宽度：直接使用可用宽度的 98%，最大化利用空间
  let imageWidth = availableWidth * 0.98;

  // 根据行数设置最大高度限制，防止溢出
  // 估算：每行高度 = 图卡高度 + 字卡高度 + 间距
  // 图卡高度 ≈ 宽度 * 1.6 (9:16比例)，字卡高度固定 24px
  const imageHeight = imageWidth * 1.6;
  const wordHeight = 24; // 字卡文字高度
  const rowHeight = imageHeight + wordHeight + 4; // 4px 是图卡和字卡之间的间距
  const totalHeight = spread.gridRows * rowHeight + (spread.gridRows - 1) * gap;
  const maxHeight = 700; // 左侧区块最大高度，稍微放宽

  if (totalHeight > maxHeight) {
    // 如果总高度超过限制，按比例缩小
    const scale = maxHeight / totalHeight;
    imageWidth = imageWidth * scale;
  }

  return {
    imageWidth: Math.round(imageWidth),
    wordHeight: 24, // 字卡文字固定高度
  };
}

export function getSpread(type: SpreadType): Spread {
  return SPREADS[type];
}

export function getAllSpreads(): Spread[] {
  return Object.values(SPREADS);
}
