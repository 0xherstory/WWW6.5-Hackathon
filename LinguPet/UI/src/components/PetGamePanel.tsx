import AccessoryPanel from "@/components/AccessoryPanel";
import PetDisplay from "@/components/PetDisplay";
import ProgressBar from "@/components/ProgressBar";
import StreakBadge from "@/components/StreakBadge";
import WordQuiz from "@/components/WordQuiz";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import type { LanguageOption } from "@/lib/gameData";
import { XP_ADULT } from "@/lib/gameData";
import type { PetState } from "@/hooks/usePetState";

interface PetGamePanelProps {
  pet: PetState;
  stage: number;
  loading: boolean;
  address: string;
  walletLabel: string | null;
  isOwnerWallet: boolean;
  studyMinutes: string;
  activeLanguage: string;
  languageOptions: LanguageOption[];
  onBack: () => void;
  onConnectWallet: () => void;
  onStudyMinutesChange: (value: string) => void;
  onSelectLanguage: (language: string) => void;
  onLogStudy: () => void;
  onFeed: () => void;
  onPlay: () => void;
  onQuizAnswer: (correct: boolean) => void;
  onEquipAccessory: (id: string | null) => void;
  onMint: () => void;
}

const PetGamePanel = ({
  pet,
  stage,
  loading,
  address,
  walletLabel,
  isOwnerWallet,
  studyMinutes,
  activeLanguage,
  languageOptions,
  onBack,
  onConnectWallet,
  onStudyMinutesChange,
  onSelectLanguage,
  onLogStudy,
  onFeed,
  onPlay,
  onQuizAnswer,
  onEquipAccessory,
  onMint,
}: PetGamePanelProps) => {
  return (
    <>
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Current pet address</p>
          <p className="font-semibold break-all">{address}</p>
          <p className="mt-1 text-sm text-muted-foreground">On-chain language: {pet.language || "Not set"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {walletLabel ? (
            <span className="rounded-full border border-border px-3 py-2 text-sm font-medium">
              {isOwnerWallet ? `Owner wallet: ${walletLabel}` : `Connected wallet: ${walletLabel}`}
            </span>
          ) : (
            <Button onClick={onConnectWallet} variant="outline" disabled={loading}>
              Connect owner wallet
            </Button>
          )}
          <Button onClick={onBack} variant="outline" disabled={loading}>
            Change address
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Choose language area</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {languageOptions.map((language) => (
            <Button
              key={language.value}
              type="button"
              variant={activeLanguage === language.value ? "default" : "outline"}
              onClick={() => onSelectLanguage(language.value)}
              disabled={loading}
            >
              {language.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      {!isOwnerWallet && (
        <p className="text-sm text-muted-foreground">
          You can browse this pet now. To log study time or mint the NFT, connect the same wallet as the address above.
        </p>
      )}

      <StreakBadge streak={pet.streak} dailyProgress={pet.dailyProgress} dailyGoal={pet.dailyGoal} />

      <div className="grid gap-6 md:grid-cols-2 md:items-start">
        <div className="flex flex-col items-center gap-4">
          <PetDisplay
            stage={stage}
            equippedAccessory={pet.equippedAccessory}
            happiness={pet.happiness}
            hunger={pet.hunger}
          />
          <ProgressBar xp={pet.xp} />
          <AccessoryPanel
            xp={pet.xp}
            unlockedIds={pet.unlockedAccessories}
            equippedId={pet.equippedAccessory}
            onEquip={onEquipAccessory}
          />
        </div>

        <div className="space-y-4">
          <Tabs defaultValue="study" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="study">📖 Study</TabsTrigger>
              <TabsTrigger value="interact">🎮 Play</TabsTrigger>
              <TabsTrigger value="quiz">🧠 Quiz</TabsTrigger>
            </TabsList>

            <TabsContent value="study" className="mt-4 space-y-4">
              <Card>
                <CardContent className="space-y-1 pt-5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Area</span>
                    <span className="font-bold">{activeLanguage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Study</span>
                    <span className="font-bold">{pet.totalMinutes} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">XP</span>
                    <span className="font-bold text-primary">{pet.xp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stage</span>
                    <span className="font-bold">{["🥚 Egg", "🦊 Baby", "🧣 Teenager", "🎓 Adult"][stage]}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📖 Log Study Session</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    type="number"
                    placeholder="Minutes studied (max 120)"
                    value={studyMinutes}
                    onChange={(event) => onStudyMinutesChange(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && onLogStudy()}
                    disabled={loading}
                  />
                  <Button onClick={onLogStudy} variant="secondary" className="w-full font-bold" disabled={loading}>
                    {loading ? "Logging..." : "Log Study ✏️"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-5">
                  <Button
                    onClick={onMint}
                    disabled={pet.minted || stage < 3 || loading}
                    className="w-full font-bold"
                    variant={pet.minted ? "outline" : "default"}
                  >
                    {pet.minted
                      ? "✅ NFT Minted!"
                      : stage < 3
                        ? `🔒 Reach Adult to Mint (${pet.xp}/${XP_ADULT} XP)`
                        : "🎨 Mint Pet NFT"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="interact" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🎮 Interact with Your Pet</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={onFeed} variant="outline" className="h-auto flex-col gap-1 py-4 font-bold">
                      <span className="text-2xl">🍖</span>
                      <span>Feed</span>
                      <span className="text-[10px] font-normal text-muted-foreground">+20 hunger</span>
                    </Button>
                    <Button onClick={onPlay} variant="outline" className="h-auto flex-col gap-1 py-4 font-bold">
                      <span className="text-2xl">🎾</span>
                      <span>Play</span>
                      <span className="text-[10px] font-normal text-muted-foreground">+15 happiness</span>
                    </Button>
                  </div>
                  <div className="pt-2 text-center text-xs text-muted-foreground">
                    <p>💡 Studying also boosts happiness!</p>
                    <p>⚠️ Hunger decreases over time — keep feeding!</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quiz" className="mt-4">
              <WordQuiz language={activeLanguage} onAnswer={onQuizAnswer} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default PetGamePanel;