import { ACCESSORIES, type Accessory } from "@/lib/gameData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AccessoryPanelProps {
  xp: number;
  unlockedIds: string[];
  equippedId: string | null;
  onEquip: (id: string | null) => void;
}

const AccessoryPanel = ({ xp, unlockedIds, equippedId, onEquip }: AccessoryPanelProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">🎒 Accessories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2">
          {ACCESSORIES.map((acc) => {
            const unlocked = unlockedIds.includes(acc.id);
            const equipped = equippedId === acc.id;
            return (
              <button
                key={acc.id}
                onClick={() => unlocked && onEquip(equipped ? null : acc.id)}
                className={`relative flex flex-col items-center p-2 rounded-lg transition-all text-xs
                  ${unlocked
                    ? equipped
                      ? "bg-primary/20 ring-2 ring-primary"
                      : "bg-card hover:bg-muted cursor-pointer"
                    : "opacity-40 cursor-not-allowed grayscale"
                  }`}
                title={unlocked ? acc.name : `Unlock at ${acc.requiredXp} XP`}
                disabled={!unlocked}
              >
                <img
                  src={acc.image}
                  alt={acc.name}
                  className="w-10 h-10 object-contain"
                  loading="lazy"
                  width={512}
                  height={512}
                />
                <span className="mt-1 font-semibold truncate w-full text-center">
                  {unlocked ? acc.emoji : "🔒"}
                </span>
                {!unlocked && (
                  <span className="text-[9px] text-muted-foreground">{acc.requiredXp}XP</span>
                )}
              </button>
            );
          })}
        </div>
        {equippedId && (
          <p className="text-xs text-center text-muted-foreground mt-2">
            Wearing: {ACCESSORIES.find((a) => a.id === equippedId)?.name}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AccessoryPanel;
