import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useApp } from "../context/AppContext";
import { Heart, Home, Gamepad2, MapPin, ArrowLeft, X, Coins, Wallet, CheckCircle, AlertCircle } from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  Available: { label: "等待领养", color: "#4ecdc4" },
  CloudAdopted: { label: "已云领养", color: "#f7a541" },
  PendingAdoption: { label: "领养申请中", color: "#a855f7" },
  Adopted: { label: "已有家", color: "#888" },
};

const STAGE_LABELS: Record<number, string> = {
  1: "幼猫期 🐱",
  2: "少年猫 🐈",
  3: "成年猫 🦁",
  4: "Genesis ✨",
};

export function CatDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cats, user, walletConnected, connectWallet, donateToCat, updateCatStatus, setGameStarterCatId, nftClaimed, purrBalance, setPurrBalance } = useApp();

  const cat = cats.find(c => c.id === Number(id));

  const [showDonate, setShowDonate] = useState(false);
  const [showAdopt, setShowAdopt] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [donateAmount, setDonateAmount] = useState("0.1");
  const [donating, setDonating] = useState(false);
  const [donated, setDonated] = useState(false);
  const [adopting, setAdopting] = useState(false);
  const [adopted, setAdopted] = useState(false);

  if (!cat) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f7f5ff", color: "#1e1b4b" }}>
        <div className="text-center">
          <p className="text-2xl mb-4">😿 找不到这只猫咪</p>
          <Link to="/dashboard" className="text-sm" style={{ color: "#7ec8e3" }}>返回档案馆</Link>
        </div>
      </div>
    );
  }

  const isAdopted = cat.status === "Adopted";
  const statusInfo = STATUS_LABELS[cat.status];

  const handleDonate = async () => {
    if (!walletConnected) { connectWallet(); return; }
    setDonating(true);
    await new Promise(r => setTimeout(r, 1500));
    donateToCat(cat.id, parseFloat(donateAmount));
    setDonating(false);
    setDonated(true);
  };

  const handleAdopt = async () => {
    if (!walletConnected) { connectWallet(); return; }
    setAdopting(true);
    await new Promise(r => setTimeout(r, 1500));
    updateCatStatus(cat.id, "PendingAdoption");
    setAdopting(false);
    setAdopted(true);
  };

  const handleEnterGame = () => {
    setGameStarterCatId(cat.id);
    navigate(`/game/${cat.id}`);
  };

  return (
    <div className="min-h-screen pt-20" style={{ background: "#f7f5ff" }}>
      {/* Donate Modal */}
      {showDonate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div className="w-full max-w-md rounded-3xl p-8" style={{ background: "#ffffff", border: "1px solid rgba(247,165,65,0.2)" }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl" style={{ color: "#1e1b4b", fontWeight: 700 }}>💝 捐款给 {cat.name}</h3>
              <button onClick={() => { setShowDonate(false); setDonated(false); }} style={{ color: "#888", cursor: "pointer" }}><X size={20} /></button>
            </div>

            {!donated ? (
              <>
                <p className="text-sm mb-5" style={{ color: "#4c4980", lineHeight: 1.7 }}>
                  您的捐款将通过 <span style={{ color: "#7ec8e3" }}>DonationVault</span> 直接转入机构钱包，
                  平台完全不经手。每累计 0.1 AVAX 自动解锁一个成长阶段 NFT。
                </p>
                <div className="mb-5">
                  <label className="text-sm mb-2 block" style={{ color: "#4c4980" }}>捐款金额 (AVAX)</label>
                  <div className="flex gap-2 mb-3">
                    {["0.05", "0.1", "0.5", "1.0"].map(v => (
                      <button key={v} onClick={() => setDonateAmount(v)}
                        className="flex-1 py-2 rounded-xl text-sm"
                        style={{
                          background: donateAmount === v ? "rgba(247,165,65,0.2)" : "rgba(109,58,238,0.06)",
                          border: donateAmount === v ? "1px solid rgba(247,165,65,0.5)" : "1px solid rgba(109,58,238,0.08)",
                          color: donateAmount === v ? "#f7a541" : "#9090b0",
                          cursor: "pointer",
                        }}>
                        {v}
                      </button>
                    ))}
                  </div>
                  <input value={donateAmount} onChange={e => setDonateAmount(e.target.value)}
                    type="number" step="0.01" min="0.01"
                    className="w-full px-4 py-3 rounded-xl outline-none"
                    style={{ background: "rgba(109,58,238,0.06)", border: "1px solid rgba(247,165,65,0.2)", color: "#f7a541" }} />
                </div>
                <div className="p-3 rounded-xl mb-5 text-sm" style={{ background: "rgba(78,205,196,0.06)", border: "1px solid rgba(78,205,196,0.15)", color: "#7c7aaa" }}>
                  已累计捐款: <span style={{ color: "#f7a541" }}>{cat.donationTotal.toFixed(2)} AVAX</span>
                  {" "}· 下一阶段解锁还需 <span style={{ color: "#4ecdc4" }}>{Math.max(0, 0.1 - (cat.donationTotal % 0.1)).toFixed(2)} AVAX</span>
                </div>
                <button onClick={handleDonate} disabled={donating || !parseFloat(donateAmount)}
                  className="w-full py-4 rounded-xl"
                  style={{ background: "linear-gradient(135deg, #f7a541, #ff6b6b)", color: "#fff", fontWeight: 700, cursor: "pointer", opacity: donating ? 0.7 : 1 }}>
                  {donating ? "链上处理中..." : !walletConnected ? "🔗 连接钱包" : `❤️ 捐款 ${donateAmount} AVAX`}
                </button>
              </>
            ) : (
              <div className="text-center py-4 flex flex-col items-center gap-4">
                <CheckCircle size={48} color="#4ecdc4" />
                <h4 style={{ color: "#1e1b4b", fontWeight: 700 }}>捐款成功！</h4>
                <p className="text-sm" style={{ color: "#4c4980" }}>感谢您对 {cat.name} 的爱心支持 💖<br />AVAX 已直接转入机构钱包，链上可查。</p>
                <button onClick={() => { setShowDonate(false); setDonated(false); }}
                  className="px-6 py-2 rounded-full text-sm"
                  style={{ background: "rgba(126,200,227,0.15)", color: "#7ec8e3", cursor: "pointer" }}>
                  关闭
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Adopt Modal */}
      {showAdopt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div className="w-full max-w-md rounded-3xl p-8" style={{ background: "#ffffff", border: "1px solid rgba(78,205,196,0.2)" }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl" style={{ color: "#1e1b4b", fontWeight: 700 }}>🏠 线下领养申请</h3>
              <button onClick={() => { setShowAdopt(false); setAdopted(false); }} style={{ color: "#888", cursor: "pointer" }}><X size={20} /></button>
            </div>

            {!adopted ? (
              <>
                <p className="text-sm mb-5 leading-relaxed" style={{ color: "#4c4980" }}>
                  提交线下领养申请后，机构将与您取得联系安排见面。领养成功后需缴纳
                  <span style={{ color: "#f7a541" }}>0.1 AVAX 保证金</span>（锁定 1 年，��访通过后退还），
                  并获得专属 Genesis NFT。
                </p>

                <div className="space-y-3 mb-6">
                  {[
                    "提交申请 → 猫咪状态变为申请中",
                    "机构审核通过 → 缴纳 0.1 AVAX 保证金",
                    "一年后回访通过 → 退还保证金 + 获得 Genesis NFT",
                    "回访失败 → 保证金转给机构",
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs"
                        style={{ background: "rgba(78,205,196,0.15)", color: "#4ecdc4", border: "1px solid rgba(78,205,196,0.3)" }}>
                        {i + 1}
                      </div>
                      <p className="text-sm" style={{ color: "#4c4980" }}>{step}</p>
                    </div>
                  ))}
                </div>

                <button onClick={handleAdopt} disabled={adopting}
                  className="w-full py-4 rounded-xl"
                  style={{ background: "linear-gradient(135deg, #4ecdc4, #7ec8e3)", color: "#1e1b4b", fontWeight: 700, cursor: "pointer", opacity: adopting ? 0.7 : 1 }}>
                  {adopting ? "提交中..." : !walletConnected ? "🔗 连接钱包后申请" : "📋 提交领养申请"}
                </button>
              </>
            ) : (
              <div className="text-center py-4 flex flex-col items-center gap-4">
                <CheckCircle size={48} color="#4ecdc4" />
                <h4 style={{ color: "#1e1b4b", fontWeight: 700 }}>申请已提交！</h4>
                <p className="text-sm" style={{ color: "#4c4980" }}>机构将在 3 个工作日内与您联系 📞<br />猫咪状态已更新为"领养申请中"。</p>
                <button onClick={() => { setShowAdopt(false); setAdopted(false); }}
                  className="px-6 py-2 rounded-full text-sm"
                  style={{ background: "rgba(126,200,227,0.15)", color: "#7ec8e3", cursor: "pointer" }}>
                  关闭
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Game Entry Modal */}
      {showGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div className="w-full max-w-md rounded-3xl p-8" style={{ background: "#ffffff", border: "1px solid rgba(168,85,247,0.2)" }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl" style={{ color: "#1e1b4b", fontWeight: 700 }}>🎮 选择此猫进入游戏</h3>
              <button onClick={() => setShowGame(false)} style={{ color: "#888", cursor: "pointer" }}><X size={20} /></button>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl mb-5"
              style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.15)" }}>
              <img src={cat.imageUrl} alt={cat.name} className="w-16 h-16 rounded-xl object-cover" />
              <div>
                <p style={{ color: "#1e1b4b", fontWeight: 700 }}>{cat.name}</p>
                <p className="text-sm" style={{ color: "#4c4980" }}>{cat.breed} · {STAGE_LABELS[cat.stage]}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { icon: "🆓", text: "首次选择此猫进入游戏完全免费" },
                { icon: "🎁", text: `获得 ${cat.name} 已有的成长系列 NFT（当前 Stage ${cat.stage}）` },
                { icon: "🎯", text: "可派猫出猎，收集材料碎片与收藏 NFT" },
                { icon: "⚡", text: "初始体力 5/5，每 8 小时自然恢复 1 点" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <p className="text-sm" style={{ color: "#4c4980" }}>{item.text}</p>
                </div>
              ))}
            </div>

            {!nftClaimed && (
              <div className="p-3 rounded-xl mb-4 flex items-start gap-2" style={{ background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)" }}>
                <AlertCircle size={16} color="#ff6b6b" className="mt-0.5 flex-shrink-0" />
                <p className="text-sm" style={{ color: "#ff6b6b" }}>请先领取全家福 NFT 再进入游戏</p>
              </div>
            )}

            <button onClick={handleEnterGame} disabled={!nftClaimed}
              className="w-full py-4 rounded-xl disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg, #a855f7, #7ec8e3)",
                color: "#1e1b4b", fontWeight: 700, cursor: nftClaimed ? "pointer" : "default"
              }}>
              🚀 进入游戏
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 mb-6 text-sm"
          style={{ color: "#7c7aaa" }}>
          <ArrowLeft size={16} />
          返回档案馆
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Image */}
          <div>
            <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "1" }}>
              <img src={cat.imageUrl} alt={cat.name}
                className="w-full h-full object-cover"
                style={{ filter: isAdopted ? "grayscale(20%)" : "none" }} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,8,25,0.6), transparent 60%)" }} />

              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs"
                    style={{ background: `${statusInfo.color}20`, color: statusInfo.color, border: `1px solid ${statusInfo.color}40` }}>
                    {isAdopted && <Home size={10} className="inline mr-1" />}
                    {statusInfo.label}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs"
                    style={{ background: "rgba(168,85,247,0.2)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.3)" }}>
                    {STAGE_LABELS[cat.stage]}
                  </span>
                </div>
              </div>
            </div>

            {/* NFT stages */}
            <div className="mt-4 p-4 rounded-2xl" style={{ background: "rgba(109,58,238,0.03)", border: "1px solid rgba(109,58,238,0.06)" }}>
              <p className="text-sm mb-3" style={{ color: "#7ec8e3" }}>成长阶段 NFT</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(s => (
                  <div key={s} className="flex-1 py-2 px-3 rounded-xl text-center text-xs"
                    style={{
                      background: s <= cat.stage ? "rgba(168,85,247,0.15)" : "rgba(109,58,238,0.03)",
                      border: s <= cat.stage ? "1px solid rgba(168,85,247,0.35)" : "1px solid rgba(109,58,238,0.06)",
                      color: s <= cat.stage ? "#a855f7" : "#444466",
                    }}>
                    {s === 1 ? "幼" : s === 2 ? "少" : s === 3 ? "成" : "✨"}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Info */}
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-4xl mb-1" style={{ color: "#1e1b4b", fontWeight: 900 }}>{cat.name}</h1>
              <p className="text-sm" style={{ color: "#7c7aaa" }}>
                {cat.gender === "male" ? "♂ 公猫" : "♀ 母猫"} · {cat.age} 岁 · {cat.breed}
              </p>
            </div>

            {/* Shelter */}
            <div className="flex items-center gap-2 text-sm" style={{ color: "#4c4980" }}>
              <MapPin size={14} style={{ color: "#7ec8e3" }} />
              <span>收容机构：<span style={{ color: "#7ec8e3" }}>{cat.shelter}</span></span>
            </div>

            {/* Description */}
            <div className="p-5 rounded-2xl" style={{ background: "rgba(109,58,238,0.03)", border: "1px solid rgba(109,58,238,0.06)" }}>
              <p className="text-sm leading-relaxed" style={{ color: "#4c4980" }}>{cat.desc}</p>
            </div>

            {/* Donation stats */}
            {cat.donationTotal > 0 && (
              <div className="p-4 rounded-2xl flex items-center gap-4"
                style={{ background: "rgba(247,165,65,0.07)", border: "1px solid rgba(247,165,65,0.15)" }}>
                <Heart size={24} color="#ff6b6b" className="flex-shrink-0" />
                <div>
                  <p className="text-sm" style={{ color: "#f7a541", fontWeight: 700 }}>{cat.donationTotal.toFixed(2)} AVAX 已获捐款</p>
                  <p className="text-xs" style={{ color: "#7c7aaa" }}>来自爱心用户，已直达机构钱包</p>
                </div>
              </div>
            )}

            {/* Blockchain info */}
            <div className="p-4 rounded-2xl text-xs space-y-2" style={{ background: "rgba(126,200,227,0.05)", border: "1px solid rgba(126,200,227,0.1)" }}>
              <p style={{ color: "#7ec8e3" }}>🔗 链上信息（Avalanche Fuji C-Chain）</p>
              <p style={{ color: "#7c7aaa" }}>Cat ID: #{cat.id} · stageURIs[{cat.stage - 1}] 已激活</p>
              <p style={{ color: "#7c7aaa" }}>状态: CatRegistry.CatStatus.{cat.status}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {/* Adopt Button */}
              <button
                onClick={() => !isAdopted && setShowAdopt(true)}
                disabled={isAdopted}
                className="flex items-center justify-center gap-3 py-4 rounded-2xl transition-all"
                style={{
                  background: isAdopted ? "rgba(136,136,136,0.1)" : "linear-gradient(135deg, rgba(78,205,196,0.2), rgba(126,200,227,0.2))",
                  border: isAdopted ? "1px solid rgba(136,136,136,0.2)" : "1px solid rgba(78,205,196,0.4)",
                  color: isAdopted ? "#555" : "#4ecdc4",
                  cursor: isAdopted ? "default" : "pointer",
                  fontWeight: 700,
                }}>
                <Home size={20} />
                {isAdopted ? "🏠 此猫咪已有家" : "申请线下领养"}
              </button>

              <div className="grid grid-cols-2 gap-3">
                {/* Donate Button */}
                <button
                  onClick={() => !isAdopted && setShowDonate(true)}
                  disabled={isAdopted}
                  className="flex items-center justify-center gap-2 py-4 rounded-2xl transition-all"
                  style={{
                    background: isAdopted ? "rgba(136,136,136,0.08)" : "rgba(247,165,65,0.15)",
                    border: isAdopted ? "1px solid rgba(136,136,136,0.15)" : "1px solid rgba(247,165,65,0.35)",
                    color: isAdopted ? "#444" : "#f7a541",
                    cursor: isAdopted ? "default" : "pointer",
                    fontWeight: 600,
                  }}>
                  <Heart size={18} />
                  {isAdopted ? "捐款已关闭" : "爱心捐款"}
                </button>

                {/* Game Button */}
                <button
                  onClick={() => setShowGame(true)}
                  className="flex items-center justify-center gap-2 py-4 rounded-2xl transition-all"
                  style={{
                    background: "rgba(168,85,247,0.15)",
                    border: "1px solid rgba(168,85,247,0.35)",
                    color: "#a855f7",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}>
                  <Gamepad2 size={18} />
                  进入游戏
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
