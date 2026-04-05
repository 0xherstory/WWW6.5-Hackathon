// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Owned.sol";

error BadgeNotDefined();
error BadgeAlreadyOwned();
error Soulbound();
error TokenDoesNotExist();
error CredentialNotMinter();

contract HerLemmaCredential is Owned {
    string public name;
    string public symbol;

    uint256 private _nextTokenId = 1;

    struct BadgeDefinition {
        string badgeName;
        string uri;
        bool exists;
    }

    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _owners;
    mapping(uint256 => uint256) public badgeOfToken;
    mapping(uint256 => BadgeDefinition) private _badgeDefinitions;
    mapping(address => mapping(uint256 => bool)) public hasBadge;
    mapping(address => bool) public minters;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event BadgeDefined(uint256 indexed badgeId, string badgeName, string uri);
    event MinterUpdated(address indexed account, bool allowed);

    constructor(address initialOwner, string memory collectionName, string memory collectionSymbol) Owned(initialOwner) {
        name = collectionName;
        symbol = collectionSymbol;
        minters[initialOwner] = true;
        emit MinterUpdated(initialOwner, true);
    }

    modifier onlyMinter() {
        if (!minters[msg.sender]) revert CredentialNotMinter();
        _;
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return
            interfaceId == 0x01ffc9a7 || // ERC165
            interfaceId == 0x80ac58cd || // ERC721
            interfaceId == 0x5b5e139f;   // ERC721Metadata
    }

    function balanceOf(address account) external view returns (uint256) {
        if (account == address(0)) revert ZeroAddress();
        return _balances[account];
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address tokenOwner = _owners[tokenId];
        if (tokenOwner == address(0)) revert TokenDoesNotExist();
        return tokenOwner;
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        ownerOf(tokenId);
        return _badgeDefinitions[badgeOfToken[tokenId]].uri;
    }

    function badgeName(uint256 badgeId) external view returns (string memory) {
        if (!_badgeDefinitions[badgeId].exists) revert BadgeNotDefined();
        return _badgeDefinitions[badgeId].badgeName;
    }

    function setMinter(address account, bool allowed) external onlyOwner {
        if (account == address(0)) revert ZeroAddress();
        minters[account] = allowed;
        emit MinterUpdated(account, allowed);
    }

    function defineBadge(uint256 badgeId, string calldata badgeName_, string calldata uri) external onlyOwner {
        _badgeDefinitions[badgeId] = BadgeDefinition({
            badgeName: badgeName_,
            uri: uri,
            exists: true
        });
        emit BadgeDefined(badgeId, badgeName_, uri);
    }

    function mintBadge(address to, uint256 badgeId) external onlyMinter returns (uint256 tokenId) {
        if (to == address(0)) revert ZeroAddress();
        if (!_badgeDefinitions[badgeId].exists) revert BadgeNotDefined();
        if (hasBadge[to][badgeId]) revert BadgeAlreadyOwned();

        tokenId = _nextTokenId++;
        _owners[tokenId] = to;
        _balances[to] += 1;
        badgeOfToken[tokenId] = badgeId;
        hasBadge[to][badgeId] = true;

        emit Transfer(address(0), to, tokenId);
    }

    function approve(address, uint256) external pure {
        revert Soulbound();
    }

    function getApproved(uint256) external pure returns (address) {
        return address(0);
    }

    function setApprovalForAll(address, bool) external pure {
        revert Soulbound();
    }

    function isApprovedForAll(address, address) external pure returns (bool) {
        return false;
    }

    function transferFrom(address, address, uint256) external pure {
        revert Soulbound();
    }

    function safeTransferFrom(address, address, uint256) external pure {
        revert Soulbound();
    }

    function safeTransferFrom(address, address, uint256, bytes calldata) external pure {
        revert Soulbound();
    }
}
