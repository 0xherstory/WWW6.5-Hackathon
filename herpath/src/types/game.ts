export type Domain = "art" | "science" | "law";

export type GameState = "intro" | "quiz" | "tiebreak" | "result" | "domain";

// Attributes per domain
export type ArtAttr = "creativity" | "resilience";
export type ScienceAttr = "curiosity" | "rigor";
export type LawAttr = "justice" | "courage";
export type Attribute = ArtAttr | ScienceAttr | LawAttr;

// SBT identifiers
export type SBTId =
  | "spark"       // art - creativity
  | "brush"       // art - resilience
  | "explorer"    // science - curiosity
  | "experiment"  // science - rigor
  | "scale"       // law - justice
  | "warrior";    // law - courage

export interface SBTDefinition {
  id: SBTId;
  domain: Domain;
  attribute: Attribute;
  name: string;
  icon: string;
  highlightTitle: string;
  highlightStory: string;
  color: string;
}

export interface CardOption {
  text: string;
  attribute: Attribute;
  value: 1 | 2;
}

export interface Card {
  id: string;
  domain: Domain;
  scene: string;
  text: string;
  options: [CardOption, CardOption];
}

export interface AttributeState {
  creativity: number;
  resilience: number;
  curiosity: number;
  rigor: number;
  justice: number;
  courage: number;
}

export interface GameProgress {
  domain: Domain;
  attributes: AttributeState;
  mintedSBTs: SBTId[];
  drawnCardIds: string[];
  milestoneUnlocked: boolean;
}

export type DomainScores = Record<Domain, number>;

export interface Question {
  id: number;
  scene: string;
  text: string;
  options: QuizOption[];
}

export interface QuizOption {
  id: string;
  text: string;
  weights: DomainScores;
}
