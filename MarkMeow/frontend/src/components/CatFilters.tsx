import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface CatFiltersProps {
  gender: string;
  city: string;
  neutered: string;
  onGenderChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onNeuteredChange: (v: string) => void;
}

const CatFilters = ({ gender, city, neutered, onGenderChange, onCityChange, onNeuteredChange }: CatFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-3 items-center px-4 py-4 bg-card rounded-lg border border-border shadow-sm">
      <Search className="w-4 h-4 text-muted-foreground" />
      <Select value={gender} onValueChange={onGenderChange}>
        <SelectTrigger className="w-[120px]"><SelectValue placeholder="性别" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部性别</SelectItem>
          <SelectItem value="female">♀ 母</SelectItem>
          <SelectItem value="male">♂ 公</SelectItem>
        </SelectContent>
      </Select>

      <Input
        value={city}
        onChange={(e) => onCityChange(e.target.value)}
        placeholder="搜索城市..."
        className="w-[150px]"
      />

      <Select value={neutered} onValueChange={onNeuteredChange}>
        <SelectTrigger className="w-[130px]"><SelectValue placeholder="绝育情况" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部</SelectItem>
          <SelectItem value="true">已绝育</SelectItem>
          <SelectItem value="false">未绝育</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CatFilters;
