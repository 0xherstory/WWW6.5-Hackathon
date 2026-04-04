document.addEventListener("DOMContentLoaded", initQuestionPage);

async function initQuestionPage() {
  const core = window.RouteMintCore;
  await core.initChrome({ activeNav: "browse" });

  const dom = {
    layout: document.getElementById("questionPageLayout"),
    contentLayout: document.getElementById("questionContentLayout"),
    empty: document.getElementById("questionEmptyState"),
    statusBanner: document.getElementById("questionStatusBanner"),
    pageStatus: document.getElementById("questionPageStatus"),
    answerHeadNote: document.getElementById("answerHeadNote"),
    askerPanel: document.getElementById("askerPanel"),
    responderPanel: document.getElementById("responderPanel"),
    closeQuestionBtn: document.getElementById("closeQuestionBtn"),
    submitAnswerForm: document.getElementById("submitAnswerForm"),
    answerTagInput: document.getElementById("answerTagInput"),
    answerBodyInput: document.getElementById("answerBodyInput"),
    answerCidInput: document.getElementById("answerCidInput"),
    questionStatusText: document.getElementById("questionStatusText"),
    questionCategoryText: document.getElementById("questionCategoryText"),
    questionTitleText: document.getElementById("questionTitleText"),
    questionLeadText: document.getElementById("questionLeadText"),
    questionAskerText: document.getElementById("questionAskerText"),
    questionStakeText: document.getElementById("questionStakeText"),
    questionRewardText: document.getElementById("questionRewardText"),
    questionAnswerCountText: document.getElementById("questionAnswerCountText"),
    questionBodyText: document.getElementById("questionBodyText"),
    answerFeed: document.getElementById("answerFeed"),
  };

  const questionId = Number(new URLSearchParams(window.location.search).get("id") || "0");

  if (!questionId) {
    dom.layout.classList.add("hidden");
    dom.contentLayout.classList.add("hidden");
    dom.empty.classList.remove("hidden");
    dom.statusBanner.textContent = "这个页面需要一个问题编号。";
    return;
  }

  dom.closeQuestionBtn.addEventListener("click", () => {
    void handleCloseQuestion();
  });
  dom.submitAnswerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    void handleSubmitAnswer();
  });

  core.onStateChange(() => {
    void loadQuestion();
  });

  await loadQuestion();

  async function loadQuestion() {
    try {
      const bundle = await core.loadQuestionBundle(questionId);
      const state = core.getState();
      const isAsker =
        state.account &&
        bundle.question.asker &&
        state.account.toLowerCase() === bundle.question.asker.toLowerCase();
      const isClosed = bundle.question.status === 1;
      const body =
        bundle.questionBody || "当前浏览器还没有保存这条问题的本地正文，但链上已经记录了这条提问。";

      dom.layout.classList.remove("hidden");
      dom.contentLayout.classList.remove("hidden");
      dom.empty.classList.add("hidden");

      dom.statusBanner.textContent = isClosed
        ? "这个问题已经结束，反馈和奖励分配都已完成。"
        : "你可以先看看这些回答；如果你是提问者，也可以直接打分。";

      dom.questionStatusText.textContent = core.STATUS_LABELS[bundle.question.status] || "未知状态";
      dom.questionCategoryText.textContent =
        core.CATEGORY_LABELS[bundle.question.category] || "未知分类";
      dom.questionTitleText.textContent = bundle.question.title;
      dom.questionLeadText.textContent = summarize(body, 120);
      dom.questionAskerText.textContent = core.shortAddress(bundle.question.asker);
      dom.questionStakeText.textContent = core.formatAmount(bundle.question.stakeAmount);
      dom.questionRewardText.textContent = core.formatAmount(bundle.question.rewardPool);
      dom.questionAnswerCountText.textContent = String(bundle.question.answerCount);
      dom.questionBodyText.textContent = body;

      dom.askerPanel.classList.toggle("hidden", !isAsker || isClosed);
      dom.responderPanel.classList.toggle("hidden", isAsker || isClosed);
      dom.answerHeadNote.textContent = isAsker
        ? "觉得有帮助，就给它一个明确反馈。"
        : "先看经验标签，再判断这条回答和你的情况像不像。";

      if (!bundle.answers.length) {
        dom.answerFeed.innerHTML = `
          <article class="empty-card soft-empty">
            <h2>还没有回答</h2>
            <p>如果你也走过类似的路，可以把你的经历留在这里。</p>
          </article>
        `;
      } else {
        dom.answerFeed.innerHTML = bundle.answers
          .map((answer) => {
            const canRate = isAsker && !isClosed && answer.rating === 0;
            return `
              <article class="answer-card">
                <div class="answer-card-head">
                  <div>
                    <span class="question-tag">${core.escapeHtml(answer.experienceTag)}</span>
                    <h3>${core.escapeHtml(answer.body ? "一条来自过来人的回答" : "链上已经记录了这条回答")}</h3>
                    <p class="answer-meta-text">来自 ${core.shortAddress(answer.responder)} · 当前声誉 ${answer.reputation}</p>
                  </div>
                  <span class="rating-badge">${answer.rating ? `${answer.rating} 星反馈` : "等待反馈"}</span>
                </div>
                <div class="body-panel">${core.escapeHtml(
                  answer.body || "当前浏览器没有保存这条回答的本地正文，但链上仍然记录了它的回答 CID 与经验标签。"
                )}</div>
                ${
                  canRate
                    ? `
                      <div class="rating-block">
                        <h4>这条回答对你有多有帮助？</h4>
                        <div class="rating-choice-row">
                          <button class="rating-choice" data-responder="${answer.responder}" data-rating="1" type="button">
                            <strong>有一点帮助</strong>
                            <span>轻量反馈</span>
                          </button>
                          <button class="rating-choice" data-responder="${answer.responder}" data-rating="2" type="button">
                            <strong>比较有帮助</strong>
                            <span>这条经验有实质参考价值</span>
                          </button>
                          <button class="rating-choice" data-responder="${answer.responder}" data-rating="3" type="button">
                            <strong>这条很有帮助</strong>
                            <span>更高奖励权重，也会带来更高声誉</span>
                          </button>
                        </div>
                      </div>
                    `
                    : ""
                }
              </article>
            `;
          })
          .join("");

        dom.answerFeed.querySelectorAll("[data-rating]").forEach((button) => {
          button.addEventListener("click", () => {
            const responder = button.getAttribute("data-responder");
            const rating = Number(button.getAttribute("data-rating"));
            void handleRateAnswer(responder, rating);
          });
        });
      }

      dom.pageStatus.textContent = isAsker
        ? "你当前是提问者，可以逐条评分；等你觉得够了，再结束这个问题。"
        : isClosed
          ? "这个问题已经结束，现在可以查看最终结果。"
          : "如果你也经历过类似的事，可以把你的回答留在右侧。";
    } catch (error) {
      dom.layout.classList.add("hidden");
      dom.contentLayout.classList.add("hidden");
      dom.empty.classList.remove("hidden");
      dom.statusBanner.textContent = core.humanizeError(error);
      dom.pageStatus.textContent = core.humanizeError(error);
    }
  }

  async function handleSubmitAnswer() {
    try {
      dom.pageStatus.textContent = "正在提交你的经历，等待钱包确认...";
      await core.submitAnswer(questionId, {
        experienceTag: dom.answerTagInput.value,
        body: dom.answerBodyInput.value,
        answerCID: dom.answerCidInput.value,
      });
      dom.submitAnswerForm.reset();
      dom.pageStatus.textContent = "你的经历已提交。";
      await loadQuestion();
    } catch (error) {
      dom.pageStatus.textContent = core.humanizeError(error);
    }
  }

  async function handleRateAnswer(responder, rating) {
    try {
      dom.pageStatus.textContent = `正在提交 ${rating} 星反馈...`;
      await core.rateAnswer(questionId, responder, rating);
      dom.pageStatus.textContent = "反馈已完成。";
      await loadQuestion();
    } catch (error) {
      dom.pageStatus.textContent = core.humanizeError(error);
    }
  }

  async function handleCloseQuestion() {
    try {
      dom.pageStatus.textContent = "正在结束这个问题并完成链上分配...";
      await core.closeQuestion(questionId);
      dom.pageStatus.textContent = "这个问题已经结束。";
      await loadQuestion();
    } catch (error) {
      dom.pageStatus.textContent = core.humanizeError(error);
    }
  }
}

function summarize(text, limit) {
  const clean = String(text || "").trim().replace(/\s+/g, " ");
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, limit).trim()}...`;
}
