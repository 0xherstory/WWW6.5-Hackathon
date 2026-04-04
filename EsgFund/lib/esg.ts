export type Rating = "AAA" | "AA" | "A" | "BBB" | "BB" | "B";

export type PolicyAction = "INCREASE" | "REDUCE" | "EXIT" | "HOLD";

export type Scenario =
  | "governance_drop"
  | "security_incident"
  | "rating_downgrade"
  | "new_audit"
  | "rating_upgrade";

export type EsgDimensionScores = {
  environmental: number;
  social: number;
  governance: number;
};

export type EsgScoreResult = EsgDimensionScores & {
  total: number;
  rating: Rating;
};

const MAX = {
  environmental: 25,
  social: 35,
  governance: 40
} as const;

const ratingOrder: Record<Rating, number> = {
  AAA: 5,
  AA: 4,
  A: 3,
  BBB: 2,
  BB: 1,
  B: 0
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function validateScoreInput(input: EsgDimensionScores): string | null {
  if (input.environmental < 0 || input.environmental > MAX.environmental) {
    return "environmental must be between 0 and 25";
  }
  if (input.social < 0 || input.social > MAX.social) {
    return "social must be between 0 and 35";
  }
  if (input.governance < 0 || input.governance > MAX.governance) {
    return "governance must be between 0 and 40";
  }
  return null;
}

export function mapScoreToRating(totalScore: number): Rating {
  if (totalScore >= 85) return "AAA";
  if (totalScore >= 75) return "AA";
  if (totalScore >= 65) return "A";
  if (totalScore >= 55) return "BBB";
  if (totalScore >= 45) return "BB";
  return "B";
}

export function calculateEsgScore(input: EsgDimensionScores): EsgScoreResult {
  const validationError = validateScoreInput(input);
  if (validationError) {
    throw new Error(validationError);
  }

  const environmental = clamp(Math.round(input.environmental), 0, MAX.environmental);
  const social = clamp(Math.round(input.social), 0, MAX.social);
  const governance = clamp(Math.round(input.governance), 0, MAX.governance);

  const total = environmental + social + governance;
  const rating = mapScoreToRating(total);

  return {
    environmental,
    social,
    governance,
    total,
    rating
  };
}

export function applyScenario(input: EsgDimensionScores, scenario: Scenario): EsgDimensionScores {
  const next = { ...input };

  switch (scenario) {
    case "governance_drop":
      next.governance -= 8;
      next.social -= 2;
      break;
    case "security_incident":
      next.governance -= 10;
      next.social -= 8;
      next.environmental -= 1;
      break;
    case "rating_downgrade":
      next.environmental -= 5;
      next.social -= 10;
      next.governance -= 10;
      break;
    case "new_audit":
      next.governance += 6;
      next.social += 2;
      break;
    case "rating_upgrade":
      next.environmental += 5;
      next.social += 10;
      next.governance += 10;
      break;
    default:
      break;
  }

  return {
    environmental: clamp(next.environmental, 0, MAX.environmental),
    social: clamp(next.social, 0, MAX.social),
    governance: clamp(next.governance, 0, MAX.governance)
  };
}

export function evaluatePolicy(params: {
  previousRating: Rating;
  newRating: Rating;
  currentAllocation: number;
  hasSevereIncident: boolean;
}): { action: PolicyAction; nextAllocation: number } {
  const { previousRating, newRating, currentAllocation, hasSevereIncident } = params;

  if (hasSevereIncident) {
    return { action: "EXIT", nextAllocation: 0 };
  }

  if (ratingOrder[previousRating] >= ratingOrder.A && newRating === "BBB") {
    return { action: "REDUCE", nextAllocation: Math.max(currentAllocation - 10, 0) };
  }

  if (ratingOrder[newRating] <= ratingOrder.BB) {
    return { action: "EXIT", nextAllocation: 0 };
  }

  if (ratingOrder[newRating] >= ratingOrder.AA) {
    return { action: "INCREASE", nextAllocation: Math.min(currentAllocation + 10, 100) };
  }

  return { action: "HOLD", nextAllocation: currentAllocation };
}
