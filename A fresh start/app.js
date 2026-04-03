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

// ==================== 全局变量 ====================
let provider;
let signer;
let membershipContract;
let treasuryContract;
let votingContract;
let userAddress;

let pendingJoins = [];
let pendingLeaves = [];

// ==================== 语言支持 ====================
let currentLang = 'zh';
const texts = {
    zh: {
        connect: "🔗 连接钱包",
        connected: "✅ 已连接",
        memberStatus: "✅ 成员状态:",
        adminLabel: "👑 管理员:",
        joinReqLabel: "📝 加入申请状态:",
        leaveReqLabel: "🚪 退出申请状态:",
        activeYes: "活跃成员 ✅",
        activeNo: "非活跃成员 ❌",
        adminYes: "是 (管理员)",
        adminNo: "否",
        joinPending: "等待审批中 ⏳",
        noRequest: "无申请",
        requestJoin: "✨ 申请加入",
        cancelJoin: "🗑️ 取消加入申请",
        requestLeave: "🚪 申请退出",
        cancelLeave: "↩️ 取消退出申请",
        adminOps: "🛡️ 管理员操作",
        approveJoin: "✅ 批准加入",
        rejectJoin: "❌ 拒绝加入",
        approveLeave: "✅ 批准退出",
        rejectLeave: "❌ 拒绝退出",
        pendingJoinTitle: "📥 待审批加入申请",
        pendingLeaveTitle: "📤 待审批退出申请",
        treasuryTitle: "🏦 互助资金库",
        balanceLabel: "💰 总余额:",
        donateBtn: "💖 爱心捐款",
        votingTitle: "🗳️ 社区治理提案",
        newProposalTitle: "📝 发起新提案",
        recipientPlaceholder: "受益人地址",
        amountPlaceholder: "申请金额 (AVAX)",
        reasonPlaceholder: "提案理由 (例如: 社区活动经费、困难援助等)",
        createProposal: "✨ 创建提案",
        proposalNote: "📌 仅活跃成员可创建提案，投票期结束后自动可执行",
        allProposalsTitle: "📋 全部提案",
        noProposals: "暂无提案，成为成员后发起第一个吧 🌱",
        voteYes: "👍 赞成",
        voteNo: "👎 反对",
        execute: "⚡ 执行提案",
        donateSuccess: "捐款成功！感谢您的爱心",
        joinRequestSubmitted: "加入申请已提交，等待管理员审批",
        joinRequestCancelled: "已取消加入申请",
        leaveRequestSubmitted: "退出申请已提交，等待管理员审批",
        leaveRequestCancelled: "已取消退出申请",
        approveJoinSuccess: (addr) => `已批准 ${addr.slice(0,6)}...${addr.slice(-4)} 加入`,
        rejectJoinSuccess: (addr) => `已拒绝 ${addr.slice(0,6)}...${addr.slice(-4)} 的加入申请`,
        approveLeaveSuccess: (addr) => `已批准 ${addr.slice(0,6)}...${addr.slice(-4)} 退出`,
        rejectLeaveSuccess: (addr) => `已拒绝 ${addr.slice(0,6)}...${addr.slice(-4)} 的退出申请`,
        centerJoinWelcome: "欢迎你的加入！让我们为自己的基金添砖加瓦吧！",
        centerLeaveSorry: "很遗憾你的退出，我们随时欢迎你的再次加入",
    },
    en: {
        connect: "🔗 Connect Wallet",
        connected: "✅ Connected",
        memberStatus: "✅ Member status:",
        adminLabel: "👑 Admin:",
        joinReqLabel: "📝 Join request status:",
        leaveReqLabel: "🚪 Leave request status:",
        activeYes: "Active Member ✅",
        activeNo: "Inactive Member ❌",
        adminYes: "Yes (Admin)",
        adminNo: "No",
        joinPending: "Pending approval ⏳",
        noRequest: "No request",
        requestJoin: "✨ Request to Join",
        cancelJoin: "🗑️ Cancel Join Request",
        requestLeave: "🚪 Request to Leave",
        cancelLeave: "↩️ Cancel Leave Request",
        adminOps: "🛡️ Admin Operations",
        approveJoin: "✅ Approve Join",
        rejectJoin: "❌ Reject Join",
        approveLeave: "✅ Approve Leave",
        rejectLeave: "❌ Reject Leave",
        pendingJoinTitle: "📥 Pending Join Requests",
        pendingLeaveTitle: "📤 Pending Leave Requests",
        treasuryTitle: "🏦 Mutual Aid Treasury",
        balanceLabel: "💰 Total Balance:",
        donateBtn: "💖 Donate",
        votingTitle: "🗳️ Community Proposals",
        newProposalTitle: "📝 Create Proposal",
        recipientPlaceholder: "Recipient Address",
        amountPlaceholder: "Amount (AVAX)",
        reasonPlaceholder: "Reason (e.g., community event, emergency aid)",
        createProposal: "✨ Create Proposal",
        proposalNote: "📌 Only active members can create proposals. Execution available after voting period ends.",
        allProposalsTitle: "📋 All Proposals",
        noProposals: "No proposals yet. Become a member and create the first one 🌱",
        voteYes: "👍 For",
        voteNo: "👎 Against",
        execute: "⚡ Execute",
        donateSuccess: "Donation successful! Thank you for your kindness",
        joinRequestSubmitted: "Join request submitted, waiting for admin approval",
        joinRequestCancelled: "Join request cancelled",
        leaveRequestSubmitted: "Leave request submitted, waiting for admin approval",
        leaveRequestCancelled: "Leave request cancelled",
        approveJoinSuccess: (addr) => `Approved ${addr.slice(0,6)}...${addr.slice(-4)} to join`,
        rejectJoinSuccess: (addr) => `Rejected ${addr.slice(0,6)}...${addr.slice(-4)}'s join request`,
        approveLeaveSuccess: (addr) => `Approved ${addr.slice(0,6)}...${addr.slice(-4)} to leave`,
        rejectLeaveSuccess: (addr) => `Rejected ${addr.slice(0,6)}...${addr.slice(-4)}'s leave request`,
        centerJoinWelcome: "Welcome! Let's build our fund together!",
        centerLeaveSorry: "Sorry to see you go. You're always welcome to rejoin",
    }
};

