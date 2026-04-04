// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract EsgOracle is Ownable {
    enum Rating {
        B,
        BB,
        BBB,
        A,
        AA,
        AAA
    }

    struct ESGScore {
        uint8 environmental;
        uint8 social;
        uint8 governance;
        uint8 total;
        Rating rating;
        uint64 updatedAt;
        bool severeIncident;
    }

    mapping(address => ESGScore) private scores;

    event ESGScoreUpdated(
        address indexed protocol,
        uint8 environmental,
        uint8 social,
        uint8 governance,
        uint8 total,
        Rating rating,
        uint64 updatedAt
    );

    event ESGIncidentDetected(
        address indexed protocol,
        bool severe,
        string incidentType,
        string details,
        uint64 reportedAt
    );

    constructor(address initialOwner) Ownable(initialOwner) {}

    function updateScore(
        address protocol,
        uint8 environmental,
        uint8 social,
        uint8 governance,
        uint8 total,
        Rating rating
    ) external onlyOwner {
        require(protocol != address(0), "invalid protocol");
        require(environmental <= 25, "E max 25");
        require(social <= 35, "S max 35");
        require(governance <= 40, "G max 40");
        require(total <= 100, "total max 100");

        scores[protocol] = ESGScore({
            environmental: environmental,
            social: social,
            governance: governance,
            total: total,
            rating: rating,
            updatedAt: uint64(block.timestamp),
            severeIncident: false
        });

        emit ESGScoreUpdated(
            protocol,
            environmental,
            social,
            governance,
            total,
            rating,
            uint64(block.timestamp)
        );
    }

    function reportIncident(
        address protocol,
        bool severe,
        string calldata incidentType,
        string calldata details
    ) external onlyOwner {
        require(protocol != address(0), "invalid protocol");

        if (severe) {
            scores[protocol].severeIncident = true;
        }

        emit ESGIncidentDetected(protocol, severe, incidentType, details, uint64(block.timestamp));
    }

    function getScore(address protocol) external view returns (ESGScore memory) {
        return scores[protocol];
    }
}
