 SPDX-License-Identifier MIT
pragma solidity ^0.8.20;

import @openzeppelincontractsaccessAccessControl.sol;
import @openzeppelincontractstokenERC20IERC20.sol;
import .UserManagement.sol;
import .RiskManagement.sol;

contract DataSharingAndRewards is AccessControl {
    bytes32 public constant DAO_ROLE = keccak256(DAO_ROLE);
    IERC20 public rewardToken;

    UserManagement userManagement;
    RiskManagement riskManagement;

    mapping(address = uint256) public userRewards;

    event DataShared(address indexed user, uint256 reward);
    event RewardDistributed(address indexed user, uint256 amount);

    constructor(address admin, address _userManagement, address _riskManagement, address _rewardToken) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(DAO_ROLE, admin);
        userManagement = UserManagement(_userManagement);
        riskManagement = RiskManagement(_riskManagement);
        rewardToken = IERC20(_rewardToken);
    }

    function shareData(address _user) external {
        require(userManagement.registeredUsers(_user), User not registered);
        uint256 reward = 1e18;  1 TOKEN reward for sharing data

        userRewards[_user] += reward;

        emit DataShared(_user, reward);
    }

    function distributeReward(address _user) external {
        uint256 reward = userRewards[_user];
        require(reward  0, No reward available);

        rewardToken.transfer(_user, reward);
        userRewards[_user] = 0;

        emit RewardDistributed(_user, reward);
    }
}