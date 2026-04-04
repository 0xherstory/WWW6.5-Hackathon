import { Exhibition } from '@/config/contract';
import DisplayName from '@/components/ui/DisplayName';

interface Props {
  exhibition: Exhibition;
  submissionCount: number;
  totalRecommends: number;
}

const TopInfoBar = ({ exhibition, submissionCount, totalRecommends }: Props) => {
  return (
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="gallery-container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-foreground truncate max-w-[200px] lg:max-w-none">
            {exhibition.title}
          </h1>
          <span className="hidden lg:inline text-muted-foreground">·</span>
          <DisplayName address={exhibition.curator} className="hidden lg:inline text-sm text-muted-foreground" />
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">{submissionCount}</span> 作品
          </span>
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">{totalRecommends}</span> 热度
          </span>
        </div>
      </div>
    </div>
  );
};

export default TopInfoBar;
