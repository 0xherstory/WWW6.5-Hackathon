export interface JournalEntry {
  id: string;
  spreadType: string;
  cards: string[];
  content: string;
  wordCard?: string;
  encryptedContent?: string;
  ipfsHash?: string;
  timestamp: number;
  isEncrypted: boolean;
}

export interface DraftJournal {
  spreadType: string;
  cards: string[];
  content: string;
  savedAt: number;
}
