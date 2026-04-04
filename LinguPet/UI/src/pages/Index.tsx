import { useState } from "react";
import { toast } from "sonner";
import PetAddressLookup from "@/components/PetAddressLookup";
import PetCreationPanel from "@/components/PetCreationPanel";
import PetGamePanel from "@/components/PetGamePanel";
import { usePetState } from "@/hooks/usePetState";
import { getLanguageOptions, SUPPORTED_LANGUAGES } from "@/lib/gameData";

type FlowStep = "lookup" | "create" | "pet";

const getErrorMessage = (error: unknown) =>
  error instanceof Error && error.message ? error.message : "Something went wrong";

const Index = () => {
  const {
    pet, wallet, ownerAddress, isOwnerWallet, stage, loading,
    inspectAddress, connectWallet, createPet, logStudy,
    feedPet, playWithPet, quizReward,
    equipAccessory, mintNFT, resetPetFlow,
  } = usePetState();

  const [step, setStep] = useState<FlowStep>("lookup");
  const [addressInput, setAddressInput] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(SUPPORTED_LANGUAGES[0].value);
  const [activeLanguage, setActiveLanguage] = useState(SUPPORTED_LANGUAGES[0].value);
  const [studyMinutes, setStudyMinutes] = useState("");

  const handleCheckAddress = async () => {
    try {
      const result = await inspectAddress(addressInput.trim());

      if (result.status === "new") {
        setSelectedLanguage(SUPPORTED_LANGUAGES[0].value);
        setStep("create");
        toast.success("New address detected — ready to create a pet.");
        return;
      }

      const defaultLanguage = getLanguageOptions(result.pet.language)[0]?.value ?? result.pet.language;
      setActiveLanguage(defaultLanguage);
      setStep("pet");
      toast.success("Existing pet loaded.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleConnectOwnerWallet = async () => {
    try {
      const addr = await connectWallet(ownerAddress ?? undefined);
      toast.success(`Wallet connected: ${addr}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleCreate = async () => {
    try {
      toast.info("Creating pet... please wait");
      await createPet(selectedLanguage);
      setActiveLanguage(selectedLanguage);
      setStep("pet");
      toast.success("Pet created! 🦊");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleLogStudy = async () => {
    const mins = parseInt(studyMinutes);
    if (!mins || mins <= 0) return toast.error("Enter valid minutes");
    if (mins > 120) return toast.error("Max 120 minutes per session");

    try {
      toast.info("Logging study... please wait");
      await logStudy(mins);
      setStudyMinutes("");
      toast.success("+" + mins * 10 + " XP earned!");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleFeed = () => {
    if (pet.hunger >= 95) return toast.info("Already full! 🍖");
    feedPet();
    toast.success("Yummy! 🍖 +20 hunger");
  };

  const handlePlay = () => {
    playWithPet();
    toast.success("So fun! 🎾 +15 happiness");
  };

  const handleMint = async () => {
    if (pet.minted) return toast.error("Already minted!");
    try {
      toast.info("Minting NFT... please wait");
      await mintNFT();
      toast.success("🎨 NFT Minted! Check your wallet.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleReset = () => {
    resetPetFlow();
    setStep("lookup");
    setStudyMinutes("");
  };

  const languageOptions = getLanguageOptions(pet.language);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">
            🦊 Lingu<span className="text-primary">Pet</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Check any wallet address first, then create a new pet or jump straight into an existing one.
          </p>
        </div>

        {step === "lookup" && (
          <PetAddressLookup
            address={addressInput}
            loading={loading}
            onAddressChange={setAddressInput}
            onSubmit={handleCheckAddress}
          />
        )}

        {step === "create" && ownerAddress && (
          <PetCreationPanel
            address={ownerAddress}
            loading={loading}
            walletLabel={wallet}
            isOwnerWallet={isOwnerWallet}
            selectedLanguage={selectedLanguage}
            languageOptions={SUPPORTED_LANGUAGES}
            onBack={handleReset}
            onConnectWallet={handleConnectOwnerWallet}
            onCreatePet={handleCreate}
            onSelectLanguage={setSelectedLanguage}
          />
        )}

        {step === "pet" && ownerAddress && pet.created && (
          <PetGamePanel
            pet={pet}
            stage={stage}
            loading={loading}
            address={ownerAddress}
            walletLabel={wallet}
            isOwnerWallet={isOwnerWallet}
            studyMinutes={studyMinutes}
            activeLanguage={activeLanguage}
            languageOptions={languageOptions}
            onBack={handleReset}
            onConnectWallet={handleConnectOwnerWallet}
            onStudyMinutesChange={setStudyMinutes}
            onSelectLanguage={setActiveLanguage}
            onLogStudy={handleLogStudy}
            onFeed={handleFeed}
            onPlay={handlePlay}
            onQuizAnswer={(correct) => {
              quizReward(correct);
              if (correct) {
                toast.success("Correct! 🎉 +25 XP");
              } else {
                toast.info("Keep trying! +5 XP");
              }
            }}
            onEquipAccessory={equipAccessory}
            onMint={handleMint}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
