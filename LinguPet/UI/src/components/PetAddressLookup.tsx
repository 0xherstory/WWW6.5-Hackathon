import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface PetAddressLookupProps {
  address: string;
  loading: boolean;
  onAddressChange: (value: string) => void;
  onSubmit: () => void;
}

const PetAddressLookup = ({ address, loading, onAddressChange, onSubmit }: PetAddressLookupProps) => {
  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Step 1 · Check wallet address</CardTitle>
        <CardDescription>
          Enter any wallet address first. We&apos;ll detect whether it already has a pet and send the user to the right flow.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="0x..."
          value={address}
          onChange={(event) => onAddressChange(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && onSubmit()}
          disabled={loading}
        />
        <Button onClick={onSubmit} className="w-full font-bold" disabled={loading}>
          {loading ? "Checking address..." : "Check address"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PetAddressLookup;