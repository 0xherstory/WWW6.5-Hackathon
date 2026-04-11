import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight } from "lucide-react";

/* ─── Ambient Orb ─── */
function AmbientOrb() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      t += 0.002;

      // Single breathing orb
      const cx = w * 0.5;
      const cy = h * 0.44;
      const breathe = 1 + Math.sin(t * 1.2) * 0.08;
      const radius = Math.min(w, h) * 0.18 * breathe;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 2.5);
      grad.addColorStop(0, `hsla(270, 50%, 60%, ${0.06 + Math.sin(t) * 0.02})`);
      grad.addColorStop(0.4, `hsla(260, 40%, 50%, 0.03)`);
      grad.addColorStop(1, `hsla(260, 30%, 40%, 0)`);

      ctx.beginPath();
      ctx.arc(cx, cy, radius * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Very sparse, slow particles
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + t * 0.3;
        const dist = radius * (1.2 + Math.sin(i * 2.3 + t * 0.5) * 0.6);
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist;
        const fade = 0.04 + Math.sin(i + t * 0.8) * 0.03;
        const size = 1 + Math.sin(i * 1.7 + t) * 0.5;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${265 + i * 5}, 40%, 65%, ${fade})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

/* ─── Sound Memory Cards ─── */
const soundMemories = [
  {
    titleCn: "入睡前的旋律",
    titleEn: "A melody before sleep",
    descCn: "那段反复在脑海里回响的旋律，总在你快要入睡时出现",
    descEn: "The tune that loops in your mind right as you drift off",
    accent: "270 70% 65%",
    featured: false,
  },
  {
    titleCn: "被遗忘的副歌",
    titleEn: "A forgotten chorus",
    descCn: "你曾经哼过无数次，却再也想不起来的那段副歌",
    descEn: "A chorus you hummed a thousand times but can never recall",
    accent: "220 70% 60%",
    featured: true,
  },
  {
    titleCn: "地铁里的声音",
    titleEn: "A voice in the subway",
    descCn: "陌生人哼的歌，车门关上的瞬间就消失了",
    descEn: "A stranger's hum, gone the moment the doors close",
    accent: "330 60% 60%",
    featured: false,
  },
];

