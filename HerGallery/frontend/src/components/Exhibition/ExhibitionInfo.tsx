import { Exhibition } from '@/config/contract';
import { formatDate } from '@/lib/format';
import DisplayName from '@/components/ui/DisplayName';

interface Props {
  exhibition: Exhibition;
  totalRecommends: number;
}

const ExhibitionInfo = ({ exhibition, totalRecommends }: Props) => (
  <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
    <h3 className="text-sm font-semibold text-foreground">展厅信息</h3>

    <div className="space-y-4 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">策展人</span>
        <DisplayName address={exhibition.curator} className="text-foreground" />
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">创建时间</span>
        <span className="text-foreground">{formatDate(exhibition.createdAt)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">投稿总数</span>
        <span className="font-semibold text-primary">{exhibition.submissionCount}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">总推荐数</span>
        <span className="font-semibold text-primary">{totalRecommends}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">状态</span>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            exhibition.isActive
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {exhibition.isActive ? '活跃' : '已关闭'}
        </span>
      </div>
    </div>
  </div>
);

export default ExhibitionInfo;
