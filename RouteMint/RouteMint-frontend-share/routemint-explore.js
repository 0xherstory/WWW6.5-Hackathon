document.addEventListener("DOMContentLoaded", initExplorePage);

async function initExplorePage() {
  const core = window.RouteMintCore;
  if (!core || core.missingEthers) {
    alert("钱包或 ethers.js 未加载成功，请刷新页面重试。");
    return;
  }

  await core.initChrome({ activeNav: "browse" });

  const dom = {
    filters: document.getElementById("exploreFilters"),
    list: document.getElementById("exploreList"),
  };

  let activeCategory = new URLSearchParams(window.location.search).get("category") || "all";
  if (!["all", "0", "1", "2"].includes(activeCategory)) {
    activeCategory = "all";
  }

  dom.filters.querySelectorAll("[data-category]").forEach((button) => {
    button.classList.toggle("is-active", button.getAttribute("data-category") === activeCategory);
    button.addEventListener("click", () => {
      activeCategory = button.getAttribute("data-category") || "all";
      dom.filters.querySelectorAll("[data-category]").forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });
      void renderList();
    });
  });

  await renderList();
  core.onStateChange(() => {
    void renderList();
  });

  async function renderList() {
    if (!core.getContractAddress()) {
      dom.list.innerHTML = `
        <article class="empty-card soft-empty">
          <h2>先把合约接进来</h2>
          <p>右上角打开“链上设置”，保存你部署在 Avalanche Fuji 的 RouteMint 地址。</p>
        </article>
      `;
      return;
    }

    try {
      const questions = await core.loadAllQuestions();
      const filtered = activeCategory === "all"
        ? questions
        : questions.filter((question) => String(question.category) === activeCategory);

      if (!filtered.length) {
        dom.list.innerHTML = `
          <article class="empty-card soft-empty">
            <h2>这个场景下还没有问题</h2>
            <p>你可以先开始提问，或者切到其他场景看看。</p>
          </article>
        `;
        return;
      }

      dom.list.innerHTML = filtered
        .map((question) => {
          const body = core.getOffchainDoc(question.questionCID)?.body || "";
          return `
            <a class="explore-card" href="./routemint-question.html?id=${question.id}">
              <div class="meta-row">
                <span class="category-pill">${core.CATEGORY_LABELS[question.category] || "未知分类"}</span>
                <span class="status-pill">${core.STATUS_LABELS[question.status] || "未知状态"}</span>
              </div>
              <h2>${core.escapeHtml(question.title)}</h2>
              <p>${core.escapeHtml(summarize(body || "当前浏览器没有保存这条问题的本地摘要。", 112))}</p>
              <div class="explore-card-foot">
                <span class="quiet-chip">奖励池 ${core.formatAmount(question.rewardPool)} AVAX</span>
                <span class="quiet-chip">${question.answerCount} 条回答</span>
              </div>
            </a>
          `;
        })
        .join("");
    } catch (error) {
      dom.list.innerHTML = `
        <article class="empty-card soft-empty">
          <h2>暂时还没法读取问题</h2>
          <p>${core.escapeHtml(core.humanizeError(error))}</p>
        </article>
      `;
    }
  }
}

function summarize(text, limit) {
  const clean = String(text || "").trim().replace(/\s+/g, " ");
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, limit).trim()}...`;
}
