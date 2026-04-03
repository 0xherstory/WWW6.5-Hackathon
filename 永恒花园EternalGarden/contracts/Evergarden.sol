// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Evergarden {
    // 1. 定义一个“记忆”的结构，就像一个小档案卡片
    struct Memory {
        address creator;   // 谁存的（钱包地址）
        string content;    // 存了什么（心愿、故事、文字）
        uint256 timestamp; // 什么时间存的
    }

    // 2. 创建一个列表，把所有的档案卡片都存在这里，这就是咱们的花园底座
    Memory[] public allMemories;

    // 3. 核心功能：把心愿“刻”在区块链上
    // 这个函数运行一次，你的 0.5 AVAX 就会少一丁点儿（手续费），但文字会永远留在链上
    function recordMemory(string memory _content) public {
        allMemories.push(Memory({
            creator: msg.sender,
            content: _content,
            timestamp: block.timestamp
        }));
    }

    // 4. 辅助功能：看看花园里总共有多少条记忆了
    function getMemoryCount() public view returns (uint256) {
        return allMemories.length;
    }
}