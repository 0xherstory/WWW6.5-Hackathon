// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// 引入 OpenZeppelin 标准库
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract UrbanFlora is ERC721URIStorage, Ownable {

    uint256 public tokenCounter;

    struct Plant {
        string name;        // 植物名称
        string location;    // 位置（字符串）
    }

    mapping(uint256 => Plant) public plants;

    constructor() ERC721("UrbanFlora", "UFL") Ownable(msg.sender) {
        tokenCounter = 0;
    }

    // 🌱 创建植物 NFT
    function createPlant(
        string memory name,
        string memory location,
        string memory tokenURI
    ) public returns (uint256) {

        uint256 newTokenId = tokenCounter;

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        plants[newTokenId] = Plant(name, location);

        tokenCounter++;

        return newTokenId;
    }

    // 🔍 查询植物信息
    function getPlant(uint256 tokenId) public view returns (string memory, string memory) {
        Plant memory p = plants[tokenId];
        return (p.name, p.location);
    }
}