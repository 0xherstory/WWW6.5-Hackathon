"use client";

import { ReactNode } from "react";

interface PixelDialogProps {
  children: ReactNode;
  borderColor?: string;
  className?: string;
}

export default function PixelDialog({
  children,
  borderColor = "#4a4a8a",
  className = "",
}: PixelDialogProps) {
  return (
    <div
      className={`bg-game-dialog p-6 pixel-border ${className}`}
      style={{
        borderColor,
        boxShadow: `4px 4px 0px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.05)`,
      }}
    >
      {children}
    </div>
  );
}
