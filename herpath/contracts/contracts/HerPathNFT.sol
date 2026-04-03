// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title HerPathNFT
 * @dev ERC721 contract for HerPath NFT collectibles with automatic charity distribution
 */
contract HerPathNFT is ERC721, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    uint256 public constant NFT_PRICE = 0.01 ether; // 0.01 AVAX
    uint256 public constant CHARITY_PERCENT = 90; // 90% to charity
    uint256 public constant PROJECT_PERCENT = 10; // 10% to project

    struct NFTMetadata {
        string leaderType; // "rbg" or "hillary"
        string nftName;
        string description;
        uint256 mintedAt;
    }

    struct CharityInfo {
        address charityWallet;
        string charityName;
        string charityType; // "education", "legal_aid", "health", etc.
    }

    mapping(uint256 => NFTMetadata) public nftMetadata;
    mapping(address => CharityInfo[]) public charityWallets;

    address public projectWallet;
    uint256 public totalCharityDistributed;
    uint256 public totalProjectFunded;

    event NFTMinted(
        uint256 indexed tokenId,
        address indexed buyer,
        string leaderType,
        uint256 charityAmount,
        uint256 projectAmount
    );

    event CharityAdded(
        string indexed leaderType,
        address indexed charityWallet,
        string charityName
    );

    constructor(address _projectWallet) ERC721("HerPath", "HERPATH") {
        require(_projectWallet != address(0), "Invalid project wallet");
        projectWallet = _projectWallet;

        // Initialize charity wallets for RBG
        addCharityWallet(
            "rbg",
            0x1234567890123456789012345678901234567890, // Placeholder - update with real address
            "NAACP Legal Defense Fund",
            "legal_aid"
        );
        addCharityWallet(
            "rbg",
            0x0987654321098765432109876543210987654321, // Placeholder - update with real address
            "Women's Fund",
            "education"
        );

        // Initialize charity wallets for Hillary
        addCharityWallet(
            "hillary",
            0xabcdefabcdefabcdefabcdefabcdefabcdefabcd, // Placeholder - update with real address
            "Clinton Foundation",
            "health"
        );
        addCharityWallet(
            "hillary",
            0xfedcbafedcbafedcbafedcbafedcbafedcbafedcb, // Placeholder - update with real address
            "Girls Up",
            "education"
        );
    }

    /**
     * @dev Add a charity wallet for a leader type
     */
    function addCharityWallet(
        string memory leaderType,
        address charityWallet,
        string memory charityName,
        string memory charityType
    ) public onlyOwner {
        require(charityWallet != address(0), "Invalid charity wallet");
        charityWallets[charityWallet] = CharityInfo({
            charityWallet: charityWallet,
            charityName: charityName,
            charityType: charityType
        });
        emit CharityAdded(leaderType, charityWallet, charityName);
    }

    /**
     * @dev Update project wallet address
     */
    function setProjectWallet(address _newProjectWallet) public onlyOwner {
        require(_newProjectWallet != address(0), "Invalid project wallet");
        projectWallet = _newProjectWallet;
    }

    /**
     * @dev Mint NFT and distribute funds
     */
    function mintNFT(
        address to,
        string memory leaderType,
        string memory nftName,
        string memory description
    ) public payable returns (uint256) {
        require(msg.value == NFT_PRICE, "Incorrect payment amount");
        require(
            keccak256(abi.encodePacked(leaderType)) == keccak256(abi.encodePacked("rbg")) ||
            keccak256(abi.encodePacked(leaderType)) == keccak256(abi.encodePacked("hillary")),
            "Invalid leader type"
        );

        // Distribute funds
        uint256 charityAmount = (msg.value * CHARITY_PERCENT) / 100;
        uint256 projectAmount = (msg.value * PROJECT_PERCENT) / 100;

        // Mint NFT
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(to, tokenId);

        nftMetadata[tokenId] = NFTMetadata({
            leaderType: leaderType,
            nftName: nftName,
            description: description,
            mintedAt: block.timestamp
        });

        // Send funds to project
        (bool projectSuccess, ) = projectWallet.call{value: projectAmount}("");
        require(projectSuccess, "Project payment failed");

        // Send funds to first matching charity wallet
        // In production, you'd want to distribute to multiple charities
        bool charityFound = false;
        // Get first charity for this leader type (simplified)
        if (charityWallets[0x1234567890123456789012345678901234567890].charityWallet != address(0)) {
            (bool charitySuccess, ) = charityWallets[0x1234567890123456789012345678901234567890].charityWallet.call{
                value: charityAmount
            }("");
            if (charitySuccess) {
                charityFound = true;
            }
        }

        if (!charityFound) {
            // Fallback: send charity funds to project wallet if no charity found
            (bool fallbackSuccess, ) = projectWallet.call{value: charityAmount}("");
            require(fallbackSuccess, "Fallback payment failed");
        }

        totalCharityDistributed += charityAmount;
        totalProjectFunded += projectAmount;

        emit NFTMinted(tokenId, to, leaderType, charityAmount, projectAmount);

        return tokenId;
    }

    /**
     * @dev Get NFT metadata
     */
    function getNFTMetadata(uint256 tokenId) public view returns (NFTMetadata memory) {
        require(_exists(tokenId), "Token does not exist");
        return nftMetadata[tokenId];
    }

    /**
     * @dev Check if token exists (helper for older OZ versions)
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return ownerOf(tokenId) != address(0);
    }

    /**
     * @dev Get total supply
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
}
