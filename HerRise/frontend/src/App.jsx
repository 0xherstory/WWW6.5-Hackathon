import { useState, useCallback } from 'react';
import WalletConnector from './components/WalletConnector';
import FaucetButton from './components/FaucetButton';
import PoolList from './components/PoolList';
import PoolCreator from './components/PoolCreator';
import PoolDetail from './components/PoolDetail';
import LearningTaskList from './components/LearningTaskList';
import Dashboard from './components/Dashboard';
import ToastNotification, { useToasts } from './components/ToastNotification';
import { useContractEvents } from './hooks/useContractEvents';
import { formatEther } from 'ethers';
import './App.css';

function App() {
	const [wallet, setWallet] = useState(null);
	const [poolRefresh, setPoolRefresh] = useState(0);
	const [dashboardRefresh, setDashboardRefresh] = useState(0);
	const [selectedPoolId, setSelectedPoolId] = useState(null);
	const { toasts, addToast, removeToast } = useToasts();

	const handlePoolCreated = useCallback(() => setPoolRefresh((n) => n + 1), []);
	const handlePoolJoined = useCallback(() => {
		setPoolRefresh((n) => n + 1);
		setDashboardRefresh((n) => n + 1);
	}, []);

	// Contract event handlers — update UI and show toast notifications
	useContractEvents(wallet?.signer, {
		onPoolCreated: ({ name }) => {
			addToast(`🏊 新池创建：${name}`, 'success');
			setPoolRefresh((n) => n + 1);
		},
		onPoolJoined: ({ poolId, member }) => {
			const short = `${member.slice(0, 6)}...${member.slice(-4)}`;
			addToast(`✅ 用户 ${short} 加入了池 #${poolId}`, 'info');
			setPoolRefresh((n) => n + 1);
			setDashboardRefresh((n) => n + 1);
		},
		onDepositMade: ({ poolId, amount }) => {
			addToast(`💰 池 #${poolId} 收到存款 ${Number(formatEther(amount)).toFixed(2)} HRT`, 'info');
			setPoolRefresh((n) => n + 1);
			setDashboardRefresh((n) => n + 1);
		},
		onTaskCompleted: ({ taskId, reward }) => {
			addToast(`📚 任务 #${taskId} 完成！获得 ${Number(formatEther(reward)).toFixed(2)} HRT 奖励`, 'success');
			setDashboardRefresh((n) => n + 1);
		},
		onProfitDistributed: ({ poolId, totalProfit }) => {
			addToast(`📈 池 #${poolId} 收益已分配：${Number(formatEther(totalProfit)).toFixed(2)} HRT`, 'success');
			setDashboardRefresh((n) => n + 1);
		},
	});

	return (
		<div className="App">
			<header className="App-header">
				<div className="header-top">
					<div className="header-brand">
						<h1>HerRise 💜</h1>
						<p>女性协作理财学习平台</p>
					</div>
					<WalletConnector onWalletConnected={setWallet} />
				</div>
			</header>

			<main className="App-main">
				{wallet ? (
					<div className="main-content">
						<FaucetButton
							signer={wallet.signer}
							address={wallet.address}
							refreshTrigger={dashboardRefresh}
						/>
						<div className="pools-section">
							<PoolCreator signer={wallet.signer} onPoolCreated={handlePoolCreated} />
							<PoolList
								signer={wallet.signer}
								address={wallet.address}
								refreshTrigger={poolRefresh}
								onViewDetail={setSelectedPoolId}
							/>
						</div>
						<LearningTaskList
							signer={wallet.signer}
							address={wallet.address}
							onTaskCompleted={() => setDashboardRefresh((n) => n + 1)}
						/>
						<Dashboard
							signer={wallet.signer}
							address={wallet.address}
							refreshTrigger={dashboardRefresh}
						/>
					</div>
				) : (
					<div className="connect-prompt">
						<span className="connect-prompt-icon">💜</span>
						<p>请连接钱包以使用平台功能</p>
					</div>
				)}
			</main>

			{selectedPoolId != null && wallet && (
				<PoolDetail
					poolId={selectedPoolId}
					signer={wallet.signer}
					address={wallet.address}
					onClose={() => setSelectedPoolId(null)}
					onJoined={handlePoolJoined}
				/>
			)}

			<ToastNotification toasts={toasts} onDismiss={removeToast} />
		</div>
	);
}

export default App;
