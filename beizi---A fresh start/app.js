// 替换为你的合约地址和ABI
const MEMBERSHIP_ADDRESS = "0x2bF8AEb4d19DdA2D4DF67C047800664fab70f435";
const TREASURY_ADDRESS = "0x8E3CC117F981819633dCFeF850D20Bc1C23a9DeF";
const VOTING_ADDRESS = "0x43b8fCEaE5e4D53ff5c9a4172ac2c5C95d7D6E83";

// 从Remix复制ABI并替换
const MEMBERSHIP_ABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "oldAdmin",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newAdmin",
				"type": "address"
			}
		],
		"name": "AdminTransferred",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "applicant",
				"type": "address"
			}
		],
		"name": "approveJoin",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "member",
				"type": "address"
			}
		],
		"name": "approveLeave",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "cancelJoinRequest",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "cancelLeaveRequest",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "applicant",
				"type": "address"
			}
		],
		"name": "JoinRequestApproved",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "applicant",
				"type": "address"
			}
		],
		"name": "JoinRequestRejected",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "applicant",
				"type": "address"
			}
		],
		"name": "JoinRequested",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "member",
				"type": "address"
			}
		],
		"name": "LeaveRequestApproved",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "member",
				"type": "address"
			}
		],
		"name": "LeaveRequestRejected",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "member",
				"type": "address"
			}
		],
		"name": "LeaveRequested",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "member",
				"type": "address"
			}
		],
		"name": "MemberJoined",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "member",
				"type": "address"
			}
		],
		"name": "MemberLeft",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "applicant",
				"type": "address"
			}
		],
		"name": "rejectJoin",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "member",
				"type": "address"
			}
		],
		"name": "rejectLeave",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "requestJoin",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "requestLeave",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newAdmin",
				"type": "address"
			}
		],
		"name": "transferAdmin",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "admin",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "isActive",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "joinRequests",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "leaveRequests",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
const TREASURY_ABI =[
	{
		"inputs": [],
		"name": "donate",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "donor",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "DonationReceived",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "reason",
				"type": "string"
			}
		],
		"name": "FundsReleased",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address payable",
				"name": "recipient",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "reason",
				"type": "string"
			}
		],
		"name": "releaseFunds",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_votingContract",
				"type": "address"
			}
		],
		"name": "setVotingContract",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "contributions",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalFunds",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "votingContract",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
