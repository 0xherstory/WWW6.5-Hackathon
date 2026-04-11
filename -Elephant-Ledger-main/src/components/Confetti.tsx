import { useEffect, useState } from "react";

interface ConfettiProps {
  isActive: boolean;
  onComplete?: () => void;
}

const Confetti = ({ isActive, onComplete }: ConfettiProps) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    color: string;
    delay: number;
    size: number;
  }>>([]);

  useEffect(() => {
    if (isActive) {
      const colors = [
        "hsl(42, 90%, 55%)",     // golden
        "hsl(15, 55%, 55%)",     // terracotta
        "hsl(145, 25%, 55%)",    // sage
        "hsl(42, 90%, 70%)",     // golden light
        "hsl(15, 45%, 70%)",     // terracotta light
      ];
      
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
        size: 6 + Math.random() * 8,
      }));
      
      setParticles(newParticles);
      
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${particle.x}%`,
            top: -20,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            animationDelay: `${particle.delay}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;
