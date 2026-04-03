import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Globe, Check, ChevronsUpDown } from "lucide-react";
import { type Locale, localeLabels } from "@/i18n/translations";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

const locales: Locale[] = ["en", "zh", "zh-HK", "zh-TW", "ja", "ko", "th", "fr", "it", "fi", "sv", "nl", "es", "cs", "ru", "pt-BR", "ar", "ms"];

const LanguageSelector = () => {
  const { locale, setLocale } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);

  return (
    <Tooltip>
      <Popover open={langOpen} onOpenChange={setLangOpen}>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button className="inline-flex items-center gap-1 text-xs font-medium h-8 px-2 rounded-md border border-border/50 bg-transparent hover:bg-accent transition-colors">
              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="max-w-[4.5rem] truncate">{localeLabels[locale]}</span>
              <ChevronsUpDown className="w-3 h-3 text-muted-foreground" />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <PopoverContent className="w-48 p-0" align="end">
          <Command>
            <CommandInput placeholder="Search..." className="h-8 text-xs" />
            <CommandList className="max-h-52">
              <CommandEmpty className="text-xs py-4 text-center">No language found.</CommandEmpty>
              {locales.map((l) => (
                <CommandItem
                  key={l}
                  value={`${l} ${localeLabels[l]}`}
                  onSelect={() => {
                    setLocale(l);
                    setLangOpen(false);
                  }}
                  className="text-xs cursor-pointer"
                >
                  <Check className={cn("w-3.5 h-3.5 me-1.5", locale === l ? "opacity-100" : "opacity-0")} />
                  {localeLabels[l]}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {!langOpen && (
        <TooltipContent side="bottom" className="text-xs">
          Change language
        </TooltipContent>
      )}
    </Tooltip>
  );
};

export default LanguageSelector;
