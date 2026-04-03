import { useState, useEffect, useCallback, useRef } from 'react';
import { Contract, formatEther } from 'ethers';
import { MAIN_ABI, CONTRACT_ADDRESSES } from '../utils/contracts';

/**
 * Dashboard 组件
 * 显示用户在所有池中的总投资、总收益、完成任务数、信誉分、加入池数
 * 需求：8.1, 8.2, 8.3, 8.4
 */
export default function Dashboard({ signer, address, refreshTrigger }) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const fetchStats = useCallback(async () => {
    if (!signer || !address || !CONTRACT_ADDRESSES.MAIN) return;
    try {
      const mainContract = new Contract(CONTRACT_ADDRESSES.MAIN, MAIN_ABI, signer);
      const result = await mainContract.getUserStats(address);
      setStats({
        totalInvested: formatEther(result[0]),
        totalProfit: formatEther(result[1]),
        tasksCompleted: Number(result[2]),
        reputationScore: Number(result[3]),
        poolsJoined: Number(result[4]),
      });
      setError(null);
    } catch (err) {
      setError('加载数据失败：' + (err.message || '未知错误'));
    } finally {
      setIsLoading(false);
    }
  }, [signer, address]);

  useEffect(() => {
    fetchStats();
    // 每30秒自动刷新
    intervalRef.current = setInterval(fetchStats, 30000);
    return () => clearInterval(intervalRef.current);
  }, [fetchStats, refreshTrigger]);

  if (!signer || !address) return null;

  const isEmpty = stats && stats.poolsJoined === 0 && stats.tasksCompleted === 0;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h3 className="section-title">个人仪表板</h3>
        <button className="btn btn-refresh" onClick={fetchStats} disabled={isLoading}>
          {isLoading ? '刷新中...' : '刷新'}
        </button>
      </div>

      {isLoading && !stats && (
        <div className="dashboard-stats">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="dashboard-stat-card">
              <div className="skeleton skeleton-text" style={{width:'2rem',height:'1.5rem'}} />
              <div className="skeleton skeleton-text" style={{width:'4rem'}} />
              <div className="skeleton skeleton-text" style={{width:'3rem'}} />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="dashboard-error">
          <p>{error}</p>
          <button className="btn btn-retry" onClick={fetchStats}>重试</button>
        </div>
      )}

      {!isLoading && !error && isEmpty && (
        <div className="dashboard-empty">
          <p className="dashboard-empty-icon">📊</p>
          <p className="dashboard-empty-text">您还未参与任何池或完成任何任务</p>
          <p className="dashboard-empty-hint">创建或加入一个理财学习池，开始您的投资之旅！</p>
        </div>
      )}

      {stats && !isEmpty && (
        <div className="dashboard-stats">
          <div className="dashboard-stat-card">
            <span className="dashboard-stat-icon">💰</span>
            <span className="dashboard-stat-label">总投资</span>
            <span className="dashboard-stat-value">{Number(stats.totalInvested).toFixed(2)} HRT</span>
          </div>
          <div className="dashboard-stat-card dashboard-stat-profit">
            <span className="dashboard-stat-icon">📈</span>
            <span className="dashboard-stat-label">总收益</span>
            <span className="dashboard-stat-value">+{Number(stats.totalProfit).toFixed(2)} HRT</span>
          </div>
          <div className="dashboard-stat-card">
            <span className="dashboard-stat-icon">🏊</span>
            <span className="dashboard-stat-label">加入池数</span>
            <span className="dashboard-stat-value">{stats.poolsJoined}</span>
          </div>
          <div className="dashboard-stat-card">
            <span className="dashboard-stat-icon">📚</span>
            <span className="dashboard-stat-label">完成任务</span>
            <span className="dashboard-stat-value">{stats.tasksCompleted}</span>
          </div>
          <div className="dashboard-stat-card">
            <span className="dashboard-stat-icon">⭐</span>
            <span className="dashboard-stat-label">信誉分</span>
            <span className="dashboard-stat-value">{stats.reputationScore}</span>
          </div>
        </div>
      )}
    </div>
  );
}
