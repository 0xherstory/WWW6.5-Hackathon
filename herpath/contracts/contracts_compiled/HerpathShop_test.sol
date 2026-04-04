// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
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
    // State Variables
    // ─────────────────────────────────────────────────────────────────

    /// @notice Reference to the SBT contract
    IHerPathSBT public sbtContract;

    /// @notice Token ID counter
    uint256 private _tokenIdCounter;

    /// @notice Base URI for token metadata
    string private _baseTokenURI;

    /// @notice Leader NFT structure
    struct LeaderNFT {
        uint256 id;                   // Leader ID
        string name;                  // Leader name
        string description;           // Leader description
        string domain;                // Required domain (art/science/law)
        uint256 price;                // Price in wei
        bool active;                  // Is available for purchase
        uint256 maxSupply;            // Maximum supply
        uint256 currentSupply;        // Current minted count
        string image;                 // Image URI
    }

    /// @notice Charity recipient structure
    struct Charity {
        address wallet;               // Charity wallet address
        string name;                  // Charity name
        string description;           // Description of cause
        uint256 percentage;           // Share percentage (basis points, 10000 = 100%)
        string domain;                // Associated domain (empty if general)
    }

    /// @notice Mapping of leader ID to Leader NFT data
    mapping(uint256 => LeaderNFT) public leaderNFTs;

    /// @notice Array of charity recipients
    Charity[] public charities;

    /// @notice Total number of leaders
    uint256 public constant MAX_LEADERS = 100;

    // ─────────────────────────────────────────────────────────────────
    // Events
    // ─────────────────────────────────────────────────────────────────

    event LeaderNFTPurchased(
        address indexed buyer,
        uint256 leaderId,
        uint256 tokenId,
        uint256 price
    );

    event LeaderNFTAdded(
        uint256 leaderId,
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
        uint256 leaderId,
        uint256 totalAmount,
        uint256 charityCount
    );

    // ─────────────────────────────────────────────────────────────────
    // Constructor
    // ─────────────────────────────────────────────────────────────────

    constructor() ERC721("HerPath Leaders", "HLEADER") Ownable(msg.sender) {
        _initializeCharities();
        _initializeLeaderNFTs();
    }

    // ─────────────────────────────────────────────────────────────────
    // Initialization Functions
    // ─────────────────────────────────────────────────────────────────

    /**
     * @notice Initialize charity recipients
     */
    function _initializeCharities() private {
        // These addresses should be replaced with actual charity wallet addresses
        charities.push(
            Charity({
                wallet: 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D, // Placeholder
                name: "Women in Arts Foundation",
                description: "Supporting women artists worldwide",
                percentage: 3500, // 35%
                domain: "art"
            })
        );

        charities.push(
            Charity({
                wallet: 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D, // Placeholder
                name: "Girls in Science Initiative",
                description: "Empowering girls in STEM education",
                percentage: 3500, // 35%
                domain: "science"
            })
        );

        charities.push(
            Charity({
                wallet: 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D, // Placeholder
                name: "Women's Legal Defense Fund",
                description: "Providing legal support for women's rights",
                percentage: 3000, // 30%
                domain: "law"
            })
        );
    }

    /**
     * @notice Initialize Leader NFTs
     */
    function _initializeLeaderNFTs() private {
        // Art Leaders
        _addLeader(
            1,
            "Frida Kahlo",
            unicode"墨西哥女画家，以自画像闻名，代表作品《破碎的脊柱》等。她用艺术表达痛苦与生命力，成为女性主义艺术 Icon。",
            "art",
            0.05 ether,
            100,
            "ipfs://QmXXX/frida.json"
        );

        _addLeader(
            2,
            "Georgia O'Keeffe",
            unicode"美国现代主义艺术家，以花卉和沙漠风景画作闻名。她坚持自己的艺术 vision，在男性主导的艺术界开辟了一片天地。",
            "art",
            0.05 ether,
            100,
            "ipfs://QmXXX/georgia.json"
        );

        // Science Leaders
        _addLeader(
            3,
            "Tu Youyou",
            unicode"中国药学家，发现青蒿素治疗疟疾，拯救数百万人生命，2015年诺贝尔生理学或医学奖得主。",
            "science",
            0.05 ether,
            100,
            "ipfs://QmXXX/tu.json"
        );

        _addLeader(
            4,
            "Marie Curie",
            unicode"波兰裔法国物理学家和化学家，首位获得诺贝尔奖的女性，也是唯一在两个不同科学领域获得诺贝尔奖的人。",
            "science",
            0.05 ether,
            100,
            "ipfs://QmXXX/curie.json"
        );

        // Law Leaders
        _addLeader(
            5,
            "Ruth Bader Ginsburg",
            unicode"美国最高法院大法官，性别平等事业的先驱，以异见意见著称，成为女性权利保护的象征。",
            "law",
            0.05 ether,
            100,
            "ipfs://QmXXX/rbg.json"
        );

        _addLeader(
            6,
            "Sandra Day O'Connor",
            unicode"美国最高法院首位女性大法官，打破了司法界的性别壁垒，为后世女性法官铺平了道路。",
            "law",
            0.05 ether,
            100,
            "ipfs://QmXXX/sandra.json"
        );
    }

    /**
     * @notice Internal function to add a leader
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
     * @notice Purchase a Leader NFT
     * @param leaderId ID of the leader to purchase
     */
    function purchaseLeaderNFT(uint256 leaderId)
        external
        payable
        nonReentrant
    {
        require(leaderId > 0 && leaderId <= MAX_LEADERS, "Invalid leader ID");
        require(address(sbtContract) != address(0), "SBT contract not set");

        LeaderNFT storage leader = leaderNFTs[leaderId];
        require(leader.active, "Leader NFT not active");
        require(leader.currentSupply < leader.maxSupply, "Sold out");
        require(msg.value >= leader.price, "Insufficient payment");

        // Check if user has the required domain milestone
        bool hasMilestone = sbtContract.hasDomainMilestone(
            msg.sender,
            leader.domain
        );
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
     * @notice Distribute payment to charity recipients
     * @param leaderId Leader ID for the purchase
     * @param totalAmount Total payment amount
     */
    function _distributePayment(uint256 leaderId, uint256 totalAmount) private {
        uint256 distributed = 0;

        // Find charities associated with this domain
        uint256 domainCharityCount = 0;
        for (uint256 i = 0; i < charities.length; i++) {
            if (
                keccak256(bytes(charities[i].domain)) ==
                keccak256(bytes(leaderNFTs[leaderId].domain))
            ) {
                domainCharityCount++;
            }
        }

        require(domainCharityCount > 0, "No charities for this domain");

        // Distribute to domain-specific charities
        for (uint256 i = 0; i < charities.length; i++) {
            if (
                keccak256(bytes(charities[i].domain)) ==
                keccak256(bytes(leaderNFTs[leaderId].domain))
            ) {
                uint256 share = (totalAmount * charities[i].percentage) / 10000;
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

    /**
     * @notice Set the SBT contract address
     * @param sbtAddress Address of the SBT contract
     */
    function setSBTContract(address sbtAddress) external onlyOwner {
        require(sbtAddress != address(0), "Invalid address");
        sbtContract = IHerPathSBT(sbtAddress);
    }

    /**
     * @notice Add a new leader NFT
     * @param leaderId Leader ID
     * @param name Leader name
     * @param description Leader description
     * @param domain Required domain
     * @param price Price in wei
     * @param maxSupply Maximum supply
     * @param image Image URI
     */
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

    /**
     * @notice Update leader NFT details
     * @param leaderId Leader ID
     * @param active Whether the NFT is available
     * @param price New price (0 to keep unchanged)
     */
    function updateLeader(
        uint256 leaderId,
        bool active,
        uint256 price
    ) external onlyOwner {
        require(leaderId > 0 && leaderId <= MAX_LEADERS, "Invalid leader ID");
        require(leaderNFTs[leaderId].id != 0, "Leader does not exist");

        if (price > 0) {
            leaderNFTs[leaderId].price = price;
        }
        leaderNFTs[leaderId].active = active;
    }

    /**
     * @notice Add or update a charity recipient
     * @param index Index in charities array (use charities.length to add new)
     * @param wallet Charity wallet address
     * @param name Charity name
     * @param description Charity description
     * @param percentage Share percentage (basis points)
     * @param domain Associated domain
     */
    function setCharity(
        uint256 index,
        address wallet,
        string calldata name,
        string calldata description,
        uint256 percentage,
        string calldata domain
    ) external onlyOwner {
        require(wallet != address(0), "Invalid wallet");
        require(percentage > 0 && percentage <= 10000, "Invalid percentage");

        if (index < charities.length) {
            // Update existing
            charities[index].wallet = wallet;
            charities[index].name = name;
            charities[index].description = description;
            charities[index].percentage = percentage;
            charities[index].domain = domain;
        } else {
            // Add new
            charities.push(
                Charity({
                    wallet: wallet,
                    name: name,
                    description: description,
                    percentage: percentage,
                    domain: domain
                })
            );
        }

        emit CharityAdded(wallet, name, percentage);
    }

    /**
     * @notice Set base URI for token metadata
     * @param baseURI New base URI
     */
    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    /**
     * @notice Withdraw funds from contract (emergency only)
     */
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }

    // ─────────────────────────────────────────────────────────────────
    // View Functions
    // ─────────────────────────────────────────────────────────────────

    /**
     * @notice Check if user can purchase a specific leader NFT
     * @param user User address
     * @param leaderId Leader ID
     */
    function canPurchase(address user, uint256 leaderId)
        external
        view
        returns (bool)
    {
        require(leaderId > 0 && leaderId <= MAX_LEADERS, "Invalid leader ID");

        if (address(sbtContract) == address(0)) {
            return false;
        }

        LeaderNFT memory leader = leaderNFTs[leaderId];
        if (!leader.active || leader.currentSupply >= leader.maxSupply) {
            return false;
        }

        return sbtContract.hasDomainMilestone(user, leader.domain);
    }

    /**
     * @notice Get leader NFT details
     * @param leaderId Leader ID
     */
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

    /**
     * @notice Get all leader IDs
     */
    function getAllLeaderIds() external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= MAX_LEADERS; i++) {
            if (leaderNFTs[i].id != 0) {
                count++;
            }
        }

        uint256[] memory ids = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= MAX_LEADERS; i++) {
            if (leaderNFTs[i].id != 0) {
                ids[index] = i;
                index++;
            }
        }
        return ids;
    }

    /**
     * @notice Get all charities
     */
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
        wallets = new address[](charities.length);
        names = new string[](charities.length);
        percentages = new uint256[](charities.length);
        domains = new string[](charities.length);

        for (uint256 i = 0; i < charities.length; i++) {
            wallets[i] = charities[i].wallet;
            names[i] = charities[i].name;
            percentages[i] = charities[i].percentage;
            domains[i] = charities[i].domain;
        }
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
        _requireOwned(tokenId);

        return
            bytes(_baseTokenURI).length > 0
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

    // ─────────────────────────────────────────────────────────────────
    // Receive Function
    // ─────────────────────────────────────────────────────────────────

    receive() external payable {}
}
