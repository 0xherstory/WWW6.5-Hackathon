import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";
import type { Contract } from "ethers";

interface CatRegistrationFormProps {
  onRegistered: () => void;
  contract: Contract | null;
  account: string | null;
}

const CatRegistrationForm = ({ onRegistered, contract, account }: CatRegistrationFormProps) => {
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [isNeutered, setIsNeutered] = useState("false");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [neuteredAt, setNeuteredAt] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!gender || !city || !photoFile) {
      toast({ title: "请填写所有必填项", variant: "destructive" });
      return;
    }

    if (!contract || !account) {
      toast({ title: "请先连接钱包", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      // 1. Register on blockchain first
      const genderCode = gender === "male" ? 0 : 1;
      const neutered = isNeutered === "true";
      const tx = await contract.registerCat(genderCode, neutered);
      await tx.wait();

      // Get the on-chain cat ID from totalCats
      const totalCats = await contract.totalCats();
      const catId = Number(totalCats);

      // 2. Upload cat photo to storage
      const photoExt = photoFile.name.split(".").pop();
      const photoPath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${photoExt}`;
      const { error: photoError } = await supabase.storage.from("cat-photos").upload(photoPath, photoFile);
      if (photoError) throw photoError;
      const { data: photoUrlData } = supabase.storage.from("cat-photos").getPublicUrl(photoPath);

      // 3. Upload proof if provided
      let proofUrl: string | null = null;
      if (proofFile && neutered) {
        const proofExt = proofFile.name.split(".").pop();
        const proofPath = `${Date.now()}-proof-${Math.random().toString(36).slice(2)}.${proofExt}`;
        const { error: proofError } = await supabase.storage.from("neutered-proofs").upload(proofPath, proofFile);
        if (proofError) throw proofError;
        const { data: proofUrlData } = supabase.storage.from("neutered-proofs").getPublicUrl(proofPath);
        proofUrl = proofUrlData.publicUrl;
      }

      // 4. Save extra info to database (blockchain as primary, DB as auxiliary)
      const { error: insertError } = await supabase.from("cats").insert({
        cat_id: String(catId),
        gender,
        city: city.trim(),
        is_neutered: neutered,
        photo_url: photoUrlData.publicUrl,
        neutered_at: neutered && neuteredAt ? new Date(neuteredAt).toISOString() : null,
        neutered_proof_url: proofUrl,
      });
      if (insertError) throw insertError;

      toast({ title: "猫咪登记成功！🎉", description: `链上 ID: ${catId}` });
      setGender("");
      setCity("");
      setIsNeutered("false");
      setPhotoFile(null);
      setNeuteredAt("");
      setProofFile(null);
      onRegistered();
    } catch (err: any) {
      const msg = err?.reason || err?.message || "未知错误";
      toast({ title: "登记失败", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {!account && (
        <p className="text-xs text-destructive bg-destructive/10 rounded-md p-2">⚠️ 请先连接钱包才能登记猫咪</p>
      )}
      <div>
        <Label className="text-xs">性别 *</Label>
        <Select value={gender} onValueChange={setGender}>
          <SelectTrigger className="mt-1"><SelectValue placeholder="选择性别" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="female">♀ 母</SelectItem>
            <SelectItem value="male">♂ 公</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">城市 *</Label>
        <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="例如：北京" className="mt-1" />
      </div>
      <div>
        <Label className="text-xs">绝育情况 *</Label>
        <Select value={isNeutered} onValueChange={setIsNeutered}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="false">未绝育</SelectItem>
            <SelectItem value="true">已绝育</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">猫咪照片 *</Label>
        <Input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} className="mt-1" />
      </div>
      {isNeutered === "true" && (
        <>
          <div>
            <Label className="text-xs">绝育时间（选填）</Label>
            <Input type="date" value={neuteredAt} onChange={(e) => setNeuteredAt(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">绝育证明（选填）</Label>
            <Input type="file" accept="image/*" onChange={(e) => setProofFile(e.target.files?.[0] || null)} className="mt-1" />
          </div>
        </>
      )}
      <Button type="submit" disabled={submitting || !account} className="w-full">
        <PlusCircle className="w-4 h-4 mr-2" />
        {submitting ? "链上登记中..." : "登记猫咪"}
      </Button>
    </form>
  );
};

export default CatRegistrationForm;
