import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const steps = [
  { title: "01 选微习惯：小到荒唐", desc: "1 个俯卧撑、50 字写作、2 页书，一次最多 2-3 个。", icon: "☑️" },
  { title: "02 挖内在价值：找到初心", desc: "问自己为什么想做，找到内在驱动力，而不是外部期待。", icon: "💗" },
  { title: "03 无压力执行：睡前完成即可", desc: "不固定时间，不追求完美，完成最小目标就够了。", icon: "🕰️" },
  { title: "04 打卡追踪：看见进步", desc: "记录每一次完成，让打卡链和成就感推动你继续前行。", icon: "🗓️" },
  { title: "05 微量开始：绝不调高目标", desc: "有余力再超额完成，不轻易提高门槛，才能持续坚持。", icon: "↗️" },
];

export default function Index() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState(0);
  const [activeBrain, setActiveBrain] = useState<"basal" | "prefrontal">("basal");
  const [activeStep, setActiveStep] = useState(0);
  const [bursting, setBursting] = useState(false);

  const next = () => setScreen((prev) => Math.min(prev + 1, 3));
  const jumpToCreate = () => {
    setBursting(true);
    setTimeout(() => navigate("/create"), 520);
  };

  return (
    <div className="space-y-10">
      <div className="intro-canvas relative">
        <AnimatePresence mode="wait">
        {screen === 0 && (
          <motion.section
            key="screen-1"
            initial={{ opacity: 0, x: -22, y: 1 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 16, y: -1 }}
            transition={{ duration: 0.8 }}
            className="screen-layer watercolor-wash pink-wash"
          >
            <span className="journal-sticker right-7 top-8">🌞</span>
            <div className="journal-tape bottom-6 w-[96%] max-w-none" />
            <div className="max-w-4xl mx-auto text-center space-y-5">
              <h1 className="font-hand text-[34px] md:text-[48px] text-[hsl(29_84%_31%)] watercolor-title">
                微习惯：简单到不可能失败的自我管理法则
              </h1>
              <p className="text-[18px] text-[hsl(217_19%_35%)]">用最小的行动，撬动长久的改变</p>
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={next}
                className="hand-note-card max-w-[520px] mx-auto text-left hover-sparkle transition-transform"
              >
                <h3 className="font-hand text-[24px] text-[hsl(29_84%_31%)] text-center">微习惯 = 小到荒唐的积极行为</h3>
                <div className="my-3 h-[2px] bg-[hsl(334_62%_86%)] rounded-full" />
                <p className="leading-8 text-[hsl(217_19%_35%)]">💪 把每天 100 个俯卧撑缩成每天 1 个。</p>
                <p className="leading-8 text-[hsl(217_19%_35%)]">✍️ 把每天写 3000 字缩成每天 50 字。</p>
                <p className="leading-8 text-[hsl(217_19%_35%)]">📖 把每天阅读 1 小时缩成每天 2 页书。</p>
                <p className="mt-4 font-hand text-[22px] text-[hsl(29_84%_31%)] text-center">
                  微小的行动，重复成习惯；习惯的力量，改变人生
                </p>
                <p className="text-right text-2xl mt-2">👉</p>
              </motion.button>
              <p className="text-sm text-muted-foreground">点击卡片进入下一屏</p>
            </div>
          </motion.section>
        )}

        {screen === 1 && (
          <motion.section
            key="screen-2"
            initial={{ opacity: 0, x: -20, y: 1 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 14, y: -1 }}
            transition={{ duration: 0.8 }}
            className="screen-layer watercolor-wash mint-wash"
          >
            <div className="max-w-5xl mx-auto">
              <h2 className="font-hand text-center text-[30px] md:text-[36px] text-[#10B981] watercolor-title">
                微习惯的脑科学：顺着大脑的规律做事
              </h2>
              <p className="text-center text-[18px] text-[hsl(217_19%_35%)] mt-3">大脑抗拒剧烈改变，却会接受微小进步</p>
              <div className="grid lg:grid-cols-2 gap-6 mt-6 items-center">
                <motion.div
                  className="brain-sketch animate-float"
                  initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 0.7, delay: 0.15 }}
                >
                  <button
                    type="button"
                    onMouseEnter={() => setActiveBrain("basal")}
                    onFocus={() => setActiveBrain("basal")}
                    className={`brain-tag left-5 top-8 ${activeBrain === "basal" ? "active" : ""}`}
                  >
                    基底神经节
                  </button>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveBrain("prefrontal")}
                    onFocus={() => setActiveBrain("prefrontal")}
                    className={`brain-tag right-5 bottom-8 ${activeBrain === "prefrontal" ? "active" : ""}`}
                  >
                    前额皮层
                  </button>
                  <span className="brain-signal one">⚡</span>
                  <span className="brain-signal two">⚡</span>
                  <span className="brain-signal three">⚡</span>
                </motion.div>
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.45, delay: 0.45 }}
                    className={`hand-note-card transition-all duration-300 ${
                      activeBrain === "basal" ? "watercolor-glow scale-[1.03] ring-2 ring-[hsl(44_88%_74%_/0.45)]" : ""
                    }`}
                  >
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.6 }}
                      className="font-hand text-[22px] text-[hsl(29_84%_31%)]"
                    >
                      基底神经节：模式探测器
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.35, delay: 0.75 }}
                      className="text-[hsl(217_19%_35%)] mt-2"
                    >
                      重复的微行为会形成牢固神经通路，让行为逐步变成无需思考的惯性。
                    </motion.p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.45, delay: 0.62 }}
                    className={`hand-note-card transition-all duration-300 ${
                      activeBrain === "prefrontal" ? "watercolor-glow scale-[1.03] ring-2 ring-[hsl(264_70%_77%_/0.45)]" : ""
                    }`}
                  >
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.78 }}
                      className="font-hand text-[22px] text-[hsl(29_84%_31%)]"
                    >
                      前额皮层：大脑管理者
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.35, delay: 0.92 }}
                      className="text-[hsl(217_19%_35%)] mt-2"
                    >
                      负责自控和决策但容易疲劳，微习惯消耗极少意志力，更容易长期坚持。
                    </motion.p>
                  </motion.div>
                </div>
              </div>
              <div className="paper-card max-w-3xl mx-auto mt-6 p-4 text-center bg-[hsl(48_93%_89%_/0.72)]">
                微习惯用“小步骤”骗过大脑，让它无法抗拒，最终慢慢拓宽舒适区 ⚡
              </div>
            </div>
            <button type="button" onClick={next} className="scribble-arrow">
              ➜
            </button>
          </motion.section>
        )}

        {screen === 2 && (
          <motion.section
            key="screen-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.8 }}
            className="screen-layer watercolor-wash blue-wash"
          >
            <div className="max-w-5xl mx-auto">
              <h2 className="font-hand text-center text-[30px] md:text-[36px] text-[#F97316] watercolor-title">
                微习惯养成法：跟着做，轻松坚持
              </h2>
              <p className="text-center text-[18px] text-[hsl(217_19%_35%)] mt-3">提取核心方法，5 步落地，人人能会</p>
              <div className="paper-card mt-6 p-5 md:p-7 bg-[hsl(30_98%_97%_/0.86)]">
                <div className="space-y-3">
                  {steps.map((item, idx) => (
                    <motion.button
                      key={item.title}
                      type="button"
                      onClick={() => setActiveStep(idx)}
                      whileHover={{ scale: 1.03 }}
                      className={`w-full text-left rounded-2xl border px-4 py-3 transition ${
                        activeStep === idx
                          ? "bg-[hsl(28_96%_89%_/0.55)] border-[hsl(28_80%_72%)]"
                          : "bg-[hsl(40_35%_98%_/0.85)] border-[hsl(var(--border)_/_0.88)]"
                      }`}
                    >
                      <p className="font-hand text-[22px] text-[hsl(29_84%_31%)]">
                        {item.icon} {item.title}
                      </p>
                      <p className="text-[hsl(217_19%_35%)]">{item.desc}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
              <div className="paper-card max-w-4xl mx-auto mt-6 p-4 text-center bg-[hsl(31_93%_88%_/0.72)]">
                <p className="font-hand text-[22px] text-[hsl(29_84%_31%)]">
                  满意每一个进步，绝不要小看微步骤，用多余精力超额完成，而非制定更大目标
                </p>
              </div>
            </div>
            <button type="button" onClick={next} className="scribble-arrow down">
              ↘
            </button>
          </motion.section>
        )}

        {screen === 3 && (
          <motion.section
            key="screen-4"
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="screen-layer watercolor-wash pink-wash"
          >
            <span className="journal-sticker left-6 top-8">🌞</span>
            <span className="journal-sticker right-7 top-9">💗</span>
            <span className="journal-sticker left-8 bottom-10">加油</span>
            <span className="journal-sticker right-8 bottom-10">🌸</span>
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h2 className="font-hand text-[34px] md:text-[48px] text-[#EF4444] star-shimmer">
                从此刻开始，用微习惯改变生活
              </h2>
              <p className="text-[20px] text-[hsl(217_19%_35%)]">每一个伟大的成就，都始于那一小步</p>
              <p className="text-[18px] italic leading-8 text-[hsl(217_19%_35%)]">
                不用追求完美，只要开始就好；不用害怕失败，因为目标小到不可能失败 💗
              </p>
              <div className="relative inline-block">
                <motion.button
                  type="button"
                  onClick={jumpToCreate}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.98 }}
                  className="journal-cta breathing"
                >
                  ➜ 开启我的微习惯
                </motion.button>
                <AnimatePresence>
                  {bursting && (
                    <motion.div
                      initial={{ opacity: 0.85, scale: 0.32 }}
                      animate={{ opacity: 0, scale: 2.3 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 rounded-full pointer-events-none bg-[radial-gradient(circle,hsl(334_92%_86%_/0.6),hsl(155_78%_88%_/0.5),transparent_72%)]"
                    />
                  )}
                </AnimatePresence>
              </div>
              <div className="paper-card p-4 max-w-2xl mx-auto bg-[hsl(48_93%_89%_/0.74)]">
                在 Pacta，我们陪你记录每一次微小的成功，让习惯自然生长 🌱
              </div>
              <p className="stamp-watermark">未来可期</p>
            </div>
          </motion.section>
        )}
        </AnimatePresence>

        <div className="intro-dots">
          {[0, 1, 2, 3].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setScreen(i)}
              className={`dot ${screen === i ? "active" : ""}`}
              aria-label={`切换到第 ${i + 1} 屏`}
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-3xl mx-auto">
        <h2 className="text-3xl font-hand font-bold text-foreground text-center mb-6">如何运作</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: "01", title: "选择习惯", desc: "从 6 大分类中选择你的微习惯", emoji: "📋" },
            { step: "02", title: "质押 AVAX", desc: "用 MetaMask 质押代币创建链上契约", emoji: "⛓️" },
            { step: "03", title: "每日打卡", desc: "完成打卡获得奖励，链上见证你的蜕变", emoji: "✅" },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: i * 0.07 }}
              className="paper-card p-6 text-center"
            >
              <span className="text-3xl block mb-2">{item.emoji}</span>
              <span className="text-primary font-hand text-2xl font-bold">{item.step}</span>
              <h3 className="font-hand text-xl font-semibold text-foreground mt-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
