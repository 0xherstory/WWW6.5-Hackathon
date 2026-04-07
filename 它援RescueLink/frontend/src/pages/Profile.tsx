import MobileLayout from '@/components/MobileLayout';
import { mockUser } from '@/data/mockData';
import { ChevronRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { label: '我的订单', count: null, icon: '📦' },
  { label: '我发布的个案', count: mockUser.casesPublished, icon: '📝' },
  { label: '我关注的个案', count: mockUser.casesFollowed, icon: '⭐' },
  { label: '我参与的助力', count: mockUser.helpsGiven, icon: '🤝' },
  { label: '我更新的记录', count: 5, icon: '📋' },
  { label: '助力值记录', count: null, icon: '💰' },
];

const Profile = () => {
  const navigate = useNavigate();

  return (
    <MobileLayout>
      {/* Header */}
      <div className="bg-header-bg px-4 pb-5 pt-10">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-header-accent text-2xl">
            😊
          </div>
          <div>
            <p className="text-base font-bold text-header-fg">{mockUser.name}</p>
            <p className="text-xs text-header-fg/70">{mockUser.level}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-around rounded-xl bg-header-accent/60 p-3">
          <div className="text-center">
            <p className="text-xl font-bold text-header-fg">{mockUser.totalPoints}</p>
            <p className="text-[10px] text-header-fg/60">总助力值</p>
          </div>
          <div className="h-8 w-px bg-header-fg/15" />
          <div className="text-center">
            <p className="text-xl font-bold text-header-fg">{mockUser.casesPublished}</p>
            <p className="text-[10px] text-header-fg/60">发布个案</p>
          </div>
          <div className="h-8 w-px bg-header-fg/15" />
          <div className="text-center">
            <p className="text-xl font-bold text-header-fg">{mockUser.helpsGiven}</p>
            <p className="text-[10px] text-header-fg/60">助力次数</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-6">
        {/* Badges */}
        <div className="mt-4 rounded-xl bg-card p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground">🏅 公益徽章</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {mockUser.badges.map((b) => (
              <span key={b} className="rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent-foreground">
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Menu */}
        <div className="mt-4 rounded-xl bg-card shadow-sm">
          {menuItems.map((item, i) => (
            <button
              key={item.label}
              className={`flex w-full items-center gap-3 px-4 py-3.5 text-left ${
                i < menuItems.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <span>{item.icon}</span>
              <span className="flex-1 text-sm text-foreground">{item.label}</span>
              {item.count !== null && (
                <span className="text-xs text-muted-foreground">{item.count}</span>
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Points Source */}
        <div className="mt-4 rounded-xl bg-card p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground">💰 最近助力值记录</h3>
          <div className="mt-3 space-y-2">
            {[
              { action: '分享救助个案', points: '+5助力值', time: '今天 14:30' },
              { action: '阅读救助指南', points: '+10助力值', time: '今天 12:00' },
              { action: '购买公益文创', points: '+15助力值', time: '昨天 18:20' },
              { action: '扩散个案海报', points: '+10助力值', time: '昨天 10:00' },
              { action: '邀请新用户', points: '+20助力值', time: '3天前' },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                <div>
                  <p className="text-xs font-medium text-foreground">{r.action}</p>
                  <p className="text-[10px] text-muted-foreground">{r.time}</p>
                </div>
                <span className={`text-sm font-bold ${r.points.startsWith('+') ? 'text-primary' : 'text-muted-foreground'}`}>
                  {r.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Profile;
