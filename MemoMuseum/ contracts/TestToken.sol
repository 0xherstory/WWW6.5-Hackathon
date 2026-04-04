// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// 这是一个简易的 ERC20 测试代币合约
contract MyTestToken is ERC20 {
    constructor() ERC20("MyTestToken", "MTK") {
        // 初始铸造 100 万个代币到部署者的钱包 
        // 10**18 表示代币有 18 位小数 
        _mint(msg.sender, 1000000 * 10**18); 
    }
}