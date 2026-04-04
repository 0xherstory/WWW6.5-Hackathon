import { Exhibition } from '@/config/contract';
import { formatDate } from '@/lib/format';
import DisplayName from '@/components/ui/DisplayName';

interface Props {
  exhibition: Exhibition;
  totalRecommends: number;
  totalWitnesses: number;
  onClose?: () => void;
}

const ExhibitionInfoPanel = ({ exhibition, totalRecommends, totalWitnesses, onClose }: Props) => {
  return (
    <div>
      <h3 className="text-lg font-bold text-foreground mb-4">{exhibition.title}</h3>

      {exhibition.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {exhibition.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Exhibition Content */}
      {exhibition.content && (
        <div className="mb-4 p-4 rounded-lg bg-secondary/50 border border-border">
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {exhibition.content}
          </p>
        </div>
      )}

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">策展人</span>
          <DisplayName address={exhibition.curator} className="text-foreground" />
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">创建时间</span>
          <span className="text-foreground">{formatDate(exhibition.createdAt)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">作品总数</span>
          <span className="font-semibold text-primary">{exhibition.submissionCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">总推荐数</span>
          <span className="font-semibold text-primary">{totalRecommends}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">展厅热度</span>
          <span className="font-semibold text-primary">{totalWitnesses}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">赏金池</span>
          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary">
            {exhibition.tipPool / 1e18} AVAX
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">状态</span>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            exhibition.flagged ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
          }`}>
            {exhibition.flagged ? '已隐藏' : '活跃'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExhibitionInfoPanel;
