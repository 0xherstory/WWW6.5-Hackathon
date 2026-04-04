
export default function IntroPage({ onEnterDemo }) {
  return (
    <div style={s.page}>

      {/* ─── Hero ───────────────────────────────────────────── */}
      <section style={s.hero}>
        <div style={s.heroBg} />
        <div style={s.heroContent}>
          <h1 style={s.heroTitle}>GirlsVault</h1>
          <p style={s.heroSub}>让每一笔善款都看得见</p>
          <div style={s.heroDivider} />
          <p style={s.heroDesc}>
            透明资助偏远地区女童的链上公益协议
          </p>
          <div style={s.badges}>
            <span style={s.badge}>Avalanche Fuji Testnet</span>
            <span style={s.badge}>Solidity 0.8.20</span>
            <span style={s.badge}>The Graph</span>
            <span style={s.badge}>IPFS · Pinata</span>
            <span style={s.badge}>ERC-721 SBT</span>
          </div>
          <button style={s.cta} onClick={onEnterDemo}>进入链上演示 →</button>
        </div>
      </section>

      {/* ─── 起源 ───────────────────────────────────────────── */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <SectionLabel>项目起源</SectionLabel>
          <h2 style={s.h2}>这个项目是怎么来的</h2>
          <div style={s.originBlock}>
            <p style={s.originText}>
              传统公益捐款存在一个根本问题：<strong style={{ color: "#f9a8d4" }}>资金流向不透明</strong>。
              捐款人不知道钱去了哪里，受益方拿到多少全靠机构自报，中间管理费层层抽取，
              真正到受益人手里的比例难以核实。
            </p>
            <p style={s.originText}>
              GirlsVault 用智能合约解决这个问题：资金锁在合约里，不经过任何机构账户，
              只有里程碑被验证人确认后才会自动释放到受益方地址，
              每一笔转账都在链上公开可查。
            </p>
          </div>
        </div>
      </section>

      {/* ─── 问题 ───────────────────────────────────────────── */}
      <section style={{ ...s.section, background: "rgba(239,68,68,0.04)", borderTop: "1px solid rgba(239,68,68,0.1)", borderBottom: "1px solid rgba(239,68,68,0.1)" }}>
        <div style={s.sectionInner}>
          <SectionLabel color="#f87171">传统公益的问题</SectionLabel>
          <h2 style={s.h2}>为什么需要 GirlsVault</h2>
          <div style={s.grid3}>
            {[
              { icon: "🔒", title: "资金不透明", desc: "捐款经多层机构转手，到达女童手中的金额无法核实，中间管理费层层抽取" },
              { icon: "⚠️", title: "挪用风险高", desc: "中间机构完全控制资金，缺乏强制约束机制，项目方跑路难以追责" },
              { icon: "🌍", title: "跨境摩擦大", desc: "国际捐款手续费高、到账慢，部分地区金融封锁，受益方收款困难" },
              { icon: "📋", title: "执行无约束", desc: "项目执行情况靠机构单方面汇报，捐款人无法独立验证资金是否真正落地" },
              { icon: "🎭", title: "验证人可造假", desc: "无经济约束的志愿者验证机制容易被买通或串谋，缺乏信任成本" },
              { icon: "🪪", title: "捐款凭证易伪造", desc: "传统捐款收据可被伪造，无法证明链上可信的公益参与记录" },
            ].map((item) => (
              <div key={item.title} style={s.problemCard}>
                <div style={s.cardIcon}>{item.icon}</div>
                <div style={s.cardTitle}>{item.title}</div>
                <div style={s.cardDesc}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 运作流程 ───────────────────────────────────────── */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <SectionLabel>运作机制</SectionLabel>
          <h2 style={s.h2}>一个项目的完整生命周期</h2>
          <div style={s.lifecycle}>
            {[
              {
                step: "01", color: "#8b5cf6", icon: "🚀", title: "项目发起",
                desc: "项目方通过 Registry 合约创建项目合约，设定募集目标、受益方地址、验证人名单（M-of-N 多签）及质押要求。",
              },
              {
                step: "02", color: "#3b82f6", icon: "💰", title: "专项捐款",
                desc: "捐款人连接钱包，选择专项用途（教育 / 餐食 / 医疗 / 物资 / 交通），资金直接锁入项目合约，同时自动铸造 SBT 徽章作为永久凭证。",
              },
              {
                step: "03", color: "#06b6d4", icon: "📋", title: "执行与验证",
                desc: "本地志愿者（验证人）质押保证金后，在里程碑完成时上传照片和文字说明至 IPFS，将内容哈希写入合约。M 个验证人签名后，里程碑进入「已验证」状态。",
              },
              {
                step: "04", color: "#f59e0b", icon: "⚖️", title: "3 天争议窗口",
                desc: "里程碑验证后有 3 天挑战期。捐款人若认为验证造假，可提交反证并缴纳保证金发起挑战，社区捐款人按捐款额加权投票，7 天后自动结算。",
              },
              {
                step: "05", color: "#22c55e", icon: "💸", title: "资金释放",
                desc: "无挑战且 3 天窗口结束后，任何人可调用 releaseMilestone() 释放资金给受益方。保障池余额（失败举报的保证金）在最后里程碑完成时一并转给受益方。",
              },
              {
                step: "06", color: "#ec4899", icon: "🛡️", title: "异常保护",
                desc: "超过 180 天无里程碑推进，捐款人可发起紧急退款投票。投票额超过总捐款 50% 时，合约允许按比例手动领取退款。",
              },
            ].map((item, i) => (
              <div key={item.step} style={s.lifecycleItem}>
                <div style={{ ...s.lifecycleStep, background: item.color + "22", borderColor: item.color + "66", color: item.color }}>
                  {item.step}
                </div>
                {i < 5 && <div style={s.lifecycleLine} />}
                <div style={s.lifecycleBody}>
                  <div style={s.lifecycleIcon}>{item.icon}</div>
                  <div style={s.lifecycleTitle}>{item.title}</div>
                  <div style={s.lifecycleDesc}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 为什么上链 ─────────────────────────────────────── */}
      <section style={{ ...s.section, background: "rgba(139,92,246,0.05)", borderTop: "1px solid rgba(139,92,246,0.15)", borderBottom: "1px solid rgba(139,92,246,0.15)" }}>
        <div style={s.sectionInner}>
          <SectionLabel>区块链的价值</SectionLabel>
          <h2 style={s.h2}>为什么选择上链</h2>
          <p style={{ color: "#9ca3af", marginBottom: 32, fontSize: 15, lineHeight: 1.7 }}>
            很多事情可以用传统方式做，但有些问题只有区块链能真正解决：
          </p>
          <div style={s.compareTable}>
            <div style={s.compareHeader}>
              <div style={{ flex: 1 }}>传统公益的痛点</div>
              <div style={{ flex: 1, color: "#a78bfa", textAlign: "right" }}>GirlsVault 的解法</div>
            </div>
            {[
              ["资金流向全靠机构自报", "所有交易链上永久可查，第三方可独立验证"],
              ["项目执行没有强制约束", "资金锁在合约，不验证里程碑就不释放"],
              ["中间机构抽取管理费", "智能合约点对点执行，零中间损耗"],
              ["验证人可能造假", "质押机制 + 社区举报投票，造假代价是全部质押被没收"],
              ["项目方跑路风险", "180 天无活动触发退款投票；举报成立时自动退款"],
              ["发起人信誉无法核实", "历史完成率全从链上计算，不可伪造"],
              ["捐款凭证可被伪造", "SBT 灵魂绑定 NFT，绑定捐款人地址，不可转让"],
            ].map(([prob, sol], i) => (
              <div key={i} style={s.compareRow}>
                <div style={s.compareProb}>
                  <span style={{ color: "#f87171", marginRight: 8 }}>✗</span>{prob}
                </div>
                <div style={s.compareSol}>
                  <span style={{ color: "#34d399", marginRight: 8 }}>✓</span>{sol}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 核心功能 ───────────────────────────────────────── */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <SectionLabel>核心功能</SectionLabel>
          <h2 style={s.h2}>九大功能模块</h2>
          <div style={s.featureGrid}>
            {[
              {
                icon: "🏦", color: "#8b5cf6", title: "里程碑式资金释放",
                subtitle: "Optimistic Release",
                desc: "里程碑在 M-of-N 验证后进入「已验证」状态，3 天争议窗口无挑战后自动可释放，任何人可调用 releaseMilestone() 触发转账。",
              },
              {
                icon: "🔐", color: "#3b82f6", title: "验证人质押机制",
                subtitle: "Validator Staking",
                desc: "验证人提交证明前必须先质押保证金。举报成立时质押 100% 没收奖励给举报人；项目正常完成可调用 withdrawStake() 取回。",
              },
              {
                icon: "⚖️", color: "#f59e0b", title: "里程碑挑战机制",
                subtitle: "Challenge & Vote",
                desc: "捐款人可缴纳保证金发起挑战，其他捐款人按捐款额加权投票。挑战成立：验证人质押没收 + 自动退款；不成立：保证金进保障池。",
              },
              {
                icon: "✍️", color: "#06b6d4", title: "EIP-712 聚合签名",
                subtitle: "Off-chain Multi-sig",
                desc: "验证人链下结构化签名，任何人将签名聚合后一笔交易提交上链。N 个验证人只需 1 笔交易，节省 gas 并降低操作门槛。",
              },
              {
                icon: "🏷️", color: "#ec4899", title: "专项捐款标签",
                subtitle: "Tagged Donations",
                desc: "捐款时选择用途：📚 教育 / 🍱 餐食 / 🏥 医疗 / 📦 物资 / 🚌 交通。各专项余额独立记录在 tagBalances 中，确保专款专用。",
              },
              {
                icon: "🎖️", color: "#22c55e", title: "SBT 公益徽章",
                subtitle: "Soulbound Token",
                desc: "每笔捐款触发一次 SBT mint，记录金额、项目、标签和时间戳。transferFrom 直接 revert，永久绑定捐款人地址，不可伪造。",
              },
              {
                icon: "📁", color: "#f97316", title: "IPFS 凭证存储",
                subtitle: "Content Addressing",
                desc: "验证人上传的图片和说明存入 IPFS（Pinata），CID 哈希写入合约。内容寻址意味着 CID 一致则内容无法被篡改或替换。",
              },
              {
                icon: "🔄", color: "#a855f7", title: "自动退款",
                subtitle: "Auto Refund",
                desc: "举报成立时合约自动遍历所有捐款人，按各自比例直接打回钱包。转账失败时保留 donorBalance 供手动领取，无需人工介入。",
              },
              {
                icon: "🛡️", color: "#14b8a6", title: "紧急退款保护",
                subtitle: "Emergency Refund",
                desc: "lastActivityAt 记录最近活动时间。超 180 天无推进，捐款人可投票。累计超过 50% 后，按比例可手动领取退款，顺序无关。",
              },
            ].map((f) => (
              <div key={f.title} style={{ ...s.featureCard, borderColor: f.color + "33" }}>
                <div style={{ ...s.featureIcon, background: f.color + "1a", color: f.color }}>{f.icon}</div>
                <div style={s.featureTitle}>{f.title}</div>
                <div style={{ ...s.featureSub, color: f.color + "cc" }}>{f.subtitle}</div>
                <div style={s.featureDesc}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 技术栈 ─────────────────────────────────────────── */}
      <section style={{ ...s.section, background: "rgba(6,182,212,0.04)", borderTop: "1px solid rgba(6,182,212,0.12)", borderBottom: "1px solid rgba(6,182,212,0.12)" }}>
        <div style={s.sectionInner}>
          <SectionLabel color="#22d3ee">技术栈</SectionLabel>
          <h2 style={s.h2}>构建于成熟的 Web3 基础设施</h2>
          <div style={s.grid2x2}>
            <div style={s.techCard}>
              <div style={{ ...s.techHeader, color: "#a78bfa" }}>⛓️ 智能合约</div>
              <TechRow label="语言" value="Solidity 0.8.20" />
              <TechRow label="框架" value="Hardhat 2.x" />
              <TechRow label="安全" value="ReentrancyGuard（内联）" />
              <TechRow label="多签" value="EIP-712 结构化签名" />
              <TechRow label="代币" value="ERC-721 变体（SBT）" />
              <TechRow label="网络" value="Avalanche Fuji C-Chain" />
              <TechRow label="架构" value="Registry + Project + SBT" />
            </div>
            <div style={s.techCard}>
              <div style={{ ...s.techHeader, color: "#67e8f9" }}>🖥️ 前端</div>
              <TechRow label="框架" value="React 19 + Vite 6" />
              <TechRow label="链交互" value="ethers.js v6" />
              <TechRow label="批量读取" value="Multicall3（2 轮聚合）" />
              <TechRow label="钱包" value="MetaMask / Core Wallet" />
              <TechRow label="存储" value="Pinata IPFS API" />
              <TechRow label="索引" value="The Graph GraphQL" />
              <TechRow label="部署" value="Vercel CI/CD" />
            </div>
            <div style={s.techCard}>
              <div style={{ ...s.techHeader, color: "#86efac" }}>📊 子图（The Graph）</div>
              <TechRow label="语言" value="AssemblyScript" />
              <TechRow label="网络" value="Avalanche Fuji" />
              <TechRow label="索引实体" value="7 个实体类型" />
              <TechRow label="监听事件" value="10 种合约事件" />
              <TechRow label="降级" value="本地自动降级 RPC 读取" />
              <div style={{ marginTop: 16, padding: "8px 12px", background: "rgba(134,239,172,0.08)", borderRadius: 8, fontSize: 12, color: "#86efac", lineHeight: 1.6 }}>
                Project / Donation / ProofSubmission / FundRelease / Challenge / ChallengeVote / ValidatorStake
              </div>
            </div>
            <div style={s.techCard}>
              <div style={{ ...s.techHeader, color: "#f9a8d4" }}>🎖️ SBT（GirlsVaultSBT）</div>
              <TechRow label="标准" value="ERC-721 变体" />
              <TechRow label="类型" value="Soulbound Token（灵魂绑定）" />
              <TechRow label="不可转让" value="transferFrom → revert" />
              <TechRow label="铸造触发" value="每笔捐款自动 mint" />
              <TechRow label="记录字段" value="donor / project / amount / tag / time" />
              <TechRow label="查询方式" value="getDonorTokens(address)" />
              <TechRow label="授权方" value="Registry 授权 Project 合约铸造" />
              <div style={{ marginTop: 16, padding: "8px 12px", background: "rgba(249,168,212,0.08)", borderRadius: 8, fontSize: 12, color: "#f9a8d4", lineHeight: 1.8 }}>
                不依赖前端存在 · 任意 NFT 浏览器可查证<br />
                捐款凭证永久绑定 · 捐款人身份不可伪造
              </div>
            </div>
          </div>

          {/* 合约结构 */}
          <div style={s.codeBlock}>
            <div style={s.codeBlockTitle}>合约架构</div>
            <pre style={s.code}>{`contracts/
├── GirlsVaultRegistry.sol   # 注册中心：部署项目合约、管理 SBT 授权、维护项目列表
├── GirlsVaultProject.sol    # 项目合约：捐款、质押、里程碑验证、挑战投票、退款
└── GirlsVaultSBT.sol        # 灵魂绑定 NFT：捐款凭证，不可转让`}</pre>
          </div>

          {/* 资金流向 */}
          <div style={s.codeBlock}>
            <div style={s.codeBlockTitle}>资金流向</div>
            <pre style={s.code}>{`捐款人
 ├─ donate(tag) ──────────────→ GirlsVaultProject（资金锁仓）
 │                                   └─ mint() ──→ GirlsVaultSBT（SBT 铸造）
 │
验证人
 ├─ stakeAsValidator() ───────→ 质押进合约（诚信保证金）
 ├─ submitProof(id, hash, uri) → proofCount >= M → VERIFIED（3天窗口开始）
 │
捐款人（可选）
 ├─ challengeMilestone() ─────→ 缴纳保证金 + 上传反证
 │   └─ voteOnChallenge() ────→ 按捐款额加权投票
 │   └─ resolveChallenge()
 │         ├─ 成立 → 质押没收 → 自动退款给所有捐款人
 │         └─ 不成立 → 保证金进保障池 → 里程碑可释放
 │
任意人
 └─ releaseMilestone() ───────→ 3天窗口结束后释放资金给受益方`}</pre>
          </div>
        </div>
      </section>

      {/* ─── 架构图 ─────────────────────────────────────────── */}
      <section style={{ ...s.section, background: "rgba(167,139,250,0.03)", borderTop: "1px solid rgba(167,139,250,0.1)", borderBottom: "1px solid rgba(167,139,250,0.1)" }}>
        <div style={s.sectionInner}>
          <SectionLabel>系统架构</SectionLabel>
          <h2 style={s.h2}>Architecture Overview</h2>
          <p style={{ color: "#9ca3af", textAlign: "center", marginBottom: 40, fontSize: 15 }}>
            各层组件协作流程：用户 → 钱包签名 → 前端 → 链上合约 / 索引 / 存储
          </p>
          <ArchDiagram />
        </div>
      </section>

      {/* ─── 信任模型 ───────────────────────────────────────── */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <SectionLabel>透明度保证</SectionLabel>
          <h2 style={s.h2}>关于信任模型</h2>
          <div style={s.trustGrid}>
            {[
              { icon: "🚫", title: "无管理员后门", desc: "没有 pause() 函数，没有可升级代理，合约一旦部署规则就固定了" },
              { icon: "📌", title: "验证人固定不可更改", desc: "验证人在构造函数里写死，不可动态添加或删除，防止事后篡改" },
              { icon: "💰", title: "经济约束诚信", desc: "质押机制让验证人的诚信有了经济成本，造假损失全部质押" },
              { icon: "🗳️", title: "社区监督纠错", desc: "社区举报投票机制让虚假证明可以被发现并纠正，任何捐款人均可发起" },
              { icon: "🔗", title: "链上信誉不可伪造", desc: "发起人信誉数据完全来自链上事件聚合，没有任何人可以手动修改" },
              { icon: "🎖️", title: "凭证独立可查", desc: "SBT 凭证不依赖本前端存在，任何 NFT 浏览器或自写脚本都可独立查证" },
            ].map((item) => (
              <div key={item.title} style={s.trustCard}>
                <span style={s.trustIcon}>{item.icon}</span>
                <div>
                  <div style={s.trustTitle}>{item.title}</div>
                  <div style={s.trustDesc}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={s.trustNote}>
            这不是说这个系统完美无缺，但它的边界是清晰的：链上的部分是可信的，链下的部分（IPFS 内容、前端 UI、验证人身份）需要额外信任。
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────── */}
      <section style={s.ctaSection}>
        <div style={s.ctaBg} />
        <div style={s.ctaContent}>
          <h2 style={s.ctaTitle}>准备好体验了吗？</h2>
          <p style={s.ctaSubtitle}>连接 MetaMask 或 Core Wallet，在 Avalanche Fuji 测试网上体验完整流程</p>
          <button style={s.ctaBtn} onClick={onEnterDemo}>
            进入链上演示 →
          </button>
          <div style={s.ctaTags}>
            <span style={s.ctaTag}>🔗 Avalanche Fuji C-Chain</span>
            <span style={s.ctaTag}>🔐 测试网 · 无需真实 AVAX</span>
            <span style={s.ctaTag}>📖 开源 MIT</span>
          </div>
        </div>
      </section>

    </div>
  );
}

function SectionLabel({ children, color = "#a78bfa" }) {
  return (
    <div style={{
      display: "inline-block",
      background: color + "1a",
      border: `1px solid ${color}44`,
      color,
      padding: "4px 14px",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      marginBottom: 16,
    }}>
      {children}
    </div>
  );
}

function TechRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", gap: 8 }}>
      <span style={{ color: "#6b7280", fontSize: 13, flexShrink: 0 }}>{label}</span>
      <span style={{ color: "#e5e7eb", fontSize: 13, textAlign: "right" }}>{value}</span>
    </div>
  );
}

function ArchDiagram() {
  const ARR = "url(#marr)", ARR_R = "url(#marr-r)", ARR_G = "url(#marr-g)", ARR_C = "url(#marr-c)";
  const contracts = [
    ["GirlsVaultRegistry", "项目注册 · SBT 授权"],
    ["GirlsVaultProject",  "捐款 · 验证 · 投票 · 退款"],
    ["GirlsVaultSBT",      "灵魂绑定凭证（不可转让）"],
  ];
  const graphEntities = ["ProjectEvent", "Donation", "Challenge", "FundRelease", "ValidatorStake"];
  const ipfsItems = ["证明文件（图片 / 视频）", "里程碑验证报告", "元数据 JSON", "CID → 链上永久存证"];

  return (
    <svg viewBox="0 0 760 465" style={{ width: "100%", maxWidth: 760, margin: "0 auto", display: "block" }}>
      <defs>
        <marker id="marr"   markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#4b5563"/></marker>
        <marker id="marr-r" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#ef4444"/></marker>
        <marker id="marr-g" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#22c55e"/></marker>
        <marker id="marr-c" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#06b6d4"/></marker>
      </defs>

      {/* ── 用户层 ── */}
      <rect x="30"  y="10" width="205" height="68" rx="10" fill="#1a0e2e" stroke="#7c3aed" strokeWidth="1.5"/>
      <text x="133" y="42" textAnchor="middle" fontSize="22">👩</text>
      <text x="133" y="64" textAnchor="middle" fill="#c4b5fd" fontSize="12" fontWeight="700">捐款人 / Donor</text>

      <rect x="277" y="10" width="206" height="68" rx="10" fill="#0a1f12" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="380" y="42" textAnchor="middle" fontSize="22">🔍</text>
      <text x="380" y="64" textAnchor="middle" fill="#86efac" fontSize="12" fontWeight="700">验证人 / Validator</text>

      <rect x="525" y="10" width="205" height="68" rx="10" fill="#071c22" stroke="#06b6d4" strokeWidth="1.5"/>
      <text x="628" y="42" textAnchor="middle" fontSize="22">🏫</text>
      <text x="628" y="64" textAnchor="middle" fill="#67e8f9" fontSize="12" fontWeight="700">受益方 / Beneficiary</text>

      {/* 收敛箭头 → 前端 */}
      <line x1="133" y1="78" x2="372" y2="122" stroke="#4b5563" strokeWidth="1.2" markerEnd={ARR}/>
      <line x1="380" y1="78" x2="380" y2="122" stroke="#4b5563" strokeWidth="1.2" markerEnd={ARR}/>
      <line x1="628" y1="78" x2="388" y2="122" stroke="#4b5563" strokeWidth="1.2" markerEnd={ARR}/>
      <rect x="268" y="84" width="224" height="20" rx="10" fill="#111827" stroke="#374151" strokeWidth="1"/>
      <text x="380" y="98" textAnchor="middle" fill="#9ca3af" fontSize="11">🦊 MetaMask / Core Wallet</text>

      {/* ── 前端层 ── */}
      <rect x="30" y="130" width="700" height="68" rx="12" fill="#0f0e2a" stroke="#4338ca" strokeWidth="1.5"/>
      <text x="380" y="153" textAnchor="middle" fill="#a5b4fc" fontSize="13" fontWeight="700">🖥️ 前端应用</text>
      <text x="380" y="172" textAnchor="middle" fill="#6b7280" fontSize="11">React 19 + Vite · ethers.js v6 · Multicall3 · Pinata SDK</text>
      <text x="380" y="188" textAnchor="middle" fill="#374151" fontSize="10">Vercel CI/CD 部署 · localStorage 通知已读状态</text>

      {/* 分叉箭头 → 三列 */}
      <line x1="137" y1="198" x2="137" y2="242" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="5,3" markerEnd={ARR_R}/>
      <rect x="80"  y="210" width="114" height="18" rx="9" fill="#1f0808"/>
      <text x="137" y="223" textAnchor="middle" fill="#ef4444" fontSize="10">合约调用 / RPC</text>

      <line x1="380" y1="198" x2="380" y2="242" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="5,3" markerEnd={ARR_G}/>
      <rect x="318" y="210" width="124" height="18" rx="9" fill="#071510"/>
      <text x="380" y="223" textAnchor="middle" fill="#22c55e" fontSize="10">GraphQL 查询</text>

      <line x1="623" y1="198" x2="623" y2="242" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="5,3" markerEnd={ARR_C}/>
      <rect x="561" y="210" width="124" height="18" rx="9" fill="#051520"/>
      <text x="623" y="223" textAnchor="middle" fill="#06b6d4" fontSize="10">IPFS 文件上传</text>

      {/* ── Avalanche ── */}
      <rect x="30" y="250" width="214" height="200" rx="12" fill="#150505" stroke="#ef4444" strokeWidth="1.5"/>
      <text x="137" y="273" textAnchor="middle" fill="#f87171" fontSize="12" fontWeight="700">🔴 Avalanche Fuji</text>
      <text x="137" y="289" textAnchor="middle" fill="#4b5563" fontSize="10">C-Chain · 智能合约层</text>
      {contracts.map(([name, desc], i) => (
        <g key={name}>
          <rect x="44" y={300 + i * 46} width="186" height="38" rx="7" fill="#1f0808" stroke="#7f1d1d" strokeWidth="1"/>
          <text x="137" y={316 + i * 46} textAnchor="middle" fill="#fca5a5" fontSize="11" fontWeight="600">{name}</text>
          <text x="137" y={330 + i * 46} textAnchor="middle" fill="#6b7280" fontSize="10">{desc}</text>
        </g>
      ))}

      {/* ── The Graph ── */}
      <rect x="273" y="250" width="214" height="200" rx="12" fill="#030f08" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="380" y="273" textAnchor="middle" fill="#86efac" fontSize="12" fontWeight="700">📊 The Graph</text>
      <text x="380" y="289" textAnchor="middle" fill="#4b5563" fontSize="10">链上事件索引 · GraphQL API</text>
      {graphEntities.map((e, i) => (
        <g key={e}>
          <circle cx="291" cy={308 + i * 30} r="3.5" fill="#22c55e"/>
          <text x="302" y={313 + i * 30} fill="#6ee7b7" fontSize="11">{e}</text>
        </g>
      ))}

      {/* ── IPFS ── */}
      <rect x="516" y="250" width="214" height="200" rx="12" fill="#030c14" stroke="#06b6d4" strokeWidth="1.5"/>
      <text x="623" y="273" textAnchor="middle" fill="#67e8f9" fontSize="12" fontWeight="700">📦 IPFS / Pinata</text>
      <text x="623" y="289" textAnchor="middle" fill="#4b5563" fontSize="10">去中心化文件存储</text>
      {ipfsItems.map((e, i) => (
        <g key={e}>
          <circle cx="533" cy={308 + i * 36} r="3.5" fill="#06b6d4"/>
          <text x="544" y={313 + i * 36} fill="#a5f3fc" fontSize="11">{e}</text>
        </g>
      ))}

      {/* ── 图例 ── */}
      {[
        [137, "#ef4444", "链上不可篡改"],
        [300, "#22c55e", "全量历史索引"],
        [470, "#06b6d4", "去中心化存储"],
        [630, "#a78bfa", "开源前端"],
      ].map(([x, color, label]) => (
        <g key={label}>
          <circle cx={x} cy="458" r="4" fill={color}/>
          <text x={x + 10} y="463" fill="#6b7280" fontSize="11">{label}</text>
        </g>
      ))}
    </svg>
  );
}

const s = {
  page: {
    background: "#09090f",
    minHeight: "100vh",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    color: "#f1f5f9",
  },

  /* Hero */
  hero: {
    position: "relative",
    overflow: "hidden",
    padding: "80px 24px 80px",
    textAlign: "center",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
  },
  heroBg: {
    position: "absolute", inset: 0, zIndex: 0,
    background: "radial-gradient(ellipse 100% 80% at 50% 30%, rgba(139,92,246,0.22) 0%, rgba(236,72,153,0.10) 55%, transparent 100%)",
  },
  heroContent: { position: "relative", zIndex: 1, maxWidth: 820, margin: "0 auto", width: "100%" },
  heroTitle: {
    fontSize: 120,
    fontWeight: 900,
    margin: "0 0 20px",
    lineHeight: 1,
    background: "linear-gradient(135deg, #c4b5fd 0%, #f9a8d4 50%, #f472b6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-4px",
  },
  heroSub: {
    fontSize: 32,
    fontWeight: 700,
    color: "#e2e8f0",
    margin: "0 0 24px",
    letterSpacing: "-0.5px",
  },
  heroDivider: {
    width: 56,
    height: 3,
    background: "linear-gradient(90deg, #8b5cf6, #ec4899)",
    borderRadius: 99,
    margin: "0 auto 24px",
  },
  heroDesc: {
    fontSize: 18,
    color: "#94a3b8",
    margin: "0 0 32px",
    lineHeight: 1.7,
  },
  badges: { display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 10, marginBottom: 44 },
  badge: {
    background: "rgba(139,92,246,0.12)",
    border: "1px solid rgba(139,92,246,0.3)",
    color: "#c4b5fd",
    padding: "7px 18px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 500,
  },
  cta: {
    background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "18px 56px",
    fontSize: 18,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 0 50px rgba(139,92,246,0.4)",
  },

  /* Section common */
  section: { padding: "72px 24px" },
  sectionInner: { maxWidth: 1000, margin: "0 auto" },
  h2: {
    fontSize: 34,
    fontWeight: 800,
    margin: "0 0 36px",
    color: "#f1f5f9",
    letterSpacing: "-0.5px",
  },

  /* Origin */
  originBlock: {
    background: "rgba(139,92,246,0.07)",
    border: "1px solid rgba(139,92,246,0.2)",
    borderRadius: 16,
    padding: "28px 32px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  originText: { fontSize: 16, color: "#cbd5e1", lineHeight: 1.85, margin: 0 },

  /* Problem cards */
  grid3: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 },
  problemCard: {
    background: "rgba(239,68,68,0.06)",
    border: "1px solid rgba(239,68,68,0.18)",
    borderRadius: 12,
    padding: "22px 20px",
  },
  cardIcon: { fontSize: 28, marginBottom: 12 },
  cardTitle: { fontWeight: 700, marginBottom: 8, color: "#f1f5f9", fontSize: 15 },
  cardDesc: { fontSize: 14, color: "#94a3b8", lineHeight: 1.7 },

  /* Lifecycle */
  lifecycle: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
    gap: 20,
  },
  lifecycleItem: { position: "relative", display: "flex", gap: 16, alignItems: "flex-start" },
  lifecycleStep: {
    flexShrink: 0,
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "2px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 14,
    marginTop: 4,
  },
  lifecycleLine: {
    display: "none",
  },
  lifecycleBody: { flex: 1 },
  lifecycleIcon: { fontSize: 20, marginBottom: 6 },
  lifecycleTitle: { fontWeight: 700, fontSize: 15, color: "#f1f5f9", marginBottom: 6 },
  lifecycleDesc: { fontSize: 13, color: "#94a3b8", lineHeight: 1.7 },

  /* Compare table */
  compareTable: {
    border: "1px solid rgba(139,92,246,0.2)",
    borderRadius: 14,
    overflow: "hidden",
  },
  compareHeader: {
    display: "flex",
    padding: "12px 20px",
    background: "rgba(139,92,246,0.12)",
    fontWeight: 700,
    fontSize: 13,
    color: "#a78bfa",
    borderBottom: "1px solid rgba(139,92,246,0.2)",
  },
  compareRow: {
    display: "flex",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  compareProb: {
    flex: 1, padding: "13px 20px", fontSize: 14, color: "#94a3b8",
    borderRight: "1px solid rgba(255,255,255,0.05)",
  },
  compareSol: { flex: 1, padding: "13px 20px", fontSize: 14, color: "#cbd5e1" },

  /* Feature cards */
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 16,
  },
  featureCard: {
    background: "#0f172a",
    border: "1px solid",
    borderRadius: 14,
    padding: "22px 20px",
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    marginBottom: 14,
  },
  featureTitle: { fontWeight: 700, fontSize: 15, color: "#f1f5f9", marginBottom: 4 },
  featureSub: { fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", marginBottom: 10 },
  featureDesc: { fontSize: 13, color: "#94a3b8", lineHeight: 1.7 },

  /* Tech */
  grid2x2: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 16,
  },
  techCard: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: 14,
    padding: "22px 20px",
  },
  techHeader: { fontWeight: 700, fontSize: 15, marginBottom: 14 },
  codeBlock: {
    marginTop: 28,
    background: "#0a0a14",
    border: "1px solid #1e293b",
    borderRadius: 12,
    overflow: "hidden",
  },
  codeBlockTitle: {
    padding: "10px 16px",
    fontSize: 12,
    color: "#64748b",
    borderBottom: "1px solid #1e293b",
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  code: {
    margin: 0,
    padding: "18px 20px",
    fontSize: 12.5,
    lineHeight: 1.8,
    color: "#94a3b8",
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
    overflowX: "auto",
    whiteSpace: "pre",
  },

  /* Trust */
  trustGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 16,
    marginBottom: 28,
  },
  trustCard: {
    display: "flex",
    gap: 14,
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: 12,
    padding: "18px 18px",
    alignItems: "flex-start",
  },
  trustIcon: { fontSize: 22, flexShrink: 0, marginTop: 1 },
  trustTitle: { fontWeight: 700, fontSize: 14, color: "#f1f5f9", marginBottom: 5 },
  trustDesc: { fontSize: 13, color: "#94a3b8", lineHeight: 1.65 },
  trustNote: {
    background: "rgba(139,92,246,0.07)",
    border: "1px solid rgba(139,92,246,0.2)",
    borderRadius: 10,
    padding: "16px 20px",
    fontSize: 14,
    color: "#94a3b8",
    lineHeight: 1.75,
  },

  /* Bottom CTA */
  ctaSection: {
    position: "relative",
    overflow: "hidden",
    padding: "80px 24px 100px",
    textAlign: "center",
  },
  ctaBg: {
    position: "absolute", inset: 0, zIndex: 0,
    background: "radial-gradient(ellipse 70% 70% at 50% 100%, rgba(139,92,246,0.22) 0%, rgba(236,72,153,0.1) 50%, transparent 100%)",
  },
  ctaContent: { position: "relative", zIndex: 1, maxWidth: 600, margin: "0 auto" },
  ctaTitle: { fontSize: 42, fontWeight: 800, margin: "0 0 16px", letterSpacing: "-0.5px" },
  ctaSubtitle: { color: "#94a3b8", fontSize: 16, margin: "0 0 36px", lineHeight: 1.6 },
  ctaBtn: {
    background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "16px 52px",
    fontSize: 17,
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: 24,
    boxShadow: "0 0 40px rgba(139,92,246,0.4)",
  },
  ctaTags: { display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" },
  ctaTag: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#94a3b8",
    padding: "6px 14px",
    borderRadius: 20,
    fontSize: 13,
  },
};
