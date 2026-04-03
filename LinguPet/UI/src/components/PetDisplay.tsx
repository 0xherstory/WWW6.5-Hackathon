import eggImg from "@/assets/pets/fox/egg.png";
import babyImg from "@/assets/pets/fox/baby.png";
import teenagerImg from "@/assets/pets/fox/teenager.png";
import adultImg from "@/assets/pets/fox/adult.png";
import backgroundImg from "@/assets/background.jpg";
import { ACCESSORIES } from "@/lib/gameData";

interface PetDisplayProps {
  stage: number;
  equippedAccessory: string | null;
  happiness: number;
  hunger: number;
}

const petImages = [eggImg, babyImg, teenagerImg, adultImg];
const stageLabels = ["🥚 Egg", "🦊 Baby", "🧣 Teenager", "🎓 Adult"];

const getMoodEmoji = (happiness: number, hunger: number) => {
  if (hunger < 20) return "😫";
  if (happiness > 80) return "😄";
  if (happiness > 50) return "😊";
  if (happiness > 25) return "😐";
  return "😢";
};

const PetDisplay = ({ stage, equippedAccessory, happiness, hunger }: PetDisplayProps) => {
  const accessory = ACCESSORIES.find((a) => a.id === equippedAccessory);

  return (
    <div className="relative w-full max-w-[400px] aspect-square rounded-2xl overflow-hidden shadow-xl">
      <img
        src={backgroundImg}
        alt="Meadow background"
        className="absolute inset-0 w-full h-full object-cover"
        width={800}
        height={800}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="relative">
          <img
            src={petImages[stage]}
            alt={`Fox - ${stageLabels[stage]}`}
            className="w-48 h-48 object-contain animate-breathe drop-shadow-lg"
            width={512}
            height={512}
          />
          {accessory && (
            <img
              src={accessory.image}
              alt={accessory.name}
              className="absolute -top-4 -right-4 w-16 h-16 object-contain animate-float drop-shadow-md"
              loading="lazy"
              width={512}
              height={512}
            />
          )}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-card/80 backdrop-blur-sm text-sm font-bold text-foreground">
            {stageLabels[stage]}
          </span>
          <span className="text-2xl" title={`Mood: ${happiness}%`}>
            {getMoodEmoji(happiness, hunger)}
          </span>
        </div>

        {/* Mood bars */}
        <div className="mt-2 flex gap-3 px-4 py-2 rounded-xl bg-card/70 backdrop-blur-sm">
          <div className="flex items-center gap-1 text-xs">
            <span>🍖</span>
            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${hunger}%`,
                  backgroundColor: hunger > 50 ? "hsl(var(--secondary))" : hunger > 20 ? "hsl(var(--primary))" : "hsl(var(--destructive))",
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span>💛</span>
            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${happiness}%`,
                  backgroundColor: happiness > 50 ? "hsl(var(--secondary))" : happiness > 20 ? "hsl(var(--primary))" : "hsl(var(--destructive))",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDisplay;
