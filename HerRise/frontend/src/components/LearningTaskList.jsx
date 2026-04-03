import { useState, useEffect, useCallback } from 'react';
import { Contract } from 'ethers';
import { MAIN_ABI, CONTRACT_ADDRESSES } from '../utils/contracts';

/**
 * 预置学习任务内容（前端定义，合约只负责奖励发放）
 * 需求：6.1, 6.2, 6.3, 6.4
 */
const PRESET_TASKS = [
	{
		id: 1,
		title: '什么是分散投资？',
		description: '学习如何通过分散投资降低风险',
		content:
			'分散投资是指将资金分配到不同类型的资产中，以降低整体投资组合的风险。核心原则：不要把鸡蛋放在一个篮子里。通过持有多种不相关资产，单一资产的亏损不会对整体造成毁灭性影响。',
		quiz: {
			question: '分散投资的核心目的是什么？',
			options: ['A. 获得最高收益', 'B. 降低整体风险', 'C. 减少交易费用', 'D. 简化投资流程'],
			correctAnswer: 1,
		},
		rewardDisplay: '10 HRT',
	},
	{
		id: 2,
		title: '理解风险与收益',
		description: '学习风险和收益的关系',
		content:
			'高风险通常伴随高收益的可能性，但也意味着更大的损失风险。低风险投资收益较稳定，但增长潜力有限。关键是找到适合自己风险承受能力的平衡点。',
		quiz: {
			question: '以下哪种说法是正确的？',
			options: [
				'A. 高风险一定带来高收益',
				'B. 低风险投资不会亏损',
				'C. 风险和收益通常成正比',
				'D. 所有投资都有相同风险',
			],
			correctAnswer: 2,
		},
		rewardDisplay: '10 HRT',
	},
	{
		id: 3,
		title: '什么是DeFi？',
		description: '了解去中心化金融的基本概念',
		content:
			'DeFi（去中心化金融）是基于区块链的金融服务，不依赖传统金融中介机构。特点：透明、无需许可、全球可访问。任何人都可以通过智能合约参与金融活动。',
		quiz: {
			question: 'DeFi的主要优势是什么？',
			options: ['A. 更高的收益保证', 'B. 政府监管保护', 'C. 透明和去中心化', 'D. 零风险投资'],
			correctAnswer: 2,
		},
		rewardDisplay: '15 HRT',
	},
];

/**
 * LearningTaskList 组件
 * 显示学习任务列表，支持测验验证和链上奖励领取
 * 需求：6.1, 6.2, 6.3, 6.4
 */
