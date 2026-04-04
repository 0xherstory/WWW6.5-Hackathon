import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Calendar, Shield, X, Coins, AlertTriangle, CheckCircle } from "lucide-react";
import { formatEther, parseEther } from "ethers";
import type { Contract } from "ethers";

interface CatDetailModalProps {
  cat: {
    id: string;
    cat_id: string;
    gender: string;
    city: string;
    is_neutered: boolean;
    photo_url: string;
    created_at: string;
    neutered_at: string | null;
    neutered_proof_url: string | null;
  } | null;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  contract: Contract | null;
  account: string | null;
}

const CatDetailModal = ({ cat, open, onClose, onUpdated, contract, account }: CatDetailModalProps) => {
  const [neutering, setNeutering] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const [contractBalance, setContractBalance] = useState("0");
  const [rewardAmount, setRewardAmount] = useState("0");
  const [canClaimReward, setCanClaimReward] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (contract && cat && !cat.is_neutered) {
      checkContractBalance();
    }
  }, [contract, cat]);

  const checkContractBalance = async () => {
    if (!contract || !cat) return;
    try {
      const balance = await contract.getContractBalance();
      setContractBalance(formatEther(balance));

      const genderCode = cat.gender === "male" ? 0 : 1;
      const reward = await contract.calculateReward(genderCode);
      const rewardEth = formatEther(reward);
      setRewardAmount(rewardEth);

      setCanClaimReward(parseFloat(formatEther(balance)) >= parseFloat(rewardEth));
    } catch (err) {
      console.error("检查合约余额失败:", err);
    }
  };

  if (!cat) return null;

  const handleNeuter = async () => {
    if (!proofFile) {
      toast({ title: "请上传绝育证明", variant: "destructive" });
      return;
    }
    if (!contract || !account) {
      toast({ title: "请先连接钱包", variant: "destructive" });
      return;
    }

    setUploading(true);
    setShowRewardDialog(false);
    try {
      const catIdNum = parseInt(cat.cat_id, 10);

      const tx = await contract.updateNeuterStatus(catIdNum, true);
      await tx.wait();

      const fileExt = proofFile.name.split(".").pop();
      const filePath = `${cat.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("neutered-proofs").upload(filePath, proofFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("neutered-proofs").getPublicUrl(filePath);

      try {
        const proofTx = await contract.uploadNeuterProof(catIdNum, urlData.publicUrl);
        await proofTx.wait();
      } catch {
        // Non-critical, continue
      }

      const { error: updateError } = await supabase
        .from("cats")
        .update({
          is_neutered: true,
          neutered_at: new Date().toISOString(),
          neutered_proof_url: urlData.publicUrl,
        })
        .eq("id", cat.id);
      if (updateError) throw updateError;

      if (canClaimReward) {
        try {
          const withdrawTx = await contract.withdraw(parseEther(rewardAmount));
          await withdrawTx.wait();
          toast({ 
            title: "绝育状态已更新！✅", 
            description: `已成功领取奖励 ${rewardAmount} AVAX` 
          });
        } catch (withdrawErr: any) {
          toast({ 
            title: "绝育已更新，但奖励领取失败", 
            description: withdrawErr?.reason || "请稍后手动领取奖励",
            variant: "destructive"
          });
        }
      } else {
        toast({ title: "绝育状态已更新！✅" });
      }

      setNeutering(false);
      setProofFile(null);
      setShowRewardDialog(false);
      onClose();
      onUpdated();
    } catch (err: any) {
      const msg = err?.reason || err?.message || "未知错误";
      toast({ title: "更新失败", description: msg, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🐱 猫咪详情 - 链上ID #{cat.cat_id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg overflow-hidden aspect-video bg-muted">
            <img src={cat.photo_url} alt={`猫咪 ${cat.cat_id}`} className="w-full h-full object-cover" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">性别:</span>
              <span className="font-medium">{cat.gender === "male" ? "♂ 公" : "♀ 母"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">城市:</span>
              <span className="font-medium">{cat.city}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">登记时间:</span>
              <span className="font-medium">{new Date(cat.created_at).toLocaleDateString("zh-CN")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">绝育:</span>
              <span className={`font-medium ${cat.is_neutered ? "text-primary" : "text-secondary-foreground"}`}>
                {cat.is_neutered ? "已绝育" : "未绝育"}
              </span>
            </div>
          </div>

          {cat.is_neutered && cat.neutered_at && (
            <div className="text-sm text-muted-foreground">
              绝育时间: {new Date(cat.neutered_at).toLocaleDateString("zh-CN")}
            </div>
          )}

          {cat.is_neutered && cat.neutered_proof_url && (
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">绝育证明:</span>
              <img src={cat.neutered_proof_url} alt="绝育证明" className="rounded-lg max-h-48 object-contain border border-border" />
            </div>
          )}

          {!cat.is_neutered && !neutering && (
            <Button onClick={() => setNeutering(true)} className="w-full" disabled={!account}>
              {account ? "标记为已绝育（链上交易）" : "请先连接钱包"}
            </Button>
          )}

          {!cat.is_neutered && neutering && (
            <div className="space-y-3 border border-border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">上传绝育证明</span>
                <Button variant="ghost" size="icon" onClick={() => { setNeutering(false); setProofFile(null); }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div>
                <Label htmlFor="proof-upload" className="text-xs text-muted-foreground">绝育证明图片（必填）</Label>
                <Input id="proof-upload" type="file" accept="image/*" onChange={(e) => setProofFile(e.target.files?.[0] || null)} className="mt-1" />
              </div>
              <Button onClick={() => setShowRewardDialog(true)} disabled={!proofFile} className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                确认绝育
              </Button>
            </div>
          )}
        </div>
      </DialogContent>

      <Dialog open={showRewardDialog} onOpenChange={setShowRewardDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4">
              {canClaimReward ? (
                <Coins className="w-16 h-16 text-yellow-500 mx-auto" />
              ) : (
                <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto" />
              )}
            </div>
            <DialogTitle className="text-xl">
              {canClaimReward ? "确认领取绝育奖励？" : "余额不足"}
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              {canClaimReward ? (
                <>
                  您即将标记这只猫咪为已绝育，并可领取奖励：<br />
                  <span className="font-bold text-primary text-lg">{rewardAmount} AVAX</span>
                  <div className="mt-2 text-sm text-muted-foreground">
                    当前捐款箱余额: {parseFloat(contractBalance).toFixed(4)} AVAX
                  </div>
                </>
              ) : (
                <>
                  当前捐款箱余额不足，无法发放奖励。<br />
                  <div className="mt-2">
                    <span className="text-muted-foreground">所需奖励:</span>{" "}
                    <span className="font-bold text-destructive">{rewardAmount} AVAX</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-muted-foreground">当前余额:</span>{" "}
                    <span className="font-bold">{parseFloat(contractBalance).toFixed(4)} AVAX</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    您可以继续标记绝育状态，但暂时无法领取奖励。
                  </p>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowRewardDialog(false)} className="flex-1">
              取消
            </Button>
            <Button 
              onClick={handleNeuter} 
              disabled={uploading} 
              className="flex-1"
              variant={canClaimReward ? "default" : "secondary"}
            >
              {uploading ? "链上交易中..." : (canClaimReward ? "确认并领取奖励" : "继续标记绝育")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default CatDetailModal;
