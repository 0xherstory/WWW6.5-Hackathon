import { useState } from "react";
import { ethers } from "ethers";
import DashboardPanel from "./DashboardPanel";
import {
  FUJI_CHAIN_ID,
  FUJI_EXPLORER,
  baselineRiskToCode,
  clampUint8,
  ensureContractMethod,
  hasContractMethod,
  sharingLevelToBytes32,
  surgeryTypeToCode,
} from "@/lib/contract";

interface Props {
  contract: ethers.Contract | null;
  address: string | null;
}

const riskOptions = [
  { value: "Low", label: "Low", labelCn: "低" },
  { value: "Medium", label: "Medium", labelCn: "中" },
  { value: "High", label: "High", labelCn: "高" },
];

const surgeryOptions = [
  { value: "None", label: "None", labelCn: "无" },
  { value: "External", label: "External", labelCn: "外路" },
  { value: "Internal", label: "Internal", labelCn: "内路" },
  { value: "ICL", label: "ICL", labelCn: "晶体植入" },
  { value: "LASIK", label: "LASIK", labelCn: "激光角膜手术" },
];

const sharingOptions = [
  { value: "None", label: "None", labelCn: "无" },
  { value: "Research", label: "Research", labelCn: "研究" },
  { value: "Healthcare", label: "Healthcare", labelCn: "医疗" },
  { value: "Public", label: "Public", labelCn: "公开" },
];

export default function UserRegistration({ contract, address }: Props) {
  const [vulnScore, setVulnScore] = useState(50);
  const [baselineRisk, setBaselineRisk] = useState("Medium");
  const [hasDetachment, setHasDetachment] = useState(false);
  const [hasHoles, setHasHoles] = useState(false);
  const [surgeryInfo, setSurgeryInfo] = useState("None");
  const [laserCount, setLaserCount] = useState(0);
  const [sharingLevel, setSharingLevel] = useState("None");
  const [txHash, setTxHash] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const registerSupported = hasContractMethod(contract, "registerUser");

  const handleRegister = async () => {
    if (!contract || !address) return alert("Connect wallet first / 请先连接钱包");

    setLoading(true);
    setStatusMessage("");
    setTxHash("");

    try {
      const currentContract = ensureContractMethod(contract, "registerUser", "Register");
      const network = await contract.provider.getNetwork();

      if (Number(network.chainId) !== FUJI_CHAIN_ID) {
        throw new Error("Please switch MetaMask to Avalanche Fuji (43113) / 请切换 MetaMask 到 Avalanche Fuji (43113)");
      }

      if (hasContractMethod(contract, "registeredUsers")) {
        const alreadyRegistered = await (contract as any).registeredUsers(address);
        if (alreadyRegistered) {
          throw new Error("This wallet is already registered / 当前钱包地址已注册");
        }
      }

      const surgeryType = surgeryTypeToCode(surgeryInfo);
      const tx = await currentContract.registerUser(
        clampUint8(vulnScore, 0, 100),
        baselineRiskToCode(baselineRisk),
        hasDetachment,
        hasHoles,
        surgeryType !== 0,
        surgeryType,
        clampUint8(laserCount),
        sharingLevelToBytes32(sharingLevel),
      );

      setTxHash(tx.hash);
      setStatusMessage("Registration submitted successfully / 注册交易已提交");
      await tx.wait();
      setStatusMessage("Registration successful! / 注册成功！");
      alert("Registration successful! / 注册成功！");
    } catch (err: any) {
      console.error(err);
      const message = err.reason || err.data?.message || err.message || "Registration failed / 注册失败";
      setStatusMessage(message);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const selectClass = "w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-foreground font-body focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary";
  const inputClass = selectClass;
  const labelClass = "block font-mono text-xs text-muted-foreground tracking-wider uppercase mb-1.5";
  const checkLabelClass = "flex items-start gap-3 text-sm text-foreground cursor-pointer";
  const checkboxClass = "mt-0.5 w-4 h-4 accent-cyan rounded";

  return (
    <DashboardPanel title="User Registration" titleCn="用户注册" tag="01 · Register 注册" tagColor="cyan">
      {!registerSupported && address && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
          <p className="font-mono text-xs text-destructive">Current deployed contract ABI does not expose registerUser<br/>当前已部署合约 ABI 未暴露 registerUser 函数</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Vulnerability Score (0-100)<br/>脆弱性评分 (0-100)</label>
          <input type="number" min={0} max={100} value={vulnScore} onChange={e => setVulnScore(Number(e.target.value))} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Baseline Risk<br/>基线风险</label>
          <select value={baselineRisk} onChange={e => setBaselineRisk(e.target.value)} className={selectClass}>
            {riskOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label} {option.labelCn}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Retinal Conditions<br/>视网膜情况</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-lg border border-border bg-muted p-4">
            <label className={checkLabelClass}>
              <input type="checkbox" checked={hasDetachment} onChange={e => setHasDetachment(e.target.checked)} className={checkboxClass} />
              <span>
                <span className="block">Retinal Detachment</span>
                <span className="block text-xs text-muted-foreground">视网膜脱离</span>
              </span>
            </label>
            <label className={checkLabelClass}>
              <input type="checkbox" checked={hasHoles} onChange={e => setHasHoles(e.target.checked)} className={checkboxClass} />
              <span>
                <span className="block">Retinal Holes</span>
                <span className="block text-xs text-muted-foreground">视网膜裂孔</span>
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className={labelClass}>Surgery Type<br/>手术类型</label>
          <select value={surgeryInfo} onChange={e => setSurgeryInfo(e.target.value)} className={selectClass}>
            {surgeryOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label} {option.labelCn}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Laser Treatment Count<br/>激光治疗次数</label>
          <input type="number" min={0} max={255} value={laserCount} onChange={e => setLaserCount(Number(e.target.value))} className={inputClass} />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Data Sharing Level<br/>数据共享级别</label>
          <select value={sharingLevel} onChange={e => setSharingLevel(e.target.value)} className={selectClass}>
            {sharingOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label} {option.labelCn}</option>
            ))}
          </select>
        </div>
      </div>

      {statusMessage && (
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="font-mono text-xs text-muted-foreground break-words">{statusMessage}</p>
        </div>
      )}

      <button onClick={handleRegister} disabled={loading || !address || !registerSupported} className="mt-5 w-full py-3 rounded-lg font-mono text-sm tracking-wider uppercase border border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 transition-all disabled:opacity-50">
        {loading ? "Submitting... 提交中..." : "Register on Blockchain 注册上链"}
      </button>

      {txHash && (
        <div className="mt-3 p-3 bg-muted rounded-lg">
          <p className="font-mono text-xs text-muted-foreground">TX Hash 交易哈希:</p>
          <a href={`${FUJI_EXPLORER}/tx/${txHash}`} target="_blank" rel="noreferrer" className="font-mono text-xs text-primary break-all hover:underline">{txHash}</a>
        </div>
      )}
    </DashboardPanel>
  );
}
