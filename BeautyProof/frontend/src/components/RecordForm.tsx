import { useState } from "react";
import { motion } from "framer-motion";
import { FilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/i18n/LanguageContext";

interface RecordFormProps {
  onSubmit: (data: {
    procedureType: string;
    productBatch: string;
    doctorId: string;
    notes: string;
  }) => void;
  status: string;
  disabled: boolean;
}

const RecordForm = ({ onSubmit, status, disabled }: RecordFormProps) => {
  const [procedureType, setProcedureType] = useState("");
  const [productBatch, setProductBatch] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [notes, setNotes] = useState("");
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ procedureType, productBatch, doctorId, notes });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
      className="bg-card rounded-xl border border-border/60 p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-5">
        <FilePlus className="w-[1.125rem] h-[1.125rem] text-primary" />
        <h2 className="text-lg font-display text-foreground tracking-tight">{t("form.title")}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="procedureType" className="text-xs font-medium text-foreground/70">
            {t("form.procedureType")}
          </Label>
          <Input
            id="procedureType"
            placeholder={t("form.procedurePlaceholder")}
            value={procedureType}
            onChange={(e) => setProcedureType(e.target.value)}
            disabled={disabled}
            className="text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="productBatch" className="text-xs font-medium text-foreground/70">
            {t("form.productBatch")}
          </Label>
          <Input
            id="productBatch"
            placeholder={t("form.batchPlaceholder")}
            value={productBatch}
            onChange={(e) => setProductBatch(e.target.value)}
            disabled={disabled}
            className="text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="doctorId" className="text-xs font-medium text-foreground/70">
            {t("form.doctorId")}
          </Label>
          <Input
            id="doctorId"
            placeholder={t("form.doctorPlaceholder")}
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            disabled={disabled}
            className="text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes" className="text-xs font-medium text-foreground/70">
            {t("form.notes")}
          </Label>
          <Textarea
            id="notes"
            placeholder={t("form.notesPlaceholder")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={disabled}
            rows={3}
            className="text-sm"
          />
        </div>

        <Button
          id="submitRecord"
          type="submit"
          className="w-full text-sm"
          disabled={disabled}
        >
          {t("form.submit")}
        </Button>

        {status && (
          <p id="txStatus" className="text-xs text-muted-foreground text-center">
            {status}
          </p>
        )}
      </form>
    </motion.div>
  );
};

export default RecordForm;
