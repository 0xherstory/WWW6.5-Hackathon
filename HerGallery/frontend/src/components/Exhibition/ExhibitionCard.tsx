import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Exhibition } from '@/config/contract';
import { shortenAddress, relativeTime } from '@/lib/format';
import { getAllIPFSUrls } from '@/services/ipfs';

interface Props {
  exhibition: Exhibition;
  index: number;
}

const ExhibitionCard = ({ exhibition, index }: Props) => {
  const [currentGateway, setCurrentGateway] = useState(0);
  const coverUrls = exhibition.coverHash ? getAllIPFSUrls(exhibition.coverHash) : [];
  const coverUrl = coverUrls[currentGateway] || null;

  const handleImageError = () => {
    if (currentGateway < coverUrls.length - 1) {
      setCurrentGateway(prev => prev + 1);
    }
  };

  return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08, duration: 0.4 }}
  >
    <Link to={`/exhibition/${exhibition.id}`} className="group block">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
        {/* Cover */}
        <div className="aspect-video bg-muted relative overflow-hidden">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={exhibition.title}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
          )}
          {exhibition.flagged && (
            <div className="absolute top-3 right-3 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              已隐藏
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-5">
          <h3 className="text-lg font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {exhibition.title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {shortenAddress(exhibition.curator)}
          </p>
          {exhibition.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {exhibition.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="mt-3 flex items-center justify-between">
            <span className="inline-flex items-center rounded-full border border-primary/30 px-2.5 py-0.5 text-xs font-medium text-primary">
              {exhibition.submissionCount} 投稿
            </span>
            <span className="text-xs text-muted-foreground">
              {relativeTime(exhibition.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
  );
};

export default ExhibitionCard;
