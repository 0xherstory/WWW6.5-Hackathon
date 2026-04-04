// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// ============================================================
//  接口定义
// ============================================================

interface ICatRegistry {
    enum CatStatus { Available, CloudAdopted, PendingAdoption, Adopted, Closed }

    struct Cat {
        uint256 id;
        string name;
        uint8 age;
        string gender;
        string description;
        string[4] stageURIs;
        address shelter;
        CatStatus status;
    }

    function getCat(uint256 _catId) external view returns (Cat memory);
    function isShelterApproved(address _shelter) external view returns (bool);
    function updateCatStatusByContract(uint256 _catId, CatStatus _status) external;
}

interface ICatNFT {
    function mintGenesis(address _to, uint256 _realCatId) external;
}

// ============================================================
//  AdoptionVault — 真实领养保证金 + 机构保证金管理
//
//  真实领养流程：
//    1. 用户调用 applyAdoption(catId)，猫状态变为 PendingAdoption
//    2. 机构调用 approveApplication(catId) 或 rejectApplication(catId)
//    3. 用户调用 payDeposit(catId) 缴纳保证金，锁入合约
//    4. 一年后 owner 调用 confirmVisit(catId, passed)
//       - 通过 → 归还保证金 + mint Genesis NFT，猫状态变为 Adopted
//       - 不通过 → 保证金转给机构，猫状态变为 Available
//    5. 用户可在缴款后调用 cancelAdoption(catId) 发起取消
//    6. 机构调用 confirmReturn(catId, healthy) 确认归还
//       - 健康 → 全额退还保证金，猫状态变为 Available
//       - 不健康 → 保证金转给机构，猫状态变为 Available
//    7. 机构超过 returnConfirmPeriod 不确认，用户可调用 forceWithdraw(catId)
//
//  机构保证金流程：
//    1. 机构审批通过后调用 payShelterDeposit() 缴纳，锁入合约
//    2. 一年后 owner 调用 confirmShelterDeposit(shelter, passed)
//       - 通过 → 归还保证金给机构
//       - 不通过 → 保证金转给平台（owner）
//    3. 机构每年需重新缴纳，上一笔结清后才能缴新的
//
//  ⚠️  部署后必须执行的配置：
//       catRegistry.setAuthorizedContract(adoptionVault.address, true)
//       catNFT.setAuthorizedMinter(adoptionVault.address, true)
// ============================================================

