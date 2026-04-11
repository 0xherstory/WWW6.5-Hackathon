import { useEffect, useRef, useState } from "react";
import DashboardPanel from "./DashboardPanel";
import { motion } from "framer-motion";
import { Activity, Eye, Brain, Shield, ArrowDown } from "lucide-react";

const stagger = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.3, duration: 0.5, ease: "easeOut" },
  }),
};

function AnimatedNode({ children, index, className = "" }: { children: React.ReactNode; index: number; className?: string }) {
  return (
    <motion.div custom={index} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger} className={className}>
      {children}
    </motion.div>
  );
}

function AnimatedArrow({ index }: { index: number }) {
  return (
    <motion.div custom={index} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="flex justify-center py-1">
      <ArrowDown className="w-5 h-5 text-primary" />
    </motion.div>
  );
}

export default function RiskMonitoringDiagram() {
  return (
    <DashboardPanel title="FMEA Risk Monitoring Logic" titleCn="FMEA 风险优先数监控逻辑" tag="08 · Algorithm 算法" tagColor="cyan">
      <AnimatedNode index={0}>
        <p className="text-muted-foreground text-sm font-mono mb-6">
          EyeChain uses an <strong className="text-foreground">FMEA-based RPN (Risk Priority Number)</strong> model.
          A high score in ANY single category exponentially increases total risk.
          <br />EyeChain 采用 <strong className="text-foreground">FMEA 风险优先数 (RPN)</strong> 模型。任何单一类别的高分都会指数级增加总风险。
        </p>
      </AnimatedNode>

      <div className="space-y-2">
        {/* Causal Chain 1 */}
        <AnimatedNode index={1}>
          <div className="bg-muted rounded-lg p-3 border border-border">
            <p className="font-mono text-[10px] text-destructive tracking-widest mb-2">CAUSAL CHAIN 1: ACCELERATION → RETINAL DETACHMENT</p>
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-foreground">
              {["High G-Force\n高G力", "→", "Vitreous Stress\n玻璃体应力", "→", "Retinal Traction\n视网膜牵拉", "→", "Detachment\n脱离"].map((text, i) =>
                text === "→" ? (
                  <span key={i} className="text-destructive">→</span>
                ) : (
                  <motion.span key={i} custom={1 + i * 0.15} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className={`px-2 py-1 rounded border ${i === 6 ? "bg-destructive/20 border-destructive/30 text-destructive" : "bg-card border-border"} whitespace-pre-line`}>
                    {text}
                  </motion.span>
                )
              )}
            </div>
          </div>
        </AnimatedNode>

        <AnimatedArrow index={2} />

        {/* Causal Chain 2 */}
        <AnimatedNode index={3}>
          <div className="bg-muted rounded-lg p-3 border border-border">
            <p className="font-mono text-[10px] text-amber tracking-widest mb-2">CAUSAL CHAIN 2: POSTURE → GLAUCOMA / MYOPIA</p>
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-foreground">
              {["Screen Use\n屏幕使用", "→", "IOP Increase\n眼压升高", "→", "Ciliary Fatigue\n睫状肌疲劳", "→", "Myopia/Glaucoma\n近视/青光眼"].map((text, i) =>
                text === "→" ? (
                  <span key={i} className="text-amber">→</span>
                ) : (
                  <motion.span key={i} custom={3 + i * 0.15} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className={`px-2 py-1 rounded border ${i === 6 ? "bg-amber/20 border-amber/30 text-amber" : "bg-card border-border"} whitespace-pre-line`}>
                    {text}
                  </motion.span>
                )
              )}
            </div>
          </div>
        </AnimatedNode>

        <AnimatedArrow index={4} />

        {/* System Workflow */}
        <AnimatedNode index={5}>
          <div className="bg-muted rounded-lg p-3 border border-primary/30">
            <p className="font-mono text-[10px] text-primary tracking-widest mb-2">SYSTEM WORKFLOW 系统工作流</p>
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
              {[
                { text: "User Device\n用户设备", color: "" },
                { text: "→", arrow: true },
                { text: "Local Processing\n本地处理", color: "" },
                { text: "→", arrow: true },
                { text: "Blockchain Storage\n链上存储", color: "bg-primary/10 border-primary/30 text-primary" },
                { text: "→", arrow: true },
                { text: "DAO Calibration\nDAO 校准", color: "bg-neon-green/10 border-neon-green/30 text-neon-green" },
              ].map((item, i) =>
                item.arrow ? (
                  <span key={i} className="text-primary">→</span>
                ) : (
                  <motion.span key={i} custom={5 + i * 0.15} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className={`px-2 py-1 rounded border whitespace-pre-line ${item.color || "bg-card border-border text-foreground"}`}>
                    {item.text}
                  </motion.span>
                )
              )}
            </div>
          </div>
        </AnimatedNode>

        <AnimatedArrow index={6} />

        {/* FMEA RPN */}
        <AnimatedNode index={7}>
          <div>
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest mb-2">FMEA FACTORS (1-10 SCALE) · FMEA 因子</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Activity, label: "Severity\n严重度", desc: "Acceleration\n加速度", color: "text-destructive" },
                { icon: Brain, label: "Occurrence\n发生度", desc: "Duration\n持续时间", color: "text-amber" },
                { icon: Eye, label: "Detection\n检测难度", desc: "Posture\n姿态负荷", color: "text-primary" },
              ].map((item, i) => (
                <motion.div key={i} custom={7 + i * 0.3} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="bg-muted rounded-lg p-3 text-center border border-border">
                  <item.icon className={`w-5 h-5 ${item.color} mx-auto mb-1`} />
                  <p className="font-mono text-[10px] text-foreground whitespace-pre-line font-bold">{item.label}</p>
                  <p className="font-mono text-[10px] text-muted-foreground whitespace-pre-line mt-1">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedNode>

        <AnimatedNode index={8}>
          <div className="flex items-center justify-center gap-2 py-2">
            <span className="font-mono text-xs text-destructive bg-destructive/10 px-2 py-1 rounded">S</span>
            <span className="font-heading text-lg text-muted-foreground">×</span>
            <span className="font-mono text-xs text-amber bg-amber/10 px-2 py-1 rounded">O</span>
            <span className="font-heading text-lg text-muted-foreground">×</span>
            <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded">D</span>
            <span className="font-heading text-lg text-muted-foreground">×</span>
            <span className="font-mono text-xs text-foreground bg-muted px-2 py-1 rounded">Symptom</span>
            <span className="font-heading text-lg text-muted-foreground">=</span>
            <span className="font-mono text-xs text-foreground bg-muted px-2 py-1 rounded font-bold">RPN</span>
          </div>
        </AnimatedNode>

        <AnimatedArrow index={9} />

        {/* Output */}
        <AnimatedNode index={10}>
          <div>
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest mb-2">OUTPUT CLASSIFICATION 输出分类</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-neon-green/10 border border-neon-green/30 rounded-lg p-3 text-center">
                <p className="font-heading text-lg font-bold text-neon-green">0–39</p>
                <p className="font-mono text-[10px] text-neon-green">NORMAL 正常</p>
              </div>
              <div className="bg-amber/10 border border-amber/30 rounded-lg p-3 text-center">
                <p className="font-heading text-lg font-bold text-amber">40–69</p>
                <p className="font-mono text-[10px] text-amber">WARNING 警告</p>
              </div>
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-center">
                <p className="font-heading text-lg font-bold text-destructive">70–100</p>
                <p className="font-mono text-[10px] text-destructive">CRITICAL 危急</p>
              </div>
            </div>
          </div>
        </AnimatedNode>

        <AnimatedNode index={11}>
          <div className="mt-2 p-3 bg-destructive/5 border border-destructive/20 rounded">
            <p className="font-mono text-[10px] text-destructive">
              ⚠ MULTIPLICATION EFFECT: A single factor at 10 with others at 5 → RPN = 250.
              But TWO factors at 10 → RPN = 500. This is the exponential escalation principle.
              <br />⚠ 乘法效应：单一因子为10，其余为5 → RPN=250。两个因子为10 → RPN=500。
            </p>
          </div>
        </AnimatedNode>
      </div>
    </DashboardPanel>
  );
}
