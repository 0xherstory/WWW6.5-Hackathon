export type TagId =
  | "loneliness"
  | "migration"
  | "work"
  | "love"
  | "insomnia"
  | "poetry"
  | "growth"
  | "memory";

export type InviteReplyType = "private" | "public" | "signal";
export type InviteSource = "granted-access" | "direct-invite";
export type AnswerStatus = "pending" | "authorizing" | "authorized";
export type SignalFocusType = "mother" | "focused" | "derived";
export type SignalVisibility = "public" | "private";
export type ViewerAccessState = "none" | "pending" | "authorized" | "expired";

export interface TagOption {
  id: TagId;
  label: string;
  emoji: string;
}

export interface SessionState {
  walletName: string | null;
  walletAddress: string | null;
  inviteVerified: boolean;
  requestedInvite: boolean;
  signatureVerified: boolean;
}

export interface SignalRecord {
  id: string;
  title: string;
  hook: string;
  question: string;
  contentHtml: string;
  encryptedContentCID: string;
  visibility: SignalVisibility;
  authorAddress: string;
  authorLabel: string;
  createdLabel: string;
  createdAt: number;
  blockHeight: string;
  ipfsHash: string;
  txHash: string | null;
  tags: TagId[];
  previewIcon: string;
  parentId: string | null;
  childIds: string[];
  focusType: SignalFocusType;
  readable: boolean;
  accessExpiresAt: number | null;
  viewerAccessState: ViewerAccessState;
  viewerResponseId: number | null;
}

export interface OwnedSignalRecord {
  id: number;
  sourceSignalId?: string;
  title?: string;
  content: string;
  ts: number;
  blockNumber: number;
  storage: "arweave" | "ipfs" | "local";
  visibility: SignalVisibility;
  resonances: number;
  replies: number;
  linked: number;
}

export interface AnswerRecord {
  id: number;
  from: string;
  ens: string | null;
  preview: string;
  ts: number;
  article: string;
  signalId?: string;
  status: AnswerStatus;
  authorizedAt: number | null;
}

export interface InviteRecord {
  id: number;
  from: string;
  ens: string | null;
  signalId: string;
  source: InviteSource;
  article: string;
  excerpt: string;
  ts: number;
  replying: boolean;
  replyType: InviteReplyType | null;
  replyText: string;
  submitted: boolean;
}

export interface GiftRecord {
  id: number;
  from: string;
  ens: string | null;
  message: string;
  ts: number;
  article: string;
  type: string;
}

export interface PublicEchoRecord {
  id: number;
  signalId: string;
  from: string;
  ens: string | null;
  message: string;
  ts: number;
  article: string;
}

export interface ComposeInput {
  hook: string;
  question: string;
  contentHtml: string;
  tags: TagId[];
  parentId: string | null;
  visibility: SignalVisibility;
}

export interface AppState {
  session: SessionState;
  networkSignals: SignalRecord[];
  ownSignals: OwnedSignalRecord[];
  answers: AnswerRecord[];
  invites: InviteRecord[];
  gifts: GiftRecord[];
  publicEchoes: PublicEchoRecord[];
}