const VOTING_ABI =[
	{
		"inputs": [
			{
				"internalType": "address payable",
				"name": "recipient",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "reason",
				"type": "string"
			}
		],
		"name": "createProposal",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			}
		],
		"name": "executeProposal",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_membership",
				"type": "address"
			},
			{
				"internalType": "address payable",
				"name": "_treasury",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "reason",
				"type": "string"
			}
		],
		"name": "ProposalCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			}
		],
		"name": "ProposalExecuted",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "support",
				"type": "bool"
			}
		],
		"name": "vote",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "voter",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "support",
				"type": "bool"
			}
		],
		"name": "Voted",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			}
		],
		"name": "getProposalVotes",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "yes",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "no",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "executed",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "membership",
		"outputs": [
			{
				"internalType": "contract SisterhoodMembership",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "proposals",
		"outputs": [
			{
				"internalType": "address payable",
				"name": "recipient",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "reason",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "voteStart",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "voteEnd",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "yesVotes",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "noVotes",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "executed",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "treasury",
		"outputs": [
			{
				"internalType": "contract SisterhoodTreasury",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

let provider;
let signer;
let membershipContract;
let treasuryContract;
let votingContract;
let userAddress;

// 连接钱包
document.getElementById('connectBtn').addEventListener('click', async () => {
    if (window.ethereum) {
        try {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            signer = provider.getSigner();
            userAddress = await signer.getAddress();
            document.getElementById('account').innerText = `✅ 已连接: ${userAddress.slice(0,6)}...${userAddress.slice(-4)}`;
            
            // 初始化合约实例
            membershipContract = new ethers.Contract(MEMBERSHIP_ADDRESS, MEMBERSHIP_ABI, signer);
            treasuryContract = new ethers.Contract(TREASURY_ADDRESS, TREASURY_ABI, signer);
            votingContract = new ethers.Contract(VOTING_ADDRESS, VOTING_ABI, signer);
            
            // 显示功能区块
            document.getElementById('memberInfo').style.display = 'block';
            document.getElementById('treasuryInfo').style.display = 'block';
            document.getElementById('votingInfo').style.display = 'block';
            
            // 加载所有数据
            await loadMemberStatus();
            await loadTreasuryBalance();
            await loadProposals();
            await refreshPendingRequests();   // 加载待审批列表
            
            listenEvents();
        } catch (err) {
            console.error("连接失败", err);
            alert("连接钱包失败: " + err.message);
        }
    } else {
        alert("请安装MetaMask或支持以太坊的钱包");
    }
});

// 加载成员状态（包括申请状态）
async function loadMemberStatus() {
    try {
        const isActive = await membershipContract.isActive(userAddress);
        const admin = await membershipContract.admin();
        const isAdmin = (admin.toLowerCase() === userAddress.toLowerCase());
        document.getElementById('isActive').innerText = isActive ? "活跃成员 ✅" : "非活跃成员 ❌";
        document.getElementById('isAdmin').innerText = isAdmin ? "是 (管理员)" : "否";
        
        // 查询申请状态
        const hasJoinRequest = await membershipContract.joinRequests(userAddress);
        const hasLeaveRequest = await membershipContract.leaveRequests(userAddress);
        document.getElementById('joinRequestStatus').innerText = hasJoinRequest ? "等待审批中 ⏳" : "无申请";
        document.getElementById('leaveRequestStatus').innerText = hasLeaveRequest ? "等待审批中 ⏳" : "无申请";
        
        // 管理员面板显示
        if (isAdmin) {
            document.getElementById('adminPanel').style.display = 'block';
        } else {
            document.getElementById('adminPanel').style.display = 'none';
        }
    } catch (error) {
        console.error("加载成员状态失败", error);
    }
}

// 加载资金库余额
async function loadTreasuryBalance() {
    try {
        const totalFunds = await treasuryContract.totalFunds();
        const avax = ethers.utils.formatEther(totalFunds);
        document.getElementById('totalFunds').innerText = parseFloat(avax).toFixed(4);
    } catch (error) {
        console.error("加载资金库余额失败", error);
    }
}

// 加载所有提案（优化版：自动探测提案数量，最多50）
async function loadProposals() {
    try {
        const proposalsDiv = document.getElementById('proposalsList');
        proposalsDiv.innerHTML = "";
        let hasAny = false;
        
        for (let i = 0; i < 50; i++) {
            try {
                const proposal = await votingContract.proposals(i);
                if (proposal.recipient === "0x0000000000000000000000000000000000000000") {
                    continue;
                }
                hasAny = true;
                const yesVotes = proposal.yesVotes.toString();
                const noVotes = proposal.noVotes.toString();
                const executed = proposal.executed;
                const amountAvax = ethers.utils.formatEther(proposal.amount);
                
                const div = document.createElement('div');
                div.className = 'proposal-item';
                div.innerHTML = `
                    <div class="proposal-title">📌 提案 #${i}</div>
                    <div><span class="badge">受益人</span> ${proposal.recipient}</div>
                    <div><span class="badge">金额</span> ${amountAvax} AVAX</div>
                    <div><span class="badge">理由</span> ${proposal.reason}</div>
                    <div><span class="badge">赞成</span> ${yesVotes} &nbsp;|&nbsp; <span class="badge">反对</span> ${noVotes}</div>
                    <div><span class="badge">状态</span> ${executed ? '✅ 已执行' : '⏳ 投票中/待执行'}</div>
                    <div style="margin-top: 12px;">
                        <button class="vote-yes" data-id="${i}" data-support="true">👍 赞成</button>
                        <button class="vote-no" data-id="${i}" data-support="false">👎 反对</button>
                        <button class="execute-proposal" data-id="${i}" ${executed ? 'disabled style="opacity:0.5;"' : ''}>⚡ 执行提案</button>
                    </div>
                `;
                proposalsDiv.appendChild(div);
            } catch (e) {
                break;
            }
        }
        
        // 动态绑定按钮事件（委托方式）
        const container = document.getElementById('proposalsList');
        container.querySelectorAll('.vote-yes, .vote-no').forEach(btn => {
            btn.removeEventListener('click', handleVote);
            btn.addEventListener('click', handleVote);
        });
        container.querySelectorAll('.execute-proposal').forEach(btn => {
            btn.removeEventListener('click', handleExecute);
            btn.addEventListener('click', handleExecute);
        });
        
        document.getElementById('noProposalsMsg').style.display = hasAny ? 'none' : 'block';
    } catch (error) {
        console.error("加载提案失败", error);
    }
}

function handleVote(event) {
    const btn = event.currentTarget;
    const proposalId = parseInt(btn.getAttribute('data-id'));
    const support = btn.getAttribute('data-support') === 'true';
    voteProposal(proposalId, support);
}

function handleExecute(event) {
    const btn = event.currentTarget;
    const proposalId = parseInt(btn.getAttribute('data-id'));
    executeProposal(proposalId);
}

async function voteProposal(proposalId, support) {
    try {
        const tx = await votingContract.vote(proposalId, support);
        await tx.wait();
        alert("投票成功 🎉");
        await loadProposals();
    } catch (error) {
        console.error("投票失败", error);
        alert("投票失败: " + (error.message || "未知错误"));
    }
}

async function executeProposal(proposalId) {
    try {
        const tx = await votingContract.executeProposal(proposalId);
        await tx.wait();
        alert("提案执行成功 🚀");
        await loadProposals();
        await loadTreasuryBalance();
    } catch (error) {
        console.error("执行失败", error);
        alert("执行失败: " + (error.message || "未知错误"));
    }
}

// ==================== 待审批列表相关 ====================
// 刷新待审批列表（查询历史事件并过滤）
async function refreshPendingRequests() {
    if (!membershipContract || !provider) return;
    try {
        const currentBlock = await provider.getBlockNumber();
        const fromBlock = 0;
        const toBlock = currentBlock;

        // 1. 查询所有 JoinRequested 事件
        const joinFilter = membershipContract.filters.JoinRequested();
        const joinEvents = await membershipContract.queryFilter(joinFilter, fromBlock, toBlock);
        const pendingJoins = [];
        for (const event of joinEvents) {
            const applicant = event.args.applicant;
            const isPending = await membershipContract.joinRequests(applicant);
            if (isPending) {
                pendingJoins.push(applicant);
            }
        }

        // 2. 查询所有 LeaveRequested 事件
        const leaveFilter = membershipContract.filters.LeaveRequested();
        const leaveEvents = await membershipContract.queryFilter(leaveFilter, fromBlock, toBlock);
        const pendingLeaves = [];
        for (const event of leaveEvents) {
            const member = event.args.member;
            const isPending = await membershipContract.leaveRequests(member);
            if (isPending) {
                pendingLeaves.push(member);
            }
        }

        // 渲染加入申请列表
        const joinContainer = document.getElementById('pendingJoinList');
        if (pendingJoins.length === 0) {
            joinContainer.innerHTML = '<div style="color:#aaa; text-align:center;">暂无待审批加入申请</div>';
        } else {
            joinContainer.innerHTML = pendingJoins.map(addr => `
                <div class="pending-item" data-addr="${addr}" data-type="join">
                    <span class="addr">${addr.slice(0,6)}...${addr.slice(-4)}</span>
                    <button class="approve-join-btn">✅ 批准</button>
                    <button class="reject-join-btn">❌ 拒绝</button>
                </div>
            `).join('');
            // 绑定按钮事件
            joinContainer.querySelectorAll('.approve-join-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const item = btn.closest('.pending-item');
                    const addr = item.getAttribute('data-addr');
                    approveJoin(addr);
                });
            });
            joinContainer.querySelectorAll('.reject-join-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const item = btn.closest('.pending-item');
                    const addr = item.getAttribute('data-addr');
                    rejectJoin(addr);
                });
            });
        }

        // 渲染退出申请列表
        const leaveContainer = document.getElementById('pendingLeaveList');
        if (pendingLeaves.length === 0) {
            leaveContainer.innerHTML = '<div style="color:#aaa; text-align:center;">暂无待审批退出申请</div>';
        } else {
            leaveContainer.innerHTML = pendingLeaves.map(addr => `
                <div class="pending-item" data-addr="${addr}" data-type="leave">
                    <span class="addr">${addr.slice(0,6)}...${addr.slice(-4)}</span>
                    <button class="approve-leave-btn">✅ 批准</button>
                    <button class="reject-leave-btn">❌ 拒绝</button>
                </div>
            `).join('');
            leaveContainer.querySelectorAll('.approve-leave-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const item = btn.closest('.pending-item');
                    const addr = item.getAttribute('data-addr');
                    approveLeave(addr);
                });
            });
            leaveContainer.querySelectorAll('.reject-leave-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const item = btn.closest('.pending-item');
                    const addr = item.getAttribute('data-addr');
                    rejectLeave(addr);
                });
            });
        }
    } catch (error) {
        console.error("刷新待审批列表失败", error);
    }
}

