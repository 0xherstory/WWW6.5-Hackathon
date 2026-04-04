import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import {
  connectWallet as connectMetaMask,
  formatAddress,
  formatPurr,
  onAccountChange,
  onChainChange,
  isMetaMaskInstalled,
} from "../../lib/web3";
import { getContracts, getReadonlyContracts } from "../../lib/contracts";

// ============================================================
//  类型定义
// ============================================================

interface AppContextType {
  // 钱包状态
  walletAddress: string | null;
  isConnected: boolean;
  formattedAddress: string;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;

  // 链上资产状态
  purrBalance: string;
  purrBalanceRaw: bigint;
  nftClaimed: boolean;           // 是否已领全家福 NFT
  familyPortraitTokenId: number | null;
  welcomeClaimed: boolean;       // 是否已领 20 PURR 欢迎奖励
  starterCatClaimed: boolean;    // 是否已领免费初始猫
  starterCatId: number | null;   // 初始猫对应的真实猫 ID (CatRegistry id)

  // 链上操作
  claimFamilyPortrait: () => Promise<void>;
  claimWelcomeTokens: () => Promise<void>;
  claimAll: () => Promise<void>;  // 一次完成全家福 + 20 PURR
  claimStarterCat: (realCatId: number) => Promise<void>;
  refreshBalance: () => Promise<void>;

  // 错误 & 加载
  error: string | null;
  clearError: () => void;
  isLoading: boolean;

  // signer（其他页面需要发交易时用）
  signer: ethers.Signer | null;

  // 语言
  lang: "zh" | "en";
  setLang: (lang: "zh" | "en") => void;
}

