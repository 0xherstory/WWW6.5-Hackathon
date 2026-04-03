import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/i18n/LanguageContext";

interface QueryResult {
  procedureType?: string;
  productBatch?: string;
  doctorId?: string;
  notes?: string;
  timestamp?: string;
  patient?: string;
}

interface QuerySectionProps {
  onQuery: (index: string) => void;
  result: QueryResult | null;
  disabled: boolean;
}

const resultKeyMap: Record<string, string> = {
  procedureType: "result.procedureType",
  productBatch: "result.productBatch",
  doctorId: "result.doctorId",
  notes: "result.notes",
  timestamp: "result.timestamp",
  patient: "result.patient",
};

const QuerySection = ({ onQuery, result, disabled }: QuerySectionProps) => {
  const [index, setIndex] = useState("");
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
      className="bg-card rounded-xl border border-border/60 p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-5">
        <Search className="w-[1.125rem] h-[1.125rem] text-primary" />
        <h2 className="text-lg font-display text-foreground tracking-tight">{t("query.title")}</h2>
      </div>

      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="recordIndex" className="text-xs font-medium text-foreground/70">
              {t("query.indexLabel")}
            </Label>
            <Input
              id="recordIndex"
              type="number"
              placeholder="0"
              value={index}
              onChange={(e) => setIndex(e.target.value)}
              disabled={disabled}
              className="text-sm"
            />
          </div>
          <div className="flex items-end">
            <Button
              id="queryRecord"
              onClick={() => onQuery(index)}
              disabled={disabled}
              variant="secondary"
              className="text-sm"
            >
              {t("query.button")}
            </Button>
          </div>
        </div>

        {result && (
          <div id="queryResult" className="bg-muted/50 rounded-lg p-4 space-y-2">
            {Object.entries(result).map(([key, value]) => (
              <div key={key} className="flex justify-between text-[0.8125rem]">
                <span className="text-muted-foreground">
                  {t(resultKeyMap[key] || key)}
                </span>
                <span className="text-foreground font-medium text-end max-w-[60%] break-all">
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default QuerySection;
