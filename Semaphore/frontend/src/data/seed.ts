import { AppState, TagOption } from "../types/domain";

export const TAG_OPTIONS: TagOption[] = [
  { id: "loneliness", label: "孤独", emoji: "🌙" },
  { id: "migration", label: "迁徙", emoji: "🌊" },
  { id: "work", label: "工作", emoji: "💼" },
  { id: "love", label: "爱", emoji: "💫" },
  { id: "insomnia", label: "失眠", emoji: "🌌" },
  { id: "poetry", label: "诗歌", emoji: "✒️" },
  { id: "growth", label: "成长", emoji: "🌱" },
  { id: "memory", label: "记忆", emoji: "📷" },
];

export function createInitialState(): AppState {
  return {
    session: {
      walletName: null,
      walletAddress: null,
      inviteVerified: false,
      requestedInvite: false,
      signatureVerified: false,
    },
    networkSignals: [],
    ownSignals: [],
    answers: [],
    invites: [],
    gifts: [],
    publicEchoes: [],
  };
}
