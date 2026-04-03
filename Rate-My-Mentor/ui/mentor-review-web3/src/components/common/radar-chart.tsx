"use client";

import { cn } from "@/lib/utils";

interface RadarChartProps {
  data: { label: string; value: number }[];
  size?: number;
  className?: string;
}

export function RadarChart({ data, size = 100, className }: RadarChartProps) {
  const center = size / 2;
  const radius = size / 2 - 8;
  const angleStep = (2 * Math.PI) / data.length;
  const maxValue = 5;

  // 计算每个点的位置
  const points = data.map((item, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const r = (item.value / maxValue) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
      label: item.label,
      value: item.value,
    };
  });

  // 生成背景网格
  const levels = [0.25, 0.5, 0.75, 1];
  const gridLines = levels.map((level) => {
    return data.map((_, i) => {
      const angle = -Math.PI / 2 + i * angleStep;
      const r = level * radius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      };
    });
  });

  // 生成数据多边形路径
  const polygonPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* 背景网格 */}
        {gridLines.map((line, i) => {
          const path = line.map((p, j) => `${j === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
          return (
            <path
              key={i}
              d={path}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-muted/30"
            />
          );
        })}

        {/* 轴线 */}
        {data.map((_, i) => {
          const angle = -Math.PI / 2 + i * angleStep;
          const x2 = center + radius * Math.cos(angle);
          const y2 = center + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-muted/30"
            />
          );
        })}

        {/* 数据多边形 */}
        <path
          d={polygonPath}
          fill="rgba(22, 93, 255, 0.2)"
          stroke="#165DFF"
          strokeWidth="1.5"
        />

        {/* 数据点 */}
        {points.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="2.5"
            fill="#165DFF"
            className="text-[#165DFF]"
          />
        ))}
      </svg>

      {/* 标签 */}
      <div className="absolute inset-0 pointer-events-none">
        {points.map((point, i) => {
          const angle = -Math.PI / 2 + i * angleStep;
          const labelRadius = radius + 10;
          const x = center + labelRadius * Math.cos(angle);
          const y = center + labelRadius * Math.sin(angle);
          return (
            <span
              key={i}
              className="absolute text-[8px] text-muted-foreground transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: x,
                top: y,
              }}
            >
              {point.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
