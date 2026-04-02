import { type PropsWithChildren, useMemo, useState } from "react";
import {
  RainbowKitProvider,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  WagmiProvider,
  createConfig,
  http,
  useAccount,
  useConnect,
  useDisconnect,
  useSignMessage,
} from "wagmi";
import { avalanche, mainnet } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";

const appUrl =
  typeof window !== "undefined" ? window.location.origin : "https://furever.local";

const config = createConfig({
  chains: [avalanche, mainnet],
  connectors: [
    metaMask({
      dappMetadata: {
        name: "FurEver",
        url: appUrl,
      },
    }),
  ],
  transports: {
    [avalanche.id]: http(),
    [mainnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: PropsWithChildren) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          locale="zh-CN"
          theme={lightTheme({
            accentColor: "#ff8c42",
            accentColorForeground: "#ffffff",
            borderRadius: "large",
            overlayBlur: "small",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export function HomeWalletButton() {
  const { address, isConnected } = useAccount();
  const { connectors, connectAsync, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync, isPending: isSigning } = useSignMessage();
  const [isSigned, setIsSigned] = useState(false);
  const [lastSignature, setLastSignature] = useState<string | null>(null);

  const metaMaskConnector = useMemo(
    () =>
      connectors.find(
        (connector) =>
          connector.id.toLowerCase().includes("meta") ||
          connector.name.toLowerCase().includes("metamask"),
      ) ?? connectors[0],
    [connectors],
  );

  async function requestSignature(walletAddress?: string) {
    const signature = await signMessageAsync({
      message: `FurEver 登录认证\n\n地址：${walletAddress ?? address ?? "未连接"}\n时间：${new Date().toISOString()}`,
    });

    setLastSignature(signature);
    setIsSigned(true);
  }

  async function handleWalletClick() {
    try {
      if (!metaMaskConnector) return;

      const connectedAddress = isConnected
        ? address
        : (await connectAsync({ connector: metaMaskConnector })).accounts[0];

      await requestSignature(connectedAddress);
    } catch (error) {
      console.error("MetaMask connect/sign failed:", error);
    }
  }

  if (isConnected && isSigned && address) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleWalletClick}
          className="home-wallet-button home-wallet-button-connected"
          title={lastSignature ?? undefined}
        >
          {address.slice(0, 6)}...{address.slice(-4)}
        </button>
        <button
          type="button"
          onClick={() => {
            disconnect();
            setIsSigned(false);
            setLastSignature(null);
          }}
          className="home-wallet-button home-wallet-button-secondary"
        >
          退出
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleWalletClick}
      disabled={isConnecting || isSigning || !metaMaskConnector}
      className="home-wallet-button"
    >
      {isConnecting || isSigning ? "MetaMask 签名中..." : "连接钱包"}
    </button>
  );
}
