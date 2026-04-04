(function attachRouteMintCore() {
  const { ethers } = window;

  if (!ethers) {
    window.RouteMintCore = { missingEthers: true };
    return;
  }

  const STORAGE_KEYS = {
    contractAddress: "routemint.contractAddress",
    offchainDocs: "routemint.offchainDocs",
  };

  const AVALANCHE_FUJI = {
    chainId: 43113,
    chainIdHex: "0xa869",
    chainName: "Avalanche Fuji Testnet",
    nativeCurrency: {
      name: "AVAX",
      symbol: "AVAX",
      decimals: 18,
    },
    rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
    blockExplorerUrls: ["https://subnets-test.avax.network/c-chain"],
  };

  const CATEGORY_LABELS = ["留学 / 读研", "求职 / 转行", "创业 / 项目方向"];
  const STATUS_LABELS = ["正在收集经历", "已找到答案"];

  const ROUTEMINT_ABI = [
    {
      type: "function",
      name: "createQuestion",
      inputs: [
        { name: "title", type: "string", internalType: "string" },
        { name: "category", type: "uint8", internalType: "enum RouteMint.QuestionCategory" },
        { name: "questionCID", type: "string", internalType: "string" },
        { name: "stakeAmount", type: "uint256", internalType: "uint256" },
        { name: "rewardPool", type: "uint256", internalType: "uint256" },
      ],
      outputs: [{ name: "questionId", type: "uint256", internalType: "uint256" }],
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "submitAnswer",
      inputs: [
        { name: "questionId", type: "uint256", internalType: "uint256" },
        { name: "answerCID", type: "string", internalType: "string" },
        { name: "experienceTag", type: "string", internalType: "string" },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "rateAnswer",
      inputs: [
        { name: "questionId", type: "uint256", internalType: "uint256" },
        { name: "responder", type: "address", internalType: "address" },
        { name: "rating", type: "uint8", internalType: "uint8" },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "closeQuestion",
      inputs: [{ name: "questionId", type: "uint256", internalType: "uint256" }],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "getQuestion",
      inputs: [{ name: "questionId", type: "uint256", internalType: "uint256" }],
      outputs: [
        {
          name: "",
          type: "tuple",
          internalType: "struct RouteMint.Question",
          components: [
            { name: "asker", type: "address", internalType: "address" },
            { name: "title", type: "string", internalType: "string" },
            { name: "category", type: "uint8", internalType: "enum RouteMint.QuestionCategory" },
            { name: "questionCID", type: "string", internalType: "string" },
            { name: "stakeAmount", type: "uint256", internalType: "uint256" },
            { name: "rewardPool", type: "uint256", internalType: "uint256" },
            { name: "totalWeight", type: "uint256", internalType: "uint256" },
            { name: "answerCount", type: "uint256", internalType: "uint256" },
            { name: "status", type: "uint8", internalType: "enum RouteMint.QuestionStatus" },
            { name: "createdAt", type: "uint64", internalType: "uint64" },
          ],
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getAnswers",
      inputs: [{ name: "questionId", type: "uint256", internalType: "uint256" }],
      outputs: [
        {
          name: "",
          type: "tuple[]",
          internalType: "struct RouteMint.Answer[]",
          components: [
            { name: "responder", type: "address", internalType: "address" },
            { name: "answerCID", type: "string", internalType: "string" },
            { name: "experienceTag", type: "string", internalType: "string" },
            { name: "rating", type: "uint8", internalType: "uint8" },
          ],
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "nextQuestionId",
      inputs: [],
      outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "reputation",
      inputs: [{ name: "", type: "address", internalType: "address" }],
      outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      stateMutability: "view",
    },
  ];

  const state = {
    contractAddress: localStorage.getItem(STORAGE_KEYS.contractAddress) || "",
    account: "",
    currentChainId: null,
    walletProvider: null,
    signer: null,
  };

  const listeners = new Set();
  let chromeBound = false;
  let chromeNodes = null;

  async function initChrome(options = {}) {
    chromeNodes = cacheChromeNodes();
    markActiveNav(options.activeNav || "");
    bindChromeActions();
    refreshChromeUi();
    await connectIfPreviouslyAuthorized();
    refreshChromeUi();
  }

  function cacheChromeNodes() {
    return {
      connectButtons: document.querySelectorAll("[data-connect-wallet]"),
      openSettingsButtons: document.querySelectorAll("[data-open-settings]"),
      switchButtons: document.querySelectorAll("[data-switch-network]"),
      walletPill: document.getElementById("walletStatePill"),
      settingsModal: document.getElementById("settingsModal"),
      settingsCloseBtn: document.getElementById("settingsCloseBtn"),
      settingsSaveBtn: document.getElementById("settingsSaveBtn"),
      settingsBackdrop: document.querySelector("[data-close-settings]"),
      settingsContractInput: document.getElementById("settingsContractInput"),
      settingsStatus: document.getElementById("settingsStatus"),
      settingsWalletLine: document.getElementById("settingsWalletLine"),
      settingsNetworkLine: document.getElementById("settingsNetworkLine"),
      settingsContractLine: document.getElementById("settingsContractLine"),
    };
  }

  function bindChromeActions() {
    if (chromeBound || !chromeNodes) return;
    chromeBound = true;

    chromeNodes.connectButtons.forEach((button) => {
      button.addEventListener("click", () => {
        void connectWallet();
      });
    });

    chromeNodes.openSettingsButtons.forEach((button) => {
      button.addEventListener("click", openSettingsModal);
    });

    chromeNodes.switchButtons.forEach((button) => {
      button.addEventListener("click", () => {
        void switchToFuji();
      });
    });

    if (chromeNodes.settingsCloseBtn) {
      chromeNodes.settingsCloseBtn.addEventListener("click", closeSettingsModal);
    }
    if (chromeNodes.settingsBackdrop) {
      chromeNodes.settingsBackdrop.addEventListener("click", closeSettingsModal);
    }
    if (chromeNodes.settingsSaveBtn) {
      chromeNodes.settingsSaveBtn.addEventListener("click", async () => {
        try {
          saveContractAddress(chromeNodes.settingsContractInput.value.trim());
          setSettingsStatus("合约地址已保存。");
          notify();
        } catch (error) {
          setSettingsStatus(humanizeError(error));
        }
      });
    }

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => {
        void reconnectWallet();
      });
      window.ethereum.on("chainChanged", () => {
        void reconnectWallet();
      });
    }
  }

  function markActiveNav(activeKey) {
    document.querySelectorAll("[data-nav]").forEach((element) => {
      element.classList.toggle("is-active", element.getAttribute("data-nav") === activeKey);
    });
  }

  async function connectIfPreviouslyAuthorized() {
    if (!window.ethereum) return;

    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (!accounts?.length) return;
      await reconnectWallet();
    } catch (error) {
      setSettingsStatus(`读取钱包失败：${humanizeError(error)}`);
    }
  }

  async function connectWallet() {
    if (!window.ethereum) {
      setSettingsStatus("未检测到浏览器钱包。");
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      await reconnectWallet();
      setSettingsStatus("钱包已连接。");
    } catch (error) {
      setSettingsStatus(`连接钱包失败：${humanizeError(error)}`);
    }
  }

  async function reconnectWallet() {
    if (!window.ethereum) {
      state.account = "";
      state.currentChainId = null;
      state.walletProvider = null;
      state.signer = null;
      notify();
      return;
    }

    try {
      state.walletProvider = new ethers.BrowserProvider(window.ethereum);
      state.signer = await state.walletProvider.getSigner();
      state.account = await state.signer.getAddress();
      const network = await state.walletProvider.getNetwork();
      state.currentChainId = Number(network.chainId);
    } catch {
      state.account = "";
      state.currentChainId = null;
      state.walletProvider = null;
      state.signer = null;
    }

    notify();
  }

  async function switchToFuji() {
    if (!window.ethereum) {
      setSettingsStatus("未检测到浏览器钱包。");
      return;
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: AVALANCHE_FUJI.chainIdHex }],
      });
    } catch (error) {
      if (error?.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [AVALANCHE_FUJI],
        });
      } else {
        setSettingsStatus(`切换网络失败：${humanizeError(error)}`);
        return;
      }
    }

    await reconnectWallet();
    setSettingsStatus("已切换到 Avalanche Fuji。");
  }

  function saveContractAddress(raw) {
    if (!ethers.isAddress(raw)) {
      throw new Error("合约地址格式不对，请检查 0x 地址。");
    }

    state.contractAddress = ethers.getAddress(raw);
    localStorage.setItem(STORAGE_KEYS.contractAddress, state.contractAddress);
    if (chromeNodes?.settingsContractInput) {
      chromeNodes.settingsContractInput.value = state.contractAddress;
    }
    notify();
  }

  function refreshChromeUi() {
    if (!chromeNodes) return;

    const walletText = state.account
      ? `${shortAddress(state.account)}${state.currentChainId === AVALANCHE_FUJI.chainId ? " · Fuji" : ""}`
      : "未连接钱包";

    if (chromeNodes.walletPill) {
      chromeNodes.walletPill.textContent = walletText;
    }

    if (chromeNodes.settingsWalletLine) {
      chromeNodes.settingsWalletLine.textContent = state.account ? shortAddress(state.account) : "未连接";
    }
    if (chromeNodes.settingsNetworkLine) {
      chromeNodes.settingsNetworkLine.textContent = state.currentChainId === AVALANCHE_FUJI.chainId
        ? "Avalanche Fuji"
        : state.currentChainId
          ? `chainId ${state.currentChainId}`
          : "未连接";
    }
    if (chromeNodes.settingsContractLine) {
      chromeNodes.settingsContractLine.textContent = state.contractAddress
        ? shortAddress(state.contractAddress)
        : "未配置";
    }
    if (chromeNodes.settingsContractInput) {
      chromeNodes.settingsContractInput.value = state.contractAddress;
    }
  }

  function notify() {
    refreshChromeUi();
    listeners.forEach((listener) => listener(getState()));
  }

  function onStateChange(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function getState() {
    return {
      contractAddress: state.contractAddress,
      account: state.account,
      currentChainId: state.currentChainId,
    };
  }

  function openSettingsModal() {
    chromeNodes?.settingsModal?.classList.remove("hidden");
  }

  function closeSettingsModal() {
    chromeNodes?.settingsModal?.classList.add("hidden");
  }

  function setSettingsStatus(message) {
    if (chromeNodes?.settingsStatus) {
      chromeNodes.settingsStatus.textContent = message;
    }
  }

  function getReadContract() {
    if (!state.contractAddress || !ethers.isAddress(state.contractAddress)) {
      throw new Error("请先在链上设置里保存 RouteMint 合约地址。");
    }

    return new ethers.Contract(
      state.contractAddress,
      ROUTEMINT_ABI,
      new ethers.JsonRpcProvider(AVALANCHE_FUJI.rpcUrls[0])
    );
  }

  async function getWriteContract() {
    if (!state.account || !state.signer) {
      throw new Error("请先连接钱包。");
    }
    if (state.currentChainId !== AVALANCHE_FUJI.chainId) {
      throw new Error("请先切换到 Avalanche Fuji Testnet。");
    }
    if (!state.contractAddress || !ethers.isAddress(state.contractAddress)) {
      throw new Error("请先保存有效的合约地址。");
    }

    return new ethers.Contract(state.contractAddress, ROUTEMINT_ABI, state.signer);
  }

  async function loadAllQuestions() {
    const contract = getReadContract();
    const nextQuestionId = Number(await contract.nextQuestionId());
    if (!nextQuestionId) return [];

    const ids = Array.from({ length: nextQuestionId }, (_, index) => nextQuestionId - index);
    const questions = await Promise.all(
      ids.map(async (id) => {
        try {
          const raw = await contract.getQuestion(id);
          return normalizeQuestion(id, raw);
        } catch {
          return null;
        }
      })
    );

    return questions.filter(Boolean);
  }

  async function loadQuestionBundle(questionId) {
    const contract = getReadContract();
    const rawQuestion = await contract.getQuestion(questionId);
    const question = normalizeQuestion(questionId, rawQuestion);
    const answersRaw = await contract.getAnswers(questionId);
    const answers = await Promise.all(
      answersRaw.map(async (answer) => ({
        responder: answer.responder,
        answerCID: answer.answerCID,
        experienceTag: answer.experienceTag,
        rating: Number(answer.rating),
        reputation: Number(await contract.reputation(answer.responder)),
        body: getOffchainDoc(answer.answerCID)?.body || "",
      }))
    );

    return {
      question,
      answers,
      questionBody: getOffchainDoc(question.questionCID)?.body || "",
    };
  }

  async function createQuestion(params) {
    const contract = await getWriteContract();
    const reader = getReadContract();

    const title = String(params.title || "").trim();
    const category = Number(params.category);
    const questionBody = String(params.body || "").trim();
    const questionCID = String(params.questionCID || "").trim() || generateDemoCid("question");
    const stakeAmount = ethers.parseEther(String(params.stakeAvax || "0"));
    const rewardPool = ethers.parseEther(String(params.rewardAvax || "0"));
    const currentNextId = Number(await reader.nextQuestionId());
    const newQuestionId = currentNextId + 1;

    if (!title) {
      throw new Error("标题不能为空。");
    }

    storeOffchainDoc(questionCID, {
      type: "question",
      title,
      body: questionBody,
      savedAt: Date.now(),
    });

    const tx = await contract.createQuestion(title, category, questionCID, stakeAmount, rewardPool, {
      value: stakeAmount + rewardPool,
    });
    await tx.wait();

    return { questionId: newQuestionId, questionCID };
  }

  async function submitAnswer(questionId, params) {
    const contract = await getWriteContract();
    const experienceTag = String(params.experienceTag || "").trim();
    const answerBody = String(params.body || "").trim();
    const answerCID = String(params.answerCID || "").trim() || generateDemoCid("answer");

    if (!experienceTag) {
      throw new Error("经验标签不能为空。");
    }

    storeOffchainDoc(answerCID, {
      type: "answer",
      questionId,
      body: answerBody,
      savedAt: Date.now(),
    });

    const tx = await contract.submitAnswer(questionId, answerCID, experienceTag);
    await tx.wait();
    return { answerCID };
  }

  async function rateAnswer(questionId, responder, rating) {
    const contract = await getWriteContract();
    const tx = await contract.rateAnswer(questionId, responder, rating);
    await tx.wait();
  }

  async function closeQuestion(questionId) {
    const contract = await getWriteContract();
    const tx = await contract.closeQuestion(questionId);
    await tx.wait();
  }

  async function loadProfileData(account) {
    const reader = getReadContract();
    const reputation = Number(await reader.reputation(account));
    const questions = await loadAllQuestions();
    const askedQuestions = questions.filter(
      (question) => question.asker.toLowerCase() === account.toLowerCase()
    );

    const answerRecords = [];

    for (const question of questions) {
      const answers = await reader.getAnswers(question.id);
      answers.forEach((answer) => {
        if (answer.responder.toLowerCase() === account.toLowerCase()) {
          answerRecords.push({
            questionId: question.id,
            questionTitle: question.title,
            questionCategory: question.category,
            answerCID: answer.answerCID,
            experienceTag: answer.experienceTag,
            rating: Number(answer.rating),
            body: getOffchainDoc(answer.answerCID)?.body || "",
          });
        }
      });
    }

    return {
      reputation,
      askedQuestions,
      answerRecords,
      ratedAnswerCount: answerRecords.filter((item) => item.rating > 0).length,
    };
  }

  function normalizeQuestion(questionId, raw) {
    return {
      id: Number(questionId),
      asker: raw.asker,
      title: raw.title,
      category: Number(raw.category),
      questionCID: raw.questionCID,
      stakeAmount: raw.stakeAmount,
      rewardPool: raw.rewardPool,
      totalWeight: Number(raw.totalWeight),
      answerCount: Number(raw.answerCount),
      status: Number(raw.status),
      createdAt: Number(raw.createdAt),
    };
  }

  function loadOffchainDocs() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.offchainDocs) || "{}");
    } catch {
      return {};
    }
  }

  function storeOffchainDoc(cid, payload) {
    const docs = loadOffchainDocs();
    docs[cid] = payload;
    localStorage.setItem(STORAGE_KEYS.offchainDocs, JSON.stringify(docs));
  }

  function getOffchainDoc(cid) {
    if (!cid) return null;
    const docs = loadOffchainDocs();
    return docs[cid] || null;
  }

  function generateDemoCid(prefix) {
    return `demo-${prefix}-${Date.now()}`;
  }

  function getContractAddress() {
    return state.contractAddress;
  }

  function shortAddress(value) {
    if (!value) return "-";
    return `${value.slice(0, 6)}...${value.slice(-4)}`;
  }

  function formatAmount(value) {
    return Number(ethers.formatEther(value)).toFixed(4);
  }

  function humanizeError(error) {
    const text =
      error?.shortMessage ||
      error?.reason ||
      error?.info?.error?.message ||
      error?.message ||
      String(error);

    return String(text).replace(/^execution reverted: /i, "").trim();
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  window.RouteMintCore = {
    AVALANCHE_FUJI,
    CATEGORY_LABELS,
    STATUS_LABELS,
    initChrome,
    onStateChange,
    connectWallet,
    switchToFuji,
    saveContractAddress,
    getContractAddress,
    getState,
    loadAllQuestions,
    loadQuestionBundle,
    createQuestion,
    submitAnswer,
    rateAnswer,
    closeQuestion,
    loadProfileData,
    getOffchainDoc,
    storeOffchainDoc,
    generateDemoCid,
    shortAddress,
    formatAmount,
    humanizeError,
    escapeHtml,
  };
})();
