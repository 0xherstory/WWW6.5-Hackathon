import { useRef, useState } from "react";
import { Upload, Trash2, Play, Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeterrentAudioPanelProps {
  customAudioUrl: string | null;
  onSaveAudio: (dataUrl: string | null) => void;
}

export default function DeterrentAudioPanel({
  customAudioUrl,
  onSaveAudio,
}: DeterrentAudioPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (max 5MB for localStorage)
    if (file.size > 5 * 1024 * 1024) {
      alert("文件过大，请选择小于 5MB 的音频文件");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      onSaveAudio(dataUrl);
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePreview = () => {
    if (!customAudioUrl) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    const audio = new Audio(customAudioUrl);
    audioRef.current = audio;
    audio.volume = 0.5;
    audio.onended = () => setIsPlaying(false);
    audio.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const handleRemove = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    onSaveAudio(null);
    setFileName(null);
  };

  return (
    <div className="mx-4 mb-4 rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Volume2 className="h-4 w-4 text-primary" />
        <span className="text-sm font-bold text-foreground">威慑音频</span>
      </div>

      {customAudioUrl ? (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
            className="gap-1.5"
          >
            {isPlaying ? (
              <Square className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            {isPlaying ? "停止" : "试听"}
          </Button>
          <span className="flex-1 truncate text-xs text-muted-foreground">
            {fileName || "已上传音频"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">
            上传自定义威慑音频（MP3/WAV，≤5MB），SOS触发时将循环播放
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="w-full gap-2"
          >
            <Upload className="h-3.5 w-3.5" />
            上传音频文件
          </Button>
          <p className="text-center text-[10px] text-muted-foreground/60">
            未上传时将使用系统语音合成
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
