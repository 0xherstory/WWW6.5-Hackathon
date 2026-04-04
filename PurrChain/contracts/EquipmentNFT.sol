// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// ============================================================
//  EquipmentNFT
//
//  装备槽位（3个，与 GameContract 对齐）：
//    Weapon (0) — 武器：提升出猎带回 NFT 的概率（rarityBonus）
//    Bag    (1) — 背包：提升材料碎片携带量（carryBonus）
//    Boots  (2) — 靴子：缩短出猎时长（speedBonus）
//
//  稀有度：Common / Fine / Rare / Legendary
//
//  装备加成字段（万分比，全部保留供未来扩展）：
//    rarityBonus — 武器主属性，影响出猎 NFT 掉落概率
//    safetyBonus — 暂留字段，当前无实际逻辑（Armor 槽废弃后保留兼容）
//    carryBonus  — 背包主属性，影响材料碎片产出量
//    speedBonus  — 靴子主属性，影响出猎时长缩减
//
//  "未装备"状态用 type(uint256).max 表示，避免与合法 tokenId=0 混淆
//
//  ⚠️  部署后必须执行的配置：
//       equipmentNFT.setGameContract(gameContract.address)
// ============================================================

contract EquipmentNFT is ERC721, Ownable {

    // ========== 枚举 ==========

    enum Rarity    { Common, Fine, Rare, Legendary }
    enum EquipSlot { Weapon, Bag, Boots }           // 3槽，与 GameContract 对齐

    // ========== 常量 ==========

    /// @dev 用于表示"未装备"，避免与合法 tokenId=0 混淆
    uint256 private constant _NOT_EQUIPPED = type(uint256).max;

    // ========== 数据结构 ==========

    struct Equipment {
        EquipSlot slot;
        Rarity    rarity;
        string    name;
        string    lore;
        uint16    rarityBonus;  // 出猎 NFT 掉落概率加成（万分比）；武器主属性
        uint16    safetyBonus;  // 暂留，当前无实际效果
        uint16    carryBonus;   // 材料碎片携带量加成（万分比）；背包主属性
        uint16    speedBonus;   // 出猎时长缩减（万分比）；靴子主属性
    }

    // ========== 状态变量 ==========

    uint256 private _nextTokenId;
    address public  gameContract;

    /// @dev tokenId => 装备属性
    mapping(uint256 => Equipment) public equipments;

    /// @dev equipTokenId => 当前穿戴的 catTokenId（_NOT_EQUIPPED 表示未装备）
    mapping(uint256 => uint256) public equippedOnCat;

    /// @dev catTokenId => slot => (equipTokenId + 1)
    ///      存储时 +1，读取时 -1，0 表示空槽，N 表示装备 tokenId = N-1
    ///      避免 tokenId=0 的合法装备与"空槽"语义冲突
    mapping(uint256 => mapping(EquipSlot => uint256)) private _catEquipment;

    // ========== 事件 ==========

    event EquipmentMinted(uint256 indexed tokenId, address indexed to, EquipSlot slot, Rarity rarity);
    event EquipmentBurned(uint256 indexed tokenId);
    event Equipped(uint256 indexed catTokenId, uint256 indexed equipTokenId, EquipSlot slot);
    event Unequipped(uint256 indexed catTokenId, uint256 indexed equipTokenId, EquipSlot slot);
    event GameContractUpdated(address indexed newGameContract);

    // ========== 构造 & 权限 ==========

    /// @dev (slot * 4 + rarity) => IPFS URI
    ///      共 12 种组合：slot 0~2，rarity 0~3
    mapping(uint256 => string) private _slotRarityURI;

    // ========== Admin 权限 ==========

    mapping(address => bool) public admins;
    event AdminUpdated(address indexed admin, bool status);

    modifier onlyOwnerOrAdmin() {
        require(msg.sender == owner() || admins[msg.sender], "EquipmentNFT: not authorized");
        _;
    }

    function setAdmin(address _admin, bool _status) external onlyOwner {
        require(_admin != address(0), "EquipmentNFT: zero address");
        admins[_admin] = _status;
        emit AdminUpdated(_admin, _status);
    }

    // ========== URI 管理 ==========

    /// @notice 设置某个 slot+rarity 组合的 tokenURI
    /// @param _slot    0=武器 1=背包 2=靴子
    /// @param _rarity  0=普通 1=精良 2=稀有 3=传说
    /// @param _uri     IPFS metadata URI
    function setSlotRarityURI(uint8 _slot, uint8 _rarity, string calldata _uri) external onlyOwnerOrAdmin {
        require(_slot   <= uint8(type(EquipSlot).max), "EquipmentNFT: invalid slot");
        require(_rarity <= uint8(type(Rarity).max),    "EquipmentNFT: invalid rarity");
        require(bytes(_uri).length > 0,                "EquipmentNFT: empty URI");
        _slotRarityURI[uint256(_slot) * 4 + uint256(_rarity)] = _uri;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        ownerOf(tokenId);
        Equipment storage eq = equipments[tokenId];
        string memory uri = _slotRarityURI[uint256(uint8(eq.slot)) * 4 + uint256(uint8(eq.rarity))];
        // 若 URI 未设置，返回空字符串（前端用占位图）
        return uri;
    }



    modifier onlyGame() {
        require(msg.sender == gameContract, "EquipmentNFT: not authorized");
        _;
    }

    constructor() ERC721("PurrEquipment", "PUREQ") Ownable(msg.sender) {}

    function setGameContract(address _gameContract) external onlyOwner {
        require(_gameContract != address(0), "EquipmentNFT: zero address");
        gameContract = _gameContract;
        emit GameContractUpdated(_gameContract);
    }

    // ========== Mint ==========

    /// @notice 由 GameContract 在抽卡时调用，mint 一件装备 NFT
    function mintEquipment(
        address         to,
        uint8           slot,
        uint8           rarity,
        string calldata name,
        string calldata lore,
        uint16          rarityBonus,
        uint16          safetyBonus,
        uint16          carryBonus,
        uint16          speedBonus
    ) external onlyGame returns (uint256) {
        require(to != address(0),              "EquipmentNFT: zero address");
        require(bytes(name).length > 0,        "EquipmentNFT: name empty");
        require(slot   <= uint8(type(EquipSlot).max), "EquipmentNFT: invalid slot");
        require(rarity <= uint8(type(Rarity).max),    "EquipmentNFT: invalid rarity");
        require(rarityBonus <= 10000, "EquipmentNFT: rarityBonus > 100%");
        require(safetyBonus <= 10000, "EquipmentNFT: safetyBonus > 100%");
        require(carryBonus  <= 10000, "EquipmentNFT: carryBonus  > 100%");
        require(speedBonus  <= 10000, "EquipmentNFT: speedBonus  > 100%");

        uint256 tokenId = _nextTokenId++;
        equipments[tokenId] = Equipment({
            slot:        EquipSlot(slot),
            rarity:      Rarity(rarity),
            name:        name,
            lore:        lore,
            rarityBonus: rarityBonus,
            safetyBonus: safetyBonus,
            carryBonus:  carryBonus,
            speedBonus:  speedBonus
        });
        // 初始化为"未装备"
        equippedOnCat[tokenId] = _NOT_EQUIPPED;

        _safeMint(to, tokenId);
        emit EquipmentMinted(tokenId, to, EquipSlot(slot), Rarity(rarity));
        return tokenId;
    }

    // ========== Burn ==========

    /// @notice 由 GameContract 调用，销毁装备（当前版本装备不可消耗，保留接口供未来扩展）
    /// @dev 若装备当前穿戴在猫身上，自动卸下再销毁
    function burn(uint256 tokenId) external onlyGame {
        // 若已穿戴，先卸下
        uint256 catId = equippedOnCat[tokenId];
        if (catId != _NOT_EQUIPPED) {
            EquipSlot slot = equipments[tokenId].slot;
            _catEquipment[catId][slot] = 0;
            equippedOnCat[tokenId]     = _NOT_EQUIPPED;
            emit Unequipped(catId, tokenId, slot);
        }
        delete equipments[tokenId];
        _burn(tokenId);
        emit EquipmentBurned(tokenId);
    }

    // ========== 穿戴 / 卸下 ==========

    /// @notice 由 GameContract 调用，将装备穿戴到指定猫身上
    /// @dev GameContract.equipItem 已校验：
    ///      1. msg.sender 是猫的 owner
    ///      2. msg.sender 是装备的 owner
    ///      3. 猫处于 Idle 状态
    ///      此处额外校验装备存在性，防止穿戴已 burn 的装备
    function equip(uint256 catTokenId, uint256 equipTokenId) external onlyGame {
        // 校验装备存在（burn 后 ownerOf 会 revert）
        ownerOf(equipTokenId);

        // 校验装备当前未穿戴在其他猫身上
        uint256 currentCat = equippedOnCat[equipTokenId];
        require(
            currentCat == _NOT_EQUIPPED || currentCat == catTokenId,
            "EquipmentNFT: equipment already equipped on another cat"
        );

        EquipSlot slot = equipments[equipTokenId].slot;

        // 同槽位旧装备自动卸下（存储值 N 对应 tokenId = N-1）
        uint256 stored = _catEquipment[catTokenId][slot];
        if (stored != 0) {
            uint256 oldEquip = stored - 1;
            equippedOnCat[oldEquip] = _NOT_EQUIPPED;
            emit Unequipped(catTokenId, oldEquip, slot);
        }

        _catEquipment[catTokenId][slot] = equipTokenId + 1; // 偏移 +1 存储
        equippedOnCat[equipTokenId]     = catTokenId;
        emit Equipped(catTokenId, equipTokenId, slot);
    }

    /// @notice 由 GameContract 调用，卸下指定槽位的装备
    function unequip(uint256 catTokenId, uint8 slot) external onlyGame {
        require(slot <= uint8(type(EquipSlot).max), "EquipmentNFT: invalid slot");
        EquipSlot eSlot = EquipSlot(slot);
        uint256 stored  = _catEquipment[catTokenId][eSlot];
        require(stored != 0, "EquipmentNFT: nothing equipped in this slot");

        uint256 equipTokenId = stored - 1; // 偏移 -1 还原真实 tokenId
        _catEquipment[catTokenId][eSlot] = 0;
        equippedOnCat[equipTokenId]      = _NOT_EQUIPPED;
        emit Unequipped(catTokenId, equipTokenId, eSlot);
    }

    // ========== 查询 ==========

    /// @notice 查询猫咪三个槽位的装备加成总和
    function getCatBonuses(uint256 catTokenId) external view returns (
        uint16 totalRarity,
        uint16 totalSafety,
        uint16 totalCarry,
        uint16 totalSpeed
    ) {
        EquipSlot[3] memory slots = [EquipSlot.Weapon, EquipSlot.Bag, EquipSlot.Boots];
        for (uint8 i = 0; i < 3; i++) {
            uint256 stored = _catEquipment[catTokenId][slots[i]];
            if (stored != 0) {
                Equipment storage e = equipments[stored - 1]; // 偏移 -1
                totalRarity += e.rarityBonus;
                totalSafety += e.safetyBonus;
                totalCarry  += e.carryBonus;
                totalSpeed  += e.speedBonus;
            }
        }
    }

    /// @notice 查询某件装备的完整属性
    function getEquipment(uint256 tokenId) external view returns (Equipment memory) {
        ownerOf(tokenId);
        return equipments[tokenId];
    }

    /// @notice 查询猫咪某个槽位当前装备的 tokenId；返回 type(uint256).max 表示空槽
    function getSlotEquipment(uint256 catTokenId, uint8 slot) external view returns (uint256) {
        require(slot <= uint8(type(EquipSlot).max), "EquipmentNFT: invalid slot");
        uint256 stored = _catEquipment[catTokenId][EquipSlot(slot)];
        return stored == 0 ? type(uint256).max : stored - 1;
    }

    /// @notice 查询某件装备当前穿戴的猫（返回 _NOT_EQUIPPED 表示未穿戴）
    function getEquippedCat(uint256 equipTokenId) external view returns (uint256) {
        return equippedOnCat[equipTokenId];
    }

    /// @notice 查询某件装备是否已穿戴
    function isEquipped(uint256 equipTokenId) external view returns (bool) {
        return equippedOnCat[equipTokenId] != _NOT_EQUIPPED;
    }

    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }
}
