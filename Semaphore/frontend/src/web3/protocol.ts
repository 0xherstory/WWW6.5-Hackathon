import {
  createPublicClient,
  http,
  parseEventLogs,
  type Abi,
  type Address,
  type WalletClient,
} from "viem";

import artifact from "./artifacts/SemaphoreProtocol.json";
import { FUJI_RPC_URL, resolveSemaphoreProtocolAddress, seamphoreChain } from "./deployment";
import {
  createEncryptedSignalDocument,
  createInviteReplyContent,
  getStoredContent,
  createSignalPublicContent,
  uploadTextContent,
} from "./contentStore";
import { encryptSignalContent } from "./lit";
import {
  AnswerRecord,
  AppState,
  ComposeInput,
  InviteRecord,
  InviteReplyType,
  PublicEchoRecord,
  SessionState,
  SignalRecord,
  TagId,
  ViewerAccessState,
} from "../types/domain";
import { TAG_OPTIONS } from "../data/seed";
import { stripHtml, truncateAddress } from "../lib/format";

const protocolAbi = artifact.abi as Abi;

type ContractSignal = {
  active: boolean;
  author: Address;
  blockNumber: bigint;
  childIds: bigint[];
  createdAt: bigint;
  echoIds: bigint[];
  encryptedContentCID: string;
  hintCID: string;
  id: bigint;
  parentSignalId: bigint;
  question: string;
  responseIds: bigint[];
  tags: string[];
  visibility: number;
};

type ContractSignalView = {
  active: boolean;
  author: Address;
  blockNumber: bigint;
  createdAt: bigint;
  encryptedContentCID: string;
  hintCID: string;
  id: bigint;
  parentSignalId: bigint;
  question: string;
  tags: string[];
};

type ContractSignalTuple = readonly [
  bigint,
  Address,
  bigint,
  string,
  string,
  string,
  string[],
  bigint,
  bigint,
  boolean,
];

type ContractResponseView = {
  accessExpiresAt: bigint;
  approved: boolean;
  createdAt: bigint;
  id: bigint;
  reader: Address;
  responseCID: string;
  signalId: bigint;
};

type ContractReadInviteView = {
  createdAt: bigint;
  excerptCID: string;
  from: Address;
  id: bigint;
  replied: boolean;
  signalId: bigint;
  source: number | bigint;
  to: Address;
};

type ContractEchoView = {
  createdAt: bigint;
  destination: number;
  echoCID: string;
  id: bigint;
  sender: Address;
  signalId: bigint;
};

type LoadedEchoRecord = {
  article: string;
  destination: number;
  from: Address;
  id: number;
  message: string;
  signalId: string;
  ts: number;
};

const publicClient = createPublicClient({
  chain: seamphoreChain,
  transport: http(FUJI_RPC_URL),
});

function explainContractReadError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);

  if (
    message.includes('returned no data ("0x")') ||
    message.includes("The address is not a contract")
  ) {
    throw new Error(
      "Avalanche Fuji 上还没有部署 Semaphore 合约，或当前合约地址填写不对。请检查 VITE_SEMAPHORE_PROTOCOL_ADDRESS。",
    );
  }

  if (message.includes("fetch failed") || message.includes("Failed to fetch")) {
    throw new Error(
      "无法连接 Avalanche Fuji RPC。请确认当前网络配置正确，并检查 VITE_RPC_URL 是否可用。",
    );
  }

  throw error instanceof Error ? error : new Error(message);
}

async function resolveActiveProtocolAddress(protocolAddress?: Address): Promise<Address> {
  const resolvedProtocolAddress = protocolAddress ?? (await resolveSemaphoreProtocolAddress());

  try {
    const bytecode = await publicClient.getBytecode({
      address: resolvedProtocolAddress,
    });

    if (!bytecode || bytecode === "0x") {
      throw new Error("The address is not a contract");
    }

    return resolvedProtocolAddress;
  } catch (error) {
    explainContractReadError(error);
  }
}

function asAddress(address: string) {
  return address as Address;
}

function getWalletAccount(walletClient: WalletClient) {
  const account = walletClient.account;

  if (!account) {
    throw new Error("当前没有可用的钱包账户，请重新连接钱包。");
  }

  return account;
}

