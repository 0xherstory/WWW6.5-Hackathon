import TokenArtifact from '../../../contracts/artifacts/contracts/HerRiseToken.sol/HerRiseToken.json';
import MainArtifact from '../../../contracts/artifacts/contracts/HerRiseMain.sol/HerRiseMain.json';
import contractsConfig from '../contracts-config.json';

// Avalanche Fuji 测试网配置
export const NETWORK_CONFIG = {
	chainId: '0xa869', // 43113 in hex
	chainName: 'Avalanche Fuji Testnet',
	nativeCurrency: {
		name: 'AVAX',
		symbol: 'AVAX',
		decimals: 18,
	},
	rpcUrls: [
		'https://avalanche-fuji-c-chain-rpc.publicnode.com',
		'https://rpc.ankr.com/avalanche_fuji',
		'https://api.avax-test.network/ext/bc/C/rpc',
	],
	blockExplorerUrls: ['https://testnet.snowtrace.io/'],
};

// 合约地址 - 优先使用环境变量，其次使用部署配置
export const CONTRACT_ADDRESSES = {
	TOKEN:
		import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS ||
		contractsConfig.contracts?.HerRiseToken ||
		'',
	MAIN:
		import.meta.env.VITE_MAIN_CONTRACT_ADDRESS ||
		contractsConfig.contracts?.HerRiseMain ||
		'',
};

export const TOKEN_ABI = TokenArtifact.abi;
export const MAIN_ABI = MainArtifact.abi;
