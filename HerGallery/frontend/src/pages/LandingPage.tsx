import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { fetchHomeExhibitions, type HomeExhibitionRecord, useTipPlatform } from '@/hooks/useContract';
import { getAllIPFSUrls } from '@/services/ipfs';
import { shortenAddress } from '@/lib/format';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';

// ── Animated background orb ──────────────────────────────────────────────────

function Orb({
  size,
  style,
  from,
  delay,
  xRange = 0,
}: {
  size: number;
  style: React.CSSProperties;
  from: string;
  delay: number;
  xRange?: number;
}) {
  return (
    <motion.div
      className={`pointer-events-none absolute rounded-full blur-3xl ${from}`}
      style={{ width: size, height: size, ...style }}
      animate={{
        y: [0, -36, 8, -36, 0],
        x: xRange ? [0, xRange, 0, -xRange, 0] : undefined,
        scale: [1, 1.12, 0.97, 1.12, 1],
        opacity: [0.75, 1, 0.65, 1, 0.75],
      }}
      transition={{
        duration: 7 + delay * 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    />
  );
}

// ── Carousel card ─────────────────────────────────────────────────────────────

function CarouselCard({
  exhibition,
  rank,
}: {
  exhibition: HomeExhibitionRecord;
  rank: number;
}) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const urls = useMemo(
    () => (exhibition.coverHash ? getAllIPFSUrls(exhibition.coverHash) : []),
    [exhibition.coverHash],
  );

  useEffect(() => {
    if (urls.length > 0) setCoverUrl(urls[0]);
  }, [exhibition.coverHash]);

  return (
    <Link
      to={`/exhibition/${exhibition.id}`}
      className="group relative flex h-80 w-56 shrink-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-muted shadow-xl transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl"
    >
      {/* cover image */}
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={exhibition.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => {
            if (idx < urls.length - 1) {
              const next = idx + 1;
              setIdx(next);
              setCoverUrl(urls[next]);
            } else {
              setCoverUrl(null);
            }
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/60 to-purple-950/80 flex items-center justify-center">
          <span className="text-5xl opacity-30">✿</span>
        </div>
      )}

      {/* gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* rank badge */}
      <div className="absolute left-3 top-3">
        <span className="rounded-full bg-black/50 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
          TOP {rank}
        </span>
      </div>

      {/* info */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="truncate text-sm font-semibold text-white leading-snug">
          {exhibition.title}
        </p>
        <p className="mt-0.5 text-xs text-white/60">{shortenAddress(exhibition.curator)}</p>
        <div className="mt-2 flex gap-3 text-xs text-white/60">
          <span>{exhibition.submissionCount} 投稿</span>
          <span>{exhibition.totalRecommends} 推荐</span>
        </div>
      </div>
    </Link>
  );
}

// ── Carousel wrapper ──────────────────────────────────────────────────────────

function ExhibitionCarousel({ exhibitions }: { exhibitions: HomeExhibitionRecord[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' });
  };

  if (exhibitions.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">暂无展厅数据，请稍后再来～</p>
    );
  }

  return (
    <div className="relative">
      {/* prev */}
      <button
        onClick={() => scroll('left')}
        className="absolute -left-5 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-md transition-colors hover:bg-secondary"
      >
        <ChevronLeft className="h-5 w-5 text-muted-foreground" />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto px-1 pb-4 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {exhibitions.map((ex, i) => (
          <CarouselCard key={ex.id} exhibition={ex} rank={i + 1} />
        ))}
      </div>

      {/* next */}
      <button
        onClick={() => scroll('right')}
        className="absolute -right-5 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-md transition-colors hover:bg-secondary"
      >
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </button>
    </div>
  );
}

// ── Feature cards ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: '🏛️',
    title: '创建展厅',
    desc: '任何人可在链上开设属于自己的展厅，设定主题、上传封面、开放投稿，并通过质押机制保证内容品质。',
  },
  {
    icon: '📝',
    title: '链上投稿',
    desc: '作品内容存入 IPFS，内容哈希上链，永久溯源，无法删除。每一份投稿都是不可撤回的链上证明。',
  },
  {
    icon: '👍',
    title: '推荐与见证',
    desc: '读者可推荐优质投稿为其背书，也可见证某条记录，让每一次互动都成为链上可查的历史印记。',
  },
  {
    icon: '🏅',
    title: 'POAP 徽章',
    desc: '完成首次投稿、推荐数达到里程碑等关键行为，将即时解锁专属的链上成就徽章，彰显你的参与轨迹。',
  },
];