function asTagId(tag: string): TagId | null {
  return TAG_OPTIONS.some((option) => option.id === tag) ? (tag as TagId) : null;
}

function resolvePreviewIcon(tags: TagId[], fallback = "✦") {
  return TAG_OPTIONS.find((option) => option.id === tags[0])?.emoji ?? fallback;
}

function mapSignalVisibility(value: number | bigint) {
  return Number(value) === 1 ? "private" : "public";
}

function accessStatePriority(state: ViewerAccessState) {
  if (state === "authorized") return 3;
  if (state === "pending") return 2;
  if (state === "expired") return 1;
  return 0;
}

function formatCreatedLabel(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString("zh-CN").replaceAll("/", ".");
}

function normalizeSignalView(signal: ContractSignalView | ContractSignalTuple): ContractSignalView {
  if (!Array.isArray(signal)) {
    return signal as ContractSignalView;
  }

  const [
    id,
    author,
    parentSignalId,
    hintCID,
    encryptedContentCID,
    question,
    tags,
    createdAt,
    blockNumber,
    active,
  ] = signal;

  return {
    active,
    author,
    blockNumber,
    createdAt,
    encryptedContentCID,
    hintCID,
    id,
    parentSignalId,
    question,
    tags,
  };
}

async function resolveSignalContent(signal: ContractSignal) {
  const publicDoc = await getStoredContent(signal.hintCID);
  const publicHook =
    publicDoc?.kind === "signal-public" || publicDoc?.kind === "signal-combined"
      ? publicDoc.hook
      : signal.question;
  const title =
    publicDoc?.kind === "signal-public" || publicDoc?.kind === "signal-combined"
      ? publicDoc.title
      : publicHook.slice(0, 18) || "新的信号弹";
  const contentHtml =
    publicDoc?.kind === "signal-combined" ? publicDoc.contentHtml : `<p>${publicHook}</p>`;
  const tags = signal.tags.map(asTagId).filter((tag): tag is TagId => tag !== null);

  return {
    contentHtml,
    hook: publicHook,
    previewIcon:
      (publicDoc?.kind === "signal-public" || publicDoc?.kind === "signal-combined"
        ? publicDoc.previewIcon
        : undefined) ?? resolvePreviewIcon(tags),
    tags,
    title,
  };
}

async function readSignal(signalId: bigint, protocolAddress: Address): Promise<ContractSignal | null> {
  try {
    const signalResult = (await publicClient.readContract({
      abi: protocolAbi,
      address: protocolAddress,
      args: [signalId],
      functionName: "getSignal",
    })) as ContractSignalView | ContractSignalTuple;
    const signal = normalizeSignalView(signalResult);

    const [childIds, responseIds, echoIds, visibility] = (await Promise.all([
      publicClient.readContract({
        abi: protocolAbi,
        address: protocolAddress,
        args: [signalId],
        functionName: "getSignalChildren",
      }),
      publicClient.readContract({
        abi: protocolAbi,
        address: protocolAddress,
        args: [signalId],
        functionName: "getResponsesForSignal",
      }),
      publicClient.readContract({
        abi: protocolAbi,
        address: protocolAddress,
        args: [signalId],
        functionName: "getEchoesForSignal",
      }),
      publicClient.readContract({
        abi: protocolAbi,
        address: protocolAddress,
        args: [signalId],
        functionName: "getSignalVisibility",
      }),
    ])) as [bigint[], bigint[], bigint[], number | bigint];

    return {
      active: signal.active,
      author: signal.author,
      blockNumber: signal.blockNumber,
      childIds,
      createdAt: signal.createdAt,
      echoIds,
      encryptedContentCID: signal.encryptedContentCID,
      hintCID: signal.hintCID,
      id: signal.id,
      parentSignalId: signal.parentSignalId,
      question: signal.question,
      responseIds,
      tags: signal.tags,
      visibility: Number(visibility),
    };
  } catch {
    return null;
  }
}

