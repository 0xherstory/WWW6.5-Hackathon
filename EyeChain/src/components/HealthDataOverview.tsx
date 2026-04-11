import { useEffect, useState } from "react";
import { ethers } from "ethers";
import DashboardPanel from "./DashboardPanel";
import { baselineRiskLabel, dataSharingLabel, hasContractMethod, shortenAddress, surgeryTypeLabel } from "@/lib/contract";

interface Props {
  contract: ethers.Contract | null;
  address: string | null;
}

interface UserProfileData {
  userAddress: string;
  vulnerabilityScore: number;
  baselineRisk: number;
  hasRetinalDetachment: boolean;
  hasRetinalHoles: boolean;
  postOpStatus: boolean;
  surgeryType: number;
  laserTreatmentCount: number;
  registeredAt: number;
  isActive: boolean;
  dataSharingLevel: string;
}

export default function HealthDataOverview({ contract, address }: Props) {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    if (!contract || !address) return;

    setLoading(true);
    setMessage("");

    try {
      if (!hasContractMethod(contract, "getUserProfile") || !hasContractMethod(contract, "registeredUsers")) {
        setProfile(null);
        setMessage("Current deployed contract only supports limited profile reads / 当前已部署合约仅支持有限的档案读取");
        return;
      }

      const [registered, rawProfile] = await Promise.all([
        (contract as any).registeredUsers(address),
        (contract as any).getUserProfile(address),
      ]);

      if (!registered) {
        setProfile(null);
        setMessage("No on-chain registration found for this wallet / 当前钱包尚未完成链上注册");
        return;
      }

      setProfile({
        userAddress: String(rawProfile.userAddress),
        vulnerabilityScore: Number(rawProfile.vulnerabilityScore),
        baselineRisk: Number(rawProfile.baselineRisk),
        hasRetinalDetachment: Boolean(rawProfile.hasRetinalDetachment),
        hasRetinalHoles: Boolean(rawProfile.hasRetinalHoles),
        postOpStatus: Boolean(rawProfile.postOpStatus),
        surgeryType: Number(rawProfile.surgeryType),
        laserTreatmentCount: Number(rawProfile.laserTreatmentCount),
        registeredAt: Number(rawProfile.registeredAt),
        isActive: Boolean(rawProfile.isActive),
        dataSharingLevel: String(rawProfile.dataSharingLevel),
      });
    } catch (err: any) {
      console.error("Failed to fetch data:", err);
      setProfile(null);
      setMessage(err.reason || err.data?.message || err.message || "Failed to load profile / 资料加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!contract || !address) {
      setProfile(null);
      setMessage("");
      return;
    }

    fetchData();
  }, [contract, address]);

  return (
    <DashboardPanel title="Health Data Overview" titleCn="健康数据概览" tag="03 · Overview 概览" tagColor="green">
      {!address ? (
        <p className="text-muted-foreground font-mono text-sm">Connect wallet to view data<br/>连接钱包以查看数据</p>
      ) : (
        <>
          {profile ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                  { label: "VULN SCORE\n脆弱性评分", value: profile.vulnerabilityScore },
                  { label: "RISK LEVEL\n风险等级", value: baselineRiskLabel(profile.baselineRisk) },
                  { label: "LASER COUNT\n激光次数", value: profile.laserTreatmentCount },
                  { label: "STATUS\n状态", value: profile.isActive ? "Active 活跃" : "Inactive 未激活" },
                ].map(s => (
                  <div key={s.label} className="bg-muted rounded-lg p-4 text-center">
                    <div className="font-heading text-2xl font-bold text-primary break-words">{s.value}</div>
                    <div className="font-mono text-[10px] text-muted-foreground tracking-wider mt-1 whitespace-pre-line">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-muted rounded-lg p-4 mb-4 space-y-2 text-sm">
                <p className="font-mono text-xs text-muted-foreground">PROFILE DETAILS 档案详情</p>
                <div><span className="text-muted-foreground">Wallet 钱包:</span> <span className="text-foreground font-mono">{shortenAddress(profile.userAddress) || "—"}</span></div>
                <div><span className="text-muted-foreground">Retinal Detachment 视网膜脱离:</span> <span className="text-foreground">{profile.hasRetinalDetachment ? "Yes 是" : "No 否"}</span></div>
                <div><span className="text-muted-foreground">Retinal Holes 视网膜裂孔:</span> <span className="text-foreground">{profile.hasRetinalHoles ? "Yes 是" : "No 否"}</span></div>
                <div><span className="text-muted-foreground">Post-op 术后状态:</span> <span className="text-foreground">{profile.postOpStatus ? "Yes 是" : "No 否"}</span></div>
                <div><span className="text-muted-foreground">Surgery Type 手术类型:</span> <span className="text-foreground">{surgeryTypeLabel(profile.surgeryType)}</span></div>
                <div><span className="text-muted-foreground">Sharing Level 共享级别:</span> <span className="text-foreground">{dataSharingLabel(profile.dataSharingLevel)}</span></div>
                <div><span className="text-muted-foreground">Registered At 注册时间:</span> <span className="text-foreground">{profile.registeredAt > 0 ? new Date(profile.registeredAt * 1000).toLocaleString() : "—"}</span></div>
              </div>
            </>
          ) : (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-muted-foreground font-mono text-sm break-words">{message || "No profile available yet / 暂无档案数据"}</p>
            </div>
          )}

          {!hasContractMethod(contract, "getHistory") && (
            <div className="mb-4 p-3 bg-amber/10 border border-amber/30 rounded-lg">
              <p className="font-mono text-xs text-amber">Current ABI does not include risk history queries<br/>当前 ABI 未包含风险历史查询函数</p>
            </div>
          )}

          <button onClick={fetchData} disabled={loading} className="px-4 py-2 rounded-lg font-mono text-xs tracking-wider uppercase border border-neon-green/50 bg-neon-green/10 text-neon-green hover:bg-neon-green/20 transition-all disabled:opacity-50">
            {loading ? "Loading... 加载中..." : "Refresh Data 刷新数据"}
          </button>
        </>
      )}
    </DashboardPanel>
  );
}
