// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title HerTime Token (HRT)
/// @notice 1 HRT = 1 小时服务，服务完成后 mint 给提供方，同时 burn 需求方等量 token
contract HerTimeToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    uint256 public constant WELCOME_AMOUNT = 2 * 1e18; // 新成员赠送 2 HRT

    // 记录成员最后一次 token 流动时间（用于防囤积衰减，当前仅记录，衰减逻辑后续迭代）
    mapping(address => uint256) public lastActiveAt;

    // 防止重复注册
    mapping(address => bool) public registered;

    event WelcomeMint(address indexed member, uint256 amount);
    event ServiceMint(address indexed provider, uint256 amount, bytes32 indexed serviceId);
    event ServiceBurn(address indexed requester, uint256 amount, bytes32 indexed serviceId);

    constructor() ERC20("HerTime Token", "HRT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /// @notice 新成员注册，赠送 2 HRT 启动资金，每个地址只能调用一次
    function welcomeMint(address _member) external onlyRole(MINTER_ROLE) {
        require(!registered[_member], "Already registered");
        registered[_member] = true;
        _mint(_member, WELCOME_AMOUNT);
        lastActiveAt[_member] = block.timestamp;
        emit WelcomeMint(_member, WELCOME_AMOUNT);
    }

    /// @notice 服务完成：mint 给服务提供方
    /// @param _tenthHours 时长（单位：0.1小时，如 5 = 0.5h，15 = 1.5h）
    function mintForService(
        address _provider,
        uint256 _tenthHours,
        bytes32 _serviceId
    ) external onlyRole(MINTER_ROLE) {
        uint256 amount = _tenthHours * 1e17; // 0.1 HRT per tenth-hour
        _mint(_provider, amount);
        lastActiveAt[_provider] = block.timestamp;
        emit ServiceMint(_provider, amount, _serviceId);
    }

    /// @notice 服务完成：burn 需求方 token
    /// @param _tenthHours 时长（单位：0.1小时）
    function burnForService(
        address _requester,
        uint256 _tenthHours,
        bytes32 _serviceId
    ) external onlyRole(BURNER_ROLE) {
        uint256 amount = _tenthHours * 1e17;
        require(balanceOf(_requester) >= amount, "Insufficient HRT balance");
        _burn(_requester, amount);
        lastActiveAt[_requester] = block.timestamp;
        emit ServiceBurn(_requester, amount, _serviceId);
    }
}
