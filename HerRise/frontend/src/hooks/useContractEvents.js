import { useEffect, useRef, useCallback } from 'react';
import { Contract } from 'ethers';
import { MAIN_ABI, CONTRACT_ADDRESSES } from '../utils/contracts';

/**
 * useContractEvents
 * Subscribes to HerRiseMain contract events and calls the provided callbacks.
 * Automatically cleans up listeners on unmount or when signer changes.
 *
 * @param {object} signer - ethers signer
 * @param {object} callbacks - { onPoolCreated, onPoolJoined, onDepositMade, onTaskCompleted, onProfitDistributed }
 */
export function useContractEvents(signer, callbacks = {}) {
  const contractRef = useRef(null);
  const callbacksRef = useRef(callbacks);

  // Keep callbacks ref up-to-date without re-subscribing
  useEffect(() => {
    callbacksRef.current = callbacks;
  });

  const removeListeners = useCallback(() => {
    if (contractRef.current) {
      contractRef.current.removeAllListeners();
      contractRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!signer || !CONTRACT_ADDRESSES.MAIN) return;

    const contract = new Contract(CONTRACT_ADDRESSES.MAIN, MAIN_ABI, signer);
    contractRef.current = contract;

    // PoolCreated(uint256 indexed poolId, string name, address creator)
    contract.on('PoolCreated', (poolId, name, creator) => {
      callbacksRef.current.onPoolCreated?.({ poolId: Number(poolId), name, creator });
    });

    // PoolJoined(uint256 indexed poolId, address member, uint256 amount)
    contract.on('PoolJoined', (poolId, member, amount) => {
      callbacksRef.current.onPoolJoined?.({ poolId: Number(poolId), member, amount });
    });

    // DepositMade(uint256 indexed poolId, address member, uint256 amount)
    contract.on('DepositMade', (poolId, member, amount) => {
      callbacksRef.current.onDepositMade?.({ poolId: Number(poolId), member, amount });
    });

    // TaskCompleted(address indexed user, uint256 taskId, uint256 reward)
    contract.on('TaskCompleted', (user, taskId, reward) => {
      callbacksRef.current.onTaskCompleted?.({ user, taskId: Number(taskId), reward });
    });

    // ProfitDistributed(uint256 indexed poolId, uint256 totalProfit)
    contract.on('ProfitDistributed', (poolId, totalProfit) => {
      callbacksRef.current.onProfitDistributed?.({ poolId: Number(poolId), totalProfit });
    });

    return removeListeners;
  }, [signer, removeListeners]);
}
