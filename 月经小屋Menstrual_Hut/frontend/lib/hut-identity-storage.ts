/**
 * ⚠️ SECURITY WARNING: THIS IS A DEMO IMPLEMENTATION ONLY
 * * This file stores sensitive user data (phone, ID number, password) in localStorage.
 * This is EXTREMELY INSECURE and should NEVER be used in production.
 * * For production, you MUST:
 * 1. Move all identity storage to a secure backend server
 * 2. Use proper encryption (AES-256, not Base64)
 * 3. Never store raw passwords - use bcrypt or Argon2
 * 4. Implement proper session management with secure tokens
 * 5. Add rate limiting and account lockout mechanisms
 * 6. Use HTTPS only
 * 7. Implement CSRF protection
 * 8. Add audit logging
 */

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
  if (!input.walletAddress || input.walletAddress.trim().length === 0) {
    throw new Error("Invalid wallet address");
  }
  
  // 核心修复：剔除非数字字符，并兼容移除前缀 "86"，再进行 11 位手机号校验
  const cleanPhone = input.phone.replace(/\D/g, "").replace(/^86/, "");
  if (!input.phone || !/^1\d{10}$/.test(cleanPhone)) {
    throw new Error("Invalid phone number");
  }
  
  if (!input.plainIdNumber || !/^\d{17}[\dXx]$/.test(input.plainIdNumber.trim())) {
    throw new Error("Invalid ID number");
  }
  
  if (!input.password || input.password.length < 6) {
    throw new Error("Invalid password (minimum 6 characters)");
  }

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