// ── Tech stack ────────────────────────────────────────────────────────────────

const TECH = [
  { icon: '⛰️', name: 'Avalanche Fuji', desc: 'EVM 兼容 L1，低 Gas，高速出块' },
  { icon: '📜', name: 'Solidity', desc: '智能合约，逻辑透明可验证' },
  { icon: '📦', name: 'IPFS', desc: '去中心化存储，内容永不消失' },
  { icon: '⚛️', name: 'React + Vite', desc: '极速响应的现代前端框架' },
  { icon: '🔗', name: 'Wagmi + Viem', desc: '类型安全的 Web3 交互层' },
  { icon: '🎨', name: 'Tailwind + Framer', desc: '流畅动效与精致视觉系统' },
];

// ── Tip platform section ──────────────────────────────────────────────────────

function TipPlatformSection() {
  const { isConnected } = useAccount();
  const [amount, setAmount] = useState('0.01');
  const [isTipping, setIsTipping] = useState(false);
  const [done, setDone] = useState(false);

  const { tipPlatform } = useTipPlatform(() => {
    setDone(true);
    toast.success('感谢你的支持！打赏已上链 ✦');
    setTimeout(() => setDone(false), 4000);
  });

  const handleTip = async () => {
    if (!isConnected) { toast.error('请先连接钱包'); return; }
    const val = Number(amount);
    if (!amount || val <= 0) { toast.error('请输入有效金额'); return; }
    setIsTipping(true);
    try {
      await tipPlatform(amount);
    } catch (err: any) {
      toast.error(err.message || '打赏失败，请重试');
    } finally {
      setIsTipping(false);
    }
  };

  return (
    <section className="gallery-container pb-20 pt-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-md rounded-3xl border border-violet-200/20 bg-gradient-to-br from-violet-950/40 via-purple-900/30 to-fuchsia-950/40 px-8 py-10 text-center"
        style={{ boxShadow: '0 0 60px -20px rgba(124,58,237,0.25)' }}
      >
        <span className="text-3xl">✦</span>
        <h3 className="mt-3 text-lg font-bold text-foreground">打赏平台</h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          HerGallery 由社区驱动，完全开源。<br />
          如果这个项目对你有意义，欢迎用 AVAX 支持我们继续建设。
        </p>

        <div className="mt-6 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              min="0.001"
              step="0.001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 pr-16 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
              AVAX
            </span>
          </div>
          <button
            onClick={handleTip}
            disabled={isTipping || done}
            className={`shrink-0 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
              done
                ? 'bg-violet-100 text-violet-700'
                : 'bg-violet-600 text-white hover:bg-violet-500 hover:shadow-lg hover:shadow-violet-500/30'
            }`}
          >
            {done ? '已打赏 ✦' : isTipping ? '处理中…' : '打赏'}
          </button>
        </div>

        <p className="mt-3 text-xs text-muted-foreground/60">
          链上转账，直接到达合约地址，完全透明可查
        </p>
      </motion.div>
    </section>
  );
}

// ── Landing page ──────────────────────────────────────────────────────────────

