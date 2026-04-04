// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

interface IHerTimeToken {
    function welcomeMint(address member) external;
    function mintForService(address provider, uint256 numHours, bytes32 serviceId) external;
    function burnForService(address requester, uint256 numHours, bytes32 serviceId) external;
    function registered(address member) external view returns (bool);
}

interface IHerTimeReputation {
    function unlockRating(bytes32 serviceId, address requester, address provider, uint8 tag) external;
}

/// @title HerTime Service
/// @notice 服务发布、接单、双方确认完成，触发 token 流转与评分解锁
contract HerTimeService is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    address public deployer;
    mapping(address => bool) public isInvited; // 已被邀请可注册

    enum ServiceStatus { OPEN, MATCHED, COMPLETED, CANCELLED }

    enum ServiceTag {
        LIFE_SUPPORT,      // 0 - 生活支持（陪伴就医、育儿、接送等）
        EMOTIONAL_SUPPORT, // 1 - 情感支持（倾听、情绪疏导）
        SKILL_SHARING,     // 2 - 技能技术（翻译、法律、职场辅导）
        KNOWLEDGE,         // 3 - 知识教学（编程、设计、语言）
        CREATIVE           // 4 - 创意协作（摄影、文案、设计）
    }

    struct Service {
        bytes32 id;
        address requester;       // 对外展示：匿名时为 address(0)
        address actualRequester; // 内部存储：用于 token burn 和确认操作
        address provider;
        ServiceTag tag;
        uint256 numHours;
        ServiceStatus status;
        bool requesterConfirmed;
        bool providerConfirmed;
        uint256 createdAt;
    }

    mapping(bytes32 => Service) public services;
    bytes32[] public allServiceIds;

    IHerTimeToken public token;
    IHerTimeReputation public reputation;

    event MemberRegistered(address indexed member);
    event MemberInvited(address indexed inviter, address indexed invitee);
    event ServicePosted(bytes32 indexed id, ServiceTag tag, uint256 numHours, bool isAnonymous);
    event ServiceMatched(bytes32 indexed id, address indexed provider);
    event ServiceCompleted(bytes32 indexed id);
    event ServiceCancelled(bytes32 indexed id);

    constructor(address _token, address _reputation) {
        token = IHerTimeToken(_token);
        reputation = IHerTimeReputation(_reputation);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        deployer = msg.sender;
        isInvited[msg.sender] = true; // 部署者自动获得邀请资格
    }

    /// @notice 已注册成员邀请新成员
    function invite(address member) external {
        require(token.registered(msg.sender), "Only members can invite");
        require(!token.registered(member), "Already registered");
        isInvited[member] = true;
        emit MemberInvited(msg.sender, member);
    }

    /// @notice 管理员批量邀请
    function inviteBatch(address[] calldata members) external onlyRole(ADMIN_ROLE) {
        for (uint i = 0; i < members.length; i++) {
            isInvited[members[i]] = true;
            emit MemberInvited(msg.sender, members[i]);
        }
    }

    /// @notice 新成员注册，需持有邀请资格，调用 Token 合约发放 2 HRT 启动资金
    function register() external {
        require(!token.registered(msg.sender), "Already registered");
        require(isInvited[msg.sender], "Invitation required");
        token.welcomeMint(msg.sender);
        emit MemberRegistered(msg.sender);
    }

    /// @notice 发布服务需求
    /// @param _tag 服务类型
    /// @param _hours 预计时长（单位：0.1小时，如 5=0.5h，10=1h，240=24h）
    /// @param _anonymous 是否匿名（true 则对外隐藏发布者地址）
    function postService(
        ServiceTag _tag,
        uint256 _hours,
        bool _anonymous
    ) external returns (bytes32) {
        require(_hours > 0 && _hours <= 240, "Hours must be 0.1-24");

        bytes32 id = keccak256(abi.encodePacked(msg.sender, block.timestamp, _tag, allServiceIds.length));

        address displayRequester = _anonymous ? address(0) : msg.sender;

        services[id] = Service({
            id: id,
            requester: displayRequester,
            actualRequester: msg.sender,
            provider: address(0),
            tag: _tag,
            numHours: _hours,
            status: ServiceStatus.OPEN,
            requesterConfirmed: false,
            providerConfirmed: false,
            createdAt: block.timestamp
        });

        allServiceIds.push(id);
        emit ServicePosted(id, _tag, _hours, _anonymous); // _anonymous is a local param, ok
        return id;
    }

    /// @notice 接单
    function acceptService(bytes32 _id) external {
        Service storage s = services[_id];
        require(s.status == ServiceStatus.OPEN, "Service not open");
        require(msg.sender != s.actualRequester, "Cannot serve yourself");

        s.provider = msg.sender;
        s.status = ServiceStatus.MATCHED;
        emit ServiceMatched(_id, msg.sender);
    }

    /// @notice 发起人调整实际服务时长（仅发起人未确认前可调）
    function adjustHours(bytes32 _id, uint256 _newHours) external {
        Service storage s = services[_id];
        require(s.status == ServiceStatus.MATCHED, "Service not matched");
        require(msg.sender == s.actualRequester, "Only requester can adjust hours");
        require(!s.requesterConfirmed, "Requester has already confirmed");
        require(_newHours > 0 && _newHours <= 240, "Hours must be 0.1-24");
        s.numHours = _newHours;
    }

    /// @notice 双方分别调用确认服务完成，发起人必须先确认，双方都确认后结算
    function confirmCompletion(bytes32 _id) external {
        Service storage s = services[_id];
        require(s.status == ServiceStatus.MATCHED, "Service not matched");

        if (msg.sender == s.actualRequester) {
            require(!s.requesterConfirmed, "Already confirmed");
            s.requesterConfirmed = true;
        } else if (msg.sender == s.provider) {
            require(s.requesterConfirmed, "Requester must confirm first");
            require(!s.providerConfirmed, "Already confirmed");
            s.providerConfirmed = true;
        } else {
            revert("Not a party to this service");
        }

        // 双方都确认后结算
        if (s.requesterConfirmed && s.providerConfirmed) {
            s.status = ServiceStatus.COMPLETED;

            // token 流转：burn 需求方，mint 提供方
            token.burnForService(s.actualRequester, s.numHours, _id);
            token.mintForService(s.provider, s.numHours, _id);

            // 解锁评分，传入 display requester（保护隐私）
            reputation.unlockRating(_id, s.requester, s.provider, uint8(s.tag));

            emit ServiceCompleted(_id);
        }
    }

    /// @notice 取消未接单的服务（仅发布者可取消）
    function cancelService(bytes32 _id) external {
        Service storage s = services[_id];
        require(s.status == ServiceStatus.OPEN, "Can only cancel OPEN service");
        require(msg.sender == s.actualRequester, "Not the requester");

        s.status = ServiceStatus.CANCELLED;
        emit ServiceCancelled(_id);
    }

    /// @notice 取消进行中的服务（双方均可，发起人已确认后仅发起人可取消）
    function cancelMatched(bytes32 _id) external {
        Service storage s = services[_id];
        require(s.status == ServiceStatus.MATCHED, "Service not matched");
        require(
            msg.sender == s.actualRequester || msg.sender == s.provider,
            "Not a party to this service"
        );
        // 发起人已确认后，只允许发起人撤回（服务方不可在此时单方取消）
        if (s.requesterConfirmed) {
            require(msg.sender == s.actualRequester, "Requester confirmed, only requester can cancel");
        }
        s.status = ServiceStatus.CANCELLED;
        emit ServiceCancelled(_id);
    }

    /// @notice 获取所有服务 ID 列表
    function getAllServiceIds() external view returns (bytes32[] memory) {
        return allServiceIds;
    }

    /// @notice 获取 OPEN 状态的服务列表（前端展示用）
    function getOpenServices() external view returns (bytes32[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < allServiceIds.length; i++) {
            if (services[allServiceIds[i]].status == ServiceStatus.OPEN) count++;
        }
        bytes32[] memory result = new bytes32[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < allServiceIds.length; i++) {
            if (services[allServiceIds[i]].status == ServiceStatus.OPEN) {
                result[idx++] = allServiceIds[i];
            }
        }
        return result;
    }
}
