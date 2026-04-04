export type KpiItem = {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "flat";
};

export type EsgScoreRow = {
  protocol: string;
  environmental: number;
  social: number;
  governance: number;
  total: number;
  rating: string;
};

export type MethodologyItem = {
  title: string;
  description: string;
};

export type AllocationItem = {
  name: string;
  value: number;
  color: string;
};

export type TimelineItem = {
  time: string;
  title: string;
  status: "done" | "pending";
};

export type SimulatorEvent = {
  trigger: string;
  action: string;
  effect: string;
};

export type NavItem = {
  label: string;
  href: string;
};

export const navItems: NavItem[] = [
  { label: "Overview", href: "#overview" },
  { label: "ESG", href: "#esg-dashboard" },
  { label: "Portfolio", href: "#portfolio-allocation" },
  { label: "Policy", href: "#simulator" },
  { label: "Architecture", href: "#architecture" }
];

export const kpiItems: KpiItem[] = [
  { label: "Fund NAV", value: "$12.48M", delta: "+1.3%", trend: "up" },
  { label: "Avg ESG Score", value: "78.4", delta: "+2.1", trend: "up" },
  { label: "Controversy Alerts", value: "3", delta: "-2", trend: "down" },
  { label: "Policy Actions", value: "11", delta: "0", trend: "flat" }
];

export const esgRows: EsgScoreRow[] = [
  { protocol: "GREEN", environmental: 21, social: 27, governance: 32, total: 80, rating: "AA" },
  { protocol: "STEADY", environmental: 16, social: 24, governance: 28, total: 68, rating: "A" },
  { protocol: "RISKY", environmental: 14, social: 20, governance: 22, total: 56, rating: "BBB" },
  { protocol: "USD", environmental: 10, social: 16, governance: 18, total: 44, rating: "B" }
];

export const methodologyItems: MethodologyItem[] = [
  {
    title: "Environmental (25)",
    description: "Energy efficiency, carbon intensity, and sustainable infra signals."
  },
  {
    title: "Social (35)",
    description: "Community trust, contributor stability, and incident transparency."
  },
  {
    title: "Governance (40)",
    description: "On-chain controls, treasury policy discipline, and voting quality."
  }
];

export const allocationItems: AllocationItem[] = [
  { name: "GREEN", value: 36, color: "#1f8a70" },
  { name: "STEADY", value: 28, color: "#5fb49c" },
  { name: "RISKY", value: 21, color: "#9fd8cb" },
  { name: "USD", value: 15, color: "#dce1de" }
];

export const simulatorEvents: SimulatorEvent[] = [
  {
    trigger: "Rating drops A -> BBB",
    action: "Reduce exposure by policy",
    effect: "Weight shifts to higher-ranked protocols"
  },
  {
    trigger: "Severe controversy reported",
    action: "Exit protocol position",
    effect: "Allocation moved to cash buffer"
  },
  {
    trigger: "Rating rises to AA",
    action: "Increase target allocation",
    effect: "Protocol gets positive rebalance"
  }
];

export const timelineItems: TimelineItem[] = [
  { time: "09:00", title: "ESG snapshot calculated", status: "done" },
  { time: "09:05", title: "Oracle update queued", status: "done" },
  { time: "09:10", title: "Reactive policy evaluated", status: "done" },
  { time: "09:12", title: "Portfolio rebalance prepared", status: "pending" }
];

export const architectureItems = [
  { title: "Off-chain Scoring", detail: "Computes ESG vectors from curated inputs." },
  { title: "Oracle Layer", detail: "Publishes score updates for policy consumption." },
  { title: "Reactive Policy", detail: "Evaluates thresholds and selects actions." },
  { title: "Portfolio Engine", detail: "Applies new target weights for demonstration." }
];