function updateLanguage() {
    const t = texts[currentLang];
    document.getElementById('connectBtn').innerText = t.connect;
    document.getElementById('memberStatusLabel').innerText = t.memberStatus;
    document.getElementById('adminLabel').innerText = t.adminLabel;
    document.getElementById('joinReqLabel').innerText = t.joinReqLabel;
    document.getElementById('leaveReqLabel').innerText = t.leaveReqLabel;
    document.getElementById('requestJoinBtn').innerText = t.requestJoin;
    document.getElementById('cancelJoinBtn').innerText = t.cancelJoin;
    document.getElementById('requestLeaveBtn').innerText = t.requestLeave;
    document.getElementById('cancelLeaveBtn').innerText = t.cancelLeave;
    if (document.getElementById('adminPanel').style.display !== 'none') {
        document.getElementById('adminOps').innerText = t.adminOps;
        document.getElementById('approveJoinBtn').innerText = t.approveJoin;
        document.getElementById('rejectJoinBtn').innerText = t.rejectJoin;
        document.getElementById('approveLeaveBtn').innerText = t.approveLeave;
        document.getElementById('rejectLeaveBtn').innerText = t.rejectLeave;
        document.getElementById('pendingJoinTitle').innerText = t.pendingJoinTitle;
        document.getElementById('pendingLeaveTitle').innerText = t.pendingLeaveTitle;
    }
    document.getElementById('treasuryTitle').innerText = t.treasuryTitle;
    document.getElementById('balanceLabel').innerHTML = t.balanceLabel;
    document.getElementById('donateBtn').innerText = t.donateBtn;
    document.getElementById('votingTitle').innerText = t.votingTitle;
    document.getElementById('newProposalTitle').innerText = t.newProposalTitle;
    document.getElementById('recipient').placeholder = t.recipientPlaceholder;
    document.getElementById('proposalAmount').placeholder = t.amountPlaceholder;
    document.getElementById('reason').placeholder = t.reasonPlaceholder;
    document.getElementById('createProposalBtn').innerText = t.createProposal;
    document.getElementById('proposalNote').innerText = t.proposalNote;
    document.getElementById('allProposalsTitle').innerText = t.allProposalsTitle;
    document.getElementById('noProposalsMsg').innerText = t.noProposals;
    loadProposals();
    loadMemberStatus();
}

document.getElementById('langSwitcher').addEventListener('change', (e) => {
    currentLang = e.target.value;
    updateLanguage();
});

