import type { DomainAttribute } from "./domain";

export interface MilestoneLevel {
  threshold: number; // 3, 6, 9, 12, 15
  sbtId: string;
  sbtName: string; // 【不请自来的席位】
  sbtIcon: string;
  situation: string; // 真实经历
  flavor: string; // SBT 获得后的文案
}

export interface MilestoneBranch {
  attribute: DomainAttribute;
  branchName: string; // 平权意识 / 法理精神
  color: string;
  levels: MilestoneLevel[]; // 5 levels
}

export interface LeaderMilestones {
  leaderId: string;
  leaderName: string;
  branches: MilestoneBranch[];
}
