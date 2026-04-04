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
    function userCatStage(address user, uint256 realCatId) external view returns (uint8);
    function userHasStage(address user, uint256 realCatId, uint256 stageIndex) external view returns (bool);
    function isCollectionComplete(address user, uint256 realCatId) external view returns (bool);
    /// @dev 随机 mint 用户未持有的 stage NFT，返回 false 表示已集齐
    function mintCloudAdoption(address _to, uint256 _realCatId) external returns (bool minted);
}

// ============================================================
//  DonationVault v2
//
//  流程：
//    1. 用户调用 donate(catId) 并附带 AVAX
//    2. AVAX 直接转给机构钱包
//    3. 记录累计捐款额
//    4. 每达到一个阈值，随机 mint 一张用户尚未持有的成长 NFT
//    5. 若已全部集齐，告知用户收集完毕（事件 CollectionComplete）
//
//  捐款限制：
//    - Available / CloudAdopted / PendingAdoption 状态可捐款
//    - Adopted / Closed 状态不接受捐款
// ============================================================

contract DonationVault is Ownable, ReentrancyGuard {

    uint8 public constant MAX_STAGE = 3;

    uint256 public stageThreshold = 0.1 ether;

    ICatRegistry public catRegistry;
    ICatNFT      public catNFT;

    mapping(address => bool) public admins;

    /// @dev user => catId => 累计捐款总额
    mapping(address => mapping(uint256 => uint256)) public userCatDonation;

    /// @dev user => catId => 已触发 mint 的次数（每次达到阈值 mint 一次）
    mapping(address => mapping(uint256 => uint8)) public donationMintCount;

    event AdminUpdated(address indexed admin, bool status);
    event Donated(address indexed donor, uint256 indexed realCatId, uint256 amount, address indexed shelter, uint256 newTotal);
    event CloudAdoptionTriggered(address indexed donor, uint256 indexed realCatId, uint8 mintCount);
    event CollectionComplete(address indexed donor, uint256 indexed realCatId);
    event StageThresholdUpdated(uint256 newThreshold);
    event ContractsUpdated(address catRegistry, address catNFT);

    modifier onlyOwnerOrAdmin() {
        require(msg.sender == owner() || admins[msg.sender], "DonationVault: not authorized");
        _;
    }

    constructor(address _catRegistry, address _catNFT) Ownable(msg.sender) {
        require(_catRegistry != address(0) && _catNFT != address(0), "DonationVault: zero address");
        catRegistry = ICatRegistry(_catRegistry);
        catNFT      = ICatNFT(_catNFT);
    }

    function setAdmin(address _admin, bool _status) external onlyOwner {
        admins[_admin] = _status;
        emit AdminUpdated(_admin, _status);
    }

    function setStageThreshold(uint256 _threshold) external onlyOwnerOrAdmin {
        require(_threshold > 0, "DonationVault: threshold must be > 0");
        stageThreshold = _threshold;
        emit StageThresholdUpdated(_threshold);
    }

    function setContracts(address _catRegistry, address _catNFT) external onlyOwnerOrAdmin {
        require(_catRegistry != address(0) && _catNFT != address(0), "DonationVault: zero address");
        catRegistry = ICatRegistry(_catRegistry);
        catNFT      = ICatNFT(_catNFT);
        emit ContractsUpdated(_catRegistry, _catNFT);
    }

    /// @notice 向指定猫咪捐款
    function donate(uint256 _realCatId) external payable nonReentrant {
        require(msg.value > 0, "DonationVault: donation must be > 0");

        ICatRegistry.Cat memory cat = catRegistry.getCat(_realCatId);
        require(cat.shelter != address(0), "DonationVault: cat does not exist");
        require(catRegistry.isShelterApproved(cat.shelter), "DonationVault: shelter not approved");

        // Adopted 和 Closed 不接受捐款
        require(
            cat.status == ICatRegistry.CatStatus.Available   ||
            cat.status == ICatRegistry.CatStatus.CloudAdopted ||
            cat.status == ICatRegistry.CatStatus.PendingAdoption,
            "DonationVault: cat not available for donation"
        );

        userCatDonation[msg.sender][_realCatId] += msg.value;

        (bool sent, ) = cat.shelter.call{value: msg.value}("");
        require(sent, "DonationVault: transfer to shelter failed");

        emit Donated(msg.sender, _realCatId, msg.value, cat.shelter, userCatDonation[msg.sender][_realCatId]);

        _checkAndMint(msg.sender, _realCatId, cat.status);
    }

    function _checkAndMint(
        address _donor,
        uint256 _realCatId,
        ICatRegistry.CatStatus currentCatStatus
    ) internal {
        uint256 totalDonated = userCatDonation[_donor][_realCatId];

        // 计算本次累计捐款应触发几次 mint
        uint256 targetMintCount = totalDonated / stageThreshold;
        if (targetMintCount == 0) return;

        uint8 already = donationMintCount[_donor][_realCatId];
        if (already >= MAX_STAGE) {
            // 已全部触发过，检查是否已集齐
            if (catNFT.isCollectionComplete(_donor, _realCatId)) {
                emit CollectionComplete(_donor, _realCatId);
            }
            return;
        }

        bool firstMint = (already == 0);

        while (already < targetMintCount && already < MAX_STAGE) {
            bool minted = catNFT.mintCloudAdoption(_donor, _realCatId);
            if (!minted) {
                // 已全部集齐
                emit CollectionComplete(_donor, _realCatId);
                break;
            }
            already++;
            emit CloudAdoptionTriggered(_donor, _realCatId, already);
        }

        donationMintCount[_donor][_realCatId] = already;

        // 首次触发且猫咪为 Available → 更新为 CloudAdopted
        if (firstMint && currentCatStatus == ICatRegistry.CatStatus.Available) {
            catRegistry.updateCatStatusByContract(_realCatId, ICatRegistry.CatStatus.CloudAdopted);
        }
    }

    /// @notice 查询距下一次 mint 还差多少捐款
    function remainingToNextMint(address _donor, uint256 _realCatId) external view returns (uint256) {
        uint8 already = donationMintCount[_donor][_realCatId];
        if (already >= MAX_STAGE) return 0;
        if (catNFT.isCollectionComplete(_donor, _realCatId)) return 0;

        uint256 nextThreshold = stageThreshold * (uint256(already) + 1);
        uint256 total = userCatDonation[_donor][_realCatId];
        if (total >= nextThreshold) return 0;
        return nextThreshold - total;
    }
}
