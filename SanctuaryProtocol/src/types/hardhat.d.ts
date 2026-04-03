import "@nomicfoundation/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";
import { ethers } from "ethers";
import { HardhatEthersHelpers } from "@nomicfoundation/hardhat-ethers/types";
import { HardhatUpgradesHelpers } from "@openzeppelin/hardhat-upgrades";

declare module "hardhat" {
  interface HardhatRuntimeEnvironment {
    ethers: typeof ethers & HardhatEthersHelpers;
    upgrades: HardhatUpgradesHelpers;
  }
}
