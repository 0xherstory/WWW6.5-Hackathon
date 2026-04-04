"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  SpaceBadge,
  SpaceButton,
  SpaceField,
  SpaceInput,
  SpacePageShell,
  SpacePanel,
  SpaceSectionTitle,
  SpaceTextarea,
} from "../components/space-shell";
import { COMMITMENT_STORAGE_KEY, useTownSnapshot } from "../lib/ami-world";

export default function CreateViewPage() {
  const router = useRouter();
  const townSnapshot = useTownSnapshot();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [buddy, setBuddy] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const draftCommitment = {
      title,
      description,
      duration,
      buddy,
      createdAt: new Date().toISOString(),
      status: "Active",
    };

    window.sessionStorage.setItem(COMMITMENT_STORAGE_KEY, JSON.stringify(draftCommitment));
    router.push("/profile");
  };

  return (
    <SpacePageShell
      eyebrow="a.mi square · Promise Desk"
      title="Create A Promise"
      description="Write one gentle but serious short-term goal you want to keep close, then let it become part of your room and your path through town."
      status="Desk Ready"
      meta={[
        `Current town focus: ${townSnapshot.studyGoal}`,
        "This is still a mock flow for now",
        "Your room will update after you place this promise",
      ]}
      stats={[
        { label: "Town Online", value: `${townSnapshot.totalOnline} amies`, hint: "The square still feels softly active." },
        { label: "Current Streak", value: `${townSnapshot.profileStreak} days`, hint: "Your room will keep tracking this." },
        { label: "Latest Club Mood", value: townSnapshot.gardenMood, hint: "A small note from Garden Club." },
      ]}
      navLinks={[
        { href: "/square", label: "Back to a.mi square" },
        { href: "/study", label: "Visit Study Hall", tone: "rose" },
        { href: "/garden", label: "Visit Garden Club", tone: "sage" },
        { href: "/profile", label: "Go to My Cottage", tone: "lavender" },
      ]}
      aside={
        <>
          <SpacePanel tone="amber">
            <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[#af9661]">
              Promise Hint
            </p>
            <p className="mt-4 text-sm leading-7 text-[#6d5a4c]">
              The best promise here is usually small enough to return to, but real enough that you want it to change your days.
            </p>
          </SpacePanel>

          <SpacePanel tone="lavender">
            <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[#8f7aa0]">
              Where It Goes Next
            </p>
            <div className="mt-5 space-y-3">
              <div className="rounded-[22px] border border-[rgba(183,165,190,0.12)] bg-[rgba(255,255,255,0.66)] px-4 py-4 text-sm leading-7 text-[#695c74]">
                Your cottage will show the promise title, duration, buddy, and current status.
              </div>
              <div className="rounded-[22px] border border-[rgba(183,165,190,0.12)] bg-[rgba(255,255,255,0.66)] px-4 py-4 text-sm leading-7 text-[#695c74]">
                The square can then hint that your room is active, so the town feels more connected.
              </div>
            </div>
          </SpacePanel>
        </>
      }
    >
      <SpacePanel>
        <SpaceSectionTitle
          eyebrow="Promise Desk"
          title="Set one intention into the room"
          action={<SpaceBadge tone="rose">Mock Flow</SpaceBadge>}
        />

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <SpaceField label="Title">
            <SpaceInput
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="For example: Walk 20 minutes every morning"
            />
          </SpaceField>

          <SpaceField label="Description">
            <SpaceTextarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="A few words about why this matters to you right now."
              rows={5}
            />
          </SpaceField>

          <div className="grid gap-4 md:grid-cols-2">
            <SpaceField label="Duration">
              <SpaceInput
                type="text"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                placeholder="7 days, 2 weeks, 1 month..."
              />
            </SpaceField>

            <SpaceField label="Buddy (optional)">
              <SpaceInput
                type="text"
                value={buddy}
                onChange={(event) => setBuddy(event.target.value)}
                placeholder="A friend, ENS, or wallet name"
              />
            </SpaceField>
          </div>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <SpaceButton type="submit">Create Commitment</SpaceButton>
            <Link
              href="/profile"
              className="text-sm leading-7 text-[#7d6771] underline decoration-[rgba(125,103,113,0.3)] underline-offset-4"
            >
              Or return to your cottage first
            </Link>
          </div>
        </form>
      </SpacePanel>
    </SpacePageShell>
  );
}
