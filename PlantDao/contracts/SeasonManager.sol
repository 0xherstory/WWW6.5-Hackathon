// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SeasonManager is Ownable {
    enum Season { Spring, Summer, Autumn, Winter }

    Season public currentSeason;
    uint256 public seasonStartTime;
    uint256 public seasonDuration = 90 days;

    struct SeasonEffects {
        uint256 growthMultiplier;
        uint256 waterConsumption;
        uint256 breedBonus;
        uint256 diseaseRisk;
        uint256 seedRewardMultiplier;
    }

    mapping(Season => SeasonEffects) public seasonEffects;

    struct DiseaseEvent {
        string name;
        Season peakSeason;
        uint256 triggerThreshold;
        uint256 healthImpact;
        uint256 spreadFactor;
        bool isActive;
    }

    DiseaseEvent[] public diseases;
    mapping(uint256 => mapping(uint256 => bool)) public plantHasDisease;

    event SeasonChanged(Season newSeason, uint256 timestamp);
    event DiseaseTriggered(uint256 indexed plantId, uint256 indexed diseaseId, string name);
    event DiseaseCured(uint256 indexed plantId, uint256 indexed diseaseId);

    constructor() {
        seasonStartTime = block.timestamp;
        currentSeason = Season.Spring;

        seasonEffects[Season.Spring] = SeasonEffects(120, 100, 120, 130, 100);
        seasonEffects[Season.Summer] = SeasonEffects(130, 150, 100, 100, 110);
        seasonEffects[Season.Autumn] = SeasonEffects(90, 80, 70, 80, 120);
        seasonEffects[Season.Winter] = SeasonEffects(60, 60, 40, 50, 80);

        diseases.push(DiseaseEvent("MosaicVirus", Season.Spring, 5, 20, 110, true));
        diseases.push(DiseaseEvent("RootRot", Season.Summer, 7, 15, 105, true));
        diseases.push(DiseaseEvent("PowderyMildew", Season.Autumn, 4, 18, 108, true));
        diseases.push(DiseaseEvent("DownyMildew", Season.Winter, 6, 12, 103, true));
    }

    function setSeason(Season season) external onlyOwner {
        currentSeason = season;
        seasonStartTime = block.timestamp;
        emit SeasonChanged(season, block.timestamp);
    }

    function setSeasonDuration(uint256 duration) external onlyOwner {
        seasonDuration = duration;
    }

    function setSeasonEffects(Season season, SeasonEffects memory effects) external onlyOwner {
        seasonEffects[season] = effects;
    }

    function addDisease(
        string memory name,
        Season peakSeason,
        uint256 threshold,
        uint256 impact,
        uint256 spread
    ) external onlyOwner {
        diseases.push(DiseaseEvent(name, peakSeason, threshold, impact, spread, true));
    }

    function setDiseaseActive(uint256 diseaseId, bool active) external onlyOwner {
        require(diseaseId < diseases.length, "Invalid disease");
        diseases[diseaseId].isActive = active;
    }

    function markPlantInfected(uint256 plantId, uint256 diseaseId) external onlyOwner {
        require(diseaseId < diseases.length, "Invalid disease");
        plantHasDisease[plantId][diseaseId] = true;
        emit DiseaseTriggered(plantId, diseaseId, diseases[diseaseId].name);
    }

    function curePlant(uint256 plantId, uint256 diseaseId) external onlyOwner {
        plantHasDisease[plantId][diseaseId] = false;
        emit DiseaseCured(plantId, diseaseId);
    }

    function getSeasonEffects() external view returns (SeasonEffects memory) {
        return seasonEffects[currentSeason];
    }

    function getDiseaseCount() external view returns (uint256) {
        return diseases.length;
    }

    function getDisease(uint256 id) external view returns (DiseaseEvent memory) {
        require(id < diseases.length, "Invalid disease");
        return diseases[id];
    }

    function isInfected(uint256 plantId, uint256 diseaseId) external view returns (bool) {
        return plantHasDisease[plantId][diseaseId];
    }

    function getActiveDiseases() external view returns (uint256[] memory) {
        uint256 count;
        for (uint256 i = 0; i < diseases.length; i++) {
            if (diseases[i].isActive && diseases[i].peakSeason == currentSeason) {
                count++;
            }
        }
        uint256[] memory active = new uint256[](count);
        uint256 idx;
        for (uint256 i = 0; i < diseases.length; i++) {
            if (diseases[i].isActive && diseases[i].peakSeason == currentSeason) {
                active[idx] = i;
                idx++;
            }
        }
        return active;
    }
}