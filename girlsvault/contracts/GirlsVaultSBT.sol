// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title GirlsVault Donation SBT
/// @notice 灵魂绑定 NFT，记录每笔捐款，不可转让，永久公益凭证
contract GirlsVaultSBT {

    string public name   = "GirlsVault Donation SBT";
    string public symbol = "GVSBT";

    struct DonationRecord {
        address donor;
        address project;
        string  projectName;
        uint256 amount;
        uint8   tag;
        uint256 donatedAt;
    }

    uint256 private _counter;
    address public  registry;

    mapping(uint256 => DonationRecord) public records;
    mapping(uint256 => address)        private _owners;
    mapping(address => uint256[])      private _donorTokens;
    mapping(address => bool)           public  authorizedMinters;

    event Minted(address indexed donor, uint256 indexed tokenId, address indexed project, uint256 amount);

    constructor() {
        registry = msg.sender;
    }

    modifier onlyRegistry() {
        require(msg.sender == registry, "Only registry");
        _;
    }

    modifier onlyMinter() {
        require(authorizedMinters[msg.sender], "Not authorized minter");
        _;
    }

    function authorizeMinter(address minter) external onlyRegistry {
        authorizedMinters[minter] = true;
    }

    function mint(
        address donor,
        address project,
        string calldata projectName,
        uint256 amount,
        uint8 tag
    ) external onlyMinter returns (uint256) {
        uint256 tokenId = ++_counter;
        _owners[tokenId] = donor;
        _donorTokens[donor].push(tokenId);
        records[tokenId] = DonationRecord({
            donor:       donor,
            project:     project,
            projectName: projectName,
            amount:      amount,
            tag:         tag,
            donatedAt:   block.timestamp
        });
        emit Minted(donor, tokenId, project, amount);
        return tokenId;
    }

    function getDonorTokens(address donor) external view returns (uint256[] memory) {
        return _donorTokens[donor];
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        return _owners[tokenId];
    }

    function totalSupply() external view returns (uint256) {
        return _counter;
    }

    // SBT：禁止转让
    function transferFrom(address, address, uint256) external pure {
        revert("SBT: non-transferable");
    }

    function safeTransferFrom(address, address, uint256) external pure {
        revert("SBT: non-transferable");
    }
}
