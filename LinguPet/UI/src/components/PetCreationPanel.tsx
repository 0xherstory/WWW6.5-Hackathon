import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { LanguageOption } from "@/lib/gameData";

interface PetCreationPanelProps {
  address: string;
  loading: boolean;
  walletLabel: string | null;
  isOwnerWallet: boolean;
  selectedLanguage: string;
  languageOptions: LanguageOption[];
  onBack: () => void;
  onConnectWallet: () => void;
  onCreatePet: () => void;
  onSelectLanguage: (language: string) => void;
}

const PetCreationPanel = ({
  address,
  loading,
  walletLabel,
  isOwnerWallet,
  selectedLanguage,
  languageOptions,
  onBack,
  onConnectWallet,
  onCreatePet,
  onSelectLanguage,
}: PetCreationPanelProps) => {
  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle className="text-2xl">Step 2 · Create a pet for this address</CardTitle>
        <CardDescription>
          Target address: <span className="font-medium text-foreground">{address}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Connect the same wallet before creating</p>
            <p className="text-sm text-muted-foreground">
              The contract creates the pet for the connected wallet, so the wallet must match the address above.
            </p>
          </div>
          {walletLabel ? (
            <span className="rounded-full border border-border px-3 py-2 text-sm font-medium">
              {isOwnerWallet ? `Connected: ${walletLabel}` : `Wrong wallet: ${walletLabel}`}
            </span>
          ) : (
            <Button onClick={onConnectWallet} disabled={loading} className="font-bold">
              Connect wallet
            </Button>
          )}
        </div>

        {!isOwnerWallet && walletLabel && (
          <p className="text-sm text-destructive">
            Please switch MetaMask to the same address you entered, then reconnect.
          </p>
        )}

        <div className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Choose a language</h2>
            <p className="text-sm text-muted-foreground">Current options use the UN official languages only.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {languageOptions.map((language) => (
              <Button
                key={language.value}
                type="button"
                variant={selectedLanguage === language.value ? "default" : "outline"}
                className="h-auto justify-start py-4 text-left"
                onClick={() => onSelectLanguage(language.value)}
                disabled={loading}
              >
                <span className="flex flex-col items-start">
                  <span className="font-semibold">{language.label}</span>
                  <span className="text-xs text-muted-foreground">{language.nativeLabel}</span>
                </span>
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={onBack} variant="outline" className="sm:flex-1" disabled={loading}>
            Back
          </Button>
          <Button onClick={onCreatePet} className="font-bold sm:flex-1" disabled={loading || !isOwnerWallet}>
            {loading ? "Creating..." : `Create ${selectedLanguage} pet`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PetCreationPanel;