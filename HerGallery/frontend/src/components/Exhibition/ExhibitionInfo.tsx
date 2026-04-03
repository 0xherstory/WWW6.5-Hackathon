import { useState } from 'react';
import { useAccount } from 'wagmi';
import { AVALANCHE_FUJI, CONTRACT_ADDRESS, Exhibition } from '@/config/contract';
import { formatDate } from '@/lib/format';
import DisplayName from '@/components/ui/DisplayName';
import { useTipExhibition, useContractOwner, useFlagExhibition } from '@/hooks/useContract';
import { toast } from 'sonner';
import { buildExhibitionShareUrl, copyTextToClipboard } from '@/lib/utils';

interface Props {
  exhibition: Exhibition;
  totalRecommends: number;
  totalWitnesses: number;
  onTipSuccess?: () => void;
}

const ExhibitionInfo = ({ exhibition, totalRecommends, totalWitnesses, onTipSuccess }: Props) => {
  const { isConnected, address } = useAccount();
  const [tipAmount, setTipAmount] = useState('0.01');
  const [isTipping, setIsTipping] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isFlagging, setIsFlagging] = useState(false);

  const { data: ownerAddress } = useContractOwner();
  const isOwner = !!address && !!ownerAddress && address.toLowerCase() === (ownerAddress as string).toLowerCase();

  const { flagExhibition } = useFlagExhibition(() => {
    toast.success('展厅已隐藏');
    onTipSuccess?.(); // reuse parent refetch
  });

  const { tipExhibition } = useTipExhibition(() => {
    toast.success('已成功打赏展厅');
    onTipSuccess?.();
  });

  const handleTip = async () => {
    if (!isConnected) {
      toast.error('请先连接钱包');
      return;
    }

    setIsTipping(true);
    try {
      await tipExhibition(exhibition.id, tipAmount);
    } catch (err: any) {
      toast.error(err.message || '打赏失败，请重试');
    } finally {
      setIsTipping(false);
    }
  };

  const handleFlagExhibition = async () => {
    if (!isConnected) { toast.error('请先连接钱包'); return; }
    setIsFlagging(true);
    try {
      await flagExhibition(exhibition.id);
    } catch (err: any) {
      toast.error(err.message || '操作失败，请重试');
    } finally {
      setIsFlagging(false);
    }
  };

  const handleShare = async () => {
    setIsCopying(true);
    try {
      await copyTextToClipboard(buildExhibitionShareUrl(exhibition.id));
      toast.success('展厅链接已复制');
    } catch (err: any) {
      toast.error(err.message || '复制链接失败');
    } finally {
      setIsCopying(false);
    }
  };

  return (
  <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
    <h3 className="text-sm font-semibold text-foreground">展厅信息</h3>

    {exhibition.tags.length > 0 && (
      <div className="flex flex-wrap gap-2">
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
        <span className="text-muted-foreground">总见证数</span>
        <span className="font-semibold text-primary">{totalWitnesses}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">赏金池</span>
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary"
        >
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

    <div className="rounded-xl border border-border bg-background p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">分享展厅</p>
          <p className="mt-1 text-xs text-muted-foreground">复制链接后，其他人可直接打开当前展厅</p>
        </div>
        <button
          onClick={handleShare}
          disabled={isCopying}
          className="shrink-0 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
        >
          {isCopying ? '复制中...' : '复制链接'}
        </button>
      </div>

      <div className="mb-4 h-px bg-border" />

      <p className="text-sm font-medium text-foreground">打赏展厅</p>
      <p className="mt-1 text-xs text-muted-foreground">支持策展人继续维护和收录内容</p>
      <div className="mt-3 flex items-center gap-2">
        <input
          value={tipAmount}
          onChange={(e) => setTipAmount(e.target.value)}
          inputMode="decimal"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
          placeholder="0.01"
        />
        <button
          onClick={handleTip}
          disabled={isTipping || exhibition.flagged}
          className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent disabled:opacity-60"
        >
          {isTipping ? '处理中...' : '打赏'}
        </button>
      </div>
      <a
        href={`${AVALANCHE_FUJI.blockExplorers.default.url}/address/${CONTRACT_ADDRESS}`}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex text-xs text-primary hover:underline"
      >
        在 Snowtrace 查看合约
      </a>
    </div>

    {isOwner && !exhibition.flagged && (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
        <p className="text-xs font-medium text-destructive mb-3">管理员操作</p>
        <button
          onClick={handleFlagExhibition}
          disabled={isFlagging}
          className="w-full rounded-lg border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
        >
          {isFlagging ? '处理中...' : '隐藏此展厅'}
        </button>
      </div>
    )}
  </div>
  );
};

export default ExhibitionInfo;