// ==================== 通知系统 ====================
// 右下角 Toast (白底粉字，可关闭，自动3秒，无图标)
function showToast(message) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <span>${message}</span>
        <button class="close-toast">✖</button>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    const closeBtn = toast.querySelector('.close-toast');
    closeBtn.addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    });
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }
    }, 3000);
}

// 顶部中间通知（用于捐款成功，从上滑入滑出）
function showTopNotification(message) {
    // 检查是否已存在，避免重复添加
    let topNotif = document.getElementById('topNotification');
    if (topNotif) topNotif.remove();
    
    const div = document.createElement('div');
    div.id = 'topNotification';
    div.innerHTML = `
        <span>${message}</span>
        <button class="close-top">✖</button>
    `;
    div.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        background: white;
        color: #e66767;
        padding: 12px 24px;
        border-radius: 40px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1100;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 12px;
        transition: transform 0.3s ease;
        border-left: 5px solid #e66767;
    `;
    document.body.appendChild(div);
    
    setTimeout(() => {
        div.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);
    
    const closeBtn = div.querySelector('.close-top');
    closeBtn.addEventListener('click', () => {
        div.style.transform = 'translateX(-50%) translateY(-100px)';
        setTimeout(() => div.remove(), 300);
    });
    
    setTimeout(() => {
        if (div.parentNode) {
            div.style.transform = 'translateX(-50%) translateY(-100px)';
            setTimeout(() => div.remove(), 300);
        }
    }, 3000);
}

// 中心通知（管理员审批弹窗，无图标）
function showCenterNotification(message) {
    const centerDiv = document.getElementById('centerNotification');
    const msgSpan = document.getElementById('centerMsg');
    msgSpan.innerText = message;
    centerDiv.style.display = 'block';
    setTimeout(() => centerDiv.classList.add('show'), 10);
    const closeBtn = document.getElementById('closeCenterBtn');
    const closeHandler = () => {
        centerDiv.classList.remove('show');
        setTimeout(() => centerDiv.style.display = 'none', 300);
        closeBtn.removeEventListener('click', closeHandler);
    };
    closeBtn.addEventListener('click', closeHandler);
    setTimeout(() => {
        if (centerDiv.style.display !== 'none') {
            closeHandler();
        }
    }, 3000);
}

// ==================== 工具函数 ====================
function showLoading() {
    console.log("⏳ 交易处理中...");
}
function hideLoading() {
    console.log("✅ 交易完成");
}

// ==================== 连接钱包 ====================
document.getElementById('connectBtn').addEventListener('click', async () => {
    if (window.ethereum) {
        try {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            signer = provider.getSigner();
            userAddress = await signer.getAddress();
            const t = texts[currentLang];
            document.getElementById('account').innerText = `${t.connected} ${userAddress.slice(0,6)}...${userAddress.slice(-4)}`;

            membershipContract = new ethers.Contract(MEMBERSHIP_ADDRESS, MEMBERSHIP_ABI, signer);
            treasuryContract = new ethers.Contract(TREASURY_ADDRESS, TREASURY_ABI, signer);
            votingContract = new ethers.Contract(VOTING_ADDRESS, VOTING_ABI, signer);

            document.getElementById('memberInfo').style.display = 'block';
            document.getElementById('treasuryInfo').style.display = 'block';
            document.getElementById('votingInfo').style.display = 'block';

            await loadMemberStatus();
            await loadTreasuryBalance();
            await loadProposals();
            renderPendingLists();
            listenEvents();
            updateLanguage();
        } catch (err) {
            console.error("连接失败", err);
            alert("连接钱包失败: " + err.message);
        }
    } else {
        alert("请安装MetaMask或支持以太坊的钱包");
    }
});

// ==================== 加载成员状态 ====================
async function loadMemberStatus() {
    try {
        const isActive = await membershipContract.isActive(userAddress);
        const admin = await membershipContract.admin();
        const isAdmin = (admin.toLowerCase() === userAddress.toLowerCase());
        const t = texts[currentLang];
        document.getElementById('isActive').innerText = isActive ? t.activeYes : t.activeNo;
        document.getElementById('isAdmin').innerText = isAdmin ? t.adminYes : t.adminNo;

        const hasJoinRequest = await membershipContract.joinRequests(userAddress);
        const hasLeaveRequest = await membershipContract.leaveRequests(userAddress);
        document.getElementById('joinRequestStatus').innerText = hasJoinRequest ? t.joinPending : t.noRequest;
        document.getElementById('leaveRequestStatus').innerText = hasLeaveRequest ? t.joinPending : t.noRequest;

        if (isAdmin) {
            document.getElementById('adminPanel').style.display = 'block';
        } else {
            document.getElementById('adminPanel').style.display = 'none';
        }
    } catch (error) {
        console.error("加载成员状态失败", error);
    }
}

// ==================== 加载资金库余额 ====================
async function loadTreasuryBalance() {
    try {
        const totalFunds = await treasuryContract.totalFunds();
        const avax = ethers.utils.formatEther(totalFunds);
        document.getElementById('totalFunds').innerText = parseFloat(avax).toFixed(4);
    } catch (error) {
        console.error("加载资金库余额失败", error);
    }
}

// ==================== 加载提案列表 ====================
async function loadProposals() {
    try {
        const proposalsDiv = document.getElementById('proposalsList');
        proposalsDiv.innerHTML = "";
        let hasAny = false;
        const t = texts[currentLang];

        for (let i = 0; i < 50; i++) {
            try {
                const proposal = await votingContract.proposals(i);
                if (proposal.recipient === "0x0000000000000000000000000000000000000000") continue;
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
                        <button class="vote-yes" data-id="${i}" data-support="true">${t.voteYes}</button>
                        <button class="vote-no" data-id="${i}" data-support="false">${t.voteNo}</button>
                        <button class="execute-proposal" data-id="${i}" ${executed ? 'disabled style="opacity:0.5;"' : ''}>${t.execute}</button>
                    </div>
                `;
                proposalsDiv.appendChild(div);
            } catch (e) {
                break;
            }
        }

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
        showLoading();
        const tx = await votingContract.vote(proposalId, support);
        await tx.wait();
        const t = texts[currentLang];
        showToast(`投票成功！您投了${support ? "赞成" : "反对"}`);
        await loadProposals();
    } catch (error) {
        console.error("投票失败", error);
        alert("投票失败: " + (error.message || "未知错误"));
    } finally {
        hideLoading();
    }
}

