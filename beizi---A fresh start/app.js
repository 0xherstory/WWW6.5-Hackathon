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
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        userAddress = await signer.getAddress();
        document.getElementById('account').innerText = `已连接: ${userAddress}`;
        
        // 初始化合约实例
        membershipContract = new ethers.Contract(MEMBERSHIP_ADDRESS, MEMBERSHIP_ABI, signer);
        treasuryContract = new ethers.Contract(TREASURY_ADDRESS, TREASURY_ABI, signer);
        votingContract = new ethers.Contract(VOTING_ADDRESS, VOTING_ABI, signer);
        
        // 显示成员区域
        document.getElementById('memberInfo').style.display = 'block';
        document.getElementById('treasuryInfo').style.display = 'block';
        document.getElementById('votingInfo').style.display = 'block';
        
        // 加载数据
        await loadMemberStatus();
        await loadTreasuryBalance();
        await loadProposals();
        
        // 监听事件（可选）
        listenEvents();
    } else {
        alert("请安装MetaMask");
    }
});

// 加载成员状态
async function loadMemberStatus() {
    try {
        const isActive = await membershipContract.isActive(userAddress);
        const admin = await membershipContract.admin();
        const isAdmin = (admin.toLowerCase() === userAddress.toLowerCase());
        document.getElementById('isActive').innerText = isActive ? "活跃成员" : "非活跃成员";
        document.getElementById('isAdmin').innerText = isAdmin ? "是" : "否";
        
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
        document.getElementById('totalFunds').innerText = avax;
    } catch (error) {
        console.error("加载资金库余额失败", error);
    }
}

// 加载所有提案（简单版：只显示ID，你可以扩展）
async function loadProposals() {
    try {
        // 由于没有公开的提案数量函数，我们假设提案ID从0开始递增
        // 这里简单循环获取前10个提案（可调整）
        const proposalsDiv = document.getElementById('proposalsList');
        proposalsDiv.innerHTML = "";
        for (let i = 0; i < 10; i++) {
            try {
                const proposal = await votingContract.proposals(i);
                if (proposal.recipient !== "0x0000000000000000000000000000000000000000") {
                    const yes = proposal.yesVotes.toString();
                    const no = proposal.noVotes.toString();
                    const executed = proposal.executed;
                    const div = document.createElement('div');
                    div.innerHTML = `
                        <p><strong>提案 #${i}</strong>: 受益人 ${proposal.recipient}, 金额 ${ethers.utils.formatEther(proposal.amount)} AVAX<br>
                        理由: ${proposal.reason}<br>
                        赞成: ${yes}, 反对: ${no}, 执行: ${executed ? "是" : "否"}<br>
                        <button onclick="voteProposal(${i}, true)">赞成</button>
                        <button onclick="voteProposal(${i}, false)">反对</button>
                        <button onclick="executeProposal(${i})">执行</button>
                        </p><hr>`;
                    proposalsDiv.appendChild(div);
                }
            } catch (e) {
                // 如果提案不存在，跳过
                break;
            }
        }
    } catch (error) {
        console.error("加载提案失败", error);
    }
}

// 投票函数
window.voteProposal = async (proposalId, support) => {
    try {
        const tx = await votingContract.vote(proposalId, support);
        await tx.wait();
        alert("投票成功");
        await loadProposals(); // 刷新
    } catch (error) {
        console.error("投票失败", error);
        alert("投票失败: " + error.message);
    }
};

// 执行提案
window.executeProposal = async (proposalId) => {
    try {
        const tx = await votingContract.executeProposal(proposalId);
        await tx.wait();
        alert("提案执行成功");
        await loadProposals();
        await loadTreasuryBalance();
    } catch (error) {
        console.error("执行失败", error);
        alert("执行失败: " + error.message);
    }
};

// 申请加入
document.getElementById('requestJoinBtn').addEventListener('click', async () => {
    try {
        const tx = await membershipContract.requestJoin();
        await tx.wait();
        alert("加入申请已提交，等待管理员审批");
    } catch (error) {
        console.error(error);
        alert("提交失败: " + error.message);
    }
});

// 取消加入申请
document.getElementById('cancelJoinBtn').addEventListener('click', async () => {
    try {
        const tx = await membershipContract.cancelJoinRequest();
        await tx.wait();
        alert("已取消加入申请");
    } catch (error) {
        console.error(error);
        alert("取消失败: " + error.message);
    }
});

