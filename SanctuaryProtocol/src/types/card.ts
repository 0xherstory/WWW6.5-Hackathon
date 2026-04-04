export interface SelectedCard {
  id: string;
  position: number;
  isRevealed: boolean;
}

export interface CardReading {
  spreadType: string;
  cards: SelectedCard[];
  timestamp: number;
}

export interface WordCard {
  id: string;
  word: string;        // 中文词
  meaning: string;     // 中文含义
  enWord: string;      // 英文词
  enMeaning: string;   // 英文含义
  trackId?: number;    // 所属轨迹ID（1-6）
}
