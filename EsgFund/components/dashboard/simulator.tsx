"use client";

import { useLanguage } from "@/components/i18n/language-context";
import type { ExecutionMode, HistoryRow, ProtocolRow, StrategyAdvice } from "@/components/dashboard/types";
import type { Scenario } from "@/lib/esg";

const scenarioList: Scenario[] = ["governance_drop", "security_incident", "rating_downgrade", "new_audit", "rating_upgrade"];

function scenarioLabel(value: Scenario): string {
  if (value === "rating_downgrade") {
    return "rating downgrade";
  }
  if (value === "rating_upgrade") {
    return "rating upgrade";
  }
  return value;
}

type SimulatorProps = {
  protocols: ProtocolRow[];
  history: HistoryRow[];
  strategyAdvice: StrategyAdvice;
  executionMode: ExecutionMode;
  selectedProtocolId: number | null;
  onExecutionModeChange: (mode: ExecutionMode) => void;
  onSelectProtocol: (protocolId: number) => void;
  onRunScenario: (scenario: Scenario) => Promise<void>;
  onApplyStrategy: () => Promise<void>;
  loading: boolean;
};

export function Simulator({
  protocols,
  history,
  strategyAdvice,
  executionMode,
  selectedProtocolId,
  onExecutionModeChange,
  onSelectProtocol,
  onRunScenario,
  onApplyStrategy,
  loading
}: SimulatorProps) {
  const { language } = useLanguage();
  const isZh = language === "zh";
  const selectedHistory = history.find((item) => item.protocol_id === selectedProtocolId);

  return (
    <section id="simulator" className="panel" aria-labelledby="simulator-title">
      <div className="panel-head">
        <h2 id="simulator-title">{isZh ? "模拟器" : "Simulator"}</h2>
        <p className="panel-sub">
          {isZh
            ? "运行情景，调用 /api/calculate-score，再刷新 dashboard/history/events。"
            : "Run a scenario, call /api/calculate-score, then refresh dashboard/history/events."}
        </p>
      </div>

      <div className="simulator-controls">
        <label>{isZh ? "执行模式" : "Execution Mode"}</label>
        <div className="mode-toggle" role="group" aria-label="Execution mode">
          <button type="button" className="mode-btn" data-active={executionMode === "AUTO"} onClick={() => onExecutionModeChange("AUTO")} disabled={loading}>
            AUTO
          </button>
          <button type="button" className="mode-btn" data-active={executionMode === "MANUAL"} onClick={() => onExecutionModeChange("MANUAL")} disabled={loading}>
            MANUAL
          </button>
        </div>
        <p className="simulator-hint">
          {executionMode === "AUTO"
            ? isZh
              ? "AUTO：scenario 后等待 Reactive 回调触发 Portfolio 自动调仓。"
              : "AUTO: after scenario, wait for Reactive callback to trigger automatic portfolio rebalance."
            : isZh
              ? "MANUAL：scenario 后由你手动点击 ApplyEsgStrategy 执行策略。"
              : "MANUAL: after scenario, you manually execute strategy by clicking ApplyEsgStrategy."}
        </p>

        <label htmlFor="protocolSelect">{isZh ? "协议" : "Protocol"}</label>
        <select id="protocolSelect" value={selectedProtocolId ?? ""} onChange={(event) => onSelectProtocol(Number(event.target.value))}>
          {protocols.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        {selectedHistory ? (
          <p className="simulator-hint">
            {isZh ? "基线分数" : "Base Score"}: E {selectedHistory.environmental} / S {selectedHistory.social} / G {selectedHistory.governance}
          </p>
        ) : (
          <p className="simulator-hint">{isZh ? "当前协议无历史评分。" : "No history available for selected protocol."}</p>
        )}
      </div>

      <div className="scenario-grid">
        {scenarioList.map((scenario) => (
          <button key={scenario} type="button" className="scenario-btn" onClick={() => void onRunScenario(scenario)} disabled={loading || !selectedHistory}>
            {scenarioLabel(scenario)}
          </button>
        ))}
      </div>

      <div className="strategy-box">
        <p className="strategy-title">{isZh ? "调仓决策" : "Rebalance Decision"}</p>
        <p className="strategy-reason">{strategyAdvice.reason}</p>
        <p className="strategy-summary">{strategyAdvice.summary}</p>
        <button
          type="button"
          className="apply-btn"
          disabled={loading || strategyAdvice.action === "HOLD" || !selectedHistory || executionMode === "AUTO"}
          onClick={() => void onApplyStrategy()}
        >
          {executionMode === "AUTO"
            ? isZh
              ? "ApplyEsgStrategy（AUTO 模式锁定）"
              : "ApplyEsgStrategy (AUTO Mode Locked)"
            : "ApplyEsgStrategy"}
        </button>
      </div>
    </section>
  );
}
