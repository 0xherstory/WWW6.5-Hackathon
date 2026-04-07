import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Shield, Heart, User } from 'lucide-react';

const tabs = [
  { path: '/', label: '首页', icon: Home },
  { path: '/rescue', label: '救助', icon: Shield },
  { path: '/help-center', label: '助力', icon: Heart },
  { path: '/profile', label: '我的', icon: User },
];

interface MobileLayoutProps {
  children: ReactNode;
  hideTabBar?: boolean;
}

const MobileLayout = ({ children, hideTabBar }: MobileLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="mx-auto flex min-h-screen w-full sm:max-w-[430px] flex-col bg-background">
      <main className={`flex-1 ${hideTabBar ? '' : 'pb-16'}`}>
        {children}
      </main>
      {!hideTabBar && (
        <nav className="fixed bottom-0 left-1/2 z-50 w-full sm:max-w-[430px] -translate-x-1/2 border-t border-border bg-card safe-bottom">
          <div className="flex h-14 items-center justify-around">
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.path;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className={`flex flex-col items-center gap-0.5 px-4 py-1 transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.8} />
                  <span className="text-[11px] font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
};

export default MobileLayout;
