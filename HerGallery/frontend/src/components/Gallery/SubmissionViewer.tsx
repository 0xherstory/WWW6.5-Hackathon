import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Submission } from '@/config/contract';
import { getAllIPFSUrls } from '@/services/ipfs';
import DisplayName from '@/components/ui/DisplayName';
import { relativeTime } from '@/lib/format';

interface Props {
  submission: Submission;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onViewDetail: () => void;
}

interface SubmissionContent {
  text: string;
  link: string;
  imageHash: string;
}

const SubmissionViewer = ({ submission, hasPrev, hasNext, onPrev, onNext, onViewDetail }: Props) => {
  const [currentGateway, setCurrentGateway] = useState(0);

  // Parse content from contract
  let parsedContent: SubmissionContent = { text: '', link: '', imageHash: '' };
  try {
    parsedContent = JSON.parse(submission.content || '{}');
  } catch {}

  const ipfsUrls = parsedContent.imageHash ? getAllIPFSUrls(parsedContent.imageHash) : [];
  const imageUrl = ipfsUrls[currentGateway] || null;

  const handleImageError = () => {
    if (currentGateway < ipfsUrls.length - 1) {
      setCurrentGateway(prev => prev + 1);
    }
  };

  const contentIcon = submission.contentType === 'creation' ? '🎨' : '🧾';

  return (
    <div className="relative flex-1 flex flex-col">
      {/* Navigation Arrows */}
      {hasPrev && (
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border border-border text-foreground shadow-lg hover:bg-background transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {hasNext && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border border-border text-foreground shadow-lg hover:bg-background transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Main Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={submission.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col"
        >
          {imageUrl ? (
            /* Image Display Mode */
            <div
              className="flex-1 relative cursor-pointer"
              onClick={onViewDetail}
            >
              <img
                src={imageUrl}
                alt={submission.title}
                className="absolute inset-0 w-full h-full object-contain"
                onError={handleImageError}
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Content info overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{contentIcon}</span>
                  <span className="text-sm opacity-80">{submission.contentType === 'creation' ? '二创' : '存证'}</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">{submission.title}</h2>
                <p className="text-sm opacity-80 mb-3 line-clamp-2">{submission.description}</p>
                <div className="flex items-center justify-between text-xs opacity-70">
                  <DisplayName address={submission.creator} />
                  <span>{relativeTime(submission.createdAt)}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Text Display Mode */
            <div className="flex-1 flex items-center justify-center p-8 bg-secondary/30">
              <div className="max-w-lg text-center">
                <span className="text-5xl mb-6 block">{contentIcon}</span>
                <h2 className="text-2xl font-bold text-foreground mb-3">{submission.title}</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">{submission.description}</p>

                {parsedContent.text && (
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap mb-4 bg-card p-4 rounded-lg border">
                    {parsedContent.text}
                  </p>
                )}

                {parsedContent.link && (
                  <a
                    href={parsedContent.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4"
                  >
                    打开参考链接 →
                  </a>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground mt-6 pt-4 border-t border-border">
                  <DisplayName address={submission.creator} />
                  <span>{relativeTime(submission.createdAt)}</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom bar with recommend count */}
      <div className="flex items-center justify-center gap-2 py-4 bg-background border-t border-border">
        <span className="text-primary font-semibold">❤️ {submission.recommendCount}</span>
        <span className="text-muted-foreground text-sm">推荐</span>
      </div>
    </div>
  );
};

export default SubmissionViewer;
