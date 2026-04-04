import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useTipExhibition, useWitness } from '@/hooks/useContract';

interface Props {
  exhibitionId: number;
  firstSubmissionId?: number;
  tipPool: number;
  isCurator: boolean;
  onTipSuccess?: () => void;
  onShowInfo: () => void;
  onSubmit: () => void;
}

const BottomToolbar = ({ exhibitionId, firstSubmissionId, tipPool, isCurator, onTipSuccess, onShowInfo, onSubmit }: Props) => {
  const { isConnected } = useAccount();
  const [tipAmount, setTipAmount] = useState('0.01');
  const [isTipping, setIsTipping] = useState(false);
  const [isHeating, setIsHeating] = useState(false);

  const { tipExhibition } = useTipExhibition(onTipSuccess);
  const { witness } = useWitness(onTipSuccess);

  const handleAddHeat = async () => {
    if (!isConnected) {
      toast.error('请先连接钱包');
      return;
    }
    if (!firstSubmissionId) {
      toast.error('暂无作品');
      return;
    }

    setIsHeating(true);
    try {
      await witness(firstSubmissionId);
      toast.success('热度 +1');
    } catch (err: any) {
      toast.error(err.message || '操作失败');
    } finally {
      setIsHeating(false);
    }
  };

  const handleTip = async () => {
    if (!isConnected) {
      toast.error('请先连接钱包');
      return;
    }

    setIsTipping(true);
    try {
      await tipExhibition(exhibitionId, tipAmount);
      toast.success('打赏成功');
    } catch (err: any) {
      toast.error(err.message || '打赏失败');
    } finally {
      setIsTipping(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 bg-background/90 backdrop-blur-md border-t border-border">
      <div className="gallery-container flex h-16 items-center justify-between gap-4">
        {/* Left: Curator manage button + Exhibition info */}
        <div className="flex items-center gap-2">
          {isCurator && (
            <Link
              to={`/exhibition/${exhibitionId}/manage`}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              管理投稿
            </Link>
          )}
          <button
            onClick={onShowInfo}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="hidden sm:inline">展厅信息</span>
            <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{tipPool / 1e18} AVAX</span>
          </button>
        </div>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddHeat}
            disabled={isHeating || !firstSubmissionId}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
          >
            {isHeating ? '...' : '🔥 热度'}
          </button>

          <button
            onClick={handleTip}
            disabled={isTipping}
            className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-60"
          >
            {isTipping ? '...' : '❤ 打赏'}
          </button>

          <button
            onClick={onSubmit}
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent"
          >
            我要投稿
          </button>
        </div>
      </div>
    </div>
  );
};

export default BottomToolbar;
