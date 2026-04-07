/**
 * Publish Case Service
 * Orchestrates: image upload → payload build → on-chain proof → store
 */


import {
  generateCaseId,
  generateMetaHash,
  createCaseOnChain,
} from './blockchain';
import { addCase, nextCaseNumber } from './caseStore';
import type { CaseItem } from '@/data/mockData';

export interface PublishCaseInput {
  title: string;
  animalType: '猫' | '狗' | '其他';
  urgency: '一般' | '较急' | '紧急';
  location: string;
  city: string;
  situation: string;
  needTags: string[];
  needNote: string;
  contact: string;
  contactVisibility: string;
  imageFiles: File[];
}

export interface PublishCaseResult {
  caseItem: CaseItem;
  txHash: string;
  caseNo: number;
}

/** Upload images – returns URLs. Currently uses object URLs as mock. */
async function uploadImages(files: File[]): Promise<string[]> {
  // TODO: Replace with Supabase Storage or other CDN upload
  return files.map((f) => URL.createObjectURL(f));
}

/** Unique ID generator (no crypto dependency) */
function genId(): string {
  return `case-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function publishCase(
  input: PublishCaseInput,
): Promise<PublishCaseResult> {
  // 1. Upload images
  const imageUrls = await uploadImages(input.imageFiles);

  // 2. Build unique identifiers
  const offChainId = genId();
  const caseIdBytes32 = generateCaseId(offChainId);
  const now = Date.now();

  const metaHashBytes32 = generateMetaHash({
    title: input.title,
    description: input.situation,
    helpTypes: input.needTags,
    contactVisibility: input.contactVisibility,
    timestamp: now,
    city: input.city,
    animalType: input.animalType,
  });

  // 3. On-chain proof
  const { txHash } = await createCaseOnChain(caseIdBytes32, metaHashBytes32);

  // 4. Build CaseItem
  const caseNo = nextCaseNumber();
  const caseItem: CaseItem = {
    id: offChainId,
    title: input.title,
    animalType: input.animalType,
    status: input.urgency === '紧急' ? '待接应' : '待安置',
    location: input.location,
    city: input.city || '上海',
    updatedAt: '刚刚',
    isUrgent: input.urgency === '紧急',
    urgencyLevel: input.urgency,
    image: imageUrls[0] || '',
    description: input.situation,
    contact: input.contact,
    helpType: 'emergency',
    heatValue: 0,
    initiatorDone: [],
    needs: input.needTags.map((tag, i) => ({
      id: `n-${i}`,
      name: tag,
      fulfilled: false,
      category: 'help' as const,
      desc: input.needNote && i === 0 ? input.needNote : undefined,
    })),
    timeline: [
      {
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        content: '个案已发布',
        type: 'milestone' as const,
      },
    ],
    evidences: [
      {
        id: `ev-${Date.now()}`,
        type: '发布存证',
        uploadedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        confirmed: true,
        chainStatus: 'stored' as const,
        chainHash: txHash,
        chainId: `AVX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(caseNo).padStart(3, '0')}`,
      },
    ],
    // Store extra data for detail page
    _extra: {
      imageUrls,
      txHash,
      caseNo,
      caseIdBytes32,
      metaHashBytes32,
      contactVisibility: input.contactVisibility,
    },
  } as CaseItem & { _extra: any };

  // 5. Persist to store
  addCase(caseItem);

  return { caseItem, txHash, caseNo };
}
