"use client";

interface PixelCharacterProps {
  progress?: number; // 0-1, character growth
}

export default function PixelCharacter({ progress = 0 }: PixelCharacterProps) {
  const size = 80 + progress * 40; // grows from 80 to 120
  const scale = 0.8 + progress * 0.4;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 140"
      style={{ imageRendering: "pixelated", transform: `scale(${scale})` }}
    >
      {/* Head */}
      <rect x="35" y="10" width="30" height="30" fill="#f5c4a0" />
      {/* Hair */}
      <rect x="35" y="5" width="30" height="8" fill="#9b5de5" />
      {/* Eyes */}
      <rect x="40" y="18" width="6" height="6" fill="#0a0818" />
      <rect x="54" y="18" width="6" height="6" fill="#0a0818" />
      {/* Mouth */}
      <rect x="45" y="28" width="10" height="3" fill="#d85090" />

      {/* Body */}
      <rect x="30" y="40" width="40" height="35" fill="#0f0824" />

      {/* Shoulders */}
      <rect x="25" y="40" width="50" height="8" fill="#1e0840" />

      {/* Arms */}
      <rect x="10" y="45" width="15" height="8" fill="#f5c4a0" />
      <rect x="75" y="45" width="15" height="8" fill="#f5c4a0" />

      {/* Legs */}
      <rect x="35" y="75" width="12" height="30" fill="#1e0840" />
      <rect x="53" y="75" width="12" height="30" fill="#1e0840" />

      {/* Boots */}
      <rect x="33" y="105" width="16" height="8" fill="#050510" />
      <rect x="51" y="105" width="16" height="8" fill="#050510" />

      {/* Badge/Gem on chest (shows progress) */}
      {progress > 0 && (
        <circle cx="50" cy="55" r={4 + progress * 3} fill="#ffd700" opacity={0.6 + progress * 0.4} />
      )}
    </svg>
  );
}
