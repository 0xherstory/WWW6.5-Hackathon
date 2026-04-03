const AUTH_SESSION_STORAGE_KEY = "seamphore-auth-session-v1";

type PersistedAuthSession = {
  signedAt: string;
  walletAddress: string;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function normalizeWalletAddress(walletAddress: string) {
  return walletAddress.trim().toLowerCase();
}

export function readAuthSession() {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as PersistedAuthSession;

    if (typeof parsed.walletAddress !== "string" || !parsed.walletAddress.trim()) {
      return null;
    }

    if (typeof parsed.signedAt !== "string" || !parsed.signedAt.trim()) {
      return null;
    }

    return {
      signedAt: parsed.signedAt,
      walletAddress: parsed.walletAddress,
    };
  } catch {
    return null;
  }
}

export function hasPersistedAuthSession(walletAddress: string | null | undefined) {
  if (!walletAddress) {
    return false;
  }

  const session = readAuthSession();

  if (!session) {
    return false;
  }

  return normalizeWalletAddress(session.walletAddress) === normalizeWalletAddress(walletAddress);
}

export function persistAuthSession(walletAddress: string) {
  if (!canUseStorage()) {
    return;
  }

  const nextSession: PersistedAuthSession = {
    signedAt: new Date().toISOString(),
    walletAddress,
  };

  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(nextSession));
}

export function clearAuthSession() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
}
