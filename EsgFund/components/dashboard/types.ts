export type ProtocolRow = {
  id: number;
  name: string;
  symbol: string | null;
  current_rating: string;
  total_score: number;
  target_allocation: number;
  last_updated: string;
};

export type HistoryRow = {
  id: number;
  protocol_id: number;
  protocol_name: string;
  protocol_symbol: string | null;
  environmental: number;
  social: number;
  governance: number;
  total: number;
  rating: string;
  calculated_at: string;
};

export type EventRow = {
  id: number;
  protocol_id: number | null;
  protocol_name: string | null;
  protocol_symbol: string | null;
  event_type: string;
  severity: string;
  notes: string | null;
  created_at: string;
};

export type DashboardRow = {
  protocolId: number;
  protocol: string;
  environmental: number;
  social: number;
  governance: number;
  total: number;
  rating: string;
  historicalRating: string;
};

export type KpiViewModel = {
  protocolCount: number;
  avgScore: string;
  severeEvents: number;
  historyCount: number;
};

export type StrategyAction = "HOLD" | "REDUCE" | "EXIT" | "INCREASE";
export type ExecutionMode = "AUTO" | "MANUAL";

export type StrategyAdvice = {
  action: StrategyAction;
  reason: string;
  summary: string;
  expectedAllocation: number;
  triggerEventType?: string;
  triggerSeverity?: string;
};

export type OnChainScore = {
  total: number;
  rating: string;
  updatedAt: number;
};

export type PipelineHashes = {
  oracleTxHash?: string;
  reactiveTxHash?: string;
  portfolioTxHash?: string;
};

export type PortfolioDelta = {
  action: StrategyAction;
  beforeBps: number;
  afterBps: number;
};
