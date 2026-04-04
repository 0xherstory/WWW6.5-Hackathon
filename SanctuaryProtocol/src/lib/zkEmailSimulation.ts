import { keccak256, toBytes } from 'viem';

export interface VerificationStep {
  duration: number;
}

// 验证步骤持续时间（毫秒）
const VERIFICATION_STEPS: VerificationStep[] = [
  { duration: 1500 },
  { duration: 2000 },
  { duration: 2500 },
  { duration: 1000 },
];

export async function simulateZKProof(
  email: string,
  onProgress: (progress: number) => void
): Promise<{ success: boolean; emailHash: string }> {
  let totalProgress = 0;
  const totalDuration = VERIFICATION_STEPS.reduce((sum, s) => sum + s.duration, 0);

  for (const step of VERIFICATION_STEPS) {
    onProgress(totalProgress / totalDuration);
    await sleep(step.duration);
    totalProgress += step.duration;
  }

  onProgress(1);

  const emailHash = hashEmail(email);
  return { success: true, emailHash };
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function hashEmail(email: string): string {
  return keccak256(toBytes(email.toLowerCase()));
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isGmail(email: string): boolean {
  return email.toLowerCase().endsWith('@gmail.com');
}
