import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";

import { BrandMark } from "../components/ui/BrandMark";
import { useAppState } from "../state/useAppState";
import { hasWalletConnectProjectId } from "../web3/rainbowkit";
import { clearAuthSession, hasPersistedAuthSession, persistAuthSession } from "../lib/authSession";

type WalletOptionId = "metamask" | "walletconnect" | "coinbase";

type WalletCardConfig = {
  id: WalletOptionId;
  subtitle: string;
  title: string;
};

type SigningRequest = {
  issuedAt: string;
  nonce: string;
  walletAddress: string;
};

const WALLET_CARDS: WalletCardConfig[] = [
  {
    id: "metamask",
    subtitle: "Browser extension",
    title: "MetaMask",
  },
  {
    id: "walletconnect",
    subtitle: "Mobile & hardware",
    title: "WalletConnect",
  },
  {
    id: "coinbase",
    subtitle: "Smart wallet",
    title: "Coinbase Wallet",
  },
];

function explainConnectError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  if (
    message.includes("User rejected") ||
    message.includes("user rejected") ||
    message.includes("User denied") ||
    message.includes("rejected the request")
  ) {
    return "你刚刚取消了连接或签名请求，请重新点一次。";
  }

  if (
    message.includes("Already processing eth_requestAccounts") ||
    message.includes("request already pending") ||
    message.includes("ResourceUnavailableRpcError")
  ) {
    return "钱包里还有一个未处理的请求。请先确认或取消，再回来重试。";
  }

  if (message.includes("Connector not found")) {
    return "这个钱包当前不可用，请检查浏览器扩展或钱包配置。";
  }

  return message;
}

function normalizeConnectorName(value: string | undefined) {
  return (value ?? "").toLowerCase();
}

function matchesWalletOption(optionId: WalletOptionId, connectorName: string, connectorId: string) {
  if (optionId === "metamask") {
    return connectorName.includes("metamask") || connectorId.includes("meta");
  }

  if (optionId === "walletconnect") {
    return connectorName.includes("walletconnect") || connectorId.includes("walletconnect");
  }

  return connectorName.includes("coinbase") || connectorId.includes("coinbase");
}

function fallbackMatchesWalletOption(optionId: WalletOptionId, connectorName: string, connectorId: string) {
  if (optionId !== "metamask") {
    return false;
  }

  return connectorName.includes("injected") || connectorName.includes("browser") || connectorId.includes("injected");
}

function createSigningRequest(walletAddress: string): SigningRequest {
  return {
    issuedAt: `${new Date().toISOString().slice(0, 19)}Z`,
    nonce: Date.now().toString(16).toUpperCase().slice(-8),
    walletAddress,
  };
}

function buildSigningMessage(request: SigningRequest) {
  return [
    "Semaphore Authentication",
    `Wallet: ${request.walletAddress}`,
    `Nonce: ${request.nonce}`,
    `Issued: ${request.issuedAt}`,
    "Sign this message to continue into Semaphore.",
  ].join("\n");
}

function MetaMaskIcon() {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,rgba(45,45,78,0.95),rgba(34,34,60,0.92))] text-[30px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <span aria-hidden="true">🦊</span>
    </div>
  );
}

function WalletConnectIcon() {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,rgba(45,45,78,0.95),rgba(34,34,60,0.92))] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <circle cx="14" cy="14" r="14" fill="#2A3457" />
        <path
          d="M8.6 10.6c2.5-2.5 6.3-2.5 8.8 0l.3.3c.1.1.1.3 0 .4l-1 1c-.1.1-.3.1-.4 0l-.5-.5c-1.5-1.5-3.9-1.5-5.4 0l-.4.4c-.1.1-.3.1-.4 0l-1-1a.28.28 0 0 1 0-.4l.2-.2Zm10.7 2.6.9.9c.1.1.1.3 0 .4l-4.1 4.1a.28.28 0 0 1-.4 0L13.9 17a.28.28 0 0 0-.4 0l-1.8 1.8a.28.28 0 0 1-.4 0l-4.1-4.1a.28.28 0 0 1 0-.4l.9-.9c.1-.1.3-.1.4 0l2.2 2.2a.28.28 0 0 0 .4 0l1.8-1.8c.6-.6 1.5-.6 2.1 0l1.8 1.8a.28.28 0 0 0 .4 0l2.2-2.2c.1-.1.3-.1.4 0Z"
          fill="#F8FAFF"
        />
      </svg>
    </div>
  );
}

