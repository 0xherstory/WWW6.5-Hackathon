import { useMemo } from 'react';
import { Submission } from '@/config/contract';
import GalleryThumbnail from './GalleryThumbnail';

interface Props {
  submissions: Submission[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  typeFilter: 'all' | 'evidence' | 'creation';
  onFilterChange: (filter: 'all' | 'evidence' | 'creation') => void;
}

const GallerySidebar = ({ submissions, selectedId, onSelect, typeFilter, onFilterChange }: Props) => {
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(s => {
      if (typeFilter === 'all') return true;
      return typeFilter === 'creation' ? s.contentType === 'creation' : s.contentType !== 'creation';
    });
  }, [submissions, typeFilter]);

  const counts = useMemo(() => {
    const all = submissions.length;
    const evidence = submissions.filter(s => s.contentType !== 'creation').length;
    const creation = submissions.filter(s => s.contentType === 'creation').length;
    return { all, evidence, creation };
  }, [submissions]);

  return (
    <div className="w-64 shrink-0 flex flex-col bg-background border-r border-border h-full">
      {/* Filter Tabs */}
      <div className="p-3 border-b border-border">
        <div className="flex rounded-lg bg-muted p-1">
          {(['all', 'evidence', 'creation'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => onFilterChange(filter)}
              className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
                typeFilter === filter
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {filter === 'all' ? '全部' : filter === 'evidence' ? '存证' : '二创'}
            </button>
          ))}
        </div>
      </div>

      {/* Thumbnails Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-2">
          {filteredSubmissions.map((submission) => (
            <GalleryThumbnail
              key={submission.id}
              submission={submission}
              isSelected={selectedId === submission.id}
              onClick={() => onSelect(submission.id)}
            />
          ))}
        </div>

        {filteredSubmissions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            暂无作品
          </div>
        )}
      </div>

      {/* Counts */}
      <div className="p-3 border-t border-border text-xs text-muted-foreground text-center">
        共 {counts.all} 件作品
      </div>
    </div>
  );
};

export default GallerySidebar;
