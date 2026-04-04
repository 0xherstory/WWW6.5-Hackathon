import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ArrowLeft, Globe, Zap, User, ExternalLink, RefreshCw, Search, X } from 'lucide-react';
import { useAccount } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './config/contract';

// 图标列表（用于哈希映射）
const ICON_LIST = ['🌱', '🌊', '🏔️', '🔥', '☁️', '🌙', '☀️', '❄️', '🌵', '🦋', '🏃', '📚', '💪', '🎯', '⭐', '🌟', '💫', '✨', '🎨', '🎵'];

// 颜色列表（用于哈希映射）
const COLOR_LIST = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4'];

// 根据字符串生成固定图标和颜色
const hashToIcon = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  const iconIndex = Math.abs(hash) % ICON_LIST.length;
  const colorIndex = Math.abs(hash) % COLOR_LIST.length;
  return {
    icon: ICON_LIST[iconIndex],
    color: COLOR_LIST[colorIndex]
  };
};

const ExplorePage = ({ onBack }) => {
  const { isConnected } = useAccount();
  const [lighthouses, setLighthouses] = useState([]);
  const [filteredLighthouses, setFilteredLighthouses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLighthouse, setSelectedLighthouse] = useState(null);
  const [checkIns, setCheckIns] = useState([]);
  const [loadingCheckIns, setLoadingCheckIns] = useState(false);
  const [userNickname, setUserNickname] = useState('');

  // 获取所有公开的灯塔（习惯）
  const fetchAllLighthouses = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!window.ethereum) {
        setError("请安装 MetaMask 钱包以查看公开岛屿");
        setLoading(false);
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const allLighthouses = await contract.getAllLighthouses();
      
      const formattedLighthouses = allLighthouses.map((l, index) => {
        const { icon, color } = hashToIcon(l.title + l.author);
        return {
          id: index,
          contentHash: l.contentHash,
          title: l.title,
          timestamp: new Date(l.timestamp.toNumber() * 1000).toLocaleString('zh-CN'),
          timestampRaw: l.timestamp.toNumber(),
          author: l.author,
          authorShort: `${l.author.slice(0, 6)}...${l.author.slice(-4)}`,
          icon,
          color
        };
      });

      setLighthouses(formattedLighthouses);
      setFilteredLighthouses(formattedLighthouses);
    } catch (err) {
      console.error("获取公开岛屿失败:", err);
      setError("获取公开岛屿失败: " + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  };

  // 获取用户昵称
  const fetchUserNickname = async (userAddress) => {
    try {
      if (!window.ethereum) return '';
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const identity = await contract.getIdentity(userAddress);
      return identity[0] || '';
    } catch (err) {
      return '';
    }
  };

  // 获取某用户的打卡记录
  const fetchUserCheckIns = async (userAddress) => {
    setLoadingCheckIns(true);
    try {
      if (!window.ethereum) return [];
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const userCheckIns = await contract.getUserCheckIns(userAddress);
      
      const formattedCheckIns = userCheckIns.map((c, index) => ({
        id: index,
        timestamp: new Date(c.timestamp.toNumber() * 1000).toLocaleString('zh-CN'),
        timestampRaw: c.timestamp.toNumber(),
        cid: c.cid
      }));

      setCheckIns(formattedCheckIns);
    } catch (err) {
      console.error("获取打卡记录失败:", err);
      setCheckIns([]);
    } finally {
      setLoadingCheckIns(false);
    }
  };

  // 搜索过滤
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLighthouses(lighthouses);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = lighthouses.filter(l => 
      l.title.toLowerCase().includes(query) ||
      l.author.toLowerCase().includes(query) ||
      l.authorShort.toLowerCase().includes(query)
    );
    setFilteredLighthouses(filtered);
  }, [searchQuery, lighthouses]);

  useEffect(() => {
    fetchAllLighthouses();
  }, []);

  const handleSelectLighthouse = async (lighthouse) => {
    setSelectedLighthouse(lighthouse);
    setCheckIns([]);
    const nickname = await fetchUserNickname(lighthouse.author);
    setUserNickname(nickname);
    fetchUserCheckIns(lighthouse.author);
  };

  // Avalanche Fuji 浏览器地址
  const getExplorerUrl = (address) => {
    return `https://testnet.snowtrace.io/address/${address}`;
  };

  // 清除搜索
  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="explore-page">
      {/* 返回按钮 */}
      <button className="back-button" onClick={onBack}>
        <ArrowLeft size={20} />
        <span>返回我的岛屿</span>
      </button>

      {/* 动态背景 */}
      <div className="explore-bg">
        <div className="stars-layer"></div>
        <div className="nebula"></div>
      </div>

      {/* 主内容 */}
      <div className="explore-content">
        {selectedLighthouse ? (
          // 详情视图
          <div className="lighthouse-detail">
            <button className="detail-back" onClick={() => setSelectedLighthouse(null)}>
              <ArrowLeft size={16} /> 返回列表
            </button>
            
            <div className="detail-header">
              <div className="detail-icon" style={{ background: `linear-gradient(135deg, ${selectedLighthouse.color}, #fff)` }}>
                {selectedLighthouse.icon}
              </div>
              <h2>{selectedLighthouse.title}</h2>
              <div className="author-info">
                <User size={14} />
                <span>{userNickname || selectedLighthouse.authorShort}</span>
                <a 
                  href={getExplorerUrl(selectedLighthouse.author)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="explorer-link"
                >
                  <ExternalLink size={12} />
                </a>
              </div>
              <div className="timestamp">{selectedLighthouse.timestamp}</div>
            </div>

            <div className="checkins-section">
              <h3><Zap size={16} /> 打卡记录 ({checkIns.length})</h3>
              {loadingCheckIns ? (
                <div className="loading-state">加载中...</div>
              ) : checkIns.length > 0 ? (
                <div className="checkins-list">
                  {checkIns.map((checkIn, index) => (
                    <div key={index} className="checkin-item" style={{ borderLeftColor: selectedLighthouse.color }}>
                      <div className="checkin-icon">✨</div>
                      <div className="checkin-info">
                        <div className="checkin-time">{checkIn.timestamp}</div>
                        <div className="checkin-cid">习惯ID: {checkIn.cid}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-checkins">暂无打卡记录</div>
              )}
            </div>
          </div>
        ) : (
          // 列表视图
          <>
            <div className="explore-header">
              <div className="header-title">
                <Globe size={32} />
                <h1>探索公开岛屿</h1>
              </div>
              <p className="header-desc">发现其他航行者公开的习惯灯塔</p>
              
              {/* 搜索框 */}
              <div className="search-container">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="搜索习惯名称或用户地址..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button className="search-clear" onClick={clearSearch}>
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="header-actions">
                <button className="refresh-btn" onClick={fetchAllLighthouses} disabled={loading}>
                  <RefreshCw size={16} className={loading ? 'spinning' : ''} />
                  刷新
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>正在穿越星门，获取公开岛屿数据...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p>{error}</p>
              </div>
            ) : filteredLighthouses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">{searchQuery ? '🔍' : '🌌'}</div>
                <h3>{searchQuery ? '未找到匹配的岛屿' : '宇宙中暂无公开岛屿'}</h3>
                <p>{searchQuery ? '试试其他关键词' : '成为第一个公开习惯的航行者吧！'}</p>
              </div>
            ) : (
              <>
                {searchQuery && (
                  <div className="search-result-info">
                    找到 <span className="highlight">{filteredLighthouses.length}</span> 个匹配的岛屿
                  </div>
                )}
                <div className="lighthouses-grid">
                  {filteredLighthouses.map((lighthouse) => (
                    <div 
                      key={lighthouse.id} 
                      className="lighthouse-card"
                      onClick={() => handleSelectLighthouse(lighthouse)}
                    >
                      <div className="card-header">
                        <span className="card-icon" style={{ background: `linear-gradient(135deg, ${lighthouse.color}, #fff)` }}>
                          {lighthouse.icon}
                        </span>
                        <div className="card-title">{lighthouse.title}</div>
                      </div>
                      <div className="card-author">
                        <User size={12} />
                        <span>{lighthouse.authorShort}</span>
                      </div>
                      <div className="card-time">{lighthouse.timestamp}</div>
                      <div className="card-badge">
                        <Globe size={10} /> 公开
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <style>{`
        .explore-page {
          min-height: 100vh;
          background: #020208;
          color: white;
          font-family: system-ui, -apple-system, sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        .explore-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }

        .stars-layer {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(1px 1px at 20px 30px, #fff, transparent);
          background-size: 200px 200px;
          opacity: 0.3;
        }

        .nebula {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
                      radial-gradient(circle at 70% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
        }

        .back-button {
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 100;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .back-button:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }

        .explore-content {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          padding: 100px 20px 40px;
        }

        .explore-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .header-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 16px;
        }

        .header-title h1 {
          font-size: 2.5rem;
          font-weight: 900;
          background: linear-gradient(to right, #fff, #a5b4fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
        }

        .header-desc {
          color: rgba(255, 255, 255, 0.5);
          font-size: 16px;
          margin: 0 0 24px 0;
        }

        .search-container {
          position: relative;
          max-width: 500px;
          margin: 0 auto 24px;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.4);
        }

        .search-input {
          width: 100%;
          padding: 14px 44px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          color: white;
          font-size: 15px;
          outline: none;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          border-color: rgba(99, 102, 241, 0.5);
          background: rgba(255, 255, 255, 0.08);
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .search-clear {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .search-clear:hover {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .header-actions {
          display: flex;
          justify-content: center;
        }

        .refresh-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: rgba(99, 102, 241, 0.2);
          border: 1px solid rgba(99, 102, 241, 0.5);
          border-radius: 12px;
          color: #a5b4fc;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .refresh-btn:hover:not(:disabled) {
          background: rgba(99, 102, 241, 0.3);
        }

        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .search-result-info {
          text-align: center;
          margin-bottom: 24px;
          color: rgba(255, 255, 255, 0.5);
          font-size: 14px;
        }

        .search-result-info .highlight {
          color: #a5b4fc;
          font-weight: 700;
        }

        .loading-state {
          text-align: center;
          padding: 60px 20px;
          color: rgba(255, 255, 255, 0.5);
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        .error-state {
          text-align: center;
          padding: 60px 20px;
          color: #f87171;
          background: rgba(248, 113, 113, 0.1);
          border-radius: 16px;
          border: 1px solid rgba(248, 113, 113, 0.3);
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          margin: 0 0 10px 0;
          color: rgba(255, 255, 255, 0.7);
        }

        .empty-state p {
          color: rgba(255, 255, 255, 0.4);
          margin: 0;
        }

        .lighthouses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        .lighthouse-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .lighthouse-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .lighthouse-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(99, 102, 241, 0.5);
          transform: translateY(-4px);
        }

        .lighthouse-card:hover::before {
          opacity: 1;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .card-icon {
          font-size: 28px;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: white;
        }

        .card-author {
          display: flex;
          align-items: center;
          gap: 6px;
          color: rgba(255, 255, 255, 0.5);
          font-size: 12px;
          font-family: monospace;
          margin-bottom: 8px;
        }

        .card-time {
          color: rgba(255, 255, 255, 0.3);
          font-size: 11px;
        }

        .card-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: rgba(99, 102, 241, 0.2);
          border-radius: 20px;
          font-size: 10px;
          color: #a5b4fc;
        }

        /* 详情页样式 */
        .lighthouse-detail {
          max-width: 600px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 40px;
        }

        .detail-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 13px;
          cursor: pointer;
          margin-bottom: 24px;
          transition: all 0.2s ease;
        }

        .detail-back:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .detail-header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 30px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .detail-icon {
          font-size: 48px;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        .detail-header h2 {
          font-size: 1.8rem;
          margin: 0 0 16px 0;
          background: linear-gradient(to right, #fff, #a5b4fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .author-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.5);
          font-size: 13px;
          margin-bottom: 8px;
        }

        .explorer-link {
          color: #6366f1;
          transition: color 0.2s;
        }

        .explorer-link:hover {
          color: #a5b4fc;
        }

        .timestamp {
          color: rgba(255, 255, 255, 0.3);
          font-size: 12px;
        }

        .checkins-section h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1rem;
          color: #a5b4fc;
          margin: 0 0 20px 0;
        }

        .checkins-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 400px;
          overflow-y: auto;
        }

        .checkin-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          border-left: 3px solid #6366f1;
        }

        .checkin-icon {
          font-size: 20px;
        }

        .checkin-info {
          flex: 1;
        }

        .checkin-time {
          color: white;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .checkin-cid {
          color: rgba(255, 255, 255, 0.4);
          font-size: 11px;
          font-family: monospace;
        }

        .empty-checkins {
          text-align: center;
          padding: 40px;
          color: rgba(255, 255, 255, 0.4);
        }

        @media (max-width: 600px) {
          .header-title h1 {
            font-size: 1.8rem;
          }

          .lighthouses-grid {
            grid-template-columns: 1fr;
          }

          .lighthouse-detail {
            padding: 24px;
            margin: 0 10px;
          }

          .search-container {
            margin: 0 10px 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default ExplorePage;
