// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SisterhoodTreasury {
    address public votingContract;
    uint256 public totalFunds;
    mapping(address => uint256) public contributions;

    event DonationReceived(address indexed donor, uint256 amount);
    event FundsReleased(address indexed recipient, uint256 amount, string reason);

    constructor() {}

    function setVotingContract(address _votingContract) external {
        require(votingContract == address(0), "Already set");
        votingContract = _votingContract;
    }

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

    function releaseFunds(address payable recipient, uint256 amount, string calldata reason) external {
        require(msg.sender == votingContract, "Only voting contract");
        require(amount <= totalFunds, "Not enough funds");

        totalFunds -= amount;
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Transfer failed");
        emit FundsReleased(recipient, amount, reason);
    }
}
