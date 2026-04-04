// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PlantNFT
 * @dev 植物 NFT 合约 - 每株植物都是独一无二的 NFT
 */
contract PlantNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    enum Rarity { Common, Rare, Epic, Legendary }
    enum EffortLevel { Easy, Medium, Hard, Expert }

    struct PlantAttributes {
        string species;
        Rarity rarity;
        EffortLevel effortLevel;
        uint256 effortWeight;
        uint256 growthLevel;
        uint256 maxGrowth;
        uint256 health;
        uint256 water;
        uint256 sunlight;
        uint256 soil;
        uint256 lastCareTime;
        uint256 careStreak;
    }

    mapping(uint256 => PlantAttributes) public plantAttributes;

    event PlantMinted(uint256 indexed tokenId, address indexed owner, string species, Rarity rarity);
    event PlantGrew(uint256 indexed tokenId, uint256 newLevel);
    event PlantStatsUpdated(uint256 indexed tokenId, uint256 health, uint256 water, uint256 sunlight);

    constructor() ERC721("Plant DAO", "PLANT") {
        _nextTokenId = 1;
    }

    function mintPlant(
        address to,
        string memory species,
        Rarity rarity,
        EffortLevel effortLevel,
        string memory _tokenURI
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        uint256 weight = _getEffortWeight(rarity);

        plantAttributes[tokenId] = PlantAttributes({
            species: species,
            rarity: rarity,
            effortLevel: effortLevel,
            effortWeight: weight,
            growthLevel: 1,
            maxGrowth: 20,
            health: 80,
            water: 70,
            sunlight: 70,
            soil: 70,
            lastCareTime: block.timestamp,
            careStreak: 0
        });

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        emit PlantMinted(tokenId, to, species, rarity);
        return tokenId;
    }

    function updatePlantStats(
        uint256 tokenId,
        uint256 health,
        uint256 water,
        uint256 sunlight,
        uint256 soil
    ) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Plant does not exist");

        PlantAttributes storage plant = plantAttributes[tokenId];
        plant.health = _clamp(health, 0, 100);
        plant.water = _clamp(water, 0, 100);
        plant.sunlight = _clamp(sunlight, 0, 100);
        plant.soil = _clamp(soil, 0, 100);
        plant.lastCareTime = block.timestamp;

        emit PlantStatsUpdated(tokenId, plant.health, plant.water, plant.sunlight);
    }

    function growPlant(uint256 tokenId) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Plant does not exist");
        PlantAttributes storage plant = plantAttributes[tokenId];
        require(plant.growthLevel < plant.maxGrowth, "Plant reached max growth");
        plant.growthLevel++;
        emit PlantGrew(tokenId, plant.growthLevel);
    }

    function incrementCareStreak(uint256 tokenId) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Plant does not exist");
        plantAttributes[tokenId].careStreak++;
    }

    function getPlantAttributes(uint256 tokenId) external view returns (PlantAttributes memory) {
        require(_ownerOf(tokenId) != address(0), "Plant does not exist");
        return plantAttributes[tokenId];
    }

    function getEffortWeight(uint256 tokenId) external view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Plant does not exist");
        return plantAttributes[tokenId].effortWeight;
    }

    function getTotalPlants() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    function _getEffortWeight(Rarity rarity) internal pure returns (uint256) {
        if (rarity == Rarity.Common) return 1;
        if (rarity == Rarity.Rare) return 15;
        if (rarity == Rarity.Epic) return 2;
        if (rarity == Rarity.Legendary) return 3;
        return 1;
    }

    function _clamp(uint256 value, uint256 min_val, uint256 max_val) internal pure returns (uint256) {
        if (value < min_val) return min_val;
        if (value > max_val) return max_val;
        return value;
    }

    // Required overrides for OZ v4
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