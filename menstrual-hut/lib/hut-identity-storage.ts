const STORAGE_KEY = "menstrual-hut.identity.v1";

export type HutIdentityRecord = {
  walletAddress: string;
  phone: string;
  idNumberSha256: string;
  passwordMockEnc: string;
  registeredAt: number;
};

function readAll(): HutIdentityRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidRecord);
  } catch {
    return [];
  }
}

function isValidRecord(x: unknown): x is HutIdentityRecord {
  if (x === null || typeof x !== "object") return false;
  const r = x as Record<string, unknown>;
  return (
    typeof r.walletAddress === "string" &&
    typeof r.phone === "string" &&
    typeof r.idNumberSha256 === "string" &&
    typeof r.passwordMockEnc === "string" &&
    typeof r.registeredAt === "number"
  );
}

export function isIdentityRegistered(walletAddress: string): boolean {
  const addr = walletAddress.toLowerCase();
  return readAll().some((r) => r.walletAddress.toLowerCase() === addr);
}

export function getIdentityForWallet(walletAddress: string): HutIdentityRecord | undefined {
  const addr = walletAddress.toLowerCase();
  return readAll().find((r) => r.walletAddress.toLowerCase() === addr);
}

export async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** 演示用“加密”，生产环境必须由服务端处理 */
export function mockEncryptPassword(password: string): string {
  const b = typeof btoa !== "undefined" ? btoa(unescape(encodeURIComponent(password))) : "";
  return `mock:enc:v1:${b}`;
}

export async function saveHutIdentity(input: {
  walletAddress: string;
  phone: string;
  plainIdNumber: string;
  password: string;
}): Promise<void> {
  const walletAddress = input.walletAddress.toLowerCase();
  if (isIdentityRegistered(walletAddress)) {
    throw new Error("Identity already registered for this wallet");
  }
  const idNumberSha256 = await sha256Hex(input.plainIdNumber.trim());
  const list = readAll();
  const record: HutIdentityRecord = {
    walletAddress,
    phone: input.phone.trim(),
    idNumberSha256,
    passwordMockEnc: mockEncryptPassword(input.password),
    registeredAt: Date.now(),
  };
  list.push(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
