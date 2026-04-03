// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IoTIdentityAuth
 * @dev 基于区块链的物联网设备身份与权限管理合约
 * 核心功能：设备注册、基于角色的访问控制(ACL)、不可篡改的访问审计日志
 */
contract IoTIdentityAuth {

    // 1. 状态变量与数据结构 (State Variables)

    address public admin; // 系统管理员

    // 设备信息结构体
    struct Device {
        string name;       // 设备别名
        bool isRegistered; // 设备是否已注册
        bool isActive;     // 设备是否处于激活/可用状态
    }

    // 模块一：设备注册表。将设备的以太坊公钥地址映射到设备具体信息
    mapping(address => Device) public devices;

    // 模块二：访问控制列表 (ACL - Access Control List)
    // 逻辑：User Address -> Device Address -> Has Access (true/false)
    // 只有映射结果为 true，该用户才有权访问该设备
    mapping(address => mapping(address => bool)) public acl;

    // ==========================================
    // 2. 审计日志 (Events - 相当于去中心化台账)
    // ==========================================
    // 这些事件会被永久刻在区块链上，用于事后溯源，前端 Web 也可以监听这些事件来刷新界面

    event DeviceRegistered(address indexed deviceAddress, string name);
    event DeviceStatusChanged(address indexed deviceAddress, bool isActive);
    event AccessGranted(address indexed user, address indexed device);
    event AccessRevoked(address indexed user, address indexed device);
    
    // ==========================================
    // 3. 权限修饰符 (Modifiers)
    // ==========================================

    // 仅限管理员操作的拦截器
    modifier onlyAdmin() {
        require(msg.sender == admin, "Access Denied: You are not the admin!");
        _; // 继续执行被修饰的函数
    }

    // ==========================================
    // 4. 核心业务逻辑 (Functions)
    // ==========================================

    /**
     * @dev 构造函数，在合约部署到 Sepolia 网络的那一刻执行一次
     */
    constructor() {
        // 将部署合约的人（你的 MetaMask 钱包地址）设置为最高管理员
        admin = msg.sender; 
    }

    /**
     * @dev 注册新设备 (仅限管理员)
     * @param _device 设备的公钥地址 (由 Python 端生成)
     * @param _name 设备的别名
     */
    function registerDevice(address _device, string memory _name) public onlyAdmin {
        require(!devices[_device].isRegistered, "Error: Device already registered!");
        
        devices[_device] = Device({
            name: _name,
            isRegistered: true,
            isActive: true
        });

        emit DeviceRegistered(_device, _name); // 记录台账
    }

    /**
     * @dev 更改设备状态（例如发现摄像头被黑客物理劫持，紧急禁用）
     */
    function setDeviceStatus(address _device, bool _isActive) public onlyAdmin {
        require(devices[_device].isRegistered, "Error: Device not found!");
        devices[_device].isActive = _isActive;
        
        emit DeviceStatusChanged(_device, _isActive);
    }

    /**
     * @dev 授予用户对特定设备的访问权限 (仅限管理员)
     * @param _user 用户的钱包地址
     * @param _device 设备的钱包地址
     */
    function grantAccess(address _user, address _device) public onlyAdmin {
        require(devices[_device].isRegistered, "Error: Target device is not registered!");
        
        acl[_user][_device] = true; // 核心授权动作
        
        emit AccessGranted(_user, _device); // 记录台账
    }

    /**
     * @dev 撤销用户的访问权限 (仅限管理员)
     */
    function revokeAccess(address _user, address _device) public onlyAdmin {
        acl[_user][_device] = false;
        
        emit AccessRevoked(_user, _device);
    }

    /**
     * @dev 验证访问权限 (核心查询接口)
     * @notice 注意：这个函数由 Python 模拟设备在链下验签成功后调用。
     * 因为加上了 `view` 关键字，调用它不消耗任何 Gas 费。
     * @return bool 返回该用户是否有权访问该设备
     */
    function checkAccess(address _user, address _device) public view returns (bool) {
        // 遵循最小权限原则：设备必须存在且激活，且用户在白名单中，才返回 true
        if (!devices[_device].isRegistered || !devices[_device].isActive) {
            return false;
        }
        return acl[_user][_device];
    }
}