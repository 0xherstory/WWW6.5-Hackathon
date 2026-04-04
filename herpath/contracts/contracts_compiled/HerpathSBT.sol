// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title HerPathSBT
 * @author HerPath Team
 * @notice Soulbound Token (SBT) contract for HerPath game achievements
 * @dev These tokens are non-transferable and represent player achievements
 */
contract HerPathSBT is ERC721, ERC721Enumerable, Ownable {
    using Strings for uint256;

    // ─────────────────────────────────────────────────────────────────
    // State Variables
    // ─────────────────────────────────────────────────────────────────

    /// @notice Token ID counter
    uint256 private _tokenIdCounter;

    /// @notice Base URI for token metadata
    string private _baseTokenURI;

    /// @notice Mapping to track minted SBTs per user per type
    mapping(address => mapping(bytes32 => bool)) public hasMinted;

    /// @notice Mapping from SBT ID to attribute threshold
    mapping(bytes32 => uint256) public attributeThresholds;

    /// @notice Mapping from user to attribute values (tracked off-chain, verified on-chain)
    mapping(address => mapping(bytes32 => uint256)) public userAttributes;

    // ─────────────────────────────────────────────────────────────────
    // SBT Type Definitions
    // ─────────────────────────────────────────────────────────────────

    /// @notice SBT Type structure
    struct SBTType {
        bytes32 id;           // Unique identifier (keccak256 of name)
        string name;          // Display name
        string symbol;        // Short symbol
        string domain;        // art/science/law
        string attribute;     // creativity/resilience/curiosity/rigor/justice/courage
        uint256 threshold;    // Required attribute value to mint
        string icon;          // Icon character
        string color;         // Display color (hex)
    }

    /// @notice All SBT types
    SBTType[6] public sbtTypes;

    // ─────────────────────────────────────────────────────────────────
    // Events
    // ─────────────────────────────────────────────────────────────────

    event SBTMinted(
        address indexed user,
        uint256 tokenId,
        bytes32 sbtType,
        uint256 attributeValue
    );

    event AttributeUpdated(
        address indexed user,
        bytes32 attribute,
        uint256 value
    );

    // ─────────────────────────────────────────────────────────────────
    // Constructor
    // ─────────────────────────────────────────────────────────────────

    constructor() ERC721("HerPath Achievement", "HPATH") Ownable(msg.sender) {
        // Initialize SBT types
        _initSBTTypes();
    }

    /**
     * @notice Initialize all SBT types
     */
    function _initSBTTypes() private {
        // Art Domain
        sbtTypes[0] = SBTType({
            id: keccak256("spark"),
            name: unicode"灵感火花",
            symbol: "SPARK",
            domain: "art",
            attribute: "creativity",
            threshold: 5,
            icon: unicode"✦",
            color: "#FF6B9D"
        });

        sbtTypes[1] = SBTType({
            id: keccak256("brush"),
            name: unicode"执着画笔",
            symbol: "BRUSH",
            domain: "art",
            attribute: "resilience",
            threshold: 5,
            icon: unicode"⊘",
            color: "#FFB347"
        });

        // Science Domain
        sbtTypes[2] = SBTType({
            id: keccak256("explorer"),
            name: unicode"探索者徽章",
            symbol: "EXPLORER",
            domain: "science",
            attribute: "curiosity",
            threshold: 5,
            icon: unicode"◎",
            color: "#00D4FF"
        });

        sbtTypes[3] = SBTType({
            id: keccak256("experiment"),
            name: unicode"实验精神",
            symbol: "EXPERIMENT",
            domain: "science",
            attribute: "rigor",
            threshold: 5,
            icon: unicode"⊕",
            color: "#50FA7B"
        });

        // Law Domain
        sbtTypes[4] = SBTType({
            id: keccak256("scale"),
            name: unicode"天平守护",
            symbol: "SCALE",
            domain: "law",
            attribute: "justice",
            threshold: 5,
            icon: unicode"⚖",
            color: "#FFD700"
        });

        sbtTypes[5] = SBTType({
            id: keccak256("warrior"),
            name: unicode"无畏斗士",
            symbol: "WARRIOR",
            domain: "law",
            attribute: "courage",
            threshold: 5,
            icon: unicode"⚡",
            color: "#FF79C6"
        });

        // Set thresholds
        for (uint256 i = 0; i < sbtTypes.length; i++) {
            attributeThresholds[sbtTypes[i].id] = sbtTypes[i].threshold;
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // Core Functions
    // ─────────────────────────────────────────────────────────────────

    /**
     * @notice Mint an SBT based on achievement
     * @param sbtIndex Index of the SBT type (0-5)
     * @param attributeValue Current attribute value of the user
     */
    function mintSBT(uint256 sbtIndex, uint256 attributeValue) external {
        require(sbtIndex < 6, "Invalid SBT index");
        SBTType memory sbt = sbtTypes[sbtIndex];

        require(attributeValue >= sbt.threshold, "Attribute threshold not met");
        require(!hasMinted[msg.sender][sbt.id], "Already minted this SBT");

        hasMinted[msg.sender][sbt.id] = true;
        userAttributes[msg.sender][keccak256(bytes(sbt.attribute))] = attributeValue;

        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        _safeMint(msg.sender, newTokenId);

        emit SBTMinted(msg.sender, newTokenId, sbt.id, attributeValue);
    }

    /**
     * @notice Admin function to batch mint SBTs (for testing/airdrop)
     * @param users Addresses to mint to
     * @param sbtIndexes SBT type indexes for each user
     */
    function batchMintSBT(
        address[] calldata users,
        uint256[] calldata sbtIndexes
    ) external onlyOwner {
        require(users.length == sbtIndexes.length, "Length mismatch");

        for (uint256 i = 0; i < users.length; i++) {
            uint256 sbtIndex = sbtIndexes[i];
            require(sbtIndex < 6, "Invalid SBT index");

            SBTType memory sbt = sbtTypes[sbtIndex];
            address user = users[i];

            if (!hasMinted[user][sbt.id]) {
                hasMinted[user][sbt.id] = true;

                _tokenIdCounter++;
                uint256 newTokenId = _tokenIdCounter;

                _safeMint(user, newTokenId);

                emit SBTMinted(user, newTokenId, sbt.id, sbt.threshold);
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // View Functions
    // ─────────────────────────────────────────────────────────────────

    /**
     * @notice Check if user has minted specific SBT
     * @param user User address
     * @param sbtIndex SBT type index
     */
    function hasSBT(address user, uint256 sbtIndex)
        external
        view
        returns (bool)
    {
        require(sbtIndex < 6, "Invalid SBT index");
        return hasMinted[user][sbtTypes[sbtIndex].id];
    }

    /**
     * @notice Get all SBTs minted by a user
     * @param user User address
     * @return Array of booleans indicating which SBTs are owned
     */
    function getUserSBTs(address user)
        external
        view
        returns (bool[6] memory)
    {
        bool[6] memory result;
        for (uint256 i = 0; i < 6; i++) {
            result[i] = hasMinted[user][sbtTypes[i].id];
        }
        return result;
    }

    /**
     * @notice Check if user has unlocked a domain milestone (all SBTs in a domain)
     * @param user User address
     * @param domain Domain name (art/science/law)
     */
    function hasDomainMilestone(address user, string calldata domain)
        external
        view
        returns (bool)
    {
        for (uint256 i = 0; i < 6; i++) {
            if (
                keccak256(bytes(sbtTypes[i].domain)) == keccak256(bytes(domain))
            ) {
                if (!hasMinted[user][sbtTypes[i].id]) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * @notice Get SBT type details
     * @param sbtIndex SBT type index
     */
    function getSBTType(uint256 sbtIndex)
        external
        view
        returns (
            string memory name,
            string memory symbol,
            string memory domain,
            string memory attribute,
            uint256 threshold,
            string memory icon,
            string memory color
        )
    {
        require(sbtIndex < 6, "Invalid SBT index");
        SBTType memory sbt = sbtTypes[sbtIndex];
        return (
            sbt.name,
            sbt.symbol,
            sbt.domain,
            sbt.attribute,
            sbt.threshold,
            sbt.icon,
            sbt.color
        );
    }

    /**
     * @notice Count SBTs owned by an address
     * @param owner Address to check
     */
    function countUserSBTs(address owner) external view returns (uint256) {
        uint256 count = 0;
        uint256 balance = balanceOf(owner);
        for (uint256 i = 0; i < balance; i++) {
            count++;
        }
        return count;
    }

    // ─────────────────────────────────────────────────────────────────
    // Metadata
    // ─────────────────────────────────────────────────────────────────

    /**
     * @notice Set base URI for token metadata
     * @param baseURI New base URI
     */
    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    /**
     * @notice Get token URI
     * @param tokenId Token ID
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(ownerOf(tokenId) != address(0), "ERC721Metadata: URI query for nonexistent token");

        // Determine SBT type from tokenId (modulo 6)
        uint256 sbtIndex = (tokenId - 1) % 6;

        return
            bytes(_baseTokenURI).length > 0
                ? string(
                    abi.encodePacked(
                        _baseTokenURI,
                        sbtIndex.toString(),
                        ".json"
                    )
                )
                : "";
    }

    // ─────────────────────────────────────────────────────────────────
    // Override Transfer Functions (SBT is non-transferable)
    // ─────────────────────────────────────────────────────────────────

    /**
     * @dev Override transfer functions to make tokens non-transferable
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        address from = _ownerOf(tokenId);

        // Allow minting (from == address(0))
        if (from != address(0)) {
            // Prevent all transfers
            revert("SBT: Soulbound token cannot be transferred");
        }

        return super._update(to, tokenId, auth);
    }

    // ─────────────────────────────────────────────────────────────────
    // Required Overrides
    // ─────────────────────────────────────────────────────────────────

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
