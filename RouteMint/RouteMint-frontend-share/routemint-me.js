document.addEventListener("DOMContentLoaded", initProfilePage);

async function initProfilePage() {
  const core = window.RouteMintCore;
  await core.initChrome({ activeNav: "me" });

  const dom = {
    profileWalletText: document.getElementById("profileWalletText"),
    profileContractText: document.getElementById("profileContractText"),
    profilePromptCard: document.getElementById("profilePromptCard"),
    profileContent: document.getElementById("profileContent"),
    profileStatus: document.getElementById("profileStatus"),
    statReputation: document.getElementById("statReputation"),
    statAsked: document.getElementById("statAsked"),
    statReceived: document.getElementById("statReceived"),
    statAdopted: document.getElementById("statAdopted"),
    answersSummaryCount: document.getElementById("answersSummaryCount"),
    askedQuestionsList: document.getElementById("askedQuestionsList"),
    myAnswersList: document.getElementById("myAnswersList"),
  };

  core.onStateChange(() => {
    void renderProfile();
  });

  await renderProfile();

  async function renderProfile() {
    const state = core.getState();
    dom.profileWalletText.textContent = state.account ? core.shortAddress(state.account) : "未连接";
    dom.profileContractText.textContent = state.contractAddress
      ? core.shortAddress(state.contractAddress)
      : "未配置";

    if (!state.account) {
      dom.profilePromptCard.classList.remove("hidden");
      dom.profileContent.classList.add("hidden");
      dom.profileStatus.textContent = "先连接钱包，才能读取你的个人数据。";
      return;
    }

    if (!state.contractAddress) {
      dom.profilePromptCard.classList.remove("hidden");
      dom.profileContent.classList.add("hidden");
      dom.profileStatus.textContent = "先在链上设置里保存合约地址。";
      return;
    }

    try {
      dom.profilePromptCard.classList.add("hidden");
      dom.profileContent.classList.remove("hidden");
      dom.profileStatus.textContent = "正在读取你的经验记录...";

      const profile = await core.loadProfileData(state.account);
      const totalReceivedAnswers = profile.askedQuestions.reduce(
        (sum, question) => sum + Number(question.answerCount || 0),
        0
      );

      dom.statReputation.textContent = String(profile.reputation);
      dom.statAsked.textContent = String(profile.askedQuestions.length);
      dom.statReceived.textContent = String(totalReceivedAnswers);
      dom.statAdopted.textContent = String(profile.ratedAnswerCount);
      dom.answersSummaryCount.textContent = String(profile.answerRecords.length);

      dom.askedQuestionsList.innerHTML = profile.askedQuestions.length
        ? profile.askedQuestions
            .map((question) => {
              const body = core.getOffchainDoc(question.questionCID)?.body || "";
              const answerCount = Number(question.answerCount || 0);
              const responseLabel = answerCount
                ? `已收到 ${answerCount} 条回答`
                : "还没有收到回答";
              return `
                <article class="profile-question-card">
                  <div class="meta-row">
                    <span class="category-pill">${core.CATEGORY_LABELS[question.category] || "未知分类"}</span>
                    <span class="status-pill">${core.STATUS_LABELS[question.status] || "未知状态"}</span>
                  </div>
                  <h3>${core.escapeHtml(question.title)}</h3>
                  <p>${core.escapeHtml(summarize(body || "当前浏览器里没有保存这条问题的摘要。", 96))}</p>
                  <div class="profile-question-foot">
                    <span class="question-response-note ${answerCount ? "has-responses" : ""}">${responseLabel}</span>
                    <a class="btn btn-secondary btn-inline" href="./routemint-question.html?id=${question.id}">查看回答</a>
                  </div>
                </article>
              `;
            })
            .join("")
        : `
            <article class="empty-card soft-empty">
              <h2>你还没有提问</h2>
              <p>问过的问题会放在这里。</p>
            </article>
          `;

      dom.myAnswersList.innerHTML = profile.answerRecords.length
        ? profile.answerRecords
            .map((answer) => `
              <a class="profile-list-card" href="./routemint-question.html?id=${answer.questionId}">
                <div class="meta-row">
                  <span class="question-tag">${core.escapeHtml(answer.experienceTag)}</span>
                  <span class="rating-badge">${answer.rating ? `${answer.rating} 星反馈` : "还没有反馈"}</span>
                </div>
                <h3>${core.escapeHtml(answer.questionTitle)}</h3>
                <p>${core.escapeHtml(summarize(answer.body || "当前浏览器没有保存这条回答的本地正文。", 96))}</p>
              </a>
            `)
            .join("")
        : `
            <div class="profile-secondary-empty">你写过的回答会放在这里。</div>
          `;

      dom.profileStatus.textContent = `已读取 ${profile.askedQuestions.length} 个提问和 ${profile.answerRecords.length} 条回答。`;
    } catch (error) {
      dom.profileContent.classList.add("hidden");
      dom.profilePromptCard.classList.remove("hidden");
      dom.profileStatus.textContent = core.humanizeError(error);
    }
  }
}

function summarize(text, limit) {
  const clean = String(text || "").trim().replace(/\s+/g, " ");
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, limit).trim()}...`;
}
