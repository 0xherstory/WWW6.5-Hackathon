# 永恒花园 · Vercel 部署（GitHub 仓库）

Next.js 应用根目录为 **`永恒花园EternalGarden/ui`**。仓库整体是 monorepo 时，必须在 Vercel 里指定 **Root Directory**，否则会找不到 `package.json`。

## 1. 把代码推到 GitHub

确保仓库已 push，且包含 `永恒花园EternalGarden/ui/` 下的 `package.json`。

## 2. 在 Vercel 新建项目

1. 打开 [vercel.com](https://vercel.com) 并登录（可用 GitHub 账号）。
2. **Add New… → Project → Import** 你的 Git 仓库。
3. 在 **Configure Project** 页面找到 **Root Directory**：
   - 点 **Edit**，选或手动填写 **`永恒花园EternalGarden/ui`**。
4. **Framework Preset** 应自动识别为 **Next.js**；若无，请手动选 Next.js。
5. **Build Command**：`npm run build`（默认即可）  
   **Output Directory**：留空（Next 由平台处理）  
   **Install Command**：`npm install`（默认即可）
6. 点 **Deploy**。

部署成功后即可使用 `https://你的项目.vercel.app` 访问。

## 3. 以后每次 push

连接同一仓库后，**main**（或你配置的分支）有新提交，Vercel 会自动重新构建部署。

## 4. 测试说明（给帮你点链接的人）

- 只需浏览器，无需安装 Node。
- 链上功能需要浏览器钱包（如 MetaMask），网络为 **Avalanche Fuji**，并有一点测试币。

## 5. 常见问题

| 现象 | 处理 |
|------|------|
| Build 报找不到 `package.json` | 确认 Root Directory 为 **`永恒花园EternalGarden/ui`** |
| 构建失败与 Node 版本有关 | `ui` 下已写 `engines.node`；也可在 Vercel → Settings → Node.js Version 选 20.x |
| 环境变量 | 若日后把 WalletConnect `projectId` 挪到环境变量，在 Vercel → Settings → Environment Variables 添加 |

## 6. 关于生产构建（Webpack）

路径中含中文目录时，Next 16 默认的 **Turbopack** 生产构建可能报错。`package.json` 里已使用 `next build --webpack`，与 Vercel 兼容。
