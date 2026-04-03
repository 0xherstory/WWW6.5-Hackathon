import Link from "next/link";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f3e8ff] to-[#ffe4f0] px-4 py-10 text-[#4c1d95]">
      <section className="mx-auto w-full max-w-3xl rounded-2xl border border-white/70 bg-white/80 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-[#9f1239]">个人中心 / Profile</h1>
        <p className="mt-3 text-sm text-[#9f1239]/85">
          这里将展示你的钱包身份、周期记录、MOON 收益与隐私设置。
        </p>
        <p className="mt-1 text-sm text-[#9f1239]/85">
          This is your personal center for wallet identity, cycle records, MOON rewards and privacy settings.
        </p>

        <div className="mt-6 rounded-2xl border border-pink-200/90 bg-gradient-to-br from-white/90 to-[#fff7fb] p-5 shadow-sm">
          <h2 className="text-base font-semibold text-[#9f1239]">手机号登录（即将上线）</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#9f1239]/80">
            绑定身份后，未来将支持使用「手机号 + 密码」回到小屋，无需仅依赖钱包扩展。当前为占位入口，后端与鉴权接入后即可使用。
          </p>
          <p className="mt-1 text-xs text-[#9f1239]/65">
            Phone + password sign-in (coming soon). Use this flow once backend auth is wired.
          </p>
          <button
            type="button"
            disabled
            className="glow-hover mt-4 w-full cursor-not-allowed rounded-xl border border-pink-200/80 bg-white/60 px-4 py-3 text-sm font-medium text-[#9f1239]/45"
          >
            使用手机号登录（暂未开放）
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-pink-200 bg-white/75 p-4 text-sm">
          <p>功能开发中，下一步可接入 thirdweb v5 与合约真实数据。</p>
        </div>

        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-[#f472b6] to-[#d946ef] px-4 py-2 text-sm font-semibold text-white"
        >
          返回首页
        </Link>
      </section>
    </main>
  );
}
