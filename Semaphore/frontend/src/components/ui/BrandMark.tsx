import { cn } from "../../lib/cn";

interface BrandMarkProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textClassName?: string;
}

export function BrandMark({ className, size = 28, showText = true, textClassName }: BrandMarkProps) {
  const wordmarkHeight = Math.max(Math.round(size * 0.62), 16);

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img
        src="/2.png"
        alt="Seamphore icon"
        className="shrink-0 object-contain"
        style={{ width: size, height: size }}
      />
      {showText ? (
        <img
          src="/3.png"
          alt="Seamphore"
          className={cn("shrink-0 object-contain", textClassName)}
          style={{ height: wordmarkHeight }}
        />
      ) : null}
    </div>
  );
}
