import { ethers } from ethers;

 Replace with your deployed contract address on Avalanche Fuji
export const CONTRACT_ADDRESS = 0x7ba23003ebc7BDa5c897B3b514398b389d375ae0;

 ABI of the deployed contract (you can get it from Remix or your deployment tool)
export const CONTRACT_ABI = [
   [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "admin",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "AccessControlBadConfirmation",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "neededRole",
				"type": "bytes32"
			}
		],
		"name": "AccessControlUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "ProfileUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "previousAdminRole",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "newAdminRole",
				"type": "bytes32"
			}
		],
		"name": "RoleAdminChanged",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "RoleGranted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "RoleRevoked",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "userId",
				"type": "uint256"
			}
		],
		"name": "UserRegistered",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "DAO_ROLE",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "DEFAULT_ADMIN_ROLE",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "deactivateUser",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			}
		],
		"name": "getRoleAdmin",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "getUserProfile",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "userId",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "userAddress",
						"type": "address"
					},
					{
						"internalType": "uint8",
						"name": "vulnerabilityScore",
						"type": "uint8"
					},
					{
						"internalType": "uint8",
						"name": "baselineRisk",
						"type": "uint8"
					},
					{
						"internalType": "bool",
						"name": "hasRetinalDetachment",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "hasRetinalHoles",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "postOpStatus",
						"type": "bool"
					},
					{
						"internalType": "uint8",
						"name": "surgeryType",
						"type": "uint8"
					},
					{
						"internalType": "uint8",
						"name": "laserTreatmentCount",
						"type": "uint8"
					},
					{
						"internalType": "uint256",
						"name": "registeredAt",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "isActive",
						"type": "bool"
					},
					{
						"internalType": "bytes32",
						"name": "dataSharingLevel",
						"type": "bytes32"
					}
				],
				"internalType": "struct UserManagement.UserProfile",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "grantRole",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "hasRole",
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
		"name": "profiles",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "userId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "userAddress",
				"type": "address"
			},
			{
				"internalType": "uint8",
				"name": "vulnerabilityScore",
				"type": "uint8"
			},
			{
				"internalType": "uint8",
				"name": "baselineRisk",
				"type": "uint8"
			},
			{
				"internalType": "bool",
				"name": "hasRetinalDetachment",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "hasRetinalHoles",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "postOpStatus",
				"type": "bool"
			},
			{
				"internalType": "uint8",
				"name": "surgeryType",
				"type": "uint8"
			},
			{
				"internalType": "uint8",
				"name": "laserTreatmentCount",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "registeredAt",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			},
			{
				"internalType": "bytes32",
				"name": "dataSharingLevel",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint8",
				"name": "_vulnerabilityScore",
				"type": "uint8"
			},
			{
				"internalType": "uint8",
				"name": "_baselineRisk",
				"type": "uint8"
			},
			{
				"internalType": "bool",
				"name": "_hasRetinalDetachment",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "_hasRetinalHoles",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "_postOpStatus",
				"type": "bool"
			},
			{
				"internalType": "uint8",
				"name": "_surgeryType",
				"type": "uint8"
			},
			{
				"internalType": "uint8",
				"name": "_laserTreatmentCount",
				"type": "uint8"
			},
			{
				"internalType": "bytes32",
				"name": "_dataSharingLevel",
				"type": "bytes32"
			}
		],
		"name": "registerUser",
		"outputs": [],
		"stateMutability": "nonpayable",
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
		"name": "registeredUsers",
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
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "callerConfirmation",
				"type": "address"
			}
		],
		"name": "renounceRole",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "revokeRole",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes4",
				"name": "interfaceId",
				"type": "bytes4"
			}
		],
		"name": "supportsInterface",
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
		"inputs": [],
		"name": "totalUsers",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
];

 Connect to the Ethereum network using MetaMask
export const connectToMetaMask = async () = {
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send(eth_requestAccounts, []);  Request wallet connection
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    return contract;
  } else {
    alert(MetaMask is not installed);
    throw new Error(MetaMask is not installed);
  }
};

 Function to register a user on the contract
export const registerUser = async (vulnerabilityScore number, baselineRisk number, retinalDetachment boolean, retinalHoles boolean, postOpStatus boolean, surgeryType number, laserTreatmentCount number, dataSharingLevel string) = {
  const contract = await connectToMetaMask();
  const tx = await contract.registerUser(
    vulnerabilityScore,
    baselineRisk,
    retinalDetachment,
    retinalHoles,
    postOpStatus,
    surgeryType,
    laserTreatmentCount,
    ethers.utils.formatBytes32String(dataSharingLevel)   Format string for data sharing level
  );
  await tx.wait();  Wait for the transaction to be mined
  console.log(User registered, tx);
  return tx;
};

 Function to submit a risk event on the contract
export const submitRiskEvent = async (accelLoad number, postureLoad number, durationScore number, symptomsFlag number, activityType string, location string) = {
  const contract = await connectToMetaMask();
  const tx = await contract.submitRiskEvent(accelLoad, postureLoad, durationScore, symptomsFlag, activityType, location);
  await tx.wait();  Wait for the transaction to be mined
  console.log(Risk event submitted, tx);
  return tx;
};

 Function to fetch user health data (for example, risk history)
export const getUserRiskHistory = async (userAddress string) = {
  const contract = await connectToMetaMask();
  const history = await contract.getUserRiskHistory(userAddress);
  return history;
};

 Function to approve data access (for researchers)
export const approveDataAccess = async (requestId number) = {
  const contract = await connectToMetaMask();
  const tx = await contract.approveDataAccess(requestId);
  await tx.wait();  Wait for the transaction to be mined
  console.log(Data access approved, tx);
  return tx;
};

 Function to get the user's reward balance
export const getRewardBalance = async () = {
  const contract = await connectToMetaMask();
  const rewardBalance = await contract.balanceOf(await contract.signer.getAddress());  Assuming you have an ERC20 reward token
  return ethers.utils.formatUnits(rewardBalance, 18);  Format the balance in tokens
};
