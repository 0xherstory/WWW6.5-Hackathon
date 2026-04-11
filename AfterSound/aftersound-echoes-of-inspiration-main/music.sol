// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MusicRegistry {

    // ===== 存储所有音频的 hash（使用 bytes32 更高效）=====
    bytes32[] private hashes;

    // ===== 判断 hash 是否已存在（用于查重）=====
    mapping(bytes32 => bool) public hashExists;

    // ===== 记录 hash 对应的创作者地址 =====
    mapping(bytes32 => address) public creators;

    // ===== 记录 hash 的时间戳（区块时间）=====
    mapping(bytes32 => uint256) public timestamps;

    // ===== 事件：当一个 hash 被存储时触发 =====
    event HashStored(
        bytes32 indexed hash,
        address indexed creator,
        uint256 timestamp
    );

    // ===== 存储 hash（核心函数）=====
    function storeHash(bytes32 _hash) public {

        // 防止重复提交（查重）
        require(!hashExists[_hash], "Hash already exists");

        // 存入数组（可用于统计）
        hashes.push(_hash);

        // 标记为已存在
        hashExists[_hash] = true;

        // 记录创作者
        creators[_hash] = msg.sender;

        // 记录时间（链上时间）
        timestamps[_hash] = block.timestamp;

        // 触发事件（前端可以监听）
        emit HashStored(_hash, msg.sender, block.timestamp);
    }

    // ===== 查重：判断 hash 是否已存在 =====
    function isDuplicate(bytes32 _hash) public view returns (bool) {
        return hashExists[_hash];
    }

    // ===== 获取总数量 =====
    function getCount() public view returns (uint256) {
        return hashes.length;
    }

    // ===== 根据索引获取 hash =====
    function getHash(uint256 index) public view returns (bytes32) {
        return hashes[index];
    }

    // ===== 一步验证（推荐给前端用）=====
    function verifyHash(bytes32 _hash) public view returns (
        bool exists,
        address creator,
        uint256 time
    ) {
        return (
            hashExists[_hash],
            creators[_hash],
            timestamps[_hash]
        );
    }
}