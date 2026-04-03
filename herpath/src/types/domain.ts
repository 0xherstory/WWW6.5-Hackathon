export type DomainAttribute = "legality" | "impact" | "resilience" | "equality";

export interface DomainCard {
  id: string;
  situation: string;
  leftText: string;
  leftAttr: DomainAttribute;
  rightText: string;
  rightAttr: DomainAttribute;
  imageKey: string;
}

export interface DomainState {
  attributes: Record<DomainAttribute, number>;
  drawnCardIds: string[];
  sbtsMinted: string[]; // SBT IDs that have been minted
  milestonesUnlocked: number; // count of milestones triggered
}

export interface AttributeThreshold {
  attr: DomainAttribute;
  threshold: number;
  sbtId: string;
  sbtName: string;
  sbtIcon: string;
}
