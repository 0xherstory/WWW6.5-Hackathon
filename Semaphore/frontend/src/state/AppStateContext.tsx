import {
  ReactNode,
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import { useAccount, useWalletClient } from "wagmi";

import { createInitialState, TAG_OPTIONS } from "../data/seed";
import {
  ComposeInput,
  AppState,
  InviteReplyType,
  SessionState,
} from "../types/domain";
import {
  approveReader,
  buildChainState,
  createSignal,
  deactivateSignal,
  ensureMember,
  isMember,
  replyToInvite,
  submitEcho as submitEchoOnChain,
  submitResponse as submitResponseOnChain,
} from "../web3/protocol";
import { stripHtml, truncateAddress } from "../lib/format";
import {
  loadPrivateSignals,
  removePrivateSignal,
} from "./privateSignalsStore";
import {
  incrementSignalViewCount,
  loadSignalViewCounts,
} from "./signalViewStore";
import { AppStateContext } from "./context";
import { clearAuthSession, hasPersistedAuthSession } from "../lib/authSession";

function explainWalletSyncError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  if (
    message.includes("User rejected") ||
    message.includes("user rejected") ||
    message.includes("User denied") ||
    message.includes("rejected the request")
  ) {
    return "你刚刚在 MetaMask 里取消了连接或签名，请重新点一次连接。";
  }

  if (
    message.includes("Already processing eth_requestAccounts") ||
    message.includes("request already pending") ||
    message.includes("ResourceUnavailableRpcError")
  ) {
    return "MetaMask 里还有一个未处理的连接请求。请点开扩展先确认或取消，再回来重试。";
  }

  if (message.includes("insufficient funds")) {
    return "这个钱包在 Avalanche Fuji 上没有足够的测试 AVAX，无法完成入网交易。请先从 Fuji faucet 领取测试币。";
  }

  return message;
}

function formatCreatedLabel(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString("zh-CN").replaceAll("/", ".");
}

function optimisticPreviewIcon(tags: ComposeInput["tags"]) {
  return TAG_OPTIONS.find((option) => option.id === tags[0])?.emoji ?? "✦";
}

function insertOptimisticSignal(
  previous: AppState,
  input: ComposeInput,
  next: {
    encryptedCid: string;
    hash: string;
    hintCid: string;
    hook: string;
    signalId: string;
  },
  walletAddress: string,
) {
  if (
    previous.networkSignals.some((signal) => signal.id === next.signalId) ||
    previous.ownSignals.some((signal) => signal.sourceSignalId === next.signalId)
  ) {
    return previous;
  }

  const createdAt = Math.floor(Date.now() / 1000);
  const nextSignal = {
    accessExpiresAt: null,
    authorAddress: walletAddress,
    authorLabel: truncateAddress(walletAddress),
    blockHeight: "pending",
    childIds: [],
    contentHtml: input.contentHtml,
    createdAt,
    createdLabel: formatCreatedLabel(createdAt),
    encryptedContentCID: next.encryptedCid,
    focusType: input.parentId ? ("derived" as const) : ("focused" as const),
    hook: next.hook,
    id: next.signalId,
    ipfsHash: next.hintCid,
    parentId: input.parentId,
    previewIcon: optimisticPreviewIcon(input.tags),
    question: input.question,
    readable: true,
    tags: input.tags,
    title: next.hook.slice(0, 18) || "新的信号弹",
    txHash: next.hash,
    visibility: input.visibility,
    viewerAccessState: "authorized" as const,
    viewerResponseId: null,
  };

  const nextNetworkSignals =
    input.visibility === "public"
      ? [
          nextSignal,
          ...previous.networkSignals.map((signal) =>
            signal.id === input.parentId
              ? {
                  ...signal,
                  childIds: signal.childIds.includes(next.signalId)
                    ? signal.childIds
                    : [...signal.childIds, next.signalId],
                  focusType: "mother" as const,
                }
              : signal,
          ),
        ].sort((left, right) => right.createdAt - left.createdAt)
      : previous.networkSignals;

  return {
    ...previous,
    networkSignals: nextNetworkSignals,
    ownSignals: [
      {
        blockNumber: 0,
        content: stripHtml(input.contentHtml) || input.hook,
        id: Number(next.signalId),
        linked: 0,
        replies: 0,
        resonances: 0,
        sourceSignalId: next.signalId,
        storage: "ipfs" as const,
        title: next.hook.slice(0, 18) || "新的信号弹",
        ts: createdAt,
        visibility: input.visibility,
      },
      ...previous.ownSignals,
    ].sort((left, right) => right.ts - left.ts),
  };
}

