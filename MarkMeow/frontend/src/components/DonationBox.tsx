import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, CheckCircle } from "lucide-react";
import { parseEther, formatEther } from "ethers";
import type { Contract } from "ethers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DonationBoxProps {
  totalDonations: string;
  onDonated: () => void;
  contract: Contract | null;
  account: string | null;
}

const DonationBox = ({ totalDonations, onDonated, contract, account }: DonationBoxProps) => {
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [donatedAmount, setDonatedAmount] = useState("");
  const { toast } = useToast();

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast({ title: "请输入有效金额", variant: "destructive" });
      return;
    }

    if (!contract || !account) {
      toast({ title: "请先连接钱包", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const tx = await contract.donate({ value: parseEther(amount) });
      await tx.wait();

      await supabase.from("donations").insert({
        amount: numAmount,
      });

      setDonatedAmount(amount);
      setShowSuccessDialog(true);
      setAmount("");
      onDonated();
    } catch (err: any) {
      const msg = err?.reason || err?.message || "未知错误";
      toast({ title: "捐款失败", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      {!account && (
        <p className="text-xs text-destructive bg-destructive/10 rounded-md p-2">⚠️ 请先连接钱包才能捐款</p>
      )}
      <div className="bg-primary/10 rounded-lg p-3 text-center">
        <span className="text-xs text-muted-foreground">合约捐款余额</span>
        <p className="text-xl font-bold text-primary">{totalDonations} AVAX</p>
      </div>

      <form onSubmit={handleDonate} className="space-y-3">
        <div>
          <Label className="text-xs">捐款金额 (AVAX) *</Label>
          <Input
            type="number"
            step="0.001"
            min="0.001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.01"
            className="mt-1"
          />
        </div>
        <Button type="submit" disabled={submitting || !account} variant="secondary" className="w-full">
          <Heart className="w-4 h-4 mr-2" />
          {submitting ? "链上交易中..." : "捐款"}
        </Button>
      </form>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            </div>
            <DialogTitle className="text-xl">感谢您的捐款！💚</DialogTitle>
            <DialogDescription className="text-base mt-2">
              您已成功捐赠 <span className="font-bold text-primary">{donatedAmount} AVAX</span>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>您的善举将帮助更多流浪猫获得绝育服务</p>
          </div>
          <Button onClick={() => setShowSuccessDialog(false)} className="w-full mt-4">
            确定
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DonationBox;