const LandingPage = () => {
  const [exhibitions, setExhibitions] = useState<HomeExhibitionRecord[]>([]);

  useEffect(() => {
    fetchHomeExhibitions()
      .then((list) => setExhibitions(list))
      .catch(() => {});
  }, []);

  const topExhibitions = useMemo(
    () => [...exhibitions].sort((a, b) => b.hotScore - a.hotScore).slice(0, 5),
    [exhibitions],
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative -mt-16 min-h-screen overflow-hidden px-4"
        style={{
          background:
            'linear-gradient(135deg, #080015 0%, #140228 25%, #2a0d5e 55%, #1a0533 80%, #060010 100%)',
        }}
      >
        {/* dot grid — slow opacity breathing */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(167,139,250,0.4) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
          animate={{ opacity: [0.15, 0.28, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* aurora — central pulsing glow */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-3xl"
          style={{ width: 800, height: 380 }}
          animate={{ opacity: [0.4, 0.85, 0.4], scaleX: [1, 1.12, 1], scaleY: [1, 0.92, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* orbs */}
        <Orb
          size={580}
          style={{ top: -180, left: -160 }}
          from="bg-violet-600/35"
          delay={0}
          xRange={20}
        />
        <Orb
          size={420}
          style={{ bottom: -100, right: -80 }}
          from="bg-fuchsia-600/30"
          delay={2}
          xRange={-18}
        />
        <Orb
          size={280}
          style={{ top: '38%', right: '12%' }}
          from="bg-purple-500/30"
          delay={4}
          xRange={12}
        />

        {/* content — pt-16 pushes below the transparent header */}
        <div className="flex min-h-screen flex-col items-center justify-center pt-16">
        <div className="relative z-10 max-w-3xl w-full px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-6 inline-block rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-1.5 text-xs font-medium tracking-widest text-violet-300 uppercase">
              链上艺术平台 · Avalanche Fuji
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-6xl font-bold leading-tight tracking-tight sm:text-7xl"
            style={{
              background:
                'linear-gradient(120deg, #ede9fe 10%, #c4b5fd 40%, #f0abfc 75%, #e9d5ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            她的展厅
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28 }}
            className="mt-5 text-base text-violet-200/70 sm:text-lg"
          >
            为女性创作者而建的链上永久画廊
            <br />
            存证、推荐、见证 — 每一份记录都属于她
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.42 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              to="/gallery"
              className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-purple-900 shadow-lg transition-all hover:bg-violet-100 hover:shadow-violet-500/30 hover:shadow-xl"
            >
              进入展厅 →
            </Link>
            <a
              href="#features"
              className="rounded-full border border-white/25 px-8 py-3 text-sm font-semibold text-white/80 transition-all hover:border-white/50 hover:text-white"
            >
              了解更多
            </a>
          </motion.div>
        </div>
        </div>{/* end centering wrapper */}

        {/* scroll hint */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </motion.div>
      </section>

      {/* ── Gradient bridge ───────────────────────────────────────────────── */}
      <div
        className="h-24 -mt-1"
        style={{
          background:
            'linear-gradient(to bottom, #080015 0%, var(--background) 100%)',
        }}
      />

      {/* ── Below-fold sections ───────────────────────────────────────────── */}
      <div className="flex-1 bg-background">

        {/* ── Hot carousel ──────────────────────────────────────────────── */}
        <section className="gallery-container py-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              🔥 热门展厅
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              根据推荐数与活跃度综合排名的前五名展厅
            </p>
          </div>
          <ExhibitionCarousel exhibitions={topExhibitions} />
        </section>

        {/* ── Features ──────────────────────────────────────────────────── */}
        <section id="features" className="gallery-container py-16">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              第一次来？
            </p>
            <h2 className="mt-2 text-3xl font-bold text-foreground">平台能做什么</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              HerGallery 是一个去中心化的艺术展览平台，所有互动都发生在链上
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <span className="text-3xl">{f.icon}</span>
                <h3 className="mt-4 text-base font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Journeys & Badges ───────────────────────────────────────────── */}
        <section className="py-16" style={{ background: 'linear-gradient(to bottom, transparent, hsl(var(--secondary)/0.3), transparent)' }}>
          <div className="gallery-container">
            <div className="mb-10 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">旅程</p>
              <h2 className="mt-2 text-3xl font-bold text-foreground">三种参与方式</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                无论你是创作者、策展人还是观众，都能在这里留下不可磨灭的链上印记
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  icon: '🎪',
                  title: '策展人',
                  color: 'violet',
                  steps: [
                    { num: '01', title: '创建展厅', desc: '质押 0.001 AVAX，创建一个属于你的展厅空间' },
                    { num: '02', title: '收录投稿', desc: '审核并收录来自创作者的作品' },
                    { num: '03', title: '运营展厅', desc: '持续生长，吸引社区托举与见证' },
                  ],
                  badges: [],
                },
                {
                  icon: '✏️',
                  title: '投稿人',
                  color: 'emerald',
                  steps: [
                    { num: '01', title: '提交作品', desc: '上传存证或二创，让创作被永久记住' },
                    { num: '02', title: '等待审核', desc: '策展人审核后作品将在展厅展示' },
                    { num: '03', title: '获得认可', desc: '作品被推荐，见证历史记忆' },
                  ],
                  badges: [
                    { icon: '🌸', name: '首投者', desc: '完成第一次投稿' },
                    { icon: '✦', name: '推荐里程碑', desc: '单条投稿获得10次推荐' },
                  ],
                },
                {
                  icon: '👁️',
                  title: '观众',
                  color: 'amber',
                  steps: [
                    { num: '01', title: '推荐', desc: '托举优质内容，让有价值的声音被看见' },
                    { num: '02', title: '见证', desc: '说出「我知道这件事发生过」' },
                    { num: '03', title: '打赏', desc: '支持策展人，让展厅持续生长' },
                  ],
                  badges: [],
                },
              ].map((journey) => (
                <motion.div
                  key={journey.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="rounded-2xl border border-border bg-card p-6"
                >
                  {/* Journey Header */}
                  <div className="flex items-center gap-3 pb-4 border-b border-border mb-4">
                    <span className="text-2xl">{journey.icon}</span>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{journey.title}</h3>
                      <p className="text-xs text-muted-foreground">旅程</p>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="space-y-3">
                    {journey.steps.map((step) => (
                      <div key={step.num} className="flex gap-3">
                        <span className={`text-lg font-bold ${
                          journey.color === 'violet' ? 'text-violet-400' :
                          journey.color === 'emerald' ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {step.num}
                        </span>
                        <div>
                          <h4 className="text-sm font-medium text-foreground">{step.title}</h4>
                          <p className="text-xs text-muted-foreground">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Badges */}
                  {journey.badges.length > 0 && (
                    <div className="pt-4 mt-4 border-t border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-2">里程碑徽章</p>
                      <div className="flex flex-wrap gap-2">
                        {journey.badges.map((badge) => (
                          <div
                            key={badge.name}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-secondary text-xs"
                            title={badge.desc}
                          >
                            <span>{badge.icon}</span>
                            <span className="font-medium text-foreground">{badge.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Tech stack ────────────────────────────────────────────────── */}
        <section className="gallery-container py-16">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">技术框架</p>
            <h2 className="mt-2 text-3xl font-bold text-foreground">建立在什么之上</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              开源、可验证、去中心化 — 每一层都有据可查
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TECH.map((t) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4"
              >
                <span className="text-2xl">{t.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Values banner ─────────────────────────────────────────────── */}
        <section className="gallery-container py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden rounded-3xl border border-violet-200/20 bg-gradient-to-br from-violet-950/60 via-purple-900/40 to-fuchsia-950/50 px-8 py-14 text-center"
            style={{
              backgroundBlendMode: 'overlay',
              boxShadow: '0 0 80px -20px rgba(124,58,237,0.3)',
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">
              我们相信
            </p>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
              她的故事，不应该消失
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-violet-200/70">
              在一个内容随时可能被删除、平台随时可能关闭的网络里，
              HerGallery 用区块链为女性创作者提供一个不可撤销的存在证明。
              每一篇投稿、每一个推荐，都是无法被抹去的历史。
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-violet-300/80">
              <span>✦ 永久存证</span>
              <span>✦ 无需许可</span>
              <span>✦ 社区共治</span>
              <span>✦ 开源透明</span>
            </div>
          </motion.div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────────────── */}
        <section className="gallery-container pb-24 pt-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-foreground">准备好了吗？</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              加入 HerGallery，为她们的创作留下链上印记
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/gallery"
                className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow transition-all hover:bg-accent hover:shadow-lg"
              >
                浏览全部展厅
              </Link>
              <Link
                to="/create"
                className="rounded-full border border-border px-8 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                创建我的展厅
              </Link>
            </div>
          </motion.div>
        </section>
        {/* ── Tip platform ──────────────────────────────────────────────── */}
        <TipPlatformSection />

      </div>

      <Footer />
    </div>
  );
};

export default LandingPage;
