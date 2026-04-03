import { useState, useEffect, useCallback } from 'react';
import { Contract, formatEther } from 'ethers';
import { TOKEN_ABI, CONTRACT_ADDRESSES } from '../utils/contracts';

/**
 * FaucetButton 组件
 * 允许用户领取一次性测试代币（1000 HRT），并显示当前余额
 */
export default function FaucetButton({ signer, address, refreshTrigger }) {
	const [hasClaimed, setHasClaimed] = useState(false);
	const [balance, setBalance] = useState(null);
	const [isClaiming, setIsClaiming] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [txSuccess, setTxSuccess] = useState(false);

	const getTokenContract = useCallback(() => {
		if (!signer || !CONTRACT_ADDRESSES.TOKEN) return null;
		return new Contract(CONTRACT_ADDRESSES.TOKEN, TOKEN_ABI, signer);
	}, [signer]);

	// 查询领取状态和余额
	const fetchStatus = useCallback(async () => {
		if (!signer || !address) return;
		const contract = getTokenContract();
		if (!contract) return;

		try {
			setIsLoading(true);
			const [claimed, bal] = await Promise.all([
				contract.hasClaimed(address),
				contract.balanceOf(address),
			]);
			setHasClaimed(claimed);
			setBalance(bal);
		} catch (err) {
			setError('无法获取代币状态：' + (err.message || '未知错误'));
		} finally {
			setIsLoading(false);
		}
	}, [signer, address, getTokenContract]);

	useEffect(() => {
		fetchStatus();
	}, [fetchStatus, refreshTrigger]);

	// 领取水龙头代币
	const claimTokens = async () => {
		const contract = getTokenContract();
		if (!contract) return;

		setError(null);
		setTxSuccess(false);
		setIsClaiming(true);

		try {
			const tx = await contract.faucet();
			await tx.wait();
			setTxSuccess(true);
			await fetchStatus();
		} catch (err) {
			if (err.code === 4001) {
				setError('您取消了交易');
			} else if (err.message?.includes('Already claimed')) {
				setError('您已经领取过测试代币了');
				setHasClaimed(true);
			} else {
				setError('领取失败：' + (err.reason || err.message || '未知错误'));
			}
		} finally {
			setIsClaiming(false);
		}
	};

	if (!signer || !address) return null;

	const formattedBalance = balance !== null ? formatEther(balance) : null;

	return (
		<div className="faucet-container">
			<div className="faucet-info">
				<span className="faucet-label">HRT 余额：</span>
				<span className="faucet-balance">
					{isLoading
						? <><span className="spinner" />加载中</>
						: formattedBalance !== null ? `${Number(formattedBalance).toFixed(2)} HRT` : '--'}
				</span>
			</div>

			{!hasClaimed && !isLoading && (
				<button
					className="btn btn-faucet"
					onClick={claimTokens}
					disabled={isClaiming}
				>
					{isClaiming ? <><span className="spinner" />领取中...</> : '领取 1000 HRT 测试代币'}
				</button>
			)}

			{hasClaimed && !isLoading && (
				<span className="faucet-claimed">✓ 已领取测试代币</span>
			)}

			{txSuccess && (
				<p className="faucet-success">成功领取 1000 HRT！</p>
			)}

			{error && <p className="faucet-error">{error}</p>}
		</div>
	);
}