async function loadSignals(viewerAddress: string | null, protocolAddress: Address) {
  const nextSignalId = (await publicClient.readContract({
    abi: protocolAbi,
    address: protocolAddress,
    functionName: "nextSignalId",
  })) as bigint;

  const ids = Array.from({ length: Number(nextSignalId - 1n) }, (_, index) => BigInt(index + 1));
  const signals = (await Promise.all(ids.map((signalId) => readSignal(signalId, protocolAddress)))).filter(
    (signal): signal is ContractSignal => signal !== null && signal.active,
  );

  const readableById = new Map<string, boolean>();
  const viewerResponseStateBySignal = new Map<
    string,
    {
      accessExpiresAt: number | null;
      responseId: number | null;
      state: ViewerAccessState;
    }
  >();

  if (viewerAddress) {
    const viewerResponseIds = (await publicClient.readContract({
      abi: protocolAbi,
      address: protocolAddress,
      args: [asAddress(viewerAddress)],
      functionName: "getResponsesByReader",
    })) as bigint[];

    const viewerResponses = (await Promise.all(
      viewerResponseIds.map(async (responseId) => {
        const response = (await publicClient.readContract({
          abi: protocolAbi,
          address: protocolAddress,
          args: [responseId],
          functionName: "getResponse",
        })) as ContractResponseView;

        return {
          accessExpiresAt: response.approved ? Number(response.accessExpiresAt) * 1000 : null,
          approved: response.approved,
          createdAt: Number(response.createdAt),
          id: Number(response.id),
          signalId: response.signalId.toString(),
        };
      }),
    )) as Array<{
      accessExpiresAt: number | null;
      approved: boolean;
      createdAt: number;
      id: number;
      signalId: string;
    }>;

    viewerResponses.forEach((response) => {
      const current = viewerResponseStateBySignal.get(response.signalId);
      const nextState: ViewerAccessState = response.approved
        ? (response.accessExpiresAt ?? 0) > Date.now()
          ? "authorized"
          : "expired"
        : "pending";

      if (
        !current ||
        accessStatePriority(nextState) > accessStatePriority(current.state) ||
        (current.state === nextState && (response.accessExpiresAt ?? 0) > (current.accessExpiresAt ?? 0)) ||
        (current.state === nextState && response.id > (current.responseId ?? 0))
      ) {
        viewerResponseStateBySignal.set(response.signalId, {
          accessExpiresAt: response.accessExpiresAt,
          responseId: response.id,
          state: nextState,
        });
      }
    });

    await Promise.all(
      signals.map(async (signal) => {
        const isAuthor = signal.author.toLowerCase() === viewerAddress.toLowerCase();
        const hasAccess =
          isAuthor ||
          ((await publicClient.readContract({
            abi: protocolAbi,
            address: protocolAddress,
            args: [signal.id, asAddress(viewerAddress)],
            functionName: "hasActiveAccess",
          })) as boolean);

        readableById.set(signal.id.toString(), hasAccess);
      }),
    );
  }

  const mappedSignals: SignalRecord[] = (await Promise.all(
    signals.map(async (signal) => {
      const content = await resolveSignalContent(signal);

      return {
        accessExpiresAt: viewerResponseStateBySignal.get(signal.id.toString())?.accessExpiresAt ?? null,
        authorAddress: signal.author,
        authorLabel: truncateAddress(signal.author),
        blockHeight: signal.blockNumber.toString(),
        childIds: signal.childIds.map((childId) => childId.toString()),
        contentHtml: content.contentHtml,
        createdAt: Number(signal.createdAt),
        createdLabel: formatCreatedLabel(Number(signal.createdAt)),
        encryptedContentCID: signal.encryptedContentCID,
        focusType:
          signal.parentSignalId !== 0n
            ? "derived"
            : signal.childIds.length > 0
              ? "mother"
              : "focused",
        hook: content.hook,
        id: signal.id.toString(),
        ipfsHash: signal.hintCID,
        parentId: signal.parentSignalId === 0n ? null : signal.parentSignalId.toString(),
        previewIcon: content.previewIcon,
        question: signal.question,
        readable: readableById.get(signal.id.toString()) ?? false,
        tags: content.tags,
        title: content.title,
        txHash: null,
        viewerAccessState:
          signal.author.toLowerCase() === viewerAddress?.toLowerCase()
            ? "authorized"
            : viewerResponseStateBySignal.get(signal.id.toString())?.state ?? "none",
        viewerResponseId: viewerResponseStateBySignal.get(signal.id.toString())?.responseId ?? null,
        visibility: mapSignalVisibility(signal.visibility),
      } as SignalRecord;
    }),
  ))
    .sort((left, right) => right.createdAt - left.createdAt);

  const byId = new Map(mappedSignals.map((signal) => [signal.id, signal]));
  const rawById = new Map(signals.map((signal) => [signal.id.toString(), signal]));

  return {
    byId,
    networkSignals: mappedSignals.filter((signal) => signal.visibility === "public"),
    rawById,
  };
}