async function executeProposal(proposalId) {
    try {
        showLoading();
        const tx = await votingContract.executeProposal(proposalId);
        await tx.wait();
        showToast("提案执行成功");
        await loadProposals();
        await loadTreasuryBalance();
    } catch (error) {
        console.error("执行失败", error);
        alert("执行失败: " + (error.message || "未知错误"));
    } finally {
        hideLoading();
    }
}

// ==================== 待审批列表渲染 ====================
function renderPendingLists() {
    const joinContainer = document.getElementById('pendingJoinList');
    const t = texts[currentLang];
    if (pendingJoins.length === 0) {
        joinContainer.innerHTML = '<div style="color:#aaa; text-align:center;">暂无待审批加入申请</div>';
    } else {
        joinContainer.innerHTML = pendingJoins.map(addr => `
            <div class="pending-item" data-addr="${addr}" data-type="join">
                <span class="addr">${addr.slice(0,6)}...${addr.slice(-4)}</span>
                <button class="approve-join-btn">${t.approveJoin}</button>
                <button class="reject-join-btn">${t.rejectJoin}</button>
            </div>
        `).join('');
        joinContainer.querySelectorAll('.approve-join-btn').forEach(btn => {
            btn.removeEventListener('click', handleApproveJoin);
            btn.addEventListener('click', handleApproveJoin);
        });
        joinContainer.querySelectorAll('.reject-join-btn').forEach(btn => {
            btn.removeEventListener('click', handleRejectJoin);
            btn.addEventListener('click', handleRejectJoin);
        });
    }

    const leaveContainer = document.getElementById('pendingLeaveList');
    if (pendingLeaves.length === 0) {
        leaveContainer.innerHTML = '<div style="color:#aaa; text-align:center;">暂无待审批退出申请</div>';
    } else {
        leaveContainer.innerHTML = pendingLeaves.map(addr => `
            <div class="pending-item" data-addr="${addr}" data-type="leave">
                <span class="addr">${addr.slice(0,6)}...${addr.slice(-4)}</span>
                <button class="approve-leave-btn">${t.approveLeave}</button>
                <button class="reject-leave-btn">${t.rejectLeave}</button>
            </div>
        `).join('');
        leaveContainer.querySelectorAll('.approve-leave-btn').forEach(btn => {
            btn.removeEventListener('click', handleApproveLeave);
            btn.addEventListener('click', handleApproveLeave);
        });
        leaveContainer.querySelectorAll('.reject-leave-btn').forEach(btn => {
            btn.removeEventListener('click', handleRejectLeave);
            btn.addEventListener('click', handleRejectLeave);
        });
    }
}

