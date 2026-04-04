import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Loader2 } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import DisplayName from '@/components/ui/DisplayName';
import { CONTENT_TYPE_LABELS, SUBMISSION_STATUS_LABELS } from '@/config/contract';
import { fetchUserActivity, type UserActivitySummary } from '@/hooks/useContract';
import { relativeTime } from '@/lib/format';

type Tab = 'submissions' | 'exhibitions';

// ── Badge wall ────────────────────────────────────────────────────────────────

interface BadgeDef {
  id: string;
  icon: string;
  label: string;
  desc: string;
  color: string; // tailwind text color
  bg: string;    // tailwind bg + border
  ring: string;  // tailwind ring/glow for unlocked
}

const BADGE_DEFS: BadgeDef[] = [
  {
    id: 'firstSubmission',
    icon: '🌸',
    label: '首投者',
    desc: '完成第一次投稿',
    color: 'text-violet-500',
    bg: 'bg-violet-50 border-violet-200',
    ring: 'ring-2 ring-violet-300/60',
  },
  {
    id: 'firstExhibition',
    icon: '🏛️',
    label: '展厅创始人',
    desc: '创建第一个展厅',
    color: 'text-rose-500',
    bg: 'bg-rose-50 border-rose-200',
    ring: 'ring-2 ring-rose-300/60',
  },
  {
    id: 'milestone',
    icon: '✦',
    label: '推荐里程碑',
    desc: '单条投稿推荐达 10 次',
    color: 'text-purple-500',
    bg: 'bg-purple-50 border-purple-200',
    ring: 'ring-2 ring-purple-300/60',
  },
];

