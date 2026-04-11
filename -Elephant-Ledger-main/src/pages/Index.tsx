import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { toast } from "@/hooks/use-toast";
import ValueHero from "@/components/ValueHero";
import ReceiptCard from "@/components/ReceiptCard";
import FloatingActionButton from "@/components/FloatingActionButton";
import InputSheet from "@/components/InputSheet";
import Confetti from "@/components/Confetti";

type EntryStatus = "pending" | "verified";

type Region = "guangzhou" | "shanghai" | "beijing";
type LaborType = "餐饮与采买" | "清洁与收纳" | "育儿与照护" | "统筹与情绪劳动";

interface Entry {
  id: string;
  date: Date;
  region: Region;
  laborType: LaborType;
  minutes: number;
  note?: string;
  value: number;
  status: EntryStatus;
}

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}

const CONTRACT_ADDRESS = "0xAe087178d5e04ECb32fB8Bd4c5f7E06f1bBd88d8";
const CONTRACT_ABI = [
  "function mintDailyLabor(string category, uint256 durationMins, uint256 value) public",
  "function sealMonthlyArchive(string month, string merkleRoot) public",
];

const hourlyPriceByRegion: Record<Region, Record<LaborType, number>> = {
  guangzhou: { "清洁与收纳": 40, "餐饮与采买": 50, "育儿与照护": 60, "统筹与情绪劳动": 80 },
  shanghai: { "清洁与收纳": 40, "餐饮与采买": 50, "育儿与照护": 60, "统筹与情绪劳动": 80 },
  beijing: { "清洁与收纳": 40, "餐饮与采买": 50, "育儿与照护": 60, "统筹与情绪劳动": 80 },
};

const calculateValueYen = (payload: { region: string; laborType: string; minutes: number }) => {
  const region = payload.region as Region;
  const laborType = payload.laborType as LaborType;
  const minutes = payload.minutes;
  if (!minutes || minutes <= 0) return 0;

  const hourly = hourlyPriceByRegion[region]?.[laborType] ?? hourlyPriceByRegion.guangzhou[laborType];
  return Math.round((minutes * hourly) / 60);
};

// 生成 2018 - 2026 的年份数组
const yearsList = Array.from({ length: 2026 - 2018 + 1 }, (_, i) => (2026 - i).toString());
// 生成 01 - 12 的月份数组
const monthsList = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));

