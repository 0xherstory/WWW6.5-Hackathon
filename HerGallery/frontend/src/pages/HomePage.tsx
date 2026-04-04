import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout/Layout';
import ExhibitionList from '@/components/Exhibition/ExhibitionList';
import { fetchHomeExhibitions, type HomeExhibitionRecord } from '@/hooks/useContract';
import { getAllIPFSUrls } from '@/services/ipfs';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { relativeTime, shortenAddress } from '@/lib/format';

const RANK_STYLES = [
  { badge: 'bg-amber-100 text-amber-700 border border-amber-200', bar: 'bg-amber-400/20' },
  { badge: 'bg-slate-100 text-slate-600 border border-slate-200', bar: 'bg-slate-300/20' },
  { badge: 'bg-orange-100 text-orange-600 border border-orange-200', bar: 'bg-orange-300/20' },
];

function FeaturedTicket({ exhibition, rank }: { exhibition: HomeExhibitionRecord; rank: number }) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverIdx, setCoverIdx] = useState(0);
  const urls = exhibition.coverHash ? getAllIPFSUrls(exhibition.coverHash) : [];
  const style = RANK_STYLES[rank - 1] ?? RANK_STYLES[2];

  useEffect(() => {
    if (urls.length > 0) setCoverUrl(urls[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exhibition.coverHash]);

  return (
    <Link
      to={`/exhibition/${exhibition.id}`}
      className="group relative flex h-28 overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg"
    >
      {/* Subtle rank tint strip on left edge */}
      <div className={`w-1 shrink-0 ${style.bar}`} />

      {/* Left: text info */}
      <div className="flex min-w-0 flex-1 flex-col justify-between px-5 py-4">
        {/* Top row */}
        <div className="flex items-center gap-2">
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.badge}`}>
            TOP {rank}
          </span>
          {exhibition.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
              {tag}
            </span>
          ))}
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">{relativeTime(exhibition.createdAt)}</span>
        </div>

        {/* Title */}
        <h3 className="mt-1 truncate text-base font-semibold text-foreground group-hover:text-primary transition-colors">
          {exhibition.title}
        </h3>

        {/* Bottom stats row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{shortenAddress(exhibition.curator)}</span>
          <span className="text-border">·</span>
          <span>{exhibition.submissionCount} 投稿</span>
          <span className="text-border">·</span>
          <span>{exhibition.totalRecommends} 推荐</span>
          <span className="text-border">·</span>
          <span>{exhibition.totalWitnesses} 见证</span>
        </div>
      </div>

      {/* Divider — ticket perforation style */}
      <div className="relative flex w-5 shrink-0 flex-col items-center justify-between py-2">
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 border-l border-dashed border-border" />
        <div className="relative z-10 h-2.5 w-2.5 rounded-full bg-background border border-border -ml-[1px]" />
        <div className="relative z-10 h-2.5 w-2.5 rounded-full bg-background border border-border -ml-[1px]" />
      </div>

      {/* Right: cover image */}
      <div className="relative w-36 shrink-0 overflow-hidden bg-muted">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={exhibition.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => {
              if (coverIdx < urls.length - 1) {
                const next = coverIdx + 1;
                setCoverIdx(next);
                setCoverUrl(urls[next]);
              } else {
                setCoverUrl(null);
              }
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}
      </div>
    </Link>
  );
}

const HomePage = () => {
  const [exhibitions, setExhibitions] = useState<HomeExhibitionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string>('全部');

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchHomeExhibitions()
      .then((records) => {
        if (!cancelled) {
          setExhibitions(records.sort((left, right) => right.createdAt - left.createdAt));
        }
      })
      .catch((err: any) => {
        if (!cancelled) {
          setError(err.message || '加载失败，请检查网络和钱包连接');
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
  }, []);

  const tags = useMemo(() => {
    const values = new Set<string>();
    exhibitions.forEach((exhibition) => {
      exhibition.tags.forEach((tag) => values.add(tag));
    });
    return ['全部', ...Array.from(values)];
  }, [exhibitions]);

  const featuredExhibitions = useMemo(
    () => [...exhibitions].sort((left, right) => right.hotScore - left.hotScore).slice(0, 3),
    [exhibitions]
  );

  const filteredExhibitions = useMemo(() => {
    if (activeTag === '全部') {
      return exhibitions;
    }
    return exhibitions.filter((exhibition) => exhibition.tags.includes(activeTag));
  }, [activeTag, exhibitions]);

  return (
    <Layout>
      <div className="gallery-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            <span className="text-primary">✿</span> 她的展厅
          </h1>
          <p className="mt-3 text-muted-foreground">
            记录、创作、推荐 — 链上属于她们的艺术空间
          </p>
        </motion.div>

        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="py-12 text-center">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="space-y-12">
            <section>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">热门榜单</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    根据推荐数与投稿活跃度综合计算出的优质展厅
                  </p>
                </div>
              </div>

              {featuredExhibitions.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {featuredExhibitions.map((exhibition, index) => (
                    <FeaturedTicket key={exhibition.id} exhibition={exhibition} rank={index + 1} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
                  还没有可进入榜单的展厅
                </div>
              )}
            </section>

            <section>
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">全部展厅</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    按创建时间倒序展示，可通过标签快速筛选
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setActiveTag(tag)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        activeTag === tag
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <ExhibitionList exhibitions={filteredExhibitions} />
            </section>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HomePage;