async function approveJoin(addr) {
    try {
        showLoading();
        const tx = await membershipContract.approveJoin(addr);
        await tx.wait();
        const t = texts[currentLang];
        showToast(t.approveJoinSuccess(addr));
    } catch (error) {
        console.error(error);
        alert("批准失败: " + error.message);
    } finally {
        hideLoading();
    }
}

async function rejectJoin(addr) {
    try {
        showLoading();
        const tx = await membershipContract.rejectJoin(addr);
        await tx.wait();
        const t = texts[currentLang];
        showToast(t.rejectJoinSuccess(addr));
    } catch (error) {
        console.error(error);
        alert("拒绝失败: " + error.message);
    } finally {
        hideLoading();
    }
}

async function approveLeave(addr) {
    try {
        showLoading();
        const tx = await membershipContract.approveLeave(addr);
        await tx.wait();
        const t = texts[currentLang];
        showToast(t.approveLeaveSuccess(addr));
    } catch (error) {
        console.error(error);
        alert("批准失败: " + error.message);
    } finally {
        hideLoading();
    }
}

async function rejectLeave(addr) {
    try {
        showLoading();
        const tx = await membershipContract.rejectLeave(addr);
        await tx.wait();
        const t = texts[currentLang];
        showToast(t.rejectLeaveSuccess(addr));
    } catch (error) {
        console.error(error);
        alert("拒绝失败: " + error.message);
    } finally {
        hideLoading();
    }
}

function handleApproveJoin(e) {
    const item = e.target.closest('.pending-item');
    const addr = item.getAttribute('data-addr');
    approveJoin(addr);
}
function handleRejectJoin(e) {
    const item = e.target.closest('.pending-item');
    const addr = item.getAttribute('data-addr');
    rejectJoin(addr);
}
function handleApproveLeave(e) {
    const item = e.target.closest('.pending-item');
    const addr = item.getAttribute('data-addr');
    approveLeave(addr);
}
function handleRejectLeave(e) {
    const item = e.target.closest('.pending-item');
    const addr = item.getAttribute('data-addr');
    rejectLeave(addr);
}

// ==================== 事件监听 ====================
function listenEvents() {
    membershipContract.on("JoinRequested", (applicant) => {
        if (!pendingJoins.includes(applicant)) {
            pendingJoins.push(applicant);
            renderPendingLists();
        }
        loadMemberStatus();
    });
    membershipContract.on("JoinRequestApproved", (applicant) => {
        pendingJoins = pendingJoins.filter(a => a !== applicant);
        renderPendingLists();
        loadMemberStatus();
        if (userAddress && applicant.toLowerCase() === userAddress.toLowerCase()) {
            const t = texts[currentLang];
            showCenterNotification(t.centerJoinWelcome);
        }
    });
    membershipContract.on("JoinRequestRejected", (applicant) => {
        pendingJoins = pendingJoins.filter(a => a !== applicant);
        renderPendingLists();
        loadMemberStatus();
    });
    membershipContract.on("LeaveRequested", (member) => {
        if (!pendingLeaves.includes(member)) {
            pendingLeaves.push(member);
            renderPendingLists();
        }
        loadMemberStatus();
    });
    membershipContract.on("LeaveRequestApproved", (member) => {
        pendingLeaves = pendingLeaves.filter(m => m !== member);
        renderPendingLists();
        loadMemberStatus();
        if (userAddress && member.toLowerCase() === userAddress.toLowerCase()) {
            const t = texts[currentLang];
            showCenterNotification(t.centerLeaveSorry);
        }
    });
    membershipContract.on("LeaveRequestRejected", (member) => {
        pendingLeaves = pendingLeaves.filter(m => m !== member);
        renderPendingLists();
        loadMemberStatus();
    });

    treasuryContract.on("DonationReceived", (donor) => {
        loadTreasuryBalance();
        if (donor.toLowerCase() === userAddress?.toLowerCase()) {
            const t = texts[currentLang];
            showTopNotification(t.donateSuccess); // 使用顶部通知
        }
    });
    treasuryContract.on("FundsReleased", () => loadTreasuryBalance());
    votingContract.on("ProposalCreated", () => loadProposals());
    votingContract.on("Voted", () => loadProposals());
    votingContract.on("ProposalExecuted", () => { loadProposals(); loadTreasuryBalance(); });
}