// 封装审批函数，供按钮调用
async function approveJoin(addr) {
    try {
        const tx = await membershipContract.approveJoin(addr);
        await tx.wait();
        alert(`已批准 ${addr} 加入`);
        await refreshPendingRequests();
        await loadMemberStatus();
    } catch (error) {
        console.error(error);
        alert("批准失败: " + error.message);
    }
}

async function rejectJoin(addr) {
    try {
        const tx = await membershipContract.rejectJoin(addr);
        await tx.wait();
        alert(`已拒绝 ${addr} 的加入申请`);
        await refreshPendingRequests();
        await loadMemberStatus();
    } catch (error) {
        console.error(error);
        alert("拒绝失败: " + error.message);
    }
}

async function approveLeave(addr) {
    try {
        const tx = await membershipContract.approveLeave(addr);
        await tx.wait();
        alert(`已批准 ${addr} 退出`);
        await refreshPendingRequests();
        await loadMemberStatus();
    } catch (error) {
        console.error(error);
        alert("批准失败: " + error.message);
    }
}

async function rejectLeave(addr) {
    try {
        const tx = await membershipContract.rejectLeave(addr);
        await tx.wait();
        alert(`已拒绝 ${addr} 的退出申请`);
        await refreshPendingRequests();
        await loadMemberStatus();
    } catch (error) {
        console.error(error);
        alert("拒绝失败: " + error.message);
    }
}
// ==================== 待审批列表相关结束 ====================

