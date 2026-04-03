import type { EncryptToJsonPayload } from "@lit-protocol/types";

import { ComposeInput, InviteReplyType, TagId } from "../types/domain";
import { stripHtml } from "../lib/format";

const CACHE_KEY = "seamphore-ipfs-cache-v2";
const DEFAULT_IPFS_GATEWAYS = [
  import.meta.env.VITE_PINATA_GATEWAY?.trim(),
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
].filter(Boolean) as string[];

type BaseContentDocument = {
  version: 1;
};

export type SignalPublicContent = BaseContentDocument & {
  hook: string;
  kind: "signal-public";
  previewIcon: string;
  title: string;
};

export type SignalCombinedContent = BaseContentDocument & {
  contentHtml: string;
  hook: string;
  kind: "signal-combined";
  previewIcon: string;
  title: string;
};

export type TextContent = BaseContentDocument & {
  kind: "text";
  text: string;
};

export type EncryptedSignalJsonPayload = EncryptToJsonPayload;

export type EncryptedSignalPrivateContent = BaseContentDocument & {
  kind: "signal-private-encrypted";
  payload: EncryptedSignalJsonPayload;
};

type StoredContent =
  | EncryptedSignalPrivateContent
  | SignalCombinedContent
  | SignalPublicContent
  | TextContent;

const inMemoryCache = new Map<string, StoredContent>();

function readCache() {
  if (typeof window === "undefined") {
    return {} as Record<string, StoredContent>;
  }

  const raw = window.localStorage.getItem(CACHE_KEY);

  if (!raw) {
    return {} as Record<string, StoredContent>;
  }

  try {
    return JSON.parse(raw) as Record<string, StoredContent>;
  } catch {
    return {} as Record<string, StoredContent>;
  }
}

function writeCache(nextCache: Record<string, StoredContent>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CACHE_KEY, JSON.stringify(nextCache));
}

function cacheContent(cid: string, content: StoredContent) {
  inMemoryCache.set(cid, content);
  const nextCache = readCache();
  nextCache[cid] = content;
  writeCache(nextCache);
}

function loadCachedContent(cid: string) {
  const memoryValue = inMemoryCache.get(cid);

  if (memoryValue) {
    return memoryValue;
  }

  const persistentValue = readCache()[cid];

  if (persistentValue) {
    inMemoryCache.set(cid, persistentValue);
    return persistentValue;
  }

  return null;
}

function tagToEmoji(tag: TagId | undefined) {
  if (tag === "loneliness") return "🌙";
  if (tag === "migration") return "🌊";
  if (tag === "work") return "💼";
  if (tag === "love") return "💫";
  if (tag === "insomnia") return "🌌";
  if (tag === "poetry") return "✒️";
  if (tag === "growth") return "🌱";
  if (tag === "memory") return "📷";

  return "✦";
}

function toParagraphs(text: string) {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${line}</p>`)
    .join("");
}

function buildSignalTitle(source: string) {
  const trimmed = source.trim();

  if (!trimmed) {
    return "新的信号弹";
  }

  return trimmed.slice(0, 18);
}

function buildSignalHook(input: ComposeInput) {
  if (input.visibility === "public") {
    return input.hook.trim();
  }

  const privatePreview = stripHtml(input.contentHtml).trim();
  return privatePreview.slice(0, 60) || "仅自己主页可见的信号弹";
}

async function uploadJsonDocument(
  content: StoredContent,
  options: {
    keyvalues?: Record<string, string>;
    name: string;
  },
) {
  const response = await fetch("/api/pinata-json", {
    body: JSON.stringify({
      content,
      keyvalues: options.keyvalues,
      name: options.name,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "上传到 Pinata 失败，请稍后重试。");
  }

  const payload = (await response.json()) as { cid: string };
  cacheContent(payload.cid, content);
  return payload.cid;
}

async function fetchIpfsJson<T extends StoredContent>(cid: string): Promise<T | null> {
  const cached = loadCachedContent(cid);

  if (cached) {
    return cached as T;
  }

  for (const gateway of DEFAULT_IPFS_GATEWAYS) {
    try {
      const response = await fetch(`${gateway}${cid}`, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        continue;
      }

      const payload = (await response.json()) as T;

      if (!payload || typeof payload !== "object" || !("kind" in payload)) {
        continue;
      }

      cacheContent(cid, payload as StoredContent);
      return payload;
    } catch {
      continue;
    }
  }

  return null;
}

export async function getStoredContent(cid: string) {
  return fetchIpfsJson<SignalCombinedContent | SignalPublicContent | TextContent>(cid);
}

export async function getEncryptedSignalContent(cid: string) {
  return fetchIpfsJson<EncryptedSignalPrivateContent>(cid);
}

export async function uploadTextContent(
  text: string,
  options: {
    kind?: "text";
    name: string;
    keyvalues?: Record<string, string>;
  },
) {
  return uploadJsonDocument(
    {
      kind: options.kind ?? "text",
      text,
      version: 1,
    },
    options,
  );
}

export async function createInviteReplyContent(replyType: InviteReplyType, text: string) {
  const trimmedText = text.trim();

  if (replyType === "signal") {
    const hook = trimmedText.slice(0, 60) || "新的信号弹";

    return uploadJsonDocument(
      {
        contentHtml: toParagraphs(trimmedText),
        hook,
        kind: "signal-combined",
        previewIcon: "✦",
        title: buildSignalTitle(trimmedText),
        version: 1,
      },
      {
        keyvalues: {
          kind: "invite-reply-signal",
        },
        name: `invite-reply-signal-${Date.now()}`,
      },
    );
  }

  return uploadTextContent(trimmedText, {
    keyvalues: {
      kind: `invite-reply-${replyType}`,
    },
    name: `invite-reply-${replyType}-${Date.now()}`,
  });
}

export async function createSignalPublicContent(input: ComposeInput) {
  const hook = buildSignalHook(input);
  const publicDocument: SignalPublicContent = {
    hook,
    kind: "signal-public",
    previewIcon: tagToEmoji(input.tags[0]),
    title: buildSignalTitle(hook),
    version: 1,
  };

  const hintCid = await uploadJsonDocument(publicDocument, {
    keyvalues: {
      kind: "signal-public",
      visibility: input.visibility,
    },
    name: `signal-public-${Date.now()}`,
  });

  return {
    hintCid,
    publicDocument,
  };
}

export async function createEncryptedSignalDocument(payload: EncryptedSignalJsonPayload) {
  return uploadJsonDocument(
    {
      kind: "signal-private-encrypted",
      payload,
      version: 1,
    },
    {
      keyvalues: {
        kind: "signal-private-encrypted",
      },
      name: `signal-private-${Date.now()}`,
    },
  );
}
