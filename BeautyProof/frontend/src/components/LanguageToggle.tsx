import { useLanguage } from "@/i18n/LanguageContext";
import { Globe } from "lucide-react";
import { type Locale, localeLabels } from "@/i18n/translations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const locales: Locale[] = ["en", "zh", "ja", "ko"];

const LanguageToggle = () => {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex justify-end px-4 pt-4 max-w-2xl mx-auto">
      <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
        <SelectTrigger className="w-auto gap-1.5 text-xs font-medium h-9 px-3">
          <Globe className="w-3.5 h-3.5 shrink-0" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {locales.map((l) => (
            <SelectItem key={l} value={l} className="text-xs">
              {localeLabels[l]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageToggle;
