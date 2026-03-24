// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// 作用：收钱、付钱，只允许投票合约调用付钱功能
contract SisterhoodTreasury {
    address public votingContract;   // 谁可以动用资金（后面设为投票合约地址）
    uint256 public totalFunds;       // 当前总金额

    mapping(address => uint256) public contributions;  // 每人捐了多少

    event DonationReceived(address indexed donor, uint256 amount);
    event FundsReleased(address indexed recipient, uint256 amount, string reason);

    constructor(address _votingContract) {
        votingContract = _votingContract;   // 部署时指定投票合约地址
    }

    // 接收捐款（直接转账或调用 donate 函数）
    receive() external payable {
        _recordDonation(msg.sender, msg.value);
    }

    function donate() external payable {
        _recordDonation(msg.sender, msg.value);
    }

    function _recordDonation(address donor, uint256 amount) private {
        contributions[donor] += amount;
        totalFunds += amount;
        emit DonationReceived(donor, amount);
    }

    // 只有投票合约可以调用此函数，把钱转给受益人
    function releaseFunds(address payable recipient, uint256 amount, string calldata reason) external {
        require(msg.sender == votingContract, "Only voting contract");
        require(amount <= totalFunds, "Not enough funds");

        totalFunds -= amount;
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Transfer failed");
        emit FundsReleased(recipient, amount, reason);
    }
}
