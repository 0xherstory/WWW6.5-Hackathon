import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { avalancheFuji } from 'viem/chains';

const CONTRACT_ADDRESS = '0x88354c1858b6786810f23D4730297fd542d9E7D4';
const CONTRACT_ABI = [
  {
    inputs: [{ internalType: 'string', name: '_content', type: 'string' }],
    name: 'recordMemory',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getMemoryCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(),
});

const TAGS = ['Polygon PoS', 'IPFS / Arweave', 'ERC-20 BLOOM', '零知识证明', 'DID 去中心化身份', '智能合约', 'DAO 社区自治'];

let walletClient = null;
let address = null;

const state = {
  activePage: 'Home',
  activeTab: 'wish',
  userNickname: '花园居民',
  nicknameDraft: '花园居民',
  isEditingName: false,
  wishTitle: '',
  wishDesc: '',
  wishType: '',
  showConfessionEditor: false,
  confessionInput: '',
  willActivated: false,
  vaultStatus: 'guarding',
  vaultHeartbeat: '上次心跳确认：2026-03-31 20:00',
  countdown: { d: 0, h: 0, m: 0, s: 0 },
  willStatus: '⚪ 未激活',
  totalAssets: 7,
  beneficiaries: ['林小雨'],
  beneficiaryAddr: '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db',
  assetName: '',
  assetType: 'Crypto',
  showAssetModal: false,
  showWishProgress: false,
  wishProgress: 0,
  showIpfsProgress: false,
  ipfsProgress: 0,
  showKeyAnim: false,
  selectedWish: null,
  wishes: [
    {
      id: '1',
      status: 'progress',
      title: '🌅 想再看一次海边的日出',
      desc: '我已经两年没有出过门了。想在生命的最后，再看一次小时候常去的那片海。',
      time: '2026-03-28 发布 · 3位天使响应',
      match: 'matched',
      creator: '温风',
      creatorAddress: '0xabc001',
      isAnon: false,
    },
    {
      id: '2',
      status: 'done',
      title: '🎵 为孩子录一首摇篮曲',
      desc: '想给未满周岁的女儿留下妈妈的声音，等她长大了可以听到。',
      time: '2026-03-25 发布 · 已完成',
      match: 'matched',
      creator: '晚云',
      creatorAddress: '0xabc002',
      isAnon: false,
    },
    {
      id: '3',
      status: 'pending',
      title: '🎨 完成那幅未画完的画',
      desc: '画了一半的油画，是一片向日葵田。希望有人能帮我把它画完。',
      time: '2026-03-30 发布',
      match: '',
      creator: '匿名花园居民',
      creatorAddress: '0xabc003',
      isAnon: true,
    },
  ],
  confessions: [
    {
      id: 'c1',
      avatar: '匿',
      content: '今天又做了一个关于以前的梦，醒来的时候觉得好遗憾。但想想，能梦到也是一种幸运吧。',
      bg: '#B8CBB8',
      hearts: 24,
      time: '3小时前',
      creator: '匿名花园居民',
      creatorAddress: '0xanon01',
    },
    {
      id: 'c2',
      avatar: '安',
      content: '第一次来这里。不知道怎么开口，但看到大家的分享，觉得自己不那么孤单了。',
      bg: '#E8D1E8',
      hearts: 43,
      time: '5小时前',
      creator: '安宁',
      creatorAddress: '0xanon02',
    },
  ],
  assets: [
    { name: 'BTC冷钱包助记词加密包', type: 'Crypto', hash: 'QmX7b2...a3f1' },
    { name: '家庭影集 (1990-2020)', type: 'File', hash: 'QmR9k4...e7d2' },
  ],
};

let countdownTimer = null;
let hydrated = false;

function $(id) {
  return document.getElementById(id);
}

