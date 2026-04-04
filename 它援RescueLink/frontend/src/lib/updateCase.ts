/**
 * Update Case Service
 * Handles adding progress updates to existing cases with on-chain anchoring.
 */

import { generateMetaHash, addUpdateOnChain } from './blockchain';
import { getCaseById } from './caseStore';
import type { CaseItem, TimelineItem } from '@/data/mockData';

export interface UpdateCaseInput {
  caseId: string;
  updateType: '进展更新' | '凭证上传' | '状态变更';
  content: string;
}

export interface UpdateCaseResult {
  txHash: string;
  timelineEntry: TimelineItem;
}

/**
 * Add a progress update to a case and anchor on-chain via addUpdate.
 */
export async function updateCase(input: UpdateCaseInput): Promise<UpdateCaseResult> {
  const caseItem = getCaseById(input.caseId);
  if (!caseItem) throw new Error('个案未找到');

  const extra = (caseItem as any)._extra;
  const chainCaseId = extra?.caseIdBytes32;
  if (!chainCaseId) throw new Error('个案缺少链上标识');

  const now = Date.now();
  const updateHash = generateMetaHash({
    title: input.content,
    description: input.updateType,
    helpTypes: [],
    contactVisibility: '',
    timestamp: now,
  });

  const { txHash } = await addUpdateOnChain(chainCaseId, updateHash, input.updateType);

  const timelineEntry: TimelineItem = {
    date: new Date().toISOString().slice(0, 16).replace('T', ' '),
    content: input.content,
    type: input.updateType === '凭证上传' ? 'evidence' : 'update',
  };

  // TODO: persist timeline update to caseStore / Supabase
  return { txHash, timelineEntry };
}