// 成员操作
document.getElementById('requestJoinBtn').addEventListener('click', async () => {
    try {
        const tx = await membershipContract.requestJoin();
        await tx.wait();
        alert("加入申请已提交，等待管理员审批");
        await loadMemberStatus();
    } catch (error) {
        console.error(error);
        alert("提交失败: " + error.message);
    }
});

document.getElementById('cancelJoinBtn').addEventListener('click', async () => {
    try {
        const tx = await membershipContract.cancelJoinRequest();
        await tx.wait();
        alert("已取消加入申请");
        await loadMemberStatus();
    } catch (error) {
        console.error(error);
        alert("取消失败: " + error.message);
    }
});

document.getElementById('requestLeaveBtn').addEventListener('click', async () => {
    try {
        const tx = await membershipContract.requestLeave();
        await tx.wait();
        alert("退出申请已提交，等待管理员审批");
        await loadMemberStatus();
    } catch (error) {
        console.error(error);
        alert("提交失败: " + error.message);
    }
});

document.getElementById('cancelLeaveBtn').addEventListener('click', async () => {
    try {
        const tx = await membershipContract.cancelLeaveRequest();
        await tx.wait();
        alert("已取消退出申请");
        await loadMemberStatus();
    } catch (error) {
        console.error(error);
        alert("取消失败: " + error.message);
    }
});

