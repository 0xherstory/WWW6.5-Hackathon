require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: {
		version: "0.8.20",
		settings: {
			optimizer: {
				enabled: true,
				runs: 200
			}
		}
	},
	networks: {
		hardhat: {
			chainId: 1337
		},
		fuji: {
			url: process.env.FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc",
			chainId: 43113,
			accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
			gasPrice: 225000000000
		}
	},
	paths: {
		sources: "./contracts",
		tests: "./test",
		cache: "./cache",
		artifacts: "./artifacts"
	}
};
