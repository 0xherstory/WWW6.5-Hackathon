// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ScriptBase} from "./ScriptBase.sol";
import {SemaphoreProtocol} from "../src/SemaphoreProtocol.sol";

contract DeployLocal is ScriptBase {
    uint256 internal constant DEPLOYER_PK =
        0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;

    function run() external returns (SemaphoreProtocol protocol) {
        vm.startBroadcast(DEPLOYER_PK);
        protocol = new SemaphoreProtocol();
        vm.stopBroadcast();
    }
}
