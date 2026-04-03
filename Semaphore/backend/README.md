# Backend

该目录是 Semaphore 的 Foundry 后端工程。

## 合约能力

- 邀请码发放与认领
- 入场邀请请求
- 信号弹创建与父子链路
- 回答提交与作者授权阅读
- 阅读邀请发送与回复
- 阅后回响提交（私密礼物 / 公开评论）
- 信号弹失活，但保留后续链路

## 常用命令

```bash
cd backend
forge build
forge test
anvil
forge script script/DeployLocal.s.sol:DeployLocal --rpc-url http://127.0.0.1:8545 --broadcast
```
