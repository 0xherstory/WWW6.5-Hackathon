import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"loading" | "reveal" | "done">("loading");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Ambient tone using Web Audio API
    try {
      const ctx = new AudioContext();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.type = "sine";
      osc1.frequency.value = 174; // Solfeggio healing freq
      osc2.type = "sine";
      osc2.frequency.value = 261;

      filter.type = "lowpass";
      filter.frequency.value = 400;

      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 1.5);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      // Fade out after 4s
      setTimeout(() => {
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
        setTimeout(() => {
          osc1.stop();
          osc2.stop();
          ctx.close();
        }, 1600);
      }, 3500);
    } catch (e) {
      // Audio not supported, continue silently
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Ease-out progress: fast start, slow end
        const remaining = 100 - p;
        const step = Math.max(0.5, remaining * 0.06);
        return Math.min(100, p + step);
      });
    }, 50);

    // Force complete after 4.5s
    const timeout = setTimeout(() => {
      setProgress(100);
    }, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (progress >= 100 && phase === "loading") {
      setPhase("reveal");
      setTimeout(() => {
        setPhase("done");
        onComplete();
      }, 800);
    }
  }, [progress, phase, onComplete]);

  // Planet SVG ring path
  const ringRadius = 120;
  const RING_TEXT = "SolarPact · 光合契约 · Growth · Invest · Proof · On-chain · ";

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: "hsl(230 25% 5%)" }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Background particles */}
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 2 + 1,
                height: Math.random() * 2 + 1,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `hsl(var(--primary) / ${Math.random() * 0.3 + 0.1})`,
              }}
              animate={{
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}

          {/* Central planet system */}
          <motion.div
            className="relative w-[300px] h-[300px] flex items-center justify-center mb-12"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Outer glow */}
            <div
              className="absolute w-[250px] h-[250px] rounded-full blur-[60px] opacity-20"
              style={{
                background: "radial-gradient(circle, hsl(var(--primary)), hsl(var(--accent)) 60%, transparent 80%)",
              }}
            />

            {/* Planet core */}
            <motion.div
              className="absolute w-[100px] h-[100px] rounded-full z-10"
              style={{
                background: `conic-gradient(
                  from 0deg,
                  hsl(var(--primary)) 0%,
                  hsl(var(--secondary)) 25%,
                  hsl(var(--accent)) 50%,
                  hsl(var(--primary)) 75%,
                  hsl(var(--primary)) 100%
                )`,
                boxShadow: `0 0 40px hsl(var(--primary) / 0.3), 0 0 80px hsl(var(--accent) / 0.15)`,
              }}
              animate={{
                scale: [1, 1.06, 1],
                rotate: [0, 360],
              }}
              transition={{
                scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 30, repeat: Infinity, ease: "linear" },
              }}
            >
              {/* Inner sphere illusion */}
              <div
                className="absolute inset-[3px] rounded-full"
                style={{
                  background: `radial-gradient(circle at 35% 30%, 
                    hsl(var(--primary) / 0.4), 
                    hsl(230 25% 10%) 50%, 
                    hsl(230 25% 7%) 100%)`,
                }}
              />
              {/* Highlight */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(circle at 30% 25%, hsl(0 0% 100% / 0.15), transparent 45%)",
                }}
              />
            </motion.div>

            {/* Rotating text ring */}
            <svg
              className="absolute w-full h-full animate-energy-ring"
              viewBox="0 0 300 300"
              style={{ animationDuration: "25s" }}
            >
              <defs>
                <path
                  id="splashTextCircle"
                  d={`M 150,150 m -${ringRadius},0 a ${ringRadius},${ringRadius} 0 1,1 ${ringRadius * 2},0 a ${ringRadius},${ringRadius} 0 1,1 -${ringRadius * 2},0`}
                  fill="none"
                />
              </defs>
              <text
                fill="hsl(40 20% 70%)"
                fontSize="9.5"
                fontFamily="'Space Grotesk', sans-serif"
                letterSpacing="3"
                opacity="0.35"
              >
                <textPath href="#splashTextCircle" startOffset="0%">
                  {RING_TEXT + RING_TEXT}
                </textPath>
              </text>
            </svg>

            {/* Orbit ring */}
            <motion.div
              className="absolute w-[260px] h-[260px] rounded-full border border-border/20"
              style={{ transform: "rotateX(65deg)" }}
              animate={{ rotateZ: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            >
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary"
                style={{ boxShadow: "0 0 10px hsl(var(--primary) / 0.6)" }}
              />
            </motion.div>
          </motion.div>

          {/* Brand text */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground mb-2">
              <span className="text-gradient-primary">光合契约</span>
            </h1>
            <p className="text-muted-foreground/60 text-xs font-display tracking-[0.3em] uppercase">
              SolarPact Protocol
            </p>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            className="w-[240px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="relative h-[2px] bg-border/30 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))`,
                  boxShadow: `0 0 12px hsl(var(--primary) / 0.4)`,
                }}
              />
            </div>
            <div className="flex justify-between mt-3">
              <span className="text-muted-foreground/40 text-[10px] font-mono">
                {progress < 30 ? "初始化协议..." : progress < 70 ? "连接链上数据..." : "准备就绪"}
              </span>
              <span className="text-muted-foreground/40 text-[10px] font-mono">
                {Math.round(progress)}%
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
