// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RescueLink
 * @notice 它援 RescueLink - 救助个案轻量留痕合约
 * @dev
 * 仅记录：
 * 1. 个案创建
 * 2. 个案后续进展更新
 *
 * 完整标题、描述、图片、联系方式等内容应保存在链下数据库或存储服务中。
 * 链上只保留最小必要信息，用于留痕与核对。
 */
contract RescueLink {
    struct CaseRecord {
        bool exists;
        address creator;
        bytes32 metaHash;
        uint256 createdAt;
    }

    mapping(bytes32 => CaseRecord) private cases;

    /// @notice 个案创建留痕
    /// @param caseId 平台自动生成的链下唯一 ID 的哈希
    /// @param metaHash 个案关键信息摘要哈希
    /// @param operator 发起人地址
    /// @param timestamp 创建时间
    event CaseCreated(
        bytes32 indexed caseId,
        bytes32 metaHash,
        address indexed operator,
        uint256 timestamp
    );

    /// @notice 个案补充进展留痕
    /// @param caseId 个案 ID
    /// @param updateHash 本次更新内容摘要哈希
    /// @param updateType 更新类型，例如 "progress" | "medical" | "receipt"
    /// @param operator 操作人地址
    /// @param timestamp 更新时间
    event CaseUpdated(
        bytes32 indexed caseId,
        bytes32 updateHash,
        string updateType,
        address indexed operator,
        uint256 timestamp
    );

    /// @notice 个案核心摘要更新留痕
    /// @param caseId 个案 ID
    /// @param oldMetaHash 旧摘要
    /// @param newMetaHash 新摘要
    /// @param operator 操作人地址
    /// @param timestamp 更新时间
    event CaseMetaUpdated(
        bytes32 indexed caseId,
        bytes32 oldMetaHash,
        bytes32 newMetaHash,
        address indexed operator,
        uint256 timestamp
    );

    modifier caseMustExist(bytes32 caseId) {
        require(cases[caseId].exists, "Case not found");
        _;
    }

    modifier onlyCreator(bytes32 caseId) {
        require(cases[caseId].exists, "Case not found");
        require(cases[caseId].creator == msg.sender, "Not case creator");
        _;
    }

    /**
     * @notice 创建个案
     * @param caseId 平台自动生成的链下唯一 ID 哈希
     * @param metaHash 个案关键信息摘要哈希
     */
    function createCase(bytes32 caseId, bytes32 metaHash) external {
        require(caseId != bytes32(0), "Invalid caseId");
        require(metaHash != bytes32(0), "Invalid metaHash");
        require(!cases[caseId].exists, "Case already exists");

        cases[caseId] = CaseRecord({
            exists: true,
            creator: msg.sender,
            metaHash: metaHash,
            createdAt: block.timestamp
        });

        emit CaseCreated(caseId, metaHash, msg.sender, block.timestamp);
    }

    /**
     * @notice 补充进展
     * @dev 前端 UI 可以叫“补充进展”或“更新情况”，不必显示 updateType 给普通用户
     * @param caseId 个案 ID
     * @param updateHash 本次更新内容摘要哈希
     * @param updateType 更新类型，例如 "progress" | "medical" | "receipt"
     */
    function addUpdate(
        bytes32 caseId,
        bytes32 updateHash,
        string calldata updateType
    ) external caseMustExist(caseId) onlyCreator(caseId) {
        require(updateHash != bytes32(0), "Invalid updateHash");
        require(bytes(updateType).length > 0, "Empty updateType");

        emit CaseUpdated(
            caseId,
            updateHash,
            updateType,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @notice 更新个案核心摘要
     * @dev 当标题、当前情况、当前需要等摘要信息需要同步更新时可调用
     * @param caseId 个案 ID
     * @param newMetaHash 新摘要哈希
     */
    function updateCaseMeta(
        bytes32 caseId,
        bytes32 newMetaHash
    ) external caseMustExist(caseId) onlyCreator(caseId) {
        require(newMetaHash != bytes32(0), "Invalid newMetaHash");
        require(newMetaHash != cases[caseId].metaHash, "Meta unchanged");

        bytes32 oldMetaHash = cases[caseId].metaHash;
        cases[caseId].metaHash = newMetaHash;

        emit CaseMetaUpdated(
            caseId,
            oldMetaHash,
            newMetaHash,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @notice 判断个案是否存在
     */
    function caseExists(bytes32 caseId) external view returns (bool) {
        return cases[caseId].exists;
    }

    /**
     * @notice 获取个案链上基础信息
     * @return creator 发起人地址
     * @return metaHash 个案当前摘要哈希
     * @return createdAt 个案创建时间
     */
    function getCaseMeta(
        bytes32 caseId
    )
        external
        view
        caseMustExist(caseId)
        returns (
            address creator,
            bytes32 metaHash,
            uint256 createdAt
        )
    {
        CaseRecord memory c = cases[caseId];
        return (c.creator, c.metaHash, c.createdAt);
    }
}
