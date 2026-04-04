import { useState, useRef } from "react";
import { Plus, Trash2, Upload, Play, Square, Volume2, Users, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadContacts, saveContacts, type EmergencyContact } from "@/lib/emergencyContacts";

interface SettingsPageProps {
  customAudioUrl: string | null;
  onSaveAudio: (dataUrl: string | null) => void;
}

export default function SettingsPage({ customAudioUrl, onSaveAudio }: SettingsPageProps) {
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => loadContacts());
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Contacts ---
  const handleAddContact = () => {
    const name = newName.trim();
    const email = newEmail.trim();
    if (!name || !email) return;
    const updated = [...contacts, { name, email }];
    setContacts(updated);
    saveContacts(updated);
    setNewName("");
    setNewEmail("");
  };

  const handleRemoveContact = (idx: number) => {
    const updated = contacts.filter((_, i) => i !== idx);
    setContacts(updated);
    saveContacts(updated);
  };

  // --- Audio ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("文件过大，请选择小于 5MB 的音频文件");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => onSaveAudio(ev.target?.result as string);
    reader.readAsDataURL(file);
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

  const handleRemoveAudio = () => {
    if (audioRef.current) { audioRef.current.pause(); setIsPlaying(false); }
    onSaveAudio(null);
    setFileName(null);
  };

  return (
    <div className="flex flex-col gap-4 px-4 py-2">
      {/* Emergency Contacts */}
      <section className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold text-foreground">紧急联系人</span>
        </div>

        {contacts.map((c, i) => (
          <div key={i} className="mb-2 flex items-center gap-2">
            <span className="flex-1 truncate text-xs text-foreground">{c.name}：{c.email}</span>
            <Button variant="ghost" size="sm" onClick={() => handleRemoveContact(i)} className="text-destructive hover:text-destructive h-7 w-7 p-0">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}

        <div className="mt-2 flex flex-col gap-2">
          <Input placeholder="姓名" value={newName} onChange={(e) => setNewName(e.target.value)} className="h-9 text-sm" />
          <Input placeholder="邮箱地址" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="h-9 text-sm" type="email" />
          <p className="text-[10px] text-muted-foreground/60">请输入紧急联系人的邮箱地址，SOS 时会自动发送求救邮件到这个邮箱。</p>
          <Button variant="outline" size="sm" onClick={handleAddContact} className="w-full gap-1.5">
            <Plus className="h-3.5 w-3.5" /> 添加联系人
          </Button>
        </div>
      </section>

      {/* Deterrent Audio */}
      <section className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold text-foreground">威慑语音</span>
        </div>

        {customAudioUrl ? (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreview} className="gap-1.5">
              {isPlaying ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {isPlaying ? "停止" : "试听"}
            </Button>
            <span className="flex-1 truncate text-xs text-muted-foreground">{fileName || "已上传音频"}</span>
            <Button variant="ghost" size="sm" onClick={handleRemoveAudio} className="text-destructive hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">上传自定义威慑音频（MP3/WAV，≤5MB）</p>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="w-full gap-2">
              <Upload className="h-3.5 w-3.5" /> 上传音频文件
            </Button>
          </div>
        )}
        <p className="mt-2 text-[10px] text-muted-foreground/60">一个钱包只能保存一段音频。删除后可上传新的。未上传时将使用系统语音合成。</p>
        <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleFileChange} />
      </section>

      {/* About */}
      <section className="rounded-lg border border-border bg-card p-4">
        <div className="mb-2 flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold text-foreground">关于</span>
        </div>
        <p className="text-xs text-muted-foreground">HerGuard v1.0</p>
        <p className="text-xs text-muted-foreground">基于 Avalanche 区块链的女性安全守护工具</p>
      </section>
    </div>
  );
}
