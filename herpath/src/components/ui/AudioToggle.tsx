"use client";

interface AudioToggleProps {
  muted: boolean;
  onToggle: () => void;
}

export default function AudioToggle({ muted, onToggle }: AudioToggleProps) {
  return (
    <button
      onClick={onToggle}
      title={muted ? "开启音乐" : "静音"}
      className="fixed bottom-4 right-4 z-50 pixel-btn w-10 h-10 flex items-center justify-center text-sm"
      style={{
        borderColor: "#4a4a8a",
        backgroundColor: "#12122a",
        color: muted ? "#4a4a8a" : "#a0a0ff",
      }}
    >
      {muted ? "🔇" : "🎵"}
    </button>
  );
}
