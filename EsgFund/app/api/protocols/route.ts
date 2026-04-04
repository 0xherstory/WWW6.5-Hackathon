import { getDb } from "@/lib/sqlite-db";
import { NextResponse } from "next/server";

export async function GET() {
  const db = getDb();
  const protocols = db
    .prepare(
      "SELECT id, name, symbol, current_rating, total_score, target_allocation, last_updated FROM protocols ORDER BY name ASC"
    )
    .all();

  return NextResponse.json({ data: protocols });
}
