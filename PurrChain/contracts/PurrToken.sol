// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// ============================================================
//  最小化接口：只声明 PurrToken 实际需要调用的函数
// ============================================================

interface ICatNFT {
    function ownerOf(uint256 tokenId) external view returns (address);

    /// @dev NFTType 枚举值：
    ///      0=Starter, 1=CloudAdopted, 2=Genesis,
    ///      3=FamilyPortrait, 4=StarterCat, 5=Collection
    function nftType(uint256 tokenId) external view returns (uint8);

    /// @dev 销毁 Starter NFT（type=0），仅 authorizedMinter 可调用
    function burn(uint256 tokenId) external;

    /// @dev 销毁 FamilyPortrait NFT（type=3），仅 authorizedMinter 可调用
    function burnFamilyPortrait(uint256 tokenId) external;
}

interface ICatRegistry {
    function isShelterApproved(address _shelter) external view returns (bool);
}

// ============================================================
//  PurrToken ($PURR) — ERC-20 代币合约
//
//  职责：
//    1. buyTokens                  — 用户花 AVAX 购买 PURR
//    2. claimWelcomeTokens         — 持有 Starter 或 FamilyPortrait NFT 的新用户
//                                    领取 20 PURR（每地址一次，两种凭证均可）
//    3. burnStarterForTokens       — 销毁旧版 Starter NFT 换取 30 PURR
//    4. burnFamilyPortraitForTokens— 销毁全家福 NFT 换取 30 PURR
//    5. gameReward / gameSpend     — 授权游戏合约调用的 mint / burn 入口
//    6. authorizedMint             — 授权合约（DonationVault 等）的 mint 入口
//    7. distribute                 — 按预设比例分配合约内 AVAX（buyTokens 收入）
//
//  用户推荐操作顺序（最多可获 50 PURR 启动资金）：
//    ① claimFamilyPortrait（CatNFT）
//    ② claimWelcomeTokens（本合约，+20 PURR）
//    ③ claimStarterCat（GameContract）
//    ④ 游戏内消耗
//    ⑤ 可选：burnFamilyPortraitForTokens（+30 PURR，销毁后不可恢复）
//
//  ⚠️  部署后必须执行的配置：
//       catNFT.setAuthorizedMinter(purrToken.address, true)
// ============================================================

