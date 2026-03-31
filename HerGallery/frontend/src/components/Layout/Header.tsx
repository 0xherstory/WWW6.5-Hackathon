import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { shortenAddress } from '@/lib/format';
import { useHasSetUsername, useUsername } from '@/hooks/useContract';
import UsernameModal from '@/components/ui/UsernameModal';

const Header = () => {
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  const { data: hasSetUsername, refetch: refetchHasSetUsername } = useHasSetUsername(address || '');
  const { data: username, refetch: refetchUsername } = useUsername(address || '');

  const navItems = [
    { path: '/', label: '展厅' },
    { path: '/create', label: '创建' },
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

  const displayName = isConnected && username ? username : (isConnected ? shortenAddress(address || '') : null);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="gallery-container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">✿</span>
            <span className="text-lg font-semibold tracking-tight text-foreground">
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
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }
                >
                  {item.label}
                </span>
                {location.pathname === item.path && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}

            {isConnected ? (
              <div className="ml-4 flex items-center gap-2">
                {!hasSetUsername ? (
                  <button
                    onClick={() => setShowUsernameModal(true)}
                    className="flex h-9 items-center rounded-full border border-primary/30 bg-primary/10 px-4 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground cursor-pointer"
                  >
                    设置昵称
                  </button>
                ) : (
                  <button
                    onClick={() => setShowUsernameModal(true)}
                    className="flex h-9 items-center rounded-full border border-border px-4 text-sm font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer"
                  >
                    {displayName}
                  </button>
                )}
                <button
                  onClick={handleWalletClick}
                  className="flex h-9 items-center rounded-full border border-border px-3 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors cursor-pointer"
                  title="断开钱包"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={handleWalletClick}
                className="ml-4 flex h-9 items-center rounded-full border border-primary/30 px-4 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground cursor-pointer"
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