function createRuntimeState() {
  const initialState = createInitialState();

  return {
    ...initialState,
    session: {
      inviteVerified: false,
      requestedInvite: false,
      signatureVerified: false,
      walletAddress: null,
      walletName: null,
    },
  };
}

function mergePrivateSignals(nextState: AppState) {
  const privateSignals = loadPrivateSignals(nextState.session.walletAddress);

  return {
    ...nextState,
    ownSignals: [...privateSignals, ...nextState.ownSignals].sort((left, right) => right.ts - left.ts),
  };
}

function createConnectedSession(address: string, walletName: string | undefined) {
  return createWalletSession(address, walletName, true, hasPersistedAuthSession(address));
}

function createPendingSession(address: string, walletName: string | undefined) {
  return createWalletSession(address, walletName, false, hasPersistedAuthSession(address));
}

function createWalletSession(
  address: string,
  walletName: string | undefined,
  inviteVerified: boolean,
  signatureVerified: boolean,
): SessionState {
  return {
    inviteVerified,
    requestedInvite: false,
    signatureVerified,
    walletAddress: address,
    walletName: walletName ?? "Wallet",
  };
}

function mergeInviteUi(nextState: AppState, previousState: AppState) {
  const inviteUi = new Map(
    previousState.invites.map((invite) => [
      invite.id,
      {
        replyText: invite.replyText,
        replyType: invite.replyType,
        replying: invite.replying,
      },
    ]),
  );
  const optimisticSignals = previousState.networkSignals.filter(
    (signal) =>
      signal.blockHeight === "pending" &&
      nextState.session.walletAddress?.toLowerCase() === signal.authorAddress.toLowerCase() &&
      !nextState.networkSignals.some((nextSignal) => nextSignal.id === signal.id),
  );
  const optimisticOwnSignals = previousState.ownSignals.filter(
    (signal) =>
      signal.blockNumber === 0 &&
      signal.sourceSignalId &&
      !nextState.ownSignals.some((nextSignal) => nextSignal.sourceSignalId === signal.sourceSignalId),
  );

  return {
    ...nextState,
    invites: nextState.invites.map((invite) => ({
      ...invite,
      ...(inviteUi.get(invite.id) ?? {}),
    })),
    networkSignals: [...optimisticSignals, ...nextState.networkSignals].sort(
      (left, right) => right.createdAt - left.createdAt,
    ),
    ownSignals: [...optimisticOwnSignals, ...nextState.ownSignals].sort(
      (left, right) => right.ts - left.ts,
    ),
  };
}

