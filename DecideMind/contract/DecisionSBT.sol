// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// 导入OpenZeppelin的ERC721标准（简化开发，安全可靠）
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// 导入Ownable（只有合约拥有者能授权领取，防止乱领）
import "@openzeppelin/contracts/access/Ownable.sol";

// SBT徽章合约：不可转让，只有完成存证的用户可领取
contract DecisionSBT is ERC721, Ownable {
    // 徽章ID计数器（每领取一枚，ID自增）
    uint256 private _tokenIdCounter;

    // 记录用户是否已领取徽章（防止重复领取）
    mapping(address => bool) public hasMinted;

    // 构造函数：初始化合约名称、符号，设置部署者为拥有者
    constructor() ERC721("DecisionMindBadge", "DMB") Ownable(msg.sender) {
        _tokenIdCounter = 0; // 初始ID从0开始
    }

    // 领取徽章方法：只有未领取过、且经拥有者授权的用户可领取
    // 前端可调用此方法，配合localStorage的hasProof判断是否可领取
    function mintBadge(address user) external onlyOwner {
        require(!hasMinted[user], "You have already minted the badge"); // 防止重复领取
        
        uint256 tokenId = _tokenIdCounter;
        _safeMint(user, tokenId); //  mint徽章到用户钱包
        hasMinted[user] = true;  // 标记用户已领取
        _tokenIdCounter++;       // 徽章ID自增
    }

    // 核心：禁用SBT转让功能（灵魂绑定关键）
    // 覆盖ERC721的transferFrom方法，调用即报错
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public pure override {
        revert("SBT: Cannot transfer, soulbound token");
    }

    // 核心：禁用批量转让功能
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public pure override {
        revert("SBT: Cannot transfer, soulbound token");
    }
}