function shortAddr(a) {
  if (!a) return '';
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function showToast(msg) {
  const el = $('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  window.setTimeout(() => el.classList.remove('show'), 2500);
}

function resolveDisplayName(creator, creatorAddress) {
  return creatorAddress && creatorAddress.toLowerCase() === (address || '').toLowerCase() ? state.userNickname : creator;
}

function loadStorage() {
  try {
    const nick = localStorage.getItem('eg_userNickname');
    if (nick) {
      state.userNickname = nick;
      state.nicknameDraft = nick;
    }
    const w = localStorage.getItem('eg_wishes');
    if (w) state.wishes = JSON.parse(w);
    const c = localStorage.getItem('eg_confessions');
    if (c) state.confessions = JSON.parse(c);
    const ws = localStorage.getItem('eg_willStatus');
    if (ws) state.willStatus = ws;
    const ta = localStorage.getItem('eg_totalAssets');
    if (ta) state.totalAssets = Number(ta);
    const ben = localStorage.getItem('eg_beneficiaries');
    if (ben) state.beneficiaries = JSON.parse(ben);
  } catch {
    /* ignore */
  }
  hydrated = true;
}

function saveStorage() {
  if (!hydrated) return;
  try {
    localStorage.setItem('eg_userNickname', state.userNickname);
    localStorage.setItem('eg_wishes', JSON.stringify(state.wishes));
    localStorage.setItem('eg_confessions', JSON.stringify(state.confessions));
    localStorage.setItem('eg_willStatus', state.willStatus);
    localStorage.setItem('eg_totalAssets', String(state.totalAssets));
    localStorage.setItem('eg_beneficiaries', JSON.stringify(state.beneficiaries));
  } catch {
    /* ignore */
  }
}

function mountPetals() {
  const container = $('petalsContainer');
  if (!container) return;
  container.innerHTML = '';
  const colors = ['rgba(184,203,184,0.2)', 'rgba(232,209,232,0.18)', 'rgba(247,231,206,0.18)', 'rgba(168,197,168,0.15)'];
  for (let i = 0; i < 12; i += 1) {
    const p = document.createElement('div');
    p.className = 'petal';
    const s = Math.random() * 12 + 5;
    p.style.cssText = `width:${s}px;height:${s}px;left:${Math.random() * 100}%;background:${colors[i % 4]};animation-duration:${Math.random() * 16 + 12}s;animation-delay:${Math.random() * 12}s;`;
    container.appendChild(p);
  }
}

function renderWeb3Tags() {
  const el = $('web3Tags');
  if (!el) return;
  el.innerHTML = TAGS.map((t) => `<span class="web3-tag">${escapeHtml(t)}</span>`).join('');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function setActivePage(name) {
  state.activePage = name;
  document.querySelectorAll('.page').forEach((p) => {
    p.classList.toggle('active', p.dataset.page === name);
  });
  document.querySelectorAll('.bottom-nav .nav-item').forEach((b) => {
    b.classList.toggle('active', b.dataset.nav === name);
  });
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function renderServiceTabs() {
  const el = $('serviceTabs');
  if (!el) return;
  const tabs = [
    { id: 'wish', label: '心愿广场' },
    { id: 'legacy', label: '数字遗产' },
    { id: 'maze', label: '记忆迷宫' },
    { id: 'funeral', label: '临终丧葬' },
  ];
  el.innerHTML = tabs
    .map(
      (t) =>
        `<button type="button" class="tab-btn ${state.activeTab === t.id ? 'active' : ''}" data-tab="${t.id}">${t.label}</button>`,
    )
    .join('');
  el.querySelectorAll('[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.activeTab = btn.dataset.tab;
      renderServiceTabs();
      renderServicePanels();
    });
  });
}

function renderConfessionSection() {
  const el = $('confessionSection');
  if (!el) return;
  const rows = state.confessions
    .map(
      (i) => `
    <div class="confession-bubble">
      <div class="confession-avatar" style="background:${escapeHtml(i.bg)}">${escapeHtml(i.avatar)}</div>
      <div>
        <div class="confession-content">${escapeHtml(i.content)}</div>
        <div class="text-meta">发布者：${escapeHtml(resolveDisplayName(i.creator, i.creatorAddress))}</div>
        <div class="text-meta dim">♡ ${i.hearts} · ${escapeHtml(i.time)}</div>
      </div>
    </div>`,
    )
    .join('');
  el.innerHTML = `
    <div class="community-section-title">匿名倾诉圈</div>
    <div class="mb-row">
      <button type="button" class="btn-contact" id="btnToggleConfession">${state.showConfessionEditor ? '收起输入框' : '我也要倾诉'}</button>
    </div>
    ${
      state.showConfessionEditor
        ? `<div class="mb-block"><textarea class="form-textarea" id="confessionInput" placeholder="把想说的话轻轻放在这里...">${escapeHtml(state.confessionInput)}</textarea>
      <div class="row-end"><button type="button" class="btn-publish narrow" id="btnSendConfession">发送倾诉</button></div></div>`
        : ''
    }
    <div class="confessions">${rows}</div>`;

  el.querySelector('#btnToggleConfession')?.addEventListener('click', () => {
    state.showConfessionEditor = !state.showConfessionEditor;
    renderConfessionSection();
  });
  el.querySelector('#btnSendConfession')?.addEventListener('click', sendConfession);
  const ta = el.querySelector('#confessionInput');
  if (ta) {
    ta.addEventListener('input', (e) => {
      state.confessionInput = e.target.value;
    });
  }
}

function sendConfession() {
  const text = state.confessionInput.trim();
  if (!text) {
    showToast('⚠️ 请先输入倾诉内容');
    return;
  }
  state.confessions.unshift({
    id: String(Date.now()),
    avatar: '匿',
    content: text,
    bg: '#B8CBB8',
    hearts: 0,
    time: '刚刚',
    creator: state.userNickname,
    creatorAddress: address || '',
  });
  state.confessionInput = '';
  state.showConfessionEditor = false;
  saveStorage();
  renderConfessionSection();
  showToast('💚 你的倾诉已被温柔接住');
}

function renderWishPlaza() {
  return state.wishes
    .map((w) => {
      const st = w.status === 'pending' ? '待认领' : w.status === 'progress' ? '进行中' : '已完成';
      const btn = w.match
        ? `<button type="button" class="btn-match matched" data-stop>✅ 已匹配</button>`
        : `<button type="button" class="btn-match" data-match="${escapeHtml(w.id)}">🤖 AI 匹配</button>`;
      return `<div class="wish-card" data-wish="${escapeHtml(w.id)}">
        <div class="wish-status ${escapeHtml(w.status)}">${st}</div>
        <h4>${escapeHtml(w.title)}</h4>
        <p>${escapeHtml(w.desc)}</p>
        <div class="text-meta">发布者：${escapeHtml(resolveDisplayName(w.creator, w.creatorAddress))}</div>
        <div class="text-meta dim mb-3">${escapeHtml(w.time)}</div>
        ${btn}
      </div>`;
    })
    .join('');
}

function renderTabWish() {
  const el = $('tabWish');
  if (!el) return;
  const progressHtml = state.showWishProgress
    ? `<div class="progress-bar-container"><div class="progress-bar" style="width:${state.wishProgress}%"></div></div>`
    : '';
  el.innerHTML = `
    <div class="wish-layout">
      <div class="wish-form">
        <h3>✿ 发布心愿</h3>
        <div class="field"><label class="label">心愿标题</label><input class="form-input" id="wishTitle" value="${escapeHtml(state.wishTitle)}" placeholder="例：想再看一次海边的日出" /></div>
        <div class="field"><label class="label">心愿描述</label><textarea class="form-textarea" id="wishDesc" placeholder="描述你的心愿...">${escapeHtml(state.wishDesc)}</textarea></div>
        <div class="field"><label class="label">心愿类型</label>
          <select class="form-select" id="wishType">
            <option value="">请选择</option>
            <option value="experience">体验类</option>
            <option value="creation">创作类</option>
            <option value="connection">连接类</option>
            <option value="legacy">传承类</option>
          </select>
        </div>
        <div class="field"><label class="label">发布身份</label><div class="hint">已绑定 DID 地址发布：${escapeHtml(address || '')}</div></div>
        <div class="upload-zone">📎 点击或拖拽文件到此处</div>
        ${progressHtml}
        <button type="button" class="btn-publish mt-3" id="btnPublishWish">发布心愿</button>
      </div>
      <div class="wish-plaza" id="wishPlaza">${renderWishPlaza()}</div>
    </div>`;

  const sel = el.querySelector('#wishType');
  if (sel) sel.value = state.wishType;
  el.querySelector('#wishTitle')?.addEventListener('input', (e) => {
    state.wishTitle = e.target.value;
  });
  el.querySelector('#wishDesc')?.addEventListener('input', (e) => {
    state.wishDesc = e.target.value;
  });
  sel?.addEventListener('change', (e) => {
    state.wishType = e.target.value;
  });
  el.querySelector('#btnPublishWish')?.addEventListener('click', publishWish);
  el.querySelector('#wishPlaza')?.addEventListener('click', (e) => {
    const card = e.target.closest('.wish-card');
    const matchBtn = e.target.closest('[data-match]');
    if (matchBtn) {
      e.stopPropagation();
      matchAngel(matchBtn.dataset.match);
      return;
    }
    if (card && !e.target.closest('[data-stop]') && !e.target.closest('[data-match]')) {
      const id = card.dataset.wish;
      const w = state.wishes.find((x) => x.id === id);
      if (w) openWishModal(w);
    }
  });
}

function openWishModal(w) {
  state.selectedWish = w;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay show';
  overlay.id = 'dynamicWishModal';
  overlay.innerHTML = `<div class="modal" role="dialog">
    <h3 style="font-family:var(--font-title)">${escapeHtml(w.title)}</h3>
    <p class="text-meta" style="margin-top:.5rem">${escapeHtml(w.desc)}</p>
    <div class="mt-4 text-meta dim">发布者</div>
    <div class="mt-1">${w.isAnon ? '匿名花园居民' : escapeHtml(resolveDisplayName(w.creator, w.creatorAddress))}</div>
    <div class="row-end" style="margin-top:1.25rem"><button type="button" class="btn-secondary" id="closeWishModal">关闭</button></div>
  </div>`;
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);
  overlay.querySelector('#closeWishModal')?.addEventListener('click', () => overlay.remove());
}

