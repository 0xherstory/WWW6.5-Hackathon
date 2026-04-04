import { getDb } from "@/lib/sqlite-db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const protocolIdParam = searchParams.get("protocolId");

  if (protocolIdParam && Number.isNaN(Number(protocolIdParam))) {
    return NextResponse.json({ error: "protocolId must be a number" }, { status: 400 });
  }

  const rows = protocolIdParam
    ? db
        .prepare(
          `SELECT h.id, h.protocol_id, p.name AS protocol_name, p.symbol AS protocol_symbol,
                  h.environmental, h.social, h.governance, h.total, h.rating, h.calculated_at
           FROM score_history h
           JOIN protocols p ON p.id = h.protocol_id
           WHERE h.protocol_id = ?
           ORDER BY h.calculated_at DESC`
        )
        .all(Number(protocolIdParam))
    : db
        .prepare(
          `SELECT h.id, h.protocol_id, p.name AS protocol_name, p.symbol AS protocol_symbol,
                  h.environmental, h.social, h.governance, h.total, h.rating, h.calculated_at
           FROM score_history h
           JOIN protocols p ON p.id = h.protocol_id
           ORDER BY h.calculated_at DESC`
        )
        .all();

  return NextResponse.json({ data: rows });
}
