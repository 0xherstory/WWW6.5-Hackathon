import { useWallet } from '@/contexts/WalletContext';
import { motion } from 'framer-motion';
import { Leaf, Wallet } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const ConnectWallet = () => {
  const { address, isConnecting, connect } = useWallet();

  if (address) return <Navigate to="/garden" replace />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="text-center max-w-md w-full"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-8">
          <Leaf className="w-10 h-10 text-primary" />
        </div>

        <h1 className="text-4xl font-display font-bold text-foreground mb-3">
          城市植物观察
        </h1>
        <p className="text-muted-foreground font-body text-lg mb-2">
          City Plant Observer
        </p>
        <p className="text-muted-foreground font-body text-sm mb-10 leading-relaxed">
          记录身边的每一株植物，铸造成链上NFT，<br />
          见证它们的四季成长。
        </p>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={connect}
          disabled={isConnecting}
          className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-primary-foreground font-body font-semibold text-base transition-all duration-200 disabled:opacity-60"
          style={{ background: 'var(--gradient-leaf)' }}
        >
          <Wallet className="w-5 h-5" />
          {isConnecting ? '连接中...' : '连接 MetaMask 钱包'}
        </motion.button>

        <p className="text-muted-foreground text-xs mt-6 font-body">
          首次使用需安装 MetaMask 浏览器扩展
        </p>
      </motion.div>

      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
      </div>
    </div>
  );
};

export default ConnectWallet;
