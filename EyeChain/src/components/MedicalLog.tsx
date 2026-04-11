import { useState } from "react";
import DashboardPanel from "./DashboardPanel";
import { ClipboardPlus, Clock } from "lucide-react";

interface MedicalEntry {
  timestamp: string;
  dryness: number;
  pain: number;
  blur: number;
  examNotes: string;
  id: number;
}

export default function MedicalLog() {
  const [timestamp, setTimestamp] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [dryness, setDryness] = useState(1);
  const [painLevel, setPainLevel] = useState(1);
  const [blurLevel, setBlurLevel] = useState(1);
  const [examNotes, setExamNotes] = useState("");
  const [entries, setEntries] = useState<MedicalEntry[]>([]);

  const handleSubmit = () => {
    const entry: MedicalEntry = {
      timestamp,
      dryness,
      pain: painLevel,
      blur: blurLevel,
      examNotes,
      id: Date.now(),
    };
    setEntries(prev => [entry, ...prev]);
    setExamNotes("");
  };

  const sliderClass = "w-full accent-cyan";
  const labelClass = "font-mono text-xs text-muted-foreground tracking-wider uppercase mb-1.5 flex items-center gap-2";

  return (
    <DashboardPanel title="Medical Log" titleCn="医疗日志" tag="11 · Log 日志" tagColor="magenta">
      <p className="text-muted-foreground text-sm font-mono mb-4">
        Record subjective feelings and exam results with timestamps for longitudinal tracking.
        <br />记录主观感受和检查结果，附带时间戳以进行纵向追踪。
      </p>

      <div className="space-y-4 mb-5">
        {/* Session Timestamp */}
        <div>
          <label className={labelClass}>
            <Clock className="w-3.5 h-3.5" /> Session Timestamp 会话时间戳
          </label>
          <input
            type="datetime-local"
            value={timestamp}
            onChange={e => setTimestamp(e.target.value)}
            className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-foreground font-mono text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Subjective Feelings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Dryness 干涩感 <span className="text-primary">{dryness}/10</span></label>
            <input type="range" min={1} max={10} value={dryness} onChange={e => setDryness(Number(e.target.value))} className={sliderClass} />
          </div>
          <div>
            <label className={labelClass}>Pain Level 疼痛度 <span className="text-primary">{painLevel}/10</span></label>
            <input type="range" min={1} max={10} value={painLevel} onChange={e => setPainLevel(Number(e.target.value))} className={sliderClass} />
          </div>
          <div>
            <label className={labelClass}>Blurriness 模糊度 <span className="text-primary">{blurLevel}/10</span></label>
            <input type="range" min={1} max={10} value={blurLevel} onChange={e => setBlurLevel(Number(e.target.value))} className={sliderClass} />
          </div>
        </div>

        {/* Medical Exam Notes */}
        <div>
          <label className={labelClass}>
            <ClipboardPlus className="w-3.5 h-3.5" /> Medical Exam Results / Notes 检查结果/备注
          </label>
          <textarea
            value={examNotes}
            onChange={e => setExamNotes(e.target.value)}
            placeholder="IOP reading, visual acuity, fundus notes... / 眼压读数，视力，眼底检查记录..."
            rows={3}
            className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-foreground font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-3 rounded-lg font-mono text-sm tracking-wider uppercase border border-magenta/50 bg-magenta/10 text-magenta hover:bg-magenta/20 transition-all"
      >
        Save Medical Log Entry 保存医疗日志
      </button>

      {/* Timeline */}
      {entries.length > 0 && (
        <div className="mt-5">
          <p className="font-mono text-xs text-muted-foreground tracking-wider uppercase mb-3">TIMELINE 时间线</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {entries.map(entry => (
              <div key={entry.id} className="bg-muted/50 rounded-lg p-3 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-primary">{new Date(entry.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex gap-4 text-xs font-mono">
                  <span className="text-muted-foreground">Dry: <span className="text-foreground">{entry.dryness}</span></span>
                  <span className="text-muted-foreground">Pain: <span className="text-foreground">{entry.pain}</span></span>
                  <span className="text-muted-foreground">Blur: <span className="text-foreground">{entry.blur}</span></span>
                </div>
                {entry.examNotes && (
                  <p className="font-mono text-[10px] text-muted-foreground mt-2 break-words">{entry.examNotes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardPanel>
  );
}
