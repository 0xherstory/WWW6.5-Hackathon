import { motion, AnimatePresence } from 'framer-motion';
import { Submission } from '@/config/contract';
import DisplayName from '@/components/ui/DisplayName';
import { relativeTime } from '@/lib/format';

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
  exhibitionId: number;
  isActive: boolean;
  onClose: () => void;
}

const SubmissionDetailModal = ({ submission, onClose }: Props) => {
  const contentType = CONTENT_TYPES_MAP[submission.contentType] || submission.contentType;
  const contentIcon = CONTENT_ICONS_MAP[submission.contentType] || '📌';

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

          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-lg">
              {contentIcon}
            </span>
            <span className="text-sm font-medium text-primary">
              {contentType}
            </span>
          </div>

          <h2 className="text-xl font-bold text-foreground mb-2">{submission.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {submission.description}
          </p>

          <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
            <DisplayName address={submission.creator} />
            <span>{relativeTime(submission.createdAt)}</span>
          </div>

          <div className="mt-3 flex items-center gap-2 text-sm text-primary">
            <span>❤️</span>
            <span className="font-semibold">{submission.recommendCount} 推荐</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SubmissionDetailModal;
