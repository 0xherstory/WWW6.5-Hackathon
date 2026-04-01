"use client";

interface DealerProps {
  color: string;
  dealing?: boolean;
}

export default function Dealer({ color, dealing = false }: DealerProps) {
  return (
    <div
      className="flex flex-col items-center gap-1 select-none"
      style={{ animation: "dealerFloat 3s ease-in-out infinite" }}
    >
      <svg
        width="96"
        height="128"
        viewBox="0 0 96 128"
        style={{ imageRendering: "pixelated" }}
      >
        {/* ── HAT ── */}
        <rect x="32" y="0"  width="32" height="6"  fill="#1e0840" />
        <rect x="28" y="6"  width="40" height="6"  fill="#1e0840" />
        <rect x="24" y="12" width="48" height="6"  fill="#1e0840" />
        <rect x="20" y="18" width="56" height="6"  fill="#1e0840" />
        {/* hat brim */}
        <rect x="14" y="24" width="68" height="5"  fill="#361270" />
        {/* hat shine */}
        <rect x="30" y="3"  width="6"  height="3"  fill="#5b35ce" opacity="0.5" />

        {/* ── HAIR (peeking below brim) ── */}
        <rect x="14" y="29" width="12" height="8"  fill="#9b5de5" />
        <rect x="70" y="29" width="12" height="8"  fill="#9b5de5" />
        <rect x="14" y="37" width="10" height="6"  fill="#7c3aed" />
        <rect x="72" y="37" width="10" height="6"  fill="#7c3aed" />

        {/* ── FACE ── */}
        <rect x="28" y="29" width="40" height="32" fill="#f5c4a0" />

        {/* ── EYES ── */}
        <rect x="34" y="38" width="8"  height="7"  fill="#0a0818" />
        <rect x="36" y="39" width="3"  height="3"  fill="#ffffff" />
        <rect x="54" y="38" width="8"  height="7"  fill="#0a0818" />
        <rect x="56" y="39" width="3"  height="3"  fill="#ffffff" />
        {/* eyelashes (pixel dots above eyes) */}
        <rect x="34" y="36" width="2"  height="2"  fill="#0a0818" />
        <rect x="38" y="35" width="2"  height="2"  fill="#0a0818" />
        <rect x="54" y="36" width="2"  height="2"  fill="#0a0818" />
        <rect x="58" y="35" width="2"  height="2"  fill="#0a0818" />

        {/* ── NOSE ── */}
        <rect x="45" y="49" width="6"  height="3"  fill="#d4a470" />

        {/* ── MOUTH ── */}
        <rect x="38" y="54" width="20" height="5"  fill="#d85090" />
        <rect x="40" y="54" width="16" height="2"  fill="#ff79c6" opacity="0.5" />

        {/* ── NECK ── */}
        <rect x="40" y="61" width="16" height="8"  fill="#f5c4a0" />

        {/* ── SHOULDERS / ROBE ── */}
        <rect x="10" y="69" width="76" height="48" fill="#0f0824" />

        {/* robe center seam */}
        <rect x="44" y="69" width="8"  height="48" fill="#1e1040" />

        {/* robe collar */}
        <rect x="32" y="69" width="32" height="8"  fill="#1e0840" />

        {/* ── BROOCH (domain color gem) ── */}
        <rect x="42" y="74" width="12" height="12" fill={color} opacity="0.9" />
        <rect x="44" y="76" width="4"  height="4"  fill="#ffffff" opacity="0.6" />
        <rect x="42" y="74" width="12" height="2"  fill="#ffffff" opacity="0.2" />

        {/* robe detail lines */}
        <rect x="28" y="90" width="6"  height="2"  fill={color} opacity="0.3" />
        <rect x="62" y="90" width="6"  height="2"  fill={color} opacity="0.3" />
        <rect x="26" y="96" width="6"  height="2"  fill={color} opacity="0.2" />
        <rect x="64" y="96" width="6"  height="2"  fill={color} opacity="0.2" />

        {/* ── LEFT ARM ── */}
        <rect x="0"  y="69" width="14" height="8"  fill="#0f0824" />
        {/* left hand */}
        <rect x="0"  y="77" width="10" height="6"  fill="#f5c4a0" />

        {/* ── RIGHT ARM ── */}
        <rect x="82" y="69" width="14" height="8"  fill="#0f0824" />
        {/* right hand */}
        <rect x="86" y="77" width="10" height="6"  fill="#f5c4a0" />

        {/* ── LEFT HAND CARDS (fanned) ── */}
        <g
          style={{
            transformOrigin: "8px 90px",
            transform: dealing ? "rotate(-5deg)" : "rotate(-18deg)",
            transition: "transform 0.4s ease",
          }}
        >
          <rect x="0" y="70" width="14" height="20" fill="#e8e8f4" />
          <rect x="1" y="71" width="12" height="3"  fill={color} opacity="0.35" />
          <rect x="1" y="75" width="12" height="1"  fill={color} opacity="0.2" />
        </g>
        <g
          style={{
            transformOrigin: "8px 90px",
            transform: dealing ? "rotate(2deg)" : "rotate(-8deg)",
            transition: "transform 0.4s ease 0.05s",
          }}
        >
          <rect x="0" y="70" width="14" height="20" fill="#e0e0f0" />
          <rect x="1" y="71" width="12" height="3"  fill={color} opacity="0.5" />
        </g>
        <g
          style={{
            transformOrigin: "8px 90px",
            transform: dealing ? "rotate(10deg)" : "rotate(2deg)",
            transition: "transform 0.4s ease 0.1s",
          }}
        >
          <rect x="0" y="70" width="14" height="20" fill="#1e0840" />
          <rect x="2" y="74" width="10" height="14" fill={color} opacity="0.2" />
          <rect x="5" y="78" width="4"  height="6"  fill="#ffd700" opacity="0.4" />
        </g>

        {/* ── RIGHT HAND CARDS (fanned) ── */}
        <g
          style={{
            transformOrigin: "88px 90px",
            transform: dealing ? "rotate(5deg)" : "rotate(18deg)",
            transition: "transform 0.4s ease",
          }}
        >
          <rect x="82" y="70" width="14" height="20" fill="#e8e8f4" />
          <rect x="83" y="71" width="12" height="3"  fill={color} opacity="0.35" />
          <rect x="83" y="75" width="12" height="1"  fill={color} opacity="0.2" />
        </g>
        <g
          style={{
            transformOrigin: "88px 90px",
            transform: dealing ? "rotate(-2deg)" : "rotate(8deg)",
            transition: "transform 0.4s ease 0.05s",
          }}
        >
          <rect x="82" y="70" width="14" height="20" fill="#e0e0f0" />
          <rect x="83" y="71" width="12" height="3"  fill={color} opacity="0.5" />
        </g>
        <g
          style={{
            transformOrigin: "88px 90px",
            transform: dealing ? "rotate(-10deg)" : "rotate(-2deg)",
            transition: "transform 0.4s ease 0.1s",
          }}
        >
          <rect x="82" y="70" width="14" height="20" fill="#1e0840" />
          <rect x="84" y="74" width="10" height="14" fill={color} opacity="0.2" />
          <rect x="87" y="78" width="4"  height="6"  fill="#ffd700" opacity="0.4" />
        </g>

        {/* ── LEGS ── */}
        <rect x="28" y="117" width="16" height="11" fill="#0f0824" />
        <rect x="52" y="117" width="16" height="11" fill="#0f0824" />

        {/* ── SHOES ── */}
        <rect x="24" y="122" width="22" height="6"  fill="#050510" />
        <rect x="50" y="122" width="22" height="6"  fill="#050510" />
        <rect x="44" y="124" width="8"  height="2"  fill="#1a0840" />
      </svg>

      {/* Name tag */}
      <p
        className="text-[6px] tracking-widest mt-1"
        style={{ color: `${color}99` }}
      >
        命运发牌人
      </p>
    </div>
  );
}
