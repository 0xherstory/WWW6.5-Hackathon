# Hardhat 本地网络测试指南

## 概述

本指南说明如何在 Hardhat 本地网络上测试前端与 Sanctuary Protocol V2.2 合约的交互。

## 前置条件

1. 安装依赖:
```bash
npm install
```

2. 确保 Hardhat 配置正确 (`hardhat.config.ts`):
- 本地网络已配置在端口 8545
- chainId 为 31337

## 测试步骤

### 1. 启动 Hardhat 本地节点

```bash
npx hardhat node
```

这将启动一个本地以太坊网络，默认:
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`
- 预置 20 个测试账户，每个有 10000 ETH

### 2. 部署合约到本地网络

在另一个终端窗口中:

```bash
# 编译合约
npx hardhat compile

# 部署到本地网络
npx hardhat run scripts/deploy-v2.ts --network hardhat
```

部署脚本会输出合约地址，记录下来用于配置前端。

### 3. 配置前端环境变量

编辑 `.env.local` 文件，添加 Hardhat 本地网络的合约地址:

```env
NEXT_PUBLIC_SANCTUARY_V2_ADDRESS_HARDHAT=0x...
NEXT_PUBLIC_PLUGIN_ADDRESS_HARDHAT=0x...
```

### 4. 启动前端开发服务器

```bash
npm run dev
```

### 5. 连接 MetaMask 到本地网络

1. 打开 MetaMask
2. 添加网络:
   - 网络名称: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - 货币符号: `ETH`
3. 导入测试账户私钥（从 Hardhat 节点输出中获取）

### 6. 测试功能

#### 捐赠功能
1. 访问 `http://localhost:3000/guardian`
2. 连接钱包
3. 选择一张卡牌
4. 设置捐赠金额（如 0.1 ETH）
5. 确认交易

#### 领取功能
1. 访问 `http://localhost:3000/claim`
2. 查看资金池状态
3. 完成日记流程后领取

#### 日记功能
1. 访问 `http://localhost:3000/spreads`
2. 选择一个牌阵
3. 选择卡牌
4. 写日记并提交
5. 合约会自动调用插件完成疗愈

## 常见问题

### MetaMask 无法连接
- 确保 Hardhat 节点正在运行
- 检查 RPC URL 和 Chain ID 是否正确
- 清除 MetaMask 的活动网络缓存

### 合约调用失败
- 检查合约地址是否正确配置
- 确保使用的是正确的网络（Hardhat Local）
- 查看浏览器控制台和 Hardhat 节点日志

### nonce 错误
- 在 MetaMask 中重置账户（设置 > 高级 > 重置账户）
- 这会清除 nonce 缓存，解决本地网络的 nonce 问题

## 重置测试环境

1. 停止 Hardhat 节点 (Ctrl+C)
2. 重新启动 Hardhat 节点
3. 重新部署合约
4. 更新合约地址配置
5. 重置 MetaMask 账户 nonce

## 调试技巧

### 查看 Hardhat 网络日志
Hardhat 节点会输出所有交易和日志，便于调试。

### 使用 console.log 在合约中
合约中可以使用 `hardhat/console.sol` 进行调试:
```solidity
import "hardhat/console.sol";

function myFunction() public {
    console.log("Debug message", msg.sender);
}
```

### 前端调试
- 使用浏览器的开发者工具查看网络请求
- 检查 wagmi/viem 的合约调用日志
- 查看 MetaMask 的交易详情

## 下一步

完成本地测试后:
1. 部署到 Avalanche Fuji 测试网
2. 更新 `.env.local` 中的 Fuji 合约地址
3. 在测试网上进行更真实的测试
4. 最终部署到 Avalanche 主网
