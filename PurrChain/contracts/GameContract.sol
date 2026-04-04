// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// ============================================================
//  接口
// ============================================================

interface ICatNFT {
    function ownerOf(uint256 tokenId) external view returns (address);

    /// @dev NFTType 枚举值：
    ///      0=Starter, 1=CloudAdopted, 2=Genesis,
    ///      3=FamilyPortrait, 4=StarterCat, 5=Collection
    function nftType(uint256 tokenId) external view returns (uint8);

    /// @dev 免费初始猫：每地址一次，由 GameContract 调用
    function mintStarterCat(address _to, uint256 _realCatId) external;

    /// @dev 出猎带回收藏系列 NFT
    function mintCollection(address _to, uint32 _seriesId) external returns (uint256);

    /// @dev 查询活跃收藏系列数量（用于随机选系列）
    function seriesCount() external view returns (uint32);

    /// @dev 查询某系列是否活跃
    function getCollectionSeries(uint32 _seriesId) external view returns (
        string memory name,
        string memory uri,
        bool active
    );

    /// @dev 查询用户是否已领取免费初始猫
    function hasClaimedStarterCat(address user) external view returns (bool);
}

interface IPurrToken {
    function gameSpend(address player, uint256 amount) external;
}

interface IEquipmentNFT {
    function ownerOf(uint256 tokenId) external view returns (address);
    function getCatBonuses(uint256 catTokenId) external view returns (
        uint16 totalRarity,
        uint16 totalSafety,
        uint16 totalCarry,
        uint16 totalSpeed
    );
    function mintEquipment(
        address to,
        uint8 slot,
        uint8 rarity,
        string calldata name,
        string calldata lore,
        uint16 rarityBonus,
        uint16 safetyBonus,
        uint16 carryBonus,
        uint16 speedBonus
    ) external returns (uint256);
    function equip(uint256 catTokenId, uint256 equipTokenId) external;
    function unequip(uint256 catTokenId, uint8 slot) external;
}

// ============================================================
//  GameContract
//
//  核心机制：
//    1. 新用户领取免费初始猫（claimStarterCat）
//    2. 体力系统：每8h恢复1点，上限5点，可花 $PURR 购买恢复
//    3. 商店：猫粮 / 罐罐（影响出猎 NFT 掉落概率）/ 体力 / 加速符
//    4. 出猎：指定猫 + 时长 + 携带道具，消耗对应体力
//    5. 结算：带回收藏 NFT（概率由道具决定）+ 材料碎片
//    6. 碎片合成抽卡券，抽卡得装备 NFT
//    7. 持有 CloudAdopted / Genesis / StarterCat NFT 每周领抽卡券
//
//  体力说明：
//    - 存储：staminaData[address] = {stamina, lastUpdateTime}
//    - 读取：动态计算 = stored + elapsed/STAMINA_RECOVERY_INTERVAL，上限 MAX_STAMINA
//    - 出猎消耗：短途1点 / 中途2点 / 长途3点
//    - 购买恢复：buyStamina(amount)，超上限 revert
//
//  出猎道具（startHunt 时指定并扣除）：
//    None  — 不携带，无 NFT 掉落
//    Food  — 猫粮：普通80% / 稀有15% / 珍稀5%
//    Can   — 罐罐：普通50% / 稀有35% / 珍稀15%
//
//  随机数：
//    使用 block.prevrandao + nonce，不依赖 blockhash
//    （Avalanche C-Chain 出块2秒，最短出猎2h = ~1800块，早超blockhash 256块窗口）
//
//  ⚠️  部署后必须执行的配置：
//       catNFT.setAuthorizedMinter(gameContract.address, true)
//       purrToken.setGameContract(gameContract.address, true)
//       equipmentNFT.setGameContract(gameContract.address)
// ============================================================

