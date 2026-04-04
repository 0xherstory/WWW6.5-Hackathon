// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// ============================================================
//  接口
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
    function isShelterApproved(address _shelter) external view returns (bool);
    function getCat(uint256 _catId) external view returns (Cat memory);
    function catCount() external view returns (uint256);
}

// ============================================================
//  CatNFT v2
//
//  NFT 规则变更：
//    StarterCat  — 用户进入游戏时，从该猫已有的 stage URI 中随机给一张
//    CloudAdopted— 捐款每达阈值，从用户尚未持有的 stage 中随机给一张
//                  全部 stage 1~3 已集齐后不再 mint
//    Genesis     — 真实领养回访通过，mint stage4
//
//  admins 支持（与 CatRegistry 同步）
// ============================================================

contract CatNFT is ERC721, Ownable, ReentrancyGuard {

    // ========== 常量 ==========

    uint8 public constant MAX_GROWTH_STAGE = 3;
    uint8 public constant GENESIS_STAGE    = 4;

    // ========== 枚举 ==========

    enum NFTType {
        Starter,        // 0
        CloudAdopted,   // 1
        Genesis,        // 2
        FamilyPortrait, // 3
        StarterCat,     // 4
        Collection      // 5
    }

    // ========== 数据结构 ==========

    struct CatNFTInfo {
        NFTType nftType;
        uint256 linkedRealCatId;
        uint8   stage;
        uint8   season;
        uint32  seriesId;
        string  tokenURIValue;
    }

    struct CollectionSeries {
        string   name;
        string[] uris;   // 同一系列可含多个不同 URI，mint 时随机选一个
        bool     active;
    }

    // ========== 状态变量 ==========

    uint256 private _nextTokenId;
    uint256 private _nonce; // 随机数防重放
    ICatRegistry public immutable catRegistry;

    string public starterURI;
    string public genesisURI;

    uint8 public currentSeason;
    mapping(uint8 => string)  public seasonURIs;

    uint32 public seriesCount;
    mapping(uint32 => CollectionSeries) public collectionSeries;

    mapping(address => bool) public authorizedMinters;

    // ========== Admin 权限（与 CatRegistry 对齐）==========
    mapping(address => bool) public admins;
    event AdminUpdated(address indexed admin, bool status);

    mapping(uint256 => CatNFTInfo) public nftInfo;

    // user => realCatId => 最高已 mint stage（StarterCat 和 CloudAdopted 共用）
    mapping(address => mapping(uint256 => uint8))      public userCatStage;
    // user => realCatId => [stage1TokenId, stage2TokenId, stage3TokenId]
    mapping(address => mapping(uint256 => uint256[3])) public userCatTokenIds;
    // user => realCatId => stage已持有标记（独立于 userCatStage，用于随机去重）
    mapping(address => mapping(uint256 => bool[3]))    public userHasStage; // index 0~2 = stage1~3

    mapping(address => bool)    public hasClaimedStarterCat;
    mapping(address => uint256) public starterCatOf;
    mapping(address => bool)    public hasClaimedStarter;
    mapping(address => bool)    public hasClaimedFamilyPortrait;

    // ========== 事件 ==========

    event StarterMinted(uint256 indexed tokenId, address indexed to);
    event StarterBurned(uint256 indexed tokenId, address indexed by);
    event FamilyPortraitMinted(uint256 indexed tokenId, address indexed to, uint8 season);
    event FamilyPortraitBurned(uint256 indexed tokenId, address indexed by);
    event StarterCatMinted(uint256 indexed tokenId, address indexed to, uint256 indexed realCatId, uint8 stage);
    event CloudAdoptionMinted(uint256 indexed tokenId, address indexed to, uint256 indexed realCatId, uint8 stage);
    event GenesisMinted(uint256 indexed tokenId, address indexed to, uint256 indexed realCatId);
    event CollectionMinted(uint256 indexed tokenId, address indexed to, uint32 seriesId);
    event AuthorizedMinterSet(address indexed minter, bool status);
    event SeasonUpdated(uint8 indexed season, string uri);
    event CollectionSeriesAdded(uint32 indexed seriesId, string name);
    event CollectionSeriesUpdated(uint32 indexed seriesId, bool active);
    event CollectionSeriesURIAdded(uint32 indexed seriesId, string uri);

    // ========== 修饰符 ==========

    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender], "CatNFT: not authorized minter");
        _;
    }

    modifier onlyOwnerOrAdmin() {
        require(msg.sender == owner() || admins[msg.sender], "CatNFT: not authorized");
        _;
    }

    // ========== 构造函数 ==========

    constructor(
        address _catRegistry
    ) ERC721("PurrChain Cat", "PCAT") Ownable(msg.sender) {
        require(_catRegistry != address(0), "CatNFT: zero address");
        catRegistry   = ICatRegistry(_catRegistry);
        currentSeason = 1;
    }

    // ========== Owner / Admin 管理 ==========

    function setAdmin(address _admin, bool _status) external onlyOwner {
        require(_admin != address(0), "CatNFT: zero address");
        admins[_admin] = _status;
        emit AdminUpdated(_admin, _status);
    }

    function setAuthorizedMinter(address _minter, bool _status) external onlyOwner {
        authorizedMinters[_minter] = _status;
        emit AuthorizedMinterSet(_minter, _status);
    }

    function setStarterURI(string calldata _uri) external onlyOwnerOrAdmin { starterURI = _uri; }
    function setGenesisURI(string calldata _uri) external onlyOwnerOrAdmin { genesisURI = _uri; }

    function advanceSeason(string calldata _uri) external onlyOwnerOrAdmin {
        require(bytes(_uri).length > 0, "CatNFT: empty URI");
        currentSeason += 1;
        seasonURIs[currentSeason] = _uri;
        emit SeasonUpdated(currentSeason, _uri);
    }

    function setSeasonURI(uint8 _season, string calldata _uri) external onlyOwnerOrAdmin {
        require(bytes(_uri).length > 0, "CatNFT: empty URI");
        seasonURIs[_season] = _uri;
        emit SeasonUpdated(_season, _uri);
    }

    function addCollectionSeries(string calldata _name, string calldata _uri) external onlyOwnerOrAdmin returns (uint32) {
        require(bytes(_name).length > 0, "CatNFT: empty name");
        uint32 id = seriesCount++;
        collectionSeries[id].name   = _name;
        collectionSeries[id].active = true;
        if (bytes(_uri).length > 0) {
            collectionSeries[id].uris.push(_uri);
        }
        emit CollectionSeriesAdded(id, _name);
        return id;
    }

    /// @notice 向已有系列追加新的 URI（同一系列的不同 NFT 图）
    function addCollectionSeriesURI(uint32 _seriesId, string calldata _uri) external onlyOwnerOrAdmin {
        require(_seriesId < seriesCount, "CatNFT: series not found");
        require(bytes(_uri).length > 0, "CatNFT: empty URI");
        collectionSeries[_seriesId].uris.push(_uri);
        emit CollectionSeriesURIAdded(_seriesId, _uri);
    }

    function setCollectionSeriesActive(uint32 _seriesId, bool _active) external onlyOwnerOrAdmin {
        require(_seriesId < seriesCount, "CatNFT: series not found");
        collectionSeries[_seriesId].active = _active;
        emit CollectionSeriesUpdated(_seriesId, _active);
    }

    // ========== 随机数工具 ==========

    function _rand(address _for) internal returns (uint256) {
        _nonce++;
        return uint256(keccak256(abi.encodePacked(block.prevrandao, _for, _nonce, block.timestamp)));
    }

    /// @dev 从该猫已有 stage URI（stage0~2）中随机选一个用户尚未持有的 stage
    ///      返回 stage 编号（1~3），0 表示全部已集齐
    function _randomUnownedStage(
        address _to,
        uint256 _realCatId,
        ICatRegistry.Cat memory _cat
    ) internal returns (uint8) {
        // 收集用户尚未持有且猫咪已有 URI 的 stage
        uint8[3] memory candidates;
        uint8 count = 0;
        for (uint8 s = 0; s < 3; s++) {
            if (bytes(_cat.stageURIs[s]).length > 0 && !userHasStage[_to][_realCatId][s]) {
                candidates[count] = s + 1; // stage = index + 1
                count++;
            }
        }
        if (count == 0) return 0; // 全部已集齐
        uint256 idx = _rand(_to) % count;
        return candidates[idx];
    }

    /// @dev 从该猫已有 stage URI 中随机选一个（不管用户是否持有，用于 StarterCat）
    function _randomAvailableStage(
        address _to,
        ICatRegistry.Cat memory _cat
    ) internal returns (uint8) {
        uint8[3] memory candidates;
        uint8 count = 0;
        for (uint8 s = 0; s < 3; s++) {
            if (bytes(_cat.stageURIs[s]).length > 0) {
                candidates[count] = s + 1;
                count++;
            }
        }
        require(count > 0, "CatNFT: no stage URI available");
        uint256 idx = _rand(_to) % count;
        return candidates[idx];
    }

    // ========== 用户操作：旧版 Starter ==========

    function claimStarter() external nonReentrant {
        require(!hasClaimedStarter[msg.sender], "CatNFT: already claimed starter");
        hasClaimedStarter[msg.sender] = true;
        uint256 tokenId = _nextTokenId++;
        nftInfo[tokenId] = CatNFTInfo({ nftType: NFTType.Starter, linkedRealCatId: 0, stage: 0, season: 0, seriesId: 0, tokenURIValue: starterURI });
        _safeMint(msg.sender, tokenId);
        emit StarterMinted(tokenId, msg.sender);
    }

    function burn(uint256 _tokenId) external onlyAuthorizedMinter {
        require(nftInfo[_tokenId].nftType == NFTType.Starter, "CatNFT: not a Starter NFT");
        delete nftInfo[_tokenId];
        _burn(_tokenId);
        emit StarterBurned(_tokenId, msg.sender);
    }

    // ========== 用户操作：全家福 ==========

    function claimFamilyPortrait() external nonReentrant {
        require(!hasClaimedFamilyPortrait[msg.sender], "CatNFT: already claimed portrait");
        string memory uri = seasonURIs[currentSeason];
        require(bytes(uri).length > 0, "CatNFT: season URI not set");
        hasClaimedFamilyPortrait[msg.sender] = true;
        uint8 season = currentSeason;
        uint256 tokenId = _nextTokenId++;
        nftInfo[tokenId] = CatNFTInfo({ nftType: NFTType.FamilyPortrait, linkedRealCatId: 0, stage: 0, season: season, seriesId: 0, tokenURIValue: uri });
        _safeMint(msg.sender, tokenId);
        emit FamilyPortraitMinted(tokenId, msg.sender, season);
    }

    function burnFamilyPortrait(uint256 _tokenId) external onlyAuthorizedMinter {
        require(nftInfo[_tokenId].nftType == NFTType.FamilyPortrait, "CatNFT: not a FamilyPortrait NFT");
        delete nftInfo[_tokenId];
        _burn(_tokenId);
        emit FamilyPortraitBurned(_tokenId, msg.sender);
    }

    // ========== 授权合约调用 ==========

    /// @notice GameContract 调用：进入游戏时随机从该猫已有 stage 中 mint 一张
    function mintStarterCat(address _to, uint256 _realCatId) external nonReentrant onlyAuthorizedMinter {
        require(!hasClaimedStarterCat[_to], "CatNFT: already has starter cat");

        ICatRegistry.Cat memory cat = catRegistry.getCat(_realCatId);
        require(cat.shelter != address(0), "CatNFT: cat does not exist");
        require(catRegistry.isShelterApproved(cat.shelter), "CatNFT: shelter not approved");

        uint8 stage = _randomAvailableStage(_to, cat);
        string memory uri = cat.stageURIs[stage - 1];

        hasClaimedStarterCat[_to] = true;
        starterCatOf[_to]         = _realCatId;

        uint256 tokenId = _nextTokenId++;
        nftInfo[tokenId] = CatNFTInfo({
            nftType:         NFTType.StarterCat,
            linkedRealCatId: _realCatId,
            stage:           stage,
            season:          0,
            seriesId:        0,
            tokenURIValue:   uri
        });
        userCatStage[_to][_realCatId]           = stage;
        userCatTokenIds[_to][_realCatId][stage - 1] = tokenId;
        userHasStage[_to][_realCatId][stage - 1]    = true;

        _safeMint(_to, tokenId);
        emit StarterCatMinted(tokenId, _to, _realCatId, stage);
    }

    /// @notice DonationVault 调用：捐款达阈值，随机 mint 用户尚未持有的 stage NFT
    /// @return minted 是否成功 mint（false = 已全部集齐）
    function mintCloudAdoption(address _to, uint256 _realCatId) external nonReentrant onlyAuthorizedMinter returns (bool minted) {
        ICatRegistry.Cat memory cat = catRegistry.getCat(_realCatId);
        require(cat.shelter != address(0), "CatNFT: cat does not exist");
        require(catRegistry.isShelterApproved(cat.shelter), "CatNFT: shelter not approved");

        uint8 stage = _randomUnownedStage(_to, _realCatId, cat);
        if (stage == 0) return false; // 已全部集齐

        string memory uri = cat.stageURIs[stage - 1];
        require(bytes(uri).length > 0, "CatNFT: stage URI missing");

        uint256 tokenId = _nextTokenId++;
        nftInfo[tokenId] = CatNFTInfo({
            nftType:         NFTType.CloudAdopted,
            linkedRealCatId: _realCatId,
            stage:           stage,
            season:          0,
            seriesId:        0,
            tokenURIValue:   uri
        });

        // 更新持有状态
        userHasStage[_to][_realCatId][stage - 1] = true;
        // userCatStage 记录最高已有 stage（用于周券资格等）
        if (stage > userCatStage[_to][_realCatId]) {
            userCatStage[_to][_realCatId] = stage;
        }
        userCatTokenIds[_to][_realCatId][stage - 1] = tokenId;

        _safeMint(_to, tokenId);
        emit CloudAdoptionMinted(tokenId, _to, _realCatId, stage);
        return true;
    }

    /// @notice AdoptionVault 调用：真实领养回访通过，mint Genesis NFT
    function mintGenesis(address _to, uint256 _realCatId) external nonReentrant onlyAuthorizedMinter {
        ICatRegistry.Cat memory cat = catRegistry.getCat(_realCatId);
        require(cat.shelter != address(0), "CatNFT: cat does not exist");
        require(_to != address(0), "CatNFT: invalid address");

        string memory uri = genesisURI;
        if (bytes(uri).length == 0) { uri = cat.stageURIs[3]; }
        if (bytes(uri).length == 0) { uri = cat.stageURIs[2]; }
        require(bytes(uri).length > 0, "CatNFT: no URI for Genesis NFT");

        uint256 tokenId = _nextTokenId++;
        nftInfo[tokenId] = CatNFTInfo({
            nftType:         NFTType.Genesis,
            linkedRealCatId: _realCatId,
            stage:           GENESIS_STAGE,
            season:          0,
            seriesId:        0,
            tokenURIValue:   uri
        });
        userCatStage[_to][_realCatId] = GENESIS_STAGE;

        _safeMint(_to, tokenId);
        emit GenesisMinted(tokenId, _to, _realCatId);
    }

    /// @notice GameContract 调用：出猎带回收藏系列 NFT
    function mintCollection(address _to, uint32 _seriesId) external nonReentrant onlyAuthorizedMinter returns (uint256) {
        require(_seriesId < seriesCount, "CatNFT: series not found");
        CollectionSeries storage series = collectionSeries[_seriesId];
        require(series.active, "CatNFT: series not active");
        require(series.uris.length > 0, "CatNFT: no URI in series");

        // 从系列 URI 数组随机选一个
        _nonce++;
        uint256 idx = uint256(keccak256(abi.encodePacked(block.prevrandao, _to, _nonce))) % series.uris.length;
        string memory uri = series.uris[idx];

        uint256 tokenId = _nextTokenId++;
        nftInfo[tokenId] = CatNFTInfo({
            nftType:         NFTType.Collection,
            linkedRealCatId: 0,
            stage:           0,
            season:          0,
            seriesId:        _seriesId,
            tokenURIValue:   uri
        });
        _safeMint(_to, tokenId);
        emit CollectionMinted(tokenId, _to, _seriesId);
        return tokenId;
    }

    // ========== 查询 ==========

    /// @notice 查询用户对某只猫的 stage 持有情况
    function getUserStages(address _user, uint256 _realCatId) external view returns (bool[3] memory) {
        return userHasStage[_user][_realCatId];
    }

    /// @notice 查询用户某只猫是否已集齐全部可用 stage
    function isCollectionComplete(address _user, uint256 _realCatId) external view returns (bool) {
        ICatRegistry.Cat memory cat = catRegistry.getCat(_realCatId);
        for (uint8 s = 0; s < 3; s++) {
            if (bytes(cat.stageURIs[s]).length > 0 && !userHasStage[_user][_realCatId][s]) {
                return false;
            }
        }
        return true;
    }

    function nftType(uint256 tokenId) external view returns (uint8) {
        ownerOf(tokenId);
        return uint8(nftInfo[tokenId].nftType);
    }

    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        ownerOf(_tokenId);
        return nftInfo[_tokenId].tokenURIValue;
    }

    function getNFTInfo(uint256 _tokenId) external view returns (CatNFTInfo memory) {
        ownerOf(_tokenId);
        return nftInfo[_tokenId];
    }

    function getUserCatTokenIds(address _user, uint256 _realCatId) external view returns (uint256[3] memory) {
        return userCatTokenIds[_user][_realCatId];
    }

    function getCollectionSeries(uint32 _seriesId) external view returns (string memory name, string memory uri, bool active) {
        require(_seriesId < seriesCount, "CatNFT: series not found");
        CollectionSeries storage s = collectionSeries[_seriesId];
        // uri 返回第一个（兼容旧调用方），前端如需完整列表使用 getCollectionSeriesURIs
        string memory firstUri = s.uris.length > 0 ? s.uris[0] : "";
        return (s.name, firstUri, s.active);
    }

    /// @notice 返回某系列的全部 URI 列表
    function getCollectionSeriesURIs(uint32 _seriesId) external view returns (string[] memory) {
        require(_seriesId < seriesCount, "CatNFT: series not found");
        return collectionSeries[_seriesId].uris;
    }

    function getActiveSeriesIds() external view returns (uint32[] memory) {
        uint32 count = 0;
        for (uint32 i = 0; i < seriesCount; i++) {
            if (collectionSeries[i].active) count++;
        }
        uint32[] memory ids = new uint32[](count);
        uint32 idx = 0;
        for (uint32 i = 0; i < seriesCount; i++) {
            if (collectionSeries[i].active) ids[idx++] = i;
        }
        return ids;
    }

    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }
}
