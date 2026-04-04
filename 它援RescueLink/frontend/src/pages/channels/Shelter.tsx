import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/MobileLayout';
import { mockShelters, mockUser } from '@/data/mockData';
import { ArrowLeft, MapPin, Heart, Package, ChevronRight, Truck, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

const Shelter = () => {
  const navigate = useNavigate();
  const [expandedShelter, setExpandedShelter] = useState<string | null>(null);

  return (
    <MobileLayout hideTabBar>
      <div className="sticky top-0 z-40 flex items-center gap-3 bg-card/95 px-4 py-3 backdrop-blur border-b border-border">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></button>
        <span className="text-[15px] font-semibold text-foreground">小院补给</span>
      </div>

      {/* Intro banner */}
      <div className="mx-4 mt-3 rounded-xl bg-[hsl(38,55%,92%)] p-4">
        <h2 className="text-[15px] font-bold text-[hsl(24,45%,25%)]">长期照护，持续支持</h2>
        <p className="mt-1 text-[12px] leading-relaxed text-[hsl(24,30%,45%)]">
          小院补给是积分真正落地到宠物用品支持的场景。你的积分来自分享、扩散、学习等助力行为，在这里可以兑换物资直接寄送到认证小院。
        </p>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="text-[12px] text-[hsl(24,30%,45%)]">我的积分：</span>
          <span className="text-[16px] font-bold text-[hsl(24,75%,45%)]">{mockUser.totalPoints}</span>
        </div>
      </div>

      <div className="px-4 pb-6">
        {mockShelters.map((shelter) => {
          const isExpanded = expandedShelter === shelter.id;
          const unfulfilledNeeds = shelter.supplyNeeds.filter(n => !n.fulfilled);

          return (
            <div key={shelter.id} className="mt-3 rounded-xl bg-card shadow-sm overflow-hidden">
              {/* Shelter header */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-[hsl(28,60%,88%)] flex items-center justify-center">
                        <Heart className="h-5 w-5 text-[hsl(24,70%,50%)]" />
                      </div>
                      <div>
                        <h3 className="text-[14px] font-bold text-foreground">{shelter.name}</h3>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground">{shelter.location}</span>
                          <span className="text-[11px] text-muted-foreground">· {shelter.animalCount} 只在护</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
                    shelter.urgency === '紧缺' ? 'bg-urgent/10 text-urgent' : 'bg-muted text-muted-foreground'
                  }`}>{shelter.urgency}</span>
                </div>

                <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{shelter.description}</p>

                {/* Supply needs */}
                {unfulfilledNeeds.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[12px] font-medium text-foreground">当前补给需求</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {shelter.supplyNeeds.map(need => (
                        <span key={need.id} className={`rounded-full px-2.5 py-1 text-[11px] ${
                          need.fulfilled
                            ? 'bg-primary/10 text-primary line-through'
                            : 'bg-[hsl(24,50%,93%)] text-[hsl(24,50%,35%)] font-medium'
                        }`}>
                          {need.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setExpandedShelter(isExpanded ? null : shelter.id)}
                  className="mt-3 flex w-full items-center justify-center gap-1 text-[12px] font-medium text-primary"
                >
                  {isExpanded ? '收起' : '查看可兑换物资与反馈'}
                  <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>
              </div>

              {/* Expanded: redeemable items + feedback */}
              {isExpanded && (
                <div className="border-t border-border px-4 pb-4 pt-3">
                  {/* Redeemable items */}
                  <p className="text-[12px] font-semibold text-foreground">可兑换物资</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">用积分直接买给小院，含实时物流追踪</p>
                  <div className="mt-2 space-y-2">
                    {shelter.redeemableItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Package className="h-4 w-4 shrink-0 text-[hsl(24,60%,50%)]" />
                          <div className="min-w-0">
                            <p className="text-[12px] font-medium text-foreground truncate">{item.name}</p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Truck className="h-3 w-3" /> {item.desc}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => toast.success(`已兑换「${item.name}」，将直接寄送到小院`)}
                          className="shrink-0 ml-2 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground transition-transform active:scale-95"
                        >
                          {item.pointsCost} 积分兑换
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Feedback */}
                  {shelter.feedbackMessages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-[12px] font-semibold text-foreground flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5 text-primary" />
                        小院反馈
                      </p>
                      <div className="mt-1.5 space-y-1.5">
                        {shelter.feedbackMessages.map((msg, i) => (
                          <div key={i} className="rounded-lg bg-[hsl(38,55%,95%)] p-2.5">
                            <p className="text-[11px] leading-relaxed text-[hsl(24,35%,35%)]">{msg}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </MobileLayout>
  );
};

export default Shelter;
