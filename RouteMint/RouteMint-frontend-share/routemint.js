document.addEventListener("DOMContentLoaded", initLandingPage);

async function initLandingPage() {
  const core = window.RouteMintCore;
  if (!core || core.missingEthers) {
    alert("钱包或 ethers.js 未加载成功，请刷新页面重试。");
    return;
  }

  await core.initChrome({ activeNav: "home" });
}
