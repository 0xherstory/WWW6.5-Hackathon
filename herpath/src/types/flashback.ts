export type Dimension = "art" | "sci" | "law";
export type Leader = "rbg" | "hillary";

export interface MemoryCard {
  id: string;
  scene: string;
  leftText: string;
  leftDim: Dimension;
  rightText: string;
  rightDim: Dimension;
  imageKey: string; // for pixel art reference
}

export interface FlashbackState {
  currentIdx: number;
  scores: Record<Dimension, number>;
  selectedCards: string[];
}
