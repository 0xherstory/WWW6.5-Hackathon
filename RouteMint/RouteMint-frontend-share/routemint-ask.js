document.addEventListener("DOMContentLoaded", initAskPage);

async function initAskPage() {
  const core = window.RouteMintCore;
  await core.initChrome({ activeNav: "ask" });

  const dom = {
    form: document.getElementById("askForm"),
    title: document.getElementById("questionTitleInput"),
    category: document.getElementById("questionCategoryInput"),
    body: document.getElementById("questionBodyInput"),
    cid: document.getElementById("questionCidInput"),
    stake: document.getElementById("stakeAmountInput"),
    reward: document.getElementById("rewardPoolInput"),
    total: document.getElementById("totalContributionText"),
    status: document.getElementById("askPageStatus"),
    connection: document.getElementById("askConnectionText"),
  };

  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  if (category !== null && ["0", "1", "2"].includes(category)) {
    dom.category.value = category;
  }

  dom.stake.addEventListener("input", updateContributionTotal);
  dom.reward.addEventListener("input", updateContributionTotal);
  dom.form.addEventListener("submit", (event) => {
    event.preventDefault();
    void submitQuestion();
  });

  core.onStateChange(refreshStatusLine);
  refreshStatusLine();
  updateContributionTotal();

  async function submitQuestion() {
    try {
      dom.status.textContent = "正在提交这个问题，等待钱包确认...";
      const result = await core.createQuestion({
        title: dom.title.value,
        category: dom.category.value,
        body: dom.body.value,
        questionCID: dom.cid.value,
        stakeAvax: dom.stake.value,
        rewardAvax: dom.reward.value,
      });
      dom.status.textContent = "问题已创建，正在跳转...";
      window.location.href = `./routemint-question.html?id=${result.questionId}`;
    } catch (error) {
      dom.status.textContent = core.humanizeError(error);
    }
  }

  function updateContributionTotal() {
    const total = (Number(dom.stake.value || 0) + Number(dom.reward.value || 0)).toFixed(4);
    dom.total.textContent = `${total} AVAX`;
  }

  function refreshStatusLine() {
    const state = core.getState();
    if (!state.account) {
      dom.connection.textContent = "先连接钱包，并在链上设置里保存合约地址。";
      return;
    }

    const walletText = core.shortAddress(state.account);
    dom.connection.textContent = state.contractAddress
      ? `已连接 ${walletText}，合约已准备好。`
      : `已连接 ${walletText}，还需要先保存合约地址。`;
  }
}
