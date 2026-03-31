import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { Submission } from '@/config/contract';
import { useRecommend } from '@/hooks/useContract';
import DisplayName from '@/components/ui/DisplayName';
import { toast } from 'sonner';

const CONTENT_TYPES_MAP: Record<string, string> = {
  '0': '二创',
  '1': '证言',
  '2': '截图',
  '3': '链接',
};

const CONTENT_ICONS_MAP: Record<string, string> = {
  '0': '🎨',
  '1': '💬',
  '2': '📸',
  '3': '🔗',
};

interface Props {
  submission: Submission;
  index: number;
  exhibitionId: number;
  isActive: boolean;
  onViewDetail: (submission: Submission) => void;
}

const SubmissionCard = ({ submission, index, exhibitionId, isActive, onViewDetail }: Props) => {
  const { isConnected } = useAccount();
  const [isRecommending, setIsRecommending] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [count, setCount] = useState(submission.recommendCount);
  const [animating, setAnimating] = useState(false);

  const { recommend } = useRecommend(() => {
    toast.success('推荐成功！');
  });

  const contentType = CONTENT_TYPES_MAP[submission.contentType] || submission.contentType;
  const contentIcon = CONTENT_ICONS_MAP[submission.contentType] || '📌';

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isConnected) {
      toast.error('请先连接钱包');
      return;
    }
    if (hasLiked) return;

    setIsRecommending(true);
    try {
      await recommend({ exhibitionId, submissionId: submission.id });
      setHasLiked(true);
      setCount((c) => c + 1);
      setAnimating(true);
      setTimeout(() => setAnimating(false), 300);
      toast.success('交易已发送，请等待确认...');
    } catch (err: any) {
      toast.error(err.message || '推荐失败，请重试');
    } finally {
      setIsRecommending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      onClick={() => onViewDetail(submission)}
      className="group flex cursor-pointer items-start gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md hover:border-primary/20"
    >
      {/* Icon */}
      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-lg">
        {contentIcon}
      </span>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {submission.title}
          </h4>
          <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
            {contentType}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {submission.description}
        </p>
        <p className="mt-2 text-xs text-muted-foreground/70">
          <DisplayName address={submission.creator} />
        </p>
      </div>

      {/* Recommend */}
      <button
        onClick={handleLike}
        disabled={isRecommending}
        className={`flex shrink-0 flex-col items-center gap-1 rounded-lg border px-3 py-2 text-sm transition-all ${
          hasLiked
            ? 'border-primary/30 bg-primary/10 text-primary'
            : 'border-border text-muted-foreground hover:border-primary/30 hover:text-primary'
        }`}
      >
        <span className={animating ? 'animate-heartbeat' : ''}>
          {hasLiked ? '❤️' : '🤍'}
        </span>
        <span className="text-xs font-medium">{count}</span>
      </button>
    </motion.div>
  );
};

export default SubmissionCard;
