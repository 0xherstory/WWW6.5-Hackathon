"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const WALLET_STORAGE_KEY = "ami-wallet-address";
const HERO_COPY =
  "a.mi 是一个面向女性 / 女性友好社群的链上成长承诺与见证工具，帮助用户发起短期目标、获得同伴见证与支持，并将关键成长节点沉淀为可验证的链上记录。";

type EthereumRequestArgs = {
  method: string;
  params?: unknown[] | object;
};

type EthereumProvider = {
  isMetaMask?: boolean;
  request: (args: EthereumRequestArgs) => Promise<unknown>;
};

type WalletConnectionError = Error & {
  code?: number;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

function getWalletErrorMessage(error: unknown) {
  const walletError = error as WalletConnectionError | undefined;

  if (walletError?.code === 4001) {
    return "User rejected wallet connection";
  }

  if (walletError?.message) {
    return walletError.message;
  }

  return "Wallet connection failed";
}

async function connectWallet() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  if (!window.ethereum.isMetaMask) {
    throw new Error("MetaMask is not installed");
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  if (!Array.isArray(accounts) || accounts.length === 0) {
    throw new Error("Wallet connection failed");
  }

  const [address] = accounts;

  if (typeof address !== "string" || !address) {
    throw new Error("Wallet connection failed");
  }

  return address;
}

export default function HomePage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isConnecting) {
        setIsModalOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isConnecting, isModalOpen]);

  const handleOpenModal = () => {
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isConnecting) {
      return;
    }

    setIsModalOpen(false);
  };

  const handleWalletConnected = (address: string) => {
    setWalletAddress(address);
    window.localStorage.setItem(WALLET_STORAGE_KEY, address);
    setIsModalOpen(false);
    router.push("/square");
  };

  const handleConnectWallet = async () => {
    if (isConnecting) {
      return;
    }

    setIsConnecting(true);
    setErrorMessage("");

    try {
      const address = await connectWallet();
      handleWalletConnected(address);
    } catch (error) {
      setErrorMessage(getWalletErrorMessage(error));
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <>
      <main className="relative min-h-screen overflow-hidden bg-[#f7efe9] px-6 py-8 text-[#513b46] sm:py-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-12%] top-[-8%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(228,187,197,0.36),rgba(228,187,197,0)_68%)]" />
          <div className="absolute right-[-10%] top-[8%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(245,226,211,0.72),rgba(245,226,211,0)_72%)]" />
          <div className="absolute bottom-[-18%] left-[16%] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(214,191,198,0.22),rgba(214,191,198,0)_70%)]" />
          <div className="absolute bottom-[6%] right-[10%] h-[18rem] w-[18rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(214,229,215,0.3),rgba(214,229,215,0)_74%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,251,249,0.76)_0%,rgba(249,239,235,0.34)_48%,rgba(248,244,247,0.5)_100%)]" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <section className="relative overflow-hidden rounded-[42px] border border-[rgba(162,127,137,0.16)] bg-[linear-gradient(180deg,rgba(255,252,251,0.94)_0%,rgba(255,247,243,0.9)_100%)] px-8 py-12 shadow-[0_40px_120px_rgba(97,69,78,0.08),0_12px_30px_rgba(138,106,118,0.06)] backdrop-blur-xl md:px-14 md:py-16">
            <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,rgba(213,182,192,0)_0%,rgba(213,182,192,0.55)_50%,rgba(213,182,192,0)_100%)]" />
            <div className="absolute left-[8%] top-[14%] h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,rgba(214,182,192,0.16),rgba(214,182,192,0)_72%)]" />
            <div className="absolute bottom-[-8%] right-[14%] h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,rgba(241,224,210,0.28),rgba(241,224,210,0)_72%)]" />
            <div className="absolute bottom-12 left-10 hidden h-24 w-52 rounded-[28px] border border-[rgba(205,185,168,0.34)] bg-[rgba(255,249,244,0.6)] md:block" />
            <div className="absolute bottom-10 right-12 hidden h-28 w-28 rounded-[36px] border border-[rgba(173,193,173,0.32)] bg-[rgba(242,248,240,0.62)] md:block" />
            <div className="absolute bottom-14 left-1/2 hidden h-16 w-40 -translate-x-1/2 rounded-full border border-[rgba(208,191,200,0.28)] bg-[rgba(255,255,255,0.34)] md:block" />

            <div className="relative mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center gap-3 rounded-full border border-[rgba(186,149,160,0.18)] bg-[rgba(255,255,255,0.7)] px-4 py-2 text-[0.72rem] uppercase tracking-[0.22em] text-[#a16f83] shadow-[0_8px_24px_rgba(173,138,150,0.08)]">
                <span className="h-2 w-2 rounded-full bg-[#c98ba4]" />
                A gentle world is waiting behind the gate
              </div>

              <h1 className="mx-auto mt-8 max-w-4xl text-[clamp(3.8rem,9vw,7rem)] font-semibold leading-[0.9] tracking-[-0.065em] text-[#3d2b34]">
                a.mi
              </h1>

              <p className="mx-auto mt-8 max-w-[52rem] text-[1.05rem] leading-9 text-[#6b545f] md:text-[1.15rem]">
                {HERO_COPY}
              </p>

              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#8a707b] md:text-[0.98rem]">
                从一个小小承诺开始，进入一个被看见、被支持，也能慢慢沉淀成长痕迹的温柔空间。
              </p>

              <div className="mx-auto mt-12 flex justify-center">
                <button
                  type="button"
                  onClick={handleOpenModal}
                  className="group inline-flex min-w-[280px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#c58ca2_0%,#b97c95_100%)] px-8 py-4 text-base font-semibold tracking-[0.01em] text-[#fffafc] shadow-[0_22px_44px_rgba(185,124,149,0.24),inset_0_1px_0_rgba(255,255,255,0.22)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_52px_rgba(185,124,149,0.28),inset_0_1px_0_rgba(255,255,255,0.28)]"
                >
                  <span>enter a.mi area</span>
                  <span className="ml-3 text-lg transition-transform duration-300 group-hover:translate-x-0.5">
                    →
                  </span>
                </button>
              </div>

              <p className="mx-auto mt-4 text-sm leading-7 text-[#8a707b]">
                Connect your wallet to unlock your room and enter the square.
              </p>
            </div>
          </section>
        </div>
      </main>

      {isModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(61,38,48,0.34)] px-6 backdrop-blur-md"
          onClick={handleCloseModal}
          role="presentation"
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-[34px] border border-[rgba(181,141,157,0.18)] bg-[linear-gradient(180deg,rgba(255,252,253,0.98)_0%,rgba(254,248,249,0.96)_100%)] p-8 shadow-[0_32px_100px_rgba(72,45,56,0.22)]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="connect-wallet-title"
          >
            <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,rgba(213,182,192,0)_0%,rgba(213,182,192,0.7)_50%,rgba(213,182,192,0)_100%)]" />
            <div className="absolute right-[-10%] top-[-10%] h-32 w-32 rounded-full bg-[radial-gradient(circle_at_center,rgba(220,184,194,0.26),rgba(220,184,194,0)_70%)]" />

            <p className="relative text-sm uppercase tracking-[0.12em] text-[#b07c92]">
              A.MI Entrance
            </p>
            <h2
              id="connect-wallet-title"
              className="relative mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#3f2b35]"
            >
              Connect Your Wallet
            </h2>
            <p className="relative mt-4 text-sm leading-7 text-[#6d5561]">
              This is your first gentle step into a.mi. Connect your wallet to
              open the gate, unlock your room, and enter the square where your
              commitments can be seen and supported.
            </p>

            {errorMessage ? (
              <div
                className="relative mt-6 rounded-2xl border border-[#e8b4be] bg-[#fff1f4] px-4 py-3 text-sm text-[#9a4357]"
                role="alert"
                aria-live="polite"
              >
                {errorMessage}
              </div>
            ) : null}

            {walletAddress ? (
              <p className="relative mt-4 text-xs tracking-[0.04em] text-[#8a707b]">
                Connected wallet: {walletAddress}
              </p>
            ) : null}

            <div className="relative mt-8 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#c58ca2_0%,#b97c95_100%)] px-6 py-3 text-sm font-semibold text-[#fffafc] shadow-[0_16px_30px_rgba(185,124,149,0.22)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_34px_rgba(185,124,149,0.26)] disabled:cursor-not-allowed disabled:bg-[#d8a8bb]"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isConnecting}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[rgba(167,127,145,0.24)] bg-white/90 px-6 py-3 text-sm font-semibold text-[#5f4451] transition duration-300 hover:bg-[#fff7fa] disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
