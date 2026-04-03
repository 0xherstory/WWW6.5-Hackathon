import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';
import { NETWORK_CONFIG } from '../utils/contracts';

/**
 * WalletConnector 组件
 * 处理 MetaMask 钱包连接、网络检测与切换、连接状态显示
 */
export default function WalletConnector({ onWalletConnected }) {
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  // 检查当前网络是否为 Avalanche Fuji
  const checkNetwork = useCallback(async () => {
    if (!window.ethereum) return false;
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return chainId === NETWORK_CONFIG.chainId;
  }, []);

  // 切换到 Avalanche Fuji 测试网
  const switchToFuji = useCallback(async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORK_CONFIG.chainId }],
      });
      return true;
    } catch (switchError) {
      // 网络不存在，尝试添加
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [NETWORK_CONFIG],
          });
          return true;
        } catch {
          setError('无法添加 Avalanche Fuji 网络，请手动添加');
          return false;
        }
      }
      setError('切换网络失败，请手动切换到 Avalanche Fuji 测试网');
      return false;
    }
  }, []);

  // 初始化 provider 并通知父组件
  const initProvider = useCallback(
    async (address) => {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      setAccount(address);
      setIsCorrectNetwork(true);
      setError(null);
      if (onWalletConnected) {
        onWalletConnected({ address, provider, signer });
      }
    },
    [onWalletConnected]
  );

  // 连接钱包主流程
  const connectWallet = useCallback(async () => {
    setError(null);

    if (!window.ethereum) {
      setError('未检测到 MetaMask，请先安装 MetaMask 插件');
      return;
    }

    setIsConnecting(true);
    try {
      // 请求账户授权
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        setError('未获取到账户，请重试');
        return;
      }

      // 检查并切换网络
      const onFuji = await checkNetwork();
      if (!onFuji) {
        const switched = await switchToFuji();
        if (!switched) return;
      }

      await initProvider(accounts[0]);
    } catch (err) {
      if (err.code === 4001) {
        setError('您拒绝了连接请求，请重试');
      } else {
        setError(`连接失败：${err.message || '未知错误'}`);
      }
    } finally {
      setIsConnecting(false);
    }
  }, [checkNetwork, switchToFuji, initProvider]);

  // 断开连接（清除本地状态）
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setIsCorrectNetwork(false);
    if (onWalletConnected) {
      onWalletConnected(null);
    }
  }, [onWalletConnected]);

  // 监听账户和网络变化
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== account) {
        initProvider(accounts[0]);
      }
    };

    const handleChainChanged = async () => {
      const onFuji = await checkNetwork();
      if (!onFuji) {
        setIsCorrectNetwork(false);
        setError('请切换到 Avalanche Fuji 测试网');
        if (onWalletConnected) onWalletConnected(null);
      } else {
        setIsCorrectNetwork(true);
        setError(null);
        if (account) await initProvider(account);
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [account, checkNetwork, disconnectWallet, initProvider, onWalletConnected]);

  // 页面加载时检查是否已连接
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (!window.ethereum) return;
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const onFuji = await checkNetwork();
          if (onFuji) {
            await initProvider(accounts[0]);
          } else {
            setAccount(accounts[0]);
            setIsCorrectNetwork(false);
          }
        }
      } catch {
        // 静默失败，用户尚未连接
      }
    };
    checkExistingConnection();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 格式化地址显示
  const shortAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : null;

  return (
    <div className="wallet-connector">
      {!account ? (
        <button
          className="btn btn-primary"
          onClick={connectWallet}
          disabled={isConnecting}
        >
          {isConnecting ? <><span className="spinner" />连接中...</> : '连接钱包'}
        </button>
      ) : (
        <div className="wallet-info">
          <span className={`network-badge ${isCorrectNetwork ? 'network-ok' : 'network-wrong'}`}>
            {isCorrectNetwork ? '✓ Fuji 测试网' : '⚠ 网络错误'}
          </span>
          <span className="wallet-address" title={account}>
            {shortAddress}
          </span>
          {!isCorrectNetwork && (
            <button className="btn btn-warning btn-sm" onClick={switchToFuji}>
              切换网络
            </button>
          )}
          <button className="btn btn-outline btn-sm" onClick={disconnectWallet}>
            断开
          </button>
        </div>
      )}
      {error && <p className="wallet-error">{error}</p>}
    </div>
  );
}
