import { useNavigate } from "react-router-dom";

import { FloatingIconsHero } from "../components/ui/floating-icons-hero-section";

const HERO_POINTS = [
  { id: 1, className: "left-[7%] top-[10%]", size: "sm" as const, revealDelayMs: 120 },
  { id: 2, className: "left-[16%] top-[24%]", size: "md" as const, driftClassName: "animate-hero-orb-drift-reverse", revealDelayMs: 300 },
  { id: 3, className: "left-[10%] top-[64%]", size: "lg" as const, revealDelayMs: 1220 },
  { id: 4, className: "left-[24%] top-[80%]", size: "sm" as const, driftClassName: "animate-hero-orb-drift-reverse", revealDelayMs: 1580 },
  { id: 5, className: "left-[34%] top-[12%]", size: "md" as const, revealDelayMs: 440 },
  { id: 6, className: "left-[42%] top-[72%]", size: "sm" as const, revealDelayMs: 1820 },
  { id: 7, className: "left-[76%] top-[14%]", size: "lg" as const, driftClassName: "animate-hero-orb-drift-reverse", revealDelayMs: 760 },
  { id: 8, className: "left-[86%] top-[32%]", size: "md" as const, revealDelayMs: 980 },
  { id: 9, className: "left-[80%] top-[74%]", size: "sm" as const, revealDelayMs: 1680 },
  { id: 10, className: "left-[64%] top-[84%]", size: "md" as const, driftClassName: "animate-hero-orb-drift-reverse", revealDelayMs: 1960 },
  { id: 11, className: "left-[58%] top-[18%]", size: "sm" as const, revealDelayMs: 620 },
  { id: 12, className: "left-[90%] top-[82%]", size: "lg" as const, driftClassName: "animate-hero-orb-drift-reverse", revealDelayMs: 2140 },
];

export function SeamphoreThresholdPage() {
  const navigate = useNavigate();

  return (
    <FloatingIconsHero
      backgroundImageSrc="/1.png"
      title="Seamphore"
      subtitle="写作者好像是安静地敲击键盘，其实她在虚拟的世界站在最高点向世界大声宣告着——我在这里，你在哪里。"
      ctaText="点击打开seamphore"
      onCtaClick={() => navigate("/discover", { replace: true })}
      points={HERO_POINTS}
    />
  );
}
