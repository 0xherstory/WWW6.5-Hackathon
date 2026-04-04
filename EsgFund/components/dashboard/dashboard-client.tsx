"use client";

import { ArchitectureSection } from "@/components/dashboard/architecture-section";
import { EsgDashboard } from "@/components/dashboard/esg-dashboard";
import { Hero } from "@/components/dashboard/hero";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { Methodology } from "@/components/dashboard/methodology";
import { PortfolioAllocation } from "@/components/dashboard/portfolio-allocation";
import { ProtocolDetailSection } from "@/components/dashboard/protocol-detail-section";
import { Simulator } from "@/components/dashboard/simulator";
import { Timeline } from "@/components/dashboard/timeline";
import { TopNav } from "@/components/dashboard/top-nav";
import { LanguageProvider, useLanguage } from "@/components/i18n/language-context";
import type {
  DashboardRow,
  EventRow,
  HistoryRow,
  KpiViewModel,
  PipelineHashes,
  PortfolioDelta,
  ProtocolRow,
  ExecutionMode,
  StrategyAction,
  StrategyAdvice,
  OnChainScore
} from "@/components/dashboard/types";
import type { Scenario } from "@/lib/esg";
import {
  readScoreOnChain,
  updateScoreOnChain,
  validateOracleConfig
} from "@/lib/oracle-client";
import { PROTOCOL_ADDRESS_BY_NAME, SEPOLIA_CHAIN_ID_HEX } from "@/lib/oracle-config";
import {
  findPortfolioExecution,
  findReactivePolicyTx,
  readPortfolioTargetBps,
  validateReactiveConfig
} from "@/lib/reactive-client";
import { useCallback, useEffect, useMemo, useState } from "react";

type ApiResponse<T> = {
  data: T;
};

