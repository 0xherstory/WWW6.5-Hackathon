import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AVALANCHE_FUJI, CONTENT_TYPE_LABELS, Submission } from '@/config/contract';
import DisplayName from '@/components/ui/DisplayName';
import { relativeTime } from '@/lib/format';
import { getAllIPFSUrls } from '@/services/ipfs';
import { useFlagSubmission } from '@/hooks/useContract';
import { toast } from 'sonner';

interface Props {
  submission: Submission;
  exhibitionId: number;
  isActive: boolean;
  isCurator?: boolean;
  onClose: () => void;
}

interface SubmissionContent {
  text: string;
  link: string;
  imageHash: string;
}

const SubmissionDetailModal = ({ submission, isCurator, onClose }: Props) => {
  const [currentGateway, setCurrentGateway] = useState(0);
  const [isFlagging, setIsFlagging] = useState(false);

  const { flagSubmission } = useFlagSubmission(() => {
    toast.success('投稿已隐藏');
    onClose();
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

  const handleFlag = async () => {
    setIsFlagging(true);
    try {
      await flagSubmission(submission.id);
    } catch (err: any) {
      toast.error(err.message || '操作失败，请重试');
    } finally {
      setIsFlagging(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-xl"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>

          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-lg">
                {contentIcon}
              </span>
              <span className="text-sm font-medium text-primary">
                {contentType}
              </span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-foreground mb-2">{submission.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {submission.description}
          </p>
          {parsedContent.text && (
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap mb-4">
              {parsedContent.text}
            </p>
          )}
          {parsedContent.link && (
            <a
              href={parsedContent.link}
              target="_blank"
              rel="noreferrer"
              className="mb-4 inline-flex text-sm text-primary hover:underline"
            >
              打开参考链接
            </a>
          )}

          {imageUrl && (
            <div className="mt-4 rounded-xl overflow-hidden bg-muted">
              <img
                src={imageUrl}
                alt={submission.title}
                className="w-full h-auto object-contain max-h-96"
                onError={handleImageError}
              />
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
            <DisplayName address={submission.creator} />
            <span>{relativeTime(submission.createdAt)}</span>
          </div>

          <div className="mt-3 flex items-center gap-2 text-sm text-primary">
            <span>❤️</span>
            <span className="font-semibold">{submission.recommendCount} 推荐</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <a
              href={`${AVALANCHE_FUJI.blockExplorers.default.url}/address/${submission.creator}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary hover:underline"
            >
              在 Snowtrace 查看投稿人地址
            </a>
            {isCurator && (
              <button
                onClick={handleFlag}
                disabled={isFlagging}
                className="rounded-lg border border-destructive/30 px-3 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
              >
                {isFlagging ? '处理中...' : '隐藏投稿'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SubmissionDetailModal;
