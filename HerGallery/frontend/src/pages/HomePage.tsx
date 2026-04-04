import { useEffect, useMemo, useState } from 'react';
import Layout from '@/components/Layout/Layout';
import ExhibitionCard from '@/components/Exhibition/ExhibitionCard';
import { fetchHomeExhibitions, type HomeExhibitionRecord } from '@/hooks/useContract';
import { getAllIPFSUrls } from '@/services/ipfs';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import LogoInviteSvgUrl from '@/assert/hg-logo-invite.svg?url';

function FeaturedExhibition({ exhibition, index }: { exhibition: HomeExhibitionRecord; index: number }) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const urls = exhibition.coverHash ? getAllIPFSUrls(exhibition.coverHash) : [];
  const isReversed = index % 2 === 1;

  useEffect(() => {
    if (urls.length > 0) setCoverUrl(urls[0]);
  }, [exhibition.coverHash]);

  return (
    <div className={`group relative flex flex-col md:flex-row ${isReversed ? 'md:flex-row-reverse' : ''} rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100 border border-violet-200`}>

      {/* Complex background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large gradient blob top */}
        <div className={`absolute -top-20 ${isReversed ? '-right-20' : '-left-20'} w-72 h-72 rounded-full blur-3xl opacity-60 bg-gradient-to-br from-violet-300/50 to-purple-300/40`} />
        {/* Small accent blob bottom */}
        <div className={`absolute -bottom-10 ${isReversed ? '-left-10' : '-right-10'} w-40 h-40 rounded-full blur-2xl opacity-50 bg-gradient-to-tr from-fuchsia-300/60 to-violet-300/40`} />
      </div>

      {/* Image side */}
      <Link to={`/exhibition/${exhibition.id}`} className="relative md:w-2/5 aspect-[4/3] md:aspect-auto block overflow-hidden z-10">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={exhibition.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-200/60 to-purple-200/60">
            <span className="text-5xl opacity-30">✿</span>
          </div>
        )}
        {/* Image overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      {/* Content side - Invitation style with logo */}
      <div className="relative md:w-3/5 p-6 md:p-8 flex flex-col justify-center z-10">
        {/* Large decorative logo watermark */}
        <div className={`absolute ${isReversed ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 w-40 h-40 select-pointer pointer-events-none opacity-[0.15]`}>
          <img src={LogoInviteSvgUrl} alt="" className="w-full h-full object-contain" />
        </div>

        {/* Top decorative line */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-violet-400 to-violet-500" />
          <span className="text-xs font-medium tracking-widest text-violet-500">邀请函</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-violet-400 to-violet-500" />
        </div>

        {/* Title */}
        <h3 className="text-lg md:text-xl font-semibold group-hover:text-violet-600 transition-colors leading-snug mb-2 text-violet-900">
          {exhibition.title}
        </h3>

        {/* Tags */}
        <div className="flex items-center gap-2 mb-3">
          {exhibition.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-violet-100/80 text-violet-600">
              {tag}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="text-xs text-violet-700/70 line-clamp-2 leading-relaxed mb-4">
          {exhibition.content || '暂无描述'}
        </p>

        {/* Bottom section with stats and CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-violet-200/50">
          <div className="flex items-center gap-4">
            <span className="text-xs text-violet-600/60">
              <span className="font-medium text-violet-600">{exhibition.submissionCount || 0}</span> 件作品
            </span>
            <span className="text-xs text-violet-600/60">
              <span className="font-medium text-fuchsia-500">{exhibition.hotScore || 0}</span> 次托举
            </span>
          </div>
          <Link
            to={`/exhibition/${exhibition.id}`}
            className="inline-flex items-center gap-1 text-xs font-medium transition-colors group/link text-violet-600 hover:text-violet-700"
          >
            <span className="relative">
              前往
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-violet-600 group-hover/link:w-full transition-all duration-300" />
            </span>
            <span className="transform group-hover/link:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}


function ProcessSection() {
  const steps = [
    { num: '01', title: '策展人创建展厅', desc: '质押少量 AVAX，创建一个属于你的展厅空间' },
    { num: '02', title: '收录投稿', desc: '策展人审核并收录来自创作者的作品' },
    { num: '03', title: '托举与见证', desc: '社区成员托举优质作品，见证历史记忆' },
  ];

  return (
    <section className="py-12">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">如何参与</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step) => (
          <div key={step.num} className="flex gap-4">
            <span className="text-2xl font-bold text-muted-foreground">{step.num}</span>
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">{step.title}</h3>
              <p className="text-xs text-muted-foreground">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TipSection() {
  return (
    <section className="py-10 px-8 rounded-2xl bg-secondary border border-border">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-1">支持 HerGallery</h2>
          <p className="text-sm text-muted-foreground">帮助我们继续为女性创作者建立永久、安全的艺术空间</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/create"
            className="inline-flex h-10 items-center rounded-full border border-primary/30 bg-white px-5 text-sm font-medium text-primary transition-colors hover:bg-secondary"
          >
            创建展厅
          </Link>
        </div>
      </div>
    </section>
  );
}

const HomePage = () => {
  const [exhibitions, setExhibitions] = useState<HomeExhibitionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [activeTag, setActiveTag] = useState<string>('全部');

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchHomeExhibitions()
      .then((records) => {
        if (!cancelled) {
          setExhibitions(records);
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

  const TAG_CATEGORIES = {
    '全部': [
      '网络帖子', '维权', '消费', '公共安全', '12315', '母婴', '健康',
      '觉醒', '诗歌', '艺术', '天空', '景色', '历史',
      '母系', '自然', '女性联结', '云吃吃',
    ],
    '存证类': ['网络帖子', '维权', '消费', '公共安全', '12315', '母婴', '健康'],
    '创作类': ['觉醒', '诗歌', '艺术', '天空', '景色', '历史'],
    '社群类': ['云吃吃', '女性联结', '母系', '自然'],
  };

  const sortedExhibitions = useMemo(
    () => [...exhibitions].sort((left, right) => right.hotScore - left.hotScore),
    [exhibitions]
  );

  const featuredExhibitions = sortedExhibitions.slice(0, 4);

  const filteredExhibitions = useMemo(() => {
    if (activeCategory === '全部') {
      if (activeTag === '全部') return sortedExhibitions;
      return sortedExhibitions.filter((exhibition) => exhibition.tags.includes(activeTag));
    }
    const categoryTags = TAG_CATEGORIES[activeCategory as keyof typeof TAG_CATEGORIES];
    if (activeTag === '全部') {
      return sortedExhibitions.filter((exhibition) =>
        exhibition.tags.some((t) => categoryTags.includes(t))
      );
    }
    return sortedExhibitions.filter((exhibition) =>
      exhibition.tags.includes(activeTag) && exhibition.tags.some((t) => categoryTags.includes(t))
    );
  }, [activeCategory, activeTag, sortedExhibitions]);

  return (
    <Layout>
      <div className="gallery-container">
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
          <div className="space-y-10">
            {/* Featured Exhibitions */}
            {featuredExhibitions.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">精选</h2>
                </div>
                <div className="space-y-6">
                  {featuredExhibitions.slice(0, 3).map((exhibition, idx) => (
                    <FeaturedExhibition key={exhibition.id} exhibition={exhibition} index={idx} />
                  ))}
                </div>
              </section>
            )}

            {/* Content: Sidebar + Grid */}
            <div className="flex gap-8">
              {/* Left Sidebar - Tags */}
              <aside className="w-36 shrink-0">
                <div className="sticky top-24 space-y-4">
                  {/* Primary: Categories */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">分类</p>
                    <div className="space-y-0.5">
                      {Object.keys(TAG_CATEGORIES).map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setActiveCategory(category);
                            setActiveTag('全部');
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            activeCategory === category
                              ? 'bg-primary text-primary-foreground font-medium'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Secondary: Tags within category */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">标签</p>
                    <div className="space-y-0.5 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
                      {(activeCategory === '全部'
                        ? TAG_CATEGORIES['全部']
                        : TAG_CATEGORIES[activeCategory as keyof typeof TAG_CATEGORIES]
                      ).map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setActiveTag(tag)}
                          className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                            activeTag === tag
                              ? 'bg-violet-100 text-violet-700 font-medium'
                              : 'text-muted-foreground/70 hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

              {/* Right Grid */}
              <div className="flex-1">
                {filteredExhibitions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[480px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
                    {filteredExhibitions.map((exhibition, idx) => (
                      <ExhibitionCard key={exhibition.id} exhibition={exhibition} index={idx} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <span className="text-5xl mb-4 opacity-30">✿</span>
                    <h2 className="text-xl font-semibold text-foreground mb-2">暂无展厅</h2>
                    <p className="text-muted-foreground mb-6">成为第一个策展人</p>
                    <Link
                      to="/create"
                      className="inline-flex h-10 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent"
                    >
                      创建展厅
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Process Section */}
            <ProcessSection />

            {/* Tip Section */}
            <TipSection />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HomePage;