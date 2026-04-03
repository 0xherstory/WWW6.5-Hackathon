// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface Vm {
    function prank(address msgSender) external;
    function startPrank(address msgSender) external;
    function stopPrank() external;
    function warp(uint256 newTimestamp) external;
    function expectRevert(bytes4 selector) external;
}

address constant VM_ADDRESS = address(uint160(uint256(keccak256("hevm cheat code"))));

error AssertionFailed(string message);

abstract contract SimpleTest {
    Vm internal constant vm = Vm(VM_ADDRESS);

    function assertTrue(bool condition, string memory message) internal pure {
        if (!condition) revert AssertionFailed(message);
    }

    function assertEq(uint256 left, uint256 right, string memory message) internal pure {
        if (left != right) revert AssertionFailed(message);
    }

    function assertEq(address left, address right, string memory message) internal pure {
        if (left != right) revert AssertionFailed(message);
    }

    function assertEq(bool left, bool right, string memory message) internal pure {
        if (left != right) revert AssertionFailed(message);
    }

    function assertEq(bytes32 left, bytes32 right, string memory message) internal pure {
        if (left != right) revert AssertionFailed(message);
    }
}
