import { useState } from 'react';
import { Submission } from '@/config/contract';
import SubmissionCard from './SubmissionCard';
import SubmissionDetailModal from './SubmissionDetailModal';

interface Props {
  submissions: Submission[];
  exhibitionId: number;
  isActive: boolean;
}

const SubmissionList = ({ submissions, exhibitionId, isActive }: Props) => {
  const [selected, setSelected] = useState<Submission | null>(null);
  const sorted = [...submissions].sort((a, b) => b.recommendCount - a.recommendCount);

  return (
    <>
      <div className="space-y-3">
        {sorted.map((sub, i) => (
          <SubmissionCard
            key={sub.id}
            submission={sub}
            index={i}
            exhibitionId={exhibitionId}
            isActive={isActive}
            onViewDetail={setSelected}
          />
        ))}
        {sorted.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">暂无投稿，成为第一个投稿人吧！</p>
        )}
      </div>

      {selected && (
        <SubmissionDetailModal
          submission={selected}
          exhibitionId={exhibitionId}
          isActive={isActive}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
};

export default SubmissionList;
