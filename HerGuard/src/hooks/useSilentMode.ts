import { useState, useCallback } from "react";

const SOUND_KEY = "herguard_sound_on";
const CUSTOM_AUDIO_KEY = "herguard_custom_audio";

function loadBool(key: string, defaultVal = false): boolean {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? v === "true" : defaultVal;
  } catch {
    return defaultVal;
  }
}

export function useSilentMode() {
  // soundOn = true means deterrent sound plays on SOS; false = fully silent
  const [soundOn, setSoundOn] = useState(() => loadBool(SOUND_KEY, false));
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem(CUSTOM_AUDIO_KEY);
    } catch {
      return null;
    }
  });

  const toggleSound = useCallback(() => {
    setSoundOn((prev) => {
      const next = !prev;
      localStorage.setItem(SOUND_KEY, String(next));
      return next;
    });
  }, []);

  const saveCustomAudio = useCallback((dataUrl: string | null) => {
    setCustomAudioUrl(dataUrl);
    try {
      if (dataUrl) {
        localStorage.setItem(CUSTOM_AUDIO_KEY, dataUrl);
      } else {
        localStorage.removeItem(CUSTOM_AUDIO_KEY);
      }
    } catch {
      // storage full
    }
  }, []);

  return {
    soundOn,
    toggleSound,
    isSilent: !soundOn,
    voiceDeterrent: soundOn,
    customAudioUrl,
    saveCustomAudio,
  };
}