function BadgeWall({ summary }: { summary: UserActivitySummary }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const unlockedIds = new Set<string>();
  if (summary.hasFirstSubmissionBadge) unlockedIds.add('firstSubmission');
  if (summary.hasFirstExhibitionBadge) unlockedIds.add('firstExhibition');
  if (summary.milestoneBadges.length > 0) unlockedIds.add('milestone');
  const milestoneCount = summary.milestoneBadges.length;

  const selectedDef = selectedId ? BADGE_DEFS.find((d) => d.id === selectedId) ?? null : null;

  return (
    <div className="rounded-2xl border border-purple-200/60 bg-gradient-to-b from-purple-50/60 to-card p-6">
      <h2 className="text-lg font-semibold text-purple-700">成就徽章</h2>
      <p className="mt-1 text-xs text-purple-400">
        {unlockedIds.size} / {BADGE_DEFS.length} 已解锁
      </p>

      {/* Badge grid — compact icons */}
      <div className="mt-4 flex flex-wrap gap-3">
        {BADGE_DEFS.map((def) => {
          const unlocked = unlockedIds.has(def.id);
          const count = def.id === 'milestone' ? milestoneCount : (unlocked ? 1 : 0);
          const isSelected = selectedId === def.id;
          return (
            <button
              key={def.id}
              onClick={() => setSelectedId(isSelected ? null : def.id)}
              className={`relative flex h-14 w-14 flex-col items-center justify-center rounded-2xl border transition-all
                ${unlocked ? `${def.bg} ${def.ring} cursor-pointer hover:scale-105` : 'border-border bg-muted/30 opacity-40 grayscale cursor-default'}
                ${isSelected ? 'scale-105 shadow-md' : ''}
              `}
            >
              <span className="text-2xl leading-none">{def.icon}</span>
              {unlocked && count > 1 && (
                <span className={`absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-card border border-border text-[10px] font-bold ${def.color}`}>
                  {count}
                </span>
              )}
              {!unlocked && (
                <span className="absolute -right-1 -top-1 text-xs">🔒</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Detail panel — only shown when a badge is selected */}
      {selectedDef && (
        <div className={`mt-4 flex items-start gap-3 rounded-xl border p-3 ${selectedDef.bg}`}>
          <span className="mt-0.5 text-lg leading-none">{selectedDef.icon}</span>
          <div className="min-w-0">
            <p className={`text-xs font-semibold ${selectedDef.color}`}>
              {selectedDef.label}
              {selectedDef.id === 'milestone' && milestoneCount > 1 && ` × ${milestoneCount}`}
            </p>
            {selectedDef.id === 'milestone' && summary.milestoneBadges.length > 0 && (
              <ul className="mt-1 space-y-0.5">
                {summary.milestoneBadges.map((b) => (
                  <li key={`${b.exhibitionId}-${b.submissionId}`} className="truncate text-[11px] text-muted-foreground">
                    《{b.exhibitionTitle}》· {b.recommendCount} 推荐
                  </li>
                ))}
              </ul>
            )}
            {selectedDef.id === 'firstSubmission' && (
              <p className="mt-0.5 text-[11px] text-muted-foreground">链上首次投稿记录已永久存证</p>
            )}
            {selectedDef.id === 'firstExhibition' && (
              <p className="mt-0.5 text-[11px] text-muted-foreground">链上首个展厅已永久存证</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const emptySummary: UserActivitySummary = {
  submissions: [],
  myExhibitions: [],
  hasFirstSubmissionBadge: false,
  hasFirstExhibitionBadge: false,
  milestoneBadges: [],
};

const MyRecordsPage = () => {
  const { address, isConnected } = useAccount();
  const [summary, setSummary] = useState<UserActivitySummary>(emptySummary);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('submissions');

  useEffect(() => {
    if (!address || !isConnected) {
      setSummary(emptySummary);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchUserActivity(address)
      .then((result) => {
        if (!cancelled) {
          setSummary(result);
        }
      })
      .catch((err: any) => {
        if (!cancelled) {
          setError(err.message || '加载我的记录失败');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [address, isConnected]);

  if (!isConnected || !address) {
    return (
      <Layout>
        <div className="gallery-container max-w-4xl py-16">
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <h1 className="text-2xl font-bold text-foreground">我的记录</h1>
            <p className="mt-3 text-sm text-muted-foreground">连接钱包后即可查看你的投稿历史和 POAP 徽章。</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="gallery-container max-w-5xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">我的记录</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              <DisplayName address={address} /> 的投稿历史与链上徽章
            </p>
          </div>
          <Link
            to="/create"
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent"
          >
            创建新展厅
          </Link>
        </div>

        {isLoading ? (
          <div className="py-24 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <p className="text-destructive">{error}</p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="space-y-4">
              <BadgeWall summary={summary} />
            </aside>

            <section>
              <div className="rounded-2xl border border-border bg-card p-6">
                {/* Tab bar */}
                <div className="mb-5 flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1 w-fit">
                  <button
                    onClick={() => setActiveTab('submissions')}
                    className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                      activeTab === 'submissions'
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    投稿历史
                    <span className="ml-1.5 text-xs text-muted-foreground">{summary.submissions.length}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('exhibitions')}
                    className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                      activeTab === 'exhibitions'
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    我的展厅
                    <span className="ml-1.5 text-xs text-muted-foreground">{summary.myExhibitions.length}</span>
                  </button>
                </div>

                {/* 投稿历史 */}
                {activeTab === 'submissions' && (
                  summary.submissions.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
                      <p className="text-sm text-muted-foreground">你还没有投稿，去展厅里留下第一条记录吧。</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {summary.submissions.map((submission) => (
                        <div key={`${submission.exhibitionId}-${submission.id}`} className="rounded-xl border border-border bg-background p-5">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
                                  {CONTENT_TYPE_LABELS[submission.contentType] || submission.contentType}
                                </span>
                                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
                                  {SUBMISSION_STATUS_LABELS[submission.status] || '未知状态'}
                                </span>
                              </div>
                              <h3 className="text-base font-semibold text-foreground">{submission.title}</h3>
                              <p className="mt-1 text-sm text-muted-foreground">{submission.description || '暂无摘要'}</p>
                              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                                <Link to={`/exhibition/${submission.exhibitionId}`} className="text-primary hover:underline">
                                  查看展厅: {submission.exhibitionTitle}
                                </Link>
                                <span>{relativeTime(submission.createdAt)}</span>
                                <span>{submission.recommendCount} 推荐</span>
                                <span>{submission.witnessCount} 见证</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* 我的展厅 */}
                {activeTab === 'exhibitions' && (
                  summary.myExhibitions.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
                      <p className="text-sm text-muted-foreground">你还没有创建展厅。</p>
                      <Link to="/create" className="mt-3 inline-block text-sm text-primary hover:underline">
                        创建第一个展厅 →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {summary.myExhibitions.map((exhibition) => (
                        <div key={exhibition.id} className="rounded-xl border border-border bg-background p-5">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                {exhibition.tags.map((tag) => (
                                  <span key={tag} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
                                    {tag}
                                  </span>
                                ))}
                                {exhibition.flagged && (
                                  <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs text-destructive">已下架</span>
                                )}
                              </div>
                              <h3 className="text-base font-semibold text-foreground">{exhibition.title}</h3>
                              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                                <Link to={`/exhibition/${exhibition.id}`} className="text-primary hover:underline">
                                  进入展厅
                                </Link>
                                <span>{relativeTime(exhibition.createdAt)}</span>
                                <span>{exhibition.submissionCount} 份投稿</span>
                                {exhibition.stakeWithdrawn && <span className="text-green-600">质押已取回</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyRecordsPage;