contract PurrToken is ERC20, Ownable, ReentrancyGuard {

    // ========== 常量 ==========

    uint256 public constant WELCOME_AMOUNT           = 20 * 10 ** 18; // 20 PURR
    uint256 public constant STARTER_BURN_REWARD      = 30 * 10 ** 18; // 30 PURR
    uint256 public constant FAMILY_PORTRAIT_REWARD   = 30 * 10 ** 18; // 30 PURR

    // ========== 状态变量 ==========

    ICatNFT      public catNFT;
    ICatRegistry public immutable catRegistry;

    uint256 public tokenPriceWei = 0.001 ether;

    /// @dev 已领取新手欢迎奖励的地址（按地址记录，与 NFT 转移无关）
    mapping(address => bool) public hasClaimedWelcome;

    /// @dev 授权可调用 gameReward / gameSpend 的游戏合约
    mapping(address => bool) public authorizedGameContracts;

    /// @dev 授权可调用 authorizedMint 的合约（DonationVault 等）
    mapping(address => bool) public authorizedMinters;

    /// @dev 平台管理员（可执行部分 owner 操作，由 owner 设置）
    mapping(address => bool) public admins;

    /// @dev AVAX 分配收款方列表（有序，用于 distribute 遍历）
    address[] public shareRecipients;

    /// @dev 收款方 => 分配比例（万分比）
    mapping(address => uint256) public distributionShares;

    /// @dev distribute 触发的最低 AVAX 余额门槛
    uint256 public minDistributeBalance = 0.1 ether;

    // ========== 事件 ==========

    event WelcomeTokensClaimed(address indexed player, uint256 amount);
    event StarterNFTBurned(address indexed player, uint256 indexed tokenId, uint256 tokensReceived);
    event FamilyPortraitBurned(address indexed player, uint256 indexed tokenId, uint256 tokensReceived);
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 paid);
    event TokenPriceUpdated(uint256 newPrice);
    event GameContractUpdated(address indexed gameContract, bool status);
    event MinterUpdated(address indexed minter, bool status);
    event SharesUpdated();
    event DistributionCompleted(uint256 totalDistributed, uint256 skipped);
    event CatNFTUpdated(address indexed newCatNFT);
    event AdminUpdated(address indexed admin, bool status);

    // ========== 修饰符 ==========

    modifier onlyGameContract() {
        require(authorizedGameContracts[msg.sender], "PurrToken: not an authorized game contract");
        _;
    }

    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender], "PurrToken: not an authorized minter");
        _;
    }

    modifier onlyOwnerOrAdmin() {
        require(msg.sender == owner() || admins[msg.sender], "PurrToken: not authorized");
        _;
    }

    modifier onlyOwnerOrApprovedShelter() {
        require(
            msg.sender == owner() || admins[msg.sender] || catRegistry.isShelterApproved(msg.sender),
            "PurrToken: not authorized"
        );
        _;
    }

    // ========== 构造函数 ==========

    constructor(
        address _catNFT,
        address _catRegistry
    ) ERC20("PurrToken", "PURR") Ownable(msg.sender) {
        require(_catNFT      != address(0), "PurrToken: zero address");
        require(_catRegistry != address(0), "PurrToken: zero address");
        catNFT      = ICatNFT(_catNFT);
        catRegistry = ICatRegistry(_catRegistry);
    }

    // ========== Owner 管理 ==========

    function setAdmin(address _admin, bool _status) external onlyOwner {
        require(_admin != address(0), "PurrToken: zero address");
        admins[_admin] = _status;
        emit AdminUpdated(_admin, _status);
    }

    /// @notice 更新 CatNFT 合约地址（生产环境建议改为 immutable 或多签后废弃此函数）
    function setCatNFT(address _catNFT) external onlyOwnerOrAdmin {
        require(_catNFT != address(0), "PurrToken: zero address");
        catNFT = ICatNFT(_catNFT);
        emit CatNFTUpdated(_catNFT);
    }

    function setTokenPrice(uint256 newPriceWei) external onlyOwnerOrAdmin {
        require(newPriceWei > 0, "PurrToken: price must be > 0");
        tokenPriceWei = newPriceWei;
        emit TokenPriceUpdated(newPriceWei);
    }

    function setGameContract(address _gameContract, bool status) external onlyOwnerOrAdmin {
        require(_gameContract != address(0), "PurrToken: zero address");
        authorizedGameContracts[_gameContract] = status;
        emit GameContractUpdated(_gameContract, status);
    }

    function setAuthorizedMinter(address minter, bool status) external onlyOwnerOrAdmin {
        require(minter != address(0), "PurrToken: zero address");
        authorizedMinters[minter] = status;
        emit MinterUpdated(minter, status);
    }

    function setMinDistributeBalance(uint256 _amount) external onlyOwnerOrAdmin {
        require(_amount > 0, "PurrToken: amount must be > 0");
        minDistributeBalance = _amount;
    }

    /// @notice 设置 AVAX 收益分配比例，比例总和必须恰好为 10000（万分比）
    function setShares(
        address[] calldata _recipients,
        uint256[] calldata _shares
    ) external onlyOwnerOrAdmin {
        require(_recipients.length == _shares.length, "PurrToken: length mismatch");
        require(_recipients.length > 0,               "PurrToken: no recipients");

        uint256 total = 0;
        for (uint256 i = 0; i < _shares.length; i++) {
            require(_recipients[i] != address(0), "PurrToken: zero address in recipients");
            require(_shares[i] > 0,               "PurrToken: zero share not allowed");
            total += _shares[i];
        }
        require(total == 10000, "PurrToken: shares must sum to 10000");

        // 清除旧设置
        for (uint256 i = 0; i < shareRecipients.length; i++) {
            delete distributionShares[shareRecipients[i]];
        }
        delete shareRecipients;

        // 写入新设置
        for (uint256 i = 0; i < _recipients.length; i++) {
            shareRecipients.push(_recipients[i]);
            distributionShares[_recipients[i]] = _shares[i];
        }

        emit SharesUpdated();
    }

    /// @notice 按比例将合约内 AVAX 分配给各收款方
    /// @dev 修复1：最后一个收款方获得全部剩余，消除整除截断导致的 wei 永久残留
    /// @dev 修复2：单个转账失败时跳过而非 revert 整批，防止恶意合约地址阻塞分配
    /// @dev 注意：若前面某收款方转账失败，该份额会归入最后一个收款方
    ///      owner 应定期确认收款方地址均为普通 EOA 或可接收 AVAX 的合约
    function distribute() external onlyOwnerOrApprovedShelter nonReentrant {
        uint256 total = address(this).balance;
        require(total >= minDistributeBalance, "PurrToken: balance below minimum");
        require(shareRecipients.length > 0,    "PurrToken: no recipients set");

        uint256 lastIndex = shareRecipients.length - 1;
        uint256 skipped   = 0;
        uint256 sentSum   = 0;

        // 先处理前 n-1 个收款方（按比例）
        for (uint256 i = 0; i < lastIndex; i++) {
            address recipient = shareRecipients[i];
            uint256 amount    = total * distributionShares[recipient] / 10000;
            if (amount == 0) continue;

            (bool ok, ) = recipient.call{value: amount}("");
            if (ok) {
                sentSum += amount;
            } else {
                skipped += amount;
                // 失败份额归入最后一个收款方，不单独处理
            }
        }

        // 最后一个收款方拿走全部剩余（含零头 + 前面失败的份额）
        address lastRecipient = shareRecipients[lastIndex];
        uint256 lastAmount    = total - sentSum;
        if (lastAmount > 0) {
            (bool ok, ) = lastRecipient.call{value: lastAmount}("");
            if (!ok) {
                skipped += lastAmount;
            }
        }

        emit DistributionCompleted(total - skipped, skipped);
    }

    // ========== 用户功能 ==========

    /// @notice 新用户领取 20 PURR 欢迎奖励
    /// @dev 凭证：持有 Starter NFT（type=0）或 FamilyPortrait NFT（type=3）均可
    ///      每地址限领一次，与 NFT 后续转移无关
    ///      ⚠️  必须在 burn 系列函数之前调用：NFT 销毁后 ownerOf 会 revert
    /// @param nftTokenId 用于验证身份的 NFT tokenId（不会被销毁）
    function claimWelcomeTokens(uint256 nftTokenId) external {
        require(!hasClaimedWelcome[msg.sender], "PurrToken: already claimed welcome tokens");
        require(catNFT.ownerOf(nftTokenId) == msg.sender, "PurrToken: not your NFT");

        uint8 nType = catNFT.nftType(nftTokenId);
        require(
            nType == 0 || nType == 3,
            "PurrToken: must be Starter or FamilyPortrait NFT"
        );

        hasClaimedWelcome[msg.sender] = true;
        _mint(msg.sender, WELCOME_AMOUNT);

        emit WelcomeTokensClaimed(msg.sender, WELCOME_AMOUNT);
    }

    /// @notice 销毁旧版 Starter NFT（type=0），获得 30 PURR
    /// @dev CEI 说明：catNFT.burn 是 Interaction（外部调用），_mint 是 Effect（内部）
    ///      此处先 burn 再 mint：若 burn revert 则 mint 不执行，无超发风险
    ///      catNFT.burn 不回调本合约，无重入路径，顺序安全
    ///      ⚠️  建议先调用 claimWelcomeTokens 再调用此函数，总计最多获得 50 PURR
    function burnStarterForTokens(uint256 starterTokenId) external nonReentrant {
        require(catNFT.ownerOf(starterTokenId) == msg.sender, "PurrToken: not your NFT");
        require(catNFT.nftType(starterTokenId) == 0,          "PurrToken: not a Starter NFT");

        catNFT.burn(starterTokenId);
        _mint(msg.sender, STARTER_BURN_REWARD);

        emit StarterNFTBurned(msg.sender, starterTokenId, STARTER_BURN_REWARD);
    }

    /// @notice 销毁全家福 NFT（type=3），获得 30 PURR
    /// @dev 销毁后不可恢复，前端应明确提示用户
    ///      ⚠️  建议先调用 claimWelcomeTokens 再调用此函数，总计最多获得 50 PURR
    function burnFamilyPortraitForTokens(uint256 portraitTokenId) external nonReentrant {
        require(catNFT.ownerOf(portraitTokenId) == msg.sender, "PurrToken: not your NFT");
        require(catNFT.nftType(portraitTokenId) == 3,           "PurrToken: not a FamilyPortrait NFT");

        catNFT.burnFamilyPortrait(portraitTokenId);
        _mint(msg.sender, FAMILY_PORTRAIT_REWARD);

        emit FamilyPortraitBurned(msg.sender, portraitTokenId, FAMILY_PORTRAIT_REWARD);
    }

    /// @notice 花费 AVAX 购买 PURR，AVAX 留存合约，由 distribute 分配
    /// @dev 精度说明：amount = msg.value * 1e18 / tokenPriceWei
    ///      整除截断导致少量精度损失（最多丢失 tokenPriceWei - 1 wei 的等值），
    ///      生产环境可接入 Chainlink Price Feed 替代固定汇率
    function buyTokens() external payable nonReentrant {
        require(msg.value > 0, "PurrToken: send AVAX to buy tokens");
        uint256 amount = (msg.value * 10 ** 18) / tokenPriceWei;
        require(amount > 0, "PurrToken: insufficient AVAX sent");
        _mint(msg.sender, amount);
        emit TokensPurchased(msg.sender, amount, msg.value);
    }

    // ========== 游戏合约入口 ==========

    /// @notice 游戏合约发放奖励给玩家
    function gameReward(address player, uint256 amount) external onlyGameContract {
        require(player != address(0), "PurrToken: zero address");
        require(amount > 0,           "PurrToken: amount must be > 0");
        _mint(player, amount);
    }

    /// @notice 游戏合约消耗玩家代币（无需玩家 approve）
    function gameSpend(address player, uint256 amount) external onlyGameContract {
        require(amount > 0,                    "PurrToken: amount must be > 0");
        require(balanceOf(player) >= amount,   "PurrToken: insufficient balance");
        _burn(player, amount);
    }

    // ========== 授权合约入口 ==========

    /// @notice 授权合约（如 DonationVault）mint 代币给用户
    function authorizedMint(address to, uint256 amount) external onlyAuthorizedMinter {
        require(to     != address(0), "PurrToken: zero address");
        require(amount > 0,           "PurrToken: amount must be > 0");
        _mint(to, amount);
    }

    // ========== 查询 ==========

    /// @notice 查询合约当前 AVAX 余额（buyTokens 收入）
    function vaultBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /// @notice 查询收款方列表长度
    function shareRecipientsCount() external view returns (uint256) {
        return shareRecipients.length;
    }
}
