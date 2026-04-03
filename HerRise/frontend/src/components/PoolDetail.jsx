import { useState, useEffect, useCallback } from 'react';
import { Contract, formatEther, parseEther } from 'ethers';
import { MAIN_ABI, TOKEN_ABI, CONTRACT_ADDRESSES } from '../utils/contracts';

/**
 * PoolDetail 组件
 * 显示池的完整信息和成员列表，实现两步加入流程（approve + joinPool）
 * 需求：3.4, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4
 */
export default function PoolDetail({ poolId, signer, address, onClose, onJoined }) {
  const [pool, setPool] = useState(null);
  const [members, setMembers] = useState([]);
  const [userMember, setUserMember] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Join flow state
  const [joinStep, setJoinStep] = useState(null); // null | 'approving' | 'joining' | 'done'
  const [joinError, setJoinError] = useState(null);

  // Deposit flow state
  const [depositAmount, setDepositAmount] = useState('');
  const [depositStep, setDepositStep] = useState(null); // null | 'approving' | 'depositing' | 'done'
  const [depositError, setDepositError] = useState(null);

  const fetchDetail = useCallback(async () => {
    if (!signer || !CONTRACT_ADDRESSES.MAIN || poolId == null) return;
    setIsLoading(true);
    setError(null);
    try {
      const mainContract = new Contract(CONTRACT_ADDRESSES.MAIN, MAIN_ABI, signer);
      const tokenContract = new Contract(CONTRACT_ADDRESSES.TOKEN, TOKEN_ABI, signer);

      const [rawPool, rawBalance] = await Promise.all([
        mainContract.getPoolInfo(poolId),
        tokenContract.balanceOf(address),
      ]);

      const memberCount = Number(rawPool.memberCount);
      const maxMembers = Number(rawPool.maxMembers);

      setPool({
        id: Number(rawPool.id),
        name: rawPool.name,
        strategy: rawPool.strategy,
        creator: rawPool.creator,
        maxMembers,
        memberCount,
        totalDeposits: formatEther(rawPool.totalDeposits),
        minDeposit: formatEther(rawPool.minDeposit),
        minDepositWei: rawPool.minDeposit,
        isFull: memberCount >= maxMembers,
        isActive: rawPool.isActive,
      });

      setTokenBalance(formatEther(rawBalance));

      // Fetch member list
      const memberAddresses = [];
      for (let i = 0; i < memberCount; i++) {
        try {
          const addr = await mainContract.poolMemberList(poolId, i);
          memberAddresses.push(addr);
        } catch {
          break;
        }
      }

      const memberDetails = await Promise.all(
        memberAddresses.map(async (addr) => {
          const info = await mainContract.getUserPoolInfo(poolId, addr);
          return {
            address: addr,
            depositAmount: formatEther(info.depositAmount),
            earnedProfit: formatEther(info.earnedProfit),
          };
        })
      );
      setMembers(memberDetails);

      // Check if current user is already a member
      if (address) {
        const userInfo = await mainContract.getUserPoolInfo(poolId, address);
        setUserMember(userInfo.exists ? {
          depositAmount: formatEther(userInfo.depositAmount),
          earnedProfit: formatEther(userInfo.earnedProfit),
        } : null);
      }
    } catch (err) {
      setError('加载池详情失败：' + (err.message || '未知错误'));
    } finally {
      setIsLoading(false);
    }
  }, [signer, poolId, address]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleJoin = async () => {
    if (!signer || !pool) return;
    setJoinError(null);
    setJoinStep('approving');

    try {
      const tokenContract = new Contract(CONTRACT_ADDRESSES.TOKEN, TOKEN_ABI, signer);
      const mainContract = new Contract(CONTRACT_ADDRESSES.MAIN, MAIN_ABI, signer);

      // Step 1: approve
      const approveTx = await tokenContract.approve(CONTRACT_ADDRESSES.MAIN, pool.minDepositWei);
      await approveTx.wait();

      // Step 2: joinPool
      setJoinStep('joining');
      const joinTx = await mainContract.joinPool(pool.id, pool.minDepositWei);
      await joinTx.wait();

      setJoinStep('done');
      await fetchDetail();
      if (onJoined) onJoined();
    } catch (err) {
      setJoinStep(null);
      if (err.code === 4001) {
        setJoinError('您取消了交易');
      } else {
        setJoinError(err.reason || err.message || '加入失败');
      }
    }
  };

  const handleDeposit = async () => {
    if (!signer || !pool || !depositAmount) return;
    const amountNum = Number(depositAmount);
    if (amountNum <= 0) {
      setDepositError('存款金额必须大于零');
      return;
    }
    setDepositError(null);
    setDepositStep('approving');

    try {
      const tokenContract = new Contract(CONTRACT_ADDRESSES.TOKEN, TOKEN_ABI, signer);
      const mainContract = new Contract(CONTRACT_ADDRESSES.MAIN, MAIN_ABI, signer);
      const amountWei = parseEther(depositAmount);

      // Step 1: approve
      const approveTx = await tokenContract.approve(CONTRACT_ADDRESSES.MAIN, amountWei);
      await approveTx.wait();

      // Step 2: deposit
      setDepositStep('depositing');
      const depositTx = await mainContract.deposit(pool.id, amountWei);
      await depositTx.wait();

      setDepositStep('done');
      setDepositAmount('');
      await fetchDetail();
    } catch (err) {
      setDepositStep(null);
      if (err.code === 4001) {
        setDepositError('您取消了交易');
      } else {
        setDepositError(err.reason || err.message || '存款失败');
      }
    }
  };

  const shortAddr = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const isCreator = pool && address && pool.creator.toLowerCase() === address.toLowerCase();
  const isMember = !!userMember;
  const hasEnoughBalance = pool && tokenBalance && Number(tokenBalance) >= Number(pool.minDeposit);

  return (
    <div className="pool-detail-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pool-detail-modal">
        <div className="pool-detail-header">
          <h2 className="pool-detail-title">池详情</h2>
          <button className="btn-close" onClick={onClose} aria-label="关闭">✕</button>
        </div>

        {isLoading && <p className="pool-detail-loading"><span className="spinner" />加载中...</p>}
        {error && (
          <div className="pool-detail-error">
            <p>{error}</p>
            <button className="btn btn-retry" onClick={fetchDetail}>重试</button>
          </div>
        )}

        {!isLoading && !error && pool && (
          <>
            {/* Pool Info */}
            <div className="pool-detail-info">
              <div className="pool-detail-name-row">
                <span className="pool-detail-name">{pool.name}</span>
                {pool.isFull && <span className="pool-badge-full">已满员</span>}
                {!pool.isActive && <span className="pool-badge-inactive">已关闭</span>}
              </div>
              <p className="pool-detail-strategy">策略：{pool.strategy}</p>
              <p className="pool-detail-creator">
                创建者：{isCreator ? '您' : shortAddr(pool.creator)}
              </p>

              <div className="pool-detail-stats">
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
                <div className="pool-stat">
                  <span className="stat-label">我的余额</span>
                  <span className="stat-value">{tokenBalance ? `${Number(tokenBalance).toFixed(2)} HRT` : '—'}</span>
                </div>
              </div>
            </div>

            {/* User's membership info */}
            {isMember && (
              <div className="pool-detail-my-info">
                <h4 className="pool-detail-section-title">我的参与情况</h4>
                <div className="pool-detail-stats">
                  <div className="pool-stat">
                    <span className="stat-label">我的存款</span>
                    <span className="stat-value">{Number(userMember.depositAmount).toFixed(2)} HRT</span>
                  </div>
                  <div className="pool-stat">
                    <span className="stat-label">已获收益</span>
                    <span className="stat-value">{Number(userMember.earnedProfit).toFixed(2)} HRT</span>
                  </div>
                </div>
              </div>
            )}

            {/* Join section */}
            {!isMember && pool.isActive && (
              <div className="pool-detail-join">
                <h4 className="pool-detail-section-title">加入此池</h4>

                {pool.isFull ? (
                  <p className="pool-detail-full-msg">该池已满员，无法加入</p>
                ) : !hasEnoughBalance ? (
                  <p className="pool-detail-balance-warn">
                    余额不足，需要至少 {Number(pool.minDeposit).toFixed(2)} HRT
                  </p>
                ) : (
                  <>
                    <p className="pool-detail-join-hint">
                      加入需要两步交易：先授权代币，再加入池子（会弹出两次 MetaMask 确认）
                    </p>
                    <p className="pool-detail-join-cost">
                      加入费用：{Number(pool.minDeposit).toFixed(2)} HRT
                    </p>

                    {joinStep === 'approving' && (
                      <p className="pool-detail-step-hint">第 1 步：请在 MetaMask 中确认授权...</p>
                    )}
                    {joinStep === 'joining' && (
                      <p className="pool-detail-step-hint">第 2 步：请在 MetaMask 中确认加入交易...</p>
                    )}
                    {joinStep === 'done' && (
                      <p className="pool-detail-success">✓ 成功加入池子！</p>
                    )}
                    {joinError && <p className="pool-detail-error-msg">{joinError}</p>}

                    {joinStep !== 'done' && (
                      <button
                        className="btn btn-join-detail"
                        onClick={handleJoin}
                        disabled={!!joinStep}
                      >
                        {joinStep ? <><span className="spinner" />处理中...</> : '加入池子'}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Deposit section (for existing members) */}
            {isMember && pool.isActive && (
              <div className="pool-detail-deposit">
                <h4 className="pool-detail-section-title">追加存款</h4>
                <p className="pool-detail-join-hint">
                  追加存款需要两步交易（会弹出两次 MetaMask 确认）
                </p>
                <div className="deposit-input-row">
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="存款金额 (HRT)"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="deposit-input"
                    disabled={!!depositStep}
                  />
                  <button
                    className="btn btn-deposit"
                    onClick={handleDeposit}
                    disabled={!!depositStep || !depositAmount}
                  >
                    {depositStep ? <><span className="spinner" />处理中...</> : '存款'}
                  </button>
                </div>

                {depositStep === 'approving' && (
                  <p className="pool-detail-step-hint">第 1 步：请在 MetaMask 中确认授权...</p>
                )}
                {depositStep === 'depositing' && (
                  <p className="pool-detail-step-hint">第 2 步：请在 MetaMask 中确认存款交易...</p>
                )}
                {depositStep === 'done' && (
                  <p className="pool-detail-success">✓ 存款成功！</p>
                )}
                {depositError && <p className="pool-detail-error-msg">{depositError}</p>}
              </div>
            )}

            {/* Member list */}
            <div className="pool-detail-members">
              <h4 className="pool-detail-section-title">成员列表（{members.length}）</h4>
              {members.length === 0 ? (
                <p className="pool-detail-no-members">暂无成员数据</p>
              ) : (
                <div className="member-list">
                  {members.map((m) => {
                    const isMe = address && m.address.toLowerCase() === address.toLowerCase();
                    return (
                      <div key={m.address} className={`member-row ${isMe ? 'member-row-me' : ''}`}>
                        <span className="member-addr">
                          {isMe ? '您' : shortAddr(m.address)}
                          {m.address.toLowerCase() === pool.creator.toLowerCase() && (
                            <span className="member-creator-tag"> (创建者)</span>
                          )}
                        </span>
                        <span className="member-deposit">{Number(m.depositAmount).toFixed(2)} HRT</span>
                        <span className="member-profit">+{Number(m.earnedProfit).toFixed(2)} HRT</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