const CHAIN_SYNC_CHANNEL = "seamphore-chain-sync";

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => createRuntimeState());
  const [signalViewCounts, setSignalViewCounts] = useState<Record<string, number>>(() =>
    loadSignalViewCounts(),
  );
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncPending, setSyncPending] = useState(false);
  const autoRecoverKeyRef = useRef<string | null>(null);
  const chainSyncChannelRef = useRef<BroadcastChannel | null>(null);
  const lastConnectedAddressRef = useRef<string | null>(null);
  const recentViewMarksRef = useRef<Record<string, number>>({});
  const { address, connector, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const getSignalViewCount = useCallback(
    (signalId: string) => signalViewCounts[signalId] ?? 0,
    [signalViewCounts],
  );

  const markSignalViewed = useCallback((signalId: string) => {
    const now = Date.now();
    const lastMarkedAt = recentViewMarksRef.current[signalId] ?? 0;

    if (now - lastMarkedAt < 800) {
      return;
    }

    recentViewMarksRef.current[signalId] = now;
    const nextCount = incrementSignalViewCount(signalId);

    setSignalViewCounts((previous) => ({
      ...previous,
      [signalId]: nextCount,
    }));
  }, []);

  async function refreshFromChain(next: { session: AppState["session"] }) {
    try {
      const chainState = await buildChainState(next.session);

      setState((previous) => mergePrivateSignals(mergeInviteUi(chainState, previous)));
      setSyncError(null);
      return true;
    } catch (error) {
      console.error("Failed to refresh chain state", error);
      setSyncError(error instanceof Error ? error.message : "链上状态刷新失败，请重试。");
      return false;
    }
  }

  async function performWalletSync(next: {
    address: string | undefined;
    connectorName: string | undefined;
    isConnected: boolean;
    walletClient: typeof walletClient;
  }) {
    if (!next.isConnected || !next.address) {
      autoRecoverKeyRef.current = null;
      setSyncError(null);
      setSyncPending(false);
      setState(createRuntimeState());
      return;
    }

    try {
      setSyncPending(true);
      setSyncError(null);
      const connectedAddress = next.address;
      const pendingSession = createPendingSession(connectedAddress, next.connectorName);
      const connectedSession = createConnectedSession(connectedAddress, next.connectorName);

      setState((previous) => ({
        ...(previous.session.walletAddress?.toLowerCase() === connectedAddress.toLowerCase()
          ? previous
          : mergePrivateSignals({
              ...createRuntimeState(),
              session: pendingSession,
            })),
        session: pendingSession,
      }));

      const member = await isMember(connectedAddress);

      if (member === undefined) {
        throw new Error("无法确认当前钱包是否已经加入 Fuji 上的 Semaphore 网络。");
      }

      if (!member && next.walletClient) {
        await ensureMember(next.walletClient, connectedAddress);
      }

      const refreshed = await refreshFromChain({
        session: connectedSession,
      });

      if (refreshed) {
        setState((previous) => ({
          ...previous,
          session: connectedSession,
        }));
      } else {
        setState((previous) => ({
          ...previous,
          session: pendingSession,
        }));
      }

      setSyncPending(false);
    } catch (error) {
      console.error("Failed to sync wallet session", error);
      setSyncPending(false);
      setSyncError(explainWalletSyncError(error));

      setState((previous) => ({
        ...previous,
        session: next.address
          ? createPendingSession(next.address, next.connectorName)
          : previous.session,
      }));
    }
  }

  const syncWalletSession = useEffectEvent(() => {
    void performWalletSync({
      address,
      connectorName: connector?.name,
      isConnected,
      walletClient,
    });
  });

  const recoverEmptyChainState = useEffectEvent(() => {
    void performWalletSync({
      address,
      connectorName: connector?.name,
      isConnected,
      walletClient,
    });
  });

  const refreshVisibleSession = useEffectEvent(() => {
    if (document.visibilityState !== "visible") {
      return;
    }

    if (
      isConnected &&
      address &&
      state.session.walletAddress?.toLowerCase() === address.toLowerCase() &&
      state.session.signatureVerified &&
      state.session.inviteVerified
    ) {
      const connectedSession = createConnectedSession(address, connector?.name);

      setSyncPending(true);
      setSyncError(null);

      void refreshFromChain({
        session: connectedSession,
      }).then((refreshed) => {
        if (refreshed) {
          setState((previous) => ({
            ...previous,
            session: connectedSession,
          }));
        }

        setSyncPending(false);
      });

      return;
    }

    void performWalletSync({
      address,
      connectorName: connector?.name,
      isConnected,
      walletClient,
    });
  });

  function announceChainChange() {
    chainSyncChannelRef.current?.postMessage({
      timestamp: Date.now(),
      type: "chain-updated",
    });
  }

  useEffect(() => {
    if (!isConnected || !address) {
      lastConnectedAddressRef.current = null;
      return;
    }

    const previousAddress = lastConnectedAddressRef.current;

    if (previousAddress && previousAddress.toLowerCase() !== address.toLowerCase()) {
      clearAuthSession();
    }

    lastConnectedAddressRef.current = address;
  }, [address, isConnected]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
      return undefined;
    }

    const channel = new BroadcastChannel(CHAIN_SYNC_CHANNEL);
    chainSyncChannelRef.current = channel;

    channel.onmessage = (event) => {
      if (event.data?.type === "chain-updated") {
        refreshVisibleSession();
      }
    };

    return () => {
      channel.close();
      if (chainSyncChannelRef.current === channel) {
        chainSyncChannelRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      syncWalletSession();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [address, connector?.name, isConnected, walletClient]);

  useEffect(() => {
    const handleFocus = () => {
      refreshVisibleSession();
    };

    const handleVisibilityChange = () => {
      refreshVisibleSession();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!isConnected || !address || syncPending || state.networkSignals.length > 0) {
      return;
    }

    const normalizedAddress = address.toLowerCase();
    const sessionAddress = state.session.walletAddress?.toLowerCase();

    if (sessionAddress && sessionAddress !== normalizedAddress) {
      return;
    }

    const recoveryKey = normalizedAddress;

    if (autoRecoverKeyRef.current === recoveryKey) {
      return;
    }

    autoRecoverKeyRef.current = recoveryKey;

    const timeoutId = window.setTimeout(() => {
      recoverEmptyChainState();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    address,
    connector?.name,
    isConnected,
    state.networkSignals.length,
    state.session.walletAddress,
    syncPending,
    walletClient,
  ]);

  function retrySync() {
    void performWalletSync({
      address,
      connectorName: connector?.name,
      isConnected,
      walletClient,
    });
  }

  async function publishSignal(input: ComposeInput) {
    if (!state.session.walletAddress) {
      throw new Error("请先通过钱包连接 Avalanche Fuji。");
    }

    if (!walletClient) {
      throw new Error("请先通过钱包连接 Avalanche Fuji。");
    }

    const result = await createSignal(walletClient, input);

    setState((previous) =>
      insertOptimisticSignal(previous, input, result, state.session.walletAddress!),
    );

    await refreshFromChain({
      session: state.session,
    });
    announceChainChange();

    return result.hash;
  }

  async function deleteSignal(signalId: number) {
    const target = state.ownSignals.find((item) => item.id === signalId);

    if (!target || !state.session.walletAddress) {
      return;
    }

    if (target.storage === "local" || !target.sourceSignalId) {
      removePrivateSignal(state.session.walletAddress, signalId);
      setState((previous) => ({
        ...previous,
        ownSignals: previous.ownSignals.filter((item) => item.id !== signalId),
      }));
      return;
    }

    if (!walletClient) {
      return;
    }

    await deactivateSignal(walletClient, target.sourceSignalId);
    await refreshFromChain({
      session: state.session,
    });
    announceChainChange();
  }

  async function authorizeAnswer(answerId: number) {
    const answer = state.answers.find((item) => item.id === answerId);

    if (!answer?.signalId || !walletClient || !state.session.walletAddress) {
      return;
    }

    setState((previous) => ({
      ...previous,
      answers: previous.answers.map((answer) =>
        answer.id === answerId && answer.status === "pending"
          ? { ...answer, status: "authorizing" }
          : answer,
      ),
    }));

    await approveReader(walletClient, answer.signalId, answerId);
    await refreshFromChain({
      session: state.session,
    });
    announceChainChange();
  }

  async function submitResponse(signalId: string, content: string) {
    if (!walletClient || !state.session.walletAddress) {
      throw new Error("请先连接钱包。");
    }

    await submitResponseOnChain(walletClient, signalId, content);
    await refreshFromChain({
      session: state.session,
    });
    announceChainChange();
  }

  async function submitEcho(
    signalId: string,
    destination: "private" | "public",
    content: string,
  ) {
    if (!walletClient || !state.session.walletAddress) {
      throw new Error("请先连接钱包。");
    }

    await submitEchoOnChain(walletClient, signalId, destination, content);
    await refreshFromChain({
      session: state.session,
    });
    announceChainChange();
  }

  function toggleInviteReplying(inviteId: number) {
    setState((previous) => ({
      ...previous,
      invites: previous.invites.map((invite) =>
        invite.id === inviteId ? { ...invite, replying: !invite.replying } : invite,
      ),
    }));
  }

  function setInviteReplyType(inviteId: number, replyType: InviteReplyType) {
    setState((previous) => ({
      ...previous,
      invites: previous.invites.map((invite) =>
        invite.id === inviteId ? { ...invite, replyType } : invite,
      ),
    }));
  }

  function setInviteReplyText(inviteId: number, text: string) {
    setState((previous) => ({
      ...previous,
      invites: previous.invites.map((invite) =>
        invite.id === inviteId ? { ...invite, replyText: text } : invite,
      ),
    }));
  }

  async function submitInviteReply(inviteId: number) {
    const invite = state.invites.find((item) => item.id === inviteId);

    if (
      !invite?.replyType ||
      !invite.replyText.trim() ||
      !walletClient ||
      !state.session.walletAddress
    ) {
      return;
    }

    if (invite.source === "granted-access" && invite.replyType === "signal") {
      return;
    }

    await replyToInvite(walletClient, inviteId, invite.replyType, invite.replyText.trim());

    await refreshFromChain({
      session: state.session,
    });
    announceChainChange();
  }

  function skipInvite(inviteId: number) {
    setState((previous) => ({
      ...previous,
      invites: previous.invites.map((invite) =>
        invite.id === inviteId ? { ...invite, replying: false } : invite,
      ),
    }));
  }

  return (
    <AppStateContext.Provider
      value={{
        state,
        getSignalViewCount,
        markSignalViewed,
        syncError,
        syncPending,
        retrySync,
        publishSignal,
        deleteSignal,
        authorizeAnswer,
        submitResponse,
        submitEcho,
        toggleInviteReplying,
        setInviteReplyType,
        setInviteReplyText,
        submitInviteReply,
        skipInvite,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}