// ============================================================
//  Context
// ============================================================

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [walletAddress, setWalletAddress]     = useState<string | null>(null);
  const [signer, setSigner]                   = useState<ethers.Signer | null>(null);
  const [isConnecting, setIsConnecting]       = useState(false);
  const [purrBalanceRaw, setPurrBalanceRaw]   = useState<bigint>(0n);
  const [nftClaimed, setNftClaimed]           = useState(false);
  const [familyPortraitTokenId, setFamilyPortraitTokenId] = useState<number | null>(null);
  const [welcomeClaimed, setWelcomeClaimed]   = useState(false);
  const [starterCatClaimed, setStarterCatClaimed] = useState(false);
  const [starterCatId, setStarterCatId]       = useState<number | null>(null);
  const [error, setError]                     = useState<string | null>(null);
  const [isLoading, setIsLoading]             = useState(false);
  const [lang, setLang]                       = useState<"zh" | "en">("zh");

  // ── 读取用户链上状态 ──────────────────────────────────────

  const loadUserState = useCallback(async (address: string) => {
    try {
      setIsLoading(true);
      const c = getReadonlyContracts();

      const [
        purr,
        portraitClaimed,
        welcome,
        scClaimed,
      ] = await Promise.all([
        c.purrToken.balanceOf(address),
        c.catNFT.hasClaimedFamilyPortrait(address),
        c.purrToken.hasClaimedWelcome(address),
        c.catNFT.hasClaimedStarterCat(address),  // 修复：正确调用 CatNFT 合约的函数
      ]);

      setPurrBalanceRaw(purr as bigint);
      setNftClaimed(portraitClaimed as boolean);
      setWelcomeClaimed(welcome as boolean);
      setStarterCatClaimed(scClaimed as boolean);

      // 如果已领初始猫，读取对应的真实猫 ID
      if (scClaimed) {
        const catOf = await c.catNFT.starterCatOf(address);
        setStarterCatId(Number(catOf));
      }

      // 如果已领全家福 NFT，找到对应的 tokenId（用于 claimWelcomeTokens）
      if (portraitClaimed) {
        await findFamilyPortraitTokenId(address, c);
      }
    } catch (err) {
      console.error("加载用户状态失败:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 找到用户持有的全家福 NFT tokenId
  // 策略：从最新 tokenId 往前找，找到第一个该用户持有且 type=3 的 NFT
  const findFamilyPortraitTokenId = async (
    address: string,
    c: ReturnType<typeof getReadonlyContracts>
  ) => {
    try {
      const total = await c.catNFT.totalSupply();
      const totalNum = Number(total);
      // 最多往前找 200 个（测试网 supply 很小，够用）
      const searchLimit = Math.min(totalNum, 200);
      for (let i = totalNum - 1; i >= totalNum - searchLimit; i--) {
        try {
          const owner = await c.catNFT.ownerOf(i);
          if ((owner as string).toLowerCase() !== address.toLowerCase()) continue;
          const info = await c.catNFT.nftInfo(i);
          if (Number((info as { nftType: unknown }).nftType) === 3) {
            setFamilyPortraitTokenId(i);
            return;
          }
        } catch {
          // token 不存在，继续
        }
      }
    } catch (err) {
      console.error("查找全家福 tokenId 失败:", err);
    }
  };

  // ── 连接钱包 ─────────────────────────────────────────────

  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      setError("请先安装 MetaMask 钱包插件，然后刷新页面");
      return;
    }
    try {
      setIsConnecting(true);
      setError(null);
      const { address, signer: s } = await connectMetaMask();
      setWalletAddress(address);
      setSigner(s);
      await loadUserState(address);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "连接钱包失败";
      if (!msg.includes("user rejected")) {
        setError(msg);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setSigner(null);
    setPurrBalanceRaw(0n);
    setNftClaimed(false);
    setFamilyPortraitTokenId(null);
    setWelcomeClaimed(false);
    setStarterCatClaimed(false);
    setStarterCatId(null);
  };

  // ── 刷新余额 ─────────────────────────────────────────────

  const refreshBalance = useCallback(async () => {
    if (!walletAddress) return;
    try {
      const c = getReadonlyContracts();
      const purr = await c.purrToken.balanceOf(walletAddress);
      setPurrBalanceRaw(purr as bigint);
    } catch (err) {
      console.error("刷新余额失败:", err);
    }
  }, [walletAddress]);

  // ── 领取全家福 NFT ────────────────────────────────────────

  const claimFamilyPortrait = async () => {
    if (!signer || !walletAddress) {
      setError("请先连接钱包");
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const c = getContracts(signer);
      const tx = await c.catNFT.claimFamilyPortrait();
      const receipt = await (tx as ethers.ContractTransactionResponse).wait();
      // 从 FamilyPortraitMinted 事件直接拿 tokenId，不依赖后续扫描
      const iface = new ethers.Interface(["event FamilyPortraitMinted(uint256 indexed tokenId, address indexed to, uint8 season)"]);
      let mintedTokenId: number | null = null;
      for (const log of (receipt?.logs ?? [])) {
        try {
          const parsed = iface.parseLog({ topics: [...log.topics], data: log.data });
          if (parsed?.name === "FamilyPortraitMinted") {
            mintedTokenId = Number(parsed.args[0]);
            break;
          }
        } catch { /* 其他事件，跳过 */ }
      }
      if (mintedTokenId !== null) setFamilyPortraitTokenId(mintedTokenId);
      setNftClaimed(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "领取失败";
      if (msg.includes("already claimed")) {
        setError("每个地址只能领取一次全家福 NFT");
      } else if (!msg.includes("user rejected")) {
        setError(`领取全家福 NFT 失败：${msg.slice(0, 80)}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── 一键领取全家福 NFT + 20 PURR ──────────────────────────
  const claimAll = async () => {
    if (!signer || !walletAddress) { setError("请先连接钱包"); return; }
    setIsLoading(true); setError(null);
    try {
      const c = getContracts(signer);

      // Step 1: 领全家福（如未领）
      let tokenId = familyPortraitTokenId;
      if (!nftClaimed) {
        const tx = await c.catNFT.claimFamilyPortrait();
        const receipt = await (tx as ethers.ContractTransactionResponse).wait();
        const iface = new ethers.Interface(["event FamilyPortraitMinted(uint256 indexed tokenId, address indexed to, uint8 season)"]);
        for (const log of (receipt?.logs ?? [])) {
          try {
            const parsed = iface.parseLog({ topics: [...log.topics], data: log.data });
            if (parsed?.name === "FamilyPortraitMinted") {
              tokenId = Number(parsed.args[0]);
              break;
            }
          } catch { /* skip */ }
        }
        if (tokenId !== null) setFamilyPortraitTokenId(tokenId);
        setNftClaimed(true);
      }

      // Step 2: 领代币（如未领，使用刚拿到的 tokenId）
      if (!welcomeClaimed && tokenId !== null) {
        const tx2 = await c.purrToken.claimWelcomeTokens(tokenId);
        await (tx2 as ethers.ContractTransactionResponse).wait();
        setWelcomeClaimed(true);
        await refreshBalance();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "领取失败";
      if (msg.includes("already claimed portrait")) setError("全家福 NFT 已领取过");
      else if (msg.includes("already claimed")) setError("欢迎奖励已领取过");
      else if (!msg.includes("user rejected")) setError(`领取失败：${msg.slice(0, 80)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ── 领取 20 PURR 欢迎奖励 ─────────────────────────────────

  const claimWelcomeTokens = async () => {
    if (!signer || !walletAddress) {
      setError("请先连接钱包");
      return;
    }
    if (familyPortraitTokenId === null) {
      setError("请先领取全家福 NFT");
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const c = getContracts(signer);
      const tx = await c.purrToken.claimWelcomeTokens(familyPortraitTokenId);
      await (tx as ethers.ContractTransactionResponse).wait();
      setWelcomeClaimed(true);
      await refreshBalance();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "领取失败";
      if (msg.includes("already claimed")) {
        setError("欢迎奖励已领取过");
        setWelcomeClaimed(true);
      } else if (!msg.includes("user rejected")) {
        setError(`领取 PURR 失败：${msg.slice(0, 80)}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── 领取免费初始猫 ────────────────────────────────────────

  const claimStarterCat = async (realCatId: number) => {
    if (!signer || !walletAddress) {
      setError("请先连接钱包");
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const c = getContracts(signer);
      const tx = await c.gameContract.claimStarterCat(realCatId);
      await (tx as ethers.ContractTransactionResponse).wait();
      setStarterCatClaimed(true);
      setStarterCatId(realCatId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "领取失败";
      if (msg.includes("already claimed")) {
        setError("已经领取过免费初始猫了");
        setStarterCatClaimed(true);
      } else if (!msg.includes("user rejected")) {
        setError(`领取初始猫失败：${msg.slice(0, 80)}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── 监听账户 / 网络切换 ───────────────────────────────────

  useEffect(() => {
    const unsubAccount = onAccountChange((address) => {
      if (address) {
        setWalletAddress(address);
        loadUserState(address);
      } else {
        disconnectWallet();
      }
    });

    const unsubChain = onChainChange((chainId) => {
      if (chainId !== 43113) {
        setError("请切换到 Avalanche Fuji 测试网（chainId: 43113）");
      } else {
        setError(null);
      }
    });

    return () => {
      unsubAccount();
      unsubChain();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 页面加载时检查是否已连接 ─────────────────────────────

  useEffect(() => {
    const checkExisting = async () => {
      if (!isMetaMaskInstalled()) return;
      try {
        const provider = new ethers.BrowserProvider(window.ethereum!);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const s = await provider.getSigner();
          const address = await s.getAddress();
          setWalletAddress(address);
          setSigner(s);
          await loadUserState(address);
        }
      } catch {
        // 未授权，正常情况
      }
    };
    checkExisting();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────────────────

  return (
    <AppContext.Provider
      value={{
        walletAddress,
        isConnected: !!walletAddress,
        formattedAddress: walletAddress ? formatAddress(walletAddress) : "",
        isConnecting,
        connectWallet,
        disconnectWallet,
        purrBalance: formatPurr(purrBalanceRaw),
        purrBalanceRaw,
        nftClaimed,
        familyPortraitTokenId,
        welcomeClaimed,
        starterCatClaimed,
        starterCatId,
        claimFamilyPortrait,
        claimWelcomeTokens,
        claimAll,
        claimStarterCat,
        refreshBalance,
        error,
        clearError: () => setError(null),
        isLoading,
        signer,
        lang,
        setLang,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
