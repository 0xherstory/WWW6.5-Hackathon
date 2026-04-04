"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SpaceButton } from "./components/space-shell";
import { useWalletConnection } from "./hooks/use-wallet-connection";

const HERO_COPY =
  "a.mi 是一个面向女性 / 女性友好社群的链上成长承诺与见证工具，帮助用户发起短期目标、获得同伴见证与支持，并将关键成长节点沉淀为可验证的链上记录。";

export default function HomePage() {
  const router = useRouter();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const { walletAddress, walletErrorMessage, isConnectingWallet, connectOrSwitchWallet } =
    useWalletConnection();

  const handleOpenWalletModal = () => {
    setIsWalletModalOpen(true);
  };

  const handleConnectAndEnterTown = async () => {
    const address = await connectOrSwitchWallet();

    if (address) {
      setIsWalletModalOpen(false);
      router.push("/square");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7efe9] px-4 py-6 text-[#513b46] sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-12%] top-[-8%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(228,187,197,0.36),rgba(228,187,197,0)_68%)]" />
        <div className="absolute right-[-10%] top-[8%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(245,226,211,0.72),rgba(245,226,211,0)_72%)]" />
        <div className="absolute bottom-[-18%] left-[16%] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(214,191,198,0.22),rgba(214,191,198,0)_70%)]" />
        <div className="absolute bottom-[6%] right-[10%] h-[18rem] w-[18rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(214,229,215,0.3),rgba(214,229,215,0)_74%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,251,249,0.76)_0%,rgba(249,239,235,0.34)_48%,rgba(248,244,247,0.5)_100%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl items-center justify-center">
        <section className="relative w-full max-w-5xl overflow-hidden rounded-[42px] border border-[rgba(162,127,137,0.16)] bg-[linear-gradient(180deg,rgba(255,252,251,0.94)_0%,rgba(255,247,243,0.9)_100%)] px-8 py-12 shadow-[0_40px_120px_rgba(97,69,78,0.08),0_12px_30px_rgba(138,106,118,0.06)] backdrop-blur-xl md:px-14 md:py-16">
          <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,rgba(213,182,192,0)_0%,rgba(213,182,192,0.55)_50%,rgba(213,182,192,0)_100%)]" />
          <div className="absolute left-[8%] top-[14%] h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,rgba(214,182,192,0.16),rgba(214,182,192,0)_72%)]" />
          <div className="absolute bottom-[-8%] right-[14%] h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,rgba(241,224,210,0.28),rgba(241,224,210,0)_72%)]" />

          <div className="relative mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-[rgba(186,149,160,0.18)] bg-[rgba(255,255,255,0.7)] px-4 py-2 text-[0.72rem] uppercase tracking-[0.22em] text-[#a16f83] shadow-[0_8px_24px_rgba(173,138,150,0.08)]">
              <span className="h-2 w-2 rounded-full bg-[#c98ba4]" />
              温柔的小镇正在门后等你
            </div>

            <div className="mt-8">
              <h1 className="text-[clamp(3.8rem,9vw,7rem)] font-semibold leading-[0.9] tracking-[-0.065em] text-[#3d2b34]">
                a.mi
              </h1>

              <p className="mt-8 text-[1.05rem] leading-9 text-[#6b545f] md:text-[1.15rem]">
                {HERO_COPY}
              </p>

              <p className="mt-5 text-sm leading-7 text-[#8a707b] md:text-[0.98rem]">
                从一个小小承诺开始，进入一个被看见、被支持，也能慢慢沉淀成长痕迹的温柔空间。
              </p>

              <div className="mt-12 flex justify-center">
                <SpaceButton onClick={handleOpenWalletModal}>进入主城</SpaceButton>
              </div>

              <p className="mt-4 text-sm leading-7 text-[#8a707b]">
                {walletAddress
                  ? "点击按钮后会先打开钱包连接弹窗，再确认是否使用当前钱包进入主城。"
                  : "点击上方按钮后会先打开钱包连接弹窗，再调用 MetaMask 完成连接。"}
              </p>

              {walletErrorMessage ? (
                <p className="mt-4 text-sm leading-7 text-[#9B5C6B]">{walletErrorMessage}</p>
              ) : null}
            </div>
          </div>
        </section>
      </div>

      {isWalletModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(58,44,39,0.22)] px-4 backdrop-blur-[3px]"
          onClick={() => setIsWalletModalOpen(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-md rounded-[30px] border border-[rgba(255,255,255,0.36)] bg-[rgba(255,249,242,0.95)] p-6 shadow-[0_24px_60px_rgba(83,64,46,0.18)] backdrop-blur-xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="wallet-connect-title"
          >
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#9B7E60]">
              钱包连接
            </p>
            <h2
              id="wallet-connect-title"
              className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#5D5148]"
            >
              进入主城前，先连接钱包
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#6F625A]">
              点击下方按钮后会调用 MetaMask。请在钱包插件中确认连接，连接成功后才会进入主城。
            </p>

            {walletAddress ? (
              <div className="mt-4 rounded-[22px] border border-[rgba(205,186,166,0.24)] bg-white/70 px-4 py-3">
                <p className="text-[11px] tracking-[0.16em] text-[#9B7E60]">当前检测到的钱包</p>
                <p className="mt-1 break-all text-base font-semibold text-[#5D5148]">
                  {walletAddress}
                </p>
              </div>
            ) : null}

            {walletErrorMessage ? (
              <p className="mt-4 rounded-[18px] bg-[rgba(209,111,130,0.12)] px-4 py-3 text-sm text-[#96576d]">
                {walletErrorMessage}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsWalletModalOpen(false)}
                className="rounded-full bg-[rgba(240,231,222,0.95)] px-5 py-3 text-sm text-[#6A5B52] transition hover:bg-[rgba(234,221,209,0.96)]"
              >
                取消
              </button>
              <SpaceButton onClick={handleConnectAndEnterTown}>
                {isConnectingWallet ? "连接中..." : "Connect Wallet"}
              </SpaceButton>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
