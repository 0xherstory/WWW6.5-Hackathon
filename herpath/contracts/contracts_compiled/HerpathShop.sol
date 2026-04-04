// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// ─────────────────────────────────────────────────────────────────
// Interface
// ─────────────────────────────────────────────────────────────────

interface IHerPathSBT {
    function hasDomainMilestone(address user, string calldata domain)
        external
        view
        returns (bool);
}

/**
 * @title HerPathShop
 * @author HerPath Team
 * @notice Shop contract for selling Leader NFTs with automatic charity distribution
 * @dev Users must hold specific SBT combinations to purchase Leader NFTs
 */
contract HerPathShop is ERC721, ERC721Enumerable, Ownable, ReentrancyGuard {
    using Strings for uint256;

    // ─────────────────────────────────────────────────────────────────
    // Constants
    // ─────────────────────────────────────────────────────────────────

    uint256 internal constant MAX_LEADERS = 100;
    uint256 internal constant BASIS_POINTS = 10000; // 100%

    // 字符串长度限制（可选，便于前端校验）
    uint256 internal constant MAX_NAME_LENGTH = 50;
    uint256 internal constant MAX_DESCRIPTION_LENGTH = 200;
    uint256 internal constant MAX_DOMAIN_LENGTH = 10;
    uint256 internal constant MAX_IMAGE_LENGTH = 100;

    // ─────────────────────────────────────────────────────────────────
    // State Variables
    // ─────────────────────────────────────────────────────────────────

    IHerPathSBT public sbtContract;
    uint256 private _tokenIdCounter;
    string private _baseTokenURI;

    mapping(uint256 => LeaderNFT) public leaderNFTs;
    Charity[] public charities;

    // ─────────────────────────────────────────────────────────────────
    // Events
    // ─────────────────────────────────────────────────────────────────

    event LeaderNFTPurchased(
        address indexed buyer,
        uint256 indexed leaderId,
        uint256 indexed tokenId,
        uint256 price
    );

    event LeaderNFTAdded(
        uint256 indexed leaderId,
        string name,
        string domain,
        uint256 price
    );

    event CharityAdded(
        address indexed wallet,
        string name,
        uint256 percentage
    );

    event DonationDistributed(
        uint256 indexed leaderId,
        uint256 totalAmount,
        uint256 charityCount
    );

    // ─────────────────────────────────────────────────────────────────
    // Constructor
    // ─────────────────────────────────────────────────────────────────

    constructor() ERC721("HerPath Leaders", "HLEADER") Ownable(msg.sender) {
        _initializeLeaderNFTs();
    }

    // ─────────────────────────────────────────────────────────────────
    // Initialization Functions
    // ─────────────────────────────────────────────────────────────────

    /**
     * @notice Initialize charity recipients//删去了示例地址 上链后由管理员添加
     */


    /**
     * @notice Initialize Leader NFTs
     */
    function _initializeLeaderNFTs() private {
        _addLeader(1, "Frida Kahlo", "Artist", "art", 0.05 ether, 100, "QmXXX/frida.json");
        _addLeader(2, "Georgia O'Keeffe", "Artist", "art", 0.05 ether, 100, "QmXXX/georgia.json");
        _addLeader(3, "Tu Youyou", "Scientist", "science", 0.05 ether, 100, "QmXXX/tu.json");
        _addLeader(4, "Marie Curie", "Scientist", "science", 0.05 ether, 100, "QmXXX/curie.json");
        _addLeader(5, "Ruth Bader Ginsburg", "Judge", "law", 0.05 ether, 100, "QmXXX/rbg.json");
        _addLeader(6, "Sandra Day O'Connor", "Judge", "law", 0.05 ether, 100, "QmXXX/sandra.json");
    }

    /**
     * @notice Internal function to add a leader with optimization
     */
    function _addLeader(
        uint256 id,
        string memory name,
        string memory description,
        string memory domain,
        uint256 price,
        uint256 maxSupply,
        string memory image
    ) private {


        leaderNFTs[id] = LeaderNFT({
            id: id,
            name: name,
            description: description,
            domain: domain,
            price: price,
            active: true,
            maxSupply: maxSupply,
            currentSupply: 0,
            image: image
        });

        emit LeaderNFTAdded(id, name, domain, price);
    }

    // ─────────────────────────────────────────────────────────────────
    // Core Functions
    // ─────────────────────────────────────────────────────────────────

    /**
     * @notice Purchase a Leader NFT with optimized checks
     */
    function purchaseLeaderNFT(uint256 leaderId)
        external
        payable
        nonReentrant
    {
        // Validation helper function to reduce bytecode size
        _validatePurchase(leaderId);

        LeaderNFT storage leader = leaderNFTs[leaderId];

        // Check domain milestone
        bool hasMilestone = sbtContract.hasDomainMilestone(msg.sender, leader.domain);
        require(hasMilestone, "Domain milestone not achieved");

        // Mint the NFT
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;
        leader.currentSupply++;
        _safeMint(msg.sender, newTokenId);

        // Distribute payment to charities
        _distributePayment(leaderId, msg.value);

        emit LeaderNFTPurchased(msg.sender, leaderId, newTokenId, msg.value);
    }

    /**
     * @notice Validate purchase parameters (reused validation logic)
     */
    function _validatePurchase(uint256 leaderId) private view {
        require(leaderId > 0 && leaderId <= MAX_LEADERS, "Invalid leader ID");
        require(address(sbtContract) != address(0), "SBT contract not set");
    }

    /**
     * @notice Distribute payment to charity recipients (optimized)
     */
    function _distributePayment(uint256 leaderId, uint256 totalAmount) private {
        string memory leaderDomain = leaderNFTs[leaderId].domain;
        uint256 distributed = 0;

        // Count domain charities
        uint256 domainCharityCount = 0;
        for (uint256 i = 0; i < charities.length; i++) {
            if (keccak256(abi.encodePacked(charities[i].domain)) == keccak256(abi.encodePacked(leaderDomain))) {
                domainCharityCount++;
            }
        }

        require(domainCharityCount > 0, "No charities for this domain");

        // Distribute to domain-specific charities
        for (uint256 i = 0; i < charities.length; i++) {
            if (keccak256(abi.encodePacked(charities[i].domain)) == keccak256(abi.encodePacked(leaderDomain))) {
                uint256 share = (totalAmount * charities[i].percentage) / BASIS_POINTS;
                if (share > 0) {
                    (bool success, ) = payable(charities[i].wallet).call{value: share}("");
                    require(success, "Charity transfer failed");
                    distributed += share;
                }
            }
        }

        emit DonationDistributed(leaderId, totalAmount, domainCharityCount);

        // Return any remaining dust to buyer
        uint256 remaining = totalAmount - distributed;
        if (remaining > 0) {
            (bool success, ) = payable(msg.sender).call{value: remaining}("");
            require(success, "Refund transfer failed");
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // Admin Functions
    // ─────────────────────────────────────────────────────────────────

    function setSBTContract(address sbtAddress) external onlyOwner {
        require(sbtAddress != address(0), "Invalid address");
        sbtContract = IHerPathSBT(sbtAddress);
    }

    function addLeader(
        uint256 leaderId,
        string calldata name,
        string calldata description,
        string calldata domain,
        uint256 price,
        uint256 maxSupply,
        string calldata image
    ) external onlyOwner {
        require(leaderId > 0 && leaderId <= MAX_LEADERS, "Invalid leader ID");
        require(leaderNFTs[leaderId].id == 0, "Leader already exists");

        _addLeader(leaderId, name, description, domain, price, maxSupply, image);
    }

    function updateLeader(
        uint256 leaderId,
        bool active,
        uint256 price
    ) external onlyOwner {
        require(leaderId > 0 && leaderId <= MAX_LEADERS, "Invalid leader ID");
        require(leaderNFTs[leaderId].id != 0, "Leader does not exist");

        LeaderNFT storage leader = leaderNFTs[leaderId];
        if (price > 0) {
            leader.price = price;
        }
        leader.active = active;
    }

    function setCharity(
        uint256 index,
        address wallet,
        string calldata name,
        string calldata description,
        uint256 percentage,
        string calldata domain
    ) external onlyOwner {
        require(wallet != address(0), "Invalid wallet");
        require(percentage > 0 && percentage <= BASIS_POINTS, "Invalid percentage");

        if (index < charities.length) {
            charities[index] = Charity({
                wallet: wallet,
                name: name,
                description: description,
                percentage: percentage,
                domain: domain
            });
        } else {
            charities.push(Charity({
                wallet: wallet,
                name: name,
                description: description,
                percentage: percentage,
                domain: domain
            }));
        }
        emit CharityAdded(wallet, name, percentage);
    }

    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }

    // ─────────────────────────────────────────────────────────────────
    // View Functions
    // ─────────────────────────────────────────────────────────────────

    function canPurchase(address user, uint256 leaderId)
        external
        view
        returns (bool)
    {
        if (address(sbtContract) == address(0) || leaderId > MAX_LEADERS) {
            return false;
        }

        LeaderNFT storage leader = leaderNFTs[leaderId];
        if (!leader.active || leader.currentSupply >= leader.maxSupply) {
            return false;
        }

        return sbtContract.hasDomainMilestone(user, leader.domain);
    }

    function getLeader(uint256 leaderId)
        external
        view
        returns (
            uint256 id,
            string memory name,
            string memory description,
            string memory domain,
            uint256 price,
            bool active,
            uint256 maxSupply,
            uint256 currentSupply,
            string memory image
        )
    {
        require(leaderId > 0 && leaderId <= MAX_LEADERS, "Invalid leader ID");
        LeaderNFT memory leader = leaderNFTs[leaderId];
        return (
            leader.id,
            leader.name,
            leader.description,
            leader.domain,
            leader.price,
            leader.active,
            leader.maxSupply,
            leader.currentSupply,
            leader.image
        );
    }

    function getAllLeaderIds() external view returns (uint256[] memory) {
        uint256 count = 0;
        // Optimized counting
        for (uint256 i = 1; i <= MAX_LEADERS; i++) {
            if (leaderNFTs[i].id != 0) count++;
        }

        uint256[] memory ids = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= MAX_LEADERS; i++) {
            if (leaderNFTs[i].id != 0) {
                ids[index++] = i;
            }
        }
        return ids;
    }

    function getCharities()
        external
        view
        returns (
            address[] memory wallets,
            string[] memory names,
            uint256[] memory percentages,
            string[] memory domains
        )
    {
        uint256 count = charities.length;
        wallets = new address[](count);
        names = new string[](count);
        percentages = new uint256[](count);
        domains = new string[](count);

        for (uint256 i = 0; i < count; i++) {
            wallets[i] = charities[i].wallet;
            names[i] = charities[i].name;
            percentages[i] = charities[i].percentage;
            domains[i] = string(charities[i].domain);
        }
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        _requireOwned(tokenId);

        return bytes(_baseTokenURI).length > 0
            ? string(abi.encodePacked(_baseTokenURI, tokenId.toString(), ".json"))
            : "";
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

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    receive() external payable {}
}

// ─────────────────────────────────────────────────────────────────
// Structs
// ─────────────────────────────────────────────────────────────────

struct LeaderNFT {
    uint256 id;
    string name;
    string description;
    string domain;
    uint256 price;
    bool active;
    uint256 maxSupply;
    uint256 currentSupply;
    string image;
}

struct Charity {
    address wallet;
    string name;
    string description;
    uint256 percentage;
    string domain;
}