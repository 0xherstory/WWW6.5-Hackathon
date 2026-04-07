import { useParams, useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/MobileLayout';
import { getCaseById } from '@/lib/caseStore';
import { mockCases } from '@/data/mockData';
import { getPublisherForCase } from '@/data/publishers';
import PublisherBadge from '@/components/PublisherBadge';
import { ArrowLeft, Share2, Shield, CheckCircle2, Clock, Link2, AlertTriangle, Flame, ChevronRight, Star, Copy, Image, MessageSquare, Phone, PawPrint, ChevronDown, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import cat1 from '@/assets/cat1.jpg';
import dog1 from '@/assets/dog1.jpg';
import cat2 from '@/assets/cat2.jpg';
import dog2 from '@/assets/dog2.jpg';
import dog3 from '@/assets/dog3.jpg';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';

const caseImages: Record<string, string> = { '1': cat1, '2': dog1, '3': cat2, '4': dog2, '5': dog3 };
const caseNumbers: Record<string, number> = { '1': 241, '2': 242, '3': 243, '4': 244, '5': 245 };

const PawClapAnimation = ({ onDone }: { onDone: () => void }) => {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-none">
      <div className="animate-paw-clap flex flex-col items-center" onAnimationEnd={onDone}>
        <div className="flex items-center gap-1">
          <span className="text-5xl animate-paw-left">🐾</span>
          <span className="text-5xl animate-paw-right">🐾</span>
        </div>
        <span className="mt-2 text-[17px] font-bold text-primary animate-fade-in">热力 +1</span>
      </div>
    </div>
  );
};

const CaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const caseItem = getCaseById(id || '');
  const [saved, setSaved] = useState(false);
  const [showPawClap, setShowPawClap] = useState(false);
  const [localHeat, setLocalHeat] = useState(0);
  const [todayBoosts, setTodayBoosts] = useState(0);
  const [contactRevealed, setContactRevealed] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [needsExpanded, setNeedsExpanded] = useState(false);
  const [helpDrawerOpen, setHelpDrawerOpen] = useState(false);
  const [selectedNeed, setSelectedNeed] = useState<string | null>(null);

  if (!caseItem) {
    return (
      <MobileLayout hideTabBar>
        <div className="flex h-screen items-center justify-center text-muted-foreground">个案未找到</div>
      </MobileLayout>
    );
  }

  const heatDisplay = localHeat || caseItem.heatValue;
  const publisher = getPublisherForCase(caseItem.id);
  const imgSrc = caseItem.image || caseImages[caseItem.id || '1'] || cat1;
  const extra = (caseItem as any)._extra;
  const caseNo = extra?.caseNo || caseNumbers[caseItem.id] || parseInt(caseItem.id) || 0;
  const formattedNo = String(caseNo).padStart(5, '0');
  const txHash = extra?.txHash || caseItem.evidences?.[0]?.chainHash || '';

  const helpNeeds = caseItem.needs.filter((n) => n.category === 'help');

  const records = [
    ...caseItem.timeline.map((t, i) => ({
      id: `t-${i}`,
      title: t.content,
      desc: '',
      time: t.date,
      tag: t.type === 'milestone' ? '基础记录' : '进展更新',
      isEvidence: false,
      chainStatus: undefined as string | undefined,
    })),
    ...caseItem.evidences.map((ev) => ({
      id: ev.id,
      title: ev.type.startsWith('已') ? ev.type : `已上传${ev.type}`,
      desc: ev.chainStatus === 'stored' ? '链上记录已生成' : '',
      time: ev.uploadedAt,
      tag: '关键凭证',
      isEvidence: true,
      chainStatus: ev.chainStatus,
    })),
  ].sort((a, b) => b.time.localeCompare(a.time));

  const handleBoost = () => {
    if (todayBoosts >= 5) {
      toast('明天再来帮它顶一顶吧～', { duration: 2000 });
      return;
    }
    setTodayBoosts(prev => prev + 1);
    setLocalHeat(prev => (prev || caseItem.heatValue) + 1);
    setShowPawClap(true);
  };

  const handleCopyText = () => {
    const text = `【${caseItem.title}】\n${caseItem.description.slice(0, 80)}...\n当前状态：${caseItem.status}\n需要帮助：${helpNeeds.filter(n => !n.fulfilled).map(n => n.name).join('、')}\n📍 ${caseItem.city}\n#它援RescueLink #案号${formattedNo}`;
    navigator.clipboard.writeText(text).then(() => toast.success('已复制扩散文案'));
  };

  const handleHelpClick = (needName: string) => {
    setSelectedNeed(needName);
    setHelpDrawerOpen(true);
  };

  const handleCopyContact = () => {
    navigator.clipboard.writeText(caseItem.contact);
    toast.success('已复制联系方式');
  };

  const handleCopyPresetMsg = () => {
    const msg = `你好，我看到了个案「${caseItem.title}」，我可能可以帮助「${selectedNeed}」这项需求，方便沟通一下具体情况吗？`;
    navigator.clipboard.writeText(msg);
    toast.success('已复制预设消息');
  };

  const descriptionShort = caseItem.description.length > 80 ? caseItem.description.slice(0, 80) + '…' : caseItem.description;
  const needsLong = helpNeeds.length > 3;
  const visibleNeeds = helpNeeds.slice(0, 3);
  const hiddenNeeds = helpNeeds.slice(3);

  return (
    <MobileLayout hideTabBar>
      {showPawClap && <PawClapAnimation onDone={() => setShowPawClap(false)} />}

      {/* A. Cover image */}
      <div className="relative">
        <img src={imgSrc} alt={caseItem.title} className="h-56 w-full object-cover" />
        <div className="absolute left-3 top-3">
          <button onClick={() => navigate(-1)} className="rounded-full bg-black/30 p-2 backdrop-blur">
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
        </div>
        <div className="absolute right-3 top-3 flex gap-2">
          <button onClick={() => { setSaved(!saved); toast.success(saved ? '已取消收藏' : '已收藏'); }} className="rounded-full bg-black/30 p-2 backdrop-blur">
            <Star className={`h-5 w-5 ${saved ? 'fill-white text-white' : 'text-white'}`} />
          </button>
          <button onClick={() => toast.success('已生成分享内容')} className="rounded-full bg-black/30 p-2 backdrop-blur">
            <Share2 className="h-5 w-5 text-white" />
          </button>
        </div>
        {caseItem.isUrgent && (
          <div className="absolute left-3 bottom-3 flex items-center gap-1 rounded-lg bg-urgent px-2.5 py-1 shadow-md">
            <AlertTriangle className="h-3.5 w-3.5 text-urgent-foreground" />
            <span className="text-[13px] font-bold text-urgent-foreground">{caseItem.urgencyLevel}</span>
          </div>
        )}
        {/* Heat badge */}
        <div className="absolute right-3 bottom-3 flex items-center gap-1 rounded-lg bg-black/30 px-2.5 py-1 backdrop-blur">
          <Flame className="h-3.5 w-3.5 text-[hsl(24,90%,60%)]" />
          <span className="text-[13px] font-bold text-white">{heatDisplay}</span>
        </div>
      </div>

      <div className="pb-24">
        <div className="px-4">
          {/* B. Case header */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[12px] font-medium text-muted-foreground">#{formattedNo}</span>
            <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-[12px] font-medium text-primary">{caseItem.status}</span>
            <span className="rounded-lg bg-muted px-2 py-0.5 text-[12px] text-muted-foreground">{caseItem.animalType}</span>
            {caseItem.urgencyLevel !== '一般' && (
              <span className={`rounded-lg px-2 py-0.5 text-[12px] font-medium ${
                caseItem.urgencyLevel === '紧急' ? 'bg-urgent/10 text-urgent' : 'bg-[hsl(35,80%,90%)] text-[hsl(30,70%,35%)]'
              }`}>{caseItem.urgencyLevel}</span>
            )}
          </div>

          <h1 className="mt-2 text-[20px] font-bold leading-snug text-foreground">{caseItem.title}</h1>

          <div className="mt-1.5 flex items-center gap-1 text-[13px] text-muted-foreground">
            {publisher && <span>{publisher.name}发起</span>}
            <span>·</span>
            <span>{caseItem.city}</span>
            {caseItem.distance && (
              <>
                <span>·</span>
                <span>{caseItem.distance}</span>
              </>
            )}
            <span>· {caseItem.updatedAt}</span>
          </div>

          {/* Heat inline signal + lightweight boost */}
          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-[hsl(24,80%,55%)]" />
              <span>已有 {heatDisplay} 人次为它顶过</span>
            </div>
            <button
              onClick={handleBoost}
              className="flex items-center gap-0.5 rounded-full bg-[hsl(24,55%,92%)] px-2 py-0.5 text-[11px] font-medium text-[hsl(24,55%,35%)] transition-transform active:scale-95"
            >
              <PawPrint className="h-3 w-3" strokeWidth={2.5} />
              顶一顶
            </button>
          </div>

          {/* A. 当前情况 */}
          <div className="mt-4 rounded-xl bg-card p-4 shadow-sm">
            <h2 className="text-[15px] font-semibold text-foreground">当前情况</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-foreground">
              {descExpanded ? caseItem.description : descriptionShort}
            </p>
            {caseItem.description.length > 80 && (
              <button
                onClick={() => setDescExpanded(!descExpanded)}
                className="mt-1 flex items-center gap-0.5 text-[12px] font-medium text-primary"
              >
                {descExpanded ? '收起' : '展开查看更多'}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${descExpanded ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>

          {/* B. 发起人已处理 */}
          {caseItem.initiatorDone.length > 0 && (
            <div className="mt-2 rounded-xl bg-muted/40 px-4 py-3">
              <h2 className="text-[13px] font-semibold text-muted-foreground">发起人已处理</h2>
              <div className="mt-1.5 space-y-1">
                {caseItem.initiatorDone.map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 shrink-0 text-primary/70" />
                    <span className="text-[12px] text-foreground/80">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* C. 当前还需要 - actionable needs */}
          {helpNeeds.length > 0 && (
            <div className="mt-3 rounded-xl bg-card p-4 shadow-sm ring-1 ring-urgent/10">
              <h2 className="text-[15px] font-semibold text-foreground">当前还需要</h2>
              <div className="mt-3 space-y-2">
                {visibleNeeds.map((n) => (
                  <div key={n.id} className="flex items-start gap-2.5">
                    <div className="mt-1">
                      {n.fulfilled ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      ) : (
                        <div className="h-4 w-4 shrink-0 rounded-full border-2 border-urgent/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-[13px] font-medium ${n.fulfilled ? 'text-primary/60 line-through' : 'text-foreground'}`}>
                        {n.name}
                      </span>
                      {n.desc && <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">{n.desc}</p>}
                    </div>
                    {!n.fulfilled ? (
                      <button
                        onClick={() => handleHelpClick(n.name)}
                        className="shrink-0 rounded-lg bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground transition-transform active:scale-95"
                      >
                        我来帮忙
                      </button>
                    ) : (
                      <span className="shrink-0 rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
                        已有人帮忙
                      </span>
                    )}
                  </div>
                ))}
                {needsLong && !needsExpanded && (
                  <button
                    onClick={() => setNeedsExpanded(true)}
                    className="flex items-center gap-0.5 text-[12px] font-medium text-primary ml-6"
                  >
                    查看更多需求 <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                )}
                {needsExpanded && hiddenNeeds.map((n) => (
                  <div key={n.id} className="flex items-start gap-2.5">
                    <div className="mt-1">
                      {n.fulfilled ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      ) : (
                        <div className="h-4 w-4 shrink-0 rounded-full border-2 border-urgent/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-[13px] font-medium ${n.fulfilled ? 'text-primary/60 line-through' : 'text-foreground'}`}>
                        {n.name}
                      </span>
                      {n.desc && <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">{n.desc}</p>}
                    </div>
                    {!n.fulfilled ? (
                      <button
                        onClick={() => handleHelpClick(n.name)}
                        className="shrink-0 rounded-lg bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground transition-transform active:scale-95"
                      >
                        我来帮忙
                      </button>
                    ) : (
                      <span className="shrink-0 rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
                        已有人帮忙
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-3 rounded-lg bg-muted/60 px-3 py-2 text-[11px] text-muted-foreground leading-relaxed">
                平台不直接接受募捐。如愿意提供资金支持，请直接联系发起人确认方式。
              </p>
            </div>
          )}

          {/* D. 帮它扩散 - spread tools */}
          <div className="mt-3 rounded-xl bg-muted/40 px-4 py-3">
            <h2 className="text-[14px] font-semibold text-foreground">帮它扩散</h2>
            <div className="mt-2.5 flex gap-2">
              <button
                onClick={() => toast.success('海报生成中…')}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-card py-2.5 text-[13px] font-medium text-foreground shadow-sm transition-transform active:scale-[0.97]"
              >
                <Image className="h-4 w-4 text-primary" />
                生成海报
              </button>
              <button
                onClick={handleCopyText}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-card py-2.5 text-[13px] font-medium text-foreground shadow-sm transition-transform active:scale-[0.97]"
              >
                <Copy className="h-3.5 w-3.5 text-primary" />
                复制文案
              </button>
              <button
                onClick={() => toast.success('已生成小程序卡片')}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-card py-2.5 text-[13px] font-medium text-foreground shadow-sm transition-transform active:scale-[0.97]"
              >
                <MessageSquare className="h-3.5 w-3.5 text-primary" />
                转发小程序
              </button>
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed">
              分享、扩散和持续更新，都能帮助个案获得更多关注；完成扩散后可累计助力值。
            </p>
          </div>

          {/* E. Timeline records */}
          <div className="mt-3 rounded-xl bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 text-[15px] font-semibold text-foreground">
                <Shield className="h-4 w-4 text-primary" />
                个案记录
              </h2>
              <span className="text-[11px] text-muted-foreground">按时间倒序</span>
            </div>
            <div className="mt-3 space-y-0">
              {records.map((r, i) => (
                <div key={r.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`mt-1 h-2 w-2 rounded-full ${r.isEvidence ? 'bg-[hsl(24,75%,50%)]' : 'bg-muted-foreground/25'}`} />
                    {i < records.length - 1 && <div className="flex-1 w-px bg-border" />}
                  </div>
                  <div className="pb-3.5">
                    <p className="text-[13px] font-medium text-foreground leading-snug">{r.title}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground">{r.time}</span>
                      <span className={`rounded px-1.5 py-px text-[10px] font-medium ${
                        r.tag === '关键凭证'
                          ? 'bg-[hsl(35,60%,93%)] text-[hsl(28,55%,35%)]'
                          : 'bg-muted text-muted-foreground'
                      }`}>{r.tag}</span>
                      {r.chainStatus === 'stored' && (
                        <span className="flex items-center gap-0.5 rounded border border-primary/20 px-1.5 py-px text-[10px] font-medium text-primary">
                          <Link2 className="h-2.5 w-2.5" /> 已存证
                        </span>
                      )}
                      {r.chainStatus === 'pending' && (
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground/60">
                          <Clock className="h-2.5 w-2.5" /> 存证处理中
                        </span>
                      )}
                    </div>
                    {r.desc && <p className="mt-0.5 text-[10px] text-muted-foreground">{r.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Publisher info */}
          {publisher && (
            <button
              onClick={() => navigate(`/publisher/${publisher.id}`)}
              className="mt-3 flex w-full items-center justify-between rounded-xl bg-muted/50 px-3 py-2.5"
            >
              <PublisherBadge publisher={publisher} size="md" showStats />
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
            </button>
          )}
        </div>
      </div>

      {/* Fixed bottom bar: 去扩散 + 联系发起人 */}
      <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 border-t border-border bg-card px-4 py-3 safe-bottom">
        <div className="flex gap-3">
          <button
            onClick={handleCopyText}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-5 py-3 text-[14px] font-semibold text-foreground transition-colors active:bg-muted"
          >
            <ExternalLink className="h-4 w-4 text-primary" />
            去扩散
          </button>
          <button
            onClick={() => setContactRevealed(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-[15px] font-semibold text-primary-foreground transition-colors active:bg-primary/90"
          >
            <Phone className="h-4 w-4" />
            联系发起人
          </button>
        </div>
      </div>

      {/* Contact reveal dialog */}
      <Drawer open={contactRevealed} onOpenChange={setContactRevealed}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>联系发起人</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">
            <div className="rounded-lg bg-[hsl(38,55%,95%)] p-3">
              <p className="text-[14px] font-medium text-foreground">{caseItem.contact}</p>
              <button
                onClick={handleCopyContact}
                className="mt-2 flex items-center gap-1 text-[12px] font-medium text-primary"
              >
                <Copy className="h-3 w-3" /> 复制联系方式
              </button>
            </div>
            <p className="mt-3 text-[12px] text-muted-foreground leading-relaxed">
              如可提供安置、转运、领养接手或资金支持，请直接联系发起人确认细节。
            </p>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Help offer drawer */}
      <Drawer open={helpDrawerOpen} onOpenChange={setHelpDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>帮助「{selectedNeed}」</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 space-y-3">
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              你可以直接联系发起人，沟通这项需求的具体情况。
            </p>

            <div className="rounded-lg bg-[hsl(38,55%,95%)] p-3">
              <p className="text-[14px] font-medium text-foreground">{caseItem.contact}</p>
              <button
                onClick={handleCopyContact}
                className="mt-2 flex items-center gap-1 text-[12px] font-medium text-primary"
              >
                <Copy className="h-3 w-3" /> 复制联系方式
              </button>
            </div>

            <div className="rounded-lg border border-border p-3">
              <p className="text-[11px] font-medium text-muted-foreground mb-1.5">预设消息</p>
              <p className="text-[12px] text-foreground leading-relaxed">
                你好，我看到了个案「{caseItem.title}」，我可能可以帮助「{selectedNeed}」这项需求，方便沟通一下具体情况吗？
              </p>
              <button
                onClick={handleCopyPresetMsg}
                className="mt-2 flex items-center gap-1 text-[12px] font-medium text-primary"
              >
                <Copy className="h-3 w-3" /> 复制消息
              </button>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              个案的实际帮助主要在线下完成，请直接与发起人确认需求细节。
            </p>
          </div>
        </DrawerContent>
      </Drawer>
    </MobileLayout>
  );
};

export default CaseDetail;
