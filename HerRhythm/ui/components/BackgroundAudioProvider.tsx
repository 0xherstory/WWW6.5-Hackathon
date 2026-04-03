"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

export type TrackName = "home" | "checkin";

type PlayOptions = {
  loop?: boolean;
  reset?: boolean;
  fromUser?: boolean;
  volume?: number;
  forceEnable?: boolean;
};

type BackgroundAudioContextValue = {
  enabled: boolean;
  isPlaying: boolean;
  currentTrack: TrackName | null;
  playTrack: (track: TrackName, options?: PlayOptions) => Promise<void>;
  pauseTrack: (turnOff?: boolean) => Promise<void>;
  toggleForTrack: (track: TrackName, options?: PlayOptions) => Promise<void>;
};

const BackgroundAudioContext =
  createContext<BackgroundAudioContextValue | null>(null);

const TRACKS: Record<TrackName, string> = {
  home: "/audio/home-breeze.m4a",
  checkin: "/audio/checkin-kazamidori.m4a",
};

const DEFAULT_VOLUMES: Record<TrackName, number> = {
  home: 0.38,
  checkin: 0.42,
};

export function BackgroundAudioProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 首页默认尝试自动播放
  const [enabled, setEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<TrackName | null>(null);

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = "auto";
      audioRef.current = audio;
    }
    return audioRef.current;
  }, []);

  const fadeTo = useCallback(
    (target: number, duration = 420) =>
      new Promise<void>((resolve) => {
        const audio = ensureAudio();
        const start = Number.isFinite(audio.volume) ? audio.volume : 0;
        const steps = 12;
        const stepTime = duration / steps;
        let step = 0;

        const timer = window.setInterval(() => {
          step += 1;

          const nextVolume = start + ((target - start) * step) / steps;
          const safeVolume = Math.min(1, Math.max(0, nextVolume));
          audio.volume = safeVolume;

          if (step >= steps) {
            window.clearInterval(timer);
            audio.volume = Math.min(1, Math.max(0, target));
            resolve();
          }
        }, stepTime);
      }),
    [ensureAudio]
  );

  const playTrack = useCallback(
    async (track: TrackName, options?: PlayOptions) => {
      if (!track) return;
      if (!enabled && !options?.fromUser && !options?.forceEnable) return;

      if (options?.forceEnable) {
        setEnabled(true);
      }

      const audio = ensureAudio();
      const nextSrc = TRACKS[track];
      const shouldLoop = options?.loop ?? track === "home";
      const shouldReset = options?.reset ?? false;
      const targetVolume = options?.volume ?? DEFAULT_VOLUMES[track];

      setCurrentTrack(track);

      const currentSrc = audio.getAttribute("src") ?? "";
      const isSameTrack = currentSrc === nextSrc;

      if (!isSameTrack) {
        try {
          await fadeTo(0, 180);
        } catch {}
        audio.pause();
        audio.src = nextSrc;
        audio.load();
      }

      audio.loop = shouldLoop;

      if (shouldReset) {
        audio.currentTime = 0;
      }

      audio.volume = 0;

      try {
        await audio.play();
        await fadeTo(targetVolume, 700);
        setIsPlaying(true);
        setEnabled(true);
      } catch {
        setIsPlaying(false);
      }
    },
    [enabled, ensureAudio, fadeTo]
  );

  const pauseTrack = useCallback(
    async (turnOff = false) => {
      const audio = ensureAudio();

      try {
        await fadeTo(0, 220);
      } catch {}

      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);

      if (turnOff) {
        setEnabled(false);
      }
    },
    [ensureAudio, fadeTo]
  );

  const toggleForTrack = useCallback(
    async (track: TrackName, options?: PlayOptions) => {
      if (enabled && isPlaying) {
        await pauseTrack(true);
        return;
      }

      setEnabled(true);
      await playTrack(track, {
        ...options,
        fromUser: true,
      });
    },
    [enabled, isPlaying, pauseTrack, playTrack]
  );

  // 进入练习页时自动暂停，并把按钮切成 Off
  useEffect(() => {
    if (pathname?.includes("/breathing") || pathname?.includes("/kegel")) {
      pauseTrack(true);
    }
  }, [pathname, pauseTrack]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const value = useMemo(
    () => ({
      enabled,
      isPlaying,
      currentTrack,
      playTrack,
      pauseTrack,
      toggleForTrack,
    }),
    [enabled, isPlaying, currentTrack, playTrack, pauseTrack, toggleForTrack]
  );

  return (
    <BackgroundAudioContext.Provider value={value}>
      {children}
    </BackgroundAudioContext.Provider>
  );
}

export function useBackgroundAudio() {
  const context = useContext(BackgroundAudioContext);

  if (!context) {
    throw new Error(
      "useBackgroundAudio must be used within BackgroundAudioProvider"
    );
  }

  return context;
}