// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title MoodRealmStamp
 * @notice 情绪星域 · 星球印记 NFT
 *
 * 设计原则（隐私承诺模式）：
 *   - 公开上链：planet、stampName、tokenURI（IPFS 元数据）
 *   - 隐私承诺：dataHash = keccak256(planet ‖ stampName ‖ personId ‖ intensity ‖ protect ‖ timestamp)
 *     完整明文仅存于用户本地 localStorage，链上只存哈希作为防篡改承诺。
 *   - 平台签名（EIP-712）：防止未经授权的 mint，用户必须持有平台后端签发的签名。
 *   - 防重放：每个 (wallet, nonce) 组合只能使用一次。
 */
contract MoodRealmStamp is ERC721URIStorage, EIP712, Ownable {
    using ECDSA for bytes32;

    // ─── 类型定义 ───────────────────────────────────────────────
    struct StampRecord {
        string  planet;      // 星球名，例如 "迷雾星球"
        string  stampName;   // 用户为印记命名
        bytes32 dataHash;    // keccak256(完整本地记录)，隐私承诺
        uint64  mintedAt;    // 铸造时间戳（秒）
    }

    // EIP-712 类型哈希
    bytes32 private constant _MINT_TYPEHASH = keccak256(
        "MintRequest(address to,string planet,string stampName,bytes32 dataHash,string tokenURI,uint256 nonce)"
    );

    // ─── 状态变量 ────────────────────────────────────────────────
    address public signer;                                     // 平台签名地址（后端 EOA）
    uint256 private _nextTokenId;

    mapping(uint256 => StampRecord) public stampRecords;       // tokenId → 印记数据
    mapping(address => uint256)     public nonces;             // 防重放 nonce

    // ─── 事件 ────────────────────────────────────────────────────
    event StampMinted(
        address indexed owner,
        uint256 indexed tokenId,
        string  planet,
        string  stampName,
        bytes32 dataHash,
        uint64  mintedAt
    );

    event SignerUpdated(address indexed oldSigner, address indexed newSigner);

    // ─── 构造函数 ────────────────────────────────────────────────
    constructor(address _signer)
        ERC721("MoodRealm Stamp", "MRS")
        EIP712("MoodRealmStamp", "1")
        Ownable(msg.sender)
    {
        require(_signer != address(0), "MRS: zero signer");
        signer = _signer;
    }

    // ─── 核心：铸造印记 ──────────────────────────────────────────
    /**
     * @notice 用户持平台签名铸造一枚星球印记 NFT
     * @param planet     星球名（公开）
     * @param stampName  印记名称（公开，可为空串）
     * @param dataHash   本地完整记录的 keccak256 哈希（承诺，私密）
     * @param tokenURI_  IPFS 上的 metadata JSON URI
     * @param signature  平台后端 EIP-712 签名
     *
     * dataHash 的原像（仅存本地，永不上链）：
     *   keccak256(abi.encodePacked(planet, stampName, personId, intensity, protect, timestamp))
     */
    function mintStamp(
        string  calldata planet,
        string  calldata stampName,
        bytes32          dataHash,
        string  calldata tokenURI_,
        bytes   calldata signature
    ) external {
        uint256 nonce = nonces[msg.sender];

        // 验证平台 EIP-712 签名（内联消除中间变量，避免 stack too deep）
        require(
            _hashTypedDataV4(keccak256(abi.encode(
                _MINT_TYPEHASH,
                msg.sender,
                keccak256(bytes(planet)),
                keccak256(bytes(stampName)),
                dataHash,
                keccak256(bytes(tokenURI_)),
                nonce
            ))).recover(signature) == signer,
            "MRS: invalid signature"
        );

        // 消耗 nonce（防重放）
        nonces[msg.sender] = nonce + 1;

        // 铸造
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI_);

        // 记录链上公开数据 + 隐私承诺
        stampRecords[tokenId] = StampRecord({
            planet:    planet,
            stampName: stampName,
            dataHash:  dataHash,
            mintedAt:  uint64(block.timestamp)
        });

        emit StampMinted(msg.sender, tokenId, planet, stampName, dataHash, uint64(block.timestamp));
    }

    // ─── 验证工具：用户可证明本地数据对应链上承诺 ────────────────
    /**
     * @notice 验证本地明文是否与某 token 的链上 dataHash 一致
     * @param tokenId   NFT token ID
     * @param preimage  keccak256 的原像，由调用方提供
     * @return          是否匹配
     *
     * 前端调用示例：
     *   const preimage = ethers.solidityPackedKeccak256(
     *     ["string","string","string","string","string","uint64"],
     *     [planet, stampName, personId, intensity, protect, timestamp]
     *   );
     *   const valid = await contract.verifyDataHash(tokenId, preimage);
     */
    function verifyDataHash(uint256 tokenId, bytes32 preimage) external view returns (bool) {
        return stampRecords[tokenId].dataHash == preimage;
    }

    // ─── 查询 ────────────────────────────────────────────────────
    /**
     * @notice 返回某地址拥有的所有 tokenId（线性扫描，仅适合前端小量使用）
     */
    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        uint256 total = _nextTokenId;
        uint256 count;
        for (uint256 i; i < total; i++) {
            // _ownerOf returns address(0) for burned tokens
            if (_ownerOf(i) == owner) count++;
        }
        uint256[] memory result = new uint256[](count);
        uint256 idx;
        for (uint256 i; i < total; i++) {
            if (_ownerOf(i) == owner) result[idx++] = i;
        }
        return result;
    }

    // ─── 管理员 ──────────────────────────────────────────────────
    /**
     * @notice 更换平台签名地址（仅 owner）
     */
    function updateSigner(address newSigner) external onlyOwner {
        require(newSigner != address(0), "MRS: zero signer");
        emit SignerUpdated(signer, newSigner);
        signer = newSigner;
    }

    // ─── 供前端 EIP-712 签名使用的域分隔符 ──────────────────────
    function domainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }
}
