import { useParams, useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/MobileLayout';
import { mockPublishers } from '@/data/publishers';
import { mockCases } from '@/data/mockData';
import { casePublisherMap } from '@/data/publishers';
import { ArrowLeft, BadgeCheck, User, MapPin, Star, Heart } from 'lucide-react';
import { toast } from 'sonner';
import CaseCard from '@/components/CaseCard';

const PublisherProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const publisher = mockPublishers.find((p) => p.id === id);

  if (!publisher) {
    return (
      <MobileLayout hideTabBar>
        <div className="flex h-screen items-center justify-center text-muted-foreground">用户未找到</div>
      </MobileLayout>
    );
  }

  const isShelter = publisher.type === 'shelter';
  const publisherCases = mockCases.filter((c) => casePublisherMap[c.id] === publisher.id);

  return (
    <MobileLayout hideTabBar>
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between bg-card/95 px-4 py-3 backdrop-blur">
        <button onClick={() => navigate(-1)} className="rounded-full p-1">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <span className="text-sm font-semibold text-foreground">{isShelter ? '小院主页' : '个人主页'}</span>
        <div className="w-7" />
      </div>

      <div className="px-4 pb-24">
        {/* Profile Card */}
        <div className="mt-2 rounded-xl bg-card p-4 shadow-sm">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${isShelter ? 'bg-primary/10 ring-2 ring-primary/30' : 'bg-muted'}`}>
              {isShelter ? (
                <BadgeCheck className="h-7 w-7 text-primary" />
              ) : (
                <User className="h-7 w-7 text-muted-foreground" />
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-foreground">{publisher.name}</h1>
                {isShelter && publisher.certifiedShelter && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    认证小院
                  </span>
                )}
                {!isShelter && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    个人救助人
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {publisher.city}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{publisher.bio}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[
              { label: '积分', value: publisher.totalPoints, icon: <Star className="h-3 w-3 text-points" /> },
              { label: '个案', value: publisher.casesPublished },
              { label: '更新', value: publisher.updatesCount },
              { label: '关注者', value: publisher.followers },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center rounded-lg bg-muted/60 py-2">
                <div className="flex items-center gap-0.5">
                  {s.icon}
                  <span className="text-sm font-bold text-foreground">{s.value}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Follow button */}
          <button
            onClick={() => toast.success('已关注')}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground transition-colors active:bg-primary/90"
          >
            <Heart className="h-4 w-4" />
            关注
          </button>
        </div>

        {/* Long-term needs (shelter only) */}
        {isShelter && publisher.longTermNeeds && publisher.longTermNeeds.length > 0 && (
          <div className="mt-4 rounded-xl bg-card p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground">📦 长期需求</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {publisher.longTermNeeds.map((need) => (
                <span key={need} className="rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-medium text-accent-foreground">
                  {need}
                </span>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">这些是小院长期需要的物资，欢迎认领支持 💛</p>
          </div>
        )}

        {/* Help received */}
        <div className="mt-4 rounded-xl bg-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">💝 收到的助力</h2>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex flex-col items-center rounded-lg bg-primary/5 px-4 py-2">
              <span className="text-lg font-bold text-primary">{publisher.helpsReceived}</span>
              <span className="text-[10px] text-muted-foreground">次助力</span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {isShelter 
                ? `${publisher.name} 已收到来自社区的 ${publisher.helpsReceived} 次积分赠送和物资认领`
                : `${publisher.name} 发起的个案共收到 ${publisher.helpsReceived} 次社区助力`
              }
            </p>
          </div>
        </div>

        {/* Published cases */}
        <div className="mt-4">
          <h2 className="mb-2 text-sm font-semibold text-foreground">
            📋 {isShelter ? '已发布个案' : '发起的个案'}
          </h2>
          {publisherCases.length > 0 ? (
            publisherCases.map((c) => <CaseCard key={c.id} caseItem={c} />)
          ) : (
            <div className="rounded-xl bg-card p-6 text-center text-xs text-muted-foreground shadow-sm">
              暂无个案
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default PublisherProfile;
