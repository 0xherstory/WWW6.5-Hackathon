"use client";

import { useEffect, useRef, useState } from "react";
import type { Domain } from "@/types/game";

type AudioScene = Domain | "intro" | null;

const TRACKS: Record<NonNullable<AudioScene>, string> = {
  intro: "/audio/intro.wav",
  art: "/audio/art.wav",
  science: "/audio/science.wav",
  law: "/audio/law.ogg",
};

const FADE_MS = 800;

export function useGameAudio() {
  const [muted, setMuted] = useState(false);
  const [scene, setScene] = useState<AudioScene>(null);
  const howlRef = useRef<import("howler").Howl | null>(null);
  const sceneRef = useRef<AudioScene>(null);

  useEffect(() => {
    // Howler is browser-only
    if (typeof window === "undefined" || scene === sceneRef.current) return;
    sceneRef.current = scene;

    const prev = howlRef.current;

    if (!scene) {
      prev?.fade(prev.volume(), 0, FADE_MS);
      setTimeout(() => prev?.stop(), FADE_MS);
      howlRef.current = null;
      return;
    }

    import("howler").then(({ Howl }) => {
      const next = new Howl({
        src: [TRACKS[scene]],
        loop: true,
        volume: 0,
        html5: true,
      });

      next.play();
      next.fade(0, muted ? 0 : 0.6, FADE_MS);

      if (prev) {
        prev.fade(prev.volume(), 0, FADE_MS);
        setTimeout(() => prev.stop(), FADE_MS);
      }

      howlRef.current = next;
    });
  }, [scene]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const howl = howlRef.current;
    if (!howl) return;
    if (muted) {
      howl.fade(howl.volume(), 0, 300);
    } else {
      howl.fade(howl.volume(), 0.6, 300);
    }
  }, [muted]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      howlRef.current?.stop();
    };
  }, []);

  return { muted, setMuted, setScene };
}
