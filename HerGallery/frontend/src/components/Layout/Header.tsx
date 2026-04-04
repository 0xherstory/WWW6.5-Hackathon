import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useHasSetUsername, useUsername } from '@/hooks/useContract';
import UsernameModal from '@/components/ui/UsernameModal';
import LogoSvgUrl from '@/assert/hg-logo.svg?url';

const Header = () => {
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isLandingPage = location.pathname === '/';

  // Handle scroll for transparent header effect on home page
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Determine header style based on page and scroll state
  const getHeaderStyle = () => {
    if (isLandingPage) {
      // On home page: transparent when not scrolled, gradient when scrolled
      return isScrolled
        ? 'bg-gradient-to-r from-violet-900/90 via-purple-900/80 to-fuchsia-900/80 backdrop-blur-md border-white/10'
        : 'bg-transparent border-transparent';
    }
    return 'bg-background/80 backdrop-blur-md border-border';
  };

  const getTextColor = () => {
    if (isLandingPage) {
      return isScrolled ? 'text-white' : 'text-white';
    }
    return 'text-foreground';
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${getHeaderStyle()}`}
      >
        <div className="gallery-container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={LogoSvgUrl}
              alt="HerGallery"
              className={`w-8 h-8 ${isLandingPage ? (isScrolled ? '' : 'brightness-0 invert') : ''}`}
            />
            <span className={`text-lg font-semibold tracking-tight ${getTextColor()}`}>
              HerGallery
            </span>
          </Link>

          {/* Search Input - Desktop (hidden on landing page) */}
          {!isLandingPage && (
            <div className="hidden md:flex items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索展厅、作品..."
                  className="w-64 h-9 pl-9 pr-4 rounded-full text-sm bg-secondary text-foreground placeholder:text-muted-foreground border border-border focus:border-primary focus:outline-none transition-colors"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
              </div>
            </div>
          )}

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
                      ? isLandingPage ? (isScrolled ? 'text-violet-200' : 'text-white') : 'text-foreground'
                      : isLandingPage
                        ? 'text-white/70 hover:text-white'
                        : 'text-muted-foreground hover:text-foreground'
                  }
                >
                  {item.label}
                </span>
                {location.pathname === item.path && (
                  <motion.div
                    layoutId="nav-indicator"
                    className={`absolute bottom-0 left-2 right-2 h-0.5 rounded-full ${isLandingPage && isScrolled ? 'bg-violet-400' : 'bg-foreground'}`}
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
                    isLandingPage
                      ? (isScrolled ? 'border-white/25 text-white hover:bg-white/10' : 'border-white/20 text-white/80 hover:bg-white/10')
                      : 'border-border text-foreground hover:bg-secondary'
                  }`}
                >
                  {displayName}
                </button>
                <button
                  onClick={handleWalletClick}
                  className={`flex h-9 items-center rounded-full border px-3 text-sm font-medium transition-colors cursor-pointer ${
                    isLandingPage
                      ? (isScrolled ? 'border-white/20 text-white/60 hover:bg-white/10' : 'border-white/10 text-white/40 hover:bg-white/10')
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
                  isLandingPage
                    ? (isScrolled ? 'border-white/30 text-white hover:bg-white/15' : 'border-white/20 text-white/80 hover:bg-white/10')
                    : 'border-border text-foreground hover:bg-secondary'
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
