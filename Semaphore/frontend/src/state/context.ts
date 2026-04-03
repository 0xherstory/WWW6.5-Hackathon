import { createContext } from "react";

import { AppState, ComposeInput, InviteReplyType } from "../types/domain";

interface AppStateContextValue {
  state: AppState;
  getSignalViewCount: (signalId: string) => number;
  markSignalViewed: (signalId: string) => void;
  syncError: string | null;
  syncPending: boolean;
  retrySync: () => void;
  publishSignal: (input: ComposeInput) => Promise<string>;
  deleteSignal: (signalId: number) => Promise<void>;
  authorizeAnswer: (answerId: number) => Promise<void>;
  submitResponse: (signalId: string, content: string) => Promise<void>;
  submitEcho: (signalId: string, destination: "private" | "public", content: string) => Promise<void>;
  toggleInviteReplying: (inviteId: number) => void;
  setInviteReplyType: (inviteId: number, replyType: InviteReplyType) => void;
  setInviteReplyText: (inviteId: number, text: string) => void;
  submitInviteReply: (inviteId: number) => Promise<void>;
  skipInvite: (inviteId: number) => void;
}

export const AppStateContext = createContext<AppStateContextValue | null>(null);
