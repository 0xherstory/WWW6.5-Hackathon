import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Loader2 } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import DisplayName from '@/components/ui/DisplayName';
import {
  parseExhibition,
  parseSubmissions,
  useApproveSubmission,
  useExhibition,
  usePendingSubmissions,
  useRejectSubmission,
  useWithdrawTips,
  useWithdrawStake,
  useFlagSubmission,
} from '@/hooks/useContract';
import { relativeTime } from '@/lib/format';
import { toast } from 'sonner';

const ManageExhibitionPage = () => {
  const { id } = useParams<{ id: string }>();
  const exhibitionId = Number(id);
  const { address, isConnected } = useAccount();
  const [actingId, setActingId] = useState<number | null>(null);
  const [isWithdrawingTips, setIsWithdrawingTips] = useState(false);
  const [isWithdrawingStake, setIsWithdrawingStake] = useState(false);
  const [flaggingId, setFlaggingId] = useState<number | null>(null);

  const {
    data: rawExhibition,
    isLoading: exhibitionLoading,
    error: exhibitionError,
    refetch: refetchExhibition,
  } = useExhibition(exhibitionId);
  const {
    data: rawPendingSubmissions,
    isLoading: submissionsLoading,
    refetch: refetchPendingSubmissions,
  } = usePendingSubmissions(exhibitionId);

  const exhibition = parseExhibition(rawExhibition);
  const pendingSubmissions = useMemo(
    () => parseSubmissions(rawPendingSubmissions).filter((submission) => !submission.flagged),
    [rawPendingSubmissions]
  );

  const { approveSubmission } = useApproveSubmission(() => {
    toast.success('投稿已批准');
    refetchPendingSubmissions();
  });
  const { rejectSubmission } = useRejectSubmission(() => {
    toast.success('投稿已拒绝');
    refetchPendingSubmissions();
  });
  const { withdrawTips } = useWithdrawTips(() => {
    toast.success('赏金已提取');
    refetchExhibition();
  });
  const { withdrawStake } = useWithdrawStake(() => {
    toast.success('质押已退还');
    refetchExhibition();
  });
  const { flagSubmission } = useFlagSubmission(() => {
    toast.success('投稿已隐藏');
    refetchPendingSubmissions();
  });

  const isCurator = !!address && !!exhibition && address.toLowerCase() === exhibition.curator.toLowerCase();

  const handleWithdrawTips = async () => {
    if (!isConnected) { toast.error('请先连接钱包'); return; }
    setIsWithdrawingTips(true);
    try {
      await withdrawTips(exhibitionId);
    } catch (err: any) {
      toast.error(err.message || '提取失败，请重试');
    } finally {
      setIsWithdrawingTips(false);
    }
  };

  const handleWithdrawStake = async () => {
    if (!isConnected) { toast.error('请先连接钱包'); return; }
    setIsWithdrawingStake(true);
    try {
      await withdrawStake(exhibitionId);
    } catch (err: any) {
      toast.error(err.message || '退还失败，请重试');
    } finally {
      setIsWithdrawingStake(false);
    }
  };

  const handleFlagSubmission = async (submissionId: number) => {
    if (!isConnected) { toast.error('请先连接钱包'); return; }
    setFlaggingId(submissionId);
    try {
      await flagSubmission(submissionId);
    } catch (err: any) {
      toast.error(err.message || '操作失败，请重试');
    } finally {
      setFlaggingId(null);
    }
  };

  const handleAction = async (submissionId: number, action: 'approve' | 'reject') => {
    if (!isConnected) {
      toast.error('请先连接钱包');
      return;
    }

    setActingId(submissionId);
    try {
      if (action === 'approve') {
        await approveSubmission(submissionId);
      } else {
        await rejectSubmission(submissionId);
      }
    } catch (err: any) {
      toast.error(err.message || '操作失败，请重试');
    } finally {
      setActingId(null);
    }
  };

  if (exhibitionLoading) {
    return (
      <Layout>
        <div className="gallery-container py-24 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (exhibitionError || !exhibition) {
    return (
      <Layout>
        <div className="gallery-container py-24 text-center">
          <p className="text-destructive">展厅加载失败</p>
          <Link to="/gallery" className="mt-4 inline-block text-sm text-primary hover:underline">
            返回首页
          </Link>
        </div>
      </Layout>
    );
  }

  if (!isCurator) {
    return (
      <Layout>
        <div className="gallery-container max-w-3xl py-16">
          <Link to={`/exhibition/${exhibitionId}`} className="mb-6 inline-block text-sm text-primary hover:underline">
            返回展厅详情
          </Link>
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <h1 className="text-2xl font-bold text-foreground">仅策展人可管理此展厅</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              请使用创建该展厅的钱包地址连接后再进行审核操作。
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="gallery-container max-w-4xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link to={`/exhibition/${exhibitionId}`} className="mb-4 inline-block text-sm text-primary hover:underline">
              返回展厅详情
            </Link>
            <h1 className="text-3xl font-bold text-foreground">审核投稿</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {exhibition.title} · 当前有 {pendingSubmissions.length} 条待审核投稿
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm">
            <p className="text-muted-foreground">策展人</p>
            <p className="mt-1 font-medium text-foreground">
              <DisplayName address={exhibition.curator} />
            </p>
          </div>
        </div>

        {/* Curator financial actions */}
        {exhibition && (
          <div className="mb-6 flex flex-wrap gap-3">
            {exhibition.tipPool > 0 && (
              <button
                onClick={handleWithdrawTips}
                disabled={isWithdrawingTips}
                className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
              >
                {isWithdrawingTips
                  ? '提取中...'
                  : `提取展厅赏金（${(exhibition.tipPool / 1e18).toFixed(4)} AVAX）`}
              </button>
            )}
            {exhibition.submissionCount >= 10 && !exhibition.stakeWithdrawn && (
              <button
                onClick={handleWithdrawStake}
                disabled={isWithdrawingStake}
                className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
              >
                {isWithdrawingStake ? '申请中...' : '申请退还质押（0.001 AVAX）'}
              </button>
            )}
            {exhibition.stakeWithdrawn && (
              <span className="inline-flex items-center rounded-xl border border-border bg-secondary px-5 py-2.5 text-sm text-muted-foreground">
                质押已退还
              </span>
            )}
          </div>
        )}

        {submissionsLoading ? (
          <div className="py-24 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          </div>
        ) : pendingSubmissions.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <h2 className="text-xl font-semibold text-foreground">没有待审核投稿</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              当前所有投稿都已经处理完成。
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingSubmissions.map((submission) => {
              const isActing = actingId === submission.id;
              return (
                <div key={submission.id} className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
                          {submission.contentType === 'creation' ? '二创' : '存证'}
                        </span>
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
                          待审核
                        </span>
                      </div>
                      <h2 className="text-xl font-semibold text-foreground">{submission.title}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {submission.description || '暂无摘要'}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                        <span>
                          投稿者: <DisplayName address={submission.creator} />
                        </span>
                        <span>{relativeTime(submission.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <button
                        onClick={() => handleFlagSubmission(submission.id)}
                        disabled={flaggingId === submission.id}
                        className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive disabled:opacity-60"
                      >
                        {flaggingId === submission.id ? '处理中...' : '隐藏'}
                      </button>
                      <button
                        onClick={() => handleAction(submission.id, 'reject')}
                        disabled={isActing}
                        className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-60"
                      >
                        {isActing ? '处理中...' : '拒绝'}
                      </button>
                      <button
                        onClick={() => handleAction(submission.id, 'approve')}
                        disabled={isActing}
                        className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent disabled:opacity-60"
                      >
                        {isActing ? '处理中...' : '批准'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ManageExhibitionPage;