function matchAngel(id) {
  showToast('🤖 AI 正在匹配心愿天使...');
  window.setTimeout(() => {
    state.wishes = state.wishes.map((w) =>
      w.id === id ? { ...w, status: 'progress', match: 'matched', time: `${w.time} · 温风已响应` } : w,
    );
    saveStorage();
    renderTabWish();
    showToast('💚 匹配成功！心愿天使「温风」已响应');
  }, 1500);
}

async function publishWish() {
  if (!state.wishTitle.trim()) {
    showToast('⚠️ 请输入心愿标题');
    return;
  }
  if (!walletClient || !address) {
    showToast('⚠️ 请先连接钱包');
    return;
  }
  showToast('📡 交易发送中...');
  state.showWishProgress = true;
  state.wishProgress = 0;
  renderTabWish();

  const iv = window.setInterval(() => {
    state.wishProgress = Math.min(95, state.wishProgress + Math.random() * 25 + 10);
    const bar = document.querySelector('#tabWish .progress-bar');
    if (bar) bar.style.width = `${state.wishProgress}%`;
  }, 300);

  try {
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'recordMemory',
      args: [`[实名] ${state.wishTitle}: ${state.wishDesc}`],
      account: address,
      chain: avalancheFuji,
    });
    await publicClient.waitForTransactionReceipt({ hash });
    window.clearInterval(iv);
    state.wishProgress = 100;
    const bar = document.querySelector('#tabWish .progress-bar');
    if (bar) bar.style.width = '100%';
    window.setTimeout(() => {
      state.showWishProgress = false;
      state.wishProgress = 0;
      state.wishes.unshift({
        id: String(Date.now()),
        status: 'pending',
        title: `✨ ${state.wishTitle}`,
        desc: state.wishDesc || '一个温暖的心愿，等待心愿天使的认领...',
        time: '刚刚发布',
        match: '',
        creator: state.userNickname,
        creatorAddress: address || '',
        isAnon: false,
      });
      state.wishTitle = '';
      state.wishDesc = '';
      state.wishType = '';
      saveStorage();
      void refreshMemoryCount();
      renderTabWish();
      showToast('✅ 心愿发布成功，已上链！');
    }, 600);
  } catch {
    window.clearInterval(iv);
    state.showWishProgress = false;
    state.wishProgress = 0;
    renderTabWish();
    showToast('❌ 交易取消或失败');
  }
}

