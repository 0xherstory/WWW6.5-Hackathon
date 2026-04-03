import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { defineConfig } from "hardhat/config";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
 networks: {
  hardhatMainnet: {
    type: "edr-simulated",
    chainType: "l1",
  },
 fuji: {
    type: "http",
    chainType: "l1",
    url: process.env.AVALANCHE_FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc",
    chainId: 43113,
    accounts: process.env.AVALANCHE_PRIVATE_KEY
      ? [process.env.AVALANCHE_PRIVATE_KEY]
      : [],
},
},
});