function CoinbaseIcon() {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,rgba(45,45,78,0.95),rgba(34,34,60,0.92))] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(180deg,#3B82F6_0%,#1D4ED8_100%)] shadow-[0_0_14px_rgba(59,130,246,0.3)]">
        <div className="h-3.5 w-3.5 rounded-full border-2 border-white" />
      </div>
    </div>
  );
}

function WalletIcon({ optionId }: { optionId: WalletOptionId }) {
  if (optionId === "metamask") {
    return <MetaMaskIcon />;
  }

  if (optionId === "walletconnect") {
    return <WalletConnectIcon />;
  }

  return <CoinbaseIcon />;
}

function WalletCard({
  available,
  busy,
  onClick,
  option,
}: {
  available: boolean;
  busy: boolean;
  onClick: () => void;
  option: WalletCardConfig;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!available || busy}
      className={[
        "flex w-full items-center justify-between rounded-[18px] border px-5 py-4 text-left transition-all",
        available
          ? "border-[var(--line)] bg-[var(--surface-raised)] hover:border-[rgba(196,168,90,0.35)] hover:bg-[rgba(196,168,90,0.06)]"
          : "border-[rgba(76,76,104,0.55)] bg-[rgba(24,24,42,0.86)] opacity-60",
        busy ? "cursor-wait" : available ? "cursor-pointer" : "cursor-not-allowed",
      ].join(" ")}
    >
      <div className="flex items-center gap-4">
        <WalletIcon optionId={option.id} />
        <div>
          <div className="text-[18px] text-[var(--text-primary)]">{option.title}</div>
          <div className="mt-1 text-sm text-[var(--text-muted)]">
            {available ? option.subtitle : "Not configured"}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {!available ? (
          <span className="rounded-full border border-[rgba(155,127,212,0.32)] bg-[rgba(155,127,212,0.08)] px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] text-[var(--resonance)]">
            Locked
          </span>
        ) : null}
        <span className="text-[28px] leading-none text-[var(--text-muted)]">›</span>
      </div>
    </button>
  );
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const { address, connector, isConnected } = useAccount();
  const { connectAsync, connectors, isPending } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { signMessageAsync, isPending: signaturePending } = useSignMessage();
  const { state, syncError, syncPending, retrySync } = useAppState();
  const [hasStartedFlow, setHasStartedFlow] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [hasSignedMessage, setHasSignedMessage] = useState(false);
  const [selectedWalletOption, setSelectedWalletOption] = useState<WalletOptionId | null>(null);
  const [signingRequest, setSigningRequest] = useState<SigningRequest | null>(null);
  const walletName = state.session.walletName ?? connector?.name ?? "Wallet";
  const flowError = hasStartedFlow ? syncError ?? connectError : null;
  const currentWalletAddress = address ?? state.session.walletAddress ?? "";
  const persistedSignatureVerified = hasPersistedAuthSession(currentWalletAddress);
  const showSuccess = state.session.inviteVerified && state.session.signatureVerified;
  const showSigning = hasStartedFlow && !showSuccess;
  const connectedAddress = state.session.walletAddress ?? "";

  const connectorByOption = useMemo(() => {
    const findConnectorForOption = (optionId: WalletOptionId) => {
      const exactMatch =
        connectors.find((item) =>
          matchesWalletOption(optionId, normalizeConnectorName(item.name), normalizeConnectorName(item.id)),
        ) ?? null;

      if (exactMatch) {
        return exactMatch;
      }

      return (
        connectors.find((item) =>
          fallbackMatchesWalletOption(optionId, normalizeConnectorName(item.name), normalizeConnectorName(item.id)),
        ) ?? null
      );
    };

    return {
      metamask: findConnectorForOption("metamask"),
      walletconnect: findConnectorForOption("walletconnect"),
      coinbase: findConnectorForOption("coinbase"),
    };
  }, [connectors]);

  const walletStatusLines = useMemo(
    () => [
      {
        label: "Action",
        value: !isConnected
          ? "Connect your wallet in MetaMask"
          : signaturePending || !hasSignedMessage
            ? "Sign the wallet message in MetaMask"
            : syncPending
              ? "Approve local chain access in wallet"
              : "Synchronizing wallet session",
      },
      {
        label: "Wallet",
        value: signingRequest?.walletAddress
          ? `${signingRequest.walletAddress.slice(0, 10)}...${signingRequest.walletAddress.slice(-6)}`
          : connectedAddress
            ? `${connectedAddress.slice(0, 10)}...${connectedAddress.slice(-6)}`
          : "Waiting for wallet address",
      },
      {
        label: "Nonce",
        value: signingRequest?.nonce ?? "Waiting for signature request",
      },
      {
        label: "Issued",
        value: signingRequest?.issuedAt ?? "Waiting for signature request",
      },
    ],
    [connectedAddress, hasSignedMessage, isConnected, signaturePending, signingRequest, syncPending],
  );

  const walletCards = useMemo(
    () =>
      WALLET_CARDS.map((option) => ({
        ...option,
        available:
          option.id === "metamask"
            ? Boolean(connectorByOption.metamask)
            : option.id === "walletconnect"
              ? Boolean(connectorByOption.walletconnect)
              : Boolean(connectorByOption.coinbase),
      })),
    [connectorByOption.coinbase, connectorByOption.metamask, connectorByOption.walletconnect],
  );

  useEffect(() => {
    setHasSignedMessage(state.session.signatureVerified || persistedSignatureVerified);
  }, [persistedSignatureVerified, state.session.signatureVerified]);

  useEffect(() => {
    if (!showSuccess || hasStartedFlow) {
      return;
    }

    navigate("/discover", { replace: true });
  }, [hasStartedFlow, navigate, showSuccess]);

  async function switchWallet() {
    try {
      clearAuthSession();
      await disconnectAsync();
    } catch {
      return;
    }

    setHasStartedFlow(false);
    setConnectError(null);
    setHasSignedMessage(false);
    setSelectedWalletOption(null);
    setSigningRequest(null);
  }

  function enterApp() {
    navigate("/threshold", { replace: true });
  }

  async function startFlow(optionId: WalletOptionId) {
    setHasStartedFlow(true);
    setConnectError(null);
    setHasSignedMessage(false);
    setSelectedWalletOption(optionId);
    setSigningRequest(null);

    try {
      const selectedConnector = connectorByOption[optionId];

      if (!selectedConnector) {
        if (optionId !== "metamask" && !hasWalletConnectProjectId) {
          setConnectError("当前未配置 WalletConnect 项目 ID，所以这个钱包入口还不能用。先配置 VITE_WALLETCONNECT_PROJECT_ID。");
          return;
        }

        setConnectError("这个钱包当前没有对应的真实连接器，请检查扩展或 RainbowKit 配置。");
        return;
      }

      let nextWalletAddress = address ?? state.session.walletAddress ?? "";

      if (isConnected) {
        const currentConnectorName = normalizeConnectorName(connector?.name);
        const currentConnectorId = normalizeConnectorName(connector?.id);

        if (matchesWalletOption(optionId, currentConnectorName, currentConnectorId)) {
          if (!nextWalletAddress) {
            throw new Error("当前钱包地址还没准备好，请稍后再试一次。");
          }
        } else {
          await disconnectAsync();
          nextWalletAddress = "";
        }
      }

      if (!nextWalletAddress) {
        const connection = await connectAsync({ connector: selectedConnector });
        nextWalletAddress = connection.accounts[0] ?? "";
      }

      if (!nextWalletAddress) {
        throw new Error("没有读取到钱包地址，请确认 MetaMask 已解锁。");
      }

      if (hasPersistedAuthSession(nextWalletAddress)) {
        setHasSignedMessage(true);
        retrySync();
        return;
      }

      const nextSigningRequest = createSigningRequest(nextWalletAddress);
      setSigningRequest(nextSigningRequest);

      await signMessageAsync({
        account: nextWalletAddress as `0x${string}`,
        message: buildSigningMessage(nextSigningRequest),
      });

      persistAuthSession(nextWalletAddress);
      setHasSignedMessage(true);
      retrySync();
    } catch (error) {
      setConnectError(explainConnectError(error));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-[420px] rounded-[20px] border border-[var(--line)] bg-[var(--surface)] px-8 py-9 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="mb-7 flex justify-center">
          <BrandMark />
        </div>

        {!showSigning && !showSuccess ? (
          <>
            <div className="space-y-2 text-center">
              <h1 className="font-display text-[30px] text-[var(--text-primary)]">Connect your wallet</h1>
              <p className="text-sm leading-7 text-[var(--text-secondary)]">
                Your wallet is your identity.
                <br />
                No password. No email. Just your keys.
              </p>
            </div>

            <div className="mt-7 space-y-3">
              {walletCards.map((option) => (
                <WalletCard
                  key={option.id}
                  available={option.available}
                  busy={isPending || syncPending}
                  onClick={() => void startFlow(option.id)}
                  option={option}
                />
              ))}
            </div>

            {flowError ? (
              <div className="mt-6 rounded-xl border border-[rgba(239,68,68,0.28)] bg-[rgba(239,68,68,0.08)] px-4 py-4 text-center">
                <p className="whitespace-pre-line text-sm leading-6 text-[#FCA5A5]">{flowError}</p>
                {syncError ? (
                  <button
                    type="button"
                    onClick={retrySync}
                    className="mt-3 rounded-full border border-[rgba(196,168,90,0.35)] px-4 py-2 text-xs text-[var(--signal)] transition-colors hover:bg-[rgba(196,168,90,0.12)]"
                  >
                    重新同步
                  </button>
                ) : null}
              </div>
            ) : null}
          </>
        ) : null}

        {showSigning ? (
          <>
            <div className="space-y-2 text-center">
              <h1 className="font-display text-[30px] text-[var(--text-primary)]">Confirm in {walletName}</h1>
              <p className="text-sm leading-7 text-[var(--text-secondary)]">
                Approve the wallet request below to finish
                <br />
                connecting to your Avalanche Fuji Semaphore network.
              </p>
            </div>

            <div className="mt-7 flex flex-col items-center gap-5">
              <div className="relative h-[78px] w-[78px]">
                <div className="absolute inset-0 rounded-full border border-transparent border-t-[var(--signal)] border-r-[var(--signal)] animate-spin" />
                <div className="absolute inset-[10px] rounded-full border border-transparent border-b-[var(--resonance)] border-l-[var(--resonance)] animate-spin [animation-direction:reverse] [animation-duration:1.9s]" />
                <div className="absolute inset-[21px] flex items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-raised)]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#C4A85A">
                    <path d="M12 2L9.5 9.5L2 12L9.5 14.5L12 22L14.5 14.5L22 12L14.5 9.5L12 2Z" opacity="0.9" />
                  </svg>
                </div>
              </div>

              <div className="text-center text-sm leading-6 text-[var(--text-secondary)]">
                {!isConnected
                  ? "Waiting for wallet connection"
                  : signaturePending || !hasSignedMessage
                    ? "Waiting for wallet signature"
                    : syncPending
                      ? "Waiting for Fuji network approval"
                      : "Synchronizing wallet access on Fuji"}
                <div className="mt-2 flex justify-center gap-1 text-[var(--text-muted)]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:0.18s]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:0.36s]" />
                </div>
              </div>

              <div className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface-raised)] px-4 py-3 text-[11px] leading-6 text-[var(--text-muted)]">
                <div className="mb-1 text-[9px] uppercase tracking-[0.12em]">Message to sign</div>
                <div className="text-[var(--text-secondary)]">This signature is required before Semaphore will verify the wallet.</div>
                {walletStatusLines.map((item) => (
                  <div key={item.label}>
                    {item.label}: <span className="text-[var(--signal)]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {flowError ? (
              <div className="mt-6 rounded-xl border border-[rgba(239,68,68,0.28)] bg-[rgba(239,68,68,0.08)] px-4 py-4 text-center">
                <p className="text-sm leading-6 text-[#FCA5A5]">{flowError}</p>
                <div className="mt-3 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (hasSignedMessage) {
                        retrySync();
                        return;
                      }

                      if (selectedWalletOption) {
                        void startFlow(selectedWalletOption);
                      }
                    }}
                    className="rounded-full border border-[rgba(196,168,90,0.35)] px-4 py-2 text-xs text-[var(--signal)] transition-colors hover:bg-[rgba(196,168,90,0.12)]"
                  >
                    {hasSignedMessage ? "重新同步" : "重新签名"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void switchWallet()}
                    className="rounded-full border border-[var(--line)] px-4 py-2 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--line-strong)] hover:text-[var(--text-primary)]"
                  >
                    换个钱包
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => void switchWallet()}
                className="mt-6 w-full rounded-xl border border-[var(--line)] px-4 py-3 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--line-strong)] hover:text-[var(--text-primary)]"
              >
                ← Different wallet
              </button>
            )}
          </>
        ) : null}

        {showSuccess ? (
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full border border-[rgba(74,222,128,0.28)] bg-[rgba(74,222,128,0.08)]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12l4 4L19 8"
                  stroke="#4ADE80"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div>
              <h1 className="font-display text-[30px] text-[var(--text-primary)]">Wallet verified</h1>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Welcome to Semaphore.</p>
            </div>

            <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-raised)] px-4 py-2 text-[11px] text-[var(--text-muted)]">
              {(state.session.walletAddress ?? "").slice(0, 8)}...
              {(state.session.walletAddress ?? "").slice(-6)}
            </div>

            <button
              type="button"
              onClick={enterApp}
              className="mt-2 w-full rounded-xl border border-[rgba(196,168,90,0.35)] bg-[rgba(196,168,90,0.12)] px-4 py-3 text-sm text-[var(--signal)] transition-colors hover:bg-[rgba(196,168,90,0.2)]"
            >
              Enter Semaphore →
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
