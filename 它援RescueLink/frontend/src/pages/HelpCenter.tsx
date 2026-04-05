import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/MobileLayout';
import { helpActions, caseHelpActions, mockCases } from '@/data/mockData';
import { ChevronRight, Flame } from 'lucide-react';

const HelpCenter = () => {
  const navigate = useNavigate();

  return (
    <MobileLayout>
      <div className="bg-header-bg px-4 pb-4 pt-10">
        <h1 className="text-lg font-bold text-header-fg">助力中心</h1>
        <p className="mt-1 text-xs text-header-fg/70">每一次参与都是温暖的力量</p>
      </div>

      <div className="px-4 pb-6">
        {/* Daily earn section */}
        <div className="mt-4">
          <h2 className="mb-2 text-sm font-semibold text-foreground">🌟 获取助力值</h2>
          <div className="space-y-2">
            {helpActions.map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  if (a.name.includes('商城')) navigate('/shop');
                  else if (a.name.includes('指南')) navigate('/guide');
                }}
                className="flex w-full items-center gap-3 rounded-xl bg-card p-3 text-left shadow-sm transition-transform active:scale-[0.98]"
              >
                <span className="text-2xl">{a.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-points">+{a.points}助力值</span>
                  {a.daily && <p className="text-[10px] text-muted-foreground">每日可得</p>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* How to help section */}
        <div className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-foreground">🐾 如何支持个案</h2>
          <div className="space-y-2">
            {caseHelpActions.map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  if (a.name.includes('查看')) navigate('/');
                }}
                className="flex w-full items-center gap-3 rounded-xl bg-card p-3 text-left shadow-sm transition-transform active:scale-[0.98]"
              >
                <span className="text-2xl">{a.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>

        {/* Quick entries */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/shop')}
            className="rounded-xl bg-accent/15 p-4 text-left transition-colors active:bg-accent/25"
          >
            <span className="text-2xl">🛍️</span>
            <p className="mt-1 text-sm font-medium text-foreground">公益商城</p>
            <p className="text-xs text-muted-foreground">购买即助力</p>
          </button>
          <button
            onClick={() => navigate('/guide')}
            className="rounded-xl bg-primary/10 p-4 text-left transition-colors active:bg-primary/20"
          >
            <span className="text-2xl">📖</span>
            <p className="mt-1 text-sm font-medium text-foreground">救助指南</p>
            <p className="text-xs text-muted-foreground">学习即获助力值</p>
          </button>
        </div>

        {/* Cases needing attention */}
        <div className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-foreground">🆘 正在等待帮助</h2>
          {mockCases
            .filter((c) => c.needs.some(n => !n.fulfilled))
            .slice(0, 3)
            .map((c) => {
              const unfulfilledCount = c.needs.filter(n => !n.fulfilled && n.category === 'help').length;
              return (
                <button
                  key={c.id}
                  onClick={() => navigate(`/case/${c.id}`)}
                  className="mb-2 flex w-full items-center gap-3 rounded-xl bg-card p-3 text-left shadow-sm active:scale-[0.98]"
                >
                  <div className="flex items-center gap-1">
                    <Flame className="h-4 w-4 text-[hsl(24,80%,55%)]" />
                    <span className="text-[12px] font-bold text-[hsl(24,60%,40%)]">{c.heatValue}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground line-clamp-1">{c.title}</p>
                    <p className="text-xs text-muted-foreground">还需 <span className="font-semibold text-foreground">{unfulfilledCount}</span> 项帮助</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              );
            })}
        </div>
      </div>
    </MobileLayout>
  );
};

export default HelpCenter;
