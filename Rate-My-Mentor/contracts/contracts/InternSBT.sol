// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract InternSBT is ERC721,Ownable{
    using ECDSA for bytes32;

    // ── 极简数据结构 (仅占 1 个 Slot，极其省 Gas) ─────────────
    // 不存储具体的业务 UUID，保护隐私的同时大幅降低上链成本
    struct InternCredential {
        bytes32 credentialHash; // 凭证唯一哈希 (对应后端生成的不可逆哈希)
        bool    isActive;       // 凭证状态 (true为有效，false为被吊销)
    }

    // ── 状态变量 ──────────────────────────────────────
    address public trustedBackend;
    uint256 private _tokenIdCounter; // 链上的自增 ID

    // 核心映射：tokenId => 凭证信息
    mapping(uint256 => InternCredential) public credentials;
    
    // 防重放攻击：记录某个凭证哈希是否已经铸造过 SBT
    mapping(bytes32 => bool) public isCredentialHashUsed;
    
    // DAO 统计总人数使用：记录真实自然人数量
    mapping(address => bool) public isUniqueHolder;
    uint256 public totalUniqueHolders;

    // ── 事件 (极致隐私设计) ───────────────────────────
    // 仅抛出不可逆的 credentialHash，后端监听此事件即可在 DB 中完成绑定
    // 外部人员无法通过链上数据反推用户的真实实习公司
    event SBTMinted(
        address indexed walletAddress, 
        uint256 indexed tokenId, 
        bytes32 indexed credentialHash 
    );

    event CredentialRevoked(uint256 indexed tokenId);

   constructor(address _trustedBackend) ERC721("InternSBT", "ISBT") Ownable(msg.sender) {
        require(_trustedBackend != address(0), "Invalid backend address"); // 顺便把第3点的零地址检查加上
        trustedBackend = _trustedBackend;
        _tokenIdCounter = 1;
    }
    
    event TrustedBackendUpdated(address indexed oldBackend, address indexed newBackend);

    function setTrustedBackend(address _newBackend) external onlyOwner {
        require(_newBackend != address(0), "Cannot be zero address");
        emit TrustedBackendUpdated(trustedBackend, _newBackend);
        trustedBackend = _newBackend;
    }
    
    function revokeCredential(uint256 _tokenId) external onlyOwner {
    require(_ownerOf(_tokenId) != address(0), "Token does not exist");
    require(credentials[_tokenId].isActive, "Already revoked");

    credentials[_tokenId].isActive = false;
    emit CredentialRevoked(_tokenId); 
    }

    // ── 核心函数：铸造 SBT ────────────────────────────
    function mintSBT(
        string calldata _credentialId,   // 后端生成的凭证 UUID（仅用于验签，不上链存储）
        string calldata _companyId,      // 后端生成的公司 UUID（仅用于验签，不上链存储）
        bytes32 _credentialHash,         // 后端生成的凭证内容哈希
        uint256 _expireTime,             // 签名过期时间戳
        bytes calldata _signature        // 后端签发的 ECDSA 签名
    ) external {
        // 1. 安全校验：时间有效性与防重放攻击
        require(block.timestamp <= _expireTime, "Signature has expired");
        require(!isCredentialHashUsed[_credentialHash], "Credential hash already minted");

        // 2. 严格对齐后端文档的 Message Hash 生成规则
        bytes32 messageHash = keccak256(
            abi.encode(
                _credentialId,     
                msg.sender,        
                _companyId,        
                _credentialHash,   
                _expireTime        
            )
        );
        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        address signer = ECDSA.recover(ethSignedHash, _signature);
        require(signer == trustedBackend, "Invalid signature");

        // 3. 统计独立人数 (供 DAO 治理计算法定人数)
        if (!isUniqueHolder[msg.sender]) {
            isUniqueHolder[msg.sender] = true;
            totalUniqueHolders++;
        }

        // 4. 标记该凭证哈希已使用，防止重复提交流程
        isCredentialHashUsed[_credentialHash] = true;

        // 5. 铸造 ERC721 Token
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(msg.sender, tokenId);

        // 6. 存储凭证核心状态
        credentials[tokenId] = InternCredential({
            credentialHash: _credentialHash,
            isActive: true
        });

        // 7. 触发事件，通知后端完成链下 DB 的关联更新
        emit SBTMinted(msg.sender, tokenId, _credentialHash);
    }

    // ── 检查凭证是否有效 ──────────────────────────────
    // 供 ReviewContract 在提交评价时调用
    function isValidCredential(uint256 _tokenId) external view returns (bool) {
        return _ownerOf(_tokenId) != address(0) && credentials[_tokenId].isActive;
    }

    // ── 获取 DAO 法定人数基数 ────────────────────────
    // 供 ReviewDAO 计算一人一票的 Quorum 使用
    function totalSupply() external view returns (uint256) {
        return totalUniqueHolders; 
    }

    // ── 灵魂绑定：禁止转让 ────────────────────────────
    // 覆盖 ERC721 的 _update 函数，确保 SBT 无法被转移或交易
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        require(from == address(0), "SBT: non-transferable");
        return super._update(to, tokenId, auth);
    }
}