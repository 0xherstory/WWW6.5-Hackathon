let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

export function playBeep(frequency = 880, duration = 0.15) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // silent fail
  }
}

// Custom audio deterrent playback
let deterrentAudio: HTMLAudioElement | null = null;
let isDeterrentPlaying = false;

export function startDeterrentAudio(customAudioUrl: string | null) {
  if (isDeterrentPlaying) return;
  isDeterrentPlaying = true;

  if (customAudioUrl) {
    // Play user-uploaded custom audio
    deterrentAudio = new Audio(customAudioUrl);
    deterrentAudio.loop = false;
    deterrentAudio.volume = 1.0;
    deterrentAudio.play().catch(() => {});
  } else {
    // Fallback: use SpeechSynthesis
    startSpeechFallback();
  }
}

export function stopDeterrentAudio() {
  isDeterrentPlaying = false;
  if (deterrentAudio) {
    deterrentAudio.pause();
    deterrentAudio.currentTime = 0;
    deterrentAudio = null;
  }
  // Also stop speech fallback
  if ("speechSynthesis" in window) {
    speechSynthesis.cancel();
  }
}

export function isDeterrentPlaying_() {
  return isDeterrentPlaying;
}

// Speech fallback when no custom audio
function startSpeechFallback() {
  if (!("speechSynthesis" in window)) return;

  const speak = () => {
    if (!isDeterrentPlaying) return;
    const utterance = new SpeechSynthesisUtterance(
      "警告！警告！此区域已被监控，你的位置已被记录并上传。警察已收到通知，请立即离开！Warning! Your location has been recorded and uploaded. Police have been notified!"
    );
    utterance.lang = "zh-CN";
    utterance.rate = 1.0;
    utterance.pitch = 0.6;
    utterance.volume = 1.0;

    const voices = speechSynthesis.getVoices();
    const maleVoice = voices.find(
      (v) => v.lang.startsWith("zh") && v.name.toLowerCase().includes("male")
    );
    if (maleVoice) utterance.voice = maleVoice;

    utterance.onend = () => {
      if (isDeterrentPlaying) {
        setTimeout(speak, 500);
      }
    };
    speechSynthesis.speak(utterance);
  };

  speak();
}
