// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

// This file has no logic. Its sole purpose is to make Hardhat compile
// ERC1967Proxy into a local artifact so the deploy script can reference it
// via ethers.getContractFactory("ERC1967Proxy").
//
// Do not deploy this file directly — deploy it through deploy.js.
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
