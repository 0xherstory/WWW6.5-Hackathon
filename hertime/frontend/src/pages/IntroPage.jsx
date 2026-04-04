export default function IntroPage({ onEnterDemo }) {
  return (
    <div style={s.page}>

      {/* ─── Hero ───────────────────────────────────────────── */}
      <section style={s.hero}>
        <div style={s.heroBg} />
        <div style={s.heroContent}>
          <h1 style={s.heroTitle}>HerTime</h1>
          <p style={s.heroSub}>那些不被看见的付出，从此有迹可循</p>
          <div style={s.heroDivider} />
          <p style={s.heroDesc}>
            基于区块链的女性互助时间银行协议，用链上 Token 记录每一小时的付出
          </p>
          <div style={s.badges}>
            <span style={s.badge}>Avalanche Fuji Testnet</span>
            <span style={s.badge}>Solidity 0.8.24</span>
            <span style={s.badge}>The Graph</span>
            <span style={s.badge}>Firebase Realtime DB</span>
            <span style={s.badge}>ERC-20 + Soulbound NFT</span>
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
              随着老龄化加剧，<strong style={{ color: "#f9a8d4" }}>互助养老</strong>正在成为无数家庭的真实需求——
              邻里之间的陪伴、就医协助、情绪疏导，这些看不见的付出每天都在发生，
              却缺少一个可信的方式被记录、被承认、被回馈。
            </p>
            <p style={s.originText}>
              传统的互助平台存在一个结构性问题：积分和记录存在平台的数据库，
              <strong style={{ color: "#f9a8d4" }}>数据归平台所有，不归用户所有</strong>。
              平台维护中断、机构换届、资金断档，都可能让用户多年的付出变得无从查证。
              上海时间银行近期的暂停维护，让这个问题再次被看见。
            </p>
            <p style={s.originText}>
              HerTime 用智能合约重建这套信任机制：时间 Token 存在你自己的钱包，
              声誉记录写在链上永不消失。平台可以倒闭，但你帮助过别人的证明将永远存在。
            </p>
          </div>
        </div>
      </section>

      {/* ─── 问题 ───────────────────────────────────────────── */}
      <section style={{ ...s.section, background: "rgba(239,68,68,0.04)", borderTop: "1px solid rgba(239,68,68,0.1)", borderBottom: "1px solid rgba(239,68,68,0.1)" }}>
        <div style={s.sectionInner}>
          <SectionLabel color="#f87171">Web2 时间银行的问题</SectionLabel>
          <h2 style={s.h2}>为什么需要 HerTime</h2>
          <div style={s.grid3}>
            {[
              { icon: "💀", title: "平台停运积分清零", desc: "积分存在平台数据库，平台关闭即归零，你的贡献从未真正属于你" },
              { icon: "✏️", title: "记录可被随意修改", desc: "平台对数据有完全控制权，贡献历史随时可被删除或篡改，无处申诉" },
              { icon: "🏝️", title: "跨社群不互通", desc: "各平台数据孤岛，换平台等于重新开始，多年积累的信誉全部归零" },
              { icon: "🎭", title: "评价缺乏公信力", desc: "评分可被平台删除或刷单，无法真正反映贡献质量，信任成本极高" },
              { icon: "🔒", title: "积分无法流通", desc: "时间积分锁在单一平台，无法跨平台使用，更无法体现真实市场价值" },
              { icon: "👻", title: "贡献者不可见", desc: "帮助过他人的记录无处证明，善意付出没有可验证的数字凭证" },
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
          <h2 style={s.h2}>一次互助的完整生命周期</h2>
          <div style={s.lifecycle}>
            {[
              {
                step: "01", color: "#8b5cf6", icon: "💌", title: "邀请制注册",
                desc: "已注册成员邀请新人，链上 isInvited 映射验证资格，注册成功自动获得 2 HRT 启动资金，防止滥注册。",
              },
              {
                step: "02", color: "#3b82f6", icon: "📋", title: "发布服务需求",
                desc: "选择服务类型（生活 / 情感 / 技能 / 知识 / 创意）、预计时长（0.1h 精度），支持匿名发布，位置数据链下保护隐私。",
              },
              {
                step: "03", color: "#06b6d4", icon: "🤝", title: "接单与匹配",
                desc: "服务方在需求广场浏览，按距离和类型筛选，确认接单后双方在 Firebase 链下安全交换联系方式。",
              },
              {
                step: "04", color: "#f59e0b", icon: "✅", title: "双向确认结算",
                desc: "发起人先确认（可调整实际时长），服务方再确认，双方均确认后合约自动 burn 需求方 HRT、mint 给服务方。",
              },
              {
                step: "05", color: "#22c55e", icon: "⭐", title: "双盲评分上链",
                desc: "双方分别提交 keccak256(评论)，双方都提交后同时公开评分和评语，防止报复性打分，声誉永久记录链上。",
              },
              {
                step: "06", color: "#ec4899", icon: "🏅", title: "技能 NFT 自动颁发",
                desc: "Reputation 合约在评分更新后自动检查是否达到 mint 条件，符合条件则铸造 Soulbound 技能徽章，不可转让。",
              },
            ].map((item) => (
              <div key={item.step} style={s.lifecycleItem}>
                <div style={{ ...s.lifecycleStep, background: item.color + "22", borderColor: item.color + "66", color: item.color }}>
                  {item.step}
                </div>
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
              <div style={{ flex: 1 }}>Web2 时间银行的痛点</div>
              <div style={{ flex: 1, color: "#a78bfa", textAlign: "right" }}>HerTime 的解法</div>
            </div>
            {[
              ["平台停运积分全部归零", "Token 在你钱包，平台消失，资产依然存在"],
              ["数据可被平台任意删改", "链上记录不可篡改，第三方可独立核查"],
              ["换平台贡献记录清零", "地址即身份，声誉随钱包全球携带，跨平台通用"],
              ["评价可被平台删除或刷单", "双盲评分写入合约，平台无法干预，双方不可撤回"],
              ["积分锁在平台无法流通", "HRT 是标准 ERC-20，可在任意 DEX 流通"],
              ["帮助他人的记录无处证明", "Soulbound NFT 徽章，永久绑定，任何人可独立验证"],
              ["注册无门槛，质量难保证", "邀请制链上验证，isInvited 映射，可信社群冷启动"],
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
                icon: "💰", color: "#8b5cf6", title: "HRT 时间代币 · 转赠",
                subtitle: "ERC-20 · 0.1h 精度 · 自由流通",
                desc: "1 HRT = 1 小时服务。服务完成自动结算，也可直接转赠给家人——女儿帮社区积累的时长，可以转给外地的父母使用，真正跨地域流通。支持填写附言，记录每一笔转赠的心意。",
              },
              {
                icon: "🤝", color: "#3b82f6", title: "服务生命周期",
                subtitle: "OPEN → MATCHED → COMPLETED",
                desc: "合约状态机管理完整流程：发布 → 接单 → 双向确认 → 结算。adjustHours 支持在结单前调整实际时长，链上按实际时长结算。",
              },
              {
                icon: "⭐", color: "#f59e0b", title: "双盲评分系统",
                subtitle: "Commit-Reveal Pattern",
                desc: "提交阶段只上链 keccak256(评论)，双方都提交后合约自动公开双方评分。防止先看到对方分后报复性打分，声誉数据真实可信。",
              },
              {
                icon: "🏅", color: "#ec4899", title: "Soulbound 技能徽章",
                subtitle: "ERC-721 · 6 种技能",
                desc: "倾听者 / 就医陪伴 / 育儿伙伴 / 技能导师 / 社区守护者 / 危机支持者。根据链上服务次数和评分自动 mint，transferFrom 直接 revert，永久绑定。",
              },
              {
                icon: "🗺️", color: "#06b6d4", title: "位置隐私保护",
                subtitle: "Firebase + 坐标截断",
                desc: "位置坐标精度降低至小数点后两位（约 1km 精度），仅存储在 Firebase 链下，10 分钟无更新自动过期，从不上链。",
              },
              {
                icon: "🔔", color: "#22c55e", title: "站内实时通知",
                subtitle: "Firebase Realtime Database",
                desc: "接单、确认、完成、取消等关键节点自动推送站内通知。点击通知直接跳转并打开对应服务详情，已读状态持久化。",
              },
              {
                icon: "🛡️", color: "#f97316", title: "邀请制准入",
                subtitle: "isInvited 链上映射",
                desc: "部署者自动获得邀请资格，已注册成员可邀请新人，管理员可批量邀请。链上验证防止滥注册，保障互助社群质量。",
              },
              {
                icon: "💸", color: "#10b981", title: "HRT 转赠",
                subtitle: "ERC-20 transfer · Firebase 流水",
                desc: "可将 HRT 直接转给任意地址，支持填写附言。典型场景：女儿在社区帮扶积累时长后转给外地父母，父母用于接受当地服务——真正实现代际、跨地域的时间流通。",
              },
              {
                icon: "📊", color: "#a855f7", title: "The Graph 索引 · HRT 流水",
                subtitle: "AssemblyScript · 5 实体",
                desc: "索引 4 个合约事件，个人主页「HRT 流水」标签一次 GraphQL 查询返回全部明细：注册奖励、服务收入/消费、转账收入/支出均有记录，附言可见，总收入/总支出/净增一目了然。",
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
              <TechRow label="语言" value="Solidity 0.8.24" />
              <TechRow label="框架" value="Hardhat 2.x" />
              <TechRow label="权限" value="OpenZeppelin AccessControl" />
              <TechRow label="代币" value="ERC-20（HRT）+ ERC-721（SBT）" />
              <TechRow label="评分" value="Commit-Reveal（keccak256）" />
              <TechRow label="网络" value="Avalanche Fuji C-Chain" />
              <TechRow label="架构" value="Token + Service + Reputation + SkillNFT" />
            </div>
            <div style={s.techCard}>
              <div style={{ ...s.techHeader, color: "#67e8f9" }}>🖥️ 前端</div>
              <TechRow label="框架" value="React 18 + Vite 5" />
              <TechRow label="链交互" value="ethers.js v6" />
              <TechRow label="地图" value="react-leaflet + CartoCDN" />
              <TechRow label="图表" value="Recharts" />
              <TechRow label="链下存储" value="Firebase Realtime Database" />
              <TechRow label="索引" value="The Graph GraphQL" />
              <TechRow label="部署" value="Vercel CI/CD" />
            </div>
            <div style={s.techCard}>
              <div style={{ ...s.techHeader, color: "#86efac" }}>📊 子图（The Graph）</div>
              <TechRow label="语言" value="AssemblyScript" />
              <TechRow label="网络" value="Avalanche Fuji" />
              <TechRow label="索引实体" value="5 个实体类型" />
              <TechRow label="监听事件" value="13 种合约事件" />
              <TechRow label="数据源" value="4 个合约同步索引" />
              <div style={{ marginTop: 16, padding: "8px 12px", background: "rgba(134,239,172,0.08)", borderRadius: 8, fontSize: 12, color: "#86efac", lineHeight: 1.6 }}>
                Service / Member / SkillBadge / Rating / HRTFlow
              </div>
            </div>
            <div style={s.techCard}>
              <div style={{ ...s.techHeader, color: "#f9a8d4" }}>🔥 Firebase（链下层）</div>
              <TechRow label="平台" value="Firebase Realtime Database" />
              <TechRow label="位置" value="坐标截断至 2 位小数（~1km）" />
              <TechRow label="图片" value="浏览器压缩 base64，无需云存储" />
              <TechRow label="通知" value="push() 自动键，实时推送" />
              <TechRow label="评论" value="链下存储评价文字，链上存哈希" />
              <TechRow label="联系方式" value="仅匹配双方可见，点对点加密" />
              <div style={{ marginTop: 16, padding: "8px 12px", background: "rgba(249,168,212,0.08)", borderRadius: 8, fontSize: 12, color: "#f9a8d4", lineHeight: 1.8 }}>
                链下隐私数据 · 链上可信记录<br />
                两层架构互补，兼顾性能与去中心化
              </div>
            </div>
          </div>

          {/* 合约架构 */}
          <div style={s.codeBlock}>
            <div style={s.codeBlockTitle}>合约架构</div>
            <pre style={s.code}>{`contracts/
├── HerTimeToken.sol       # ERC-20 HRT：welcomeMint / mintForService / burnForService
├── HerTimeService.sol     # 服务生命周期：发布 → 接单 → 确认 → 取消，邀请制注册
├── HerTimeReputation.sol  # 双盲评分：submitRating → reveal → ReputationUpdated
└── HerTimeSkillNFT.sol    # Soulbound ERC-721：checkAndMint，transferFrom → revert`}</pre>
          </div>

          {/* Token 流向 */}
          <div style={s.codeBlock}>
            <div style={s.codeBlockTitle}>HRT Token 流向</div>
            <pre style={s.code}>{`注册
 └─ welcomeMint(member) ──────────→ +2 HRT 到成员钱包

发布服务（无 token 流动）

双方确认完成
 ├─ burnForService(requester, hours) → 需求方 -N HRT
 └─ mintForService(provider, hours)  → 服务方 +N HRT

评分（触发技能 NFT）
 └─ submitRating() × 2 → reveal → ReputationUpdated → checkAndMint() → SkillMinted`}</pre>
          </div>
        </div>
      </section>

      {/* ─── 架构图 ─────────────────────────────────────────── */}
      <section style={{ ...s.section, background: "rgba(167,139,250,0.03)", borderTop: "1px solid rgba(167,139,250,0.1)", borderBottom: "1px solid rgba(167,139,250,0.1)" }}>
        <div style={s.sectionInner}>
          <SectionLabel>系统架构</SectionLabel>
          <h2 style={s.h2}>Architecture Overview</h2>
          <p style={{ color: "#9ca3af", textAlign: "center", marginBottom: 40, fontSize: 15 }}>
            各层组件协作流程：用户 → 钱包签名 → 前端 → 链上合约 / 索引 / 链下存储
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
              { icon: "💰", title: "Token 在用户钱包", desc: "HRT 是标准 ERC-20，存在你的钱包，平台停运不影响你的资产" },
              { icon: "⭐", title: "双盲评分防报复", desc: "双方提交时看不到对方的分，提交后不可撤回，评分结果无法被平台干预" },
              { icon: "🛡️", title: "邀请制保证质量", desc: "链上 isInvited 映射，注册前需获得邀请，可信社群冷启动机制" },
              { icon: "🔗", title: "声誉不可伪造", desc: "声誉分完全来自链上评分事件聚合计算，没有任何人可以手动修改" },
              { icon: "🏅", title: "徽章独立可查", desc: "Soulbound NFT 不依赖本前端存在，任何 NFT 浏览器或脚本都可独立验证" },
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
            这不是说这个系统完美无缺，但它的边界是清晰的：链上的部分是可信的，链下的部分（Firebase 数据、前端 UI、用户身份）需要额外信任。
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
  )
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
  )
}

function TechRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", gap: 8 }}>
      <span style={{ color: "#6b7280", fontSize: 13, flexShrink: 0 }}>{label}</span>
      <span style={{ color: "#e5e7eb", fontSize: 13, textAlign: "right" }}>{value}</span>
    </div>
  )
}

function ArchDiagram() {
  const ARR = "url(#marr)", ARR_R = "url(#marr-r)", ARR_G = "url(#marr-g)", ARR_C = "url(#marr-c)"
  const contracts = [
    ["HerTimeToken",      "welcomeMint / burn / mint"],
    ["HerTimeService",    "发布 · 接单 · 确认 · 取消"],
    ["HerTimeReputation", "双盲评分 · 声誉计算"],
    ["HerTimeSkillNFT",   "技能徽章（Soulbound）"],
  ]
  const graphEntities = ["Service", "Member", "SkillBadge", "Rating", "HRTFlow"]
  const firebaseItems = ["位置坐标（~1km 精度）", "图片（base64 压缩）", "站内通知（push）", "评价文字 + 联系方式"]

  return (
    <svg viewBox="0 0 760 490" style={{ width: "100%", maxWidth: 760, margin: "0 auto", display: "block" }}>
      <defs>
        <marker id="marr"   markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#4b5563"/></marker>
        <marker id="marr-r" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#ef4444"/></marker>
        <marker id="marr-g" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#22c55e"/></marker>
        <marker id="marr-c" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#f97316"/></marker>
      </defs>

      {/* ── 用户层 ── */}
      <rect x="30"  y="10" width="205" height="68" rx="10" fill="#1a0e2e" stroke="#7c3aed" strokeWidth="1.5"/>
      <text x="133" y="42" textAnchor="middle" fontSize="22">🙋</text>
      <text x="133" y="64" textAnchor="middle" fill="#c4b5fd" fontSize="12" fontWeight="700">需求方 / Requester</text>

      <rect x="277" y="10" width="206" height="68" rx="10" fill="#0f1a0a" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="380" y="42" textAnchor="middle" fontSize="22">🤲</text>
      <text x="380" y="64" textAnchor="middle" fill="#86efac" fontSize="12" fontWeight="700">服务方 / Provider</text>

      <rect x="525" y="10" width="205" height="68" rx="10" fill="#1a100e" stroke="#f97316" strokeWidth="1.5"/>
      <text x="628" y="42" textAnchor="middle" fontSize="22">👀</text>
      <text x="628" y="64" textAnchor="middle" fill="#fdba74" fontSize="12" fontWeight="700">公众 / 社区</text>

      {/* 收敛箭头 → 前端 */}
      <line x1="133" y1="78" x2="372" y2="122" stroke="#4b5563" strokeWidth="1.2" markerEnd={ARR}/>
      <line x1="380" y1="78" x2="380" y2="122" stroke="#4b5563" strokeWidth="1.2" markerEnd={ARR}/>
      <line x1="628" y1="78" x2="388" y2="122" stroke="#4b5563" strokeWidth="1.2" markerEnd={ARR}/>
      <rect x="268" y="84" width="224" height="20" rx="10" fill="#111827" stroke="#374151" strokeWidth="1"/>
      <text x="380" y="98" textAnchor="middle" fill="#9ca3af" fontSize="11">🦊 MetaMask / Core Wallet</text>

      {/* ── 前端层 ── */}
      <rect x="30" y="130" width="700" height="68" rx="12" fill="#0f0e2a" stroke="#4338ca" strokeWidth="1.5"/>
      <text x="380" y="153" textAnchor="middle" fill="#a5b4fc" fontSize="13" fontWeight="700">🖥️ 前端应用</text>
      <text x="380" y="172" textAnchor="middle" fill="#6b7280" fontSize="11">React 18 + Vite · ethers.js v6 · react-leaflet · Recharts · Firebase SDK</text>
      <text x="380" y="188" textAnchor="middle" fill="#374151" fontSize="10">Vercel CI/CD 部署 · 通知实时订阅 · 位置隐私截断</text>

      {/* 分叉箭头 → 三列 */}
      <line x1="137" y1="198" x2="137" y2="242" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="5,3" markerEnd={ARR_R}/>
      <rect x="80"  y="210" width="114" height="18" rx="9" fill="#1f0808"/>
      <text x="137" y="223" textAnchor="middle" fill="#ef4444" fontSize="10">合约调用 / RPC</text>

      <line x1="380" y1="198" x2="380" y2="242" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="5,3" markerEnd={ARR_G}/>
      <rect x="318" y="210" width="124" height="18" rx="9" fill="#071510"/>
      <text x="380" y="223" textAnchor="middle" fill="#22c55e" fontSize="10">GraphQL 查询</text>

      <line x1="623" y1="198" x2="623" y2="242" stroke="#f97316" strokeWidth="1.5" strokeDasharray="5,3" markerEnd={ARR_C}/>
      <rect x="561" y="210" width="124" height="18" rx="9" fill="#1a0e05"/>
      <text x="623" y="223" textAnchor="middle" fill="#f97316" fontSize="10">链下数据读写</text>

      {/* ── Avalanche ── */}
      <rect x="30" y="250" width="214" height="220" rx="12" fill="#150505" stroke="#ef4444" strokeWidth="1.5"/>
      <text x="137" y="273" textAnchor="middle" fill="#f87171" fontSize="12" fontWeight="700">🔴 Avalanche Fuji</text>
      <text x="137" y="289" textAnchor="middle" fill="#4b5563" fontSize="10">C-Chain · 智能合约层</text>
      {contracts.map(([name, desc], i) => (
        <g key={name}>
          <rect x="44" y={300 + i * 42} width="186" height="34" rx="7" fill="#1f0808" stroke="#7f1d1d" strokeWidth="1"/>
          <text x="137" y={314 + i * 42} textAnchor="middle" fill="#fca5a5" fontSize="10" fontWeight="600">{name}</text>
          <text x="137" y={328 + i * 42} textAnchor="middle" fill="#6b7280" fontSize="9">{desc}</text>
        </g>
      ))}

      {/* ── The Graph ── */}
      <rect x="273" y="250" width="214" height="220" rx="12" fill="#030f08" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="380" y="273" textAnchor="middle" fill="#86efac" fontSize="12" fontWeight="700">📊 The Graph</text>
      <text x="380" y="289" textAnchor="middle" fill="#4b5563" fontSize="10">链上事件索引 · GraphQL API</text>
      {graphEntities.map((e, i) => (
        <g key={e}>
          <circle cx="291" cy={312 + i * 32} r="3.5" fill="#22c55e"/>
          <text x="302" y={317 + i * 32} fill="#6ee7b7" fontSize="11">{e}</text>
        </g>
      ))}

      {/* ── Firebase ── */}
      <rect x="516" y="250" width="214" height="220" rx="12" fill="#100b03" stroke="#f97316" strokeWidth="1.5"/>
      <text x="623" y="273" textAnchor="middle" fill="#fb923c" fontSize="12" fontWeight="700">🔥 Firebase</text>
      <text x="623" y="289" textAnchor="middle" fill="#4b5563" fontSize="10">链下隐私数据层</text>
      {firebaseItems.map((e, i) => (
        <g key={e}>
          <circle cx="533" cy={312 + i * 40} r="3.5" fill="#f97316"/>
          <text x="544" y={317 + i * 40} fill="#fdba74" fontSize="10">{e}</text>
        </g>
      ))}

      {/* ── 图例 ── */}
      {[
        [100, "#ef4444", "链上不可篡改"],
        [270, "#22c55e", "全量历史索引"],
        [430, "#f97316", "链下隐私保护"],
        [590, "#a78bfa", "开源前端"],
      ].map(([x, color, label]) => (
        <g key={label}>
          <circle cx={x} cy="480" r="4" fill={color}/>
          <text x={x + 10} y="485" fill="#6b7280" fontSize="11">{label}</text>
        </g>
      ))}
    </svg>
  )
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
    boxSizing: "border-box",
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
  },
  code: {
    padding: "20px",
    fontSize: 13,
    color: "#94a3b8",
    margin: 0,
    lineHeight: 1.8,
    overflowX: "auto",
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  },

  /* Trust */
  trustGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 14,
    marginBottom: 28,
  },
  trustCard: {
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: 12,
    padding: "18px 18px",
  },
  trustIcon: { fontSize: 24, flexShrink: 0 },
  trustTitle: { fontWeight: 700, fontSize: 14, color: "#f1f5f9", marginBottom: 4 },
  trustDesc: { fontSize: 13, color: "#94a3b8", lineHeight: 1.6 },
  trustNote: {
    background: "rgba(139,92,246,0.07)",
    border: "1px solid rgba(139,92,246,0.2)",
    borderRadius: 12,
    padding: "16px 20px",
    fontSize: 14,
    color: "#94a3b8",
    lineHeight: 1.7,
  },

  /* CTA */
  ctaSection: {
    position: "relative",
    overflow: "hidden",
    padding: "100px 24px",
    textAlign: "center",
  },
  ctaBg: {
    position: "absolute", inset: 0, zIndex: 0,
    background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(139,92,246,0.18) 0%, transparent 70%)",
  },
  ctaContent: { position: "relative", zIndex: 1 },
  ctaTitle: {
    fontSize: 44,
    fontWeight: 900,
    color: "#f1f5f9",
    margin: "0 0 16px",
    letterSpacing: "-1px",
  },
  ctaSubtitle: {
    fontSize: 18,
    color: "#94a3b8",
    margin: "0 0 40px",
    lineHeight: 1.6,
  },
  ctaBtn: {
    background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "18px 56px",
    fontSize: 18,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 0 50px rgba(139,92,246,0.4)",
    display: "block",
    margin: "0 auto 28px",
  },
  ctaTags: { display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" },
  ctaTag: {
    background: "rgba(139,92,246,0.1)",
    border: "1px solid rgba(139,92,246,0.25)",
    color: "#a78bfa",
    padding: "6px 16px",
    borderRadius: 20,
    fontSize: 13,
  },
}
