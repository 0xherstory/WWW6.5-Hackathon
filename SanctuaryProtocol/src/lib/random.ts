import type { Card } from "@/config/cards";

/**
 * 伪随机数生成器（使用种子）
 * 用于可复现的随机选卡
 */
export class SeededRandom {
  private seed: number;

  constructor(seed: number | string) {
    // 将种子转换为数字
    this.seed =
      typeof seed === "string"
        ? this.hashString(seed)
        : this.hashNumber(seed);
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  private hashNumber(num: number): number {
    const x = Math.sin(num++) * 10000;
    return x - Math.floor(x);
  }

  // 生成 0-1 之间的随机数
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  // 生成范围内的随机整数
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

/**
 * 使用伪随机算法从卡组中选择卡牌
 * @param cards - 可选的卡牌数组
 * @param count - 要选择的数量
 * @param seed - 随机种子（可选，用于可复现的选择）
 * @returns 选中的卡牌数组
 */
export function selectRandomCards(
  cards: Card[],
  count: number,
  seed?: number | string
): Card[] {
  if (count > cards.length) {
    throw new Error(
      `Cannot select ${count} cards from ${cards.length} available`
    );
  }

  // 使用种子随机数或真随机数
  const rng = seed ? new SeededRandom(seed) : null;

  // 创建索引数组
  const indices = cards.map((_, index) => index);

  // Fisher-Yates 洗牌算法
  for (let i = indices.length - 1; i > 0; i--) {
    const randomValue = rng ? rng.next() : Math.random();
    const j = Math.floor(randomValue * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  // 返回前 count 张卡
  return indices.slice(0, count).map((index) => cards[index]);
}

/**
 * 基于钱包地址和时间生成伪随机种子
 * 用于智能合约的随机数生成
 * @param address - 钱包地址
 * @param timestamp - 时间戳
 * @returns 随机种子
 */
export function generateSeedFromWallet(
  address: string,
  timestamp: number
): string {
  return `${address}-${timestamp}`;
}

/**
 * 简单的真随机选择（用于前端展示）
 * @param cards - 卡牌数组
 * @param count - 选择数量
 * @returns 选中的卡牌数组
 */
export function selectRandomCardsSimple<T>(
  items: T[],
  count: number
): T[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
