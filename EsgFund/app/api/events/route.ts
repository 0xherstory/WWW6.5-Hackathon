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
          `SELECT e.id, e.protocol_id, p.name AS protocol_name, p.symbol AS protocol_symbol,
                  e.event_type, e.severity, e.notes, e.created_at
           FROM events e
           LEFT JOIN protocols p ON p.id = e.protocol_id
           WHERE e.protocol_id = ?
           ORDER BY e.created_at DESC`
        )
        .all(Number(protocolIdParam))
    : db
        .prepare(
          `SELECT e.id, e.protocol_id, p.name AS protocol_name, p.symbol AS protocol_symbol,
                  e.event_type, e.severity, e.notes, e.created_at
           FROM events e
           LEFT JOIN protocols p ON p.id = e.protocol_id
           ORDER BY e.created_at DESC`
        )
        .all();

  return NextResponse.json({ data: rows });
}
