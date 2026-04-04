import Landing from './Landing'; 
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import Globe from 'react-globe.gl';
import { ethers } from 'ethers';
import jsPDF from 'jspdf';

// ================= 1. Web3 真实合约配置 =================
const MEMO_MUSEUM_ADDRESS = "0xd1bb69A4A04b6F677583460E545885173C672fF3"; 
const MTK_TOKEN_ADDRESS = "0x874A76fAD3EF2B9fa7280c2F3d2C3CfAAE88BEeE";

const MEMO_ABI = [{"inputs":[{"internalType":"string","name":"_category","type":"string"},{"internalType":"string","name":"_content","type":"string"},{"internalType":"int256","name":"_lat","type":"int256"},{"internalType":"int256","name":"_lng","type":"int256"},{"internalType":"string","name":"_color","type":"string"}],"name":"addPublicMemorial","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_content","type":"string"},{"internalType":"bool","name":"_isChallenge","type":"bool"},{"internalType":"uint256","name":"_stakeAmount","type":"uint256"},{"internalType":"uint256","name":"_days","type":"uint256"},{"internalType":"uint8","name":"_charityType","type":"uint8"}],"name":"addToMuseum","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"},{"internalType":"uint256","name":"_index","type":"uint256"}],"name":"finalizeChallenge","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"injectEnergy","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_index","type":"uint256"},{"internalType":"string","name":"_proof","type":"string"}],"name":"startChallengeReview","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"},{"internalType":"uint256","name":"_index","type":"uint256"},{"internalType":"bool","name":"_approve","type":"bool"}],"name":"vote","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"getMemoryCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAllPublicMemorials","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"creator","type":"address"},{"internalType":"string","name":"category","type":"string"},{"internalType":"string","name":"content","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"uint256","name":"energy","type":"uint256"},{"internalType":"int256","name":"lat","type":"int256"},{"internalType":"int256","name":"lng","type":"int256"},{"internalType":"string","name":"color","type":"string"}],"internalType":"struct MemoMuseum.PublicMemorial[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"userMemories","outputs":[{"internalType":"string","name":"content","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"bool","name":"isChallenge","type":"bool"},{"internalType":"bool","name":"isCompleted","type":"bool"},{"internalType":"uint256","name":"stakeAmount","type":"uint256"},{"internalType":"uint256","name":"duration","type":"uint256"},{"internalType":"uint8","name":"charityType","type":"uint8"},{"internalType":"string","name":"proof","type":"string"},{"internalType":"bool","name":"isPending","type":"bool"},{"internalType":"uint256","name":"reviewEndTime","type":"uint256"},{"internalType":"uint256","name":"votesForSuccess","type":"uint256"},{"internalType":"uint256","name":"votesForFailure","type":"uint256"}],"stateMutability":"view","type":"function"}];
const MTK_ABI = ["function approve(address spender, uint256 value) public returns (bool)", "function balanceOf(address account) public view returns (uint256)", "function allowance(address owner, address spender) public view returns (uint256)"];

const glowMap = { teal: "border-teal-500/50 bg-teal-500/10", pink: "border-pink-500/50 bg-pink-500/10", purple: "border-purple-500/50 bg-purple-500/10", amber: "border-amber-500/50 bg-amber-500/10" };
const textMap = { teal: "text-teal-500", pink: "text-pink-500", purple: "text-purple-500", amber: "text-amber-500" };

