"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import {
  SpaceBadge,
  SpaceButton,
  SpaceEmptyState,
  SpaceField,
  SpaceInput,
  SpaceListItem,
  SpaceTextarea,
} from "../components/space-shell";
import {
  WitnessBadge,
  WitnessRecordList,
  WitnessSummary,
} from "../components/witness";
import { WalletStatusCard } from "../components/wallet-status-card";
import {
  CheckInMood,
  createCommitmentCheckIn,
  getCommitmentsWithProgress,
  hasCheckedInToday,
  localizeCommitmentProgressStatus,
} from "../lib/commitment-checkins";
import {
  createCommitment,
  formatCommitmentDate,
  formatDurationDays,
  getCommitmentErrorMessage,
  refreshMyCommitments,
} from "../lib/commitments-chain";
import { getRecentFriendCommitments } from "../lib/friend-commitments";
import {
  followBackUser,
  followUser,
  getRelationshipSnapshot,
  type SocialRelationshipEntry,
  unfollowUser,
  validateRelationshipAddress,
} from "../lib/social-relationships";
import { useTownSnapshot } from "../lib/ami-world";
import { useWalletAccount } from "../lib/use-wallet-account";
import { formatAddress } from "../lib/wallet";
import {
  decorateCommitmentsWithWitnessData,
  getWitnessRecords,
} from "../lib/witness";
import {
  createWitness as createWitnessOnChain,
  getContractV2ErrorMessage,
} from "@/lib/contract/amiCommitmentV2";
import type {
  CheckIn,
  Commitment,
  CommitmentWithProgress,
  WitnessRecord,
} from "@/lib/contract/types";

type ActiveModal = "records" | "desk" | "table" | null;
type FullscreenDeskView = "list" | "create" | null;

const supportRecords = [
  {
    title: "来自阿米搭子的留言",
    description: "继续按自己的节奏来就很好，慢一点也没关系。",
    meta: "支持记录",
  },
  {
    title: "花园社小卡片",
    description: "你最近的状态很温柔，也很稳定，记得给自己一点夸奖。",
    meta: "支持记录",
  },
];

const rewardRecords = [
  {
    title: "小星灯贴纸",
    description: "累计完成 3 次回访后获得，可以点亮书桌角落。",
    meta: "小奖励",
  },
  {
    title: "柔雾书签",
    description: "写下第一份约定后获得，提醒你别忘了最初的心意。",
    meta: "小奖励",
  },
];

const groups = [
  { title: "hersolidity", description: "300 个 a.mi 正在学习 Solidity", meta: "活跃中" },
  {
    title: "sweet corner",
    description: "3 个 a.mi 正在打卡“每日写 3 件开心的事”",
    meta: "活跃中",
  },
  { title: "23:30 准时睡觉", description: "已经 30 天没有新动态", meta: "近期安静" },
  {
    title: "乌啦啦申博互助会",
    description: "最近没有新的留言和打卡",
    meta: "近期安静",
  },
  {
    title: "下班后三小时打卡群",
    description: "最近暂时没有新的记录",
    meta: "近期安静",
  },
];

const newCommitmentPrompts = [
  "这次我想认真对待的一件小事是什么？",
  "我希望自己以什么样的节奏持续下去？",
  "当我想放弃时，希望看到怎样的一句提醒？",
];

const checkInMoodOptions: CheckInMood[] = ["很好", "平静", "有点累", "低落"];

