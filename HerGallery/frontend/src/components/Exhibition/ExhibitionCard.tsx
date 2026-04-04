import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Exhibition } from '@/config/contract';
import { relativeTime } from '@/lib/format';
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
    <Link to={`/exhibition/${exhibition.id}`} className="group block">
      <div className="overflow-hidden">
        {/* Cover */}
        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={exhibition.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={handleImageError}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <span className="text-4xl opacity-30">✿</span>
            </div>
          )}

          {/* Tags overlay */}
          {exhibition.tags.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-wrap gap-1">
              {exhibition.tags.slice(0, 1).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-black/50 backdrop-blur-sm px-2 py-0.5 text-xs font-medium text-white"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="pt-4">
          <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {exhibition.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {exhibition.submissionCount} 投稿 · {relativeTime(exhibition.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ExhibitionCard;