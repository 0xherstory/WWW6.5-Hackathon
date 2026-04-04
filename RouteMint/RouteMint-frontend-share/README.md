# RouteMint Frontend Share

这是给 GitHub / 静态托管使用的 RouteMint 前端精简包，只保留产品页面、共享样式、共享脚本和 logo 资源。

## 目录说明

- `index.html`
  站点根入口，会跳转到 `routemint.html`
- `routemint.html`
  公共首页
- `routemint-app.html`
  产品内首页
- `routemint-ask.html`
  提问页
- `routemint-explore.html`
  浏览问题页
- `routemint-question.html`
  问题详情页
- `routemint-me.html`
  我的经验页
- `routemint.css`
  共享样式
- `routemint-core.js`
  共享链上交互逻辑
- `routemint-*.js`
  各页面脚本
- `assets/routemint-logo.png`
  当前 logo 资源

## 使用方式

这是纯静态前端，可以直接：

1. 上传到 GitHub 仓库
2. 用 Netlify / Vercel / GitHub Pages 托管

## 注意

- 需要在页面里保存 Avalanche Fuji 上的 RouteMint 合约地址后，链上交互才会正常工作。
- 当前 logo 文件仍然是 PNG 资源版本。
