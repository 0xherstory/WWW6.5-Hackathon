// PurrChain 品牌图标 — 基于橙金色发光链圈 + 猫咪剪影设计
// 可作为 Navbar Logo 和网页 favicon（通过 SVG 内联）

interface PurrChainIconProps {
  size?: number;
  className?: string;
}

export function PurrChainIcon({ size = 32, className = "" }: PurrChainIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 背景圆角方块 */}
      <rect width="100" height="100" rx="22" fill="#FDEBD0" />

      {/* 外发光效果 */}
      <circle cx="50" cy="50" r="38" fill="none" stroke="#F97316" strokeWidth="0.5" opacity="0.3" />

      {/* 链条圆环 — 虚线段 */}
      <circle
        cx="50" cy="50" r="34"
        fill="none"
        stroke="#F97316"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="6 5"
        opacity="0.9"
      />

      {/* 内圈白色发光环 */}
      <circle
        cx="50" cy="50" r="28"
        fill="white"
        opacity="0.85"
      />

      {/* 猫咪剪影 — 居中，橙色 */}
      {/* 身体 */}
      <ellipse cx="50" cy="64" rx="14" ry="11" fill="#F97316" />
      {/* 头部 */}
      <circle cx="50" cy="47" r="13" fill="#F97316" />
      {/* 左耳 */}
      <polygon points="38,40 34,28 45,38" fill="#F97316" />
      {/* 右耳 */}
      <polygon points="62,40 66,28 55,38" fill="#F97316" />
      {/* 尾巴 */}
      <path
        d="M62 68 Q74 60 70 50 Q66 42 60 46"
        stroke="#F97316" strokeWidth="3.5"
        strokeLinecap="round" fill="none"
      />
    </svg>
  );
}

// 用于 Navbar 的纯 SVG 字符串，便于 favicon 注入
export const PURRCHAIN_ICON_SVG = `<svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="22" fill="#FDEBD0"/>
  <circle cx="50" cy="50" r="34" fill="none" stroke="#F97316" stroke-width="4" stroke-linecap="round" stroke-dasharray="6 5" opacity="0.9"/>
  <circle cx="50" cy="50" r="28" fill="white" opacity="0.85"/>
  <ellipse cx="50" cy="64" rx="14" ry="11" fill="#F97316"/>
  <circle cx="50" cy="47" r="13" fill="#F97316"/>
  <polygon points="38,40 34,28 45,38" fill="#F97316"/>
  <polygon points="62,40 66,28 55,38" fill="#F97316"/>
  <path d="M62 68 Q74 60 70 50 Q66 42 60 46" stroke="#F97316" stroke-width="3.5" stroke-linecap="round" fill="none"/>
</svg>`;