// 申请退出
document.getElementById('requestLeaveBtn').addEventListener('click', async () => {
    try {
        const tx = await membershipContract.requestLeave();
        await tx.wait();
        alert("退出申请已提交，等待管理员审批");
    } catch (error) {
        console.error(error);
        alert("提交失败: " + error.message);
    }
});

// 取消退出申请
document.getElementById('cancelLeaveBtn').addEventListener('click', async () => {
    try {
        const tx = await membershipContract.cancelLeaveRequest();
        await tx.wait();
        alert("已取消退出申请");
    } catch (error) {
        console.error(error);
        alert("取消失败: " + error.message);
    }
});

// 管理员批准加入
document.getElementById('approveJoinBtn').addEventListener('click', async () => {
    const addr = document.getElementById('approveAddress').value.trim();
    if (!addr) return alert("请输入地址");
    try {
        const tx = await membershipContract.approveJoin(addr);
        await tx.wait();
        alert("已批准加入");
    } catch (error) {
        console.error(error);
        alert("操作失败: " + error.message);
    }
});

// 管理员拒绝加入
document.getElementById('rejectJoinBtn').addEventListener('click', async () => {
    const addr = document.getElementById('approveAddress').value.trim();
    if (!addr) return alert("请输入地址");
    try {
        const tx = await membershipContract.rejectJoin(addr);
        await tx.wait();
        alert("已拒绝加入申请");
    } catch (error) {
        console.error(error);
        alert("操作失败: " + error.message);
    }
});

// 管理员批准退出
document.getElementById('approveLeaveBtn').addEventListener('click', async () => {
    const addr = document.getElementById('approveAddress').value.trim();
    if (!addr) return alert("请输入地址");
    try {
        const tx = await membershipContract.approveLeave(addr);
        await tx.wait();
        alert("已批准退出");
        await loadMemberStatus(); // 刷新状态
    } catch (error) {
        console.error(error);
        alert("操作失败: " + error.message);
    }
});

// 管理员拒绝退出
document.getElementById('rejectLeaveBtn').addEventListener('click', async () => {
    const addr = document.getElementById('approveAddress').value.trim();
    if (!addr) return alert("请输入地址");
    try {
        const tx = await membershipContract.rejectLeave(addr);
        await tx.wait();
        alert("已拒绝退出申请");
    } catch (error) {
        console.error(error);
        alert("操作失败: " + error.message);
    }
});

// 管理员强制踢人
document.getElementById('forceRemoveBtn').addEventListener('click', async () => {
    const addr = document.getElementById('approveAddress').value.trim();
    if (!addr) return alert("请输入地址");
    try {
        const tx = await membershipContract.forceRemove(addr);
        await tx.wait();
        alert("已强制移除成员");
        await loadMemberStatus();
    } catch (error) {
        console.error(error);
        alert("操作失败: " + error.message);
    }
});

// 捐款
document.getElementById('donateBtn').addEventListener('click', async () => {
    const amountAvax = document.getElementById('donateAmount').value;
    if (!amountAvax || isNaN(amountAvax)) return alert("请输入有效金额");
    const amountWei = ethers.utils.parseEther(amountAvax);
    try {
        const tx = await treasuryContract.donate({ value: amountWei });
        await tx.wait();
        alert("捐款成功");
        await loadTreasuryBalance();
    } catch (error) {
        console.error(error);
        alert("捐款失败: " + error.message);
    }
});

// 创建提案
document.getElementById('createProposalBtn').addEventListener('click', async () => {
    const recipient = document.getElementById('recipient').value.trim();
    const amountAvax = document.getElementById('proposalAmount').value;
    const reason = document.getElementById('reason').value;
    if (!recipient || !amountAvax || !reason) return alert("请填写完整");
    const amountWei = ethers.utils.parseEther(amountAvax);
    try {
        const tx = await votingContract.createProposal(recipient, amountWei, reason);
        await tx.wait();
        alert("提案创建成功");
        await loadProposals();
    } catch (error) {
        console.error(error);
        alert("创建失败: " + error.message);
    }
});

// 监听事件，实时刷新（可选）
function listenEvents() {
    membershipContract.on("MemberJoined", (member) => {
        if (member === userAddress) loadMemberStatus();
    });
    membershipContract.on("MemberLeft", (member) => {
        if (member === userAddress) loadMemberStatus();
    });
    treasuryContract.on("DonationReceived", () => loadTreasuryBalance());
    treasuryContract.on("FundsReleased", () => loadTreasuryBalance());
    votingContract.on("ProposalCreated", () => loadProposals());
    votingContract.on("Voted", () => loadProposals());
    votingContract.on("ProposalExecuted", () => loadProposals());
}