// ==================== 成员操作按钮 ====================
document.getElementById('requestJoinBtn').addEventListener('click', async () => {
    try {
        showLoading();
        const tx = await membershipContract.requestJoin();
        await tx.wait();
        const t = texts[currentLang];
        showToast(t.joinRequestSubmitted);
        await loadMemberStatus();
    } catch (error) {
        console.error(error);
        alert("提交失败: " + error.message);
    } finally {
        hideLoading();
    }
});

document.getElementById('cancelJoinBtn').addEventListener('click', async () => {
    try {
        showLoading();
        const tx = await membershipContract.cancelJoinRequest();
        await tx.wait();
        const t = texts[currentLang];
        showToast(t.joinRequestCancelled);
        await loadMemberStatus();
    } catch (error) {
        console.error(error);
        alert("取消失败: " + error.message);
    } finally {
        hideLoading();
    }
});

document.getElementById('requestLeaveBtn').addEventListener('click', async () => {
    try {
        showLoading();
        const tx = await membershipContract.requestLeave();
        await tx.wait();
        const t = texts[currentLang];
        showToast(t.leaveRequestSubmitted);
        await loadMemberStatus();
    } catch (error) {
        console.error(error);
        alert("提交失败: " + error.message);
    } finally {
        hideLoading();
    }
});

document.getElementById('cancelLeaveBtn').addEventListener('click', async () => {
    try {
        showLoading();
        const tx = await membershipContract.cancelLeaveRequest();
        await tx.wait();
        const t = texts[currentLang];
        showToast(t.leaveRequestCancelled);
        await loadMemberStatus();
    } catch (error) {
        console.error(error);
        alert("取消失败: " + error.message);
    } finally {
        hideLoading();
    }
});

// 管理员手动输入审批
document.getElementById('approveJoinBtn').addEventListener('click', async () => {
    const addr = document.getElementById('approveAddress').value.trim();
    if (!addr) return showToast("请输入地址");
    await approveJoin(addr);
});
document.getElementById('rejectJoinBtn').addEventListener('click', async () => {
    const addr = document.getElementById('approveAddress').value.trim();
    if (!addr) return showToast("请输入地址");
    await rejectJoin(addr);
});
document.getElementById('approveLeaveBtn').addEventListener('click', async () => {
    const addr = document.getElementById('approveAddress').value.trim();
    if (!addr) return showToast("请输入地址");
    await approveLeave(addr);
});
document.getElementById('rejectLeaveBtn').addEventListener('click', async () => {
    const addr = document.getElementById('approveAddress').value.trim();
    if (!addr) return showToast("请输入地址");
    await rejectLeave(addr);
});

// 捐款
document.getElementById('donateBtn').addEventListener('click', async () => {
    const amountAvax = document.getElementById('donateAmount').value;
    if (!amountAvax || isNaN(amountAvax) || parseFloat(amountAvax) <= 0) return showToast("请输入有效金额");
    const amountWei = ethers.utils.parseEther(amountAvax);
    try {
        showLoading();
        const tx = await treasuryContract.donate({ value: amountWei });
        await tx.wait();
        // 捐款成功通知会在事件中触发 showTopNotification，这里不再重复
        await loadTreasuryBalance();
        document.getElementById('donateAmount').value = '';
    } catch (error) {
        console.error(error);
        alert("捐款失败: " + error.message);
    } finally {
        hideLoading();
    }
});

// 创建提案
document.getElementById('createProposalBtn').addEventListener('click', async () => {
    const recipient = document.getElementById('recipient').value.trim();
    const amountAvax = document.getElementById('proposalAmount').value;
    const reason = document.getElementById('reason').value.trim();
    if (!recipient || !amountAvax || !reason) return showToast("请填写完整信息");
    const amountWei = ethers.utils.parseEther(amountAvax);
    try {
        showLoading();
        const tx = await votingContract.createProposal(recipient, amountWei, reason);
        await tx.wait();
        showToast("提案创建成功");
        await loadProposals();
        document.getElementById('recipient').value = '';
        document.getElementById('proposalAmount').value = '';
        document.getElementById('reason').value = '';
    } catch (error) {
        console.error(error);
        alert("创建失败: " + error.message);
    } finally {
        hideLoading();
    }
});
