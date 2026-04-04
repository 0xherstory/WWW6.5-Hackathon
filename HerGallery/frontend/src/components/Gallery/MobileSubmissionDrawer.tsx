import { useMemo } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger } from '@/components/ui/drawer';
import { Submission } from '@/config/contract';
import GalleryThumbnail from './GalleryThumbnail';
import { Layers } from 'lucide-react';

interface Props {
  submissions: Submission[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  typeFilter: 'all' | 'evidence' | 'creation';
  onFilterChange: (filter: 'all' | 'evidence' | 'creation') => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const MobileSubmissionDrawer = ({
  submissions,
  selectedId,
  onSelect,
  typeFilter,
  onFilterChange,
  isOpen,
  onOpenChange,
}: Props) => {
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
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <button className="fixed bottom-20 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg lg:hidden">
          <Layers className="h-6 w-6" />
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>选择作品</DrawerTitle>
          <DrawerDescription>
            共 {counts.all} 件作品
          </DrawerDescription>
        </DrawerHeader>

        {/* Filter Tabs */}
        <div className="px-4 pb-3">
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

        {/* Thumbnails - Horizontal Scroll */}
        <div className="px-4 pb-8 overflow-x-auto">
          <div className="flex gap-3 min-w-max pb-2">
            {filteredSubmissions.map((submission) => (
              <div key={submission.id} className="w-32 shrink-0">
                <GalleryThumbnail
                  submission={submission}
                  isSelected={selectedId === submission.id}
                  onClick={() => {
                    onSelect(submission.id);
                    onOpenChange(false);
                  }}
                />
              </div>
            ))}
          </div>

          {filteredSubmissions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              暂无作品
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileSubmissionDrawer;
