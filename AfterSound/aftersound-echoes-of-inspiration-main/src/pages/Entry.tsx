import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

/* ─── CSS keyframes injected once ─── */
const styleId = "entry-animations";
if (typeof document !== "undefined" && !document.getElementById(styleId)) {
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    @keyframes title-emerge {
      0% { opacity: 0; filter: blur(20px); transform: scale(0.15); }
      30% { opacity: 0.4; filter: blur(10px); transform: scale(0.5); }
      60% { opacity: 0.8; filter: blur(3px); transform: scale(0.85); }
      100% { opacity: 1; filter: blur(0px); transform: scale(1); }
    }
    @keyframes title-breathe {
      0%, 100% {
        text-shadow: 0 0 40px rgba(160,140,255,0.2), 0 0 100px rgba(120,100,255,0.1), 0 0 160px rgba(100,80,255,0.05);
        filter: brightness(1);
      }
      50% {
        text-shadow: 0 0 60px rgba(160,140,255,0.35), 0 0 120px rgba(120,100,255,0.2), 0 0 200px rgba(100,80,255,0.1);
        filter: brightness(1.05);
      }
    }
    @keyframes title-mask-drift {
      0% { -webkit-mask-position: 0% 50%; mask-position: 0% 50%; }
      50% { -webkit-mask-position: 100% 50%; mask-position: 100% 50%; }
      100% { -webkit-mask-position: 0% 50%; mask-position: 0% 50%; }
    }
    @keyframes subtitle-glide {
      0% { opacity: 0; letter-spacing: 0.8em; filter: blur(4px); }
      100% { opacity: 0.65; letter-spacing: 0.45em; filter: blur(0); }
    }
    @keyframes slogan-rise {
      0% { opacity: 0; transform: translateY(24px); filter: blur(3px); }
      100% { opacity: 1; transform: translateY(0); filter: blur(0); }
    }
    @keyframes line-grow {
      0% { transform: scaleX(0); opacity: 0; }
      100% { transform: scaleX(1); opacity: 0.5; }
    }
    @keyframes cta-appear {
      0% { opacity: 0; transform: translateY(12px) scale(0.96); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes ripple-expand {
      0% { transform: translate(-50%,-50%) scale(0); opacity: 0.4; }
      100% { transform: translate(-50%,-50%) scale(3); opacity: 0; }
    }
    @keyframes float-slow {
      0%, 100% { transform: translate(-50%,-50%) translateY(0); }
      50% { transform: translate(-50%,-50%) translateY(-8px); }
    }
    @keyframes breathing-glow {
      0%, 100% { opacity: 0.7; box-shadow: 0 0 30px hsla(270,60%,60%,0.15); }
      50% { opacity: 1; box-shadow: 0 0 50px hsla(270,60%,60%,0.3), 0 0 80px hsla(260,50%,50%,0.15); }
    }
    @keyframes nodes-reveal {
      0% { opacity: 0; transform: scale(0.92); }
      100% { opacity: 1; transform: scale(1); }
    }
    @keyframes pg-video-breathe {
      0%, 100% { opacity: 0.22; }
      50% { opacity: 0.38; }
    }
    @keyframes orbit-dot {
      0% { transform: rotate(0deg) translateX(var(--orbit-r)) rotate(0deg); }
      100% { transform: rotate(360deg) translateX(var(--orbit-r)) rotate(-360deg); }
    }
  `;
  document.head.appendChild(style);
}

/* ─── Types ─── */
interface PlaygroundNode {
  id: string; labelCn: string; labelEn: string; hintCn: string; hintEn: string;
  type: "internal" | "external"; target: string;
  x: number; y: number; size: number; hue: number; layer: "center" | "mid" | "outer";
}

/* ─── Node data — radial layout ─── */
const nodes: PlaygroundNode[] = [
  { id: "capture", labelCn: "捕捉", labelEn: "Capture", hintCn: "从这里开始", hintEn: "Start here", type: "internal", target: "/create", x: 0.5, y: 0.48, size: 72, hue: 270, layer: "center" },
  { id: "create", labelCn: "创作", labelEn: "Create", hintCn: "灵感编织成音乐", hintEn: "Weave into music", type: "internal", target: "/playground", x: 0.32, y: 0.38, size: 48, hue: 260, layer: "mid" },
  { id: "archive", labelCn: "存档", labelEn: "Archive", hintCn: "保护每一段声音", hintEn: "Protect every sound", type: "internal", target: "/vault", x: 0.68, y: 0.38, size: 46, hue: 280, layer: "mid" },
  { id: "theory", labelCn: "乐理", labelEn: "Theory", hintCn: "学习音乐基础", hintEn: "Learn fundamentals", type: "internal", target: "/theory", x: 0.5, y: 0.68, size: 40, hue: 250, layer: "mid" },
  { id: "play", labelCn: "玩声音", labelEn: "Play Sound", hintCn: "触碰声音", hintEn: "Touch sound", type: "external", target: "https://patatap.com/", x: 0.18, y: 0.55, size: 30, hue: 210, layer: "outer" },
  { id: "learn", labelCn: "学声音", labelEn: "Learn Sound", hintCn: "理解音乐", hintEn: "Understand music", type: "external", target: "https://learningmusic.ableton.com/", x: 0.82, y: 0.55, size: 30, hue: 200, layer: "outer" },
  { id: "write", labelCn: "写声音", labelEn: "Write Sound", hintCn: "打字作曲", hintEn: "Type to compose", type: "external", target: "https://typatone.com/", x: 0.22, y: 0.72, size: 26, hue: 190, layer: "outer" },
  { id: "perform", labelCn: "演声音", labelEn: "Perform", hintCn: "钢琴的灵魂", hintEn: "Soul of piano", type: "external", target: "https://touchpianist.com/", x: 0.78, y: 0.72, size: 26, hue: 220, layer: "outer" },
];

const connections: [string, string][] = [
  ["capture", "create"], ["capture", "archive"], ["capture", "theory"],
  ["create", "archive"], ["play", "capture"], ["learn", "capture"],
  ["write", "create"], ["perform", "archive"],
];

/* ─── FloatingNode ─── */
function FloatingNode({ node, hovered, onHover, onLeave, onClick, t }: {
  node: PlaygroundNode; hovered: boolean; onHover: () => void; onLeave: () => void; onClick: () => void; t: (cn: string, en: string) => string;
}) {
  const isCenter = node.layer === "center";
  const baseOp = isCenter ? 0.9 : node.type === "internal" ? 0.7 : 0.4;

  return (
    <div className="absolute flex flex-col items-center cursor-pointer" style={{
      left: `${node.x * 100}%`, top: `${node.y * 100}%`, transform: "translate(-50%,-50%)",
      zIndex: hovered ? 20 : isCenter ? 15 : 10,
      animation: `float-slow ${7 + Math.random() * 4}s ease-in-out infinite`,
      animationDelay: `${Math.random() * -5}s`,
    }} onMouseEnter={onHover} onMouseLeave={onLeave} onClick={onClick}>
      {/* Glow */}
      <div className="absolute rounded-full transition-all duration-700" style={{
        width: node.size * (isCenter ? 3.5 : 2.5), height: node.size * (isCenter ? 3.5 : 2.5),
        background: `radial-gradient(circle, hsla(${node.hue},60%,60%,${hovered ? 0.18 : isCenter ? 0.08 : 0.03}) 0%, transparent 70%)`,
      }} />
      {/* Core */}
      <div className="rounded-full flex items-center justify-center transition-all duration-500" style={{
        width: node.size, height: node.size,
        background: `radial-gradient(circle at 40% 40%, hsla(${node.hue},50%,65%,${hovered ? 0.45 : isCenter ? 0.3 : 0.12}), hsla(${node.hue},40%,40%,${hovered ? 0.3 : isCenter ? 0.18 : 0.06}))`,
        border: `1px solid hsla(${node.hue},50%,60%,${hovered ? 0.45 : isCenter ? 0.3 : 0.1})`,
        animation: isCenter ? "breathing-glow 4s ease-in-out infinite" : undefined,
        boxShadow: hovered ? `0 0 50px hsla(${node.hue},60%,60%,0.3)` : isCenter ? undefined : `0 0 15px hsla(${node.hue},50%,50%,0.05)`,
        transform: hovered ? "scale(1.1)" : "scale(1)",
      }}>
        <span className="text-[10px] tracking-wider transition-opacity duration-500" style={{ opacity: hovered ? 0.9 : baseOp, color: `hsl(${node.hue},40%,80%)` }}>
          {node.type === "internal" ? "●" : "◌"}
        </span>
      </div>
      {/* Labels */}
      <div className="mt-2.5 text-center transition-all duration-500" style={{ opacity: hovered ? 1 : baseOp * 0.8 }}>
        <p className="text-xs text-serif-cn" style={{ color: `hsl(${node.hue},30%,75%)` }}>{node.labelCn}</p>
        <p className="text-[9px] tracking-[0.15em] uppercase" style={{ color: `hsl(${node.hue},20%,55%)` }}>{node.labelEn}</p>
      </div>
      {isCenter && !hovered && (
        <div className="absolute top-full mt-8 text-center whitespace-nowrap">
          <p className="text-[10px] tracking-[0.2em] text-muted-foreground/30 animate-pulse">Start here · 从这里开始</p>
        </div>
      )}
      {hovered && (
        <div className="absolute top-full mt-8 text-center animate-fade-in whitespace-nowrap">
          <p className="text-[11px] text-serif-cn text-foreground/40">{t(node.hintCn, node.hintEn)}</p>
        </div>
      )}
    </div>
  );
}

/* ─── Constellation ─── */
function ConstellationLines({ hoveredId, containerRef }: { hoveredId: string | null; containerRef: React.RefObject<HTMLDivElement> }) {
  const [dims, setDims] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const update = () => { if (containerRef.current) setDims({ w: containerRef.current.offsetWidth, h: containerRef.current.offsetHeight }); };
    update(); window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [containerRef]);
  if (!dims.w) return null;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
      {connections.map(([a, b]) => {
        const na = nodes.find((n) => n.id === a)!;
        const nb = nodes.find((n) => n.id === b)!;
        const hl = hoveredId === a || hoveredId === b;
        return <line key={`${a}-${b}`} x1={na.x * dims.w} y1={na.y * dims.h} x2={nb.x * dims.w} y2={nb.y * dims.h}
          stroke={`hsla(260,30%,50%,${hl ? 0.2 : 0.04})`} strokeWidth={hl ? 1.2 : 0.5} className="transition-all duration-700" />;
      })}
    </svg>
  );
}

/* ═══ MAIN ENTRY PAGE ═══ */
export default function Entry() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const playgroundRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState(0); // 0=black, 1=hero, 2=playground
  const [heroVideoOp, setHeroVideoOp] = useState(0);
  const [titleVisible, setTitleVisible] = useState(false);
  const [sloganVisible, setSloganVisible] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [transitionText, setTransitionText] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);

  // Playground
  const [pgVideoOp, setPgVideoOp] = useState(0);
  const [nodesVisible, setNodesVisible] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);

  // Phase 0 → 1
  useEffect(() => {
    const t0 = setTimeout(() => setPhase(1), 200);
    return () => clearTimeout(t0);
  }, []);

  // Phase 1: Hero — video starts fully visible then dims
  useEffect(() => {
    if (phase !== 1) return;
    const v = video1Ref.current;
    const t0 = setTimeout(() => setHeroVideoOp(0.85), 100);
    const t1 = setTimeout(() => setHeroVideoOp(0.35), 2500);
    // Audio
    const t2 = setTimeout(() => {
      if (v) { v.muted = false; v.volume = 0; let vol = 0;
        const f = setInterval(() => { vol = Math.min(vol + 0.0075, 0.15); if (v) v.volume = vol; if (vol >= 0.15) clearInterval(f); }, 100);
      }
    }, 1500);
    const t3 = setTimeout(() => setTitleVisible(true), 2200);
    const t4 = setTimeout(() => setSloganVisible(true), 4000);
    const t5 = setTimeout(() => setCtaVisible(true), 5200);
    return () => { [t0, t1, t2, t3, t4, t5].forEach(clearTimeout); };
  }, [phase]);

  // Phase 2: Playground — video2 full → dim → nodes
  useEffect(() => {
    if (phase !== 2) return;
    const v = video2Ref.current;
    if (v) { v.currentTime = 15; v.muted = false; v.volume = 0; v.play().catch(() => {});
      let vol = 0; const f = setInterval(() => { vol = Math.min(vol + 0.008, 0.15); if (v) v.volume = vol; if (vol >= 0.15) clearInterval(f); }, 100);
    }
    const t0 = setTimeout(() => setPgVideoOp(0.8), 100);
    const t1 = setTimeout(() => setPgVideoOp(0.22), 2500);
    const t2 = setTimeout(() => setNodesVisible(true), 2800);
    return () => { [t0, t1, t2].forEach(clearTimeout); };
  }, [phase]);

  // CTA click
  const enterPlayground = useCallback((e: React.MouseEvent) => {
    setRipple({ x: e.clientX, y: e.clientY });
    const v = video1Ref.current;
    if (v) { let vol = v.volume; const r = setInterval(() => { vol = Math.min(vol + 0.015, 0.3); if (v) v.volume = vol; if (vol >= 0.3) clearInterval(r); }, 50); }
    setTimeout(() => setTransitionText(true), 300);
    setTransitioning(true);
    setTimeout(() => {
      if (v) { let vol = v.volume; const fo = setInterval(() => { vol = Math.max(vol - 0.02, 0); if (v) v.volume = vol; if (vol <= 0) { clearInterval(fo); v.muted = true; } }, 50); }
      setPhase(2); setTransitioning(false); setRipple(null); setTransitionText(false);
    }, 1500);
  }, []);

  const handleNodeClick = (node: PlaygroundNode) => {
    if (node.type === "external") { window.open(node.target, "_blank", "noopener,noreferrer"); }
    else { setNavigatingTo(node.id); setTimeout(() => navigate(node.target), 800); }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background overflow-hidden">
      {/* VIDEO 1 (vinyl) */}
      <video ref={video1Ref} src="/videos/video1.mp4" autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: phase === 1 && !transitioning ? heroVideoOp : transitioning ? heroVideoOp * 0.5 : 0,
          filter: "brightness(0.55) saturate(0.7)", transition: "opacity 1.8s ease-in-out",
        }}
      />

      {/* VIDEO 2 (notes+planets) — ONLY phase 2 */}
      <video ref={video2Ref} src="/videos/video2.mp4" muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: phase === 2 ? pgVideoOp : 0,
          filter: pgVideoOp > 0.5 ? "brightness(0.6) saturate(0.8)" : "brightness(0.35) saturate(0.6) blur(1px)",
          transition: "opacity 1.5s ease-in-out, filter 1.5s ease-in-out",
          animation: nodesVisible ? "pg-video-breathe 8s ease-in-out infinite" : "none",
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-background/25 pointer-events-none" />

      {/* Grain */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "256px 256px" }}
      />

      {/* Ripple */}
      {ripple && <div className="absolute rounded-full pointer-events-none z-50" style={{ left: ripple.x, top: ripple.y, width: 300, height: 300, border: "1px solid hsla(270,60%,70%,0.3)", animation: "ripple-expand 1.5s ease-out forwards" }} />}

      {/* Transition text */}
      {transitionText && (
        <div className="absolute inset-0 z-[55] flex items-center justify-center pointer-events-none">
          <div className="text-center animate-fade-in">
            <p className="text-sm text-serif-cn text-foreground/30 tracking-[0.3em]">正在进入余音…</p>
            <p className="text-xs text-muted-foreground/20 tracking-[0.2em] mt-1">Entering resonance…</p>
          </div>
        </div>
      )}

      {/* ═══ PHASE 1: CINEMATIC HERO ═══ */}
      {phase <= 1 && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center px-6" style={{ marginTop: "-6vh" }}>
            {/* Title: 余音 */}
            <h1 className="leading-none relative mb-4">
              {/* Orbiting dots around title */}
              {titleVisible && [0, 1, 2].map((i) => (
                <div key={i} className="absolute left-1/2 top-1/2 rounded-full pointer-events-none" style={{
                  width: 3, height: 3,
                  background: `hsla(${260 + i * 25}, 60%, 70%, ${0.3 - i * 0.08})`,
                  // @ts-ignore
                  "--orbit-r": `${90 + i * 40}px`,
                  animation: `orbit-dot ${12 + i * 5}s linear infinite`,
                  animationDelay: `${i * -4}s`,
                }} />
              ))}

              <span className="text-8xl sm:text-9xl md:text-[12rem] font-display text-serif-cn tracking-[-0.02em] inline-block"
                style={{
                  color: "rgba(255,255,255,0.92)",
                  WebkitMaskImage: "linear-gradient(135deg, rgba(0,0,0,1) 20%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,1) 80%)",
                  maskImage: "linear-gradient(135deg, rgba(0,0,0,1) 20%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,1) 80%)",
                  WebkitMaskSize: "200% 200%", maskSize: "200% 200%",
                  animation: titleVisible
                    ? "title-emerge 2.8s cubic-bezier(0.16,1,0.3,1) forwards, title-breathe 5s ease-in-out 2.8s infinite, title-mask-drift 14s ease-in-out 2.8s infinite"
                    : "none",
                  opacity: titleVisible ? undefined : 0,
                }}
              >
                余音
              </span>
            </h1>

            {/* Separator line */}
            <div className="mx-auto h-[1px] mb-5" style={{
              width: 100, transformOrigin: "center",
              background: "linear-gradient(90deg, transparent, hsla(270,60%,70%,0.3), transparent)",
              animation: titleVisible ? "line-grow 1.5s ease-out 1.5s forwards" : "none",
              opacity: titleVisible ? undefined : 0,
            }} />

            {/* AfterSound */}
            <p className="uppercase font-light mb-0" style={{
              fontSize: "0.8rem",
              animation: titleVisible ? "subtitle-glide 2.2s ease-out 1.2s forwards" : "none",
              opacity: 0,
            }}>
              <span style={{ color: "hsl(var(--foreground) / 0.6)" }}>After</span>
              <span style={{ color: "hsl(var(--glow-purple))", fontWeight: 500 }}>Sound</span>
            </p>

            {/* Slogans with staggered entrance */}
            <div className="mt-14 space-y-2.5">
              <p className="text-base sm:text-lg text-serif-cn text-foreground/30 tracking-[0.14em]" style={{
                animation: sloganVisible ? "slogan-rise 1.6s ease-out forwards" : "none",
                opacity: sloganVisible ? undefined : 0,
              }}>
                捕捉灵感消散前的余音
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground/20 tracking-[0.22em] uppercase font-light" style={{
                animation: sloganVisible ? "slogan-rise 1.6s ease-out 0.3s forwards" : "none",
                opacity: 0,
              }}>
                Capture the sound before it fades
              </p>
            </div>

            {/* CTA */}
            <div className="mt-16" style={{
              animation: ctaVisible ? "cta-appear 1.2s ease-out forwards" : "none",
              opacity: 0,
            }}>
              <button onClick={enterPlayground}
                className="relative rounded-full px-10 py-4 text-sm tracking-[0.18em] border transition-all duration-700 active:scale-[0.97] group"
                style={{ borderColor: "hsl(var(--foreground) / 0.08)", color: "hsl(var(--foreground) / 0.4)", backdropFilter: "blur(8px)", background: "hsl(var(--foreground) / 0.02)" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "hsl(var(--foreground) / 0.18)"; e.currentTarget.style.color = "hsl(var(--foreground) / 0.65)"; e.currentTarget.style.boxShadow = "0 0 50px hsla(260,50%,60%,0.12)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "hsl(var(--foreground) / 0.08)"; e.currentTarget.style.color = "hsl(var(--foreground) / 0.4)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <span className="text-serif-cn">{t("进入余音", "Enter AfterSound")}</span>
                <span className="inline-block ml-3 transition-transform duration-500 group-hover:translate-x-1.5 opacity-30 group-hover:opacity-50">→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PHASE 2: SOUND PLAYGROUND ═══ */}
      {phase === 2 && (
        <div ref={playgroundRef} className="absolute inset-0 z-20">
          {/* Title */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center z-30" style={{
            animation: nodesVisible ? "nodes-reveal 1s ease-out 0.2s forwards" : "none", opacity: nodesVisible ? undefined : 0,
          }}>
            <p className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground/20 mb-1">Sound Playground</p>
            <p className="text-sm text-serif-cn text-foreground/25">探索声音的宇宙</p>
          </div>

          {/* Constellation + Nodes */}
          <div className="absolute inset-0" style={{
            animation: nodesVisible ? "nodes-reveal 1.2s ease-out 0.4s forwards" : "none", opacity: nodesVisible ? undefined : 0,
          }}>
            <ConstellationLines hoveredId={hoveredNode} containerRef={playgroundRef} />
            {nodes.map((node) => (
              <FloatingNode key={node.id} node={node} hovered={hoveredNode === node.id}
                onHover={() => setHoveredNode(node.id)} onLeave={() => setHoveredNode(null)}
                onClick={() => handleNodeClick(node)} t={t} />
            ))}
          </div>

          {/* Legend */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-8 text-[10px] tracking-[0.2em] uppercase text-muted-foreground/15 z-30" style={{
            animation: nodesVisible ? "nodes-reveal 1s ease-out 0.6s forwards" : "none", opacity: nodesVisible ? undefined : 0,
          }}>
            <span>● {t("进入系统", "Enter System")}</span>
            <span>◌ {t("探索声音", "Explore Sound")}</span>
          </div>

          {/* Nav overlay on navigate */}
          {navigatingTo && <div className="absolute inset-0 z-50 bg-background/80 transition-opacity duration-500 animate-fade-in pointer-events-none" />}
        </div>
      )}

      {/* Phase transition overlay */}
      {transitioning && (
        <div className="absolute inset-0 z-40 pointer-events-none" style={{
          background: "radial-gradient(circle at center, hsl(var(--background) / 0.6), hsl(var(--background) / 0.95))",
          animation: "fade-in 0.8s ease-out",
        }} />
      )}
    </div>
  );
}