contract GameContract is Ownable, ReentrancyGuard {

    // ========== 枚举 ==========

    enum HuntDuration { Short, Mid, Long }  // 2h / 4h / 8h
    enum HuntStatus   { Idle, Hunting }
    enum HuntItem     { None, Food, Can }   // 出猎携带道具

    // ========== 常量 ==========

    uint256 public constant FRAGMENT_TO_TICKET    = 10;      // 10碎片合成1张抽卡券
    uint256 public constant SPEND_THRESHOLD       = 50e18;   // 每消费50 PURR奖励1张抽卡券
    uint256 public constant CLOUD_NFT_COOLDOWN    = 7 days;  // 持猫NFT领券冷却
    uint8   public constant MAX_STAMINA           = 5;       // 体力上限
    uint256 public constant STAMINA_RECOVERY_INTERVAL = 8 hours; // 每8h恢复1点体力

    // ========== 可调整参数（owner 可改，便于测试网调参）==========

    /// @notice 出猎时长：短途 / 中途 / 长途
    uint256[3] public huntDuration  = [10,  20,  40];

    /// @notice 出猎体力消耗：短途1 / 中途2 / 长途3
    uint256[3] public staminaCost   = [1, 2, 3];

    /// @notice 出猎基础材料碎片产出
    uint256[3] public baseMaterials = [2, 5, 15];

    /// @notice 商店物品价格（$PURR，18位小数）
    uint256 public foodPrice     = 5e18;   // 猫粮单价
    uint256 public canPrice      = 15e18;  // 罐罐单价
    uint256 public staminaPrice  = 8e18;   // 每点体力单价
    uint256 public boosterPrice  = 10e18;  // 加速符单价（缩短当次出猎时长50%）

    // ========== 装备模板 ==========

    struct EquipTemplate {
        uint8   slot;
        uint8   rarity;
        string  name;
        string  lore;
        uint16  rarityBonus;  // 出猎带回NFT概率加成（万分比）
        uint16  safetyBonus;  // 暂留，可用于未来扩展
        uint16  carryBonus;   // 材料碎片携带量加成（万分比）
        uint16  speedBonus;   // 出猎时长缩减加成（万分比）
    }

    /// @dev rarity(0~3) => 模板列表
    mapping(uint8 => EquipTemplate[]) public equipTemplates;

    // ========== 玩家资产 ==========

    struct StaminaData {
        uint8   stamina;          // 当前已存储体力（不含未结算恢复量）
        uint40  lastUpdateTime;   // 上次体力结算时间戳（uint40 够用到 year 36812）
    }

    mapping(address => StaminaData) private _staminaData;
    mapping(address => uint256) public foodBalance;      // 猫粮库存
    mapping(address => uint256) public canBalance;       // 罐罐库存
    mapping(address => uint256) public boosterBalance;   // 加速符库存
    mapping(address => uint256) public materialBalance;  // 材料碎片
    mapping(address => uint256) public gachaTickets;     // 抽卡券

    mapping(address => uint256) public totalSpent;        // 累计消费 $PURR
    mapping(address => uint256) public thresholdRewarded; // 已发放消费门槛奖励次数
    mapping(uint256 => uint256) public lastClaimTime;     // catTokenId => 上次领周券时间

    // ========== 出猎状态 ==========

    struct HuntInfo {
        HuntStatus   status;
        HuntDuration duration;
        uint256      departureTime;
        uint256      effectiveDuration; // 实际出猎时长（已考虑加速符缩短）
        HuntItem     item;              // 携带道具类型
    }

    /// @dev catTokenId => 出猎状态
    mapping(uint256 => HuntInfo) public huntInfo;

    /// @dev 抽卡随机数防重放
    mapping(address => uint256) private _nonce;

    // ========== 外部合约 ==========

    ICatNFT       public catNFT;
    IPurrToken    public purrToken;
    IEquipmentNFT public equipmentNFT;

    mapping(address => bool) public admins;
    event AdminUpdated(address indexed admin, bool status);

    modifier onlyOwnerOrAdmin() {
        require(msg.sender == owner() || admins[msg.sender], "GameContract: not authorized");
        _;
    }

    function setAdmin(address _admin, bool _status) external onlyOwner {
        require(_admin != address(0), "GameContract: zero address");
        admins[_admin] = _status;
        emit AdminUpdated(_admin, _status);
    }

    // ========== 事件 ==========

    event StarterCatClaimed(address indexed player, uint256 realCatId);
    event ItemBought(address indexed player, string item, uint256 amount, uint256 cost);
    event HuntStarted(uint256 indexed catTokenId, HuntDuration duration, HuntItem item, uint256 effectiveDuration);
    event HuntSettled(uint256 indexed catTokenId, uint256 materials, bool nftDropped, uint32 seriesId);
    event WeeklyTicketClaimed(address indexed player, uint256 indexed catTokenId);
    event GachaTicketGranted(address indexed player, uint256 amount, string reason);
    event GachaResult(address indexed player, uint256 equipTokenId, uint8 rarity);
    event FragmentsMerged(address indexed player, uint256 tickets);
    event StaminaUpdated(address indexed player, uint8 stamina);

    // ========== 构造函数 ==========

    constructor(
        address _catNFT,
        address _purrToken,
        address _equipmentNFT
    ) Ownable(msg.sender) {
        require(_catNFT       != address(0), "GameContract: zero address");
        require(_purrToken    != address(0), "GameContract: zero address");
        require(_equipmentNFT != address(0), "GameContract: zero address");
        catNFT       = ICatNFT(_catNFT);
        purrToken    = IPurrToken(_purrToken);
        equipmentNFT = IEquipmentNFT(_equipmentNFT);
    }

    // ========== 修饰符 ==========

    modifier ownsCat(uint256 catTokenId) {
        require(catNFT.ownerOf(catTokenId) == msg.sender, "GameContract: not your cat");
        _;
    }

    modifier catIdle(uint256 catTokenId) {
        require(huntInfo[catTokenId].status == HuntStatus.Idle, "GameContract: cat is hunting");
        _;
    }

    // ========== 体力系统 ==========

    /// @notice 查询玩家当前实时体力（含未结算的自然恢复）
    function getStamina(address player) public view returns (uint8) {
        StaminaData memory sd = _staminaData[player];
        if (sd.lastUpdateTime == 0) return MAX_STAMINA; // 新用户默认满体力

        uint256 elapsed = block.timestamp - sd.lastUpdateTime;
        uint256 recovered = elapsed / STAMINA_RECOVERY_INTERVAL;

        uint256 total = uint256(sd.stamina) + recovered;
        return total >= MAX_STAMINA ? MAX_STAMINA : uint8(total);
    }

    /// @dev 内部：结算并写入体力，然后扣除指定量
    ///      必须保证调用前已校验体力充足
    function _consumeStamina(address player, uint8 amount) internal {
        uint8 current = getStamina(player);
        require(current >= amount, "GameContract: not enough stamina");

        // 结算：写入最新体力和当前时间
        // 注意：lastUpdateTime 取"上次恢复点"而非 block.timestamp，
        // 避免丢失不足一个周期的零头时间
        StaminaData storage sd = _staminaData[player];
        uint256 elapsed = sd.lastUpdateTime == 0 ? 0 : block.timestamp - sd.lastUpdateTime;
        uint256 fullCycles = elapsed / STAMINA_RECOVERY_INTERVAL;

        // lastUpdateTime 推进到最后一个完整恢复周期的时间点。
        // 零头时间（elapsed % STAMINA_RECOVERY_INTERVAL）隐式保留：
        // 下次读取时从这个时间点继续累计，不会丢失。
        uint40 newLastUpdate = sd.lastUpdateTime == 0
            ? uint40(block.timestamp)
            : uint40(sd.lastUpdateTime + fullCycles * STAMINA_RECOVERY_INTERVAL);

        sd.stamina        = current - amount;
        sd.lastUpdateTime = newLastUpdate;
    }

    /// @notice 购买体力恢复，超过上限 revert
    /// @dev 新用户 getStamina 返回 MAX_STAMINA，current + amount > MAX_STAMINA 必然 revert，
    ///      因此新用户无法调用此函数，行为正确（满体力无需购买）
    function buyStamina(uint8 amount) external nonReentrant {
        require(amount > 0, "GameContract: amount must > 0");
        uint8 current = getStamina(msg.sender);
        require(current + uint256(amount) <= MAX_STAMINA, "GameContract: would exceed max stamina");

        uint256 cost = uint256(amount) * staminaPrice;

        // Effects 先：结算当前体力后写入新值
        StaminaData storage sd = _staminaData[msg.sender];
        sd.stamina        = current + amount;
        sd.lastUpdateTime = uint40(block.timestamp);

        // Interactions
        _spendPurr(msg.sender, cost);

        emit StaminaUpdated(msg.sender, sd.stamina);
        emit ItemBought(msg.sender, "stamina", amount, cost);
    }

    // ========== 新用户入口：领取免费初始猫 ==========

    /// @notice 新用户选择一只 CatRegistry 中的真实猫，免费领取 StarterCat NFT
    /// @dev 每地址只能领一次，由 CatNFT 合约保证
    /// @param _realCatId CatRegistry 中的猫咪 ID
    function claimStarterCat(uint256 _realCatId) external nonReentrant {
        require(!catNFT.hasClaimedStarterCat(msg.sender), "GameContract: already claimed starter cat");
        // CatNFT.mintStarterCat 内部会校验猫咪存在性、机构合法性、并自动选初始阶段
        catNFT.mintStarterCat(msg.sender, _realCatId);
        emit StarterCatClaimed(msg.sender, _realCatId);
    }

    // ========== 商店 ==========

    /// @notice 购买猫粮
    function buyCatFood(uint256 amount) external nonReentrant {
        require(amount > 0, "GameContract: amount must > 0");
        uint256 cost = amount * foodPrice;
        foodBalance[msg.sender] += amount;
        _spendPurr(msg.sender, cost);
        emit ItemBought(msg.sender, "food", amount, cost);
    }

    /// @notice 购买罐罐
    function buyCatCan(uint256 amount) external nonReentrant {
        require(amount > 0, "GameContract: amount must > 0");
        uint256 cost = amount * canPrice;
        canBalance[msg.sender] += amount;
        _spendPurr(msg.sender, cost);
        emit ItemBought(msg.sender, "can", amount, cost);
    }

    /// @notice 购买加速符（使用后缩短当次出猎时长50%）
    function buyBooster(uint256 amount) external nonReentrant {
        require(amount > 0, "GameContract: amount must > 0");
        uint256 cost = amount * boosterPrice;
        boosterBalance[msg.sender] += amount;
        _spendPurr(msg.sender, cost);
        emit ItemBought(msg.sender, "booster", amount, cost);
    }

    // ========== 出猎 ==========

    /// @notice 派遣一只猫出猎
    /// @param catTokenId 出猎的猫 NFT tokenId
    /// @param duration   出猎时长档位
    /// @param item       携带道具（None/Food/Can），出发时扣除
    /// @param useBooster 是否使用加速符（缩短时长50%，受装备 speedBonus 叠加）
    function startHunt(
        uint256      catTokenId,
        HuntDuration duration,
        HuntItem     item,
        bool         useBooster
    )
        external
        nonReentrant
        ownsCat(catTokenId)
        catIdle(catTokenId)
    {
        // ── 校验并扣体力 ──
        uint8 needed = uint8(staminaCost[uint8(duration)]);
        _consumeStamina(msg.sender, needed);

        // ── 校验并扣道具 ──
        if (item == HuntItem.Food) {
            require(foodBalance[msg.sender] >= 1, "GameContract: no cat food");
            foodBalance[msg.sender] -= 1;
        } else if (item == HuntItem.Can) {
            require(canBalance[msg.sender] >= 1, "GameContract: no cat can");
            canBalance[msg.sender] -= 1;
        }

        // ── 计算实际出猎时长（加速符 + 装备 speedBonus）──
        uint256 baseDuration = huntDuration[uint8(duration)];
        uint256 effectiveDuration = _calcEffectiveDuration(catTokenId, baseDuration, useBooster);

        if (useBooster) {
            require(boosterBalance[msg.sender] >= 1, "GameContract: no booster");
            boosterBalance[msg.sender] -= 1;
        }

        huntInfo[catTokenId] = HuntInfo({
            status:            HuntStatus.Hunting,
            duration:          duration,
            departureTime:     block.timestamp,
            effectiveDuration: effectiveDuration,
            item:              item
        });

        emit HuntStarted(catTokenId, duration, item, effectiveDuration);
    }

    /// @notice 结算出猎，使用 prevrandao + nonce 随机（不依赖 blockhash）
    /// @dev Avalanche C-Chain 出块~2秒，最短出猎2h ≈ 3600块，远超blockhash 256块窗口
    ///      因此统一改用 prevrandao + nonce，无需 emergencySettle
    function settleHunt(uint256 catTokenId)
        external
        nonReentrant
        ownsCat(catTokenId)
    {
        HuntInfo storage info = huntInfo[catTokenId];
        require(info.status == HuntStatus.Hunting, "GameContract: not hunting");
        require(
            block.timestamp >= info.departureTime + info.effectiveDuration,
            "GameContract: not back yet"
        );

        HuntItem item         = info.item;
        HuntDuration duration = info.duration;
        delete huntInfo[catTokenId]; // Effects 先清状态

        // ── 随机种子 ──
        uint256 seed = uint256(keccak256(abi.encodePacked(
            block.prevrandao,
            catTokenId,
            msg.sender,
            _nonce[msg.sender]++
        )));

        // ── 装备加成 ──
        (uint16 rarityB,, uint16 carryB,) = equipmentNFT.getCatBonuses(catTokenId);

        // ── 材料碎片产出（背包加成）──
        uint256 carryMult    = 10000 + carryB;
        uint256 materialsOut = baseMaterials[uint8(duration)] * carryMult / 10000;
        materialBalance[msg.sender] += materialsOut;

        // ── 收藏 NFT 掉落 ──
        bool   nftDropped = false;
        uint32 droppedSeriesId = 0;

        if (item != HuntItem.None) {
            seed = _nextSeed(seed);
            (nftDropped, droppedSeriesId) = _rollCollectionDrop(seed, item, rarityB);

            if (nftDropped) {
                // Interactions：外部调用放最后
                catNFT.mintCollection(msg.sender, droppedSeriesId);
            }
        }

        emit HuntSettled(catTokenId, materialsOut, nftDropped, droppedSeriesId);
    }

    // ========== 周券领取 ==========

    /// @notice 持有 CloudAdopted / Genesis / StarterCat NFT 每周领一张抽卡券
    /// @dev NFTType: 1=CloudAdopted, 2=Genesis, 4=StarterCat
    function claimWeeklyTicket(uint256 catTokenId)
        external
        ownsCat(catTokenId)
    {
        uint8 nType = catNFT.nftType(catTokenId);
        require(
            nType == 1 || nType == 2 || nType == 4,
            "GameContract: not a eligible cat NFT"
        );
        require(
            block.timestamp >= lastClaimTime[catTokenId] + CLOUD_NFT_COOLDOWN,
            "GameContract: already claimed this week"
        );

        lastClaimTime[catTokenId] = block.timestamp;
        gachaTickets[msg.sender] += 1;

        emit WeeklyTicketClaimed(msg.sender, catTokenId);
        emit GachaTicketGranted(msg.sender, 1, "weekly");
    }

    // ========== 碎片合成 ==========

    function mergeFragments(uint256 amount) external {
        require(amount > 0, "GameContract: amount must > 0");
        uint256 cost = amount * FRAGMENT_TO_TICKET;
        require(materialBalance[msg.sender] >= cost, "GameContract: not enough fragments");
        materialBalance[msg.sender] -= cost;
        gachaTickets[msg.sender]    += amount;
        emit FragmentsMerged(msg.sender, amount);
    }

    // ========== 抽卡 ==========

    function gacha() external nonReentrant {
        require(gachaTickets[msg.sender] >= 1, "GameContract: no tickets");

        gachaTickets[msg.sender] -= 1;

        uint256 seed = uint256(keccak256(abi.encodePacked(
            block.prevrandao,
            msg.sender,
            _nonce[msg.sender]++
        )));

        uint8 rarity = _rollRarity(seed);
        EquipTemplate[] storage pool = equipTemplates[rarity];
        require(pool.length > 0, "GameContract: no templates for this rarity");

        seed = _nextSeed(seed);
        EquipTemplate storage tmpl = pool[seed % pool.length];

        uint256 equipTokenId = equipmentNFT.mintEquipment(
            msg.sender,
            tmpl.slot,
            tmpl.rarity,
            tmpl.name,
            tmpl.lore,
            tmpl.rarityBonus,
            tmpl.safetyBonus,
            tmpl.carryBonus,
            tmpl.speedBonus
        );

        emit GachaResult(msg.sender, equipTokenId, rarity);
    }

    // ========== 装备穿戴 ==========

    function equipItem(uint256 catTokenId, uint256 equipTokenId)
        external
        ownsCat(catTokenId)
        catIdle(catTokenId)
    {
        require(equipmentNFT.ownerOf(equipTokenId) == msg.sender, "GameContract: not your equipment");
        equipmentNFT.equip(catTokenId, equipTokenId);
    }

    function unequipItem(uint256 catTokenId, uint8 slot)
        external
        ownsCat(catTokenId)
        catIdle(catTokenId)
    {
        equipmentNFT.unequip(catTokenId, slot);
    }

    // ========== Owner 管理 ==========

    function addEquipTemplate(
        uint8   rarity,
        uint8   slot,
        string calldata name,
        string calldata lore,
        uint16  rarityBonus,
        uint16  safetyBonus,
        uint16  carryBonus,
        uint16  speedBonus
    ) external onlyOwnerOrAdmin {
        require(rarity <= 3,            "GameContract: invalid rarity");
        require(slot   <= 2,            "GameContract: invalid slot");  // 0=Weapon 1=Bag 2=Boots
        require(bytes(name).length > 0, "GameContract: name empty");
        require(
            rarityBonus <= 10000 && safetyBonus <= 10000 &&
            carryBonus  <= 10000 && speedBonus  <= 10000,
            "GameContract: bonus > 100%"
        );
        equipTemplates[rarity].push(EquipTemplate({
            slot:        slot,
            rarity:      rarity,
            name:        name,
            lore:        lore,
            rarityBonus: rarityBonus,
            safetyBonus: safetyBonus,
            carryBonus:  carryBonus,
            speedBonus:  speedBonus
        }));
    }

    function setHuntParams(
        uint256[3] calldata _huntDuration,
        uint256[3] calldata _staminaCost,
        uint256[3] calldata _baseMaterials
    ) external onlyOwnerOrAdmin {
        require(
            _staminaCost[0] > 0 && _staminaCost[0] <= MAX_STAMINA &&
            _staminaCost[1] > 0 && _staminaCost[1] <= MAX_STAMINA &&
            _staminaCost[2] > 0 && _staminaCost[2] <= MAX_STAMINA,
            "GameContract: invalid stamina cost"
        );
        require(_baseMaterials[0] > 0, "GameContract: materials must > 0");
        huntDuration  = _huntDuration;
        staminaCost   = _staminaCost;
        baseMaterials = _baseMaterials;
    }

    function setShopPrices(
        uint256 _foodPrice,
        uint256 _canPrice,
        uint256 _staminaPrice,
        uint256 _boosterPrice
    ) external onlyOwnerOrAdmin {
        require(
            _foodPrice > 0 && _canPrice > 0 &&
            _staminaPrice > 0 && _boosterPrice > 0,
            "GameContract: price must > 0"
        );
        foodPrice    = _foodPrice;
        canPrice     = _canPrice;
        staminaPrice = _staminaPrice;
        boosterPrice = _boosterPrice;
    }

    // ========== 内部：消耗 $PURR + 消费门槛奖励 ==========

    function _spendPurr(address player, uint256 amount) internal {
        purrToken.gameSpend(player, amount);

        totalSpent[player] += amount;
        uint256 newRewards  = totalSpent[player] / SPEND_THRESHOLD;
        if (newRewards > thresholdRewarded[player]) {
            uint256 grant = newRewards - thresholdRewarded[player];
            thresholdRewarded[player] = newRewards;
            gachaTickets[player]     += grant;
            emit GachaTicketGranted(player, grant, "threshold");
        }
    }

    // ========== 内部：计算实际出猎时长 ==========

    /// @dev 加速符固定缩短50%，装备 speedBonus 在此基础上叠加（万分比）
    ///      最终时长不低于基础时长的10%，防止被压到0
    function _calcEffectiveDuration(
        uint256 catTokenId,
        uint256 baseDuration,
        bool    useBooster
    ) internal view returns (uint256) {
        (,,, uint16 speedB) = equipmentNFT.getCatBonuses(catTokenId);

        // 加速符：直接减半
        uint256 duration = useBooster ? baseDuration / 2 : baseDuration;

        // 装备靴子 speedBonus：在当前时长基础上再缩减（万分比）
        // 例：speedB = 1200（12%），duration * (10000 - 1200) / 10000
        if (speedB > 0) {
            uint256 reduction = speedB >= 9000 ? 9000 : speedB; // 最多缩90%
            duration = duration * (10000 - reduction) / 10000;
        }

        // 最低不低于基础时长的10%
        uint256 minDuration = baseDuration / 10;
        return duration < minDuration ? minDuration : duration;
    }

    // ========== 内部：收藏 NFT 掉落逻辑 ==========

    /// @dev 返回 (是否掉落, 掉落的系列ID)
    ///      掉落概率：
    ///        猫粮：普通80% / 稀有15% / 珍稀5%（总掉落率100%，但分稀有度）
    ///        罐罐：普通50% / 稀有35% / 珍稀15%
    ///      武器 rarityBonus 提升稀有和珍稀的概率（从普通段压缩过来）
    ///      若无活跃系列则不掉落
    function _rollCollectionDrop(
        uint256  seed,
        HuntItem item,
        uint16   rarityBonus
    ) internal view returns (bool dropped, uint32 seriesId) {
        uint32 total = catNFT.seriesCount();
        if (total == 0) return (false, 0);

        // 先确定稀有度分段（万分比）
        // rarityBonus 最多把普通概率压缩 rarityBonus 的一半分给稀有/珍稀
        uint256 boost = uint256(rarityBonus) / 2; // 最多 5000（50%）

        uint256 commonRate;
        uint256 rareRate;
        uint256 epicRate;

        if (item == HuntItem.Food) {
            // 基础：普通8000 / 稀有1500 / 珍稀500
            commonRate = 8000 > boost ? 8000 - boost : 0;
            rareRate   = 1500 + boost / 2;
            epicRate   = 10000 - commonRate - rareRate;
        } else {
            // Can 基础：普通5000 / 稀有3500 / 珍稀1500
            commonRate = 5000 > boost ? 5000 - boost : 0;
            rareRate   = 3500 + boost / 2;
            epicRate   = 10000 - commonRate - rareRate;
        }

        // 掉落必然发生（带了道具就一定掉），区别只在稀有度
        uint256 roll = seed % 10000;
        uint8 tier;   // 0=普通 1=稀有 2=珍稀
        if (roll < epicRate) {
            tier = 2;
        } else if (roll < epicRate + rareRate) {
            tier = 1;
        } else {
            tier = 0;
        }

        // 从活跃系列中随机选一个对应稀有度层级的系列
        // 简化处理：seriesId % 3 对应三个稀有度层级
        // （正式运营时 owner 应按层级注册系列，这里按 id % 3 分层）
        seed = _nextSeed(seed);
        uint32 attempts = 0;
        uint32 candidate = uint32(seed % total);
        while (attempts < total) {
            // 尝试找一个活跃且稀有度匹配的系列
            (, , bool active) = catNFT.getCollectionSeries(candidate);
            if (active && (candidate % 3 == tier)) {
                return (true, candidate);
            }
            candidate = (candidate + 1) % total;
            attempts++;
        }

        // 若没有对应层级的系列，退而求其次选任意活跃系列
        candidate = uint32(seed % total);
        attempts = 0;
        while (attempts < total) {
            (, , bool active) = catNFT.getCollectionSeries(candidate);
            if (active) {
                return (true, candidate);
            }
            candidate = (candidate + 1) % total;
            attempts++;
        }

        return (false, 0); // 无活跃系列
    }

    // ========== 内部：随机数工具 ==========

    function _nextSeed(uint256 seed) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(seed)));
    }

    function _rollRarity(uint256 seed) internal pure returns (uint8) {
        uint256 roll = seed % 10000;
        if (roll < 300)  return 3; // 传说  3%
        if (roll < 1500) return 2; // 稀有 12%
        if (roll < 4000) return 1; // 精良 25%
        return 0;                  // 普通 60%
    }

    // ========== 查询 ==========

    /// @notice 查询玩家实时体力
    function staminaOf(address player) external view returns (uint8) {
        return getStamina(player);
    }
}
