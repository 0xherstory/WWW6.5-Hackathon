// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title HerPathSBT
 * @dev Soulbound Token contract for HerPath milestone badges
 * Soulbound tokens are non-transferable achievements tied to player addresses
 */
contract HerPathSBT is ERC721, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    struct SBTMetadata {
        string sbtId; // "rbg_eq_l5", "rbg_leg_l5", etc.
        string sbtName; // "平权意识 Lv.5"
        string sbtIcon; // "✦"
        string leaderType; // "rbg" or "hillary"
        string branchName; // "equality", "legality", "impact", "resilience"
        uint256 level; // 1-5
        string situation; // Narrative text
        string flavor; // Flavor text
        uint256 mintedAt;
    }

    mapping(uint256 => SBTMetadata) public sbtMetadata;
    mapping(address => mapping(string => bool)) public playerSBTs; // Track which SBTs player has
    mapping(address => uint256[]) public playerTokenIds; // Track token IDs for a player

    event SBTMinted(
        uint256 indexed tokenId,
        address indexed player,
        string indexed sbtId,
        string sbtName,
        string leaderType,
        uint256 level
    );

    event SBTRevoked(uint256 indexed tokenId, address indexed player);

    constructor() ERC721("HerPath Achievement", "HPATH-SBT") {}

    /**
     * @dev Mint an SBT for a player
     */
    function mintSBT(
        address player,
        string memory sbtId,
        string memory sbtName,
        string memory sbtIcon,
        string memory leaderType,
        string memory branchName,
        uint256 level,
        string memory situation,
        string memory flavor
    ) public onlyOwner returns (uint256) {
        require(player != address(0), "Invalid player address");
        require(level >= 1 && level <= 5, "Invalid level");

        // Check if player already has this SBT
        require(!playerSBTs[player][sbtId], "Player already has this SBT");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(player, tokenId);

        sbtMetadata[tokenId] = SBTMetadata({
            sbtId: sbtId,
            sbtName: sbtName,
            sbtIcon: sbtIcon,
            leaderType: leaderType,
            branchName: branchName,
            level: level,
            situation: situation,
            flavor: flavor,
            mintedAt: block.timestamp
        });

        playerSBTs[player][sbtId] = true;
        playerTokenIds[player].push(tokenId);

        emit SBTMinted(tokenId, player, sbtId, sbtName, leaderType, level);

        return tokenId;
    }

    /**
     * @dev Override transfer functions to prevent transfers (Soulbound)
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public pure override {
        revert("Soulbound tokens cannot be transferred");
    }

    /**
     * @dev Override safeTransferFrom to prevent transfers
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public pure override {
        revert("Soulbound tokens cannot be transferred");
    }

    /**
     * @dev Override safeTransferFrom with data to prevent transfers
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public pure override {
        revert("Soulbound tokens cannot be transferred");
    }

    /**
     * @dev Revoke an SBT (admin only, for error recovery)
     */
    function revokeSBT(uint256 tokenId) public onlyOwner {
        address player = ownerOf(tokenId);
        SBTMetadata memory metadata = sbtMetadata[tokenId];

        _burn(tokenId);
        playerSBTs[player][metadata.sbtId] = false;

        emit SBTRevoked(tokenId, player);
    }

    /**
     * @dev Get SBT metadata
     */
    function getSBTMetadata(uint256 tokenId) public view returns (SBTMetadata memory) {
        require(_exists(tokenId), "Token does not exist");
        return sbtMetadata[tokenId];
    }

    /**
     * @dev Check if player has a specific SBT
     */
    function hasSBT(address player, string memory sbtId) public view returns (bool) {
        return playerSBTs[player][sbtId];
    }

    /**
     * @dev Get all token IDs for a player
     */
    function getPlayerTokenIds(address player) public view returns (uint256[] memory) {
        return playerTokenIds[player];
    }

    /**
     * @dev Get SBT count for a player
     */
    function getPlayerSBTCount(address player) public view returns (uint256) {
        return playerTokenIds[player].length;
    }

    /**
     * @dev Check if token exists (helper)
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        try this.ownerOf(tokenId) returns (address) {
            return true;
        } catch {
            return false;
        }
    }

    /**
     * @dev Get total supply
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /**
     * @dev Override _burn to include cleanup
     */
    function _burn(uint256 tokenId) internal override {
        super._burn(tokenId);
    }
}
