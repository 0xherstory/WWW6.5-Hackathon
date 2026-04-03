import { Switch } from "@/components/ui/switch";

interface TopBarTogglesProps {
  soundOn: boolean;
  onToggleSound: () => void;
}

export default function TopBarToggles({
  soundOn,
  onToggleSound,
}: TopBarTogglesProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
        <span>{soundOn ? "📢 威慑" : "🔇 静音"}</span>
        <Switch checked={soundOn} onCheckedChange={onToggleSound} />
      </label>
    </div>
  );
}