export default function Home() {
  const { t } = useLanguage();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col noise-bg">
      {/* ── Hero ── */}
      <section className="relative flex items-center justify-center min-h-[92vh] overflow-hidden">
        <AmbientOrb />

        <div
          className={`relative z-10 px-4 max-w-2xl mx-auto transition-all duration-[2.5s] ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ paddingLeft: "1.5rem" }}
        >
          {/* Title — offset slightly left */}
          <div className="mb-10">
            <span className="block text-6xl md:text-8xl lg:text-9xl font-display text-serif-cn gradient-text leading-none tracking-tight">
              余音
            </span>
            <span className="block text-lg md:text-xl font-display text-foreground/25 tracking-[0.3em] uppercase mt-3 font-light">
              AfterSound
            </span>
          </div>

          {/* Slogan — quiet, spaced */}
          <div className="mb-16 space-y-3 max-w-md">
            <p className="text-base md:text-lg text-serif-cn text-foreground/35 tracking-[0.15em] leading-relaxed">
              捕捉灵感消散前的余音
            </p>
            <p className="text-xs md:text-sm text-muted-foreground/20 font-light tracking-[0.25em] uppercase">
              Capture the sound before it fades
            </p>
          </div>

          {/* CTA — quiet, outline-style */}
          <Link to="/create">
            <button
              className="group relative rounded-full px-8 py-3.5 text-sm tracking-[0.15em] border border-foreground/10 text-foreground/50 hover:text-foreground/70 hover:border-foreground/20 transition-all duration-700 ease-out hover:shadow-[0_0_30px_hsla(270,40%,60%,0.08)] active:scale-[0.97]"
            >
              <span className="text-serif-cn">{t("开始捕捉余音", "Capture the Sound")}</span>
              <ArrowRight className="inline-block w-3.5 h-3.5 ml-3 transition-transform duration-500 group-hover:translate-x-1 opacity-40 group-hover:opacity-60" />
            </button>
          </Link>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </section>

      {/* ── Sound Memory Cards ── */}
      <section className="relative py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div
            className={`mb-16 pl-2 md:pl-8 transition-all duration-[1.4s] delay-300 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <p className="text-xs text-muted-foreground/20 tracking-[0.4em] uppercase mb-3">
              Sound Memories
            </p>
            <h2 className="text-xl md:text-2xl font-display text-serif-cn text-foreground/40">
              那些即将消散的声音
            </h2>
          </div>

          {/* Asymmetric grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 max-w-5xl mx-auto items-start">
            {soundMemories.map((card, i) => {
              const isHovered = hoveredCard === i;
              const isFeatured = card.featured;
              const colSpan = isFeatured ? "md:col-span-5" : i === 0 ? "md:col-span-4" : "md:col-span-3";
              const topOffset = isFeatured ? "" : i === 0 ? "md:mt-8" : "md:mt-14";

              return (
                <div
                  key={i}
                  className={`${colSpan} ${topOffset} transition-all duration-700 ease-out ${
                    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: `${600 + i * 250}ms` }}
                  onMouseEnter={() => setHoveredCard(i)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div
                    className={`relative rounded-2xl border transition-all duration-700 cursor-pointer overflow-hidden ${
                      isFeatured ? "p-8 md:p-10" : "p-6 md:p-8"
                    } ${
                      isHovered
                        ? "border-glass-border/40 translate-y-[-3px]"
                        : "border-glass-border/10"
                    }`}
                    style={{
                      background: isHovered
                        ? `linear-gradient(160deg, hsla(${card.accent} / 0.05), hsla(240, 15%, 6%, 0.95))`
                        : "linear-gradient(160deg, hsla(240, 15%, 8%, 0.4), hsla(240, 15%, 5%, 0.6))",
                      boxShadow: isHovered
                        ? `0 20px 60px -20px hsla(${card.accent} / 0.08)`
                        : "none",
                    }}
                  >
                    {/* Accent dot */}
                    <div
                      className="w-1 h-1 rounded-full mb-6 transition-opacity duration-700"
                      style={{ background: `hsl(${card.accent})`, opacity: isHovered ? 0.5 : 0.15 }}
                    />

                    <h3
                      className={`font-display text-serif-cn mb-1.5 transition-colors duration-700 ${
                        isFeatured ? "text-xl md:text-2xl" : "text-base md:text-lg"
                      } ${isHovered ? "text-foreground/80" : "text-foreground/40"}`}
                    >
                      {card.titleCn}
                    </h3>
                    <p
                      className={`text-muted-foreground/20 mb-4 font-light italic ${
                        isFeatured ? "text-sm" : "text-xs"
                      }`}
                    >
                      {card.titleEn}
                    </p>

                    <p
                      className={`text-serif-cn leading-relaxed transition-colors duration-700 ${
                        isFeatured ? "text-sm" : "text-xs"
                      } ${isHovered ? "text-muted-foreground/50" : "text-muted-foreground/20"}`}
                    >
                      {t(card.descCn, card.descEn)}
                    </p>

                    {/* Bottom line */}
                    <div
                      className="mt-6 h-px transition-all duration-700"
                      style={{
                        background: `linear-gradient(90deg, hsla(${card.accent} / ${isHovered ? 0.15 : 0.04}), transparent)`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Fading quote ── */}
      <section className="py-24 pl-6 md:pl-16">
        <p className="text-sm text-serif-cn text-muted-foreground/12 tracking-[0.25em] animate-fade-dim">
          声音会消散，但余音可以永存
        </p>
        <p className="text-xs text-muted-foreground/8 mt-2 tracking-[0.2em] font-light animate-fade-dim" style={{ animationDelay: "1s" }}>
          Sound fades, but its echo can last forever
        </p>
      </section>
    </div>
  );
}