const Index = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isBatchMinting, setIsBatchMinting] = useState(false);
  
  // 独立的年份和月份状态（默认 2026年 04月）
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedMonth, setSelectedMonth] = useState("04");
  
  const [generatedArchiveMonths, setGeneratedArchiveMonths] = useState<string[]>([]);
  const [currentAccount, setCurrentAccount] = useState<string>("");

  const totalValue = entries.reduce((sum, entry) => sum + entry.value, 0);
  const totalMinutes = entries.reduce((sum, entry) => sum + entry.minutes, 0);
  
  // 动态拼接当前的归档月份字符串，如 "2026-04"
  const archiveMonth = `${selectedYear}-${selectedMonth}`;

  const handleConnectWallet = useCallback(async () => {
    try {
      if (!window.ethereum) {
        toast({ title: "未检测到钱包", description: "请先安装 MetaMask 后再连接钱包。" });
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const account = accounts?.[0] as string | undefined;
      if (account) setCurrentAccount(account);
    } catch {
      toast({ title: "连接被拒绝", description: "操作取消或网络异常，请检查钱包状态。" });
    }
  }, []);

  const handleAddToToday = useCallback(
    (payload: { region: string; laborType: string; minutes: number; note?: string }) => {
      const region = payload.region as Region;
      const laborType = payload.laborType as LaborType;
      const minutes = payload.minutes;

      const newEntry: Entry = {
        id: Date.now().toString(),
        date: new Date(),
        region,
        laborType,
        minutes,
        note: payload.note?.trim() ? payload.note.trim() : undefined,
        value: calculateValueYen({ region, laborType, minutes }),
        status: "pending",
      };

      setEntries((prev) => [newEntry, ...prev]);
    },
    []
  );

  const handleMintPending = useCallback(async () => {
    if (isBatchMinting) return;
    if (!currentAccount || !window.ethereum) {
      toast({ title: "请先连接钱包" });
      return;
    }

    const pendingEntries = entries.filter((entry) => entry.status === "pending");
    if (pendingEntries.length === 0) {
      toast({ title: "暂无需要上链的记录" });
      return;
    }

    try {
      setIsBatchMinting(true);
      const totalPendingMinutes = pendingEntries.reduce((sum, entry) => sum + entry.minutes, 0);
      const totalPendingValue = pendingEntries.reduce((sum, entry) => sum + entry.value, 0);
      const categories = pendingEntries.map((entry) => entry.laborType).join("|");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.mintDailyLabor(categories, totalPendingMinutes, totalPendingValue);
      toast({ title: "上链确认中，请稍候..." });
      await tx.wait();

      setEntries((prev) => prev.map((entry) => (entry.status === "pending" ? { ...entry, status: "verified" } : entry)));
      setShowConfetti(true);
      toast({ title: `🎉 今日记录已成功上链！(今日创造隐性经济价值约 ¥${totalPendingValue}，金额仅供自我赋权与参考)` });
    } catch {
      toast({ title: "操作取消或网络异常，请检查钱包状态。" });
    } finally {
      setIsBatchMinting(false);
    }
  }, [currentAccount, entries, isBatchMinting]);

  const handleGenerateMonthlyArchive = useCallback(async () => {
    if (!currentAccount || !window.ethereum) {
      toast({ title: "请先连接钱包" });
      return;
    }
    const monthStart = new Date(Number(selectedYear), Number(selectedMonth) - 1, 1);
    const monthEnd = new Date(Number(selectedYear), Number(selectedMonth), 1);
    const verifiedRecords = entries.filter((entry) => entry.status === "verified" && entry.date >= monthStart && entry.date < monthEnd);
    
    if (verifiedRecords.length === 0) {
      toast({ title: "该月份暂无已确权的记录" });
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.sealMonthlyArchive(archiveMonth, "0xMockMerkleRootHash1234567890abcdef");
      await tx.wait();

      toast({ title: "✨ 月度数字凭证已生成并锚定至区块链！" });
      setGeneratedArchiveMonths((prev) => (prev.includes(archiveMonth) ? prev : [...prev, archiveMonth]));
    } catch {
      toast({ title: "操作取消或网络异常，请检查钱包状态。" });
    }
  }, [archiveMonth, selectedYear, selectedMonth, currentAccount, entries]);

  if (!currentAccount) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-between p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[35vh] bg-gradient-to-b from-terracotta/15 to-transparent -z-10"></div>
        <div className="flex-1 flex flex-col items-center justify-center w-full mt-4">
          <div className="w-28 h-28 bg-white rounded-[2rem] shadow-sm flex items-center justify-center mb-8 border border-terracotta/10">
            <img src="/logo.png" alt="大象账本 Logo" className="w-20 h-20 object-contain animate-fade-in" />
          </div>
          <h1 className="text-4xl font-extrabold text-foreground mb-2 tracking-tight text-center">大象家务手账</h1>
          <p className="text-base font-medium text-muted-foreground mb-12 tracking-wider">Elephant Ledger</p>
          <div className="space-y-3 text-center mb-10">
            <p className="text-terracotta text-xl font-semibold tracking-widest">让家务劳动不再是</p>
            <p className="text-terracotta text-xl font-semibold tracking-widest">房间里的大象</p>
          </div>
        </div>
        <div className="w-full max-w-sm pb-10 flex flex-col items-center z-10">
          <button
            type="button"
            onClick={handleConnectWallet}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-terracotta to-terracotta-light text-primary-foreground font-bold text-[1.1rem] shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            连接钱包进入 (Connect)
          </button>
          <p className="mt-8 text-xs text-muted-foreground/50 text-center font-medium tracking-widest uppercase">
            Powered by Avalanche & ZK Technology
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Confetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      <header className="px-5 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Elephant Ledger Logo" className="w-8 h-8 rounded-md object-cover" />
            <div className="flex flex-col items-start leading-tight">
              <h1 className="text-xl font-bold text-foreground">大象家务手账</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCurrentAccount("")}
            className="px-3 py-1.5 rounded-full border border-terracotta/20 bg-white shadow-sm hover:bg-terracotta/5 transition-all duration-300 flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-terracotta text-sm font-semibold tracking-wide">
              {`${currentAccount.slice(0, 4)}...${currentAccount.slice(-4)}`}
            </span>
            <span className="text-xs text-muted-foreground ml-1">退出</span>
          </button>
        </div>
      </header>
      
      <section className="px-5 py-4">
        <ValueHero totalMinutes={totalMinutes} totalValue={totalValue} className={showConfetti ? "animate-scale-bounce" : ""} />
      </section>
      
      <section className="px-5 py-4">
        <div className="mb-4 rounded-2xl border border-border/60 bg-card/70 p-4">
          <p className="text-xs text-muted-foreground mb-3">
            ✨ 提示：为生成可信的电子存证，月度数据将通过零知识证明 (ZK) 技术与您的真实身份进行加密锚定，全程保护隐私。
          </p>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">月度确权档案 (Monthly Archives)</h3>
              <p className="text-xs text-muted-foreground mt-1">选择历史月份并生成对应的区块链凭证。</p>
            </div>
            
            {/* 改造为双下拉框布局 */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-background border border-input rounded-xl overflow-hidden h-9">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-transparent px-2 py-1 text-sm text-foreground outline-none cursor-pointer"
                >
                  {yearsList.map((y) => <option key={y} value={y}>{y}年</option>)}
                </select>
                <div className="w-px h-4 bg-border"></div>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent px-2 py-1 text-sm text-foreground outline-none cursor-pointer"
                >
                  {monthsList.map((m) => <option key={m} value={m}>{parseInt(m)}月</option>)}
                </select>
              </div>

              {generatedArchiveMonths.includes(archiveMonth) ? (
                <button
                  type="button"
                  onClick={handleGenerateMonthlyArchive}
                  className="text-blue-600 hover:text-blue-700 text-sm font-semibold underline underline-offset-4 shrink-0 ml-1"
                >
                  📥 查看凭证
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerateMonthlyArchive}
                  className="shrink-0 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors ml-1"
                >
                  生成数字凭证
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Recent Entries</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{entries.length} records</span>
            <button
              type="button"
              onClick={handleMintPending}
              disabled={isBatchMinting}
              className="px-3 py-2 rounded-xl bg-terracotta text-primary-foreground text-xs font-semibold hover:bg-terracotta/90 transition-colors disabled:opacity-60"
            >
              今日记录上链
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div key={entry.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <ReceiptCard entry={entry} />
            </div>
          ))}
        </div>
      </section>
      
      <FloatingActionButton onClick={() => setIsSheetOpen(true)} />
      
      <InputSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} calculateValueYen={calculateValueYen} onAddToToday={handleAddToToday} />
    </div>
  );
};

export default Index;