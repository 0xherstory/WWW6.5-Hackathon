import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useHasSetUsername, useUsername } from '@/hooks/useContract';
import UsernameModal from '@/components/ui/UsernameModal';

const Header = () => {
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isLanding = location.pathname === '/';

  useEffect(() => {
    if (!isLanding) { setScrolled(false); return; }
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight - 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isLanding]);

  const transparent = isLanding && !scrolled;

  const { data: hasSetUsername, refetch: refetchHasSetUsername } = useHasSetUsername(address || '');
  const { data: username, refetch: refetchUsername } = useUsername(address || '');

  const navItems = [
    { path: '/gallery', label: '展厅' },
    { path: '/create', label: '创建' },
    ...(isConnected ? [{ path: '/me', label: '我的记录' }] : []),
  ];

  const handleWalletClick = () => {
    if (isConnected) {
      disconnect();
    } else {
      const injected = connectors.find(c => c.name === 'Injected');
      if (injected) {
        connect({ connector: injected });
      }
    }
  };

  const displayName = isConnected ? (username && username.trim() ? username.trim() : '云吃吃') : null;

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          transparent
            ? 'border-b border-transparent bg-transparent'
            : 'border-b border-border bg-card/80 backdrop-blur-md'
        }`}
      >
        <div className="gallery-container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className={`text-xl font-bold transition-colors ${transparent ? 'text-violet-300' : 'text-primary'}`}>
              ✿
            </span>
            <span className={`text-lg font-semibold tracking-tight transition-colors ${transparent ? 'text-white' : 'text-foreground'}`}>
              HerGallery
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative px-4 py-2 text-sm font-medium transition-colors"
              >
                <span
                  className={
                    location.pathname === item.path
                      ? transparent ? 'text-violet-300' : 'text-primary'
                      : transparent
                        ? 'text-white/70 hover:text-white'
                        : 'text-muted-foreground hover:text-foreground'
                  }
                >
                  {item.label}
                </span>
                {location.pathname === item.path && (
                  <motion.div
                    layoutId="nav-indicator"
                    className={`absolute bottom-0 left-2 right-2 h-0.5 rounded-full ${transparent ? 'bg-violet-400' : 'bg-primary'}`}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}

            {isConnected ? (
              <div className="ml-4 flex items-center gap-2">
                <button
                  onClick={() => setShowUsernameModal(true)}
                  className={`flex h-9 items-center rounded-full border px-4 text-sm font-medium transition-colors cursor-pointer ${
                    transparent
                      ? 'border-white/25 text-white hover:bg-white/10'
                      : 'border-border text-foreground hover:bg-secondary'
                  }`}
                >
                  {displayName}
                </button>
                <button
                  onClick={handleWalletClick}
                  className={`flex h-9 items-center rounded-full border px-3 text-sm font-medium transition-colors cursor-pointer ${
                    transparent
                      ? 'border-white/20 text-white/60 hover:bg-white/10'
                      : 'border-border text-muted-foreground hover:bg-secondary'
                  }`}
                  title="断开钱包"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={handleWalletClick}
                className={`ml-4 flex h-9 items-center rounded-full border px-4 text-sm font-medium transition-colors cursor-pointer ${
                  transparent
                    ? 'border-white/30 text-white hover:bg-white/15'
                    : 'border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground'
                }`}
              >
                连接钱包
              </button>
            )}
          </nav>
        </div>
      </header>

      <UsernameModal
        isOpen={showUsernameModal}
        onClose={() => setShowUsernameModal(false)}
        onUsernameSet={() => {
          refetchUsername();
          refetchHasSetUsername();
        }}
      />
    </>
  );
};

export default Header;
