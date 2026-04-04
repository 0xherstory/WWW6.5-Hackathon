import {
  applyScenario,
  calculateEsgScore,
  evaluatePolicy,
  type Scenario,
  validateScoreInput
} from "@/lib/esg";
import { getDb } from "@/lib/sqlite-db";
import { NextResponse } from "next/server";

type CalculateScoreInput = {
  protocolId: number;
  environmental: number;
  social: number;
  governance: number;
  scenario?: Scenario;
  scenarios?: Scenario[];
  eventType?: string;
  severity?: string;
  notes?: string;
};

export async function POST(request: Request) {
  const db = getDb();
  const body = (await request.json()) as Partial<CalculateScoreInput>;

  if (
    typeof body.protocolId !== "number" ||
    typeof body.environmental !== "number" ||
    typeof body.social !== "number" ||
    typeof body.governance !== "number"
  ) {
    return NextResponse.json(
      {
        error: "protocolId, environmental, social, governance are required numbers"
      },
      { status: 400 }
    );
  }

  const baseInput = {
    environmental: body.environmental,
    social: body.social,
    governance: body.governance
  };

  const validationError = validateScoreInput(baseInput);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const protocol = db
    .prepare(
      "SELECT id, name, current_rating, target_allocation FROM protocols WHERE id = ?"
    )
    .get(body.protocolId);

  if (!protocol) {
    return NextResponse.json({ error: "protocol not found" }, { status: 404 });
  }

  const scenarioQueue: Scenario[] = [
    ...(body.scenario ? [body.scenario] : []),
    ...(Array.isArray(body.scenarios) ? body.scenarios : [])
  ];

  let adjustedInput = baseInput;
  for (const item of scenarioQueue) {
    adjustedInput = applyScenario(adjustedInput, item);
  }

  const score = calculateEsgScore(adjustedInput);
  const hasSevereIncident =
    (body.severity ?? "").toLowerCase() === "severe" || scenarioQueue.includes("security_incident");

  const policy = evaluatePolicy({
    previousRating: String(protocol.current_rating) as "AAA" | "AA" | "A" | "BBB" | "BB" | "B",
    newRating: score.rating,
    currentAllocation: Number(protocol.target_allocation),
    hasSevereIncident
  });

  db.prepare(
    "UPDATE protocols SET current_rating = ?, total_score = ?, target_allocation = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?"
  ).run(score.rating, score.total, policy.nextAllocation, body.protocolId);

  db.prepare(
    "INSERT INTO score_history (protocol_id, environmental, social, governance, total, rating) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(
    body.protocolId,
    score.environmental,
    score.social,
    score.governance,
    score.total,
    score.rating
  );

  const finalEventType = body.eventType ?? body.scenario;
  if (finalEventType) {
    db.prepare(
      "INSERT INTO events (protocol_id, event_type, severity, notes) VALUES (?, ?, ?, ?)"
    ).run(
      body.protocolId,
      finalEventType,
      body.severity ?? (finalEventType === "security_incident" ? "severe" : "low"),
      body.notes ?? null
    );
  }

  const updatedProtocol = db
    .prepare(
      "SELECT id, name, symbol, current_rating, total_score, target_allocation, last_updated FROM protocols WHERE id = ?"
    )
    .get(body.protocolId);

  const latestHistory = db
    .prepare(
      "SELECT id, protocol_id, environmental, social, governance, total, rating, calculated_at FROM score_history WHERE protocol_id = ? ORDER BY id DESC LIMIT 1"
    )
    .get(body.protocolId);

  return NextResponse.json({
    data: {
      protocol: updatedProtocol,
      scoreHistory: latestHistory,
      appliedScenarios: scenarioQueue,
      policyAction: policy.action
    }
  });
}