export async function isMember(address: string, protocolAddress?: Address) {
  const resolvedProtocolAddress = await resolveActiveProtocolAddress(protocolAddress);

  try {
    return (await publicClient.readContract({
      abi: protocolAbi,
      address: resolvedProtocolAddress,
      args: [asAddress(address)],
      functionName: "isMember",
    })) as boolean;
  } catch (error) {
    explainContractReadError(error);
  }
}

export async function ensureMember(walletClient: WalletClient, address: string) {
  const protocolAddress = await resolveActiveProtocolAddress();
  const member = await isMember(address, protocolAddress);

  if (member) {
    return;
  }

  const account = getWalletAccount(walletClient);
  const hash = await walletClient.writeContract({
    abi: protocolAbi,
    account,
    address: protocolAddress,
    chain: seamphoreChain,
    functionName: "joinNetwork",
  });

  await publicClient.waitForTransactionReceipt({ hash });
}

export async function createSignal(walletClient: WalletClient, input: ComposeInput) {
  const protocolAddress = await resolveActiveProtocolAddress();
  const account = getWalletAccount(walletClient);
  const { hintCid, publicDocument } = await createSignalPublicContent(input);
  const createHash = await walletClient.writeContract({
    abi: protocolAbi,
    account,
    address: protocolAddress,
    args: [
      input.parentId ? BigInt(input.parentId) : 0n,
      hintCid,
      "pending-encrypted-content",
      input.question.trim() || "仅自己可见",
      input.tags,
      input.visibility === "private" ? 1 : 0,
    ],
    chain: seamphoreChain,
    functionName: "createSignalWithVisibility",
  });

  const createReceipt = await publicClient.waitForTransactionReceipt({ hash: createHash });
  const createdEvents = parseEventLogs({
    abi: protocolAbi,
    eventName: "SignalCreated",
    logs: createReceipt.logs,
    strict: false,
  }) as Array<{
    args: {
      signalId?: bigint;
    };
  }>;
  const createdSignalId = createdEvents[0]?.args.signalId;

  if (createdSignalId === undefined) {
    throw new Error("没有从链上拿到新 signal 的编号，请重试。");
  }

  const signalId = createdSignalId.toString();
  const encryptedPayload = await encryptSignalContent({
    authorAddress: account.address,
    contentHtml: input.contentHtml,
    signalId,
  });
  const encryptedCid = await createEncryptedSignalDocument(encryptedPayload);
  const updateHash = await walletClient.writeContract({
    abi: protocolAbi,
    account,
    address: protocolAddress,
    args: [createdSignalId, encryptedCid],
    chain: seamphoreChain,
    functionName: "setEncryptedContentCID",
  });

  await publicClient.waitForTransactionReceipt({ hash: updateHash });

  return {
    encryptedCid,
    hash: updateHash,
    hintCid,
    hook: publicDocument.hook,
    signalId,
  };
}

export async function deactivateSignal(walletClient: WalletClient, signalId: string) {
  const protocolAddress = await resolveActiveProtocolAddress();
  const account = getWalletAccount(walletClient);
  const hash = await walletClient.writeContract({
    abi: protocolAbi,
    account,
    address: protocolAddress,
    args: [BigInt(signalId)],
    chain: seamphoreChain,
    functionName: "deactivateSignal",
  });

  await publicClient.waitForTransactionReceipt({ hash });
}