type CalculateScoreResponse = {
  data: {
    protocol: ProtocolRow;
    scoreHistory: HistoryRow | null;
    appliedScenarios: Scenario[];
    policyAction: string;
  };
};

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Request failed: ${url}`);
  }
  return (await response.json()) as T;
}

export function DashboardClient() {
  return (
    <LanguageProvider>
      <DashboardClientInner />
    </LanguageProvider>
  );
}

function DashboardClientInner() {
  const { language } = useLanguage();
  const [protocols, setProtocols] = useState<ProtocolRow[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [selectedProtocolId, setSelectedProtocolId] = useState<number | null>(null);
  const [executionMode, setExecutionMode] = useState<ExecutionMode>("AUTO");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [hasProvider, setHasProvider] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletChainId, setWalletChainId] = useState<string | null>(null);
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [pipelineByHistoryId, setPipelineByHistoryId] = useState<Record<number, PipelineHashes | undefined>>({});
  const [, setOnChainScores] = useState<Record<number, OnChainScore | undefined>>({});
  const [onChainTargetBpsByProtocolId, setOnChainTargetBpsByProtocolId] = useState<Record<number, number | undefined>>({});
  const [portfolioDeltaByProtocolId, setPortfolioDeltaByProtocolId] = useState<Record<number, PortfolioDelta | undefined>>({});

  const refreshOnChainScore = useCallback(
    async (protocolId: number) => {
      const protocol = protocols.find((item) => item.id === protocolId);
      if (!protocol) {
        return;
      }

      const protocolAddress = PROTOCOL_ADDRESS_BY_NAME[protocol.name];
      const configError = validateOracleConfig(protocolAddress);
      if (configError) {
        return;
      }

      try {
        const score = await readScoreOnChain(protocolAddress!);
        setOnChainScores((current) => ({
          ...current,
          [protocolId]: {
            total: score.total,
            rating: score.rating,
            updatedAt: score.updatedAt
          }
        }));
      } catch {
        // ignore chain read failures to keep off-chain dashboard usable
      }
    },
    [protocols]
  );

  const refreshOnChainTarget = useCallback(
    async (protocolId: number) => {
      const protocol = protocols.find((item) => item.id === protocolId);
      if (!protocol) {
        return;
      }

      const protocolAddress = PROTOCOL_ADDRESS_BY_NAME[protocol.name];
      if (!protocolAddress) {
        return;
      }

      try {
        const targetBps = await readPortfolioTargetBps(protocolAddress);
        if (targetBps === null) {
          return;
        }
        setOnChainTargetBpsByProtocolId((current) => ({
          ...current,
          [protocolId]: targetBps
        }));
      } catch {
        // keep UI resilient if portfolio contract is not configured
      }
    },
    [protocols]
  );

  const trackPolicyPipeline = useCallback(
    async (historyId: number, oracleTxHash: string, protocolId: number, protocolAddress: string) => {
      const reactiveConfigError = validateReactiveConfig();
      if (reactiveConfigError) {
        return;
      }

      for (let attempt = 0; attempt < 20; attempt += 1) {
        try {
          const [reactiveResult, portfolioResult] = await Promise.all([
            findReactivePolicyTx(oracleTxHash, protocolAddress),
            findPortfolioExecution(oracleTxHash, protocolAddress)
          ]);

          if (reactiveResult || portfolioResult) {
            setPipelineByHistoryId((current) => ({
              ...current,
              [historyId]: {
                ...(current[historyId] ?? {}),
                oracleTxHash,
                reactiveTxHash: reactiveResult?.txHash ?? portfolioResult?.reactiveTxHash,
                portfolioTxHash: portfolioResult?.txHash
              }
            }));
          }

          if (portfolioResult) {
            const actionMap: Record<number, StrategyAction> = {
              0: "HOLD",
              1: "REDUCE",
              2: "EXIT",
              3: "INCREASE"
            };

            setPortfolioDeltaByProtocolId((current) => ({
              ...current,
              [protocolId]: {
                action: actionMap[portfolioResult.executedAction] ?? "HOLD",
                beforeBps: portfolioResult.oldTargetBps,
                afterBps: portfolioResult.newTargetBps
              }
            }));

            await refreshOnChainTarget(protocolId);
            break;
          }
        } catch {
          // transient RPC read error, continue polling
        }

        await new Promise((resolve) => setTimeout(resolve, 4000));
      }
    },
    [refreshOnChainTarget]
  );

  const loadAll = useCallback(async () => {
    setError(null);
    const [protocolsRes, historyRes, eventsRes] = await Promise.all([
      fetchJson<ApiResponse<ProtocolRow[]>>("/api/protocols"),
      fetchJson<ApiResponse<HistoryRow[]>>("/api/history"),
      fetchJson<ApiResponse<EventRow[]>>("/api/events")
    ]);

    setProtocols(protocolsRes.data);
    setHistory(historyRes.data);
    setEvents(eventsRes.data);

    setSelectedProtocolId((current) => current ?? protocolsRes.data[0]?.id ?? null);
  }, []);

  useEffect(() => {
    void loadAll().catch(() =>
      setError(language === "zh" ? "后端数据加载失败。" : "Failed to load backend data.")
    );
  }, [loadAll, language]);

  useEffect(() => {
    if (protocols.length === 0) {
      return;
    }
    for (const protocol of protocols) {
      void refreshOnChainScore(protocol.id);
      void refreshOnChainTarget(protocol.id);
    }
  }, [protocols, refreshOnChainScore, refreshOnChainTarget]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const provider = window.ethereum;
    if (!provider) {
      setHasProvider(false);
      return;
    }

    setHasProvider(true);

    const syncWalletState = async () => {
      try {
        const accounts = (await provider.request({ method: "eth_accounts" })) as string[];
        const chainId = (await provider.request({ method: "eth_chainId" })) as string;
        setWalletAddress(accounts?.[0] ?? null);
        setWalletChainId(chainId ?? null);
      } catch {
        setWalletError("Failed to read wallet state");
      }
    };

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = (args[0] as string[] | undefined) ?? [];
      setWalletAddress(accounts[0] ?? null);
    };

    const handleChainChanged = (...args: unknown[]) => {
      const chainId = (args[0] as string | undefined) ?? null;
      setWalletChainId(chainId);
    };

    void syncWalletState();

    provider.on?.("accountsChanged", handleAccountsChanged);
    provider.on?.("chainChanged", handleChainChanged);

    return () => {
      provider.removeListener?.("accountsChanged", handleAccountsChanged);
      provider.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setWalletError("No wallet provider found");
      return;
    }

    setWalletConnecting(true);
    setWalletError(null);

    try {
      const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
      const chainId = (await window.ethereum.request({ method: "eth_chainId" })) as string;
      setWalletAddress(accounts?.[0] ?? null);
      setWalletChainId(chainId ?? null);
    } catch {
      setWalletError("Wallet connection was rejected or failed");
    } finally {
      setWalletConnecting(false);
    }
  }, []);

  const latestHistoryByProtocol = useMemo(() => {
    const map = new Map<number, HistoryRow>();
    for (const row of history) {
      if (!map.has(row.protocol_id)) {
        map.set(row.protocol_id, row);
      }
    }
    return map;
  }, [history]);

  const previousRatingByProtocol = useMemo(() => {
    const ratingListByProtocol = new Map<number, string[]>();
    for (const row of history) {
      const list = ratingListByProtocol.get(row.protocol_id) ?? [];
      list.push(row.rating);
      ratingListByProtocol.set(row.protocol_id, list);
    }
    const previous = new Map<number, string>();
    for (const [protocolId, list] of ratingListByProtocol.entries()) {
      previous.set(protocolId, list[1] ?? list[0] ?? "-");
    }
    return previous;
  }, [history]);

  const dashboardRows = useMemo<DashboardRow[]>(() => {
    return protocols
      .filter((protocol) => protocol.name !== "USD")
      .map((protocol) => {
        const latest = latestHistoryByProtocol.get(protocol.id);
        return {
          protocolId: protocol.id,
          protocol: protocol.name,
          environmental: latest?.environmental ?? 0,
          social: latest?.social ?? 0,
          governance: latest?.governance ?? 0,
          total: protocol.total_score,
          rating: protocol.current_rating,
          historicalRating: previousRatingByProtocol.get(protocol.id) ?? "-"
        };
      });
  }, [protocols, latestHistoryByProtocol, previousRatingByProtocol]);

  const metrics = useMemo<KpiViewModel>(() => {
    const avg =
      protocols.length === 0
        ? 0
        : protocols.reduce((sum, item) => sum + Number(item.total_score), 0) / protocols.length;

    return {
      protocolCount: protocols.length,
      avgScore: avg.toFixed(1),
      severeEvents: events.filter((event) => event.severity.toLowerCase() === "severe").length,
      historyCount: history.length
    };
  }, [protocols, events, history]);

  const runScenario = useCallback(
    async (scenario: Scenario) => {
      if (!selectedProtocolId) {
        return;
      }

      const baseline = latestHistoryByProtocol.get(selectedProtocolId);
      if (!baseline) {
        setError(
          language === "zh"
            ? "所选协议缺少历史基线数据。"
            : "No history baseline found for selected protocol."
        );
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/calculate-score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            protocolId: selectedProtocolId,
            environmental: baseline.environmental,
            social: baseline.social,
            governance: baseline.governance,
            scenario,
            eventType: scenario,
            notes: "triggered from simulator"
          })
        });

        if (!response.ok) {
          throw new Error("calculate-score failed");
        }

        const payload = (await response.json()) as CalculateScoreResponse;
        const scoreHistory = payload.data.scoreHistory;
        const protocol = protocols.find((item) => item.id === selectedProtocolId);
        if (!scoreHistory || !protocol) {
          await loadAll();
          return;
        }

        if (!walletAddress) {
          throw new Error("Wallet not connected");
        }
        if (walletChainId !== SEPOLIA_CHAIN_ID_HEX) {
          throw new Error("Wallet is not on Sepolia");
        }

        const protocolAddress = PROTOCOL_ADDRESS_BY_NAME[protocol.name];
        const configError = validateOracleConfig(protocolAddress);
        if (configError) {
          throw new Error(configError);
        }

        const txHash = await updateScoreOnChain({
          protocolAddress: protocolAddress!,
          environmental: scoreHistory.environmental,
          social: scoreHistory.social,
          governance: scoreHistory.governance,
          total: scoreHistory.total,
          rating: scoreHistory.rating as "AAA" | "AA" | "A" | "BBB" | "BB" | "B"
        });

        setPipelineByHistoryId((current) => ({
          ...current,
          [scoreHistory.id]: {
            ...(current[scoreHistory.id] ?? {}),
            oracleTxHash: txHash
          }
        }));

        await refreshOnChainScore(selectedProtocolId);
        void trackPolicyPipeline(scoreHistory.id, txHash, selectedProtocolId, protocolAddress!);

        await loadAll();
      } catch {
        await loadAll();
        setError(
          language === "zh"
            ? "Scenario 已完成后端算分，但链上同步失败。请检查钱包、Sepolia 网络和合约地址配置。"
            : "Scenario completed off-chain scoring, but on-chain sync failed. Please check wallet, Sepolia network, and contract address configuration."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      selectedProtocolId,
      latestHistoryByProtocol,
      loadAll,
      protocols,
      walletAddress,
      walletChainId,
      refreshOnChainScore,
      trackPolicyPipeline,
      language
    ]
  );

  const strategyAdvice = useMemo<StrategyAdvice>(() => {
  const selectedProtocol = protocols.find((item) => item.id === selectedProtocolId);
  if (!selectedProtocol) {
    return {
      action: "HOLD",
      reason: language === "zh" ? "未选择协议。" : "No protocol selected.",
      summary: language === "zh" ? "请选择一个协议。" : "Please select a protocol.",
      expectedAllocation: 0
    };
  }

  const dbTarget = Number(selectedProtocol.target_allocation);
  const onChainTargetBps = onChainTargetBpsByProtocolId[selectedProtocol.id];
  const onChainTarget = onChainTargetBps === undefined ? dbTarget : Number((onChainTargetBps / 100).toFixed(2));

  let action: StrategyAction = "HOLD";
  if (dbTarget === 0 && onChainTarget > 0) {
    action = "EXIT";
  } else if (dbTarget > onChainTarget) {
    action = "INCREASE";
  } else if (dbTarget < onChainTarget) {
    action = "REDUCE";
  }

  const reasonMap: Record<StrategyAction, string> = language === "zh"
    ? {
        HOLD: "数据库目标与链上目标一致，无需调整。",
        INCREASE: "数据库建议高于链上当前目标，建议增配。",
        REDUCE: "数据库建议低于链上当前目标，建议减配。",
        EXIT: "数据库目标为 0%，建议退出。"
      }
    : {
        HOLD: "Database target matches on-chain target.",
        INCREASE: "Database target is higher than current on-chain target.",
        REDUCE: "Database target is lower than current on-chain target.",
        EXIT: "Database target is 0%, suggesting exit."
      };

  return {
    action,
    reason: reasonMap[action],
    summary:
      language === "zh"
        ? `当前仓位 ${onChainTarget}% -> 目标 ${dbTarget}%（${action}）`
        : `Current allocation ${onChainTarget}% -> target ${dbTarget}% (${action})`,
    expectedAllocation: dbTarget,
    triggerEventType: "manual_strategy_apply"
  };
}, [protocols, selectedProtocolId, onChainTargetBpsByProtocolId, language]);

  const applyStrategy = useCallback(async () => {
    if (!selectedProtocolId) {
      return;
    }

    const baseline = latestHistoryByProtocol.get(selectedProtocolId);
    if (!baseline || strategyAdvice.action === "HOLD") {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/calculate-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          protocolId: selectedProtocolId,
          environmental: baseline.environmental,
          social: baseline.social,
          governance: baseline.governance,
          eventType: strategyAdvice.triggerEventType ?? "manual_strategy_apply",
          severity: strategyAdvice.triggerSeverity,
          notes: `ApplyEsgStrategy: ${strategyAdvice.reason}`
        })
      });

      if (!response.ok) {
        throw new Error("strategy apply failed");
      }

      await loadAll();
    } catch {
      setError(language === "zh" ? "手动策略执行失败。" : "Failed to apply ESG strategy.");
    } finally {
      setLoading(false);
    }
  }, [selectedProtocolId, latestHistoryByProtocol, strategyAdvice, loadAll, language]);

  return (
    <main className="dashboard-shell">
      <TopNav
        walletAddress={walletAddress}
        hasProvider={hasProvider}
        isSepolia={walletChainId === SEPOLIA_CHAIN_ID_HEX}
        connecting={walletConnecting}
        walletError={walletError}
        onConnectWallet={connectWallet}
      />
      <Hero />
      {error ? <p className="panel-error">{error}</p> : null}
      <KpiCards metrics={metrics} />
      <EsgDashboard rows={dashboardRows} />
      <div className="two-col">
        <Methodology />
        <ProtocolDetailSection events={events} />
      </div>
      <div className="two-col">
        <PortfolioAllocation protocols={protocols} />
        <Simulator
          protocols={protocols}
          history={history}
          strategyAdvice={strategyAdvice}
          executionMode={executionMode}
          selectedProtocolId={selectedProtocolId}
          onExecutionModeChange={setExecutionMode}
          onSelectProtocol={setSelectedProtocolId}
          onRunScenario={runScenario}
          onApplyStrategy={applyStrategy}
          loading={loading}
        />
      </div>
      <Timeline history={history} pipelineByHistoryId={pipelineByHistoryId} />
      <ArchitectureSection />
    </main>
  );
}

