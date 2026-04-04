import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { CONTENT_TYPE_LABELS, Submission } from '@/config/contract';
import { useRecommend, useHasRecommended, useHasWitnessed, useWitness } from '@/hooks/useContract';
import { getAllIPFSUrls, getFromIPFS } from '@/services/ipfs';
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

const SubmissionCard = ({ submission, index, exhibitionId, isActive, onViewDetail }: Props) => {
  const { address, isConnected } = useAccount();
  const { triggerMilestone } = usePOAP();
  const [isRecommending, setIsRecommending] = useState(false);
  const [isWitnessing, setIsWitnessing] = useState(false);
  const [localHasLiked, setLocalHasLiked] = useState(false);
  const [localHasWitnessed, setLocalHasWitnessed] = useState(false);
  const [count, setCount] = useState(submission.recommendCount);
  const [witnessCount, setWitnessCount] = useState(submission.witnessCount);
  const [animating, setAnimating] = useState(false);
  const [currentGateway, setCurrentGateway] = useState(0);
  const [imageHash, setImageHash] = useState('');

  const { data: hasRecommendedFromChain } = useHasRecommended(submission.id, address || '');
  const { data: hasWitnessedFromChain } = useHasWitnessed(submission.id, address || '');
  const hasLiked = hasRecommendedFromChain || localHasLiked;
  const hasWitnessed = hasWitnessedFromChain || localHasWitnessed;

  const { recommend } = useRecommend(() => {
    toast.success('推荐成功！');
  });
  const { witness } = useWitness(() => {
    toast.success('见证成功！');
  });

  const contentType = CONTENT_TYPE_LABELS[submission.contentType] || submission.contentType;
  const contentIcon = submission.contentType === 'creation' ? '🎨' : '🧾';
  const ipfsUrls = imageHash ? getAllIPFSUrls(imageHash) : [];
  const imageUrl = ipfsUrls[currentGateway] || null;

  useEffect(() => {
    let cancelled = false;

    getFromIPFS(submission.contentHash)
      .then((payload) => {
        if (!cancelled) {
          setImageHash(payload.imageHash || '');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setImageHash('');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [submission.contentHash]);

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
      toast.error(err.message || '推荐失败，请重试');
    } finally {
      setIsRecommending(false);
    }
  };

  const handleWitness = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isConnected) {
      toast.error('请先连接钱包');
      return;
    }
    if (hasWitnessed) return;

    setIsWitnessing(true);
    try {
      await witness(submission.id);
      setLocalHasWitnessed(true);
      setWitnessCount((current) => current + 1);
      toast.success('交易已发送，请等待确认...');
    } catch (err: any) {
      toast.error(err.message || '见证失败，请重试');
    } finally {
      setIsWitnessing(false);
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
          onClick={handleWitness}
          disabled={isWitnessing}
          className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition-all ${
            hasWitnessed
              ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
              : 'border-border text-muted-foreground hover:border-emerald-300 hover:text-emerald-600'
          }`}
        >
          <span className="font-medium">{hasWitnessed ? '已见证' : '我要见证'}</span>
          <span className="text-xs font-semibold">{witnessCount}</span>
        </button>

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
            {hasLiked ? '已推荐' : '我要推荐'}
          </span>
          <span className="text-xs font-semibold">{count}</span>
        </button>
      </div>
    </motion.div>
  );
};

export default SubmissionCard;
