// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ISanctuaryProtocol
 * @dev 庇护所协议接口
 * @notice 插件与协议交互的标准接口
 */
interface ISanctuaryProtocol {
    
    /**
     * @notice 插件请求拨付
     * @param user 用户地址
     * @param amount 拨付金额
     */
    function pluginRequestPayout(address user, uint256 amount) external;
    
    /**
     * @notice 获取动态领取金额
     * @return 根据资金池状态计算的金额
     */
    function getDynamicClaimAmount() external view returns (uint256);
    
    /**
     * @notice 获取资金池状态
     */
    function getPoolStatus() external view returns (
        uint256 balance,
        uint256 reserveAmount,
        uint256 available,
        uint256 donationCount,
        uint256 claimCount,
        uint256 currentClaimAmount,
        string memory mode
    );
    
    /**
     * @notice 检查是否为捐赠者
     */
    function isDonor(address account) external view returns (bool);
}
