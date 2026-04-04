import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Wallet, LogOut, Coins, ChevronDown, Heart, Gift, CreditCard, Image, ShieldCheck, Gamepad2, Building2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { getReadonlyContracts } from "../../lib/contracts";

const OWNER_ADDRESS   = "0x99d23e329CBF9989581De6b6D15A7d2C3DD342df";
const ADMIN_ADDRESSES = [
  "0xA80deB694775DD09e5141b2097A879c7419309c0",
  "0xc3AE0Fd5d1Be2A5d19bb683E43fFa0D3991a074d",
];
const ADMIN_PASSWORD = "purrchain2024";

export function Navbar() {
  const {
    walletAddress, isConnected, purrBalance,
    connectWallet, disconnectWallet,
    lang, setLang,
    starterCatClaimed, starterCatId,
  } = useApp();

  const isOwner = walletAddress?.toLowerCase() === OWNER_ADDRESS.toLowerCase();
  const isAdminWallet = isOwner || ADMIN_ADDRESSES.some(a => a.toLowerCase() === walletAddress?.toLowerCase());
  const [isShelterApproved, setIsShelterApproved] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [myMenuOpen, setMyMenuOpen] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPwd, setAdminPwd] = useState("");
  const [adminErr, setAdminErr] = useState(false);
  const myMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isZh = lang === "zh";

  const shortAddr = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "";

  // 点击外部关闭 My 菜单
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (myMenuRef.current && !myMenuRef.current.contains(e.target as Node)) {
        setMyMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleConnect = async () => {
    await connectWallet();
    navigate("/dashboard");
  };

  const handleAdminSubmit = () => {
    if (adminPwd === ADMIN_PASSWORD) {
      setShowAdminModal(false); setAdminPwd(""); setAdminErr(false);
      navigate("/admin");
    } else { setAdminErr(true); }
  };

  const handleAdminClick = () => {
    if (isAdminWallet) navigate("/admin");
    else setShowAdminModal(true);
  };

  // 检查当前钱包是否为已审批机构
  useEffect(() => {
    if (!walletAddress) { setIsShelterApproved(false); return; }
    getReadonlyContracts().catRegistry.isShelterApproved(walletAddress)
      .then(v => setIsShelterApproved(v as boolean))
      .catch(() => setIsShelterApproved(false));
  }, [walletAddress]);

  const navLink = (to: string, labelZh: string, labelEn: string) => (
    <Link
      to={to}
      className="text-sm transition-colors font-medium"
      style={{
        color: location.pathname === to ? "#F97316" : "#78350f",
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {isZh ? labelZh : labelEn}
    </Link>
  );

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3"
        style={{
          background: "rgba(255, 251, 245, 0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(249,115,22,0.15)",
          boxShadow: "0 2px 12px rgba(249,115,22,0.06)",
        }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="text-2xl">🐾</span>
          <span className="hidden sm:block text-lg font-black" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <span style={{ color: "#F97316" }}>Purr</span>
            <span style={{ color: "#92400e" }}>Chain</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLink("/dashboard", "猫咪档案", "Cat Registry")}
          {navLink("/institution/register", "机构注册", "Register Shelter")}
          {/* 已审批机构显示管理入口 */}
          {isConnected && isShelterApproved && (
            <Link to="/institution/manage"
              className="flex items-center gap-1.5 text-sm font-medium transition-colors"
              style={{ color: location.pathname.startsWith("/institution/manage") ? "#F97316" : "#78350f", fontFamily: "'Nunito', sans-serif" }}>
              <Building2 size={15} />
              {isZh ? "机构管理" : "My Shelter"}
            </Link>
          )}
          {/* 已领初始猫时显示游戏入口 */}
          {isConnected && starterCatClaimed && starterCatId !== null && (
            <Link to={`/game/${starterCatId}`}
              className="flex items-center gap-1.5 text-sm font-medium transition-colors"
              style={{ color: location.pathname.startsWith("/game") ? "#a855f7" : "#78350f", fontFamily: "'Nunito', sans-serif" }}>
              <Gamepad2 size={15} />
              {isZh ? "游戏" : "Game"}
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {/* Admin 入口 */}
          <button
            onClick={handleAdminClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{
              background: "rgba(249,115,22,0.08)",
              border: "1px solid rgba(249,115,22,0.2)",
              color: "#c2410c",
              cursor: "pointer",
            }}
          >
            <ShieldCheck size={13} />
            {isZh ? "管理员" : "Admin"}
          </button>

          {/* PURR 余额（已连接时显示）*/}
          {isConnected && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold"
              style={{
                background: "rgba(249,115,22,0.1)",
                border: "1px solid rgba(249,115,22,0.25)",
                color: "#F97316",
              }}
            >
              <Coins size={14} />
              <span>{purrBalance} PURR</span>
            </div>
          )}

          {/* 语言切换 */}
          <button
            onClick={() => setLang(isZh ? "en" : "zh")}
            className="text-xs px-2 py-1.5 rounded-lg transition-colors font-medium"
            style={{ color: "#92400e", background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.12)", cursor: "pointer" }}
          >
            {isZh ? "EN" : "中文"}
          </button>

          {/* 我的 下拉 */}
          {isConnected && (
            <div className="relative" ref={myMenuRef}>
              <button
                onClick={() => setMyMenuOpen(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: myMenuOpen ? "rgba(249,115,22,0.15)" : "rgba(249,115,22,0.08)",
                  border: "1px solid rgba(249,115,22,0.2)",
                  color: "#c2410c",
                  cursor: "pointer",
                }}
              >
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "linear-gradient(135deg, #F97316, #fbbf24)", color: "#fff" }}>
                  {shortAddr.slice(2, 4).toUpperCase()}
                </span>
                {isZh ? "我的" : "My"}
                <ChevronDown size={12} style={{ transform: myMenuOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>

              {myMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-52 rounded-2xl py-2 z-[100]"
                  style={{
                    background: "rgba(255,251,245,0.98)",
                    border: "1px solid rgba(249,115,22,0.15)",
                    boxShadow: "0 8px 32px rgba(249,115,22,0.12)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <div className="px-4 py-2 border-b mb-1" style={{ borderColor: "rgba(249,115,22,0.1)" }}>
                    <p className="text-xs font-mono" style={{ color: "#92400e" }}>{shortAddr}</p>
                  </div>

                  {[
                    { icon: <Heart size={14} />, zh: "捐赠记录", en: "Donation History", to: "/my/donations" },
                    { icon: <Gift size={14} />, zh: "领养记录", en: "Adoption History", to: "/my/adoptions" },
                    { icon: <Image size={14} />, zh: "我的 NFT", en: "My NFTs", to: "/my/nfts" },
                    { icon: <CreditCard size={14} />, zh: "充值 PURR", en: "Buy PURR", to: "/my/topup" },
                  ].map(item => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMyMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: "#78350f" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(249,115,22,0.07)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <span style={{ color: "#F97316" }}>{item.icon}</span>
                      {isZh ? item.zh : item.en}
                    </Link>
                  ))}

                  <div className="border-t mt-1 pt-1" style={{ borderColor: "rgba(249,115,22,0.1)" }}>
                    <button
                      onClick={() => { disconnectWallet(); setMyMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: "#dc2626", cursor: "pointer" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(220,38,38,0.06)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <LogOut size={14} />
                      {isZh ? "断开钱包" : "Disconnect"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 连接钱包按钮 */}
          {!isConnected && (
            <button
              onClick={handleConnect}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
              style={{
                background: "linear-gradient(135deg, #F97316, #fbbf24)",
                boxShadow: "0 4px 12px rgba(249,115,22,0.3)",
                cursor: "pointer",
              }}
            >
              <Wallet size={15} />
              {isZh ? "连接钱包" : "Connect Wallet"}
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg"
          style={{ color: "#F97316", background: "rgba(249,115,22,0.08)" }}
          onClick={() => setMenuOpen(v => !v)}
        >
          <span style={{ fontSize: 20 }}>{menuOpen ? "✕" : "☰"}</span>
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className="fixed top-14 left-0 right-0 z-40 px-4 py-4 flex flex-col gap-3 md:hidden"
          style={{ background: "rgba(255,251,245,0.98)", borderBottom: "1px solid rgba(249,115,22,0.15)" }}
        >
          <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="text-sm font-medium" style={{ color: "#78350f" }}>
            {isZh ? "猫咪档案" : "Cat Registry"}
          </Link>
          <Link to="/institution/register" onClick={() => setMenuOpen(false)} className="text-sm font-medium" style={{ color: "#78350f" }}>
            {isZh ? "机构注册" : "Institution Register"}
          </Link>
          {isConnected && starterCatClaimed && starterCatId !== null && (
            <Link to={`/game/${starterCatId}`} onClick={() => setMenuOpen(false)} className="flex items-center gap-1.5 text-sm font-medium" style={{ color: "#78350f" }}>
              <Gamepad2 size={14} />{isZh ? "进入游戏" : "Game"}
            </Link>
          )}
          <button onClick={() => { setMenuOpen(false); handleAdminClick(); }} className="text-left text-sm font-medium" style={{ color: "#c2410c" }}>
            {isZh ? "管理员入口" : "Admin"}
          </button>
          {!isConnected ? (
            <button onClick={() => { handleConnect(); setMenuOpen(false); }}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #F97316, #fbbf24)", cursor: "pointer" }}>
              {isZh ? "连接钱包" : "Connect Wallet"}
            </button>
          ) : (
            <button onClick={() => { disconnectWallet(); setMenuOpen(false); }}
              className="text-sm font-medium text-left" style={{ color: "#dc2626", cursor: "pointer" }}>
              {isZh ? "断开钱包" : "Disconnect"}
            </button>
          )}
        </div>
      )}

      {/* Admin 密码 Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-sm rounded-3xl p-6"
            style={{ background: "#fffbf5", border: "1px solid rgba(249,115,22,0.2)", boxShadow: "0 20px 60px rgba(249,115,22,0.15)" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #F97316, #fbbf24)" }}>
                <ShieldCheck size={20} color="#fff" />
              </div>
              <div>
                <h3 className="font-bold text-base" style={{ color: "#92400e" }}>
                  {isZh ? "管理员入口" : "Admin Access"}
                </h3>
                <p className="text-xs" style={{ color: "#b45309" }}>
                  {isZh ? "请输入管理员密码" : "Enter admin password"}
                </p>
              </div>
            </div>
            <input
              type="password"
              value={adminPwd}
              onChange={e => { setAdminPwd(e.target.value); setAdminErr(false); }}
              onKeyDown={e => e.key === "Enter" && handleAdminSubmit()}
              placeholder={isZh ? "密码" : "Password"}
              className="w-full px-4 py-3 rounded-xl outline-none mb-3 text-sm"
              style={{
                background: "rgba(249,115,22,0.06)",
                border: adminErr ? "1px solid #ef4444" : "1px solid rgba(249,115,22,0.2)",
                color: "#92400e",
              }}
              autoFocus
            />
            {adminErr && <p className="text-xs text-red-500 mb-3">{isZh ? "密码错误" : "Incorrect password"}</p>}
            <div className="flex gap-2">
              <button onClick={() => { setShowAdminModal(false); setAdminPwd(""); setAdminErr(false); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: "rgba(249,115,22,0.08)", color: "#92400e", cursor: "pointer" }}>
                {isZh ? "取消" : "Cancel"}
              </button>
              <button onClick={handleAdminSubmit}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #F97316, #fbbf24)", cursor: "pointer" }}>
                {isZh ? "进入" : "Enter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
