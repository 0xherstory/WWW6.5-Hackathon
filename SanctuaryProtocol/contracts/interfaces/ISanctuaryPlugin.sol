// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ISanctuaryPlugin
 * @dev 庇护所协议插件标准接口
 * @notice 所有接入庇护所协议的插件必须实现此接口
 */

/**
 * @notice 插件类型枚举
 * @param SELF_HELP 自助式插件（如OH卡、CBT日记）
 * @param HUMAN_SERVICE 人工服务插件（如心理咨询）
 * @param HYBRID 混合模式插件
 */
enum PluginType { SELF_HELP, HUMAN_SERVICE, HYBRID }

interface ISanctuaryPlugin {
    
    /**
     * @notice 获取插件信息
     * @return name 插件名称
     * @return version 插件版本号
     * @return pluginType 插件类型
     * @return description 插件描述
     */
    function getPluginInfo() external view returns (
        string memory name,
        string memory version,
        PluginType pluginType,
        string memory description
    );
    
    /**
     * @notice 验证用户的工作量证明
     * @param user 用户地址
     * @param proofData 证明数据（如IPFS哈希、活动记录等）
     * @return 是否验证通过
     */
    function verifyProofOfWork(address user, bytes calldata proofData) external view returns (bool);
    
    /**
     * @notice 记录用户活动
     * @param user 用户地址
     * @param activityType 活动类型（如"journal_completed"）
     * @param proofHash 活动证明哈希（如IPFS CID）
     * @dev 只能由协议合约或用户自己调用
     */
    function recordActivity(address user, string calldata activityType, bytes32 proofHash) external;
}
