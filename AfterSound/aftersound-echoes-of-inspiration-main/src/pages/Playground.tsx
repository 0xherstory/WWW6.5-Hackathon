import { useState, useRef, useCallback, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import * as Tone from "tone";

const pianoNotes = [
  { note: "C4", label: "C", black: false },
  { note: "C#4", label: "C#", black: true },
  { note: "D4", label: "D", black: false },
  { note: "D#4", label: "D#", black: true },
  { note: "E4", label: "E", black: false },
  { note: "F4", label: "F", black: false },
  { note: "F#4", label: "F#", black: true },
  { note: "G4", label: "G", black: false },
  { note: "G#4", label: "G#", black: true },
  { note: "A4", label: "A", black: false },
  { note: "A#4", label: "A#", black: true },
  { note: "B4", label: "B", black: false },
  { note: "C5", label: "C", black: false },
];

const waveforms: OscillatorType[] = ["sine", "triangle", "square", "sawtooth"];

const pads = [
  { label: "Kick", freq: 60, color: "bg-glow-purple/20 border-glow-purple/30" },
  { label: "Snare", freq: 200, color: "bg-glow-blue/20 border-glow-blue/30" },
  { label: "Hi-Hat", freq: 800, color: "bg-glow-pink/20 border-glow-pink/30" },
  { label: "Clap", freq: 400, color: "bg-glow-cyan/20 border-glow-cyan/30" },
  { label: "Bass", freq: 80, color: "bg-primary/20 border-primary/30" },
  { label: "Synth", freq: 440, color: "bg-glow-purple/20 border-glow-purple/30" },
  { label: "Pad", freq: 330, color: "bg-glow-blue/20 border-glow-blue/30" },
  { label: "FX", freq: 1200, color: "bg-glow-pink/20 border-glow-pink/30" },
];

const octaves = [3, 4, 5];

export default function Playground() {
  const { t } = useLanguage();
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [activePad, setActivePad] = useState<string | null>(null);
  const [waveform, setWaveform] = useState<OscillatorType>("sine");
  const [octave, setOctave] = useState(4);
  const [volume, setVolume] = useState(-6);
  const [toneStarted, setToneStarted] = useState(false);
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const noiseRef = useRef<Tone.NoiseSynth | null>(null);

  const ensureTone = useCallback(async () => {
    if (!toneStarted) {
      await Tone.start();
      setToneStarted(true);
    }
  }, [toneStarted]);

  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: waveform },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.2, release: 0.8 },
    }).toDestination();
    synthRef.current.volume.value = volume;

    noiseRef.current = new Tone.NoiseSynth({
      noise: { type: "white" },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0 },
    }).toDestination();
    noiseRef.current.volume.value = volume;

    return () => {
      synthRef.current?.dispose();
      noiseRef.current?.dispose();
    };
  }, [waveform, volume]);

  const playNote = async (note: string) => {
    await ensureTone();
    const adjusted = note.replace(/\d/, String(octave + (note.includes("C5") ? 1 : 0)));
    synthRef.current?.triggerAttackRelease(adjusted, "8n");
    setActiveNote(note);
    setTimeout(() => setActiveNote(null), 300);
  };

  const hitPad = async (pad: typeof pads[0]) => {
    await ensureTone();
    if (pad.label === "Hi-Hat" || pad.label === "Clap") {
      noiseRef.current?.triggerAttackRelease("16n");
    } else {
      const synth = new Tone.Synth({
        oscillator: { type: pad.freq < 100 ? "sine" : waveform },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.3 },
      }).toDestination();
      synth.volume.value = volume;
      synth.triggerAttackRelease(pad.freq, "8n");
      setTimeout(() => synth.dispose(), 1000);
    }
    setActivePad(pad.label);
    setTimeout(() => setActivePad(null), 200);
  };

  const whiteKeys = pianoNotes.filter((n) => !n.black);
  const blackKeys = pianoNotes.filter((n) => n.black);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text mb-2">
          {t("Music Playground", "音乐实验场")}
        </h1>
        <p className="text-muted-foreground mb-8">
          {t("Explore real sounds, shape your emotion.", "探索真实声音，塑造你的情绪。")}
        </p>

        {/* Synth Controls */}
        <div className="glass-card p-5 gradient-border mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">{t("Waveform", "波形")}</p>
              <div className="flex gap-1.5">
                {waveforms.map((w) => (
                  <button
                    key={w}
                    onClick={() => setWaveform(w)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                      waveform === w
                        ? "bg-primary text-primary-foreground glow-purple"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">{t("Octave", "八度")}</p>
              <div className="flex gap-1.5">
                {octaves.map((o) => (
                  <button
                    key={o}
                    onClick={() => setOctave(o)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                      octave === o
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    C{o}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              {volume <= -20 ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className="w-4 h-4 text-muted-foreground" />}
              <input
                type="range"
                min={-30}
                max={0}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-20 accent-primary"
              />
            </div>
          </div>
        </div>

        {/* Piano */}
        <div className="glass-card p-6 gradient-border mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">{t("Piano", "钢琴")}</h3>
          <div className="relative flex justify-center">
            {/* White keys */}
            <div className="flex gap-1">
              {whiteKeys.map((key) => (
                <button
                  key={key.note}
                  onClick={() => playNote(key.note)}
                  className={`w-10 sm:w-12 h-36 rounded-b-lg border text-xs font-mono transition-all duration-100 ${
                    activeNote === key.note
                      ? "bg-primary text-primary-foreground scale-[0.97] glow-purple"
                      : "bg-secondary/60 border-glass-border text-foreground hover:bg-secondary"
                  }`}
                >
                  <span className="block mt-28">{key.label}</span>
                </button>
              ))}
            </div>
            {/* Black keys overlay */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 flex pointer-events-none" style={{ width: `${whiteKeys.length * (window.innerWidth < 640 ? 44 : 52)}px` }}>
              {pianoNotes.map((key, i) => {
                if (!key.black) return null;
                const whiteIndex = pianoNotes.slice(0, i).filter((n) => !n.black).length;
                const left = whiteIndex * (window.innerWidth < 640 ? 44 : 52) - 10;
                return (
                  <button
                    key={key.note}
                    onClick={() => playNote(key.note)}
                    className={`absolute pointer-events-auto w-7 h-22 rounded-b-md text-[10px] font-mono transition-all duration-100 ${
                      activeNote === key.note
                        ? "bg-primary text-primary-foreground scale-95"
                        : "bg-foreground/90 text-background hover:bg-foreground/70"
                    }`}
                    style={{ left: `${left}px`, height: "88px" }}
                  >
                    <span className="block mt-16">{key.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Drum Pads */}
        <div className="glass-card p-6 gradient-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">{t("Pads", "打击垫")}</h3>
          <div className="grid grid-cols-4 gap-3">
            {pads.map((pad) => (
              <button
                key={pad.label}
                onClick={() => hitPad(pad)}
                className={`aspect-square rounded-xl border flex items-center justify-center text-xs font-medium transition-all duration-100 ${
                  pad.color
                } ${
                  activePad === pad.label ? "scale-90 brightness-150" : "hover:scale-105"
                }`}
              >
                {pad.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