export default function App() {
  const [init, setInit] = useState(false);
  const [showLanding, setShowLanding] = useState(true); // 默认打开先显示 Landing
  const [theme, setTheme] = useState('dark'); 
  const [currentSpace, setCurrentSpace] = useState('personal'); 
  const [personalView, setPersonalView] = useState('timeline');
  const globeRef = useRef();

  // === 基础表单状态 ===
  const [text, setText] = useState('');
  const [image, setImage] = useState(null); 
  const [isHighlight, setIsHighlight] = useState(false); 
  const [isChallenge, setIsChallenge] = useState(false);
  const [stakeAmount, setStakeAmount] = useState("");
  const [days, setDays] = useState("7");
  const [safetyNet, setSafetyNet] = useState("pool");
  const [rewardMsg, setRewardMsg] = useState(null);

  // === 播放特展与双面导出 ===
  const [selectedForCuration, setSelectedForCuration] = useState([]);
  const [showExhibition, setShowExhibition] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showExport, setShowExport] = useState(false);
  const [exportStyle, setExportStyle] = useState('scrapbook'); 
  const [scrapbookFilter, setScrapbookFilter] = useState('all');

  // === Web3 核心数据 ===
  const [allMemories, setAllMemories] = useState([]);
  const [publicStars, setPublicStars] = useState([]);
  const [tokens, setTokens] = useState(0);
  const [account, setAccount] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 情感化粒子反馈
  const [particleType, setParticleType] = useState("default");

  // === 见证广场与公共交互 ===
  const [showMyPublicHistory, setShowMyPublicHistory] = useState(false);
  const [showWitnessPlaza, setShowWitnessPlaza] = useState(false);
  const [witnessSearchTarget, setWitnessSearchTarget] = useState(''); 
  const [witnessMemories, setWitnessMemories] = useState([]); 
  
  const [customTag, setCustomTag] = useState('');
  const [commentText, setCommentText] = useState(''); 
  const [resonanceMatches, setResonanceMatches] = useState([]);
  const [currentResonanceIndex, setCurrentResonanceIndex] = useState(0);
  const [showResonanceModal, setShowResonanceModal] = useState(false);
  const [selectedPublicStar, setSelectedPublicStar] = useState(null);
  
  // 自证模态框
  const [showProofModal, setShowProofModal] = useState(null);
  const [proofText, setProofText] = useState("");

  const showToast = (msg, type = "default") => { 
    setRewardMsg(msg); setParticleType(type);
    setTimeout(() => { setRewardMsg(null); setParticleType("default"); }, 3500); 
  };

  // ================= Web3 数据读取 =================
  const fetchChainData = useCallback(async (userAddr) => {
    if (!window.ethereum || !userAddr) return;
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const memoContract = new ethers.Contract(MEMO_MUSEUM_ADDRESS, MEMO_ABI, provider);
        const mtkContract = new ethers.Contract(MTK_TOKEN_ADDRESS, MTK_ABI, provider);

        const balance = await mtkContract.balanceOf(userAddr);
        setTokens(Math.floor(Number(ethers.formatUnits(balance, 18))));

        const count = await memoContract.getMemoryCount(userAddr);
        let tempStars = [];
        for (let i = 0; i < Number(count); i++) {
            const res = await memoContract.userMemories(userAddr, i);
            const { color, ambient, lat, lng } = analyzeMemory(res.content, i);
            const glowTypes = ['teal', 'pink', 'purple', 'amber'];
            const isMemHighlight = res.content.includes("✨ [高光]");
            
            tempStars.push({
                id: Number(res.timestamp) * 1000 + i,
                index: i,
                content: res.content.replace("✨ [高光] ", ""),
                isHighlight: isMemHighlight, isChallenge: res.isChallenge, isCompleted: res.isCompleted,
                stakeAmount: ethers.formatUnits(res.stakeAmount, 18),
                duration: Number(res.duration), charityType: res.charityType,
                safetyNet: res.charityType === 2 ? 'pool' : 'animals',
                timestamp: Number(res.timestamp),
                proof: res.proof, isPending: res.isPending,
                reviewEndTime: Number(res.reviewEndTime),
                votesForSuccess: Number(res.votesForSuccess), votesForFailure: Number(res.votesForFailure),
                color, ambient, lat, lng,
                glow: glowTypes[i % glowTypes.length]
            });
        }
        setAllMemories([...tempStars].reverse()); 

        const allPubs = await memoContract.getAllPublicMemorials();
        const formattedPubs = allPubs.map(p => ({
            id: Number(p.id), wallet: p.creator, category: p.category, content: p.content,
            title: p.content?.substring(0, 15) + '...', energy: Number(p.energy),
            lat: Number(p.lat), lng: Number(p.lng), color: p.color, timestamp: Number(p.timestamp) * 1000,
            messages: [], legacy: []
        }));
        setPublicStars(formattedPubs);
    } catch (err) { console.error("同步失败:", err); }
  }, []);

  useEffect(() => {
    if (!account) return;
    const interval = setInterval(() => fetchChainData(account), 20000);
    return () => clearInterval(interval);
  }, [account, fetchChainData]);

  const connectWallet = async () => {
    if (!window.ethereum) return showToast("🦊 请安装 MetaMask");
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0]); setWalletConnected(true); fetchChainData(accounts[0]);
  };

  // ================= 业务交互逻辑 =================
  const analyzeMemory = (str, index) => {
    const hash = (str || "IMG").split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0);
    const colors = ['#3b82f6', '#ec4899', '#a855f7', '#10b981', '#f59e0b'];
    return { color: colors[Math.abs(hash) % colors.length], ambient: { name: '🌌 宇宙' }, lat: Math.sin(index * 0.5) * 60, lng: Math.cos(index * 0.5) * 180 };
  };

  const executeSaveToChain = async () => {
    if (!text && !image) return showToast("⚠️ 请输入内容或附加图片");
    if (!account) return showToast("🦊 请先连接钱包");
    setIsProcessing(true);
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const memoContract = new ethers.Contract(MEMO_MUSEUM_ADDRESS, MEMO_ABI, signer);
        const mtkContract = new ethers.Contract(MTK_TOKEN_ADDRESS, MTK_ABI, signer);
        
        let finalContent = text;
        if (isHighlight) finalContent = "✨ [高光] " + finalContent;

        const amountInWei = isChallenge && stakeAmount ? ethers.parseUnits(stakeAmount, 18) : 0n;
        if (isChallenge && amountInWei > 0n) {
            const allowance = await mtkContract.allowance(account, MEMO_MUSEUM_ADDRESS);
            if (allowance < amountInWei) {
                showToast("⏳ 首次需要进行 MTK 授权...");
                const txA = await mtkContract.approve(MEMO_MUSEUM_ADDRESS, ethers.MaxUint256);
                await txA.wait();
            }
        }
        const tx = await memoContract.addToMuseum(finalContent, isChallenge, amountInWei, parseInt(days), safetyNet === "pool" ? 2 : 1);
        await tx.wait();
        showToast(isChallenge ? "🎯 军团契约已刻印" : "✨ 记忆已永存", "gold");
        setText(""); setImage(null); setIsHighlight(false); setIsChallenge(false); setStakeAmount("");
        fetchChainData(account);
    } catch (err) { showToast("❌ 交易取消"); } finally { setIsProcessing(false); }
  };

  const executePublicSaveToChain = async () => {
    if (!text) return showToast("⚠️ 请写下思念");
    if (!account) return showToast("🦊 请连接钱包");
    setIsProcessing(true);
    try {
        const signer = await (new ethers.BrowserProvider(window.ethereum)).getSigner();
        const memoContract = new ethers.Contract(MEMO_MUSEUM_ADDRESS, MEMO_ABI, signer);
        const finalTag = customTag.trim() || '新立纪念碑';
        const { color, lat, lng } = analyzeMemory(text, publicStars.length);
        const tx = await memoContract.addPublicMemorial(finalTag, text, lat, lng, color);
        await tx.wait();
        showToast("✨ 星光已发射至宇宙", "gold");
        setText(''); setCustomTag(''); fetchChainData(account);
    } catch (err) { showToast("❌ 发射失败"); } finally { setIsProcessing(false); }
  };

  const submitProof = async () => {
    if (!proofText || showProofModal === null) return;
    setIsProcessing(true);
    try {
        const signer = await (new ethers.BrowserProvider(window.ethereum)).getSigner();
        const contract = new ethers.Contract(MEMO_MUSEUM_ADDRESS, MEMO_ABI, signer);
        const tx = await contract.startChallengeReview(showProofModal, proofText);
        await tx.wait();
        showToast("📡 证明已进入 3 天公示期");
        setShowProofModal(null); setProofText(""); fetchChainData(account);
    } catch (err) { showToast("❌ 提交失败：请确保倒计时已结束"); } finally { setIsProcessing(false); }
  };

  const searchWitnessTarget = async () => {
    if (!ethers.isAddress(witnessSearchTarget)) return showToast("⚠️ 钱包地址格式不正确");
    setIsProcessing(true);
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const memoContract = new ethers.Contract(MEMO_MUSEUM_ADDRESS, MEMO_ABI, provider);
        const count = await memoContract.getMemoryCount(witnessSearchTarget);
        let tempMems = [];
        for (let i = 0; i < Number(count); i++) {
            const res = await memoContract.userMemories(witnessSearchTarget, i);
            if (res.isPending) {
                tempMems.push({ index: i, content: res.content, proof: res.proof, reviewEndTime: Number(res.reviewEndTime) });
            }
        }
        setWitnessMemories(tempMems);
        if (tempMems.length === 0) showToast("🔭 该地址目前没有需要见证的挑战");
        else showToast(`📡 成功探测到 ${tempMems.length} 个公示中挑战`, "green_sparkle");
    } catch(err) { showToast("❌ 探测失败"); } finally { setIsProcessing(false); }
  };

  const handleVote = async (targetAddr, idx, support) => {
    try {
        const signer = await (new ethers.BrowserProvider(window.ethereum)).getSigner();
        const contract = new ethers.Contract(MEMO_MUSEUM_ADDRESS, MEMO_ABI, signer);
        const tx = await contract.vote(targetAddr, idx, support);
        await tx.wait();
        showToast(support ? "✅ 见证成功" : "❌ 提出质疑", support ? "green_sparkle" : "gray_smoke");
        searchWitnessTarget(); 
    } catch (err) { showToast("❌ 投票失败：你已投过票或公示期已满", "gray_smoke"); }
  };

  const finalize = async (idx, isExpectedFailure = false) => {
    setIsProcessing(true);
    try {
        const signer = await (new ethers.BrowserProvider(window.ethereum)).getSigner();
        const contract = new ethers.Contract(MEMO_MUSEUM_ADDRESS, MEMO_ABI, signer);
        const tx = await contract.finalizeChallenge(account, idx);
        await tx.wait();
        if (isExpectedFailure) showToast("☄️ 契约碎裂，化作流星流向救助池", "blue_meteor");
        else showToast("✨ 契约达成，质押金已归位", "gold");
        fetchChainData(account);
    } catch (err) { showToast("❌ 结算失败：公示期未满"); } finally { setIsProcessing(false); }
  };

  const executeInjectEnergy = async (starId) => {
    setIsProcessing(true);
    try {
        const signer = await (new ethers.BrowserProvider(window.ethereum)).getSigner();
        const tx = await (new ethers.Contract(MEMO_MUSEUM_ADDRESS, MEMO_ABI, signer)).injectEnergy(starId);
        await tx.wait();
        showToast("✨ 注入缅怀能量成功 (-1 MTK)", "gold");
        fetchChainData(account);
    } catch (err) { showToast("❌ 注入失败"); } finally { setIsProcessing(false); }
  };

  const submitComment = (targetStar) => {
    if (!commentText || !targetStar) return;
    setPublicStars(stars => stars.map(s => s.id === targetStar.id ? { ...s, messages: [...(s.messages || []), commentText] } : s));
    setCommentText(''); showToast("💬 留言已化作回响铭刻");
  };

  const triggerResonanceWave = () => {
    if (!account) return showToast("🦊 请先连接钱包");
    const myCategories = publicStars.filter(s => s.wallet?.toLowerCase() === account?.toLowerCase()).map(m => m.category);
    if (myCategories.length === 0) return showToast("📡 星轨空空如也，先留下一道星光吧。");
    
    const othersStars = publicStars.filter(s => s.wallet?.toLowerCase() !== account?.toLowerCase());
    let matches = othersStars.filter(s => myCategories.includes(s.category));
    if (matches.length === 0) matches = othersStars; 

    if (matches.length > 0) {
      setResonanceMatches(matches); setCurrentResonanceIndex(0); setShowResonanceModal(true);
      showToast(`📡 在宇宙中匹配到 ${matches.length} 座同频段纪念碑。`);
    } else showToast("📡 暂未找到共鸣...");
  };

  const executeExportPDF = () => {
    if (allMemories.length === 0) return showToast("⚠️ 暂无记录");
    showToast("📝 正在生成跨维度手工书...");
    const doc = new jsPDF();
    doc.setFontSize(22); doc.text("MEMO_MUSEUM - My Cyber Trail", 20, 20);
    doc.setFontSize(10); doc.text(`Wallet: ${account}`, 20, 30);
    let y = 45;
    const filtered = allMemories.filter(m => scrapbookFilter === 'all' || (scrapbookFilter === 'challenge' && m.isChallenge) || (scrapbookFilter === 'highlight' && m.isHighlight));
    filtered.forEach((m, i) => {
        if (y > 270) { doc.addPage(); y = 20; }
        const badge = m.isChallenge ? `[Challenge - ${m.stakeAmount} MTK]` : (m.isHighlight ? '[Highlight]' : '');
        doc.setFontSize(10); doc.setTextColor(150); doc.text(`${i+1}. ${new Date(m.timestamp*1000).toLocaleString()} ${badge}`, 20, y);
        doc.setFontSize(12); doc.setTextColor(0);
        const lines = doc.splitTextToSize(m.content, 170);
        doc.text(lines, 20, y + 6);
        y += 15 + (lines.length * 5);
    });
    doc.save(`MemoMuseum_${account.substring(0,6)}.pdf`);
  };

  // ================= 状态机与特效配置 =================
  const challengeStatus = (m) => {
    const now = Math.floor(Date.now() / 1000);
    if (m.isCompleted) return "FINISHED";
    if (m.isPending) return now > m.reviewEndTime ? "READY_TO_CLAIM" : "ON_REVIEW";
    if (now > (m.timestamp + m.duration)) return "NEED_PROOF";
    return "COUNTING";
  };

  const getParticleOptions = () => {
    const baseColor = theme === 'light' ? (currentSpace === 'public' ? ['#3b82f6', '#ec4899', '#10b981'] : '#94a3b8') : '#ffffff';
    switch (particleType) {
        case 'gold': return { particles: { color: { value: "#fbbf24" }, shape: { type: "star" }, number: { value: 120 }, move: { enable: true, speed: 12, outModes: "out" }, size: { value: { min: 2, max: 7 } }, opacity: { value: 0.8 } } };
        case 'blue_meteor': return { particles: { color: { value: "#3b82f6" }, shape: { type: "circle" }, number: { value: 50 }, move: { enable: true, speed: 30, direction: "bottom-left", straight: true }, size: { value: { min: 2, max: 10 } }, opacity: { value: 0.9 } } };
        case 'green_sparkle': return { particles: { color: { value: "#10b981" }, number: { value: 80 }, move: { enable: true, speed: 4, direction: "top" }, size: { value: 4 }, opacity: { value: 0.8 } } };
        case 'gray_smoke': return { particles: { color: { value: "#9ca3af" }, number: { value: 60 }, move: { enable: true, speed: 2, direction: "top-right" }, size: { value: 15 }, opacity: { value: 0.2 } } };
        default: return { particles: { color: { value: baseColor }, number: { value: 50 }, move: { enable: true, speed: 0.2 }, size: { value: 1.5 }, opacity: { value: 0.4 } } };
    }
  };

  const toggleCuration = (id) => setSelectedForCuration(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const startExhibition = () => { if (selectedForCuration.length > 0) { setCurrentSlideIndex(0); setShowExhibition(true); } };
  
  const arcData = useMemo(() => {
    const arcs = [];
    if (allMemories.length > 1) {
      for (let i = 0; i < allMemories.length - 1; i++) {
        arcs.push({ startLat: allMemories[i].lat, startLng: allMemories[i].lng, endLat: allMemories[i+1].lat, endLng: allMemories[i+1].lng, color: [allMemories[i].color, allMemories[i+1].color] });
      }
    }
    return arcs;
  }, [allMemories]);

  useEffect(() => { initParticlesEngine(async (engine) => await loadSlim(engine)).then(() => setInit(true)); }, []);
  
  useEffect(() => {
    let timer;
    if (showExhibition && selectedForCuration.length > 0) {
      timer = setTimeout(() => {
        if (currentSlideIndex < selectedForCuration.length - 1) setCurrentSlideIndex(prev => prev + 1);
        else setShowExhibition(false);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [showExhibition, currentSlideIndex, selectedForCuration.length]);

  const isLight = theme === 'light';
  const isPublic = currentSpace === 'public';

  // ================= 🎨 UI 终极渲染 =================
  if (showLanding) {
    return <Landing onEnterApp={() => setShowLanding(false)} />;
  }
  
  return (
    <div className={`h-screen w-screen overflow-hidden flex flex-col font-sans transition-all duration-700 ${isLight ? 'bg-[#fdfbf7] text-slate-800' : 'bg-[#020617] text-slate-100'}`}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;700;900&display=swap'); body { font-family: 'Quicksand', sans-serif; } .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px;} .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(150,150,150,0.3); border-radius: 10px; } @keyframes marquee { 0% { transform: translateX(100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateX(-100%); opacity: 0; } } .animate-marquee { animation: marquee linear infinite; }`}</style>

      {init && (
        <div className={`absolute inset-0 pointer-events-none ${particleType === 'default' ? 'z-0' : 'z-[9999]'}`}>
          <Particles key={particleType + currentSpace + theme} options={{ fullScreen: { enable: false }, ...getParticleOptions() }} className="w-full h-full" />
        </div>
      )}

      {rewardMsg && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[9999] px-8 py-3 rounded-full font-black text-sm shadow-[0_10px_40px_rgba(0,0,0,0.5)] tracking-widest animate-bounce bg-slate-800 text-white border border-white/10">
          {rewardMsg}
        </div>
      )}

      {/* === 导航 === */}
      <nav className={`relative z-30 flex justify-between items-center p-4 lg:px-8 border-b backdrop-blur-md shrink-0 ${isLight ? 'bg-white/80 border-slate-200 shadow-sm' : 'bg-black/60 border-white/10'}`}>
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-black tracking-widest uppercase">MEMO_MUSEUM</h1>
          <div className="flex rounded-xl p-1 gap-1 border bg-slate-500/10 border-slate-500/20">
            <button onClick={() => setCurrentSpace('personal')} className={`px-5 py-1.5 text-sm font-bold rounded-lg transition-all ${!isPublic ? 'bg-white shadow text-black' : 'text-slate-500'}`}>私人纪事本</button>
            <button onClick={() => setCurrentSpace('public')} className={`px-5 py-1.5 text-sm font-bold rounded-lg transition-all ${isPublic ? 'bg-white shadow text-black' : 'text-slate-500'}`}>公共纪念馆</button>
          </div>
          <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} className="p-2 rounded-full bg-slate-500/10 hover:bg-slate-500/20 text-lg transition-colors">{isLight ? '☀️' : '🌙'}</button>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-black text-emerald-500">{tokens} MTK</span>
          {isPublic ? (
            <button onClick={() => setShowMyPublicHistory(true)} className={`px-5 py-2 text-sm font-bold rounded-xl border ${isLight ? 'bg-white text-slate-700 border-slate-200' : 'bg-white/10 text-white border-white/20'}`}>我的星轨</button>
          ) : (
            <button onClick={() => setShowExport(true)} className={`px-5 py-2 text-sm font-bold rounded-xl border ${isLight ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-indigo-500/20 text-indigo-400'}`}>生成手工书</button>
          )}
          <button onClick={connectWallet} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-sm shadow-lg hover:bg-indigo-500 transition-colors">
            {account ? `${account.substring(0,6)}...` : 'CONNECT'}
          </button>
        </div>
      </nav>

      {/* ================= 核心视窗 ================= */}
      <main className="flex-1 flex relative overflow-hidden bg-[#020617]">
        
        {/* 🚀 地球居中层：在私人空间时，通过 lg:pl-[420px] 配合 flex 居中，完美对齐右侧剩余空间 */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out ${!isPublic ? 'opacity-100 z-10 lg:pl-[420px]' : 'opacity-0 z-0 pointer-events-none pl-0'}`}>
             <Globe ref={globeRef} globeImageUrl={isLight ? "//unpkg.com/three-globe/example/img/earth-day.jpg" : "//unpkg.com/three-globe/example/img/earth-dark.jpg"} backgroundColor="rgba(0,0,0,0)" pointsData={allMemories} pointColor="color" pointRadius={m => m.isHighlight ? 3 : 1.5} arcsData={arcData} arcColor="color" arcDashLength={0.4} arcDashAnimateTime={1500} />
        </div>

        {/* 🚀 左侧面板悬浮层 (Absolute Overlay)：浮在地球上方 */}
        <div className={`absolute top-0 left-0 h-full w-full lg:w-[420px] p-6 flex flex-col gap-6 border-r shrink-0 z-30 transition-transform duration-700 ${!isPublic ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'} ${isLight ? 'bg-white/80 border-slate-200 backdrop-blur-xl' : 'bg-black/60 border-white/5 backdrop-blur-xl'}`}>
          
          <div className={`p-6 rounded-[2rem] border shadow-xl transition-all duration-500 ${isChallenge ? 'bg-amber-500/5 border-amber-500/30' : (isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10')}`}>
            <h2 className={`text-sm uppercase font-black tracking-widest mb-4 ${isLight ? 'text-indigo-500' : 'text-indigo-400'}`}>📝 记录新时刻</h2>
            <textarea value={text} onChange={e => setText(e.target.value)} placeholder={isChallenge ? "写下挑战目标..." : (isHighlight ? "记录闪耀瞬间..." : "此刻的心情...")} className="w-full h-20 bg-transparent outline-none resize-none font-bold" />
            
            <div className={`overflow-hidden transition-all duration-500 ${isChallenge ? 'max-h-60 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
               <div className="border-t border-amber-500/20 pt-4 pb-2 flex flex-col gap-4 text-sm">
                  <div className="flex justify-between items-center font-bold"><span className="text-amber-600">⏳ 周期</span><select value={days} onChange={e=>setDays(e.target.value)} className={`rounded px-2 py-1 outline-none ${isLight?'bg-slate-100':'bg-slate-800'}`}><option value="7">7天</option><option value="21">21天</option><option value="30">30天</option></select></div>
                  <div className="flex justify-between items-center font-bold"><span className="text-amber-600">⚡ 质押 (MTK)</span><input type="number" value={stakeAmount} onChange={e=>setStakeAmount(e.target.value)} className={`w-20 rounded px-2 py-1 text-right outline-none ${isLight?'bg-slate-100':'bg-slate-800'}`} placeholder="0" /></div>
                  <div className="flex justify-between items-center font-bold"><span className="text-amber-600">💝 去向</span><select value={safetyNet} onChange={e=>setSafetyNet(e.target.value)} className={`rounded px-2 py-1 outline-none ${isLight?'bg-slate-100':'bg-slate-800'}`}><option value="pool">社区互助池</option><option value="animals">流浪动物救助</option></select></div>
               </div>
            </div>

            {/* 🚀 极简图文交互，彻底删除录音话筒 */}
            <div className="flex justify-between items-center mt-2">
                 <label className={`cursor-pointer flex items-center gap-1.5 text-xs font-bold transition-opacity ${isLight ? 'text-slate-500 hover:text-indigo-600' : 'text-slate-400 hover:text-white'}`}>
                    <input type="file" className="hidden" onChange={(e) => setImage(URL.createObjectURL(e.target.files[0]))} />
                    <span className="text-base">📷</span> 附加图像
                 </label>
            </div>

            <div className="flex items-center justify-between mt-4 border-t pt-4 border-slate-500/10">
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer opacity-80 hover:opacity-100"><input type="checkbox" checked={isHighlight} onChange={e => {setIsHighlight(e.target.checked); setIsChallenge(false);}} className="accent-yellow-500" /> ✨ 高光</label>
                <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer opacity-80 hover:opacity-100"><input type="checkbox" checked={isChallenge} onChange={e => {setIsChallenge(e.target.checked); setIsHighlight(false);}} className="accent-amber-500" /> 🎯 挑战</label>
              </div>
              <button onClick={executeSaveToChain} disabled={isProcessing} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-black shadow-lg">SAVE</button>
            </div>
          </div>

          <div className="flex gap-2 bg-slate-500/10 p-1 rounded-2xl border border-slate-500/10 shrink-0">
            <button onClick={() => setPersonalView('timeline')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${personalView === 'timeline' ? 'bg-white shadow text-black' : 'text-slate-500'}`}>🎯 时光轴</button>
            <button onClick={() => setPersonalView('nfts')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${personalView === 'nfts' ? 'bg-white shadow text-black' : 'text-slate-500'}`}>🏆 勋章墙</button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 pb-10">
            {personalView === 'timeline' ? (
              <>
                <div className="flex justify-between items-center sticky top-0 py-2 backdrop-blur-md z-10"><span className="text-[10px] uppercase tracking-widest font-bold opacity-50">Timeline</span>{selectedForCuration.length > 0 && <button onClick={startExhibition} className="text-xs px-4 py-1.5 rounded-full font-bold bg-indigo-500 text-white shadow-md animate-pulse">🎬 开启特展</button>}</div>
                {allMemories.filter(m => !m.isChallenge).length === 0 && <p className="text-center text-sm opacity-50 mt-10">开始记录吧...</p>}
                {allMemories.filter(m => !m.isChallenge).map(m => (
                  <div key={m.index} className={`p-5 rounded-3xl border shadow-sm ${m.isHighlight ? (isLight ? 'bg-yellow-50 border-yellow-200' : 'bg-yellow-500/10 border-yellow-500/30') : (isLight ? 'bg-white border-slate-100' : 'bg-white/5 border-white/5')}`}>
                     <div className="flex items-start gap-3">
                        <input type="checkbox" checked={selectedForCuration.includes(m.index)} onChange={() => toggleCuration(m.index)} className="mt-1 w-4 h-4 accent-indigo-500 cursor-pointer" />
                        <div className="flex-grow">
                           <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold opacity-50">{new Date(m.timestamp*1000).toLocaleString()} {m.isHighlight && <span className="text-yellow-600 dark:text-yellow-400 ml-1">✨ 高光</span>}</span></div>
                           <p className="text-base font-bold">{m.content}</p>
                        </div>
                     </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                {allMemories.filter(m => m.isChallenge).length === 0 && <p className="text-center text-sm opacity-50 mt-10">暂无质押挑战...</p>}
                {allMemories.filter(m => m.isChallenge).map(m => {
                  const status = challengeStatus(m);
                  const daysLeft = Math.max(0, Math.ceil(((m.timestamp+m.duration)-Date.now()/1000)/86400));
                  return (
                    <div key={m.index} className={`p-5 rounded-3xl border shadow-lg ${glowMap[m.glow]}`}>
                      <div className="flex justify-between items-start mb-2"><span className="text-[10px] font-bold opacity-60">{new Date(m.timestamp*1000).toLocaleString()}</span><span className="text-[10px] font-black text-amber-600">CHALLENGE</span></div>
                      <p className="text-sm font-bold mb-4">{m.content}</p>
                      <div className="flex justify-between items-center text-xs font-bold opacity-70 mb-4"><span>{m.duration/86400}天 • {m.safetyNet === 'pool' ? '社区池' : '动物救助'}</span><span className={textMap[m.glow]}>{m.stakeAmount} MTK 质押</span></div>
                      
                      {!m.isCompleted && (
                        <div className="mt-4 border-t border-current pt-3 opacity-90 flex justify-between items-end">
                          {status === "COUNTING" && <div className="text-xs font-bold">⏳ 剩余: {daysLeft} 天</div>}
                          {status === "ON_REVIEW" && <div className="text-xs font-bold">📡 评审中 ({m.votesForSuccess}✅)</div>}
                          {status === "READY_TO_CLAIM" && <div className="text-xs font-bold">✨ 评审结束</div>}

                          {status === "NEED_PROOF" && <button onClick={()=>setShowProofModal(m.index)} className="px-4 py-2 bg-amber-500 text-white text-xs font-black rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse flex items-center gap-2">📸 提交结项证明</button>}
                          {status === "READY_TO_CLAIM" && (
                            <div className="flex gap-2">
                              <button onClick={()=>finalize(m.index, false)} className="px-4 py-2 bg-indigo-600 text-white text-xs font-black rounded-lg shadow-md">领取质押金</button>
                              <button onClick={()=>finalize(m.index, true)} className="px-3 py-2 bg-slate-500/50 text-white text-[10px] font-black rounded-lg hover:bg-red-500 transition-colors">承认失败</button>
                            </div>
                          )}
                        </div>
                      )}
                      {m.isCompleted && <div className="text-right text-[10px] font-black opacity-50 mt-2">✅ 已结项</div>}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* 🚀 公共纪念馆层：同样满屏覆盖 */}
        <div className={`absolute inset-0 overflow-y-auto overflow-x-hidden custom-scrollbar snap-y snap-mandatory scroll-smooth transition-opacity duration-1000 ${isPublic ? 'opacity-100 z-20 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'} ${isLight ? 'bg-slate-50' : 'bg-[#020617]'}`}>
             
             {/* --- 第一屏：100vh 强发光柔和微光星海 --- */}
             <div className="h-screen w-full relative shrink-0 snap-start bg-[#020617] overflow-hidden flex items-center justify-center shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
               <div className="absolute top-10 left-1/2 -translate-x-1/2 text-white/30 text-sm font-black tracking-widest uppercase z-30">深空微光频段</div>
               
               {[...publicStars].reverse().map((star) => (
                 <div key={star.id} className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-125 transition-transform z-10 hover:z-20 group" style={{ left: `${((star.lng + 180) / 360) * 100}%`, top: `${((90 - star.lat) / 180) * 100}%` }} onClick={() => setSelectedPublicStar(star)}>
                    <div className={`relative rounded-full w-3 h-3`} style={{ backgroundColor: star.color, boxShadow: `0 0 25px 2px ${star.color}` }}>
                       <div className="absolute inset-0 rounded-full opacity-50 mix-blend-screen" style={{ backgroundColor: star.color, transform: 'scale(3)', filter: 'blur(4px)' }} />
                    </div>
                    <div className="mt-5 px-4 py-1.5 rounded-full text-xs font-bold border shadow-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 border-white/10 text-white" style={{ borderColor: star.color }}>
                       {star.category || '星光'}
                    </div>
                 </div>
               ))}

               <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 z-30">
                 <button onClick={()=>setShowWitnessPlaza(true)} className="px-8 py-4 rounded-full font-black shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center gap-3 border border-white/20 bg-white/10 backdrop-blur-md text-white text-sm tracking-widest hover:bg-white/20 transition-all hover:scale-105">
                   ⚖️ 进入见证广场
                 </button>
                 <div className="flex items-center text-white/50 text-xs font-bold tracking-widest animate-bounce pointer-events-none">⬇️ 下滑沉浸档案馆</div>
               </div>
             </div>

             {/* --- 第二屏：下滑进入档案馆 (框格卡片与输入) --- */}
             <div className="min-h-screen w-full shrink-0 snap-start relative p-8 md:p-12 flex flex-col md:flex-row gap-12 pt-24 pb-32">
                <div className="md:w-1/3 flex flex-col gap-6 sticky top-24 h-fit">
                  <h2 className="text-5xl font-black tracking-tighter">PUBLIC<br/>MEMORIAL</h2>
                  <p className="opacity-60 text-base font-bold leading-relaxed mb-4">在这里，个人记忆汇聚成人类的星轨。寻找那些与你频率相同的灵魂，留下你的见证。</p>
                  
                  <div className={`p-6 rounded-3xl shadow-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
                    <div className="flex gap-2 mb-4">
                       <select value={customTag} onChange={e=>setCustomTag(e.target.value)} className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold outline-none ${isLight ? 'bg-slate-100' : 'bg-slate-900'}`}><option value="">选择类别...</option><option value="逝去的关系">逝去的关系</option><option value="公众人物">公众人物</option></select>
                       <input type="text" placeholder="自定义标签" value={customTag} onChange={e=>setCustomTag(e.target.value)} className={`w-1/2 rounded-xl px-3 py-2 text-sm font-bold outline-none ${isLight ? 'bg-slate-100' : 'bg-slate-900'}`} />
                    </div>
                    <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="为宇宙留下一道星光..." className="w-full h-24 mb-4 outline-none resize-none font-bold text-sm bg-transparent" />
                    <button onClick={executePublicSaveToChain} disabled={isProcessing} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-sm shadow-lg transition-colors">发射至星空</button>
                    <button onClick={triggerResonanceWave} className={`w-full py-3 mt-3 rounded-full font-black shadow-md border text-sm tracking-widest transition-colors ${isLight ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-indigo-900/30 text-indigo-400 border-indigo-700/50'}`}>📡 寻找共鸣频段</button>
                  </div>
                </div>
                
                <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6 h-fit">
                  {[...publicStars].reverse().map(star => (
                    <div key={star.id} onClick={()=>setSelectedPublicStar(star)} className={`p-6 rounded-[2rem] border shadow-sm cursor-pointer hover:-translate-y-1 transition-transform ${isLight ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700 backdrop-blur-md'}`}>
                      <div className="flex justify-between mb-4"><span className="text-[10px] font-black uppercase opacity-60 px-3 py-1 rounded-full border" style={{color: star.color, borderColor: star.color}}>• {star.category || '星光'}</span><span className="text-[10px] opacity-30 font-mono">{star.wallet?.substring(0,6)}...</span></div>
                      <p className="font-bold text-base mb-4 leading-relaxed line-clamp-3">{star.content}</p>
                      <div className="flex justify-between items-center text-[10px] opacity-50 border-t border-slate-500/20 pt-4 font-bold">
                         <span>{new Date(star.timestamp).toLocaleDateString()}</span>
                         <span style={{color:star.color}}>⚡ {star.energy}</span>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
        </div>

      </main>

      {/* ================= 🚀 模态框与抽屉群 ================= */}

      {/* 1. 见证广场抽屉 */}
      <div className={`fixed top-0 right-0 h-full w-full md:w-[450px] z-[150] shadow-[-20px_0_60px_rgba(0,0,0,0.5)] transition-transform duration-700 p-8 flex flex-col ${showWitnessPlaza ? 'translate-x-0' : 'translate-x-full'} ${isLight ? 'bg-white/95 border-l border-slate-200' : 'bg-slate-900/95 border-l border-slate-700'} backdrop-blur-xl`}>
         <div className="flex justify-between items-center mb-6 pt-4">
             <h2 className="text-2xl font-black italic tracking-tighter text-indigo-500">WITNESS PLAZA</h2>
             <button onClick={()=>setShowWitnessPlaza(false)} className="text-3xl font-black text-slate-400 hover:text-slate-600 transition-colors">×</button>
         </div>
         <p className="text-[10px] font-bold opacity-50 mb-6 tracking-widest italic border-l-2 border-amber-500 pl-2">“如果没有人投票，公示期后将默认挑战成功”</p>
         
         <div className="flex gap-2 mb-8">
            <input type="text" value={witnessSearchTarget} onChange={e=>setWitnessSearchTarget(e.target.value)} placeholder="输入对方钱包地址进行探测..." className={`flex-1 rounded-xl px-4 py-3 text-xs font-bold outline-none border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'}`} />
            <button onClick={searchWitnessTarget} disabled={isProcessing} className="px-4 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-md hover:bg-indigo-500">探测</button>
         </div>

         <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar pb-10">
            {witnessMemories.length === 0 ? (
                <div className="w-full text-center opacity-30 font-bold italic tracking-widest mt-20">使用探测器，寻找宇宙中需要见证的灵魂...</div>
            ) : (
                witnessMemories.map(m => {
                    const totalSec = 259200;
                    const elapsed = Math.max(0, (Date.now()/1000) - (m.reviewEndTime - totalSec));
                    const progress = Math.min(100, (elapsed / totalSec) * 100);
                    return (
                        <div key={m.index} className={`p-6 rounded-3xl border flex flex-col shadow-sm ${isLight ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700'}`}>
                            <div className="flex justify-between items-center mb-2"><span className="text-[10px] font-bold opacity-50">公示进度</span><span className="text-[10px] font-bold text-amber-500">{Math.floor(progress)}%</span></div>
                            <div className="w-full h-1 bg-slate-500/20 rounded-full mb-4 overflow-hidden"><div className="h-full bg-amber-500 rounded-full" style={{ width: `${progress}%` }} /></div>
                            
                            <p className="text-sm font-bold mb-4 italic">目标: "{m.content}"</p>
                            <div className="p-4 bg-slate-500/10 rounded-2xl mb-6 text-xs border border-slate-500/20">
                                <span className="font-black text-indigo-400 block mb-2">自证感言:</span>
                                {m.proof}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={()=>handleVote(witnessSearchTarget, m.index, true)} className="flex-1 py-3 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/30 rounded-xl text-xs font-black hover:bg-green-500 hover:text-white transition-all">✅ 见证达成</button>
                                <button onClick={()=>handleVote(witnessSearchTarget, m.index, false)} className="flex-1 py-3 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 rounded-xl text-xs font-black hover:bg-red-500 hover:text-white transition-all">❌ 证据不足</button>
                            </div>
                        </div>
                    );
                })
            )}
         </div>
      </div>

      {/* 2. 发起人：自证模态框 */}
      {showProofModal !== null && (
        <div className="fixed inset-0 z-[180] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className={`w-full max-w-md bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative border ${isLight ? 'border-slate-200' : 'border-slate-700'}`}>
             <button onClick={()=>setShowProofModal(null)} className="absolute top-8 right-8 text-slate-400 text-2xl font-black">×</button>
             <h2 className="text-2xl font-black mb-6 tracking-tighter text-indigo-500">提交结项证明</h2>
             <textarea value={proofText} onChange={e=>setProofText(e.target.value)} placeholder="写下你的修行感言..." className={`w-full h-32 p-4 rounded-2xl border-none outline-none text-sm font-bold mb-4 resize-none ${isLight ? 'bg-slate-100' : 'bg-slate-900'}`} />
             
             {/* 🚀 弱化上传图片提示 */}
             <div className="flex justify-between items-center mb-8">
                 <div className="flex items-center gap-2 opacity-50">
                    <span className="text-lg">📷</span><span className="text-[10px] font-bold">目前支持填入图床外链作为证明</span>
                 </div>
             </div>
             
             <button onClick={submitProof} disabled={isProcessing} className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:bg-amber-600 transition-all">
               {isProcessing ? "TRANSMITTING..." : "启动全宇宙公示 (3天)"}
             </button>
          </div>
        </div>
      )}

      {/* 3. 详情与回响模态框 */}
      {selectedPublicStar && isPublic && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className={`w-full max-w-md rounded-[2.5rem] p-10 relative shadow-2xl transition-colors duration-500 ${isLight ? 'bg-white/95 border border-slate-200' : 'bg-slate-900/95 border border-slate-700'}`}>
             <button onClick={() => setSelectedPublicStar(null)} className="absolute top-8 right-8 text-slate-400 font-black text-2xl">×</button>
             <span className={`inline-block px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border mb-6 ${isLight ? 'bg-slate-50' : 'bg-slate-800'}`} style={{ borderColor: selectedPublicStar.color, color: selectedPublicStar.color }}>纪念碑 • {selectedPublicStar.category || '星光'}</span>
             <h2 className="text-xl font-black mb-6 leading-relaxed">"{selectedPublicStar.content}"</h2>
             <p className="text-xs font-mono opacity-40 mb-6">By: {selectedPublicStar.wallet}</p>
             
             <div className="h-20 relative overflow-hidden pointer-events-none opacity-80 mb-6 bg-slate-500/5 rounded-2xl border border-slate-500/10">
               {(selectedPublicStar.messages || []).map((msg, i) => (<div key={i} className={`absolute whitespace-nowrap text-xs font-bold italic animate-marquee`} style={{ top: `${(i%3) * 20 + 10}px`, animationDelay: `${i * 1.5}s` }}>💬 {msg}</div>))}
             </div>

             <div className="flex items-center gap-3 mt-4">
                <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="留下一句回响..." className={`flex-1 border rounded-2xl px-5 py-4 text-sm font-bold outline-none ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'}`} onKeyDown={e => e.key === 'Enter' && submitComment(selectedPublicStar)} />
                <button onClick={() => submitComment(selectedPublicStar)} className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-black shadow-lg transition-colors">发送</button>
             </div>
             
             <button disabled={isProcessing} onClick={() => executeInjectEnergy(selectedPublicStar.id)} className="w-full mt-6 py-4 rounded-2xl font-black text-white shadow-xl active:scale-95 transition-transform" style={{ backgroundColor: selectedPublicStar.color }}>
                 ✨ 注入缅怀能量 (-1 MTK)
             </button>
          </div>
        </div>
      )}

      {/* 4. 特展播放器 */}
      {showExhibition && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-8 backdrop-blur-xl">
           <button onClick={() => setShowExhibition(false)} className="absolute top-8 right-8 text-white opacity-50 hover:opacity-100 font-bold text-xl">退出特展</button>
           <div className="max-w-2xl text-center animate-fade-in-up">
              <span className="text-indigo-400 text-sm font-black tracking-widest mb-6 block">MEMORY EXHIBITION {currentSlideIndex + 1} / {selectedForCuration.length}</span>
              <p className="text-3xl md:text-5xl font-black text-white leading-tight mb-8">{allMemories.find(m => m.index === selectedForCuration[currentSlideIndex])?.content}</p>
           </div>
        </div>
      )}

      {/* 5. 导出手工书 */}
      {showExport && (
        <div className={`fixed inset-0 z-[190] p-12 overflow-y-auto ${exportStyle === 'scrapbook' ? 'bg-[#fdfbf7] text-[#4a4a4a]' : 'bg-[#020617] text-white'}`}>
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center mb-12 gap-4 sticky top-0 z-50 p-4 rounded-2xl backdrop-blur-xl border border-black/5">
            <button onClick={()=>setShowExport(false)} className={`font-bold px-6 py-3 border rounded-xl ${exportStyle === 'scrapbook' ? 'border-slate-300 hover:bg-slate-100' : 'border-white/20 hover:bg-white/10'}`}>← 返回</button>
            <div className="flex gap-4">
              <select value={scrapbookFilter} onChange={e=>setScrapbookFilter(e.target.value)} className={`px-4 py-3 font-bold rounded-xl outline-none cursor-pointer border ${exportStyle === 'scrapbook' ? 'bg-white border-slate-300' : 'bg-black/50 border-white/20'}`}>
                 <option value="all">全量记忆</option><option value="highlight">仅高光时刻</option><option value="challenge">仅挑战记录</option>
              </select>
              <button onClick={()=>setExportStyle('scrapbook')} className={`px-4 py-3 font-bold rounded-xl transition-all ${exportStyle === 'scrapbook' ? 'bg-indigo-500 text-white shadow-lg' : 'border border-slate-300'}`}>温馨手工书</button>
              <button onClick={()=>setExportStyle('cyberpunk')} className={`px-4 py-3 font-bold rounded-xl transition-all ${exportStyle === 'cyberpunk' ? 'bg-pink-500 text-white shadow-[0_0_15px_#ec4899]' : 'border border-white/20'}`}>霓虹画报</button>
              <button onClick={executeExportPDF} className="px-6 py-3 font-bold rounded-xl bg-indigo-600 text-white shadow-lg flex items-center gap-2">📥 区块链打印</button>
            </div>
          </div>
          <div className={`max-w-3xl mx-auto p-16 shadow-2xl ${exportStyle === 'scrapbook' ? 'bg-white rounded-sm font-serif' : 'bg-black/80 rounded-3xl font-mono border border-pink-500/30'}`}>
            <h1 className={`text-4xl font-black text-center mb-16 tracking-widest ${exportStyle === 'cyberpunk' ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400' : ''}`}>我的赛博星轨</h1>
            <div className={`space-y-12 relative before:absolute before:inset-0 before:mx-auto before:w-0.5 ${exportStyle === 'scrapbook' ? 'before:bg-slate-200' : 'before:bg-slate-800'}`}>
              {allMemories.filter(m => scrapbookFilter === 'all' || (scrapbookFilter === 'highlight' && m.isHighlight) || (scrapbookFilter === 'challenge' && m.isChallenge)).map((m) => (
                <div key={m.index} className="relative flex items-center justify-between odd:flex-row-reverse group z-10">
                  <div className={`w-4 h-4 rounded-full z-10 border-4 shadow-sm ${exportStyle === 'scrapbook' ? 'border-white' : 'border-black'}`} style={{ backgroundColor: m.color }} />
                  <div className={`w-[calc(50%-2rem)] p-6 rounded-2xl shadow-sm ${exportStyle === 'scrapbook' ? 'bg-slate-50 border border-slate-100' : 'bg-white/5 border border-white/10'}`}>
                    <time className="text-xs font-bold opacity-50 mb-2 block">{new Date(m.timestamp*1000).toLocaleString()} {m.isHighlight && '✨ 高光'} {m.isChallenge && '🎯 挑战'}</time>
                    <p className="font-bold">{m.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}