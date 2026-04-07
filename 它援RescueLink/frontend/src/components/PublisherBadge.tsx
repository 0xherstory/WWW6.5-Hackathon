import { useNavigate } from 'react-router-dom';
import { Publisher } from '@/data/publishers';
import { BadgeCheck, User } from 'lucide-react';

interface PublisherBadgeProps {
  publisher: Publisher;
  size?: 'sm' | 'md';
  showStats?: boolean;
}

const PublisherBadge = ({ publisher, size = 'sm', showStats = false }: PublisherBadgeProps) => {
  const navigate = useNavigate();
  const isShelter = publisher.type === 'shelter';
  const avatarSize = size === 'sm' ? 'h-5 w-5' : 'h-8 w-8';
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/publisher/${publisher.id}`);
      }}
      className="flex items-center gap-1.5 text-left transition-opacity active:opacity-70"
    >
      {/* Avatar */}
      <div className={`${avatarSize} shrink-0 overflow-hidden rounded-full ${isShelter ? 'bg-primary/15 ring-1 ring-primary/30' : 'bg-muted'} flex items-center justify-center`}>
        {isShelter ? (
          <BadgeCheck className={`${iconSize} text-primary`} />
        ) : (
          <User className={`${iconSize} text-muted-foreground`} />
        )}
      </div>

      {/* Name + type */}
      <div className="min-w-0">
        <div className="flex items-center gap-1">
          <span className={`truncate font-medium text-foreground/80 ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>
            {publisher.name}
          </span>
          {isShelter && publisher.certifiedShelter && (
            <span className={`shrink-0 rounded bg-primary/10 px-1 py-px font-medium text-primary ${size === 'sm' ? 'text-[8px]' : 'text-[10px]'}`}>
              认证小院
            </span>
          )}
        </div>
        {showStats && (
          <p className="text-[10px] text-muted-foreground">
            {isShelter ? (
              <>{publisher.city} · 已发布 {publisher.casesPublished} 个个案</>
            ) : (
              <>已发起 {publisher.casesPublished} 个个案 · {publisher.updatesCount} 次更新</>
            )}
          </p>
        )}
      </div>
    </button>
  );
};

export default PublisherBadge;