export default function ProfileViewPage() {
  const townSnapshot = useTownSnapshot();
  const { walletAddress } = useWalletAccount();
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [deskFullscreen, setDeskFullscreen] = useState<FullscreenDeskView>(null);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [commitments, setCommitments] = useState<CommitmentWithProgress[]>([]);
  const [selectedCommitmentId, setSelectedCommitmentId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [reminder, setReminder] = useState("");
  const [checkInContent, setCheckInContent] = useState("");
  const [checkInMood, setCheckInMood] = useState<CheckInMood | "">("");
  const [proofFileName, setProofFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState(false);
  const [isLoadingCommitments, setIsLoadingCommitments] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [listError, setListError] = useState("");
  const [checkInError, setCheckInError] = useState("");
  const [checkInSuccess, setCheckInSuccess] = useState("");
  const [wallWitnessRecords, setWallWitnessRecords] = useState<WitnessRecord[]>([]);
  const [witnessRecordsError, setWitnessRecordsError] = useState("");
  const [followInput, setFollowInput] = useState("");
  const [relationshipsReady, setRelationshipsReady] = useState(false);
  const [relationshipFormError, setRelationshipFormError] = useState("");
  const [following, setFollowing] = useState<SocialRelationshipEntry[]>([]);
  const [followers, setFollowers] = useState<SocialRelationshipEntry[]>([]);
  const [mutuals, setMutuals] = useState<SocialRelationshipEntry[]>([]);
  const [selectedProfileAddress, setSelectedProfileAddress] = useState("");
  const [selectedProfileCommitments, setSelectedProfileCommitments] = useState<CommitmentWithProgress[]>([]);
  const [selectedProfileCommitmentsError, setSelectedProfileCommitmentsError] = useState("");
  const [isLoadingSelectedProfileCommitments, setIsLoadingSelectedProfileCommitments] = useState(false);
  const [relationshipWitnessMessage, setRelationshipWitnessMessage] = useState("");
  const [relationshipWitnessTone, setRelationshipWitnessTone] = useState<"success" | "error">(
    "success",
  );
  const [pendingWitnessCommitmentId, setPendingWitnessCommitmentId] = useState<number | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadCommitments = async () => {
      if (!walletAddress) {
        if (isActive) {
          setCommitments([]);
          setListError("");
          setIsLoadingCommitments(false);
        }
        return;
      }

      setIsLoadingCommitments(true);
      setListError("");

      try {
        const baseCommitments = await refreshMyCommitments();
        const nextCommitments = await hydrateCommitments(baseCommitments);

        if (isActive) {
          setCommitments(nextCommitments);
        }
      } catch (error) {
        if (isActive) {
          setListError(getCommitmentErrorMessage(error));
          setCommitments([]);
        }
      } finally {
        if (isActive) {
          setIsLoadingCommitments(false);
        }
      }
    };

    void loadCommitments();

    return () => {
      isActive = false;
    };
  }, [walletAddress]);

  useEffect(() => {
    if (!commitments.length) {
      setSelectedCommitmentId(null);
      return;
    }

    const hasSelectedCommitment = commitments.some(
      (item) => item.id === selectedCommitmentId,
    );

    if (!hasSelectedCommitment) {
      setSelectedCommitmentId(commitments[0].id);
    }
  }, [commitments, selectedCommitmentId]);

  useEffect(() => {
    setRelationshipsReady(true);

    if (!walletAddress) {
      setFollowing([]);
      setFollowers([]);
      setMutuals([]);
      setSelectedProfileAddress("");
      return;
    }

    const snapshot = getRelationshipSnapshot(walletAddress);
    setFollowing(snapshot.following);
    setFollowers(snapshot.followers);
    setMutuals(snapshot.mutuals);
    setSelectedProfileAddress((current) =>
      current &&
      [
        ...snapshot.following.map((item) => item.address),
        ...snapshot.mutuals.map((item) => item.address),
      ].includes(current)
        ? current
        : snapshot.following[0]?.address ?? snapshot.mutuals[0]?.address ?? "",
    );
  }, [walletAddress]);

  const selectedCommitment =
    commitments.find((item) => item.id === selectedCommitmentId) ??
    commitments[0] ??
    null;
  const viewableRelationshipAddresses = useMemo(
    () => new Set([...following.map((item) => item.address), ...mutuals.map((item) => item.address)]),
    [following, mutuals],
  );
  const canViewSelectedProfileCommitments = Boolean(
    selectedProfileAddress && viewableRelationshipAddresses.has(selectedProfileAddress),
  );
  const currentCommitmentTitle =
    selectedCommitment?.title || townSnapshot.commitmentTitle || "给自己留一份温柔约定";
  const currentCommitmentStatus = selectedCommitment
    ? localizeCommitmentProgressStatus(selectedCommitment.status)
    : "房间待布置";
  const isFormValid = Boolean(title.trim() && duration.trim() && reminder.trim());
  const isCheckInFormValid = Boolean(checkInContent.trim() && checkInMood);

  const draftSummary = useMemo(
    () => [
      { label: "约定标题", value: title.trim() || "比如：每天专注学习 30 分钟" },
      { label: "预计周期", value: duration.trim() || "比如：7 天 / 14 天 / 30 天" },
      {
        label: "给自己的提醒",
        value: reminder.trim() || "就算今天很忙，也至少坐下来开始 10 分钟。",
      },
    ],
    [duration, reminder, title],
  );

  const recentCheckIns = selectedCommitment?.checkIns.slice(0, 3) ?? [];
  const todayCheckedIn = selectedCommitment ? hasCheckedInToday(selectedCommitment.checkIns) : false;
  const witnessHint = selectedCommitment?.witnessCount
    ? "你的成长正在被看见"
    : undefined;

  const hydrateCommitments = async (baseCommitments: Commitment[]) =>
    decorateCommitmentsWithWitnessData(await getCommitmentsWithProgress(baseCommitments));
  const hydrateFriendCommitments = async (address: string) =>
    decorateCommitmentsWithWitnessData(await getRecentFriendCommitments(address));
  const refreshWallRecords = async (currentWalletAddress: string, nextCommitments = commitments) => {
    const nextRecords = await getWitnessRecords(currentWalletAddress, nextCommitments);
    setWallWitnessRecords(nextRecords);
    setWitnessRecordsError("");
  };

  useEffect(() => {
    let isActive = true;

    const loadFriendCommitments = async () => {
      if (!selectedProfileAddress || !canViewSelectedProfileCommitments) {
        if (isActive) {
          setSelectedProfileCommitments([]);
          setSelectedProfileCommitmentsError("");
          setIsLoadingSelectedProfileCommitments(false);
        }
        return;
      }

      setIsLoadingSelectedProfileCommitments(true);
      setSelectedProfileCommitmentsError("");

      try {
        const nextCommitments = await hydrateFriendCommitments(selectedProfileAddress);

        if (isActive) {
          setSelectedProfileCommitments(nextCommitments);
        }
      } catch (error) {
        if (isActive) {
          setSelectedProfileCommitments([]);
          setSelectedProfileCommitmentsError(getCommitmentErrorMessage(error));
        }
      } finally {
        if (isActive) {
          setIsLoadingSelectedProfileCommitments(false);
        }
      }
    };

    void loadFriendCommitments();

    return () => {
      isActive = false;
    };
  }, [canViewSelectedProfileCommitments, selectedProfileAddress]);

  useEffect(() => {
    let isActive = true;

    const loadWitnessRecords = async () => {
      if (!walletAddress) {
        if (isActive) {
          setWallWitnessRecords([]);
          setWitnessRecordsError("");
        }
        return;
      }

      try {
        const nextRecords = await getWitnessRecords(walletAddress, commitments);

        if (isActive) {
          setWallWitnessRecords(nextRecords);
          setWitnessRecordsError("");
        }
      } catch {
        if (isActive) {
          setWallWitnessRecords([]);
          setWitnessRecordsError("暂时无法读取见证记录，请稍后再试。");
        }
      }
    };

    void loadWitnessRecords();

    return () => {
      isActive = false;
    };
  }, [commitments, walletAddress]);

  const handleCreateCommitment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormValid || isSubmitting) {
      return;
    }

    if (!walletAddress) {
      setSubmitError("请先连接钱包，再把约定写入 Sepolia。");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const result = await createCommitment({
        title,
        duration,
        reminder,
      });

      const nextCommitments = await hydrateCommitments(result.commitments);

      setCommitments(nextCommitments);
      setSelectedCommitmentId(result.commitments[0]?.id ?? null);
      setTitle("");
      setDuration("");
      setReminder("");
      setSubmitSuccess("已经成功写入链上，MetaMask 交易也已确认。");
      setListError("");
      setDeskFullscreen("list");
    } catch (error) {
      setSubmitError(getCommitmentErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCheckInModal = () => {
    setCheckInError("");
    setCheckInSuccess("");
    setCheckInContent("");
    setCheckInMood("");
    setProofFileName("");
    setIsCheckInModalOpen(true);
  };

  const closeCheckInModal = () => {
    setIsCheckInModalOpen(false);
  };

  const handleCheckInSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedCommitment || !walletAddress || !isCheckInFormValid || isSubmittingCheckIn) {
      return;
    }

    if (selectedCommitment.status === "completed") {
      setCheckInError("这份约定已经完成，不需要继续打卡了。");
      return;
    }

    setIsSubmittingCheckIn(true);
    setCheckInError("");
    setCheckInSuccess("");

    try {
      const proofURI = proofFileName ? `local-file:${proofFileName}` : "";

      await createCommitmentCheckIn({
        commitmentId: selectedCommitment.id,
        content: checkInContent,
        mood: checkInMood,
        proofURI,
      });

      const baseCommitments = await refreshMyCommitments();
      const nextCommitments = await hydrateCommitments(baseCommitments);

      setCommitments(nextCommitments);
      setCheckInSuccess("今日打卡已成功写入链上，进度也同步更新了。");
      setCheckInContent("");
      setCheckInMood("");
      setProofFileName("");
    } catch (error) {
      setCheckInError(getCommitmentErrorMessage(error));
    } finally {
      setIsSubmittingCheckIn(false);
    }
  };

  const applyRelationshipSnapshot = (
    snapshot: ReturnType<typeof getRelationshipSnapshot>,
    preferredAddress?: string,
  ) => {
    setFollowing(snapshot.following);
    setFollowers(snapshot.followers);
    setMutuals(snapshot.mutuals);

    const candidateAddresses = [
      ...snapshot.following.map((item) => item.address),
      ...snapshot.mutuals.map((item) => item.address),
    ];

    setSelectedProfileAddress((current) => {
      if (preferredAddress && candidateAddresses.includes(preferredAddress)) {
        return preferredAddress;
      }

      if (current && candidateAddresses.includes(current)) {
        return current;
      }

      return snapshot.following[0]?.address ?? snapshot.mutuals[0]?.address ?? "";
    });
  };

  const handleFollowUser = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!walletAddress) {
      setRelationshipFormError("请先连接钱包，再管理你的关注关系。");
      return;
    }

    try {
      const normalizedAddress = validateRelationshipAddress(followInput);
      const snapshot = followUser(walletAddress, normalizedAddress);

      applyRelationshipSnapshot(snapshot, normalizedAddress);
      setFollowInput("");
      setRelationshipFormError("");
      setRelationshipWitnessMessage("");
      setRelationshipWitnessTone("success");
    } catch (error) {
      setRelationshipFormError(getCommitmentErrorMessage(error));
    }
  };

  const handleFollowBack = (targetAddress: string) => {
    if (!walletAddress) {
      return;
    }

    try {
      const snapshot = followBackUser(walletAddress, targetAddress);
      applyRelationshipSnapshot(snapshot, targetAddress);
      setRelationshipFormError("");
      setRelationshipWitnessMessage("");
      setRelationshipWitnessTone("success");
    } catch (error) {
      setRelationshipFormError(getCommitmentErrorMessage(error));
    }
  };

  const handleUnfollow = (targetAddress: string) => {
    if (!walletAddress) {
      return;
    }

    const snapshot = unfollowUser(walletAddress, targetAddress);
    applyRelationshipSnapshot(snapshot);
    setRelationshipWitnessMessage("");
    setRelationshipWitnessTone("success");
  };

  const handleWitness = async (commitment: CommitmentWithProgress) => {
    if (!walletAddress) {
      setRelationshipWitnessTone("error");
      setRelationshipWitnessMessage("请先连接钱包，再发起见证。");
      return;
    }

    if (!Number.isFinite(commitment.id)) {
      setRelationshipWitnessTone("error");
      setRelationshipWitnessMessage("当前约定缺少有效 commitmentId，暂时无法见证。");
      return;
    }

    const normalizedWalletAddress = walletAddress.toLowerCase();
    const isOwnCommitment = commitment.creator.toLowerCase() === normalizedWalletAddress;
    const hasWitnessed = Boolean(
      commitment.witnesses?.some(
        (item) => item.address.toLowerCase() === normalizedWalletAddress,
      ),
    );

    if (isOwnCommitment) {
      setRelationshipWitnessTone("error");
      setRelationshipWitnessMessage("不能见证自己的约定。");
      return;
    }

    if (hasWitnessed) {
      setRelationshipWitnessTone("error");
      setRelationshipWitnessMessage("这条约定你已经见证过了。");
      return;
    }

    setPendingWitnessCommitmentId(commitment.id);
    setRelationshipWitnessMessage("");

    try {
      await createWitnessOnChain(commitment.id);

      const [nextCommitments] = await Promise.all([
        hydrateFriendCommitments(commitment.creator),
        refreshWallRecords(walletAddress),
      ]);

      setSelectedProfileCommitments(nextCommitments);
      setRelationshipWitnessTone("success");
      setRelationshipWitnessMessage("见证已成功写入链上，当前约定的见证信息已经刷新。");
    } catch (error) {
      setRelationshipWitnessTone("error");
      setRelationshipWitnessMessage(getContractV2ErrorMessage(error));
    } finally {
      setPendingWitnessCommitmentId(null);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-[#F4EFE9] px-3 py-3 sm:px-4">
        <div className="mx-auto max-w-[1800px]">
          <div className="relative overflow-hidden rounded-[32px] bg-[#F7F3EF] shadow-[0_8px_30px_rgba(120,110,100,0.08)]">
            <div className="relative h-[82vh] min-h-[680px] w-full max-md:min-h-[760px]">
              <Image
                src="/assets/spaces/cottage/cottage_bg_v2.png"
                alt="我的小屋背景"
                fill
                priority
                className="object-cover object-center"
              />

              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,250,246,0.18)_0%,rgba(255,250,246,0.05)_35%,rgba(81,64,55,0.14)_100%)]" />

              <div className="absolute left-6 top-[5.5rem] z-20 flex flex-col gap-4">
                <WalletStatusCard
                  className="rounded-[24px] border border-[rgba(255,255,255,0.34)] bg-[rgba(255,252,250,0.72)] px-4 py-3 shadow-[0_10px_24px_rgba(116,104,97,0.08)] backdrop-blur-sm"
                  labelClassName="text-[11px] uppercase tracking-[0.18em] text-[#8C7B74]"
                  addressClassName="mt-1 text-[15px] font-semibold tracking-[0.08em] text-[#5F5751]"
                  statusClassName="mt-1 text-[12px] tracking-[0.08em] text-[#6E8B67]"
                />

                <div className="pointer-events-none max-w-[320px] rounded-[28px] border border-[rgba(255,255,255,0.18)] bg-[rgba(255,250,246,0.22)] px-5 py-4 shadow-[0_18px_40px_rgba(79,64,52,0.10)] backdrop-blur-[6px] max-md:hidden">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#8C7B74]">小屋状态</p>
                  <p className="mt-2 text-lg font-semibold text-[#5F5751]">{currentCommitmentTitle}</p>
                  <p className="mt-2 text-sm leading-6 text-[#6C615A]">
                    已连续回访 {townSnapshot.profileStreak} 天，当前状态为 {currentCommitmentStatus}。
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal("records")}
                className="group absolute left-[20%] top-[7%] z-[18] w-[22%] min-w-[190px] max-w-[320px] text-left"
              >
                <InteractiveObject
                  src="/assets/spaces/cottage/cottage_wall_cert.png"
                  alt="奖状墙"
                  className="aspect-square"
                />
              </button>

              <button
                type="button"
                onClick={() => setActiveModal("desk")}
                className="group absolute right-[8%] top-[11%] z-[22] w-[37%] min-w-[360px] max-w-[560px] text-left"
              >
                <InteractiveObject
                  src="/assets/spaces/cottage/cottage_desk_window_v2.png"
                  alt="窗边书桌"
                  className="aspect-square"
                />
              </button>

              <button
                type="button"
                onClick={() => setActiveModal("table")}
                className="group absolute left-[45%] top-[39%] z-[24] w-[32%] min-w-[260px] max-w-[430px] -translate-x-1/2 text-left"
              >
                <InteractiveObject
                  src="/assets/spaces/cottage/cottage_table_user.png"
                  alt="圆桌"
                  className="aspect-square"
                />
              </button>

              <div className="absolute left-5 top-5 z-20 rounded-full border border-[rgba(255,255,255,0.32)] bg-[rgba(255,252,250,0.62)] px-6 py-3 backdrop-blur-sm">
                <p className="text-[15px] tracking-[0.24em] text-[#85757A]">我的小屋</p>
              </div>

              <div className="absolute left-5 bottom-5 z-30 flex flex-wrap gap-3">
                <NavPill href="/square" label="去主城" />
                <NavPill href="/study" label="学习小屋" tone="rose" />
                <NavPill href="/garden" label="花园社" tone="sage" />
              </div>

            </div>
          </div>
        </div>
      </main>

      <BaseModal
        open={activeModal === "records"}
        title="奖状墙"
        subtitle="这里放着你的小屋见证和一路收下来的温柔反馈。"
        onClose={() => setActiveModal(null)}
      >
        <ModalSection
          title="见证记录"
          badge={wallWitnessRecords.length ? `${Math.min(wallWitnessRecords.length, 6)} 条` : "空白中"}
        >
          <WitnessRecordList
            records={wallWitnessRecords}
            emptyDescription={
              witnessRecordsError || "当你与他人开始互相见证，记录会出现在这里。"
            }
          />
        </ModalSection>
        <ModalSection title="支持记录" badge="2 条">
          {supportRecords.map((item) => (
            <SpaceListItem key={item.title} {...item} />
          ))}
        </ModalSection>
        <ModalSection title="小奖励" badge="2 件">
          {rewardRecords.map((item) => (
            <SpaceListItem key={item.title} {...item} />
          ))}
        </ModalSection>
      </BaseModal>

      <BaseModal
        open={activeModal === "desk"}
        title="窗边书桌"
        subtitle="这里适合回看自己的约定，也适合重新写下新的开始。"
        onClose={() => setActiveModal(null)}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <DeskActionCard
            title="查看我的约定"
            description="从 Sepolia 链上读取当前钱包创建的 commitments 与 check-in 记录。"
            actionLabel="查看我的约定"
            onClick={() => setDeskFullscreen("list")}
          />
          <DeskActionCard
            title="写下新约定"
            description="打开真实可填写的表单，把新的承诺写进窗边书桌。"
            actionLabel="写下新约定"
            onClick={() => {
              setSubmitError("");
              setSubmitSuccess("");
              setDeskFullscreen("create");
            }}
          />
        </div>
      </BaseModal>

      <BaseModal
        open={activeModal === "table"}
        title="圆桌"
        subtitle="围坐在一起的人和小组，都被收在这张圆桌边。"
        onClose={() => setActiveModal(null)}
      >
        <section className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-5">
            <ModalSection title="关注关系" badge={`${following.length} 位关注中`}>
              <form className="space-y-3" onSubmit={handleFollowUser}>
                <SpaceField label="关注一个地址">
                  <SpaceInput
                    type="text"
                    value={followInput}
                    onChange={(event) => setFollowInput(event.target.value)}
                    placeholder="0x..."
                    disabled={!walletAddress}
                  />
                </SpaceField>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <SpaceButton
                    type="submit"
                    tone="lavender"
                    disabled={!walletAddress || !followInput.trim()}
                    className={!walletAddress || !followInput.trim() ? "opacity-60" : ""}
                  >
                    关注
                  </SpaceButton>
                  <p className="text-xs leading-6 text-[#8a7780]">
                    当前关系只保存在本地浏览器，不会上链。
                  </p>
                </div>
                {relationshipFormError ? (
                  <p className="rounded-[18px] bg-[rgba(209,111,130,0.12)] px-4 py-3 text-sm text-[#96576d]">
                    {relationshipFormError}
                  </p>
                ) : null}
              </form>
            </ModalSection>

            <ModalSection title="我的关注" badge={`${following.length} 位`}>
              {!walletAddress ? (
                <SpaceEmptyState
                  title="还没有连接钱包"
                  description="先连接当前钱包，再管理你的关注列表。"
                />
              ) : !relationshipsReady ? (
                <SpaceEmptyState
                  title="正在准备关系数据"
                  description="正在从本地浏览器恢复你的关注视角。"
                />
              ) : following.length ? (
                <div className="space-y-3">
                  {following.map((item) => (
                    <RelationshipCard
                      key={`following-${item.address}`}
                      entry={item}
                      selected={selectedProfileAddress === item.address}
                      description={
                        item.isMutual ? "你们已经互相关注，可以视为好友。" : "你已关注对方，可直接查看对方最近约定。"
                      }
                      primaryActionLabel="查看约定"
                      onPrimaryAction={() => {
                        setSelectedProfileAddress(item.address);
                        setRelationshipWitnessMessage("");
                        setRelationshipWitnessTone("success");
                      }}
                      secondaryActionLabel="取消关注"
                      onSecondaryAction={() => handleUnfollow(item.address)}
                    />
                  ))}
                </div>
              ) : (
                <SpaceEmptyState
                  title="还没有关注任何人"
                  description="输入一个钱包地址后，你就可以单向关注对方并查看对方最近的 V1 commitments。"
                />
              )}
            </ModalSection>

            <ModalSection title="关注我的" badge={`${followers.length} 位`}>
              {!walletAddress ? (
                <SpaceEmptyState
                  title="还没有连接钱包"
                  description="连接钱包后，这里会显示谁关注了你。"
                />
              ) : followers.length ? (
                <div className="space-y-3">
                    {followers.map((item, index) => (
                      <RelationshipCard
                        key={`follower-${item.address}`}
                        entry={item}
                        selected={false}
                        description={
                          index === 0
                            ? "最近有地址关注了你，回关后可查看对方最近约定。"
                            : "这位用户关注了你，回关后可查看对方最近约定。"
                        }
                        primaryActionLabel="暂不可查看"
                        onPrimaryAction={undefined}
                        secondaryActionLabel={item.isMutual ? "已互关" : "回关"}
                        onSecondaryAction={
                          item.isMutual ? undefined : () => handleFollowBack(item.address)
                        }
                        primaryDisabled
                        secondaryDisabled={item.isMutual}
                      />
                    ))}
                </div>
              ) : (
                <SpaceEmptyState
                  title="暂时还没人关注你"
                  description="当其他地址在本地关系中关注你后，这里会显示轻量提示和回关入口。"
                />
              )}
            </ModalSection>

            <ModalSection title="互相关注" badge={`${mutuals.length} 位`}>
              {mutuals.length ? (
                <div className="space-y-3">
                  {mutuals.map((item) => (
                    <RelationshipCard
                      key={`mutual-${item.address}`}
                      entry={item}
                      selected={selectedProfileAddress === item.address}
                      description="双方都已关注彼此，当前在前端视角下视为互相关注 / 好友。"
                      primaryActionLabel="查看约定"
                      onPrimaryAction={() => {
                        setSelectedProfileAddress(item.address);
                        setRelationshipWitnessMessage("");
                        setRelationshipWitnessTone("success");
                      }}
                      secondaryActionLabel="取消关注"
                      onSecondaryAction={() => handleUnfollow(item.address)}
                    />
                  ))}
                </div>
              ) : (
                <SpaceEmptyState
                  title="还没有互相关注"
                  description="当对方也关注你或你回关对方后，这里就会出现互相关注关系。"
                />
              )}
            </ModalSection>
          </div>

          <ModalSection
            title="最近约定"
            badge={selectedProfileAddress ? formatAddress(selectedProfileAddress) : "未选择"}
          >
            {!selectedProfileAddress ? (
              <SpaceEmptyState
                title="先选一个关注关系"
                description="从左侧的我的关注或互相关注中点开一个地址后，这里会读取对方最近的链上 commitments。"
              />
            ) : !canViewSelectedProfileCommitments ? (
              <SpaceEmptyState
                title="当前还不能查看"
                description="仅在你已关注对方，或双方已互相关注时，才可查看对方最近约定。回关后即可解锁。"
              />
            ) : isLoadingSelectedProfileCommitments ? (
              <SpaceEmptyState
                title="正在读取最近约定"
                description="正在通过 V1 commitment 合约读取该地址最近的 commitments。"
              />
            ) : selectedProfileCommitmentsError ? (
              <SpaceEmptyState
                title="读取约定失败"
                description={selectedProfileCommitmentsError}
              />
            ) : selectedProfileCommitments.length ? (
              <div className="space-y-3">
                {selectedProfileCommitments.map((item) => (
                  <FriendCommitmentCard
                    key={item.id}
                    commitment={item}
                    walletAddress={walletAddress}
                    isWitnessPending={pendingWitnessCommitmentId === item.id}
                    onWitness={() => void handleWitness(item)}
                  />
                ))}
                {relationshipWitnessMessage ? (
                  <p
                    className={`rounded-[18px] px-4 py-3 text-sm ${
                      relationshipWitnessTone === "error"
                        ? "bg-[rgba(209,111,130,0.12)] text-[#96576d]"
                        : "bg-[rgba(129,171,134,0.14)] text-[#5b7a60]"
                    }`}
                  >
                    {relationshipWitnessMessage}
                  </p>
                ) : null}
              </div>
            ) : (
              <SpaceEmptyState
                title="这个地址还没有约定"
                description="暂时还没读到对方的 V1 commitments，等对方创建后再回来看看。"
              />
            )}
          </ModalSection>
        </section>
        <ModalSection title="我的群组" badge={`${groups.length} 个`}>
          {groups.map((item) => (
            <SpaceListItem key={item.title} {...item} />
          ))}
        </ModalSection>
      </BaseModal>

      <FullscreenModal
        open={deskFullscreen === "list"}
        title="我的约定"
        onClose={() => setDeskFullscreen(null)}
      >
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <CardPanel
            eyebrow={selectedCommitment ? "当前约定详情" : "还没有约定"}
            title={currentCommitmentTitle}
            description={
              selectedCommitment?.reminder ||
              "这份约定提醒你，把想认真对待的事情留在每天都能看见的地方。"
            }
          >
            {selectedCommitment ? (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoCard label="约定标题" value={selectedCommitment.title} />
                  <InfoCard label="给自己的提醒" value={selectedCommitment.reminder} />
                  <InfoCard
                    label="预计周期"
                    value={formatDurationDays(selectedCommitment.durationDays)}
                  />
                  <InfoCard label="当前进度" value={selectedCommitment.progressText} />
                  <InfoCard
                    label="当前状态"
                    value={localizeCommitmentProgressStatus(selectedCommitment.status)}
                  />
                  <InfoCard
                    label="创建时间"
                    value={formatCommitmentDate(selectedCommitment.createdAt)}
                  />
                </div>

                <WitnessSummary
                  witnesses={selectedCommitment.witnesses ?? []}
                  maxVisible={2}
                  emptyText="暂无见证"
                  hint={witnessHint}
                />

                <div className="rounded-[26px] border border-[rgba(187,170,152,0.16)] bg-[linear-gradient(180deg,rgba(251,246,239,0.92)_0%,rgba(247,239,231,0.9)_100%)] p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[0.72rem] uppercase tracking-[0.16em] text-[#9d7f66]">
                        打卡进展
                      </p>
                      <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#5A453F]">
                        {selectedCommitment.progressText}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[#6b5953]">
                        已完成 {selectedCommitment.checkedDays} 天，目标周期为{" "}
                        {selectedCommitment.durationDays} 天。
                      </p>
                    </div>

                    {selectedCommitment.status === "completed" ? (
                      <SpaceButton disabled className="opacity-60">
                        已完成
                      </SpaceButton>
                    ) : (
                      <SpaceButton tone="sage" onClick={openCheckInModal}>
                        今日打卡
                      </SpaceButton>
                    )}
                  </div>
                  {todayCheckedIn ? (
                    <p className="mt-3 text-sm text-[#6B7F62]">
                      今天已经有一条链上打卡记录了，当前版本仍允许继续补充新的记录。
                    </p>
                  ) : null}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[0.72rem] uppercase tracking-[0.16em] text-[#9d7786]">
                      最近打卡
                    </p>
                    <SpaceBadge tone="amber">{selectedCommitment.checkIns.length} 条</SpaceBadge>
                  </div>

                  {recentCheckIns.length ? (
                    <div className="space-y-3">
                      {recentCheckIns.map((item) => (
                        <CheckInCard key={item.id} checkIn={item} />
                      ))}
                    </div>
                  ) : (
                    <SpaceEmptyState
                      title="还没有打卡记录"
                      description="完成第一次今日打卡后，这里会开始记录你的回访。"
                    />
                  )}
                </div>
              </div>
            ) : (
              <SpaceEmptyState
                title="还没有写下新的约定"
                description="从窗边书桌开始你的第一份承诺"
              />
            )}
          </CardPanel>

          <CardPanel
            eyebrow="约定列表"
            title="查看我的约定"
            description="右侧保持为简洁导航列表，点击任一约定后会在左侧展开完整详情。"
          >
            {!walletAddress ? (
              <SpaceEmptyState
                title="还没有连接钱包"
                description="先连接 MetaMask，再从链上读取你的小屋约定。"
              />
            ) : isLoadingCommitments ? (
              <SpaceEmptyState
                title="正在读取链上约定"
                description="正在从 Sepolia 拉取你的 commitment 列表，请稍等一下。"
              />
            ) : listError ? (
              <SpaceEmptyState
                title="读取约定失败"
                description={listError}
              />
            ) : commitments.length ? (
              <div className="space-y-3">
                {commitments.map((item) => (
                  <CommitmentCard
                    key={item.id}
                    commitment={item}
                    selected={item.id === selectedCommitment?.id}
                    onClick={() => setSelectedCommitmentId(item.id)}
                  />
                ))}
              </div>
            ) : (
              <SpaceEmptyState
                title="还没有写下新的约定"
                description="从窗边书桌开始你的第一份承诺"
              />
            )}
          </CardPanel>
        </div>
      </FullscreenModal>

      <FullscreenModal
        open={deskFullscreen === "create"}
        title="写下新约定"
        onClose={() => setDeskFullscreen(null)}
      >
        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <CardPanel
            eyebrow="新的开始"
            title="在书桌前写下新的 commitment"
            description="必填项填写完成后，点击“成功书写”会唤起 MetaMask，并在交易确认后自动刷新“查看我的约定”。"
          >
            <form className="space-y-4" onSubmit={handleCreateCommitment}>
              <SpaceField label="约定标题">
                <SpaceInput
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="每天专注学习 30 分钟"
                />
              </SpaceField>

              <SpaceField label="预计周期">
                <SpaceInput
                  type="text"
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                  placeholder="7 天 / 14 天 / 30 天"
                />
              </SpaceField>

              <SpaceField label="给自己的提醒">
                <SpaceTextarea
                  value={reminder}
                  onChange={(event) => setReminder(event.target.value)}
                  placeholder="就算今天很忙，也至少坐下来开始 10 分钟。"
                  rows={5}
                />
              </SpaceField>

              {submitError ? (
                <p className="rounded-[20px] bg-[rgba(209,111,130,0.12)] px-4 py-3 text-sm text-[#96576d]">
                  {submitError}
                </p>
              ) : null}

              {submitSuccess ? (
                <p className="rounded-[20px] bg-[rgba(129,171,134,0.14)] px-4 py-3 text-sm text-[#5b7a60]">
                  {submitSuccess}
                </p>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <SpaceButton
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className={!isFormValid || isSubmitting ? "opacity-60" : ""}
                >
                  {isSubmitting ? "书写中..." : "成功书写"}
                </SpaceButton>
                <button
                  type="button"
                  onClick={() => setDeskFullscreen("list")}
                  className="text-sm leading-7 text-[#7d6771] underline decoration-[rgba(125,103,113,0.3)] underline-offset-4"
                >
                  去查看我的约定
                </button>
              </div>
            </form>
          </CardPanel>

          <CardPanel
            eyebrow="书写提示"
            title="可以从这些问题开始"
            description="保持现有治愈风卡片结构，同时把右侧改成跟随表单内容实时预览。"
          >
            <div className="space-y-3">
              {draftSummary.map((item) => (
                <InfoCard key={item.label} label={item.label} value={item.value} />
              ))}

              {newCommitmentPrompts.map((prompt, index) => (
                <div
                  key={prompt}
                  className="rounded-[24px] border border-[rgba(181,160,168,0.12)] bg-[rgba(255,255,255,0.72)] px-5 py-4"
                >
                  <p className="text-[0.72rem] uppercase tracking-[0.16em] text-[#9d7786]">
                    提示 {index + 1}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[#5f4b54]">{prompt}</p>
                </div>
              ))}
            </div>
          </CardPanel>
        </div>
      </FullscreenModal>

      <BaseModal
        open={isCheckInModalOpen}
        title="今日打卡"
        subtitle="把今天和这份约定有关的一点点进展，留在窗边书桌里。"
        onClose={closeCheckInModal}
        zIndexClassName="z-[70]"
      >
        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <CardPanel
            eyebrow="check-in 表单"
            title={selectedCommitment?.title || "当前约定"}
            description="完成打卡后会直接调用链上 createCheckIn，并刷新当前约定的 progress 与打卡记录。"
          >
            <form className="space-y-4" onSubmit={handleCheckInSubmit}>
              <SpaceField label="今日打卡内容">
                <SpaceTextarea
                  value={checkInContent}
                  onChange={(event) => setCheckInContent(event.target.value)}
                  placeholder="今天完成了30分钟专注学习"
                  rows={5}
                />
              </SpaceField>

              <SpaceField label="今日心情">
                <div className="grid gap-3 sm:grid-cols-2">
                  {checkInMoodOptions.map((item) => {
                    const checked = checkInMood === item;

                    return (
                      <label
                        key={item}
                        className={`cursor-pointer rounded-[22px] border px-4 py-3 text-sm transition ${
                          checked
                            ? "border-[rgba(125,165,123,0.34)] bg-[rgba(241,248,240,0.92)] text-[#557053]"
                            : "border-[rgba(182,162,169,0.14)] bg-[rgba(255,255,255,0.82)] text-[#685760]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="checkin-mood"
                          value={item}
                          checked={checked}
                          onChange={() => setCheckInMood(item)}
                          className="sr-only"
                        />
                        {item}
                      </label>
                    );
                  })}
                </div>
              </SpaceField>

              <SpaceField label="打卡凭证上传">
                <label className="flex cursor-pointer flex-col gap-3 rounded-[24px] border border-dashed border-[rgba(182,162,169,0.26)] bg-[rgba(255,255,255,0.76)] px-5 py-4 text-sm text-[#685760]">
                  <span>选择一张图片或文件作为今天的打卡凭证</span>
                  <input
                    type="file"
                    onChange={(event) =>
                      setProofFileName(event.target.files?.[0]?.name?.trim() || "")
                    }
                    className="text-sm text-[#7a6972] file:mr-4 file:rounded-full file:border-0 file:bg-[rgba(199,175,187,0.2)] file:px-4 file:py-2 file:text-sm file:text-[#715a64]"
                  />
                </label>
                {proofFileName ? (
                  <p className="mt-3 rounded-[18px] bg-[rgba(245,236,227,0.8)] px-4 py-3 text-sm text-[#725f57]">
                    已选择凭证：{proofFileName}
                  </p>
                ) : null}
              </SpaceField>

              {checkInError ? (
                <p className="rounded-[20px] bg-[rgba(209,111,130,0.12)] px-4 py-3 text-sm text-[#96576d]">
                  {checkInError}
                </p>
              ) : null}

              {checkInSuccess ? (
                <p className="rounded-[20px] bg-[rgba(129,171,134,0.14)] px-4 py-3 text-sm text-[#5b7a60]">
                  {checkInSuccess}
                </p>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <SpaceButton
                  type="submit"
                  tone="sage"
                  disabled={!isCheckInFormValid || isSubmittingCheckIn}
                  className={!isCheckInFormValid || isSubmittingCheckIn ? "opacity-60" : ""}
                >
                  {isSubmittingCheckIn ? "提交中..." : "完成打卡"}
                </SpaceButton>
                <button
                  type="button"
                  onClick={closeCheckInModal}
                  className="text-sm leading-7 text-[#7d6771] underline decoration-[rgba(125,103,113,0.3)] underline-offset-4"
                >
                  返回约定详情
                </button>
              </div>
            </form>
          </CardPanel>

          <CardPanel
            eyebrow="打卡预览"
            title="这次提交会更新什么"
            description="提交成功后，会在当前约定下新增一条链上 check-in 记录，并即时刷新进度和状态。"
          >
            {selectedCommitment ? (
              <div className="space-y-3">
                <InfoCard label="约定标题" value={selectedCommitment.title} />
                <InfoCard label="当前进度" value={selectedCommitment.progressText} />
                <InfoCard
                  label="当前状态"
                  value={localizeCommitmentProgressStatus(selectedCommitment.status)}
                />
                <InfoCard
                  label="凭证占位"
                  value={proofFileName ? `local-file:${proofFileName}` : "将传空字符串"}
                />
              </div>
            ) : (
              <SpaceEmptyState
                title="还没有选中约定"
                description="先从“查看我的约定”中选择一条进行中的约定。"
              />
            )}
          </CardPanel>
        </div>
      </BaseModal>
    </>
  );
}

function InteractiveObject({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={`relative w-full transition duration-300 group-hover:-translate-y-1.5 group-hover:scale-[1.03] ${className ?? ""}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain drop-shadow-[0_20px_32px_rgba(94,73,56,0.20)]"
      />
    </div>
  );
}

function NavPill({
  href,
  label,
  tone = "default",
}: {
  href: string;
  label: string;
  tone?: "default" | "rose" | "sage";
}) {
  const toneClassName = {
    default: "text-[#6E6765] bg-[rgba(255,252,250,0.66)]",
    rose: "text-[#7B5B67] bg-[rgba(255,245,248,0.72)]",
    sage: "text-[#5F7960] bg-[rgba(245,252,246,0.72)]",
  }[tone];

  return (
    <Link
      href={href}
      className={`rounded-full border border-[rgba(255,255,255,0.32)] px-5 py-3 text-sm shadow-[0_10px_24px_rgba(116,104,97,0.08)] backdrop-blur-sm transition hover:bg-[rgba(255,255,255,0.82)] ${toneClassName}`}
    >
      {label}
    </Link>
  );
}

function BaseModal({
  open,
  title,
  subtitle,
  children,
  onClose,
  zIndexClassName = "z-50",
}: {
  open: boolean;
  title: string;
  subtitle: string;
  children: ReactNode;
  onClose: () => void;
  zIndexClassName?: string;
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 ${zIndexClassName} flex items-center justify-center bg-[rgba(58,44,39,0.24)] px-4 py-6 backdrop-blur-[3px]`}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-[30px] bg-[rgba(255,249,242,0.97)] shadow-[0_24px_60px_rgba(83,64,46,0.18)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="border-b border-[rgba(205,186,166,0.24)] bg-[rgba(255,249,242,0.98)] px-6 py-5 sm:px-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#9B7E60]">小屋互动</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#5D5148]">
                {title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[#6F625A]">{subtitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-[#F0E3D3] px-4 py-2 text-sm text-[#65584D] transition hover:bg-[#EAD8C2]"
            >
              返回我的小屋
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-7">
          <div className="space-y-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

function FullscreenModal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] overflow-y-auto bg-[rgba(48,36,31,0.34)] px-4 py-6 backdrop-blur-md sm:px-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="mx-auto max-w-6xl rounded-[36px] border border-[rgba(255,255,255,0.24)] bg-[linear-gradient(180deg,rgba(255,250,246,0.95)_0%,rgba(247,241,236,0.95)_100%)] p-6 shadow-[0_30px_90px_rgba(83,64,46,0.24)] sm:p-8"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#9B7E60]">书桌展开视图</p>
            <h2 className="mt-2 text-[clamp(1.8rem,3vw,2.5rem)] font-semibold tracking-[-0.04em] text-[#5D5148]">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#F0E3D3] px-5 py-2.5 text-sm text-[#65584D] transition hover:bg-[#EAD8C2]"
          >
            返回书桌
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

function ModalSection({
  title,
  badge,
  children,
}: {
  title: string;
  badge: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-[rgba(205,186,166,0.24)] bg-white/70 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-[#5D5148]">{title}</h3>
        <SpaceBadge tone="amber">{badge}</SpaceBadge>
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function DeskActionCard({
  title,
  description,
  actionLabel,
  onClick,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onClick: () => void;
}) {
  return (
    <div className="rounded-[26px] border border-[rgba(188,176,203,0.16)] bg-[linear-gradient(180deg,rgba(248,245,251,0.96)_0%,rgba(241,235,248,0.92)_100%)] p-5 shadow-[0_18px_44px_rgba(109,87,97,0.05)]">
      <h3 className="text-lg font-semibold text-[#4F4255]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#6A5D70]">{description}</p>
      <div className="mt-5">
        <SpaceButton tone="lavender" onClick={onClick}>
          {actionLabel}
        </SpaceButton>
      </div>
    </div>
  );
}

function CommitmentCard({
  commitment,
  selected,
  onClick,
}: {
  commitment: CommitmentWithProgress;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[24px] border p-5 text-left transition ${
        selected
          ? "border-[rgba(157,123,134,0.28)] bg-[rgba(255,248,251,0.92)] shadow-[0_16px_34px_rgba(169,130,146,0.10)]"
          : "border-[rgba(182,162,169,0.12)] bg-[rgba(255,255,255,0.82)]"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h4 className="min-w-0 flex-1 text-base font-semibold text-[#4E3C44]">
          {commitment.title}
        </h4>
        <div className="flex shrink-0 items-center gap-2">
          <SpaceBadge tone={commitment.status === "completed" ? "amber" : "sage"}>
            {localizeCommitmentProgressStatus(commitment.status)}
          </SpaceBadge>
          <WitnessBadge count={commitment.witnessCount ?? 0} />
        </div>
      </div>
      <p className="mt-3 text-sm text-[#7a6972]">
        当前状态：{localizeCommitmentProgressStatus(commitment.status)}
      </p>
    </button>
  );
}

function RelationshipCard({
  entry,
  selected,
  description,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  primaryDisabled = false,
  secondaryDisabled = false,
}: {
  entry: SocialRelationshipEntry;
  selected: boolean;
  description: string;
  primaryActionLabel: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  primaryDisabled?: boolean;
  secondaryDisabled?: boolean;
}) {
  const canOpenProfile = Boolean(onPrimaryAction) && !primaryDisabled;

  return (
    <div
      className={`rounded-[24px] border px-4 py-4 transition ${
        selected
          ? "border-[rgba(157,123,134,0.28)] bg-[rgba(255,248,251,0.92)] shadow-[0_16px_34px_rgba(169,130,146,0.10)]"
          : "border-[rgba(182,162,169,0.12)] bg-[rgba(255,255,255,0.82)]"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {canOpenProfile ? (
          <button type="button" onClick={onPrimaryAction} className="min-w-0 flex-1 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-[#4E3C44]">{formatAddress(entry.address)}</p>
              <SpaceBadge tone={entry.isMutual ? "amber" : "lavender"}>
                {entry.isMutual ? "互相关注" : "单向关注"}
              </SpaceBadge>
            </div>
            <p className="mt-2 text-sm leading-7 text-[#6b5953]">{description}</p>
            <p className="mt-1 text-xs leading-6 text-[#8a7780]">
              {formatFollowTime(entry.followedAt)}
            </p>
          </button>
        ) : (
          <div className="min-w-0 flex-1 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-[#4E3C44]">{formatAddress(entry.address)}</p>
              <SpaceBadge tone={entry.isMutual ? "amber" : "lavender"}>
                {entry.isMutual ? "互相关注" : "单向关注"}
              </SpaceBadge>
            </div>
            <p className="mt-2 text-sm leading-7 text-[#6b5953]">{description}</p>
            <p className="mt-1 text-xs leading-6 text-[#8a7780]">
              {formatFollowTime(entry.followedAt)}
            </p>
          </div>
        )}
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={onPrimaryAction}
            disabled={primaryDisabled}
            className={`rounded-full border px-4 py-2 text-xs tracking-[0.12em] transition ${
              primaryDisabled
                ? "border-[rgba(185,133,154,0.16)] text-[#b29ca5] opacity-70"
                : "border-[rgba(157,123,134,0.24)] text-[#8d6d79] hover:bg-[rgba(255,247,250,0.92)]"
            }`}
          >
            {primaryActionLabel}
          </button>
          {secondaryActionLabel ? (
            <button
              type="button"
              onClick={onSecondaryAction}
              disabled={secondaryDisabled}
              className={`rounded-full border px-4 py-2 text-xs tracking-[0.12em] transition ${
                secondaryDisabled
                  ? "border-[rgba(185,133,154,0.16)] text-[#b29ca5] opacity-70"
                  : "border-[rgba(185,133,154,0.24)] text-[#8d6d79] hover:bg-[rgba(255,247,250,0.92)]"
              }`}
            >
              {secondaryActionLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FriendCommitmentCard({
  commitment,
  walletAddress,
  isWitnessPending,
  onWitness,
}: {
  commitment: CommitmentWithProgress;
  walletAddress?: string;
  isWitnessPending: boolean;
  onWitness: () => void;
}) {
  const normalizedWalletAddress = walletAddress?.toLowerCase() ?? "";
  const isOwnCommitment = Boolean(
    normalizedWalletAddress && commitment.creator.toLowerCase() === normalizedWalletAddress,
  );
  const hasWitnessed = Boolean(
    normalizedWalletAddress &&
      commitment.witnesses?.some((item) => item.address.toLowerCase() === normalizedWalletAddress),
  );
  const canWitness =
    Boolean(walletAddress) &&
    Number.isFinite(commitment.id) &&
    commitment.active &&
    !isOwnCommitment &&
    !hasWitnessed &&
    !isWitnessPending;
  const witnessButtonLabel = isWitnessPending
    ? "见证中..."
    : hasWitnessed
      ? "已见证"
      : isOwnCommitment
        ? "不能见证自己"
        : !commitment.active
          ? "约定已结束"
          : "见证";
  const witnessHint = hasWitnessed
    ? "你已经为这条约定留下过见证。"
    : !walletAddress
      ? "请先连接钱包，再发起见证。"
    : isOwnCommitment
      ? "自己的约定不能再次由自己见证。"
      : !Number.isFinite(commitment.id)
        ? "当前约定缺少有效 commitmentId，暂时无法见证。"
      : !commitment.active
        ? "约定结束后暂不支持新增见证。"
        : "点击后会调用新的 V2 witness 合约并等待 MetaMask 确认。";

  return (
    <div className="rounded-[24px] border border-[rgba(182,162,169,0.12)] bg-[rgba(255,255,255,0.82)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-base font-semibold text-[#4E3C44]">{commitment.title}</h4>
          <p className="mt-2 text-sm leading-7 text-[#6b5953]">
            创建者：{formatAddress(commitment.creator)}
          </p>
        </div>
        <SpaceBadge tone={commitment.active ? "sage" : "amber"}>
          {commitment.active ? "进行中" : "已结束"}
        </SpaceBadge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <InfoCard label="约定天数" value={`${commitment.durationDays} 天`} />
        <InfoCard label="进度" value={commitment.progressText} />
        <InfoCard label="状态字段" value={commitment.active ? "active" : "inactive"} />
        <InfoCard label="见证人数" value={`${commitment.witnessCount ?? 0} 人`} />
        <InfoCard
          label="创建时间"
          value={formatCommitmentDate(commitment.createdAt)}
        />
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-7 text-[#7a6972]">
          当前展示来自 V1 commitment 真实读取，不使用 mock 数据。
        </p>
        <button
          type="button"
          disabled={!canWitness}
          onClick={onWitness}
          title={witnessHint}
          className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
            canWitness
              ? "bg-[rgba(205,186,219,0.9)] text-[#6d5c78] shadow-[0_10px_24px_rgba(140,119,151,0.12)] hover:bg-[rgba(198,176,214,0.96)]"
              : "bg-[rgba(210,201,214,0.72)] text-[#7a6d80] opacity-70"
          }`}
        >
          {witnessButtonLabel}
        </button>
      </div>

      <p className="mt-3 text-xs leading-6 text-[#8a7780]">
        {witnessHint}
      </p>
    </div>
  );
}

function CheckInCard({ checkIn }: { checkIn: CheckIn }) {
  return (
    <div className="rounded-[22px] border border-[rgba(181,160,168,0.12)] bg-[rgba(255,255,255,0.82)] px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SpaceBadge tone="lavender">{checkIn.mood}</SpaceBadge>
        <p className="text-xs tracking-[0.08em] text-[#8a7780]">{formatCheckInTime(checkIn.createdAt)}</p>
      </div>
      <p className="mt-3 text-sm leading-7 text-[#5f4b54]">{checkIn.content}</p>
      {checkIn.proofURI ? (
        <p className="mt-3 text-sm text-[#78656d]">凭证：{checkIn.proofURI}</p>
      ) : null}
    </div>
  );
}

function CardPanel({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[30px] border border-[rgba(182,162,169,0.12)] bg-[rgba(255,255,255,0.72)] p-5 shadow-[0_18px_44px_rgba(109,87,97,0.05)] sm:p-6">
      <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[#967684]">{eyebrow}</p>
      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#4E3C44]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#685760]">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-[rgba(181,160,168,0.12)] bg-[rgba(255,255,255,0.82)] px-5 py-4">
      <p className="text-[0.72rem] uppercase tracking-[0.16em] text-[#9d7786]">{label}</p>
      <p className="mt-2 text-sm leading-7 text-[#5f4b54]">{value}</p>
    </div>
  );
}

function formatCheckInTime(value: number) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatFollowTime(value: number) {
  if (!value) {
    return "关系时间暂不可用";
  }

  const diff = Date.now() - value;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < hour) {
    return "最近关注";
  }

  if (diff < day) {
    return `${Math.max(1, Math.floor(diff / hour))} 小时前关注`;
  }

  return `${Math.max(1, Math.floor(diff / day))} 天前关注`;
}
