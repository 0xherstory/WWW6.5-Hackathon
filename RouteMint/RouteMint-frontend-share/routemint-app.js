document.addEventListener("DOMContentLoaded", initAppHome);

async function initAppHome() {
  const core = window.RouteMintCore;
  if (!core || core.missingEthers) {
    alert("钱包或 ethers.js 未加载成功，请刷新页面重试。");
    return;
  }

  await core.initChrome({ activeNav: "home" });
  await renderSignals();
  core.onStateChange(() => {
    void renderSignals();
  });
}

async function renderSignals() {
  const core = window.RouteMintCore;
  const mountNode = document.getElementById("homeSignals");

  if (!core.getContractAddress()) {
    mountNode.innerHTML = `
      <article class="compact-item">
        <h3>先把合约地址接进来</h3>
        <p>右上角打开“链上设置”，把你部署在 Fuji 的 RouteMint 地址保存进来。</p>
      </article>
    `;
    return;
  }

  try {
    const questions = await core.loadAllQuestions();
    const latest = questions.slice(0, 2);

    if (!latest.length) {
      mountNode.innerHTML = `
        <article class="compact-item">
          <h3>这里还没有问题</h3>
          <p>你也可以先问第一个。</p>
        </article>
      `;
      return;
    }

    mountNode.innerHTML = latest
      .map((question) => {
        const body = core.getOffchainDoc(question.questionCID)?.body || "";
        return `
          <a class="compact-item" href="./routemint-question.html?id=${question.id}">
            <div class="compact-meta">
              <span class="category-pill">${core.CATEGORY_LABELS[question.category] || "未知分类"}</span>
              <span class="status-pill">${core.STATUS_LABELS[question.status] || "未知状态"}</span>
            </div>
            <h3>${core.escapeHtml(question.title)}</h3>
            <p>${core.escapeHtml(summarize(body || "这条问题已经在链上，但当前浏览器还没有本地摘要。", 88))}</p>
          </a>
        `;
      })
      .join("");
  } catch (error) {
    mountNode.innerHTML = `
      <article class="compact-item">
        <h3>暂时还没法读取问题</h3>
        <p>${core.escapeHtml(core.humanizeError(error))}</p>
      </article>
    `;
  }
}

function summarize(text, limit) {
  const clean = String(text || "").trim().replace(/\s+/g, " ");
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, limit).trim()}...`;
}