export async function submitResponse(
  walletClient: WalletClient,
  signalId: string,
  text: string,
) {
  const protocolAddress = await resolveActiveProtocolAddress();
  const account = getWalletAccount(walletClient);
  const cid = await uploadTextContent(text, {
    keyvalues: {
      kind: "response",
      signalId,
    },
    name: `response-${signalId}-${Date.now()}`,
  });

  const hash = await walletClient.writeContract({
    abi: protocolAbi,
    account,
    address: protocolAddress,
    args: [BigInt(signalId), cid],
    chain: seamphoreChain,
    functionName: "submitResponse",
  });

  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

export async function approveReader(
  walletClient: WalletClient,
  signalId: string,
  responseId: number,
) {
  const protocolAddress = await resolveActiveProtocolAddress();
  const account = getWalletAccount(walletClient);
  const expiresAt = BigInt(Math.floor(Date.now() / 1000) + 24 * 60 * 60);
  const hash = await walletClient.writeContract({
    abi: protocolAbi,
    account,
    address: protocolAddress,
    args: [BigInt(signalId), BigInt(responseId), expiresAt],
    chain: seamphoreChain,
    functionName: "approveReader",
  });

  await publicClient.waitForTransactionReceipt({ hash });
}

export async function replyToInvite(
  walletClient: WalletClient,
  inviteId: number,
  replyType: InviteReplyType,
  text: string,
) {
  const protocolAddress = await resolveActiveProtocolAddress();
  const account = getWalletAccount(walletClient);
  const cid = await createInviteReplyContent(replyType, text);
  const contractReplyType = replyType === "private" ? 0 : replyType === "public" ? 1 : 2;
  const hash = await walletClient.writeContract({
    abi: protocolAbi,
    account,
    address: protocolAddress,
    args: [BigInt(inviteId), contractReplyType, cid],
    chain: seamphoreChain,
    functionName: "replyToInvite",
  });

  await publicClient.waitForTransactionReceipt({ hash });
}

export async function submitEcho(
  walletClient: WalletClient,
  signalId: string,
  destination: "private" | "public",
  text: string,
) {
  const protocolAddress = await resolveActiveProtocolAddress();
  const account = getWalletAccount(walletClient);
  const cid = await uploadTextContent(text, {
    keyvalues: {
      destination,
      kind: "echo",
      signalId,
    },
    name: `echo-${destination}-${signalId}-${Date.now()}`,
  });

  const hash = await walletClient.writeContract({
    abi: protocolAbi,
    account,
    address: protocolAddress,
    args: [BigInt(signalId), destination === "private" ? 0 : 1, cid],
    chain: seamphoreChain,
    functionName: "submitEcho",
  });

  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

export async function buildChainState(session: SessionState): Promise<AppState> {
  try {
    const viewerAddress = session.walletAddress;
    const protocolAddress = await resolveActiveProtocolAddress();
    const { byId, networkSignals, rawById } = await loadSignals(viewerAddress, protocolAddress);
    const ownSignals: AppState["ownSignals"] = [];
    const answers: AppState["answers"] = [];
    const invites: AppState["invites"] = [];
    const gifts: AppState["gifts"] = [];
    const publicEchoes: PublicEchoRecord[] = [];
    const echoEntries = (await Promise.all(
      networkSignals.flatMap((signal) => {
        const rawSignal = rawById.get(signal.id);

        return (rawSignal?.echoIds ?? []).map(async (echoId) => {
          const echo = (await publicClient.readContract({
            abi: protocolAbi,
            address: protocolAddress,
            args: [echoId],
            functionName: "getEcho",
          })) as ContractEchoView;

          const echoContent = await getStoredContent(echo.echoCID);
          const relatedSignal = byId.get(echo.signalId.toString());

          return {
            article: relatedSignal?.title ?? "未知信号弹",
            destination: echo.destination,
            from: echo.sender,
            id: Number(echo.id),
            message:
              echoContent?.kind === "text"
                ? echoContent.text
                : "一份新的回响已送达。",
            signalId: echo.signalId.toString(),
            ts: Number(echo.createdAt),
          } as LoadedEchoRecord;
        });
      }),
    )).sort((left, right) => right.ts - left.ts);

    publicEchoes.push(
      ...echoEntries
        .filter((echo) => echo.destination === 1)
        .map((echo) => ({
          article: echo.article,
          ens: null,
          from: echo.from,
          id: echo.id,
          message: echo.message,
          signalId: echo.signalId,
          ts: echo.ts,
        })),
    );

    if (viewerAddress) {
      const signalIds = (await publicClient.readContract({
        abi: protocolAbi,
        address: protocolAddress,
        args: [asAddress(viewerAddress)],
        functionName: "getSignalsByAuthor",
      })) as bigint[];

      signalIds
        .map((signalId) => byId.get(signalId.toString()))
        .filter((signal): signal is SignalRecord => Boolean(signal))
        .forEach((signal) => {
          const rawSignal = rawById.get(signal.id);

          if (!rawSignal) {
            return;
          }

          ownSignals.push({
            blockNumber: Number(rawSignal.blockNumber),
            content: stripHtml(signal.contentHtml) || signal.hook,
            id: Number(signal.id),
            linked: signal.childIds.length,
            replies: rawSignal.responseIds.length,
            resonances: rawSignal.echoIds.length,
            sourceSignalId: signal.id,
            storage: "ipfs",
            title: signal.title,
            ts: signal.createdAt,
            visibility: signal.visibility,
          });
        });

      const authoredSignalIds = new Set(signalIds.map((signalId) => signalId.toString()));

      const responseIds = (await publicClient.readContract({
        abi: protocolAbi,
        address: protocolAddress,
        args: [asAddress(viewerAddress)],
        functionName: "getResponsesForAuthor",
      })) as bigint[];

      const responseEntries: AnswerRecord[] = (await Promise.all(
        responseIds.map(async (responseId) => {
          const response = (await publicClient.readContract({
            abi: protocolAbi,
            address: protocolAddress,
            args: [responseId],
            functionName: "getResponse",
          })) as ContractResponseView;

          const relatedSignal = byId.get(response.signalId.toString());
          const responseContent = await getStoredContent(response.responseCID);

          return {
            article: relatedSignal?.title ?? "未知信号弹",
            authorizedAt: response.approved ? Number(response.accessExpiresAt) * 1000 : null,
            ens: null,
            from: response.reader,
            id: Number(response.id),
            preview:
              responseContent?.kind === "text"
                ? responseContent.text
                : "一条新的回应已经写入链上。",
            signalId: response.signalId.toString(),
            status: response.approved ? "authorized" : "pending",
            ts: Number(response.createdAt),
          } as AnswerRecord;
        }),
      )).sort((left, right) => right.ts - left.ts);

      answers.push(...responseEntries);

      const inviteIds = (await publicClient.readContract({
        abi: protocolAbi,
        address: protocolAddress,
        args: [asAddress(viewerAddress)],
        functionName: "getReadInvitesForRecipient",
      })) as bigint[];

      const directInviteEntries = (await Promise.all(
        inviteIds.map(async (inviteId) => {
          const invite = (await publicClient.readContract({
            abi: protocolAbi,
            address: protocolAddress,
            args: [inviteId],
            functionName: "getReadInvite",
          })) as ContractReadInviteView;

          const relatedSignal = byId.get(invite.signalId.toString());
          const excerptContent = await getStoredContent(invite.excerptCID);
          const source = Number(invite.source) === 1 ? "granted-access" : "direct-invite";

          return invite.replied
            ? null
            : ({
                article: relatedSignal?.title ?? "未知信号弹",
                ens: null,
                excerpt:
                  source === "granted-access"
                    ? "这道门已经为你打开。读完之后，把回响留给作者、留在文章下，或继续发出你的信号弹。"
                    : excerptContent?.kind === "text"
                    ? excerptContent.text
                    : "你收到了一份新的阅读邀请。",
                from: invite.from,
                id: Number(invite.id),
                replyText: "",
                replyType: null,
                replying: false,
                signalId: invite.signalId.toString(),
                source,
                submitted: false,
                ts: Number(invite.createdAt),
              } as InviteRecord);
        }),
      ))
        .filter((invite): invite is InviteRecord => invite !== null)
        .sort((left, right) => right.ts - left.ts);

      invites.push(...directInviteEntries);
      gifts.push(
        ...echoEntries
          .filter((echo) => echo.destination === 0 && authoredSignalIds.has(echo.signalId))
          .map((echo) => ({
            article: echo.article,
            ens: null,
            from: echo.from,
            id: echo.id,
            message: echo.message,
            ts: echo.ts,
            type: "私密礼物",
          })),
      );
      ownSignals.sort((left, right) => right.ts - left.ts);
    }

    return {
      answers,
      gifts,
      invites,
      networkSignals,
      ownSignals,
      publicEchoes,
      session,
    };
  } catch (error) {
    explainContractReadError(error);
  }
}
