import { Submission } from '@/config/contract';
import { getAllIPFSUrls } from '@/services/ipfs';
import { useState } from 'react';

interface Props {
  submission: Submission;
  isSelected: boolean;
  onClick: () => void;
}

interface SubmissionContent {
  text: string;
  link: string;
  imageHash: string;
}

const GalleryThumbnail = ({ submission, isSelected, onClick }: Props) => {
  const [currentGateway, setCurrentGateway] = useState(0);

  let parsedContent: SubmissionContent = { text: '', link: '', imageHash: '' };
  try {
    parsedContent = JSON.parse(submission.content || '{}');
  } catch {}

  const ipfsUrls = parsedContent.imageHash ? getAllIPFSUrls(parsedContent.imageHash) : [];
  const imageUrl = ipfsUrls[currentGateway] || null;
  const contentIcon = submission.contentType === 'creation' ? '🎨' : '🧾';

  const handleImageError = () => {
    if (currentGateway < ipfsUrls.length - 1) {
      setCurrentGateway(prev => prev + 1);
    }
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg overflow-hidden transition-all ${
        isSelected
          ? 'ring-2 ring-primary shadow-md'
          : 'hover:bg-secondary border border-transparent hover:border-border'
      }`}
    >
      <div className="aspect-square bg-muted relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={submission.title}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
            <span className="text-2xl opacity-50">{contentIcon}</span>
          </div>
        )}
      </div>
      <div className="p-2">
        <p className="text-xs font-medium text-foreground line-clamp-1 truncate">
          {submission.title}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          ❤️ {submission.recommendCount}
        </p>
      </div>
    </button>
  );
};

export default GalleryThumbnail;