export default function LearningTaskList({ signer, address, onTaskCompleted }) {
	// completedOnChain[taskId] = true/false
	const [completedOnChain, setCompletedOnChain] = useState({});
	const [isLoadingStatus, setIsLoadingStatus] = useState(true);

	// Per-task UI state
	const [expandedTask, setExpandedTask] = useState(null);
	const [selectedAnswers, setSelectedAnswers] = useState({});
	const [quizResult, setQuizResult] = useState({}); // { taskId: 'correct' | 'wrong' }
	const [claimState, setClaimState] = useState({}); // { taskId: 'claiming' | 'done' | null }
	const [claimError, setClaimError] = useState({}); // { taskId: string }

	const fetchCompletionStatus = useCallback(async () => {
		if (!signer || !address || !CONTRACT_ADDRESSES.MAIN) return;
		setIsLoadingStatus(true);
		try {
			const mainContract = new Contract(CONTRACT_ADDRESSES.MAIN, MAIN_ABI, signer);
			const results = await Promise.all(
				PRESET_TASKS.map((t) => mainContract.hasCompleted(address, t.id))
			);
			const map = {};
			PRESET_TASKS.forEach((t, i) => {
				map[t.id] = results[i];
			});
			setCompletedOnChain(map);
		} catch {
			// silently ignore — tasks will show as not completed
		} finally {
			setIsLoadingStatus(false);
		}
	}, [signer, address]);

	useEffect(() => {
		fetchCompletionStatus();
	}, [fetchCompletionStatus]);

	const handleToggleExpand = (taskId) => {
		setExpandedTask((prev) => (prev === taskId ? null : taskId));
		// Reset quiz state when collapsing
		setQuizResult((prev) => ({ ...prev, [taskId]: undefined }));
		setSelectedAnswers((prev) => ({ ...prev, [taskId]: undefined }));
	};

	const handleSelectAnswer = (taskId, idx) => {
		setSelectedAnswers((prev) => ({ ...prev, [taskId]: idx }));
		setQuizResult((prev) => ({ ...prev, [taskId]: undefined }));
	};

	const handleSubmitQuiz = (task) => {
		const selected = selectedAnswers[task.id];
		if (selected === undefined) return;
		if (selected === task.quiz.correctAnswer) {
			setQuizResult((prev) => ({ ...prev, [task.id]: 'correct' }));
		} else {
			setQuizResult((prev) => ({ ...prev, [task.id]: 'wrong' }));
		}
	};

	const handleClaimReward = async (task) => {
		if (!signer) return;
		setClaimError((prev) => ({ ...prev, [task.id]: null }));
		setClaimState((prev) => ({ ...prev, [task.id]: 'claiming' }));

		try {
			const mainContract = new Contract(CONTRACT_ADDRESSES.MAIN, MAIN_ABI, signer);
			const tx = await mainContract.completeTask(task.id);
			await tx.wait();
			setClaimState((prev) => ({ ...prev, [task.id]: 'done' }));
			await fetchCompletionStatus();
			if (onTaskCompleted) onTaskCompleted();
		} catch (err) {
			setClaimState((prev) => ({ ...prev, [task.id]: null }));
			if (err.code === 4001) {
				setClaimError((prev) => ({ ...prev, [task.id]: '您取消了交易' }));
			} else if (
				err.message?.includes('任务已完成') ||
				err.reason?.includes('任务已完成')
			) {
				setClaimError((prev) => ({ ...prev, [task.id]: '您已经完成过该任务，无法重复领取奖励' }));
				// Refresh on-chain status to reflect reality
				await fetchCompletionStatus();
			} else {
				setClaimError((prev) => ({
					...prev,
					[task.id]: err.reason || err.message || '领取失败，请重试',
				}));
			}
		}
	};

	if (!signer || !address) return null;

	return (
		<div className="learning-tasks">
			<h3 className="section-title">学习任务</h3>
			{isLoadingStatus ? (
				<div className="task-list">
					{[1, 2, 3].map(i => (
						<div key={i} className="task-card">
							<div className="skeleton skeleton-text" style={{ width: '60%' }} />
							<div className="skeleton skeleton-text" style={{ width: '40%' }} />
						</div>
					))}
				</div>
			) : (
				<div className="task-list">
					{PRESET_TASKS.map((task) => {
						const isCompleted = completedOnChain[task.id];
						const isExpanded = expandedTask === task.id;
						const selected = selectedAnswers[task.id];
						const result = quizResult[task.id];
						const claiming = claimState[task.id];
						const error = claimError[task.id];

						return (
							<div
								key={task.id}
								className={`task-card ${isCompleted ? 'task-card-done' : ''}`}
							>
								{/* Task header */}
								<div className="task-card-header">
									<div className="task-card-title-row">
										{isCompleted && <span className="task-done-badge">✓ 已完成</span>}
										<span className="task-title">{task.title}</span>
									</div>
									<div className="task-card-meta">
										<span className="task-reward">奖励：{task.rewardDisplay}</span>
										{!isCompleted && (
											<button
												className="btn btn-task-toggle"
												onClick={() => handleToggleExpand(task.id)}
											>
												{isExpanded ? '收起' : '开始学习'}
											</button>
										)}
									</div>
								</div>

								<p className="task-description">{task.description}</p>

								{/* Expanded: content + quiz */}
								{isExpanded && !isCompleted && (
									<div className="task-expanded">
										<div className="task-content">
											<p>{task.content}</p>
										</div>

										<div className="task-quiz">
											<p className="quiz-question">{task.quiz.question}</p>
											<div className="quiz-options">
												{task.quiz.options.map((opt, idx) => (
													<button
														key={idx}
														className={`quiz-option ${selected === idx ? 'quiz-option-selected' : ''}`}
														onClick={() => handleSelectAnswer(task.id, idx)}
														disabled={result === 'correct' || !!claiming}
													>
														{opt}
													</button>
												))}
											</div>

											{result !== 'correct' && (
												<button
													className="btn btn-submit-quiz"
													onClick={() => handleSubmitQuiz(task)}
													disabled={selected === undefined || !!claiming}
												>
													提交答案
												</button>
											)}

											{result === 'wrong' && (
												<p className="quiz-wrong">答案不正确，请重新学习后再试 🔄</p>
											)}

											{result === 'correct' && (
												<div className="quiz-correct-section">
													<p className="quiz-correct">✓ 回答正确！</p>
													{claiming === 'done' ? (
														<p className="task-claim-success">
															🎉 成功领取 {task.rewardDisplay} 奖励！
														</p>
													) : (
														<>
															<button
																className="btn btn-claim-reward"
																onClick={() => handleClaimReward(task)}
																disabled={claiming === 'claiming'}
															>
																{claiming === 'claiming'
																	? <><span className="spinner" />领取中...</>
																	: `领取 ${task.rewardDisplay} 奖励`}
															</button>
															{error && <p className="task-claim-error">{error}</p>}
														</>
													)}
												</div>
											)}
										</div>
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
