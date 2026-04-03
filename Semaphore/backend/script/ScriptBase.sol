// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface Vm {
    function startBroadcast(uint256 privateKey) external;
    function stopBroadcast() external;
}

address constant VM_ADDRESS = address(uint160(uint256(keccak256("hevm cheat code"))));

abstract contract ScriptBase {
    Vm internal constant vm = Vm(VM_ADDRESS);
}
