import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Loader2 } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import ExhibitionInfo from '@/components/Exhibition/ExhibitionInfo';
import SubmissionList from '@/components/Submission/SubmissionList';
import SubmitModal from '@/components/Submission/SubmitModal';
import { useExhibition, useSubmissions, useSubmitToExhibition, useHasSubmitted, parseExhibition, parseSubmissions } from '@/hooks/useContract';
import { getAllIPFSUrls } from '@/services/ipfs';
import { usePOAP } from '@/context/POAPContext';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

const ExhibitionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const exhibitionId = Number(id);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  const { isConnected, address } = useAccount();
  const { triggerFirstSubmission } = usePOAP();
  const { data: hasSubmittedBefore } = useHasSubmitted(address || '');
  const { data: rawExhibition, isLoading: exhibitionLoading, error: exhibitionError, refetch: refetchExhibition } = useExhibition(exhibitionId);
  const { data: rawSubmissions, isLoading: submissionsLoading, refetch: refetchSubmissions } = useSubmissions(exhibitionId);

  const exhibition = parseExhibition(rawExhibition);
  const submissions = parseSubmissions(rawSubmissions);
  const isCurator =
    !!address && !!exhibition && address.toLowerCase() === exhibition.curator.toLowerCase();

  // Load cover image when exhibition changes
  useEffect(() => {
    if (exhibition?.coverHash) {
      const urls = getAllIPFSUrls(exhibition.coverHash);
      setCoverUrl(urls[0] || null);
    } else {
      setCoverUrl(null);
    }
  }, [exhibition?.coverHash]);

  const handleCoverError = () => {
    if (exhibition?.coverHash) {
      const urls = getAllIPFSUrls(exhibition.coverHash);
      const currentIndex = urls.indexOf(coverUrl || '');
      if (currentIndex < urls.length - 1) {
        setCoverUrl(urls[currentIndex + 1]);
      }
    }
  };

  const { submitToExhibition } = useSubmitToExhibition(async () => {
    toast.success('投稿已提交，等待策展人审核');
    await new Promise((resolve) => setTimeout(resolve, 1500));
    refetchSubmissions();
    if (!hasSubmittedBefore) {
      triggerFirstSubmission();
    }
  });

  const totalRecommends = submissions.reduce((sum, s) => sum + s.recommendCount, 0);
  const totalWitnesses = submissions.reduce((sum, s) => sum + s.witnessCount, 0);

  const handleSubmit = async (data: { contentType: string; content: string; title: string; description: string }) => {
    if (!isConnected) {
      toast.error('请先连接钱包');
      return;
    }
    if (!data.title.trim() || !data.description.trim()) {
      toast.error('请填写标题和说明');
      return;
    }

    setShowSubmitModal(false);

    try {
      await submitToExhibition({
        exhibitionId,
        contentType: data.contentType,
        content: data.content,
        title: data.title,
        description: data.description,
      });
    } catch (err: any) {
      toast.error(err.message || '投稿失败，请重试');
    }
  };

  if (exhibitionLoading) {
    return (
      <Layout>
        <div className="gallery-container py-24 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        </div>
      </Layout>
    );
  }

  if (!exhibition) {
    return (
      <Layout>
        <div className="gallery-container py-24 text-center">
          <p className="text-destructive">加载失败，请检查网络和钱包连接</p>
          <Link to="/gallery" className="mt-4 inline-block text-sm text-primary hover:underline">
            返回展厅列表
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="gallery-container">
        <Link to="/gallery" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
          ← 返回展厅列表
        </Link>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Cover */}
            <div className="aspect-video rounded-2xl bg-muted mb-6 flex items-center justify-center text-muted-foreground/30 overflow-hidden">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={exhibition.title}
                  className="w-full h-full object-cover"
                  onError={handleCoverError}
                />
              ) : (
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
              )}
            </div>

            <h1 className="text-2xl font-bold text-foreground sm:text-3xl mb-4">
              {exhibition.title}
            </h1>

            {/* Content */}
            <div className="prose prose-sm max-w-none mb-8 rounded-xl bg-card border border-border p-6">
              {exhibition.content ? (
                <div className="text-muted-foreground leading-relaxed">
                  <ReactMarkdown>{exhibition.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-muted-foreground leading-relaxed">
                  这是展厅的主题介绍区域。
                </p>
              )}
            </div>

            {/* Submissions */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                投稿作品 <span className="text-sm font-normal text-muted-foreground">({submissions.length})</span>
              </h2>
              <div className="flex items-center gap-3">
                {isCurator && (
                  <Link
                    to={`/exhibition/${exhibitionId}/manage`}
                    className="rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    管理投稿
                  </Link>
                )}
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent"
                >
                  我要投稿
                </button>
              </div>
            </div>

            {submissionsLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}

            {!submissionsLoading && (
              <SubmissionList
                submissions={submissions}
                exhibitionId={exhibitionId}
                isActive={!exhibition.flagged}
                isCurator={isCurator}
              />
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full shrink-0 lg:w-80">
            <div className="sticky top-24">
              <ExhibitionInfo
                exhibition={exhibition}
                totalRecommends={totalRecommends}
                totalWitnesses={totalWitnesses}
                firstSubmissionId={submissions.find(s => s.status === 1)?.id}
                onTipSuccess={() => {
                  refetchExhibition();
                }}
              />
            </div>
          </aside>
        </div>
      </div>

      {showSubmitModal && (
        <SubmitModal
          exhibitionId={exhibitionId}
          onClose={() => setShowSubmitModal(false)}
          onSuccess={() => setShowSubmitModal(false)}
          onSubmit={handleSubmit}
          isLoading={false}
        />
      )}
    </Layout>
  );
};

export default ExhibitionDetailPage;
