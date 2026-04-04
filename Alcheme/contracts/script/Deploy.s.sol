// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/AlchemeSBT.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        // Deploy AlchemeSBT contract
        AlchemeSBT sbt = new AlchemeSBT();

        vm.stopBroadcast();

        // Output contract address
        console.log("========================================");
        console.log("AlchemeSBT deployed at:", address(sbt));
        console.log("========================================");
    }
}