// 管理员手动输入审批（保留）
document.getElementById('approveJoinBtn').addEventListener('click', async () => {
    const addr = document.getElementById('approveAddress').value.trim();
    if (!addr) return alert("请输入地址");
    await approveJoin(addr);
});

document.getElementById('rejectJoinBtn').addEventListener('click', async () => {
    const addr = document.getElementById('approveAddress').value.trim();
    if (!addr) return alert("请输入地址");
    await rejectJoin(addr);
});

document.getElementById('approveLeaveBtn').addEventListener('click', async () => {
    const addr = document.getElementById('approveAddress').value.trim();
    if (!addr) return alert("请输入地址");
    await approveLeave(addr);
});

document.getElementById('rejectLeaveBtn').addEventListener('click', async () => {
    const addr = document.getElementById('approveAddress').value.trim();
    if (!addr) return alert("请输入地址");
    await rejectLeave(addr);
});

document.getElementById('refreshRequestsBtn').addEventListener('click', refreshPendingRequests);

// 捐款
document.getElementById('donateBtn').addEventListener('click', async () => {
    const amountAvax = document.getElementById('donateAmount').value;
    if (!amountAvax || isNaN(amountAvax) || parseFloat(amountAvax) <= 0) return alert("请输入有效金额");
    const amountWei = ethers.utils.parseEther(amountAvax);
    try {
        const tx = await treasuryContract.donate({ value: amountWei });
        await tx.wait();
        alert("捐款成功 ❤️");
        await loadTreasuryBalance();
        document.getElementById('donateAmount').value = '';
    } catch (error) {
        console.error(error);
        alert("捐款失败: " + error.message);
    }
});

// 创建提案
document.getElementById('createProposalBtn').addEventListener('click', async () => {
    const recipient = document.getElementById('recipient').value.trim();
    const amountAvax = document.getElementById('proposalAmount').value;
    const reason = document.getElementById('reason').value.trim();
    if (!recipient || !amountAvax || !reason) return alert("请填写完整信息");
    const amountWei = ethers.utils.parseEther(amountAvax);
    try {
        const tx = await votingContract.createProposal(recipient, amountWei, reason);
        await tx.wait();
        alert("提案创建成功 ✨");
        await loadProposals();
        document.getElementById('recipient').value = '';
        document.getElementById('proposalAmount').value = '';
        document.getElementById('reason').value = '';
    } catch (error) {
        console.error(error);
        alert("创建失败: " + error.message);
    }
});

// 监听事件，实时刷新
function listenEvents() {
    membershipContract.on("MemberJoined", (member) => {
        if (member === userAddress) loadMemberStatus();
    });
    membershipContract.on("MemberLeft", (member) => {
        if (member === userAddress) loadMemberStatus();
    });
    membershipContract.on("JoinRequested", () => {
        refreshPendingRequests();
        loadMemberStatus();
    });
    membershipContract.on("JoinRequestApproved", () => {
        refreshPendingRequests();
        loadMemberStatus();
    });
    membershipContract.on("JoinRequestRejected", () => {
        refreshPendingRequests();
        loadMemberStatus();
    });
    membershipContract.on("LeaveRequested", () => {
        refreshPendingRequests();
        loadMemberStatus();
    });
    membershipContract.on("LeaveRequestApproved", () => {
        refreshPendingRequests();
        loadMemberStatus();
    });
    membershipContract.on("LeaveRequestRejected", () => {
        refreshPendingRequests();
        loadMemberStatus();
    });
    treasuryContract.on("DonationReceived", () => loadTreasuryBalance());
    treasuryContract.on("FundsReleased", () => loadTreasuryBalance());
    votingContract.on("ProposalCreated", () => loadProposals());
    votingContract.on("Voted", () => loadProposals());
    votingContract.on("ProposalExecuted", () => { loadProposals(); loadTreasuryBalance(); });
}
