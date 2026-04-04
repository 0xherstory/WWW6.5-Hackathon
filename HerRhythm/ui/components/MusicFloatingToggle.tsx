"use client";

import { TrackName, useBackgroundAudio } from "@/components/BackgroundAudioProvider";

export default function MusicFloatingToggle({
  track,
}: {
  track: TrackName;
}) {
  const { enabled, toggleForTrack } = useBackgroundAudio();

  const handleClick = async () => {
    await toggleForTrack(track, {
      loop: track === "home",
      reset: track === "checkin",
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={enabled ? "Turn music off" : "Turn music on"}
      className={[
        "fixed right-5 top-1/2 z-40 -translate-y-1/2",
        "min-w-[88px] h-10 px-[14px] rounded-full text-sm font-medium",
        "transition-all duration-200",
        enabled
          ? "bg-white/70 text-[#6F7C73] border border-[#6f7c73]/10 shadow-[0_8px_24px_rgba(60,70,60,0.08)] backdrop-blur-md hover:bg-white/80 hover:-translate-y-[1px] active:scale-[0.98]"
          : "bg-white/55 text-[#8A948D] border border-[#6f7c73]/10 shadow-[0_8px_24px_rgba(60,70,60,0.05)] backdrop-blur-md hover:bg-white/65 hover:-translate-y-[1px] active:scale-[0.98]",
      ].join(" ")}
    >
      {enabled ? "🎵 On" : "🎵 Off"}
    </button>
  );
}