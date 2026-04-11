import { useState } from "react";
import DashboardPanel from "./DashboardPanel";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

const stagger = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.3, duration: 0.5, ease: "easeOut" },
  }),
};

export default function EducationalContext() {
  const [expanded, setExpanded] = useState(false);

  return (
    <DashboardPanel title="Educational Context" titleCn="教育背景知识" tag="09 · Learn 学习" tagColor="green">
      <motion.p custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-muted-foreground text-sm font-mono mb-4">
        Understanding the causal chain between physical activity and retinal health risk.
        <br />了解身体活动与视网膜健康风险之间的因果链。
      </motion.p>

      <div className="space-y-3 mb-4">
        <motion.div custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="bg-muted rounded-lg p-4 border border-border">
          <p className="font-mono text-xs text-primary tracking-wider uppercase mb-2">CAUSAL CHAIN 1: PHYSICAL IMPACT 物理冲击</p>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-foreground">
            {["High G-Force Activity\n高G力活动", "Vitreous Body Stress\n玻璃体应力", "Retinal Traction\n视网膜牵拉"].map((text, i) => (
              <motion.span key={i} custom={1.5 + i * 0.3} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="bg-card px-2 py-1 rounded border border-border whitespace-pre-line">
                {text}
              </motion.span>
            )).reduce((acc: React.ReactNode[], el, i) => {
              if (i > 0) acc.push(<span key={`a${i}`} className="text-primary">→</span>);
              acc.push(el);
              return acc;
            }, [])}
            <span className="text-primary">→</span>
            <motion.span custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="bg-destructive/20 px-2 py-1 rounded border border-destructive/30 text-destructive whitespace-pre-line">
              Detachment Risk{"\n"}脱离风险
            </motion.span>
          </div>
          <p className="font-mono text-[10px] text-muted-foreground mt-2">
            Activities above 5G can cause acute vitreous displacement.
            <br/>超过5G的活动可导致急性玻璃体移位。
          </p>
        </motion.div>

        <motion.div custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="bg-muted rounded-lg p-4 border border-border">
          <p className="font-mono text-xs text-primary tracking-wider uppercase mb-2">CAUSAL CHAIN 2: POSTURAL STRESS 姿态压力</p>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-foreground">
            {["Prolonged Screen Use\n长时间使用屏幕", "Intraocular Pressure ↑\n眼内压升高", "Ciliary Muscle Fatigue\n睫状肌疲劳"].map((text, i) => (
              <motion.span key={i} custom={3.5 + i * 0.3} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="bg-card px-2 py-1 rounded border border-border whitespace-pre-line">
                {text}
              </motion.span>
            )).reduce((acc: React.ReactNode[], el, i) => {
              if (i > 0) acc.push(<span key={`b${i}`} className="text-primary">→</span>);
              acc.push(el);
              return acc;
            }, [])}
            <span className="text-primary">→</span>
            <motion.span custom={5} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="bg-amber/20 px-2 py-1 rounded border border-amber/30 text-amber whitespace-pre-line">
              Myopia Progression{"\n"}近视加深
            </motion.span>
          </div>
          <p className="font-mono text-[10px] text-muted-foreground mt-2">
            Head-down posture for &gt;2h raises IOP by 2-4 mmHg.
            <br/>连续低头超过2小时可使眼内压升高2-4 mmHg。
          </p>
        </motion.div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 font-mono text-xs text-primary hover:text-primary/80 transition-colors"
      >
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {expanded ? "Collapse Details 收起详情" : "Expand Details 展开详情"}
      </button>

      {expanded && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 space-y-3">
          <div className="bg-muted rounded-lg p-4 border border-border">
            <p className="font-mono text-xs text-primary tracking-wider uppercase mb-2">FMEA RPN FORMULA · FMEA 风险优先数公式</p>
            <div className="space-y-2">
              {[
                { label: "Severity (Acceleration) 严重度（加速度）", factor: "S", color: "bg-destructive" },
                { label: "Occurrence (Duration) 发生度（时长）", factor: "O", color: "bg-amber" },
                { label: "Detection (Posture) 检测难度（姿态）", factor: "D", color: "bg-primary" },
                { label: "Symptom Multiplier 症状系数", factor: "×1.0–1.5", color: "bg-neon-green" },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-3">
                  <span className={`font-mono text-[10px] ${f.color} text-background px-2 py-0.5 rounded`}>{f.factor}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{f.label}</span>
                </div>
              ))}
            </div>
            <p className="font-mono text-xs text-foreground mt-3 bg-card rounded p-2 border border-border">
              RPN = S × O × D × SymptomMultiplier → mapped to 0–100
            </p>
          </div>

          <div className="bg-muted rounded-lg p-4 border border-border">
            <p className="font-mono text-xs text-primary tracking-wider uppercase mb-2">CLINICAL REFERENCES 临床参考</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground font-mono">
              <li>• WHO Guidelines on Physical Activity (2020) / 世界卫生组织体力活动指南</li>
              <li>• AAO Preferred Practice Pattern: Retinal Detachment (2024)</li>
              <li>• AREDS2 Study: Age-Related Eye Disease Risk Factors</li>
            </ul>
          </div>
        </motion.div>
      )}
    </DashboardPanel>
  );
}
