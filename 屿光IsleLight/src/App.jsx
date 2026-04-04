import React, { useState, useRef, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';
import { Copy, Check, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HabitDashboard from './HabitDashboard';
import ExplorePage from './ExplorePage';
import './index.css';
import MusicPlayer from './MusicPlayer';

function App() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard' | 'explore'
  const walletMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (walletMenuRef.current && !walletMenuRef.current.contains(event.target)) {
        setShowWalletMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
    >
      {/* 动态星空背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(147,51,234,0.15),transparent_50%)]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(59,130,246,0.15),transparent_50%)]"
        />
      </div>

      {/* 钱包连接按钮 */}
      <div className="fixed top-0 right-0 p-4 z-50">
        {isConnected && (
          <button
            onClick={() => setShowWalletMenu(!showWalletMenu)}
            className="px-4 py-2 bg-slate-800/80 backdrop-blur-sm border border-purple-500/30 rounded-xl hover:bg-slate-700/80 transition-all text-sm"
          >
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </button>
        )}

        <AnimatePresence>
          {showWalletMenu && isConnected && (
            <motion.div
              ref={walletMenuRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-12 right-0 w-56 bg-slate-800/95 backdrop-blur-sm border border-purple-500/30 rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-3 border-b border-purple-500/20">
                <div className="text-xs text-slate-400 mb-1">钱包地址</div>
                <div className="text-sm font-medium flex items-center justify-between">
                  {address?.slice(0, 10)}...{address?.slice(-8)}
                  <button onClick={copyAddress} className="p-1 hover:bg-purple-500/20 rounded">
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                onClick={() => { disconnect(); setShowWalletMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                退出登录
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <ConnectButton />
          </motion.div>
        )}
      </div>

      {/* 主页面内容 */}
      {currentPage === 'dashboard' ? (
        <HabitDashboard onNavigateToExplore={() => setCurrentPage('explore')} />
      ) : (
        <ExplorePage onBack={() => setCurrentPage('dashboard')} />
      )}
      <MusicPlayer />
    </motion.div>
    
  );
}

export default App;