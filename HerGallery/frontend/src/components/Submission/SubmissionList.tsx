import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Submission } from '@/config/contract';
import SubmissionCard from './SubmissionCard';
import SubmissionDetailModal from './SubmissionDetailModal';

interface Props {
  submissions: Submission[];
  exhibitionId: number;
  isActive: boolean;
  isCurator?: boolean;
}

type TypeFilter = 'evidence' | 'creation';
type SortBy = 'recommend' | 'time';

const SubmissionList = ({ submissions, exhibitionId, isActive, isCurator }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('evidence');
  const [sortBy, setSortBy] = useState<SortBy>('recommend');

  const sorted = useMemo(() => {
    return [...submissions]
      .filter((s) => s.status === 1 && !s.flagged)
      .filter((s) => {
        const isCreation = s.contentType === 'creation';
        return typeFilter === 'creation' ? isCreation : !isCreation;
      })
      .sort((a, b) =>
        sortBy === 'recommend'
          ? b.recommendCount - a.recommendCount
          : b.createdAt - a.createdAt
      );
  }, [submissions, typeFilter, sortBy]);

  const selectedSubmissionId = searchParams.get('submission');
  const selected = useMemo(() => {
    if (!selectedSubmissionId) return null;
    // search in all approved non-flagged submissions (ignore type filter for modal lookup)
    const all = submissions.filter((s) => s.status === 1 && !s.flagged);
    return all.find((s) => s.id === Number(selectedSubmissionId)) ?? null;
  }, [selectedSubmissionId, submissions]);

  const openSubmission = (submission: Submission) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('submission', String(submission.id));
    setSearchParams(nextParams, { replace: true });
  };

  const closeSubmission = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('submission');
    setSearchParams(nextParams, { replace: true });
  };

  const evidenceCount = submissions.filter((s) => s.status === 1 && !s.flagged && s.contentType !== 'creation').length;
  const creationCount = submissions.filter((s) => s.status === 1 && !s.flagged && s.contentType === 'creation').length;

  return (
    <>
      {/* Filter + Sort bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {/* Type filter tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-secondary/50 p-1">
          <button
            onClick={() => setTypeFilter('evidence')}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              typeFilter === 'evidence'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            存证
            <span className="ml-1.5 text-xs text-muted-foreground">{evidenceCount}</span>
          </button>
          <button
            onClick={() => setTypeFilter('creation')}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              typeFilter === 'creation'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            二创
            <span className="ml-1.5 text-xs text-muted-foreground">{creationCount}</span>
          </button>
        </div>

        {/* Sort toggle */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>排序：</span>
          <button
            onClick={() => setSortBy('recommend')}
            className={`rounded-md px-2.5 py-1 transition-colors ${
              sortBy === 'recommend'
                ? 'bg-primary/10 text-primary font-medium'
                : 'hover:text-foreground'
            }`}
          >
            推荐数
          </button>
          <span>/</span>
          <button
            onClick={() => setSortBy('time')}
            className={`rounded-md px-2.5 py-1 transition-colors ${
              sortBy === 'time'
                ? 'bg-primary/10 text-primary font-medium'
                : 'hover:text-foreground'
            }`}
          >
            时间
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {sorted.map((sub, i) => (
          <SubmissionCard
            key={sub.id}
            submission={sub}
            index={i}
            exhibitionId={exhibitionId}
            isActive={isActive}
            onViewDetail={openSubmission}
          />
        ))}
        {sorted.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">
            {typeFilter === 'evidence' ? '暂无存证投稿' : '暂无二创投稿'}
          </p>
        )}
      </div>

      {selected && (
        <SubmissionDetailModal
          submission={selected}
          exhibitionId={exhibitionId}
          isActive={isActive}
          isCurator={isCurator}
          onClose={closeSubmission}
        />
      )}
    </>
  );
};

export default SubmissionList;
