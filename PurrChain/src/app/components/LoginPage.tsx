import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { Mail, Lock, Eye, EyeOff, Cat } from "lucide-react";

export function LoginPage() {
  const { setUser } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("请填写邮箱和密码"); return; }
    setLoading(true);
    setError("");
    // Simulate login
    await new Promise(r => setTimeout(r, 1000));
    setUser({
      email,
      type: "user",
      purrBalance: 0,
      hasClaimedNFT: false,
      hasClaimedTokens: false,
    });
    setLoading(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20" style={{ background: "#f7f5ff" }}>
      {/* BG decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-72 h-72 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #7ec8e3, transparent)" }} />
        <div className="absolute bottom-1/3 right-1/3 w-72 h-72 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #a855f7, transparent)" }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="p-8 rounded-3xl" style={{ background: "rgba(109,58,238,0.04)", border: "1px solid rgba(126,200,227,0.15)", backdropFilter: "blur(20px)" }}>
          {/* Logo */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #f7a541, #ff6b6b)" }}>
              <Cat size={28} color="#fff" />
            </div>
            <h1 className="text-2xl" style={{ color: "#1e1b4b", fontWeight: 800 }}>欢迎回来</h1>
            <p className="text-sm text-center" style={{ color: "#7c7aaa" }}>登录您的 PurrChain 账户，连接钱包后开始养猫之旅</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-sm" style={{ color: "#4c4980" }}>电子邮箱</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#7c7aaa" }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all"
                  style={{
                    background: "rgba(109,58,238,0.06)",
                    border: "1px solid rgba(126,200,227,0.15)",
                    color: "#1e1b4b",
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-sm" style={{ color: "#4c4980" }}>密码</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#7c7aaa" }} />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl outline-none transition-all"
                  style={{
                    background: "rgba(109,58,238,0.06)",
                    border: "1px solid rgba(126,200,227,0.15)",
                    color: "#1e1b4b",
                  }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#7c7aaa", cursor: "pointer" }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-center" style={{ color: "#ff6b6b" }}>{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #f7a541, #ff6b6b)", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
              {loading ? "登录中..." : "登录"}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: "rgba(109,58,238,0.08)" }} />
              <span className="text-xs" style={{ color: "#444466" }}>或</span>
              <div className="flex-1 h-px" style={{ background: "rgba(109,58,238,0.08)" }} />
            </div>
            <p className="text-center text-sm" style={{ color: "#7c7aaa" }}>
              机构用户？{" "}
              <Link to="/register" style={{ color: "#7ec8e3" }}>申请机构注册</Link>
            </p>
            <p className="text-center text-sm" style={{ color: "#7c7aaa" }}>
              <Link to="/" style={{ color: "#7c7aaa" }}>← 返回首页</Link>
            </p>
          </div>
        </div>

        {/* Info box */}
        <div className="mt-4 p-4 rounded-2xl text-sm" style={{ background: "rgba(247,165,65,0.08)", border: "1px solid rgba(247,165,65,0.2)", color: "#4c4980" }}>
          <span style={{ color: "#f7a541" }}>💡 演示提示：</span> 填写任意邮箱和密码即可登录体验完整功能，无需真实账户。
        </div>
      </div>
    </div>
  );
}
