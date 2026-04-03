'use client';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const CONTRACT_ADDRESS = '0x88354c1858b6786810f23D4730297fd542d9E7D4';

/** 队友在 Lovable 部署的记忆迷宫（全屏 iframe 嵌入） */
const MEMORY_MAZE_EXTERNAL_URL = 'https://eternal-maze-quest.lovable.app/';
const CONTRACT_ABI = [
  { inputs: [{ internalType: 'string', name: '_content', type: 'string' }], name: 'recordMemory', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [], name: 'getMemoryCount', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
] as const;

type PageName = 'Home' | 'Community' | 'Services' | 'My';
type TabName = 'wish' | 'legacy' | 'maze' | 'funeral';
type WishStatus = 'pending' | 'progress' | 'done';
type Wish = { id: string; status: WishStatus; title: string; desc: string; time: string; match: string; creator: string; creatorAddress: string; isAnon: boolean };
type Countdown = { d: number; h: number; m: number; s: number };
type Confession = { id: string; avatar: string; content: string; bg: string; hearts: number; time: string; creator: string; creatorAddress: string };

export default function EternalGarden() {
  const { isConnected, address } = useAccount();
  const { writeContract } = useWriteContract();
  const { data: count, refetch: refetchCount } = useReadContract({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'getMemoryCount' });

  const [mounted, setMounted] = useState(false);
  const [activePage, setActivePage] = useState<PageName>('Home');
  const [activeTab, setActiveTab] = useState<TabName>('wish');
  const [toast, setToast] = useState({ msg: '', show: false });
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showKeyAnim, setShowKeyAnim] = useState(false);
  const [showWishProgress, setShowWishProgress] = useState(false);
  const [wishProgress, setWishProgress] = useState(0);
  const [showIpfsProgress, setShowIpfsProgress] = useState(false);
  const [ipfsProgress, setIpfsProgress] = useState(0);

  const [willActivated, setWillActivated] = useState(false);
  const [vaultStatus, setVaultStatus] = useState<'guarding' | 'warning' | 'executing'>('guarding');
  const [vaultHeartbeat, setVaultHeartbeat] = useState('上次心跳确认：2026-03-31 20:00');
  const [countdown, setCountdown] = useState<Countdown>({ d: 0, h: 0, m: 0, s: 0 });

  const [wishTitle, setWishTitle] = useState('');
  const [wishDesc, setWishDesc] = useState('');
  const [wishType, setWishType] = useState('');
  const [userNickname, setUserNickname] = useState('花园居民');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nicknameDraft, setNicknameDraft] = useState('花园居民');
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);
  const hydratedRef = useRef(false);

  const [showMemoryMazeEmbed, setShowMemoryMazeEmbed] = useState(false);
  const [showConfessionEditor, setShowConfessionEditor] = useState(false);
  const [confessionInput, setConfessionInput] = useState('');
  const [confessions, setConfessions] = useState<Confession[]>([
    { id: 'c1', avatar: '匿', content: '今天又做了一个关于以前的梦，醒来的时候觉得好遗憾。但想想，能梦到也是一种幸运吧。', bg: '#B8CBB8', hearts: 24, time: '3小时前', creator: '匿名花园居民', creatorAddress: '0xanon01' },
    { id: 'c2', avatar: '安', content: '第一次来这里。不知道怎么开口，但看到大家的分享，觉得自己不那么孤单了。', bg: '#E8D1E8', hearts: 43, time: '5小时前', creator: '安宁', creatorAddress: '0xanon02' },
    { id: 'c3', avatar: '柔', content: '今天阳光很好，护士姐姐帮我把床推到窗边，看了整整一下午的云。', bg: '#D4B896', hearts: 67, time: '昨天', creator: '柔光', creatorAddress: '0xanon03' },
    { id: 'c4', avatar: '光', content: '给女儿录了一段话，希望她知道，妈妈永远为她骄傲。', bg: '#A8C5A8', hearts: 103, time: '昨天', creator: '晓光', creatorAddress: '0xanon04' },
  ]);

  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState<'Crypto' | 'File' | 'Social'>('Crypto');
  const [beneficiaryAddr, setBeneficiaryAddr] = useState('0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db');
  const [willStatus, setWillStatus] = useState('⚪ 未激活');
  const [totalAssets, setTotalAssets] = useState(7);
  const [beneficiaries, setBeneficiaries] = useState<string[]>(['林小雨']);

  const [wishes, setWishes] = useState<Wish[]>([
    { id: '1', status: 'progress', title: '🌅 想再看一次海边的日出', desc: '我已经两年没有出过门了。想在生命的最后，再看一次小时候常去的那片海。', time: '2026-03-28 发布 · 3位天使响应', match: 'matched', creator: '温风', creatorAddress: '0xabc001', isAnon: false },
    { id: '2', status: 'done', title: '🎵 为孩子录一首摇篮曲', desc: '想给未满周岁的女儿留下妈妈的声音，等她长大了可以听到。', time: '2026-03-25 发布 · 已完成', match: 'matched', creator: '晚云', creatorAddress: '0xabc002', isAnon: false },
    { id: '3', status: 'pending', title: '🎨 完成那幅未画完的画', desc: '画了一半的油画，是一片向日葵田。希望有人能帮我把它画完。', time: '2026-03-30 发布', match: '', creator: '匿名花园居民', creatorAddress: '0xabc003', isAnon: true },
    { id: '4', status: 'pending', title: '📞 和老朋友进行一次视频通话', desc: '失联了十几年的大学室友，想在最后的时光里再见她一面。', time: '2026-03-30 发布', match: '', creator: '匿名花园居民', creatorAddress: '0xabc004', isAnon: true },
    { id: '5', status: 'progress', title: '📝 把我的人生经验写成一本小册子', desc: '活了六十多年，想把一些人生感悟留给后来人。', time: '2026-03-27 发布 · 1位天使协助中', match: 'matched', creator: '明川', creatorAddress: '0xabc005', isAnon: false },
  ]);

  const [assets, setAssets] = useState([
    { name: 'BTC冷钱包助记词加密包', type: 'Crypto', hash: 'QmX7b2...a3f1' },
    { name: '家庭影集 (1990-2020)', type: 'File', hash: 'QmR9k4...e7d2' },
    { name: '微信遗言授权包', type: 'Social', hash: 'QmT5n8...c4a9' },
  ]);

  const isAddressValid = useMemo(() => /^0x[a-fA-F0-9]{40}$/.test(beneficiaryAddr.trim()) || /^0x[a-fA-F0-9]{3,6}\.\.\.[a-fA-F0-9]{3,6}$/.test(beneficiaryAddr.trim()), [beneficiaryAddr]);
  const joinedDays = useMemo(() => {
    const start = new Date('2026-03-20T00:00:00');
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);
  }, []);

  const showToast = (msg: string) => {
    setToast({ msg, show: true });
    window.setTimeout(() => setToast({ msg: '', show: false }), 2500);
  };

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
    const container = document.getElementById('petalsContainer');
    if (!container) return;
    container.innerHTML = '';
    const colors = ['rgba(184,203,184,0.2)', 'rgba(232,209,232,0.18)', 'rgba(247,231,206,0.18)', 'rgba(168,197,168,0.15)'];
    for (let i = 0; i < 12; i += 1) {
      const p = document.createElement('div');
      p.className = 'petal';
      const s = Math.random() * 12 + 5;
      p.style.cssText = `width:${s}px;height:${s}px;left:${Math.random() * 100}%;background:${colors[i % 4]};animation-duration:${Math.random() * 16 + 12}s;animation-delay:${Math.random() * 12}s;`;
      container.appendChild(p);
    }
  }, []);

  useEffect(() => {
    if (!showMemoryMazeEmbed) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showMemoryMazeEmbed]);

  useEffect(() => {
    if (!mounted) return;
    try {
      const savedNickname = localStorage.getItem('eg_userNickname');
      const savedEditing = localStorage.getItem('eg_isEditingName');
      const savedWishes = localStorage.getItem('eg_wishes');
      const savedConfessions = localStorage.getItem('eg_confessions');
      const savedWillStatus = localStorage.getItem('eg_willStatus');
      const savedTotalAssets = localStorage.getItem('eg_totalAssets');
      const savedBeneficiaries = localStorage.getItem('eg_beneficiaries');
      queueMicrotask(() => {
        try {
          if (savedNickname) {
            setUserNickname(savedNickname);
            setNicknameDraft(savedNickname);
          }
          if (savedEditing) setIsEditingName(savedEditing === 'true');
          if (savedWishes) setWishes(JSON.parse(savedWishes));
          if (savedConfessions) setConfessions(JSON.parse(savedConfessions));
          if (savedWillStatus) setWillStatus(savedWillStatus);
          if (savedTotalAssets) setTotalAssets(Number(savedTotalAssets));
          if (savedBeneficiaries) setBeneficiaries(JSON.parse(savedBeneficiaries));
          hydratedRef.current = true;
        } catch {}
      });
    } catch {}
  }, [mounted]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    localStorage.setItem('eg_userNickname', userNickname);
    localStorage.setItem('eg_isEditingName', String(isEditingName));
    localStorage.setItem('eg_wishes', JSON.stringify(wishes));
    localStorage.setItem('eg_confessions', JSON.stringify(confessions));
    localStorage.setItem('eg_willStatus', willStatus);
    localStorage.setItem('eg_totalAssets', String(totalAssets));
    localStorage.setItem('eg_beneficiaries', JSON.stringify(beneficiaries));
  }, [userNickname, isEditingName, wishes, confessions, willStatus, totalAssets, beneficiaries]);

  useEffect(() => {
    if (!willActivated) return;
    const timer = window.setInterval(() => {
      setCountdown((prev) => {
        let { d, h, m, s } = prev;
        s -= 1;
        if (s < 0) { s = 59; m -= 1; }
        if (m < 0) { m = 59; h -= 1; }
        if (h < 0) { h = 23; d -= 1; }
        if (d < 0) return { d: 0, h: 0, m: 0, s: 0 };
        return { d, h, m, s };
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [willActivated]);

  const switchPage = (page: PageName) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const publishWish = () => {
    if (!wishTitle.trim()) return showToast('⚠️ 请输入心愿标题');
    showToast('📡 交易发送中...');
    setShowWishProgress(true);
    setWishProgress(0);

    let w = 0;
    const iv = window.setInterval(() => {
      w += Math.random() * 25 + 10;
      if (w >= 95) { w = 95; window.clearInterval(iv); }
      setWishProgress(w);
    }, 300);

    writeContract(
      { address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'recordMemory', args: [`[实名] ${wishTitle}: ${wishDesc}`] },
      {
        onSuccess: () => {
          setWishProgress(100);
          window.setTimeout(() => {
            setShowWishProgress(false);
            setWishProgress(0);
            const newWish: Wish = {
              id: Date.now().toString(),
              status: 'pending',
              title: `✨ ${wishTitle}`,
              desc: wishDesc || '一个温暖的心愿，等待心愿天使的认领...',
              time: '刚刚发布',
              match: '',
              creator: userNickname,
              creatorAddress: address ?? '',
              isAnon: false,
            };
            setWishes((prev) => [newWish, ...prev]);
            setWishTitle('');
            setWishDesc('');
            setWishType('');
            refetchCount();
            showToast('✅ 心愿发布成功，已上链！');
          }, 900);
        },
        onError: () => {
          setShowWishProgress(false);
          setWishProgress(0);
          showToast('❌ 交易取消');
        },
      },
    );
  };

  const handleSendConfession = () => {
    const text = confessionInput.trim();
    if (!text) {
      showToast('⚠️ 请先输入倾诉内容');
      return;
    }
    const newConfession: Confession = {
      id: Date.now().toString(),
      avatar: '匿',
      content: text,
      bg: '#B8CBB8',
      hearts: 0,
      time: '刚刚',
      creator: userNickname,
      creatorAddress: address ?? '',
    };
    setConfessions((prev) => [newConfession, ...prev]);
    setConfessionInput('');
    setShowConfessionEditor(false);
    showToast('💚 你的倾诉已被温柔接住');
  };

  const handleSaveNickname = () => {
    const next = nicknameDraft.trim();
    if (!next) {
      showToast('⚠️ 化名不能为空');
      return;
    }
    setUserNickname(next);
    setIsEditingName(false);
    showToast('✅ 化名已保存');
  };

  const matchAngel = (id: string) => {
    showToast('🤖 AI 正在匹配心愿天使...');
    window.setTimeout(() => {
      setWishes((prev) => prev.map((w) => (w.id === id ? { ...w, status: 'progress', match: 'matched', time: `${w.time} · 温风已响应` } : w)));
      showToast('💚 匹配成功！心愿天使「温风」已响应');
    }, 1500);
  };

  const activateWill = () => {
    showToast('📡 正在签署遗嘱合约 activateWill...');
    window.setTimeout(() => {
      setWillActivated(true);
      setVaultStatus('guarding');
      setVaultHeartbeat('上次心跳确认：刚刚');
      setCountdown({ d: 29, h: 23, m: 59, s: 59 });
      setWillStatus('🟢 遗嘱守护中');
      showToast('✅ 遗嘱已成功激活！生存确认倒计时开始');
    }, 1200);
  };

  const confirmAlive = () => {
    showToast('💚 正在调用 confirmAlive()...');
    window.setTimeout(() => {
      setCountdown({ d: 29, h: 23, m: 59, s: 59 });
      setVaultHeartbeat('上次心跳确认：刚刚');
      showToast('✅ 生存状态已确认，倒计时已重置');
    }, 800);
  };

  const executeLegacy = () => {
    showToast('⚠️ 模拟用户失联 — 正在调用 executeLegacy()...');
    setVaultStatus('executing');
    window.setTimeout(() => {
      setShowKeyAnim(true);
      setCountdown({ d: 0, h: 0, m: 0, s: 0 });
      window.setTimeout(() => {
        setShowKeyAnim(false);
        showToast('🗝️ 遗嘱已执行！资产已按计划转移至受益人。');
      }, 2500);
    }, 1000);
  };

  const uploadToIPFS = () => {
    if (!assetName.trim()) return showToast('⚠️ 请输入资产名称');
    showToast('📤 正在上传至 IPFS...');
    setShowIpfsProgress(true);
    setIpfsProgress(0);
    let w = 0;
    const iv = window.setInterval(() => {
      w += Math.random() * 20 + 8;
      if (w >= 100) { w = 100; window.clearInterval(iv); }
      setIpfsProgress(w);
    }, 350);
    window.setTimeout(() => {
      const hash = `Qm${Math.random().toString(36).slice(2, 8)}...${Math.random().toString(36).slice(2, 6)}`;
      setAssets((prev) => [...prev, { name: assetName, type: assetType, hash }]);
      setTotalAssets((prev) => prev + 1);
      setAssetName('');
      setShowAssetModal(false);
      setShowIpfsProgress(false);
      setIpfsProgress(0);
      showToast('✅ 资产已上传 IPFS 并保存到合约');
    }, 2600);
  };

  if (!mounted) return null;

  const countdownText = willActivated ? `${String(countdown.d).padStart(2, '0')}:${String(countdown.h).padStart(2, '0')}:${String(countdown.m).padStart(2, '0')}:${String(countdown.s).padStart(2, '0')}` : '--:--:--';
  const pendingCount = wishes.filter((w) => w.status === 'pending').length;
  const progressCount = wishes.filter((w) => w.status === 'progress').length;
  const doneCount = wishes.filter((w) => w.status === 'done').length;
  const myPublishedWishCount = wishes.filter((w) => w.creatorAddress === address).length;
  const resolveDisplayName = (creator: string, creatorAddress: string) => (creatorAddress === address ? userNickname : creator);

  return (
    <main className="min-h-screen">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;600;700&family=Noto+Sans+SC:wght@300;400;500;600&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        :root { --bg:#F9F9F9; --primary:#B8CBB8; --primary-dark:#8EAB8E; --secondary:#E8D1E8; --accent:#F7E7CE; --accent-gold:#D4B896; --text:#4A4A4A; --text-light:#8A8A8A; --text-lighter:#B0A8A0; --white:#FFFFFF; --card-bg:rgba(255,255,255,0.72); --card-border:rgba(184,203,184,0.18); --card-shadow:0 4px 20px rgba(0,0,0,0.05); --card-radius:20px; --btn-radius:14px; --glass-border:rgba(255,255,255,0.3); --maze-bg:#1A2F2A; --font-title:'Noto Serif SC',serif; --font-body:'Noto Sans SC',sans-serif; --font-en:'Lora',serif; --transition:all .35s cubic-bezier(.25,.8,.25,1);}
        html { scroll-behavior: smooth; font-size: 16px; }
        body { font-family: var(--font-body); background: var(--bg); color: var(--text); overflow-x: hidden; line-height: 1.75; min-height: 100vh; }
        .petals-container { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
        .petal { position: absolute; border-radius: 50% 0 50% 0; opacity: 0; animation: petal-drift linear infinite; }
        @keyframes petal-drift { 0% { transform:translateY(105vh) rotate(0deg) scale(.8); opacity:0; } 8% { opacity:.35; } 85% { opacity:.25; } 100% { transform:translateY(-8vh) rotate(540deg) scale(1.1); opacity:0; } }
        .bottom-nav { position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%); z-index: 900; display: flex; justify-content: center; align-items: center; gap: .4rem; height: 54px; padding: 0 .6rem; background: rgba(255,255,255,.72); backdrop-filter: blur(24px); border: 1px solid rgba(184,203,184,.15); border-radius: 100px; box-shadow: 0 8px 32px rgba(0,0,0,.08),0 2px 8px rgba(0,0,0,.04); }
        .nav-item { display: flex; align-items: center; gap: .45rem; padding: .5rem 1.2rem; border: none; background: none; cursor: pointer; color: var(--text-light); font-family: var(--font-body); font-size: .78rem; letter-spacing: .03em; transition: var(--transition); border-radius: 100px; white-space: nowrap; }
        .nav-item.active { color: var(--primary-dark); background: rgba(184,203,184,.12); font-weight: 500; }
        .nav-item:hover { color: var(--primary-dark); background: rgba(184,203,184,.08); }
        .nav-separator { width: 1px; height: 20px; background: rgba(184,203,184,.15); flex-shrink: 0; }
        .page { display: none; animation: page-in .45s ease both; }
        .page.active { display: block; }
        @keyframes page-in { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .page-inner { max-width:1200px; margin: 0 auto; padding: 0 3rem; }
        .hero { width:100%; background:linear-gradient(135deg,var(--primary) 0%,#9DB89D 50%,#A8C5A8 100%); border-radius:0 0 32px 32px; padding:6rem 3rem 5rem; text-align:center; position:relative; overflow:hidden; margin-bottom:3.5rem; }
        .hero h1{ font-family:var(--font-title); font-size:clamp(1.6rem,4.5vw,2.4rem); font-weight:600; color:var(--white); margin-bottom:.8rem; line-height:1.5; }
        .hero-en{ font-family:var(--font-en); font-size:.9rem; color:rgba(255,255,255,0.8); font-style:italic; margin-bottom:1.5rem; }
        .hero-desc{ font-size:.85rem; color:rgba(255,255,255,0.75); max-width:500px; margin:0 auto; line-height:1.9; }
        .home-section-title{font-family:var(--font-title);font-size:1.3rem;font-weight:600;text-align:center;margin-bottom:.5rem;}
        .home-section-sub{text-align:center;font-size:.8rem;color:var(--text-light);margin-bottom:2rem;}
        .principles-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.8rem;margin-bottom:2rem;padding:0 1rem;}
        .principle-card{background:var(--card-bg);backdrop-filter:blur(12px);border:1px solid var(--card-border);border-radius:var(--card-radius);padding:2rem 1.6rem;text-align:center;box-shadow:var(--card-shadow);}
        .principle-icon{width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 1.2rem;font-size:1.4rem;}
        .principle-card:nth-child(1) .principle-icon{background:rgba(184,203,184,.15)} .principle-card:nth-child(2) .principle-icon{background:rgba(232,209,232,.15)} .principle-card:nth-child(3) .principle-icon{background:rgba(247,231,206,.2)}
        .home-web3{background:var(--card-bg);backdrop-filter:blur(12px);border:1px solid var(--card-border);border-radius:var(--card-radius);padding:2.5rem 2rem;margin:0 1rem 2rem;box-shadow:var(--card-shadow);}
        .web3-tags{display:flex;flex-wrap:wrap;gap:.6rem;justify-content:center;margin-top:1rem;}
        .web3-tag{padding:.4rem 1rem;border-radius:100px;font-size:.72rem;letter-spacing:.05em;border:1px solid var(--card-border);color:var(--text-light);background:rgba(184,203,184,.06);}
        .p2-header,.p3-header,.my-header{padding:3rem 0 1.5rem;text-align:center;}
        .p2-header h2,.p3-header h2,.my-header h2{font-family:var(--font-title);font-size:1.5rem;font-weight:600;margin-bottom:.4rem;}
        .p2-header p,.p3-header p,.my-header p{font-size:.82rem;color:var(--text-light);}
        .quadrant-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:2rem;padding:0 .5rem;}
        .quadrant-card{position:relative;padding:1.8rem 1.5rem;border-radius:var(--card-radius);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.35);cursor:pointer;color:var(--text);display:flex;flex-direction:column;gap:.4rem;}
        .qc-1{background:linear-gradient(135deg,rgba(197,209,184,.18),rgba(168,197,168,.08));} .qc-2{background:linear-gradient(135deg,rgba(232,209,232,.16),rgba(212,184,212,.06));} .qc-3{background:linear-gradient(135deg,rgba(247,231,206,.18),rgba(232,213,180,.08));} .qc-4{background:linear-gradient(135deg,rgba(212,169,169,.12),rgba(184,203,184,.08));}
        .community-divider{height:1px;background:linear-gradient(90deg,transparent,rgba(184,203,184,.2),transparent);margin:1rem 0 2rem;}
        .community-section{margin-bottom:1rem;padding:1.5rem;border-radius:var(--card-radius);}
        .community-section-title{font-family:var(--font-title);font-size:1.05rem;font-weight:600;margin-bottom:1.2rem;display:flex;align-items:center;gap:.6rem;}
        .community-section-title::before{content:'';width:3px;height:18px;border-radius:2px;background:var(--primary);}
        .confessions{display:flex;flex-direction:column;gap:1rem;} .confession-bubble{display:flex;gap:1rem;max-width:85%;} .confession-bubble:nth-child(even){align-self:flex-end;flex-direction:row-reverse;}
        .confession-avatar{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.75rem;color:#fff;font-weight:600;}
        .confession-content{background:var(--card-bg);backdrop-filter:blur(10px);border:1px solid var(--card-border);border-radius:16px 16px 16px 4px;padding:1rem 1.2rem;box-shadow:var(--card-shadow);font-size:.83rem;line-height:1.8;}
        .confession-bubble:nth-child(even) .confession-content{border-radius:16px 16px 4px 16px;}
        .archive-waterfall{columns:2;column-gap:1rem;} .archive-card{break-inside:avoid;margin-bottom:1rem;background:var(--card-bg);border:1px solid var(--card-border);border-radius:var(--card-radius);overflow:hidden;box-shadow:var(--card-shadow);}
        .archive-info{padding:1rem 1.1rem;} .archive-info h4{font-family:var(--font-title);font-size:.88rem;font-weight:600;} .archive-info p{font-size:.72rem;color:var(--text-light);}
        .companion-list{display:flex;flex-direction:column;gap:.8rem;} .companion-item{display:flex;align-items:center;gap:1rem;background:var(--card-bg);border:1px solid var(--card-border);border-radius:var(--card-radius);padding:1rem 1.3rem;box-shadow:var(--card-shadow);}
        .companion-avatar{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.1rem;}
        .companion-tag{font-size:.65rem;padding:.2rem .6rem;border-radius:100px;background:rgba(184,203,184,.12);color:var(--primary-dark);}
        .btn-contact{padding:.45rem 1rem;border-radius:100px;border:1px solid var(--primary);background:transparent;color:var(--primary-dark);font-size:.72rem;}
        .kanban{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;} .kanban-card{background:var(--card-bg);border:1px solid var(--card-border);border-radius:14px;padding:.8rem 1rem;box-shadow:var(--card-shadow);font-size:.78rem;}
        .tab-bar{display:flex;justify-content:center;gap:.3rem;margin-bottom:2rem;padding:0 1rem;}
        .tab-btn{padding:.6rem 1.4rem;border:none;background:transparent;font-size:.8rem;color:var(--text-light);cursor:pointer;border-radius:100px;}
        .tab-btn.active{background:var(--primary);color:var(--white);}
        .tab-content{display:none;} .tab-content.active{display:block;animation:page-in .4s ease both;}
        .wish-layout{display:grid;grid-template-columns:3fr 7fr;gap:1.5rem;align-items:flex-start;}
        .wish-form,.deck-card,.vault-identity,.vault-assets,.my-card,.my-identity{background:var(--card-bg);backdrop-filter:blur(12px);border:1px solid var(--card-border);border-radius:var(--card-radius);box-shadow:var(--card-shadow);}
        .wish-form{padding:1.8rem 1.5rem;position:sticky;top:1rem;} .form-input,.form-textarea,.form-select{width:100%;padding:.7rem 1rem;border:1px solid rgba(184,203,184,.2);border-radius:12px;background:rgba(255,255,255,.5);font-size:.82rem;outline:none;}
        .upload-zone{border:2px dashed rgba(184,203,184,.3);border-radius:12px;padding:1.2rem;text-align:center;font-size:.75rem;color:var(--text-lighter);}
        .btn-publish{width:100%;padding:.8rem;background:var(--primary);color:#fff;border:none;border-radius:var(--btn-radius);font-size:.88rem;}
        .wish-plaza{columns:2;column-gap:1rem;} .wish-card{break-inside:avoid;margin-bottom:1rem;background:var(--card-bg);border:1px solid var(--card-border);border-radius:var(--card-radius);padding:1.3rem 1.2rem;box-shadow:var(--card-shadow);}
        .wish-status{display:inline-block;padding:.2rem .7rem;border-radius:100px;font-size:.65rem;font-weight:500;margin-bottom:.8rem;}
        .wish-status.pending{background:rgba(180,180,180,.15);color:#999} .wish-status.progress{background:rgba(232,209,232,.2);color:#B08AB0} .wish-status.done{background:rgba(247,231,206,.3);color:var(--accent-gold)}
        .btn-match{padding:.4rem 1rem;border-radius:100px;border:1px solid var(--secondary);background:transparent;color:#B08AB0;font-size:.72rem;} .btn-match.matched{background:var(--secondary);color:#fff;}
        .legacy-layout{display:grid;grid-template-columns:35% 1fr;gap:1.5rem;align-items:flex-start;} .vault{display:flex;flex-direction:column;gap:1rem;position:sticky;top:1rem;}
        .vault-identity{padding:1.8rem 1.2rem;text-align:center;} .vault-status{display:inline-flex;padding:.25rem .8rem;border-radius:100px;font-size:.7rem;font-weight:500;margin-bottom:.6rem;}
        .vault-status.guarding{background:rgba(184,203,184,.15);color:var(--primary-dark)} .vault-status.executing{background:rgba(212,169,169,.15);color:#C08080}
        .vault-assets{padding:1.2rem;} .vault-assets h4{font-family:var(--font-title);font-size:.95rem;font-weight:600;margin-bottom:.25rem;}
        .vault-asset-groups{margin-top:.75rem;display:flex;flex-direction:column;gap:1rem;}
        .vault-asset-cat{font-size:.78rem;color:var(--text-light);margin-bottom:.45rem;font-weight:500;}
        .vault-asset-pill{font-size:.75rem;color:var(--text);background:#F5F7F9;border-radius:10px;padding:.55rem .75rem;margin-bottom:.4rem;line-height:1.5;}
        .vault-asset-pill:last-child{margin-bottom:0;}
        .deck-card{padding:1.5rem;} .deck-card-title{font-family:var(--font-title);font-size:.95rem;font-weight:600;margin-bottom:1rem;display:flex;align-items:flex-start;gap:.5rem;flex-wrap:wrap;}
        .deck-title-wrap{display:inline-flex;flex-wrap:wrap;align-items:baseline;gap:.25rem .35rem;}
        .deck-title-zh{font-weight:600;}
        .deck-title-en{font-weight:400;font-size:.78rem;color:var(--text-light);font-style:italic;}
        .deck-num{width:22px;height:22px;border-radius:50%;background:var(--primary);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:.65rem;flex-shrink:0;margin-top:.1rem;}
        .asset-table{width:100%;border-collapse:separate;border-spacing:0;font-size:.8rem;} .asset-table th,.asset-table td{padding:.7rem .8rem;border-bottom:1px solid rgba(184,203,184,.08);}
        .btn-execute{padding:.9rem 2.5rem;border-radius:var(--btn-radius);border:none;font-size:.95rem;font-weight:600;} .btn-execute.gold{background:linear-gradient(135deg,var(--accent),var(--accent-gold));} .btn-execute.green{background:var(--primary);color:#fff;}
        .countdown-time{font-size:1.8rem;font-weight:600;color:var(--primary-dark);font-family:var(--font-en);}
        .maze-container{background:var(--maze-bg);border-radius:var(--card-radius);min-height:500px;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;overflow:hidden;padding:3rem 2rem;text-align:center;}
        .maze-ring{position:absolute;border:2px solid rgba(184,203,184,.2);border-radius:50%;animation:maze-rotate linear infinite;} .maze-ring.r1{inset:0;animation-duration:20s;} .maze-ring.r2{inset:20px;animation-duration:15s;animation-direction:reverse;border-style:dashed;}
        .maze-ring.r3{inset:40px;animation-duration:12s;border-color:rgba(232,209,232,.2);} .maze-ring.r4{inset:60px;animation-duration:10s;animation-direction:reverse;border-style:dotted;border-color:rgba(247,231,206,.25);}
        @keyframes maze-rotate{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        .funeral-layout{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;} .funeral-col{background:var(--card-bg);border:1px solid var(--card-border);border-radius:var(--card-radius);padding:2rem 1.5rem;box-shadow:var(--card-shadow);}
        .funeral-item{display:flex;gap:.8rem;align-items:flex-start;padding:.8rem;border-radius:14px;background:rgba(184,203,184,.04);}
        .my-identity{display:flex;align-items:center;gap:2rem;padding:2rem 2.5rem;margin-bottom:1.8rem;background:linear-gradient(135deg,rgba(184,203,184,.12),rgba(232,209,232,.08));}
        .my-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:1.8rem;} .my-card{padding:1.5rem 1.6rem;} .my-stat-row{display:flex;justify-content:space-between;align-items:center;padding:.5rem 0;border-bottom:1px solid rgba(184,203,184,.08);}
        .my-stat-badge{padding:.15rem .6rem;border-radius:100px;font-size:.65rem;font-weight:500;} .badge-green{background:rgba(184,203,184,.15);color:var(--primary-dark)} .badge-gold{background:rgba(247,231,206,.25);color:var(--accent-gold)} .badge-pink{background:rgba(232,209,232,.15);color:#B08AB0}
        .my-link-btn{display:inline-flex;align-items:center;gap:.3rem;margin-top:.8rem;padding:.35rem .9rem;border-radius:100px;border:1px solid var(--card-border);background:transparent;font-size:.7rem;color:var(--text-light);}
        .archive-summary{display:flex;gap:1rem;margin-bottom:.8rem;} .archive-stat{flex:1;text-align:center;padding:.6rem;border-radius:12px;background:rgba(184,203,184,.05);}
        .toast{position:fixed;top:1.5rem;left:50%;transform:translateX(-50%) translateY(-20px);z-index:3000;background:#fff;border-radius:14px;padding:.8rem 1.5rem;box-shadow:0 8px 30px rgba(0,0,0,.12);font-size:.82rem;opacity:0;pointer-events:none;transition:all .35s ease;}
        .toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
        .modal-overlay{position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,.35);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .3s;}
        .modal-overlay.show{opacity:1;pointer-events:auto} .modal{width:min(440px,90vw);background:#fff;border-radius:var(--card-radius);padding:2rem;box-shadow:0 20px 60px rgba(0,0,0,.12);}
        .key-anim-overlay{position:fixed;inset:0;z-index:2500;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .4s;}
        .key-anim-overlay.show{opacity:1;pointer-events:auto} .golden-key{font-size:5rem;animation:key-spin 1.5s ease-in-out;}
        @keyframes key-spin{0%{transform:scale(0) rotate(0);opacity:0}50%{transform:scale(1.3) rotate(180deg);opacity:1}100%{transform:scale(1) rotate(360deg);opacity:1}}
        .progress-bar-container{margin-top:.5rem;height:6px;border-radius:3px;background:rgba(184,203,184,.12);overflow:hidden;}
        .progress-bar{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--primary),var(--accent-gold));transition:width .3s ease;}
        .wallet-gate{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:1.5rem;overflow:hidden;background:linear-gradient(165deg,#EEF5EF 0%,#F7F3F0 42%,#EDE8F2 100%);}
        .wallet-gate__aurora{position:absolute;inset:-20%;background:radial-gradient(ellipse 80% 50% at 50% -10%,rgba(184,203,184,.35),transparent 55%),radial-gradient(ellipse 60% 40% at 100% 60%,rgba(232,209,232,.22),transparent 50%),radial-gradient(ellipse 50% 35% at 0% 80%,rgba(247,231,206,.3),transparent 45%);pointer-events:none;}
        .wallet-gate__ring{position:absolute;border-radius:50%;border:1px solid rgba(184,203,184,.12);pointer-events:none;}
        .wallet-gate__ring.r1{width:min(120vw,720px);height:min(120vw,720px);left:50%;top:50%;transform:translate(-50%,-48%);opacity:.6;}
        .wallet-gate__ring.r2{width:min(95vw,560px);height:min(95vw,560px);left:50%;top:50%;transform:translate(-50%,-48%);border-style:dashed;border-color:rgba(142,171,142,.15);opacity:.5;}
        .wallet-gate__card{position:relative;z-index:2;width:min(440px,100%);padding:2.75rem 2.25rem 2.5rem;text-align:center;background:rgba(255,255,255,.78);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.85);border-radius:28px;box-shadow:0 4px 6px rgba(74,90,74,.04),0 24px 48px rgba(74,74,90,.08),inset 0 1px 0 rgba(255,255,255,.9);}
        .wallet-gate__mark{width:56px;height:56px;margin:0 auto 1.25rem;display:flex;align-items:center;justify-content:center;border-radius:18px;background:linear-gradient(145deg,rgba(184,203,184,.28),rgba(168,197,168,.12));font-size:1.65rem;box-shadow:0 8px 24px rgba(107,142,107,.12);}
        .wallet-gate__title{font-family:var(--font-title);font-size:clamp(1.55rem,4.5vw,1.95rem);font-weight:600;color:var(--text);letter-spacing:.06em;line-height:1.35;margin-bottom:.35rem;}
        .wallet-gate__en{font-family:var(--font-en);font-size:.8rem;color:rgba(74,74,74,.55);font-style:italic;margin-bottom:1rem;}
        .wallet-gate__lead{font-size:.84rem;color:var(--text-light);line-height:1.75;max-width:18rem;margin:0 auto 1.75rem;}
        .wallet-gate__cta{display:flex;justify-content:center;margin-bottom:1.35rem;}
        .wallet-gate__cta [data-rk]{width:100%;max-width:280px;}
        .wallet-gate__cta [data-rk] > button{width:100%;justify-content:center;min-height:48px;font-weight:600;letter-spacing:.02em;}
        .wallet-gate__chain{display:inline-flex;align-items:center;gap:.35rem;padding:.28rem .75rem;border-radius:100px;font-size:.65rem;font-weight:500;color:var(--primary-dark);background:rgba(184,203,184,.14);border:1px solid rgba(184,203,184,.25);margin-bottom:1.1rem;}
        .wallet-gate__foot{font-size:.68rem;color:var(--text-lighter);font-family:var(--font-en);font-style:italic;}
        @media(max-width:768px){.page-inner{padding:0 1.5rem}.quadrant-grid{grid-template-columns:1fr}.archive-waterfall{columns:1}.kanban{grid-template-columns:1fr}.wish-layout,.legacy-layout,.funeral-layout,.my-grid{grid-template-columns:1fr}.wish-plaza{columns:1}.vault{position:static}.my-identity{flex-direction:column;text-align:center;gap:1rem}}
      `}</style>

      <div id="petalsContainer" className="petals-container" />

      {!isConnected && (
        <div className="wallet-gate">
          <div className="wallet-gate__aurora" aria-hidden />
          <div className="wallet-gate__ring r1" aria-hidden />
          <div className="wallet-gate__ring r2" aria-hidden />
          <div className="wallet-gate__card">
            <div className="wallet-gate__mark" aria-hidden>✿</div>
            <h1 className="wallet-gate__title">永恒花园</h1>
            <p className="wallet-gate__en">Eternal Garden</p>
            <p className="wallet-gate__lead">连接钱包，进入链上临终关怀与心愿社区。你的密钥，只属于你。</p>
            <div className="wallet-gate__chain">Avalanche Fuji 测试网</div>
            <div className="wallet-gate__cta">
              <ConnectButton showBalance={false} chainStatus="none" />
            </div>
            <p className="wallet-gate__foot">Powered by Web3 · Your keys, your data</p>
          </div>
        </div>
      )}

      {isConnected && (
        <div className="relative z-10 min-h-screen pb-[100px]">
          <div className={`toast ${toast.show ? 'show' : ''}`}>{toast.msg}</div>

          <div className={`page ${activePage === 'Home' ? 'active' : ''}`}>
            <div className="hero">
              <h1>让生命在数字世界<br />温柔延续</h1>
              <p className="hero-en">Where Every Life Blooms Eternally</p>
              <p className="hero-desc">基于 Web3 构建的去中心化临终关怀社区，用区块链守护数据主权，以社区温暖拥抱每一段生命旅程。</p>
            </div>
            <div className="page-inner">
              <h3 className="home-section-title">核心理念</h3>
              <p className="home-section-sub">技术不应冰冷——它可以成为承载爱与尊严的容器</p>
              <div className="principles-grid">
                <div className="principle-card"><div className="principle-icon">🔗</div><h3>去中心化存储</h3><p>利用 IPFS 与 Arweave 去中心化存储网络，您的生命故事、影像资料将被永久、不可篡改地保存。</p></div>
                <div className="principle-card"><div className="principle-icon">🛡️</div><h3>隐私保护</h3><p>基于零知识证明技术，无需透露具体病情即可验证身份。细粒度访问控制保障隐私。</p></div>
                <div className="principle-card"><div className="principle-icon">🤝</div><h3>社区互助</h3><p>通过 DAO 治理和 BLOOM 通证激励，每一次陪伴、每一个心愿实现都被记录。</p></div>
              </div>
              <div className="home-web3">
                <h3 className="home-section-title">Web3 技术赋能</h3>
                <p className="home-section-sub">让技术回归人的尊严 · 链上心愿总量 {count ? count.toString() : '0'}</p>
                <div className="web3-tags">{['Polygon PoS', 'IPFS / Arweave', 'ERC-20 BLOOM', '零知识证明', 'DID 去中心化身份', '智能合约', 'DAO 社区自治'].map((tag) => <span key={tag} className="web3-tag">{tag}</span>)}</div>
              </div>
            </div>
          </div>

          <div className={`page ${activePage === 'Community' ? 'active' : ''}`}>
            <div className="page-inner">
              <div className="p2-header"><h2>互助交友</h2><p>在这里，你不必独自面对 · 每一份倾诉都会被温柔接住</p></div>
              <div className="quadrant-grid">
                <button className="quadrant-card qc-1 text-left" onClick={() => document.getElementById('secConfession')?.scrollIntoView({ behavior: 'smooth' })}><div className="text-2xl">💬</div><div>匿名倾诉圈</div><div className="text-xs text-[#8A8A8A]">安全匿名地分享内心感受，被温柔地接住</div></button>
                <button className="quadrant-card qc-2 text-left" onClick={() => document.getElementById('secArchive')?.scrollIntoView({ behavior: 'smooth' })}><div className="text-2xl">📖</div><div>生命故事档案馆</div><div className="text-xs text-[#8A8A8A]">记录与传承，让生命的故事永不褪色</div></button>
                <button className="quadrant-card qc-3 text-left" onClick={() => document.getElementById('secCompanion')?.scrollIntoView({ behavior: 'smooth' })}><div className="text-2xl">🤝</div><div>陪伴者匹配</div><div className="text-xs text-[#8A8A8A]">找到懂你的生命旅伴，不再独行</div></button>
                <button className="quadrant-card qc-4 text-left" onClick={() => document.getElementById('secKanban')?.scrollIntoView({ behavior: 'smooth' })}><div className="text-2xl">📋</div><div>互助任务板</div><div className="text-xs text-[#8A8A8A]">发布需求或认领任务，善意被看见</div></button>
              </div>
              <div id="secConfession" className="community-section">
                <div className="community-section-title">匿名倾诉圈</div>
                <div className="mb-3 flex items-center gap-2">
                  <button className="btn-contact" onClick={() => setShowConfessionEditor((v) => !v)}>{showConfessionEditor ? '收起输入框' : '我也要倾诉'}</button>
                </div>
                {showConfessionEditor && (
                  <div className="mb-4">
                    <textarea className="form-textarea" value={confessionInput} onChange={(e) => setConfessionInput(e.target.value)} placeholder="把想说的话轻轻放在这里..." />
                    <div className="mt-2 flex justify-end">
                      <button className="btn-publish w-auto px-5" onClick={handleSendConfession}>发送倾诉</button>
                    </div>
                  </div>
                )}
                <div className="confessions">
                  {confessions.map((i) => (
                    <div key={i.id} className="confession-bubble">
                      <div className="confession-avatar" style={{ background: i.bg }}>{i.avatar}</div>
                      <div>
                        <div className="confession-content">{i.content}</div>
                        <div className="text-xs text-[#8A8A8A] mt-1">发布者：{resolveDisplayName(i.creator, i.creatorAddress)}</div>
                        <div className="text-xs text-[#B0A8A0] mt-1">♡ {i.hearts} · {i.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="community-divider" />
              <div id="secArchive" className="community-section"><div className="community-section-title">生命故事档案馆</div><div className="archive-waterfall">{[{ t: '我的抗癌日记', d: '记录了与病魔共处的 500 天', h: 140, b: 'linear-gradient(135deg,#C5D1B8,#A8BFA0)' }, { t: '写给未来的你', d: '一位母亲写给女儿的 20 封信', h: 100, b: 'linear-gradient(135deg,#E8D1E8,#D4B8D4)' }, { t: '1987年的夏天', d: '一段关于青春与故乡的影像', h: 160, b: 'linear-gradient(135deg,#F7E7CE,#E8D5B4)' }, { t: '给世界的最后一首诗', d: '用文字拥抱这个世界', h: 120, b: 'linear-gradient(135deg,#B8CBB8,#D4DBC8)' }].map((a, idx) => <div key={a.t + idx} className="archive-card"><div style={{ height: a.h, background: a.b }} /><div className="archive-info"><h4>{a.t}</h4><p>{a.d}</p><div className="text-xs text-[#B0A8A0]">{idx === 0 ? '🔒 仅家人可见' : '🌐 公开'}</div></div></div>)}</div></div>
              <div className="community-divider" />
              <div id="secCompanion" className="community-section"><div className="community-section-title">陪伴者匹配</div><div className="companion-list">{[{ n: '温风', t: ['倾听', '心理疏导'], r: '志愿者 · 心理咨询师', i: '🌱' }, { n: '静好', t: ['医疗咨询', '营养建议'], r: '志愿者 · 护理师', i: '🦋' }, { n: '晚云', t: ['分享经历', '陪伴聊天'], r: '病友 · 乳腺癌康复者', i: '🌸' }].map((c) => <div key={c.n} className="companion-item"><div className="companion-avatar">{c.i}</div><div className="flex-1"><div className="font-semibold">{c.n}</div><div className="flex gap-1 mt-1">{c.t.map((x) => <span key={x} className="companion-tag">{x}</span>)}</div><div className="text-xs text-[#B0A8A0] mt-1">{c.r}</div></div><button className="btn-contact">联系</button></div>)}</div></div>
              <div className="community-divider" />
              <div id="secKanban" className="community-section"><div className="community-section-title">互助任务板</div><div className="kanban"><div><h4 className="text-sm mb-2">待认领</h4><div className="flex flex-col gap-2"><div className="kanban-card">帮忙代买几本书送到病房<div className="text-xs text-[#8EAB8E]">🌸 +5 BLOOM</div></div></div></div><div><h4 className="text-sm mb-2">进行中</h4><div className="kanban-card">帮忙整理旧照片并扫描<div className="text-xs text-[#8EAB8E]">🌸 +10 BLOOM</div></div></div><div><h4 className="text-sm mb-2">已完成</h4><div className="kanban-card">陪聊了一个下午<div className="text-xs text-[#8EAB8E]">✅ +5 BLOOM</div></div></div></div></div>
            </div>
          </div>

          <div className={`page ${activePage === 'Services' ? 'active' : ''}`}>
            <div className="page-inner">
              <div className="p3-header"><h2>临终关怀服务</h2><p>从心愿实现到数字遗产 · 全方位的温暖陪伴</p></div>
              <div className="tab-bar">{([{ id: 'wish', label: '心愿广场' }, { id: 'legacy', label: '数字遗产' }, { id: 'maze', label: '记忆迷宫' }, { id: 'funeral', label: '临终丧葬' }] as { id: TabName; label: string }[]).map((t) => <button key={t.id} className={`tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>)}</div>

              <div className={`tab-content ${activeTab === 'wish' ? 'active' : ''}`}>
                <div className="wish-layout">
                  <div className="wish-form">
                    <h3>✿ 发布心愿</h3>
                    <div className="mb-3"><label className="text-xs text-[#8A8A8A]">心愿标题</label><input className="form-input" value={wishTitle} onChange={(e) => setWishTitle(e.target.value)} placeholder="例：想再看一次海边的日出" /></div>
                    <div className="mb-3"><label className="text-xs text-[#8A8A8A]">心愿描述</label><textarea className="form-textarea" value={wishDesc} onChange={(e) => setWishDesc(e.target.value)} placeholder="描述你的心愿..." /></div>
                    <div className="mb-3"><label className="text-xs text-[#8A8A8A]">心愿类型</label><select className="form-select" value={wishType} onChange={(e) => setWishType(e.target.value)}><option value="">请选择</option><option value="experience">体验类</option><option value="creation">创作类</option><option value="connection">连接类</option><option value="legacy">传承类</option></select></div>
                    <div className="mb-3"><label className="text-xs text-[#8A8A8A]">发布身份</label><div className="mt-1 text-xs text-[#8A8A8A]">已绑定 DID 地址发布：{address}</div></div>
                    <div className="upload-zone mb-2">📎 点击或拖拽文件到此处</div>
                    {showWishProgress && <div className="progress-bar-container"><div className="progress-bar" style={{ width: `${wishProgress}%` }} /></div>}
                    <button className="btn-publish mt-3" onClick={publishWish}>发布心愿</button>
                  </div>
                  <div className="wish-plaza">{wishes.map((w) => <div key={w.id} className="wish-card cursor-pointer" onClick={() => setSelectedWish(w)}><div className={`wish-status ${w.status}`}>{w.status === 'pending' ? '待认领' : w.status === 'progress' ? '进行中' : '已完成'}</div><h4>{w.title}</h4><p>{w.desc}</p><div className="text-xs text-[#8A8A8A]">发布者：{resolveDisplayName(w.creator, w.creatorAddress)}</div><div className="text-xs text-[#B0A8A0] mb-3">{w.time}</div>{w.match ? <button className="btn-match matched" onClick={(e) => e.stopPropagation()}>✅ 已匹配</button> : <button className="btn-match" onClick={(e) => { e.stopPropagation(); matchAngel(w.id); }}>🤖 AI 匹配</button>}</div>)}</div>
                </div>
              </div>

              <div className={`tab-content ${activeTab === 'legacy' ? 'active' : ''}`}>
                <div className="legacy-layout">
                  <div className="vault">
                    <div className="vault-identity"><div className="text-5xl mb-2">🌿</div><div className="text-lg font-semibold mb-1">花园居民</div><div className={`vault-status ${vaultStatus}`}>{vaultStatus === 'executing' ? '🔴 执行中' : '🟢 守护中'}</div><div className="text-xs text-[#B0A8A0]">{vaultHeartbeat}</div></div>
                    <div className="vault-assets">
                      <h4>📦 我的数字资产</h4>
                      <div className="vault-asset-groups">
                        <div>
                          <div className="vault-asset-cat">💰 金融类</div>
                          <div className="vault-asset-pill">🌚 BTC 冷钱包助记词（加密包）</div>
                          <div className="vault-asset-pill">🏦 网银账户密钥</div>
                        </div>
                        <div>
                          <div className="vault-asset-cat">📁 数据类</div>
                          <div className="vault-asset-pill">☁️ 百度网盘 · 家庭影集</div>
                          <div className="vault-asset-pill">📸 iCloud 照片库</div>
                        </div>
                        <div>
                          <div className="vault-asset-cat">💬 社交类</div>
                          <div className="vault-asset-pill">💚 微信账号遗言设置</div>
                          <div className="vault-asset-pill">🖱️ Twitter 纪念账户</div>
                          <div className="vault-asset-pill">🏛️ VR 纪念馆数据</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="deck-card"><div className="deck-card-title"><span className="deck-num">1</span>资产录入 Asset Registry</div><table className="asset-table"><thead><tr><th>资产名称</th><th>类型</th><th>IPFS Hash</th></tr></thead><tbody>{assets.map((a, idx) => <tr key={a.hash + idx}><td>{a.name}</td><td>{a.type}</td><td>{a.hash}</td></tr>)}</tbody></table><button className="mt-3 px-3 py-2 rounded border border-dashed border-[#B8CBB8] text-xs" onClick={() => setShowAssetModal(true)}>+ 添加资产</button></div>
                    <div className="deck-card"><div className="deck-card-title"><span className="deck-num">2</span>受益人设置 Beneficiary Config</div><input className="form-input mb-2" value={beneficiaryAddr} onChange={(e) => setBeneficiaryAddr(e.target.value)} /><input className="form-input" value={beneficiaries[0] ?? ''} onChange={(e) => setBeneficiaries([e.target.value || '林小雨'])} placeholder="受益人姓名" /><div className={`text-xs mt-2 ${isAddressValid ? 'text-[#8EAB8E]' : 'text-[#C08080]'}`}>{beneficiaryAddr ? (isAddressValid ? '✅ 地址格式有效' : '❌ 地址格式无效') : ''}</div></div>
                    <div className="deck-card">
                      <div className="deck-card-title">
                        <span className="deck-num">3</span>
                        <span className="deck-title-wrap">
                          <span className="deck-title-zh">执行控制</span>
                          <span className="deck-title-en">Execution Control</span>
                        </span>
                      </div>
                      <div className="text-center">
                        {!willActivated ? (
                          <button className="btn-execute gold" onClick={activateWill}>🗝️ 存入遗嘱</button>
                        ) : (
                          <>
                            <button className="btn-execute green" onClick={confirmAlive}>💚 遗嘱已激活 — 刷新生存状态</button>
                            <button className="block mx-auto mt-2 text-xs underline text-[#B0A8A0]" onClick={executeLegacy}>模拟执行（模拟用户失联）</button>
                          </>
                        )}
                        <div className="mt-4"><label className="text-xs text-[#8A8A8A]">托管资产总数</label><input className="form-input mt-1" type="number" min={0} value={totalAssets} onChange={(e) => setTotalAssets(Number(e.target.value) || 0)} /></div>
                        <div className="mt-4 text-xs text-[#8A8A8A]">生存确认倒计时</div>
                        <div className="countdown-time">{countdownText}</div>
                        <div className="text-[11px] text-[#B0A8A0]">天 : 时 : 分 : 秒</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`tab-content ${activeTab === 'maze' ? 'active' : ''}`}>
                <div className="maze-container pb-28">
                  <div className="pointer-events-none absolute left-0 top-0 h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(184,203,184,0.12),transparent_70%)]" />
                  <div className="pointer-events-none relative mb-8 h-[200px] w-[200px]">
                    <div className="maze-ring r1" />
                    <div className="maze-ring r2" />
                    <div className="maze-ring r3" />
                    <div className="maze-ring r4" />
                    <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(247,231,206,0.9),rgba(212,184,150,0.6))]" />
                  </div>
                  <div className="relative z-10 text-white text-2xl mb-2" style={{ fontFamily: 'var(--font-title)' }}>
                    记忆迷宫
                  </div>
                  <div className="relative z-10 mb-8 text-sm text-white/60">通过回答关于人生的问题，解锁属于你的记忆碎片，在迷宫深处构建独一无二的数字永生之魂。</div>
                  <button
                    type="button"
                    className="relative z-20 px-10 py-3 rounded-xl border-2 border-[#D4B896] text-[#F7E7CE] cursor-pointer"
                    onClick={() => setShowMemoryMazeEmbed(true)}
                  >
                    ✦ 进入游戏
                  </button>
                </div>
              </div>

              <div className={`tab-content ${activeTab === 'funeral' ? 'active' : ''}`}>
                <div className="funeral-layout">
                  <div className="funeral-col"><h3 className="text-2xl">🌱 生态葬</h3><p className="text-sm text-[#8A8A8A] italic mb-4">生命源于自然，亦归于自然</p><div className="space-y-3">{[{ i: '🏺', t: '可降解骨灰容器', d: '回归大地，滋养新生。' }, { i: '💎', t: '生命晶石定制', d: '将思念凝为永恒的纪念。' }, { i: '🌳', t: '花坛 / 树葬 / 壁葬', d: '在四季美景中，安然长眠。' }].map((f) => <div key={f.t} className="funeral-item"><div className="w-9 h-9 rounded-xl bg-[rgba(184,203,184,0.12)] flex items-center justify-center">{f.i}</div><div><h5 className="text-sm font-semibold">{f.t}</h5><p className="text-xs text-[#8A8A8A]">{f.d}</p></div></div>)}</div></div>
                  <div className="funeral-col"><h3 className="text-2xl">☁️ 云祭祀</h3><p className="text-sm text-[#8A8A8A] italic mb-4">在虚拟世界中，再现温暖时光</p><div className="space-y-3">{[{ i: '🏛️', t: 'VR 数字纪念馆', d: '创建专属的 3D 纪念空间。' }, { i: '🎬', t: '"人生微电影"定制', d: '将珍贵影像制作成叙事影片。' }, { i: '✨', t: '全息映射悼念空间', d: '实现跨越时空的对话。' }].map((f) => <div key={f.t} className="funeral-item"><div className="w-9 h-9 rounded-xl bg-[rgba(232,209,232,0.12)] flex items-center justify-center">{f.i}</div><div><h5 className="text-sm font-semibold">{f.t}</h5><p className="text-xs text-[#8A8A8A]">{f.d}</p></div></div>)}</div></div>
                </div>
              </div>
            </div>
          </div>

          <div className={`page ${activePage === 'My' ? 'active' : ''}`}>
            <div className="page-inner">
              <div className="my-header"><h2>个人中心</h2><p>你在永恒花园里的一切，都在这里</p></div>
              <div className="my-identity"><div className="w-[72px] h-[72px] rounded-full bg-[linear-gradient(135deg,#B8CBB8,#8EAB8E)] text-white text-3xl flex items-center justify-center">🌿</div><div className="flex-1">{!isEditingName ? <div className="flex items-center gap-3"><div className="text-xl font-semibold" style={{ fontFamily: 'var(--font-title)' }}>{userNickname}</div><button className="my-link-btn mt-0" onClick={() => { setNicknameDraft(userNickname); setIsEditingName(true); }}>编辑化名</button></div> : <div className="flex items-center gap-2"><input className="form-input max-w-[220px]" value={nicknameDraft} onChange={(e) => setNicknameDraft(e.target.value)} /><button className="btn-publish w-auto px-4 py-2" onClick={handleSaveNickname}>保存</button></div>}<div className="text-xs text-[#B0A8A0]" style={{ fontFamily: 'var(--font-en)' }}>DID: {address} · Polygon Mumbai</div><div className="flex gap-4 mt-2 text-xs text-[#8A8A8A]"><span>📅 加入第 <strong>{joinedDays}</strong> 天</span><span>🌸 心愿天使 Lv.2</span><span>{willStatus}</span></div></div><div className="text-right"><div className="text-4xl leading-none" style={{ fontFamily: 'var(--font-en)', background: 'linear-gradient(135deg,var(--primary-dark),var(--accent-gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>276</div><div className="text-xs text-[#B0A8A0]">BLOOM 通证</div></div></div>
              <div className="my-grid">
                <div className="my-card"><div className="text-base mb-2" style={{ fontFamily: 'var(--font-title)' }}>✿ 我的心愿</div><div className="my-stat-row"><span className="text-[#8A8A8A]">我发布的心愿</span><span>{myPublishedWishCount}</span></div><div className="my-stat-row"><span className="text-[#8A8A8A]">待认领</span><span className="my-stat-badge badge-pink">{pendingCount} 个</span></div><div className="my-stat-row"><span className="text-[#8A8A8A]">进行中</span><span className="my-stat-badge badge-green">{progressCount} 个</span></div><div className="my-stat-row"><span className="text-[#8A8A8A]">已完成</span><span className="my-stat-badge badge-gold">{doneCount} 个</span></div><button className="my-link-btn" onClick={() => { switchPage('Services'); setActiveTab('wish'); }}>前往心愿广场 →</button></div>
                <div className="my-card"><div className="text-base mb-2" style={{ fontFamily: 'var(--font-title)' }}>🗝️ 我的数字遗产</div><div className="my-stat-row"><span className="text-[#8A8A8A]">遗嘱状态</span><span className="my-stat-badge badge-green">{willStatus}</span></div><div className="my-stat-row"><span className="text-[#8A8A8A]">托管资产总数</span><span>{totalAssets} 项</span></div><div className="my-stat-row"><span className="text-[#8A8A8A]">受益人</span><span>{beneficiaries.join('、')}</span></div><button className="my-link-btn" onClick={() => { switchPage('Services'); setActiveTab('legacy'); }}>前往遗产管理 →</button></div>
                <div className="my-card"><div className="text-base mb-2" style={{ fontFamily: 'var(--font-title)' }}>🤝 我的社区贡献</div><div className="my-stat-row"><span className="text-[#8A8A8A]">完成互助任务</span><span>6 次</span></div><div className="my-stat-row"><span className="text-[#8A8A8A]">累计获得 BLOOM</span><span className="text-[#8EAB8E]">+186</span></div><div className="my-stat-row"><span className="text-[#8A8A8A]">倾诉圈收到的 ♡</span><span>235</span></div><button className="my-link-btn" onClick={() => switchPage('Community')}>前往互助社区 →</button></div>
                <div className="my-card"><div className="text-base mb-2" style={{ fontFamily: 'var(--font-title)' }}>📖 生命故事档案</div><div className="archive-summary">{[{ n: 4, l: '文字' }, { n: 2, l: '语音' }, { n: 3, l: '影像' }, { n: 9, l: '总计' }].map((a) => <div key={a.l} className="archive-stat"><div className="text-xl" style={{ fontFamily: 'var(--font-en)' }}>{a.n}</div><div className="text-xs text-[#B0A8A0]">{a.l}</div></div>)}</div><button className="my-link-btn" onClick={() => switchPage('Community')}>前往档案馆 →</button></div>
              </div>
            </div>
          </div>

          <nav className="bottom-nav">
            <button className={`nav-item ${activePage === 'Home' ? 'active' : ''}`} onClick={() => switchPage('Home')}><span>🏡</span>首页</button>
            <div className="nav-separator" />
            <button className={`nav-item ${activePage === 'Community' ? 'active' : ''}`} onClick={() => switchPage('Community')}><span>💬</span>互助社区</button>
            <div className="nav-separator" />
            <button className={`nav-item ${activePage === 'Services' ? 'active' : ''}`} onClick={() => switchPage('Services')}><span>✿</span>临终服务</button>
            <div className="nav-separator" />
            <button className={`nav-item ${activePage === 'My' ? 'active' : ''}`} onClick={() => switchPage('My')}><span>👤</span>个人中心</button>
          </nav>
        </div>
      )}

      {typeof window !== 'undefined' &&
        showMemoryMazeEmbed &&
        createPortal(
          <div
            className="fixed inset-0 flex flex-col bg-[#F9F9F9]"
            style={{ zIndex: 10000 }}
            role="dialog"
            aria-modal="true"
            aria-label="记忆迷宫"
          >
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#E8E4E0] bg-white/95 px-3 py-2.5 shadow-sm backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setShowMemoryMazeEmbed(false)}
                className="rounded-full border border-[#D4D4D4] bg-white px-3 py-2 text-xs text-[#555] transition-colors hover:bg-[#F5F5F5]"
              >
                ← 返回永恒花园
              </button>
              <p className="hidden flex-1 text-center text-xs text-[#B0A8A0] sm:block">记忆迷宫 · 嵌入模式</p>
              <button
                type="button"
                onClick={() => window.open(MEMORY_MAZE_EXTERNAL_URL, '_blank', 'noopener,noreferrer')}
                className="shrink-0 text-xs text-[#8EAB8E] underline underline-offset-2 hover:text-[#6B8F6B]"
              >
                新标签页打开
              </button>
            </div>
            <iframe
              src={MEMORY_MAZE_EXTERNAL_URL}
              title="记忆迷宫"
              className="min-h-0 w-full flex-1 border-0"
              allow="fullscreen; autoplay; clipboard-read; clipboard-write"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <p className="shrink-0 border-t border-[#EEE] bg-white/90 px-3 py-2 text-center text-[10px] leading-snug text-[#B0A8A0]">
              若此处长期空白，可能是对方站点禁止被嵌入（安全策略）。请点「新标签页打开」或让队友在部署端允许 iframe 嵌入。
            </p>
          </div>,
          document.body,
        )}

      <div className={`modal-overlay ${showAssetModal ? 'show' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setShowAssetModal(false); }}>
        <div className="modal">
          <h3 style={{ fontFamily: 'var(--font-title)' }}>添加数字资产</h3>
          <div className="mb-3"><label className="text-xs text-[#8A8A8A]">资产名称</label><input className="form-input" value={assetName} onChange={(e) => setAssetName(e.target.value)} placeholder="例：家庭影像集" /></div>
          <div className="mb-3"><label className="text-xs text-[#8A8A8A]">资产类型</label><select className="form-select" value={assetType} onChange={(e) => setAssetType(e.target.value as 'Crypto' | 'File' | 'Social')}><option value="Crypto">Crypto</option><option value="File">File</option><option value="Social">Social</option></select></div>
          <div className="upload-zone">📎 选择文件上传</div>
          {showIpfsProgress && <div className="progress-bar-container"><div className="progress-bar" style={{ width: `${ipfsProgress}%` }} /></div>}
          <div className="flex justify-end gap-2 mt-5"><button className="px-4 py-2 rounded bg-[#f2f2f2] text-sm" onClick={() => setShowAssetModal(false)}>取消</button><button className="px-4 py-2 rounded bg-[#B8CBB8] text-white text-sm" onClick={uploadToIPFS}>上传 IPFS</button></div>
        </div>
      </div>

      {selectedWish && (
        <div className="modal-overlay show" onClick={() => setSelectedWish(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-title)' }}>{selectedWish.title}</h3>
            <p className="text-sm text-[#8A8A8A] mt-2">{selectedWish.desc}</p>
            <div className="mt-4 text-xs text-[#B0A8A0]">发布者</div>
            <div className="mt-1 text-sm">{selectedWish.isAnon ? '匿名花园居民' : resolveDisplayName(selectedWish.creator, selectedWish.creatorAddress)}</div>
            <div className="flex justify-end gap-2 mt-5">
              <button className="px-4 py-2 rounded bg-[#f2f2f2] text-sm" onClick={() => setSelectedWish(null)}>关闭</button>
            </div>
          </div>
        </div>
      )}

      <div className={`key-anim-overlay ${showKeyAnim ? 'show' : ''}`}><div className="text-center"><div className="golden-key">🗝️</div><div className="mt-4 text-[#F7E7CE] text-xl" style={{ fontFamily: 'var(--font-title)' }}>遗嘱已成功激活</div></div></div>
    </main>
  );
}