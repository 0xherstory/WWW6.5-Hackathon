# 部署记录（DEPLOY_LOG）

## 0. 会话信息
| 字段 | 内容 |
| --- | --- |
| 网络 | Sepolia |
| 部署钱包地址 |  |
| 日期（UTC+8） |  |
| Remix 工作区 |  |
| 备注 |  |

---

## 1. 合约最终总表（用于最终汇总）
> 用途：部署全部完成后，只保留每个合约的最终信息，方便一眼查看。

| 合约 | 最终地址 | 部署交易哈希 | 构造参数 | 是否已验证（Y/N） |
| --- | --- | --- | --- | --- |
| EsgOracle |  |  | initialOwner= |  |
| MockERC20 mUSDC |  |  | name,symbol,decimals,initialSupply,initialOwner |  |
| MockERC20 mETH |  |  | name,symbol,decimals,initialSupply,initialOwner |  |
| MockERC20 mGB |  |  | name,symbol,decimals,initialSupply,initialOwner |  |
| ReactiveEsgPortfolio |  |  | oracleAddress,initialOwner |  |

---

## 2. 部署过程流水表（用于过程追踪）
> 用途：每做一步就记录一次，包含时间、状态、备注；是过程日志，不是最终汇总。

| 步骤 | 操作（合约/动作） | 参数 | 产出合约地址 | 交易哈希 | 状态 | 时间（UTC+8） | 备注 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 部署 EsgOracle | initialOwner= |  |  |  |  |  |
| 2 | 部署 MockERC20 mUSDC | name,symbol,decimals,initialSupply,initialOwner |  |  |  |  |  |
| 3 | 部署 MockERC20 mETH | name,symbol,decimals,initialSupply,initialOwner |  |  |  |  |  |
| 4 | 部署 MockERC20 mGB | name,symbol,decimals,initialSupply,initialOwner |  |  |  |  |  |
| 5 | 部署 ReactiveEsgPortfolio | oracleAddress,initialOwner |  |  |  |  |  |

---

## 3. 部署后初始化记录
| 步骤 | 操作 | 参数 | 交易哈希 | 状态 | 时间（UTC+8） | 备注 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | listAsset(mUSDC) | token=, targetBps=4000 |  |  |  |  |
| 2 | listAsset(mETH) | token=, targetBps=3500 |  |  |  |  |
| 3 | listAsset(mGB) | token=, targetBps=2500 |  |  |  |  |
| 4 | approve mUSDC -> portfolio | spender=, amount= |  |  |  |  |
| 5 | depositUnits mUSDC | asset=, amount= |  |  |  |  |
| 6 | approve mETH -> portfolio | spender=, amount= |  |  |  |  |
| 7 | depositUnits mETH | asset=, amount= |  |  |  |  |
| 8 | approve mGB -> portfolio | spender=, amount= |  |  |  |  |
| 9 | depositUnits mGB | asset=, amount= |  |  |  |  |

---

## 4. Oracle + Policy 测试用例记录
| 用例 | 调用链 | 参数 | 预期结果 | 交易哈希（可多个） | 实际结果 |
| --- | --- | --- | --- | --- | --- |
| A | updateScore -> applyReactivePolicy | AA/AAA 路径 | targetBps 增加 |  |  |
| B | updateScore -> applyReactivePolicy | A->BBB 路径 | targetBps 降低 |  |  |
| C | reportIncident(severe=true) -> applyReactivePolicy | incident 路径 | targetBps 归零（EXIT） |  |  |
| D | updateScore(BB/B) -> applyReactivePolicy | 低评级路径 | targetBps 归零（EXIT） |  |  |

---

## 5. MetaMask 代币导入记录
| 代币 | 地址 | Symbol | Decimals | 是否已导入（Y/N） | 钱包余额快照 |
| --- | --- | --- | --- | --- | --- |
| mUSDC |  |  |  |  |  |
| mETH |  |  |  |  |  |
| mGB |  |  |  |  |  |

---

## 6. 浏览器（Etherscan）链接
| 项目 | URL |
| --- | --- |
| EsgOracle（地址页） |  |
| ReactiveEsgPortfolio（地址页） |  |
| mUSDC（地址页） |  |
| mETH（地址页） |  |
| mGB（地址页） |  |

---

## 7. 交接检查清单
- [ ] 所有合约地址已记录
- [ ] 所有部署交易哈希已记录
- [ ] 所有构造参数已记录
- [ ] listAsset + depositUnits 已完成
- [ ] 至少 3 个策略测试用例通过
- [ ] MetaMask 代币导入已确认
- [ ] Etherscan 链接已记录
