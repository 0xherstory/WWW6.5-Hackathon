# 声音

声音收集和分享。
项目概览：
1、上传音频到 IPFS，把储存地址登记到Avalanche Fuji 测试网的合约里
*上链登记成功后，可以通过交易记录确认
2、浏览和播放

## 项目结构

- `ui/`：React + Vite 前端，负责上传、索引、详情卡、播放和钱包发起上链
- `backend/`：Express 上传服务，接收音频并转发到 Pinata/IPFS
- `contracts/`：Hardhat 合约工程，负责部署和测试 `SoundRegistry`
- `font/`：设计参考字体来源的下载地址

## 当前功能

- 单页声音索引，按 A-Z 展示声音条目
- 上传音频文件并写入名称、地点、日期、链接、注解
- 上传成功后立即进入详情卡
- 详情卡支持播放和拖动进度条
- 调起钱包，把 `ipfs://...` 内容地址登记到 Avalanche Fuji
- 登记成功后显示 `登记成功！`
- 链接过长时省略显示，并提供复制图标

## 技术栈

### 前端
- React 19
- TypeScript
- Vite
- Vitest + Testing Library
- ethers v6
- pinyin-pro

### 后端
- Express
- multer
- axios

### 合约
- Solidity 0.8.24
- Hardhat
- Avalanche Fuji

## 环境变量

### `ui/.env.local`

```env
VITE_SOUND_REGISTRY_ADDRESS=你的合约地址
```

### `backend/.env`

```env
PINATA_JWT=你的 Pinata JWT
PORT=3001
```

### `contracts/.env`

```env
DEPLOYER_PRIVATE_KEY=你的部署钱包私钥
```

## 本地启动

先分别安装依赖：

```bash
cd contracts && npm install
cd ../backend && npm install
cd ../ui && npm install
```

启动后端：

```bash
cd backend
npm run dev
```

启动前端：

```bash
cd ui
npm run dev
```

浏览器打开：

```text
http://127.0.0.1:5173
```

## 合约部署

先配置 `contracts/.env`，再执行：

```bash
cd contracts
npm run compile
npm run deploy:fuji
```

部署后，把输出的合约地址写到 `ui/.env.local` 的 `VITE_SOUND_REGISTRY_ADDRESS`。

## 测试与构建

前端测试：

```bash
cd ui
npm test
```

前端构建：

```bash
cd ui
npm run build
```

后端构建：

```bash
cd backend
npm run build
```

合约测试：

```bash
cd contracts
npm test
```