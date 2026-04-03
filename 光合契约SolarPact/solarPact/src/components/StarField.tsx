import { useMemo } from "react";

const StarField = () => {
  const stars = useMemo(
    () =>
      Array.from({ length: 120 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.6 + 0.15,
        delay: Math.random() * 6,
        duration: Math.random() * 3 + 2,
        color: Math.random() > 0.7
          ? `hsl(var(--primary) / ${Math.random() * 0.4 + 0.2})`
          : Math.random() > 0.5
          ? `hsl(var(--glow-cyan) / ${Math.random() * 0.3 + 0.1})`
          : `hsl(var(--foreground) / ${Math.random() * 0.4 + 0.1})`,
      })),
    []
  );

  const shootingStars = useMemo(
    () =>
      Array.from({ length: 3 }, (_, i) => ({
        id: i,
        startX: Math.random() * 80 + 10,
        startY: Math.random() * 40,
        delay: Math.random() * 15 + 5,
        duration: Math.random() * 1.5 + 0.8,
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full animate-pulse-glow"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            backgroundColor: star.color,
            opacity: star.opacity,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
      {/* Shooting stars */}
      {shootingStars.map((s) => (
        <div
          key={`shoot-${s.id}`}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${s.startX}%`,
            top: `${s.startY}%`,
            background: `linear-gradient(90deg, hsl(var(--primary)), transparent)`,
            width: "40px",
            height: "1px",
            opacity: 0,
            animation: `shootingStar ${s.duration}s ease-in ${s.delay}s infinite`,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-cosmic-mesh" />

      <style>{`
        @keyframes shootingStar {
          0% { opacity: 0; transform: translateX(0) translateY(0) rotate(-30deg); }
          10% { opacity: 1; }
          30% { opacity: 0; transform: translateX(200px) translateY(120px) rotate(-30deg); }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default StarField;