contract AdoptionVault is Ownable, ReentrancyGuard {

    // ========== 枚举 ==========

    enum ApplicationStatus {
        Applied,        // 已申请，待机构审批
        Approved,       // 机构审批通过，待用户缴款
        DepositPaid,    // 已缴款，待一年回访
        PendingReturn,  // 用户发起取消，待机构确认归还
        Completed,      // 回访通过，已归还保证金 + mint Genesis
        Failed,         // 回访不通过，保证金没收，猫归还机构
        Cancelled       // 已取消，保证金已处理
    }

    // ========== 数据结构 ==========

    struct AdoptionApplication {
        address applicant;
        uint256 catId;
        uint256 depositAmount;      // 实际缴纳金额（wei）
        uint256 depositTimestamp;   // 缴款时间戳
        uint256 cancelTimestamp;    // 发起取消时间戳
        ApplicationStatus status;
    }

    struct ShelterDeposit {
        uint256 amount;             // 实际缴纳金额（wei）
        uint256 depositTimestamp;   // 缴款时间戳
        bool active;                // 是否有未结清的保证金
    }

    // ========== 外部合约 ==========

    ICatRegistry public catRegistry;
    ICatNFT public catNFT;

    mapping(address => bool) public admins;
    event AdminUpdated(address indexed admin, bool status);

    modifier onlyOwnerOrAdmin() {
        require(msg.sender == owner() || admins[msg.sender], "AdoptionVault: not authorized");
        _;
    }

    function setAdmin(address _admin, bool _status) external onlyOwner {
        require(_admin != address(0), "AdoptionVault: zero address");
        admins[_admin] = _status;
        emit AdminUpdated(_admin, _status);
    }

    // ========== 配置参数（owner 可调整）==========

    /// @notice 领养保证金金额，默认 0.1 AVAX
    uint256 public adoptionDepositAmount = 0.1 ether;

    /// @notice 机构保证金金额，默认 1 AVAX
    uint256 public shelterDepositAmount = 1 ether;

    /// @notice 保证金锁定期，默认一年
    uint256 public lockPeriod = 365 days;

    /// @notice 机构确认归还的超时期限，默认30天
    uint256 public returnConfirmPeriod = 30 days;

    // ========== 状态变量 ==========

    /// @dev catId => 当前领养申请
    /// @notice 一只猫同时只能有一个申请
    mapping(uint256 => AdoptionApplication) public applications;

    /// @dev shelter => 机构保证金记录
    mapping(address => ShelterDeposit) public shelterDeposits;

    // ========== 事件 ==========

    // 领养相关
    event AdoptionApplied(uint256 indexed catId, address indexed applicant);
    event AdoptionApproved(uint256 indexed catId, address indexed shelter);
    event AdoptionRejected(uint256 indexed catId, address indexed shelter);
    event DepositPaid(uint256 indexed catId, address indexed applicant, uint256 amount);
    event AdoptionCompleted(uint256 indexed catId, address indexed applicant);
    event AdoptionFailed(uint256 indexed catId, address indexed applicant, uint256 penaltyToShelter);
    event AdoptionCancelRequested(uint256 indexed catId, address indexed applicant);
    event ReturnConfirmed(uint256 indexed catId, bool healthy, uint256 refundAmount);
    event ForceWithdrawn(uint256 indexed catId, address indexed applicant, uint256 amount);

    // 机构保证金相关
    event ShelterDepositPaid(address indexed shelter, uint256 amount);
    event ShelterDepositReturned(address indexed shelter, uint256 amount);
    event ShelterDepositConfiscated(address indexed shelter, uint256 amount);

    // 参数调整
    event AdoptionDepositAmountUpdated(uint256 newAmount);
    event ShelterDepositAmountUpdated(uint256 newAmount);
    event LockPeriodUpdated(uint256 newPeriod);
    event ReturnConfirmPeriodUpdated(uint256 newPeriod);

    // ========== 构造函数 ==========

    constructor(address _catRegistry, address _catNFT) Ownable(msg.sender) {
        require(_catRegistry != address(0), "AdoptionVault: zero address");
        require(_catNFT != address(0), "AdoptionVault: zero address");
        catRegistry = ICatRegistry(_catRegistry);
        catNFT = ICatNFT(_catNFT);
    }

    // ========== Owner 管理 ==========

    function setAdoptionDepositAmount(uint256 _amount) external onlyOwnerOrAdmin {
        require(_amount > 0, "AdoptionVault: amount must be > 0");
        adoptionDepositAmount = _amount;
        emit AdoptionDepositAmountUpdated(_amount);
    }

    function setShelterDepositAmount(uint256 _amount) external onlyOwnerOrAdmin {
        require(_amount > 0, "AdoptionVault: amount must be > 0");
        shelterDepositAmount = _amount;
        emit ShelterDepositAmountUpdated(_amount);
    }

    function setLockPeriod(uint256 _period) external onlyOwnerOrAdmin {
        require(_period > 0, "AdoptionVault: period must be > 0");
        lockPeriod = _period;
        emit LockPeriodUpdated(_period);
    }

    function setReturnConfirmPeriod(uint256 _period) external onlyOwnerOrAdmin {
        require(_period > 0, "AdoptionVault: period must be > 0");
        returnConfirmPeriod = _period;
        emit ReturnConfirmPeriodUpdated(_period);
    }

    function setContracts(address _catRegistry, address _catNFT) external onlyOwnerOrAdmin {
        require(_catRegistry != address(0), "AdoptionVault: zero address");
        require(_catNFT != address(0), "AdoptionVault: zero address");
        catRegistry = ICatRegistry(_catRegistry);
        catNFT = ICatNFT(_catNFT);
    }

    // ========== 用户操作 ==========

    /// @notice 提交领养申请，猫状态变为 PendingAdoption
    /// @param _catId CatRegistry 中的真实猫咪 ID
    function applyAdoption(uint256 _catId) external {
        ICatRegistry.Cat memory cat = catRegistry.getCat(_catId);
        require(cat.shelter != address(0), "AdoptionVault: cat does not exist");
        require(catRegistry.isShelterApproved(cat.shelter), "AdoptionVault: shelter not approved");
        require(
            cat.status == ICatRegistry.CatStatus.Available ||
            cat.status == ICatRegistry.CatStatus.CloudAdopted,
            "AdoptionVault: cat not available for adoption"
        );

        // 一只猫同时只能有一个申请
        ApplicationStatus currentStatus = applications[_catId].status;
        require(
            applications[_catId].applicant == address(0) ||
            currentStatus == ApplicationStatus.Completed ||
            currentStatus == ApplicationStatus.Failed ||
            currentStatus == ApplicationStatus.Cancelled,
            "AdoptionVault: application already exists"
        );

        applications[_catId] = AdoptionApplication({
            applicant: msg.sender,
            catId: _catId,
            depositAmount: 0,
            depositTimestamp: 0,
            cancelTimestamp: 0,
            status: ApplicationStatus.Applied
        });

        catRegistry.updateCatStatusByContract(_catId, ICatRegistry.CatStatus.PendingAdoption);

        emit AdoptionApplied(_catId, msg.sender);
    }

    /// @notice 机构审批通过后，用户缴纳保证金
    /// @dev 必须精确发送 adoptionDepositAmount，多退少不补
    function payDeposit(uint256 _catId) external payable nonReentrant {
        AdoptionApplication storage app = applications[_catId];
        require(app.applicant == msg.sender, "AdoptionVault: not the applicant");
        require(app.status == ApplicationStatus.Approved, "AdoptionVault: not approved yet");
        require(msg.value == adoptionDepositAmount, "AdoptionVault: incorrect deposit amount");

        app.depositAmount = msg.value;
        app.depositTimestamp = block.timestamp;
        app.status = ApplicationStatus.DepositPaid;

        emit DepositPaid(_catId, msg.sender, msg.value);
    }

    /// @notice 用户发起取消领养，进入待机构确认归还状态
    function cancelAdoption(uint256 _catId) external {
        AdoptionApplication storage app = applications[_catId];
        require(app.applicant == msg.sender, "AdoptionVault: not the applicant");
        require(app.status == ApplicationStatus.DepositPaid, "AdoptionVault: cannot cancel at this stage");

        app.status = ApplicationStatus.PendingReturn;
        app.cancelTimestamp = block.timestamp;

        emit AdoptionCancelRequested(_catId, msg.sender);
    }

    /// @notice 机构超过 returnConfirmPeriod 未确认，用户强制取回保证金
    function forceWithdraw(uint256 _catId) external nonReentrant {
        AdoptionApplication storage app = applications[_catId];
        require(app.applicant == msg.sender, "AdoptionVault: not the applicant");
        require(app.status == ApplicationStatus.PendingReturn, "AdoptionVault: not in pending return");
        require(
            block.timestamp >= app.cancelTimestamp + returnConfirmPeriod,
            "AdoptionVault: return confirm period not elapsed"
        );

        uint256 refund = app.depositAmount;
        app.status = ApplicationStatus.Cancelled;
        app.depositAmount = 0;

        catRegistry.updateCatStatusByContract(_catId, ICatRegistry.CatStatus.Available);

        (bool sent, ) = msg.sender.call{value: refund}("");
        require(sent, "AdoptionVault: refund failed");

        emit ForceWithdrawn(_catId, msg.sender, refund);
    }

    // ========== 机构操作 ==========

    /// @notice 机构审批通过领养申请
    function approveApplication(uint256 _catId) external {
        ICatRegistry.Cat memory cat = catRegistry.getCat(_catId);
        require(cat.shelter == msg.sender, "AdoptionVault: not the shelter");
        require(catRegistry.isShelterApproved(msg.sender), "AdoptionVault: shelter not approved");

        AdoptionApplication storage app = applications[_catId];
        require(app.status == ApplicationStatus.Applied, "AdoptionVault: not in applied status");

        app.status = ApplicationStatus.Approved;

        emit AdoptionApproved(_catId, msg.sender);
    }

    /// @notice 机构拒绝领养申请，猫状态回到 Available
    function rejectApplication(uint256 _catId) external {
        ICatRegistry.Cat memory cat = catRegistry.getCat(_catId);
        require(cat.shelter == msg.sender, "AdoptionVault: not the shelter");
        require(catRegistry.isShelterApproved(msg.sender), "AdoptionVault: shelter not approved");

        AdoptionApplication storage app = applications[_catId];
        require(app.status == ApplicationStatus.Applied, "AdoptionVault: not in applied status");

        app.status = ApplicationStatus.Cancelled;

        catRegistry.updateCatStatusByContract(_catId, ICatRegistry.CatStatus.Available);

        emit AdoptionRejected(_catId, msg.sender);
    }

    /// @notice 机构确认用户归还猫咪
    /// @param _catId 猫咪 ID
    /// @param _healthy 猫咪是否健康归还
    function confirmReturn(uint256 _catId, bool _healthy) external nonReentrant {
        ICatRegistry.Cat memory cat = catRegistry.getCat(_catId);
        require(cat.shelter == msg.sender, "AdoptionVault: not the shelter");

        AdoptionApplication storage app = applications[_catId];
        require(app.status == ApplicationStatus.PendingReturn, "AdoptionVault: not in pending return");

        uint256 refund = app.depositAmount;
        app.depositAmount = 0;
        app.status = ApplicationStatus.Cancelled;

        catRegistry.updateCatStatusByContract(_catId, ICatRegistry.CatStatus.Available);

        if (_healthy) {
            // 健康归还，全额退还给用户
            (bool sent, ) = app.applicant.call{value: refund}("");
            require(sent, "AdoptionVault: refund failed");
            emit ReturnConfirmed(_catId, true, refund);
        } else {
            // 不健康，保证金转给机构
            (bool sent, ) = cat.shelter.call{value: refund}("");
            require(sent, "AdoptionVault: transfer to shelter failed");
            emit ReturnConfirmed(_catId, false, 0);
        }
    }

    /// @notice 机构缴纳保证金，需先结清上一笔
    function payShelterDeposit() external payable nonReentrant {
        require(catRegistry.isShelterApproved(msg.sender), "AdoptionVault: shelter not approved");
        require(!shelterDeposits[msg.sender].active, "AdoptionVault: previous deposit not settled");
        require(msg.value == shelterDepositAmount, "AdoptionVault: incorrect deposit amount");

        shelterDeposits[msg.sender] = ShelterDeposit({
            amount: msg.value,
            depositTimestamp: block.timestamp,
            active: true
        });

        emit ShelterDepositPaid(msg.sender, msg.value);
    }

    // ========== Owner 操作 ==========

    /// @notice 回访确认，通过则归还保证金 + mint Genesis NFT，不通过则没收
    function confirmVisit(uint256 _catId, bool _passed) external onlyOwnerOrAdmin nonReentrant {
        AdoptionApplication storage app = applications[_catId];
        require(app.status == ApplicationStatus.DepositPaid, "AdoptionVault: not in deposit paid status");
        require(
            block.timestamp >= app.depositTimestamp + lockPeriod,
            "AdoptionVault: lock period not elapsed"
        );

        ICatRegistry.Cat memory cat = catRegistry.getCat(_catId);
        uint256 deposit = app.depositAmount;
        app.depositAmount = 0;

        if (_passed) {
            app.status = ApplicationStatus.Completed;
            catRegistry.updateCatStatusByContract(_catId, ICatRegistry.CatStatus.Adopted);
            catNFT.mintGenesis(app.applicant, _catId);

            (bool sent, ) = app.applicant.call{value: deposit}("");
            require(sent, "AdoptionVault: refund failed");

            emit AdoptionCompleted(_catId, app.applicant);
        } else {
            app.status = ApplicationStatus.Failed;
            catRegistry.updateCatStatusByContract(_catId, ICatRegistry.CatStatus.Available);

            (bool sent, ) = cat.shelter.call{value: deposit}("");
            require(sent, "AdoptionVault: transfer to shelter failed");

            emit AdoptionFailed(_catId, app.applicant, deposit);
        }
    }

    /// @notice 机构保证金回访确认
    function confirmShelterDeposit(address _shelter, bool _passed) external onlyOwnerOrAdmin nonReentrant {
        ShelterDeposit storage sd = shelterDeposits[_shelter];
        require(sd.active, "AdoptionVault: no active deposit");
        require(
            block.timestamp >= sd.depositTimestamp + lockPeriod,
            "AdoptionVault: lock period not elapsed"
        );

        uint256 amount = sd.amount;
        sd.amount = 0;
        sd.active = false;

        if (_passed) {
            (bool sent, ) = _shelter.call{value: amount}("");
            require(sent, "AdoptionVault: refund failed");
            emit ShelterDepositReturned(_shelter, amount);
        } else {
            (bool sent, ) = owner().call{value: amount}("");
            require(sent, "AdoptionVault: transfer to owner failed");
            emit ShelterDepositConfiscated(_shelter, amount);
        }
    }

    // ========== 查询 ==========

    /// @notice 查询某只猫的当前申请信息
    function getApplication(uint256 _catId) external view returns (AdoptionApplication memory) {
        return applications[_catId];
    }

    /// @notice 查询机构保证金信息
    function getShelterDeposit(address _shelter) external view returns (ShelterDeposit memory) {
        return shelterDeposits[_shelter];
    }

    /// @notice 查询领养保证金距离可回访还剩多少秒，0 表示已可回访
    function remainingLockTime(uint256 _catId) external view returns (uint256) {
        AdoptionApplication memory app = applications[_catId];
        if (app.status != ApplicationStatus.DepositPaid) return 0;
        uint256 unlockTime = app.depositTimestamp + lockPeriod;
        if (block.timestamp >= unlockTime) return 0;
        return unlockTime - block.timestamp;
    }

    /// @notice 查询机构保证金距离可回访还剩多少秒，0 表示已可回访
    function remainingShelterLockTime(address _shelter) external view returns (uint256) {
        ShelterDeposit memory sd = shelterDeposits[_shelter];
        if (!sd.active) return 0;
        uint256 unlockTime = sd.depositTimestamp + lockPeriod;
        if (block.timestamp >= unlockTime) return 0;
        return unlockTime - block.timestamp;
    }
}
