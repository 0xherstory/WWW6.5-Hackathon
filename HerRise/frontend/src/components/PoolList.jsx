import { useState, useEffect, useCallback } from 'react';
import { Contract, formatEther, parseEther } from 'ethers';
import { MAIN_ABI, TOKEN_ABI, CONTRACT_ADDRESSES } from '../utils/contracts';

/**
 * PoolList 组件
 * 显示所有活跃的理财学习池，标记满员池，支持刷新
 */
export default function PoolList({ signer, address, refreshTrigger, onViewDetail }) {
  const [pools, setPools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPools = useCallback(async () => {
    if (!signer || !CONTRACT_ADDRESSES.MAIN) return;
    setIsLoading(true);
    setError(null);
    try {
      const contract = new Contract(CONTRACT_ADDRESSES.MAIN, MAIN_ABI, signer);
      const raw = await contract.getAllPools();
      // 过滤活跃池并转换数据
      const active = raw
        .filter((p) => p.isActive)
        .map((p) => ({
          id: Number(p.id),
          name: p.name,
          strategy: p.strategy,
          creator: p.creator,
          maxMembers: Number(p.maxMembers),
          memberCount: Number(p.memberCount),
          totalDeposits: formatEther(p.totalDeposits),
          minDeposit: formatEther(p.minDeposit),
          isFull: Number(p.memberCount) >= Number(p.maxMembers),
        }));
      setPools(active);
    } catch (err) {
      setError('加载池列表失败：' + (err.message || '未知错误'));
    } finally {
      setIsLoading(false);
    }
  }, [signer]);

  useEffect(() => {
    fetchPools();
  }, [fetchPools, refreshTrigger]);

  if (isLoading) {
    return (
      <div className="pool-list">
        <div className="pool-list-header">
          <h3 className="section-title">理财学习池</h3>
        </div>
        <div className="pool-grid">
          {[1,2,3].map(i => <div key={i} className="skeleton skeleton-card" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pool-list-error">
        <p>{error}</p>
        <button className="btn btn-retry" onClick={fetchPools}>重试</button>
      </div>
    );
  }

  return (
    <div className="pool-list">
      <div className="pool-list-header">
        <h3 className="section-title">理财学习池</h3>
        <button className="btn btn-refresh" onClick={fetchPools}>刷新</button>
      </div>

      {pools.length === 0 ? (
        <p className="pool-empty">暂无活跃的理财学习池，快来创建第一个吧！</p>
      ) : (
        <div className="pool-grid">
          {pools.map((pool) => (
            <PoolCard key={pool.id} pool={pool} address={address} signer={signer} onRefresh={fetchPools} onViewDetail={onViewDetail} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * PoolCard 子组件
 * 显示单个池的基本信息，满员时禁用加入按钮
 */
function PoolCard({ pool, address, signer, onRefresh, onViewDetail }) {
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const [joinSuccess, setJoinSuccess] = useState(false);

  const handleJoin = async () => {
    if (!signer || !CONTRACT_ADDRESSES.MAIN) return;
    setJoinError(null);
    setJoinSuccess(false);
    setIsJoining(true);

    try {
      const tokenContract = new Contract(CONTRACT_ADDRESSES.TOKEN, TOKEN_ABI, signer);
      const mainContract = new Contract(CONTRACT_ADDRESSES.MAIN, MAIN_ABI, signer);

      // 步骤1：授权
      const approveTx = await tokenContract.approve(CONTRACT_ADDRESSES.MAIN, parseEther(pool.minDeposit));
      await approveTx.wait();

      // 步骤2：加入池
      const joinTx = await mainContract.joinPool(pool.id, parseEther(pool.minDeposit));
      await joinTx.wait();

      setJoinSuccess(true);
      if (onRefresh) onRefresh();
    } catch (err) {
      if (err.code === 4001) {
        setJoinError('您取消了交易');
      } else {
        setJoinError(err.reason || err.message || '加入失败');
      }
    } finally {
      setIsJoining(false);
    }
  };

  const shortCreator = `${pool.creator.slice(0, 6)}...${pool.creator.slice(-4)}`;
  const isCreator = address && pool.creator.toLowerCase() === address.toLowerCase();

  return (
    <div className={`pool-card ${pool.isFull ? 'pool-card-full' : ''}`}>
      <div className="pool-card-header">
        <span className="pool-name">{pool.name}</span>
        {pool.isFull && <span className="pool-badge-full">已满员</span>}
      </div>

      <p className="pool-strategy">策略：{pool.strategy}</p>

      <div className="pool-stats">
        <div className="pool-stat">
          <span className="stat-label">成员</span>
          <span className="stat-value">{pool.memberCount} / {pool.maxMembers}</span>
        </div>
        <div className="pool-stat">
          <span className="stat-label">总存款</span>
          <span className="stat-value">{Number(pool.totalDeposits).toFixed(2)} HRT</span>
        </div>
        <div className="pool-stat">
          <span className="stat-label">最小存款</span>
          <span className="stat-value">{Number(pool.minDeposit).toFixed(2)} HRT</span>
        </div>
      </div>

      <p className="pool-creator">创建者：{isCreator ? '您' : shortCreator}</p>

      {joinError && <p className="pool-join-error">{joinError}</p>}
      {joinSuccess && <p className="pool-join-success">✓ 成功加入！</p>}

      {!isCreator && (
        <button
          className="btn btn-join-pool"
          onClick={handleJoin}
          disabled={pool.isFull || isJoining}
          title={pool.isFull ? '该池已满员' : `加入需要 ${pool.minDeposit} HRT（两步交易）`}
        >
      {isJoining ? <><span className="spinner" />处理中...</> : pool.isFull ? '已满员' : '加入池'}
        </button>
      )}
      {isCreator && (
        <span className="pool-creator-badge">✓ 您已在此池中</span>
      )}
      <button
        className="btn btn-view-detail"
        onClick={() => onViewDetail && onViewDetail(pool.id)}
      >
        查看详情
      </button>
    </div>
  );
}
