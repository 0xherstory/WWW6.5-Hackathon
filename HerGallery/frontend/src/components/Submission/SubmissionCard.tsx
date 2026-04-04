import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { CONTENT_TYPE_LABELS, Submission } from '@/config/contract';
import { useRecommend, useHasRecommended } from '@/hooks/useContract';
import { getAllIPFSUrls } from '@/services/ipfs';
import DisplayName from '@/components/ui/DisplayName';
import { usePOAP } from '@/context/POAPContext';
import { toast } from 'sonner';

interface Props {
  submission: Submission;
  index: number;
  exhibitionId: number;
  isActive: boolean;
  onViewDetail: (submission: Submission) => void;
}

interface SubmissionContent {
  text: string;
  link: string;
  imageHash: string;
}

const SubmissionCard = ({ submission, index, exhibitionId, isActive, onViewDetail }: Props) => {
  const { address, isConnected } = useAccount();
  const { triggerMilestone } = usePOAP();
  const [isRecommending, setIsRecommending] = useState(false);
  const [localHasLiked, setLocalHasLiked] = useState(false);
  const [count, setCount] = useState(submission.recommendCount);
  const [animating, setAnimating] = useState(false);
  const [currentGateway, setCurrentGateway] = useState(0);

  const { data: hasRecommendedFromChain } = useHasRecommended(submission.id, address || '');
  const hasLiked = hasRecommendedFromChain || localHasLiked;

  const { recommend } = useRecommend(() => {
    toast.success('托举成功！');
  });

  // Parse content from contract (stored as JSON string)
  let parsedContent: SubmissionContent = { text: '', link: '', imageHash: '' };
  try {
    parsedContent = JSON.parse(submission.content || '{}');
  } catch {}

  const contentType = CONTENT_TYPE_LABELS[submission.contentType] || submission.contentType;
  const contentIcon = submission.contentType === 'creation' ? '🎨' : '🧾';
  const ipfsUrls = parsedContent.imageHash ? getAllIPFSUrls(parsedContent.imageHash) : [];
  const imageUrl = ipfsUrls[currentGateway] || null;

  const handleImageError = () => {
    if (currentGateway < ipfsUrls.length - 1) {
      setCurrentGateway(prev => prev + 1);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isConnected) {
      toast.error('请先连接钱包');
      return;
    }
    if (hasLiked) return;

    setIsRecommending(true);
    try {
      const willHitMilestone = count + 1 >= 10 && count < 10;
      await recommend({ exhibitionId, submissionId: submission.id });
      setLocalHasLiked(true);
      setCount((c) => c + 1);
      setAnimating(true);
      setTimeout(() => setAnimating(false), 300);
      toast.success('交易已发送，请等待确认...');
      if (willHitMilestone) {
        triggerMilestone(submission.title, count + 1);
      }
    } catch (err: any) {
      toast.error(err.message || '托举失败，请重试');
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

      {/* Image Preview */}
      {imageUrl && (
        <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        </div>
      )}

      <div className="flex shrink-0 flex-col items-stretch gap-2">
        <button
          onClick={handleLike}
          disabled={isRecommending}
          className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition-all ${
            hasLiked
              ? 'border-primary/30 bg-primary/10 text-primary'
              : 'border-border text-muted-foreground hover:border-primary/30 hover:text-primary'
          }`}
        >
          <span className={`font-medium ${animating ? 'animate-heartbeat' : ''}`}>
            {hasLiked ? '已托举' : '我要托举'}
          </span>
          <span className="text-xs font-semibold">{count}</span>
        </button>
      </div>
    </motion.div>
  );
};

export default SubmissionCard;
