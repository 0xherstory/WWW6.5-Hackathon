export interface MemoryRecord {
  id: string;
  tokenId: string;
  ipfsHash: string;
  timestamp: number;
  stage: number;
}

export interface UserResonance {
  level: number;
  totalMemories: number;
  currentStage: number;
  startDate: number;
}