function isAddrValid(v) {
  const t = v.trim();
  return /^0x[a-fA-F0-9]{40}$/.test(t) || /^0x[a-fA-F0-9]{3,6}\.\.\.[a-fA-F0-9]{3,6}$/.test(t);
}

function countdownText() {
  if (!state.willActivated) return '--:--:--:--';
  const { d, h, m, s } = state.countdown;
  return `${String(d).padStart(2, '0')}:${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function renderTabLegacy() {
  const el = $('tabLegacy');
  if (!el) return;
  const addrHint = state.beneficiaryAddr
    ? isAddrValid(state.beneficiaryAddr)
      ? '✅ 地址格式有效'
      : '❌ 地址格式无效'
    : '';
  el.innerHTML = `
    <div class="legacy-layout">
      <div class="vault">
        <div class="vault-identity">
          <div class="text-5xl mb-2">🌿</div>
          <div class="text-lg font-semibold mb-1">花园居民</div>
          <div class="vault-status ${state.vaultStatus === 'executing' ? 'executing' : 'guarding'}">${state.vaultStatus === 'executing' ? '🔴 执行中' : '🟢 守护中'}</div>
          <div class="text-meta dim">${escapeHtml(state.vaultHeartbeat)}</div>
        </div>
        <div class="vault-assets">
          <h4>📦 我的数字资产</h4>
          <div class="vault-asset-groups">
            <div>
              <div class="vault-asset-cat">💰 金融类</div>
              <div class="vault-asset-pill">🌚 BTC 冷钱包助记词（加密包）</div>
              <div class="vault-asset-pill">🏦 网银账户密钥</div>
            </div>
            <div>
              <div class="vault-asset-cat">📁 数据类</div>
              <div class="vault-asset-pill">☁️ 百度网盘 · 家庭影集</div>
              <div class="vault-asset-pill">📸 iCloud 照片库</div>
            </div>
            <div>
              <div class="vault-asset-cat">💬 社交类</div>
              <div class="vault-asset-pill">💚 微信账号遗言设置</div>
              <div class="vault-asset-pill">🖱️ Twitter 纪念账户</div>
              <div class="vault-asset-pill">🏛️ VR 纪念馆数据</div>
            </div>
          </div>
        </div>
      </div>
      <div class="legacy-right">
        <div class="deck-card">
          <div class="deck-card-title"><span class="deck-num">1</span>资产录入 Asset Registry</div>
          <table class="asset-table"><thead><tr><th>资产名称</th><th>类型</th><th>IPFS Hash</th></tr></thead>
          <tbody>${state.assets.map((a) => `<tr><td>${escapeHtml(a.name)}</td><td>${escapeHtml(a.type)}</td><td>${escapeHtml(a.hash)}</td></tr>`).join('')}</tbody></table>
          <button type="button" class="btn-dashed mt-3" id="btnAddAsset">+ 添加资产</button>
        </div>
        <div class="deck-card">
          <div class="deck-card-title"><span class="deck-num">2</span>受益人设置 Beneficiary Config</div>
          <input class="form-input mb-2" id="beneficiaryAddr" value="${escapeHtml(state.beneficiaryAddr)}" />
          <input class="form-input" id="beneficiaryName" value="${escapeHtml(state.beneficiaries[0] || '')}" placeholder="受益人姓名" />
          <div class="addr-hint ${isAddrValid(state.beneficiaryAddr) ? 'ok' : 'bad'}">${addrHint}</div>
        </div>
        <div class="deck-card">
          <div class="deck-card-title">
            <span class="deck-num">3</span>
            <span class="deck-title-wrap">
              <span class="deck-title-zh">执行控制</span>
              <span class="deck-title-en">Execution Control</span>
            </span>
          </div>
          <div class="text-center">
            ${
              !state.willActivated
                ? `<button type="button" class="btn-execute gold" id="btnActivateWill">🗝️ 存入遗嘱</button>`
                : `<button type="button" class="btn-execute green" id="btnConfirmAlive">💚 遗嘱已激活 — 刷新生存状态</button>
                   <button type="button" class="link-muted mt-2" id="btnExecuteLegacy">模拟执行（模拟用户失联）</button>`
            }
            <div class="mt-4"><label class="label">托管资产总数</label><input class="form-input mt-1" type="number" min="0" id="totalAssets" value="${state.totalAssets}" /></div>
            <div class="mt-4 label">生存确认倒计时</div>
            <div class="countdown-time">${countdownText()}</div>
            <div class="text-meta dim">天 : 时 : 分 : 秒</div>
          </div>
        </div>
      </div>
    </div>`;

  el.querySelector('#btnAddAsset')?.addEventListener('click', () => {
    state.showAssetModal = true;
    renderAssetModal();
  });
  el.querySelector('#beneficiaryAddr')?.addEventListener('input', (e) => {
    state.beneficiaryAddr = e.target.value;
    renderTabLegacy();
  });
  el.querySelector('#beneficiaryName')?.addEventListener('input', (e) => {
    state.beneficiaries = [e.target.value || '林小雨'];
    saveStorage();
  });
  el.querySelector('#btnActivateWill')?.addEventListener('click', activateWill);
  el.querySelector('#btnConfirmAlive')?.addEventListener('click', confirmAlive);
  el.querySelector('#btnExecuteLegacy')?.addEventListener('click', executeLegacy);
  el.querySelector('#totalAssets')?.addEventListener('change', (e) => {
    state.totalAssets = Number(e.target.value) || 0;
    saveStorage();
  });
}

function renderAssetModal() {
  let modal = $('assetModal');
  if (!state.showAssetModal) {
    if (modal) modal.remove();
    return;
  }
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'assetModal';
    modal.className = 'modal-overlay show';
    document.body.appendChild(modal);
  }
  modal.classList.add('show');
  const ipfs = state.showIpfsProgress
    ? `<div class="progress-bar-container"><div class="progress-bar" style="width:${state.ipfsProgress}%"></div></div>`
    : '';
  modal.innerHTML = `<div class="modal" role="dialog">
    <h3 style="font-family:var(--font-title)">添加数字资产</h3>
    <div class="field"><label class="label">资产名称</label><input class="form-input" id="assetNameInput" value="${escapeHtml(state.assetName)}" placeholder="例：家庭影像集" /></div>
    <div class="field"><label class="label">资产类型</label>
      <select class="form-select" id="assetTypeInput">
        <option value="Crypto">Crypto</option>
        <option value="File">File</option>
        <option value="Social">Social</option>
      </select>
    </div>
    <div class="upload-zone">📎 选择文件上传</div>
    ${ipfs}
    <div class="row-end gap"><button type="button" class="btn-secondary" id="assetCancel">取消</button><button type="button" class="btn-primary" id="assetUpload">上传 IPFS</button></div>
  </div>`;
  const sel = modal.querySelector('#assetTypeInput');
  if (sel) sel.value = state.assetType;
  modal.querySelector('#assetNameInput')?.addEventListener('input', (e) => {
    state.assetName = e.target.value;
  });
  sel?.addEventListener('change', (e) => {
    state.assetType = e.target.value;
  });
  modal.querySelector('#assetCancel')?.addEventListener('click', () => {
    state.showAssetModal = false;
    renderAssetModal();
  });
  modal.querySelector('#assetUpload')?.addEventListener('click', uploadToIpfs);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      state.showAssetModal = false;
      renderAssetModal();
    }
  });
}

function uploadToIpfs() {
  if (!state.assetName.trim()) {
    showToast('⚠️ 请输入资产名称');
    return;
  }
  showToast('📤 正在上传至 IPFS...');
  state.showIpfsProgress = true;
  state.ipfsProgress = 0;
  renderAssetModal();
  const iv = window.setInterval(() => {
    state.ipfsProgress = Math.min(100, state.ipfsProgress + Math.random() * 20 + 8);
    const bar = $('assetModal')?.querySelector('.progress-bar');
    if (bar) bar.style.width = `${state.ipfsProgress}%`;
    if (state.ipfsProgress >= 100) window.clearInterval(iv);
  }, 350);
  window.setTimeout(() => {
    window.clearInterval(iv);
    const hash = `Qm${Math.random().toString(36).slice(2, 8)}...${Math.random().toString(36).slice(2, 6)}`;
    state.assets.push({ name: state.assetName, type: state.assetType, hash });
    state.totalAssets += 1;
    state.assetName = '';
    state.showAssetModal = false;
    state.showIpfsProgress = false;
    state.ipfsProgress = 0;
    saveStorage();
    renderAssetModal();
    renderTabLegacy();
    showToast('✅ 资产已上传 IPFS 并保存到合约');
  }, 2600);
}

function activateWill() {
  showToast('📡 正在签署遗嘱合约 activateWill...');
  window.setTimeout(() => {
    state.willActivated = true;
    state.vaultStatus = 'guarding';
    state.vaultHeartbeat = '上次心跳确认：刚刚';
    state.countdown = { d: 29, h: 23, m: 59, s: 59 };
    state.willStatus = '🟢 遗嘱守护中';
    saveStorage();
    startCountdown();
    renderTabLegacy();
    renderMyPage();
    showToast('✅ 遗嘱已成功激活！生存确认倒计时开始');
  }, 1200);
}

function confirmAlive() {
  showToast('💚 正在调用 confirmAlive()...');
  window.setTimeout(() => {
    state.countdown = { d: 29, h: 23, m: 59, s: 59 };
    state.vaultHeartbeat = '上次心跳确认：刚刚';
    renderTabLegacy();
    showToast('✅ 生存状态已确认，倒计时已重置');
  }, 800);
}

function executeLegacy() {
  showToast('⚠️ 模拟用户失联 — 正在调用 executeLegacy()...');
  state.vaultStatus = 'executing';
  renderTabLegacy();
  window.setTimeout(() => {
    state.showKeyAnim = true;
    state.countdown = { d: 0, h: 0, m: 0, s: 0 };
    showKeyOverlay();
    window.setTimeout(() => {
      state.showKeyAnim = false;
      showToast('🗝️ 遗嘱已执行！资产已按计划转移至受益人。');
    }, 2500);
  }, 1000);
}

function showKeyOverlay() {
  const o = document.createElement('div');
  o.className = 'key-overlay';
  o.innerHTML = `<div class="key-inner"><div class="golden-key">🗝️</div><div class="key-title">遗嘱已成功激活</div></div>`;
  document.body.appendChild(o);
  window.setTimeout(() => o.remove(), 2500);
}

function startCountdown() {
  if (countdownTimer) window.clearInterval(countdownTimer);
  countdownTimer = window.setInterval(() => {
    if (!state.willActivated) return;
    let { d, h, m, s } = state.countdown;
    s -= 1;
    if (s < 0) {
      s = 59;
      m -= 1;
    }
    if (m < 0) {
      m = 59;
      h -= 1;
    }
    if (h < 0) {
      h = 23;
      d -= 1;
    }
    if (d < 0) state.countdown = { d: 0, h: 0, m: 0, s: 0 };
    else state.countdown = { d, h, m, s };
    const el = $('tabLegacy')?.querySelector('.countdown-time');
    if (el) el.textContent = countdownText();
  }, 1000);
}

function renderTabMaze() {
  const el = $('tabMaze');
  if (!el) return;
  el.innerHTML = `<div class="maze-container">
    <div class="maze-bg-glow"></div>
    <div class="maze-rings">
      <div class="maze-ring r1"></div><div class="maze-ring r2"></div><div class="maze-ring r3"></div><div class="maze-ring r4"></div>
      <div class="maze-center"></div>
    </div>
    <div class="text-white text-2xl mb-2" style="font-family:var(--font-title);position:relative;z-index:2">记忆迷宫</div>
    <div class="text-white-60 text-sm mb-8" style="position:relative;z-index:2;max-width:22rem">通过回答关于人生的问题，解锁属于你的记忆碎片，在迷宫深处构建独一无二的数字永生之魂。</div>
    <button type="button" class="btn-maze" id="btnEnterMaze">✦ 进入游戏</button>
  </div>`;
  el.querySelector('#btnEnterMaze')?.addEventListener('click', () => showToast('🎮 正在加载记忆迷宫...'));
}

function renderTabFuneral() {
  const el = $('tabFuneral');
  if (!el) return;
  const eco = [
    { i: '🏺', t: '可降解骨灰容器', d: '回归大地，滋养新生。' },
    { i: '💎', t: '生命晶石定制', d: '将思念凝为永恒的纪念。' },
    { i: '🌳', t: '花坛 / 树葬 / 壁葬', d: '在四季美景中，安然长眠。' },
  ];
  const cloud = [
    { i: '🏛️', t: 'VR 数字纪念馆', d: '创建专属的 3D 纪念空间。' },
    { i: '🎬', t: '"人生微电影"定制', d: '将珍贵影像制作成叙事影片。' },
    { i: '✨', t: '全息映射悼念空间', d: '实现跨越时空的对话。' },
  ];
  const mapItem = (f) =>
    `<div class="funeral-item"><div class="fi-icon">${f.i}</div><div><h5 class="text-sm font-semibold">${escapeHtml(f.t)}</h5><p class="text-meta">${escapeHtml(f.d)}</p></div></div>`;
  el.innerHTML = `<div class="funeral-layout">
    <div class="funeral-col"><h3 class="text-2xl">🌱 生态葬</h3><p class="text-meta italic mb-4">生命源于自然，亦归于自然</p><div class="space-y">${eco.map(mapItem).join('')}</div></div>
    <div class="funeral-col"><h3 class="text-2xl">☁️ 云祭祀</h3><p class="text-meta italic mb-4">在虚拟世界中，再现温暖时光</p><div class="space-y">${cloud.map(mapItem).join('')}</div></div>
  </div>`;
}

function renderServicePanels() {
  const map = { wish: 'tabWish', legacy: 'tabLegacy', maze: 'tabMaze', funeral: 'tabFuneral' };
  document.querySelectorAll('#pageServices .tab-content').forEach((n) => n.classList.remove('active'));
  const activeEl = $(map[state.activeTab]);
  if (activeEl) activeEl.classList.add('active');

  if (state.activeTab === 'wish') renderTabWish();
  else if (state.activeTab === 'legacy') renderTabLegacy();
  else if (state.activeTab === 'maze') renderTabMaze();
  else renderTabFuneral();
}

function joinedDays() {
  const start = new Date('2026-03-20T00:00:00');
  const diff = Date.now() - start.getTime();
  return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);
}

function renderMyPage() {
  const identity = $('myIdentity');
  const grid = $('myGrid');
  if (!identity || !grid) return;

  const pending = state.wishes.filter((w) => w.status === 'pending').length;
  const progress = state.wishes.filter((w) => w.status === 'progress').length;
  const done = state.wishes.filter((w) => w.status === 'done').length;
  const myWish = state.wishes.filter((w) => w.creatorAddress && address && w.creatorAddress.toLowerCase() === address.toLowerCase()).length;

  const nameBlock = state.isEditingName
    ? `<div class="name-row"><input class="form-input maxw" id="nicknameInput" value="${escapeHtml(state.nicknameDraft)}" /><button type="button" class="btn-publish narrow" id="saveNickname">保存</button></div>`
    : `<div class="name-row"><div class="text-xl font-semibold" style="font-family:var(--font-title)">${escapeHtml(state.userNickname)}</div><button type="button" class="my-link-btn" id="editNickname">编辑化名</button></div>`;

  identity.innerHTML = `<div class="avatar-lg">🌿</div>
    <div class="flex-1">${nameBlock}
      <div class="text-meta" style="font-family:var(--font-en)">DID: ${escapeHtml(address || '')} · Avalanche Fuji</div>
      <div class="flex gap mt-2 text-meta"><span>📅 加入第 <strong>${joinedDays()}</strong> 天</span><span>🌸 心愿天使 Lv.2</span><span>${escapeHtml(state.willStatus)}</span></div>
    </div>
    <div class="text-right"><div class="bloom-num">276</div><div class="text-meta">BLOOM 通证</div></div>`;

  identity.querySelector('#editNickname')?.addEventListener('click', () => {
    state.nicknameDraft = state.userNickname;
    state.isEditingName = true;
    renderMyPage();
  });
  identity.querySelector('#saveNickname')?.addEventListener('click', () => {
    const next = state.nicknameDraft.trim();
    if (!next) {
      showToast('⚠️ 化名不能为空');
      return;
    }
    state.userNickname = next;
    state.isEditingName = false;
    saveStorage();
    renderMyPage();
    renderConfessionSection();
    showToast('✅ 化名已保存');
  });
  identity.querySelector('#nicknameInput')?.addEventListener('input', (e) => {
    state.nicknameDraft = e.target.value;
  });

  grid.innerHTML = `
    <div class="my-card"><div class="text-base mb-2" style="font-family:var(--font-title)">✿ 我的心愿</div>
      <div class="my-stat-row"><span class="text-meta">我发布的心愿</span><span>${myWish}</span></div>
      <div class="my-stat-row"><span class="text-meta">待认领</span><span class="my-stat-badge badge-pink">${pending} 个</span></div>
      <div class="my-stat-row"><span class="text-meta">进行中</span><span class="my-stat-badge badge-green">${progress} 个</span></div>
      <div class="my-stat-row"><span class="text-meta">已完成</span><span class="my-stat-badge badge-gold">${done} 个</span></div>
      <button type="button" class="my-link-btn" data-goto="Services" data-tab="wish">前往心愿广场 →</button>
    </div>
    <div class="my-card"><div class="text-base mb-2" style="font-family:var(--font-title)">🗝️ 我的数字遗产</div>
      <div class="my-stat-row"><span class="text-meta">遗嘱状态</span><span class="my-stat-badge badge-green">${escapeHtml(state.willStatus)}</span></div>
      <div class="my-stat-row"><span class="text-meta">托管资产总数</span><span>${state.totalAssets} 项</span></div>
      <div class="my-stat-row"><span class="text-meta">受益人</span><span>${escapeHtml(state.beneficiaries.join('、'))}</span></div>
      <button type="button" class="my-link-btn" data-goto="Services" data-tab="legacy">前往遗产管理 →</button>
    </div>
    <div class="my-card"><div class="text-base mb-2" style="font-family:var(--font-title)">🤝 我的社区贡献</div>
      <div class="my-stat-row"><span class="text-meta">完成互助任务</span><span>6 次</span></div>
      <div class="my-stat-row"><span class="text-meta">累计获得 BLOOM</span><span style="color:var(--primary-dark)">+186</span></div>
      <div class="my-stat-row"><span class="text-meta">倾诉圈收到的 ♡</span><span>235</span></div>
      <button type="button" class="my-link-btn" data-goto="Community">前往互助社区 →</button>
    </div>
    <div class="my-card"><div class="text-base mb-2" style="font-family:var(--font-title)">📖 生命故事档案</div>
      <div class="archive-summary">
        <div class="archive-stat"><div class="stat-num">4</div><div class="text-meta">文字</div></div>
        <div class="archive-stat"><div class="stat-num">2</div><div class="text-meta">语音</div></div>
        <div class="archive-stat"><div class="stat-num">3</div><div class="text-meta">影像</div></div>
        <div class="archive-stat"><div class="stat-num">9</div><div class="text-meta">总计</div></div>
      </div>
      <button type="button" class="my-link-btn" data-goto="Community">前往档案馆 →</button>
    </div>`;

  grid.querySelectorAll('[data-goto]').forEach((b) => {
    b.addEventListener('click', () => {
      setActivePage(b.dataset.goto);
      if (b.dataset.tab) {
        state.activeTab = b.dataset.tab;
        renderServiceTabs();
      }
      renderServicePanels();
    });
  });
}

async function refreshMemoryCount() {
  try {
    const count = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'getMemoryCount',
    });
    const el = $('memoryCount');
    if (el) el.textContent = count.toString();
  } catch {
    const el = $('memoryCount');
    if (el) el.textContent = '—';
  }
}

async function ensureFujiChain() {
  if (!walletClient) return;
  try {
    await walletClient.switchChain({ id: avalancheFuji.id });
  } catch {
    try {
      await walletClient.addChain({ chain: avalancheFuji });
    } catch (e) {
      showToast('请切换到 Avalanche Fuji 测试网');
      throw e;
    }
  }
}

async function connectWallet() {
  const hint = $('connectHint');
  if (!window.ethereum) {
    if (hint) hint.textContent = '未检测到钱包，请安装 MetaMask 等浏览器钱包。';
    showToast('未检测到 window.ethereum');
    return;
  }
  walletClient = createWalletClient({ chain: avalancheFuji, transport: custom(window.ethereum) });
  try {
    await ensureFujiChain();
    const [addr] = await walletClient.requestAddresses();
    address = addr;
    if (hint) hint.textContent = '';
    $('walletGate')?.classList.add('hidden');
    $('appRoot')?.classList.remove('hidden');
    const wa = $('walletAddress');
    if (wa) wa.textContent = shortAddr(address);
    await refreshMemoryCount();
    renderWeb3Tags();
    renderConfessionSection();
    renderServiceTabs();
    renderServicePanels();
    renderMyPage();
    setActivePage('Home');
  } catch (e) {
    if (hint) hint.textContent = e instanceof Error ? e.message : String(e);
  }
}

function disconnectWallet() {
  walletClient = null;
  address = null;
  $('appRoot')?.classList.add('hidden');
  $('walletGate')?.classList.remove('hidden');
  const wa = $('walletAddress');
  if (wa) wa.textContent = '';
}

function init() {
  loadStorage();
  mountPetals();
  renderWeb3Tags();
  void refreshMemoryCount();

  $('btnConnect')?.addEventListener('click', connectWallet);
  $('btnDisconnect')?.addEventListener('click', disconnectWallet);

  document.querySelectorAll('.bottom-nav .nav-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      setActivePage(btn.dataset.nav);
      if (btn.dataset.nav === 'Services') {
        renderServiceTabs();
        renderServicePanels();
      }
      if (btn.dataset.nav === 'Community') renderConfessionSection();
      if (btn.dataset.nav === 'My') renderMyPage();
    });
  });

  window.addEventListener('beforeunload', saveStorage);
}

init();
