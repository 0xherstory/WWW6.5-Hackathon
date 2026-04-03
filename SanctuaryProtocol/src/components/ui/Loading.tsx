interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  variant?: "spinner" | "geometric";
}

export default function Loading({ 
  size = "md", 
  text,
  variant = "geometric"
}: LoadingProps) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const textSizes = {
    sm: "text-tag",
    md: "text-small",
    lg: "text-body",
  };

  if (variant === "geometric") {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* 几何旋转动画 */}
        <div className={`relative ${sizes[size]}`}>
          {/* 外层方框 */}
          <div className="absolute inset-0 border border-accent/30 animate-spin" style={{ animationDuration: '3s' }} />
          {/* 内层方框 */}
          <div className="absolute inset-2 border border-accent/50 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
          {/* 中心点 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-accent/70" />
          </div>
        </div>
        
        {text && (
          <p className={`${textSizes[size]} text-muted uppercase tracking-widest`}>
            {text}
          </p>
        )}
      </div>
    );
  }

  // 传统 Spinner 样式
  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <svg
        className={`animate-spin ${sizes[size]} text-accent`}
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-20"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="1"
        />
        <path
          className="opacity-80"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && (
        <p className={`${textSizes[size]} text-muted`}>{text}</p>
      )}
    </div>
  );
}
