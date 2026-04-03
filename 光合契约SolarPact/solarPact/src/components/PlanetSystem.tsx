import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

const RING_TEXT = "SolarPact · 光合契约 · Growth · Invest · Proof · On-chain · SolarPact · 光合契约 · Growth · Invest · Proof · On-chain · ";

const PlanetSystem = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 40, damping: 20 });
  const rotateX = useTransform(smoothY, [-300, 300], [6, -6]);
  const rotateY = useTransform(smoothX, [-300, 300], [-6, 6]);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      mouseX.set(e.clientX - cx);
      mouseY.set(e.clientY - cy);
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [mouseX, mouseY]);

  const ringRadius = 170;

  return (
    <motion.div
      ref={containerRef}
      className="relative w-[420px] h-[420px] flex items-center justify-center"
      style={{ rotateX, rotateY, perspective: 900 }}
    >
      {/* Deep ambient glow */}
      <div
        className="absolute w-[320px] h-[320px] rounded-full blur-[100px] opacity-[0.12]"
        style={{
          background: `radial-gradient(circle, hsl(var(--primary) / 0.6), hsl(var(--accent) / 0.3) 50%, transparent 80%)`,
        }}
      />

      {/* Planet — warm golden sphere */}
      <motion.div
        className="absolute w-[150px] h-[150px] rounded-full z-10"
        style={{
          background: `conic-gradient(
            from 200deg,
            hsl(var(--primary)) 0%,
            hsl(32 80% 40%) 20%,
            hsl(var(--secondary) / 0.6) 40%,
            hsl(var(--accent) / 0.4) 60%,
            hsl(var(--primary)) 80%,
            hsl(var(--primary)) 100%
          )`,
          boxShadow: `
            0 0 50px hsl(var(--primary) / 0.25),
            0 0 100px hsl(var(--primary) / 0.1),
            inset -25px -15px 50px hsl(230 25% 5% / 0.7)
          `,
        }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Inner sphere depth */}
        <div
          className="absolute inset-[2px] rounded-full"
          style={{
            background: `radial-gradient(circle at 38% 32%,
              hsl(var(--primary) / 0.3),
              hsl(230 25% 12%) 55%,
              hsl(230 25% 7%) 100%)`,
          }}
        />
        {/* Surface highlight */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle at 32% 28%, hsl(0 0% 100% / 0.18), transparent 42%)",
          }}
        />
        {/* Atmosphere rim */}
        <div
          className="absolute inset-[-3px] rounded-full"
          style={{
            background: "transparent",
            boxShadow: `inset 0 0 20px hsl(var(--primary) / 0.15), 0 0 20px hsl(var(--primary) / 0.08)`,
          }}
        />
      </motion.div>

      {/* Rotating text ring — tilted for 3D */}
      <div
        className="absolute w-full h-full"
        style={{ transform: "rotateX(14deg) rotateZ(-5deg)" }}
      >
        <svg
          className="w-full h-full animate-energy-ring"
          viewBox="0 0 420 420"
          style={{ animationDuration: "45s" }}
        >
          <defs>
            <path
              id="textCircle"
              d={`M 210,210 m -${ringRadius},0 a ${ringRadius},${ringRadius} 0 1,1 ${ringRadius * 2},0 a ${ringRadius},${ringRadius} 0 1,1 -${ringRadius * 2},0`}
              fill="none"
            />
          </defs>
          <text
            fill="hsl(40 20% 65%)"
            fontSize="10.5"
            fontFamily="'Space Grotesk', sans-serif"
            letterSpacing="3.2"
            opacity="0.4"
          >
            <textPath href="#textCircle" startOffset="0%">
              {RING_TEXT}
            </textPath>
          </text>
        </svg>
      </div>

      {/* Thin orbit ring */}
      <div
        className="absolute w-[340px] h-[340px] rounded-full border border-border/10"
        style={{ transform: "rotateX(14deg) rotateZ(-5deg)" }}
      />

      {/* Second orbit ring — perpendicular feel */}
      <motion.div
        className="absolute w-[280px] h-[280px] rounded-full border border-primary/8"
        style={{ transform: "rotateX(70deg) rotateZ(20deg)" }}
        animate={{ rotateZ: [20, 380] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />

      {/* Orbiting dot */}
      <motion.div
        className="absolute w-[340px] h-[340px]"
        style={{ transform: "rotateX(14deg) rotateZ(-5deg)" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary"
          style={{ boxShadow: "0 0 12px hsl(var(--primary) / 0.5)" }}
        />
      </motion.div>

      {/* Small satellite dot on second orbit */}
      <motion.div
        className="absolute w-[280px] h-[280px]"
        style={{ transform: "rotateX(70deg) rotateZ(20deg)" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-secondary"
          style={{ boxShadow: "0 0 8px hsl(var(--secondary) / 0.5)" }}
        />
      </motion.div>

      {/* Floating data fragments around planet */}
      {[
        { x: -180, y: -60, text: "SBT", delay: 0 },
        { x: 160, y: -80, text: "NFT", delay: 1.5 },
        { x: 170, y: 70, text: "DAO", delay: 3 },
      ].map((tag, i) => (
        <motion.div
          key={tag.text}
          className="absolute text-[9px] font-mono text-muted-foreground/30 tracking-widest"
          style={{ left: `calc(50% + ${tag.x}px)`, top: `calc(50% + ${tag.y}px)` }}
          animate={{ opacity: [0.15, 0.4, 0.15], y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: tag.delay, ease: "easeInOut" }}
        >
          {tag.text}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default PlanetSystem;
