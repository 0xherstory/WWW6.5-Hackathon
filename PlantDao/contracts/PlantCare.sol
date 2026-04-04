// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PlantNFT.sol";
import "./SeedToken.sol";
import "./GardenEnvironment.sol";
import "./SeasonManager.sol";
import "./GlobalEcology.sol";

/**
 * @title PlantCare
 * @dev 植物照顾核心合约
 * - 6种护理动作: 浇水/施肥/换盆/拍照/打药
 * - 花园环境加成 + 季节效果 + 生态倍率
 */
contract PlantCare is Ownable {
    PlantNFT public plantNFT;
    SeedToken public seedToken;
    GardenEnvironment public gardenEnv;
    SeasonManager public seasonManager;
    GlobalEcology public globalEcology;

    uint256 public constant CARE_COOLDOWN = 4 hours;

    enum CareAction { Water, Fertilize, Repot, Photo, Medicine }

    struct CareRecord {
        address caregiver;
        uint256 plantId;
        CareAction action;
        uint256 timestamp;
        uint256 reward;
        uint256 quality;
    }

    CareRecord[] public careHistory;
    mapping(uint256 => mapping(CareAction => uint256)) public lastCareTime;
    mapping(address => uint256) public userTotalCares;
    mapping(address => uint256) public userStreak;

    event PlantCared(uint256 indexed plantId, address indexed caregiver, CareAction action, uint256 reward, uint256 quality);

    constructor(
        address _plantNFT,
        address _seedToken,
        address _gardenEnv,
        address _seasonManager,
        address _globalEcology
    ) {
        plantNFT = PlantNFT(_plantNFT);
        seedToken = SeedToken(_seedToken);
        gardenEnv = GardenEnvironment(_gardenEnv);
        seasonManager = SeasonManager(_seasonManager);
        globalEcology = GlobalEcology(_globalEcology);
    }

    function water(uint256 plantId, uint256 quality) external {
        _performCare(plantId, CareAction.Water, quality, seedToken.WATER_REWARD());
        PlantNFT.PlantAttributes memory plant = plantNFT.getPlantAttributes(plantId);
        uint256 seasonWater = seasonManager.getSeasonEffects().waterConsumption;
        uint256 waterAdd = (20 * 100) / seasonWater;
        uint256 newWater = _min(plant.water + waterAdd, 100);
        uint256 newHealth = _min(plant.health + (newWater - plant.water) / 5, 100);
        plantNFT.updatePlantStats(plantId, newHealth, newWater, plant.sunlight, plant.soil);
    }

    function fertilize(uint256 plantId, uint256 quality) external {
        _performCare(plantId, CareAction.Fertilize, quality, seedToken.FERTILIZE_REWARD());
        PlantNFT.PlantAttributes memory plant = plantNFT.getPlantAttributes(plantId);
        uint256 newSoil = _min(plant.soil + 25, 100);
        uint256 newHealth = _min(plant.health + (newSoil - plant.soil) / 5, 100);
        plantNFT.updatePlantStats(plantId, newHealth, plant.water, plant.sunlight, newSoil);
    }

    function repot(uint256 plantId, uint256 quality) external {
        _performCare(plantId, CareAction.Repot, quality, seedToken.REPOT_REWARD());
        PlantNFT.PlantAttributes memory plant = plantNFT.getPlantAttributes(plantId);
        uint256 newHealth = _min(plant.health + 15, 100);
        plantNFT.updatePlantStats(plantId, newHealth, plant.water, plant.sunlight, 100);
        if (plant.health > 70) {
            uint256 growthBonus = seasonManager.getSeasonEffects().growthMultiplier;
            if (growthBonus >= 100) {
                plantNFT.growPlant(plantId);
            }
        }
    }

    function takePhoto(uint256 plantId, uint256 quality) external {
        _performCare(plantId, CareAction.Photo, quality, seedToken.PHOTO_REWARD());
    }

    function applyMedicine(uint256 plantId, uint256 quality) external {
        _performCare(plantId, CareAction.Medicine, quality, seedToken.MEDICINE_REWARD());
        PlantNFT.PlantAttributes memory plant = plantNFT.getPlantAttributes(plantId);
        // 打药恢复健康, 清除病害影响
        uint256 newHealth = _min(plant.health + 20, 100);
        plantNFT.updatePlantStats(plantId, newHealth, plant.water, plant.sunlight, plant.soil);
    }

    event PlantMintedForUser(uint256 indexed plantId, address indexed owner, string species);

    /// @notice 允许任何用户铸造一个新的植物 NFT
    function mintPlantForUser(
        string calldata species,
        uint8 rarity,
        uint8 effortLevel,
        string calldata tokenURI
    ) external returns (uint256) {
        PlantNFT.MintPlantParams memory params = PlantNFT.MintPlantParams({
            to: msg.sender,
            species: species,
            rarity: PlantNFT.Rarity(rarity),
            effortLevel: PlantNFT.EffortLevel(effortLevel),
            tokenURI: tokenURI
        });
        uint256 tokenId = plantNFT.mintPlant(params);

        // 更新花园环境
        gardenEnv.recordDailyCare(msg.sender);

        // 更新全局生态
        globalEcology.recordCareAction();

        emit PlantMintedForUser(tokenId, msg.sender, species);
        return tokenId;
    }

    function _performCare(uint256 plantId, CareAction action, uint256 quality, uint256 baseReward) internal {
        require(plantNFT.ownerOf(plantId) == msg.sender, "Not the plant owner");
        require(block.timestamp >= lastCareTime[plantId][action] + CARE_COOLDOWN, "Care action on cooldown");

        quality = _clamp(quality, 50, 200);
        uint256 effortWeight = plantNFT.getEffortWeight(plantId);
        uint256 consistency = _min(userStreak[msg.sender], 50);

        // 基础奖励 = Base × Effort × Quality × Consistency
        uint256 reward = seedToken.calculateReward(baseReward, effortWeight, quality, consistency);

        // 花园环境加成
        uint256 gardenBonus = gardenEnv.getGardenBonus(msg.sender);
        reward = (reward * gardenBonus) / 100;

        // 生态倍率加成
        uint256 ecologyMult = seedToken.ecologyMultiplier();
        reward = (reward * ecologyMult) / 100;

        lastCareTime[plantId][action] = block.timestamp;
        string memory actionName = _actionToString(action);

        // 发放奖励（SeedToken 内部处理每日上限）
        seedToken.earnReward(msg.sender, reward, actionName);

        userTotalCares[msg.sender]++;
        plantNFT.incrementCareStreak(plantId);

        // 更新花园环境
        gardenEnv.recordDailyCare(msg.sender);

        // 更新全局生态
        globalEcology.recordCareAction();

        careHistory.push(CareRecord(msg.sender, plantId, action, block.timestamp, reward, quality));
        emit PlantCared(plantId, msg.sender, action, reward, quality);
    }

    // ============ View Functions ============

    function getCareHistoryLength() external view returns (uint256) { return careHistory.length; }
    function getCareRecord(uint256 index) external view returns (CareRecord memory) { return careHistory[index]; }
    function canPerformCare(uint256 plantId, CareAction action) external view returns (bool) { return block.timestamp >= lastCareTime[plantId][action] + CARE_COOLDOWN; }

    function _actionToString(CareAction action) internal pure returns (string memory) {
        if (action == CareAction.Water) return "water";
        if (action == CareAction.Fertilize) return "fertilize";
        if (action == CareAction.Repot) return "repot";
        if (action == CareAction.Photo) return "photo";
        return "medicine";
    }

    function _min(uint256 a, uint256 b) internal pure returns (uint256) { return a < b ? a : b; }
    function _clamp(uint256 v, uint256 lo, uint256 hi) internal pure returns (uint256) { if (v < lo) return lo; if (v > hi) return hi; return v; }
}