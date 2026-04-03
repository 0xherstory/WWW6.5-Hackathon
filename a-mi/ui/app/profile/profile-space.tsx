"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  SpaceBadge,
  SpaceButton,
  SpaceEmptyState,
  SpaceListItem,
  SpacePageShell,
  SpacePanel,
  SpaceSectionTitle,
} from "../components/space-shell";

const COMMITMENT_STORAGE_KEY = "girls-hour-commitment-draft";

type CommitmentDraft = {
  title?: string;
  description?: string;
  duration?: string;
  buddy?: string;
  status?: string;
  createdAt?: string;
};

const cottageStats = [
  { label: "Current Streak", value: "9 days", hint: "You have been showing up gently." },
  { label: "Study Hours", value: "27.5h", hint: "Collected across recent sessions." },
  { label: "Completed Rounds", value: "12", hint: "Small finishes still count as growth." },
];

const badges = [
  {
    title: "First Promise",
    description: "You made your room feel inhabited by naming one intention.",
    meta: "Earned",
  },
  {
    title: "Nine-Day Return",
    description: "A soft streak marker for returning again and again.",
    meta: "Current",
  },
  {
    title: "Study Lantern",
    description: "Awarded after several focused sessions in the hall.",
    meta: "Pinned",
  },
];

export default function ProfileSpacePage() {
  const [commitment, setCommitment] = useState<CommitmentDraft | null | undefined>(
    getInitialCommitment(),
  );

  const handleCheckIn = () => {
    if (!commitment) {
      return;
    }

    const nextCommitment = {
      ...commitment,
      status: "Checked In Today",
    };

    window.sessionStorage.setItem(COMMITMENT_STORAGE_KEY, JSON.stringify(nextCommitment));
    setCommitment(nextCommitment);
  };

  const recentActivity = useMemo(() => {
    const items = [
      {
        title: "Visited Study Hall",
        description: "Kept one calm focus block visible on the desk.",
        meta: "Today",
      },
      {
        title: "Left a note in Garden Club",
        description: "Saved a small hobby moment in the greenhouse log.",
        meta: "Yesterday",
      },
      {
        title: "Rearranged the room shelf",
        description: "Reviewed your promise details and checked your status.",
        meta: "Mar 31",
      },
    ];

    if (commitment?.status === "Checked In Today") {
      items.unshift({
        title: "Marked today in the cottage",
        description: "The wall calendar now shows that you came back today.",
        meta: "Just now",
      });
    }

    return items.slice(0, 4);
  }, [commitment?.status]);

  if (commitment === undefined) {
    return (
      <main className="min-h-screen bg-[#f4efe9] px-6 py-16 text-[#4e3c44]">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[36px] border border-[rgba(182,160,168,0.14)] bg-[rgba(255,252,249,0.8)] p-8 shadow-[0_22px_60px_rgba(105,82,92,0.08)]">
            <p className="text-sm text-[#8a747d]">Preparing your room...</p>
          </div>
        </div>
      </main>
    );
  }

  if (commitment === null) {
    return (
      <SpacePageShell
        eyebrow="a.mi square · My Cottage"
        title="My Cottage"
        description="Your own small room for promise-keeping, milestones, and traces of progress. It should still feel warm, even before the shelves fill up."
        status="Room Waiting"
        meta={["A window faces the square", "This space becomes more personal over time", "Create one promise to light the room"]}
        stats={cottageStats}
        navLinks={[
          { href: "/square", label: "Back to a.mi square" },
          { href: "/study", label: "Visit Study Hall", tone: "rose" },
          { href: "/garden", label: "Visit Garden Club", tone: "sage" },
          { href: "/create", label: "Create a New Promise", tone: "lavender" },
        ]}
        aside={
          <>
            <SpacePanel tone="amber">
              <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[#af9661]">
                Empty Shelf
              </p>
              <p className="mt-4 text-sm leading-7 text-[#6d5a4c]">
                Witness notes, support, and small rewards will gather here once your room begins to fill.
              </p>
            </SpacePanel>

            <SpacePanel tone="lavender">
              <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[#8f7aa0]">
                Room Mood
              </p>
              <p className="mt-4 text-sm leading-7 text-[#6d5f79]">
                The cottage is quiet right now, but it already belongs to you. It only needs one intention to begin feeling lived in.
              </p>
            </SpacePanel>
          </>
        }
      >
        <SpacePanel>
          <SpaceSectionTitle
            eyebrow="Welcome Home"
            title="This room is ready for its first promise"
            action={<SpaceBadge tone="rose">Soft Start</SpaceBadge>}
          />
          <div className="mt-6">
            <SpaceEmptyState
              title="No promise found yet"
              description="Start with one gentle thing you want to keep close. The cottage will begin to remember your progress from there."
              action={
                <Link href="/create">
                  <SpaceButton>Create Your First Promise</SpaceButton>
                </Link>
              }
            />
          </div>
        </SpacePanel>
      </SpacePageShell>
    );
  }

  const profileStats = [
    { label: "Current Streak", value: commitment.status === "Checked In Today" ? "10 days" : "9 days", hint: "Your room is tracking your return." },
    ...cottageStats.slice(1),
  ];

  return (
    <SpacePageShell
      eyebrow="a.mi square · My Cottage"
      title="My Cottage"
      description="A warm personal room for identity, promise-keeping, and small records of growth. This page should feel like yours, not like a dashboard."
      status={commitment.status || "Active"}
      meta={["The desk is by the window", "Keeps personal progress and small keepsakes", "Best for checking your own rhythm"]}
      stats={profileStats}
      navLinks={[
        { href: "/square", label: "Back to a.mi square" },
        { href: "/study", label: "Visit Study Hall", tone: "rose" },
        { href: "/garden", label: "Visit Garden Club", tone: "sage" },
        { href: "/create", label: "Create a New Promise", tone: "lavender" },
      ]}
      aside={
        <>
          <SpacePanel tone="rose">
            <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[#b07b8d]">
              Check-In Corner
            </p>
            <h3 className="mt-3 text-xl font-semibold text-[#4e3942]">Mark today softly</h3>
            <p className="mt-3 text-sm leading-7 text-[#6e5962]">
              A small mark on the wall to show that you returned to your promise today.
            </p>
            <div className="mt-6">
              <SpaceButton type="button" onClick={handleCheckIn}>
                Check In Today
              </SpaceButton>
            </div>
          </SpacePanel>

          <SpacePanel tone="amber">
            <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[#af9661]">
              Recent Keepsakes
            </p>
            <div className="mt-5 space-y-3">
              {badges.map((badge) => (
                <SpaceListItem
                  key={badge.title}
                  title={badge.title}
                  description={badge.description}
                  meta={badge.meta}
                />
              ))}
            </div>
          </SpacePanel>

          <SpacePanel tone="lavender">
            <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[#8f7aa0]">
              Room Note
            </p>
            <p className="mt-4 text-sm leading-7 text-[#6d5f79]">
              Your cottage gets warmer each time you return. The point is not to look impressive, only to look inhabited.
            </p>
          </SpacePanel>
        </>
      }
    >
      <SpacePanel>
        <SpaceSectionTitle
          eyebrow="Resident Card"
          title="A small introduction to this room"
          action={<SpaceBadge tone="lavender">Resident</SpaceBadge>}
        />
        <div className="mt-6 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[28px] border border-[rgba(187,168,178,0.14)] bg-[rgba(255,255,255,0.6)] p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[24px] bg-[linear-gradient(180deg,#f7dbe3_0%,#ecdff3_100%)] text-2xl font-semibold text-[#765766] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
                A
              </div>
              <div>
                <p className="text-lg font-semibold text-[#4a3941]">Ami Willow</p>
                <p className="mt-1 text-sm leading-6 text-[#736169]">
                  Quiet learner · Cottage keeper · Softly building momentum
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <ProfileNote label="Promise Title" value={commitment.title || "Untitled promise"} />
            <ProfileNote label="Duration" value={commitment.duration || "Not set yet"} />
            <ProfileNote label="Buddy" value={commitment.buddy?.trim() || "Not set yet"} />
            <ProfileNote label="Status" value={commitment.status || "Active"} />
          </div>
        </div>

        <div className="mt-4 rounded-[24px] border border-[rgba(182,162,169,0.12)] bg-[rgba(255,255,255,0.58)] px-5 py-4">
          <p className="text-[0.72rem] uppercase tracking-[0.16em] text-[#9d7786]">Promise Description</p>
          <p className="mt-2 text-sm leading-7 text-[#5f4b54]">
            {commitment.description || "A gentle intention is waiting to be written here."}
          </p>
        </div>
      </SpacePanel>

      <SpacePanel tone="lavender">
        <SpaceSectionTitle
          eyebrow="Recent Activity"
          title="The last few traces left in the room"
          action={<SpaceBadge tone="rose">Personal log</SpaceBadge>}
        />
        <div className="mt-5 space-y-3">
          {recentActivity.map((item) => (
            <SpaceListItem
              key={`${item.title}-${item.meta}`}
              title={item.title}
              description={item.description}
              meta={item.meta}
            />
          ))}
        </div>
      </SpacePanel>
    </SpacePageShell>
  );
}

function getInitialCommitment() {
  if (typeof window === "undefined") {
    return undefined;
  }

  const storedValue = window.sessionStorage.getItem(COMMITMENT_STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as CommitmentDraft;
    return {
      ...parsedValue,
      status: parsedValue.status || "Active",
    };
  } catch {
    return null;
  }
}

function ProfileNote({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-[rgba(181,160,168,0.12)] bg-[rgba(255,255,255,0.66)] px-5 py-4">
      <p className="text-[0.72rem] uppercase tracking-[0.16em] text-[#9d7786]">{label}</p>
      <p className="mt-2 text-sm leading-7 text-[#5f4b54]">{value}</p>
    </div>
  );
}
