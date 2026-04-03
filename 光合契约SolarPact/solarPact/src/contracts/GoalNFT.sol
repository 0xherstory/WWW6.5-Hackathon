// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GoalNFT {
    uint public tokenId;
    mapping(uint => address) public ownerOf;

    function mint(address to) external {
        ownerOf[tokenId] = to;
        tokenId++;
    }
}