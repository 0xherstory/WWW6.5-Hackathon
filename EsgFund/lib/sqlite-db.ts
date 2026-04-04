import path from "path";
import seedData from "@/data/seed-db.json";

type Database = {
  exec: (sql: string) => void;
  prepare: (sql: string) => {
    get: (...params: unknown[]) => Record<string, unknown> | undefined;
    all: (...params: unknown[]) => Record<string, unknown>[];
    run: (...params: unknown[]) => void;
  };
};

const sqlite = require("node:sqlite") as {
  DatabaseSync: new (filename: string) => Database;
};

const dbPath = path.join(process.cwd(), "data", "esg.db");
const db = new sqlite.DatabaseSync(dbPath);

let initialized = false;

export function getDb() {
  if (!initialized) {
    initializeDatabase();
    initialized = true;
  }
  return db;
}

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS protocols (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      symbol TEXT,
      current_rating TEXT NOT NULL,
      total_score INTEGER NOT NULL,
      target_allocation INTEGER NOT NULL DEFAULT 0,
      last_updated TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS score_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      protocol_id INTEGER NOT NULL,
      environmental INTEGER NOT NULL,
      social INTEGER NOT NULL,
      governance INTEGER NOT NULL,
      total INTEGER NOT NULL,
      rating TEXT NOT NULL,
      calculated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (protocol_id) REFERENCES protocols(id)
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      protocol_id INTEGER,
      event_type TEXT NOT NULL,
      severity TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (protocol_id) REFERENCES protocols(id)
    );
  `);

  seedIfEmpty();
  normalizeProtocolNames();
}

function seedIfEmpty() {
  const countRow = db.prepare("SELECT COUNT(*) AS count FROM protocols").get();
  const count = Number(countRow?.count ?? 0);
  if (count > 0) {
    return;
  }

  const insertProtocol = db.prepare(
    "INSERT INTO protocols (name, symbol, current_rating, total_score, target_allocation) VALUES (?, ?, ?, ?, ?)"
  );

  for (const item of seedData.protocols) {
    insertProtocol.run(item.name, item.symbol, item.current_rating, item.total_score, item.target_allocation);
  }

  const protocolRows = db.prepare("SELECT id, name FROM protocols").all();
  const protocolMap = new Map(protocolRows.map((row) => [String(row.name), Number(row.id)]));

  const insertHistory = db.prepare(
    "INSERT INTO score_history (protocol_id, environmental, social, governance, total, rating, calculated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );

  for (const item of seedData.score_history) {
    insertHistory.run(
      protocolMap.get(item.protocol),
      item.environmental,
      item.social,
      item.governance,
      item.total,
      item.rating,
      item.calculated_at
    );
  }

  const insertEvent = db.prepare(
    "INSERT INTO events (protocol_id, event_type, severity, notes) VALUES (?, ?, ?, ?)"
  );

  for (const item of seedData.events) {
    insertEvent.run(protocolMap.get(item.protocol), item.event_type, item.severity, item.notes ?? null);
  }
}

function normalizeProtocolNames() {
  const renames: Array<{ from: string; to: string; symbol: string }> = [
    { from: "AquaLend", to: "GREEN", symbol: "GREEN" },
    { from: "GridVault", to: "STEADY", symbol: "STEADY" },
    { from: "TerraSwap", to: "RISKY", symbol: "RISKY" },
    { from: "NorthBridge", to: "USD", symbol: "USD" }
  ];

  const updateName = db.prepare(
    "UPDATE protocols SET name = ?, symbol = ?, last_updated = CURRENT_TIMESTAMP WHERE name = ?"
  );

  for (const item of renames) {
    updateName.run(item.to, item.symbol, item.from);
  }
}
