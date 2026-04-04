// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PlantOffspring
 * @dev 植物繁殖 NFT - 扦插/分株/种子的后代证明
 * - 母株链上追溯
 * - 照顾评分继承
 * - 繁殖受季节/健康/环境影响
 */
contract PlantOffspring is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    enum ReproductionMethod { Cutting, Division, Seed }
    enum Rarity { Common, Rare, Epic, Legendary }

    struct OffspringAttributes {
        uint256 parentTokenId;        // 母株 PlantNFT ID
        uint256 parentOffspringId;    // 如果母株也是Offspring, 记录其ID (0=无)
        ReproductionMethod method;
        uint256 generation;           // 第几代
        uint256 careScore;            // 照顾评分 (0-100)
        uint256 inheritedScore;       // 继承的母株评分
        string species;
        Rarity rarity;
        uint256 health;
        uint256 water;
        uint256 sunlight;
        uint256 soil;
        uint256 growthLevel;
        uint256 birthTime;
        uint256 lastCareTime;
        bool isActive;
    }

    mapping(uint256 => OffspringAttributes) public offspringAttributes;
    mapping(uint256 => uint256[]) public parentToOffspring; // parentId => offspringIds

    // 繁殖参数
    uint256 public breedCooldown = 30 days;
    mapping(uint256 => uint256) public lastBreedTime; // parentId => lastBreedTime
    uint256 public minParentHealth = 60;

    // 评分继承比例 (以100为基准)
    uint256 public cuttingInherit = 70;   // 扦插 70%
    uint256 public divisionInherit = 80;  // 分株 80%
    uint256 public seedInherit = 60;      // 种子 60% (但有随机暴击)

    event OffspringMinted(uint256 indexed offspringId, uint256 indexed parentId, ReproductionMethod method, address owner);
    event CareScoreUpdated(uint256 indexed offspringId, uint256 newScore);

    constructor() ERC721("Plant Offspring", "POFF") {
        _nextTokenId = 1;
    }

    struct MintParams {
        address to;
        uint256 parentTokenId;
        uint256 parentOffspringId;
        ReproductionMethod method;
        uint256 parentCareScore;
        uint256 generation;
        string species;
        string tokenURI;
    }

    function mintOffspring(MintParams calldata params) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;

        uint256 inheritedScore = _calcInheritedScore(params.method, params.parentCareScore);
        Rarity rarity = _calcRarity(inheritedScore);

        _createOffspring(tokenId, params, inheritedScore, rarity);
        parentToOffspring[params.parentTokenId].push(tokenId);

        _safeMint(params.to, tokenId);
        _setTokenURI(tokenId, params.tokenURI);

        emit OffspringMinted(tokenId, params.parentTokenId, params.method, params.to);
        return tokenId;
    }

    function _calcInheritedScore(ReproductionMethod method, uint256 parentCareScore) internal view returns (uint256) {
        uint256 inheritRate;
        if (method == ReproductionMethod.Cutting) inheritRate = cuttingInherit;
        else if (method == ReproductionMethod.Division) inheritRate = divisionInherit;
        else inheritRate = seedInherit;
        return (parentCareScore * inheritRate) / 100;
    }

    function _calcRarity(uint256 inheritedScore) internal pure returns (Rarity) {
        if (inheritedScore >= 90) return Rarity.Legendary;
        if (inheritedScore >= 75) return Rarity.Epic;
        if (inheritedScore >= 50) return Rarity.Rare;
        return Rarity.Common;
    }

    function _createOffspring(uint256 tokenId, MintParams calldata params, uint256 inheritedScore, Rarity rarity) internal {
        OffspringAttributes storage o = offspringAttributes[tokenId];
        o.parentTokenId = params.parentTokenId;
        o.parentOffspringId = params.parentOffspringId;
        o.method = params.method;
        o.generation = params.generation;
        o.careScore = inheritedScore;
        o.inheritedScore = inheritedScore;
        o.species = params.species;
        o.rarity = rarity;
        o.health = 70;
        o.water = 60;
        o.sunlight = 60;
        o.soil = 60;
        o.growthLevel = 1;
        o.birthTime = block.timestamp;
        o.lastCareTime = block.timestamp;
        o.isActive = true;
    }

    function updateCareScore(uint256 offspringId, uint256 newScore) external onlyOwner {
        offspringAttributes[offspringId].careScore = _clamp(newScore, 0, 100);
        offspringAttributes[offspringId].lastCareTime = block.timestamp;
        emit CareScoreUpdated(offspringId, newScore);
    }

    function updateOffspringStats(uint256 offspringId, uint256 health, uint256 water, uint256 sunlight, uint256 soil) external onlyOwner {
        OffspringAttributes storage o = offspringAttributes[offspringId];
        o.health = _clamp(health, 0, 100);
        o.water = _clamp(water, 0, 100);
        o.sunlight = _clamp(sunlight, 0, 100);
        o.soil = _clamp(soil, 0, 100);
        o.lastCareTime = block.timestamp;
    }

    function growOffspring(uint256 offspringId) external onlyOwner {
        offspringAttributes[offspringId].growthLevel++;
    }

    function setBreedCooldown(uint256 cooldown) external onlyOwner {
        breedCooldown = cooldown;
    }

    function setMinParentHealth(uint256 health) external onlyOwner {
        minParentHealth = health;
    }

    function setInheritRates(uint256 cutting, uint256 division, uint256 seed) external onlyOwner {
        cuttingInherit = cutting;
        divisionInherit = division;
        seedInherit = seed;
    }

    function recordBreedTime(uint256 parentTokenId) external onlyOwner {
        lastBreedTime[parentTokenId] = block.timestamp;
    }

    function canBreed(uint256 parentTokenId) external view returns (bool) {
        return block.timestamp >= lastBreedTime[parentTokenId] + breedCooldown;
    }

    function getOffspringOf(uint256 parentId) external view returns (uint256[] memory) {
        return parentToOffspring[parentId];
    }

    function getOffspringAttributes(uint256 tokenId) external view returns (OffspringAttributes memory) {
        return offspringAttributes[tokenId];
    }

    function getTotalOffspring() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    function _clamp(uint256 v, uint256 lo, uint256 hi) internal pure returns (uint256) {
        if (v < lo) return lo;
        if (v > hi) return hi;
        return v;
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}