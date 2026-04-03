"use client";

import { FormEvent, useState } from "react";
import {
  SpaceBadge,
  SpaceButton,
  SpaceField,
  SpaceInput,
  SpaceListItem,
  SpacePageShell,
  SpacePanel,
  SpaceSectionTitle,
  SpaceSelect,
  SpaceTextarea,
} from "../components/space-shell";

const GARDEN_CHECKIN_STORAGE_KEY = "ami-garden-checkin";

type GardenCheckIn = {
  activityName: string;
  moodToday: string;
  note: string;
  createdAt: string;
};

const gardenStats = [
  { label: "Online In Garden", value: "26 amies", hint: "The paths are lively but still soft." },
  { label: "Today’s Event", value: "Seed Swap", hint: "Starts near sunset in the glass room." },
  { label: "Shared Moments", value: "18 notes", hint: "Tiny updates left around the club." },
];

const activities = [
  {
    title: "Reading Corner",
    description: "Quiet pages, soft curiosity, and stories kept close to the window seat.",
    meta: "6 amies here",
  },
  {
    title: "Creative Table",
    description: "Journaling, collage, sketching, and little experiments after lunch.",
    meta: "9 amies here",
  },
  {
    title: "Movement Path",
    description: "Stretching, walking, and easy body rhythms among the planters.",
    meta: "4 amies here",
  },
];

const recentGardenUpdates = [
  {
    title: "Mina shared a pressed flower note",
    description: "Left a small thank-you note after finishing her weekly sketch streak.",
    meta: "4 min ago",
  },
  {
    title: "A tea circle opened by the west arch",
    description: "A few members gathered to swap cozy hobby prompts for tonight.",
    meta: "17 min ago",
  },
  {
    title: "Tonight’s reminder pinned",
    description: "Bring one soft thing you made or read if you join the seed swap.",
    meta: "Today",
  },
];

const tips = [
  "Growth here does not have to look ambitious.",
  "One small hobby moment still belongs in the garden.",
  "If energy is low, keep only the gentlest part of the ritual.",
];

export default function GardenSpacePage() {
  const initialGardenLog = getInitialGardenLog();
  const [activityName, setActivityName] = useState(initialGardenLog?.activityName ?? "");
  const [moodToday, setMoodToday] = useState(initialGardenLog?.moodToday ?? "Calm");
  const [note, setNote] = useState(initialGardenLog?.note ?? "");
  const [successMessage, setSuccessMessage] = useState("");
  const [savedLog, setSavedLog] = useState<GardenCheckIn | null>(initialGardenLog);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextLog: GardenCheckIn = {
      activityName,
      moodToday,
      note,
      createdAt: new Date().toISOString(),
    };

    window.sessionStorage.setItem(GARDEN_CHECKIN_STORAGE_KEY, JSON.stringify(nextLog));
    setSavedLog(nextLog);
    setSuccessMessage("Your garden moment has been tucked into today’s path.");
  };

  return (
    <SpacePageShell
      eyebrow="a.mi square · Garden Club"
      title="Garden Club"
      description="A light social space for hobbies, shared notes, and low-pressure moments that still feel alive. The club should feel visited, not empty."
      status="Club Paths Open"
      meta={["Greenhouse windows are open", "Best for hobby updates and shared notes", "Tonight’s seed swap starts later"]}
      stats={gardenStats}
      navLinks={[
        { href: "/square", label: "Back to a.mi square" },
        { href: "/study", label: "Visit Study Hall", tone: "rose" },
        { href: "/profile", label: "Go to My Cottage", tone: "lavender" },
      ]}
      aside={
        <>
          <SpacePanel tone="amber">
            <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[#af9661]">
              Garden Thought
            </p>
            <div className="mt-5 space-y-3">
              {tips.map((tip) => (
                <div
                  key={tip}
                  className="rounded-[20px] border border-[rgba(221,207,174,0.14)] bg-[rgba(255,251,246,0.82)] px-4 py-3 text-sm leading-7 text-[#736248]"
                >
                  {tip}
                </div>
              ))}
            </div>
          </SpacePanel>

          <SpacePanel tone="rose">
            <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[#9a7e8d]">
              Today’s Club Event
            </p>
            <h3 className="mt-3 text-xl font-semibold text-[#4e3942]">Seed Swap At Dusk</h3>
            <p className="mt-3 text-sm leading-7 text-[#6e5962]">
              Bring one recommendation, one handmade thing, or just yourself. The event is small on purpose.
            </p>
            <div className="mt-5 rounded-[22px] border border-[rgba(201,174,186,0.14)] bg-[rgba(255,255,255,0.62)] px-4 py-4 text-sm leading-7 text-[#695860]">
              19:00 · West greenhouse table · 11 replies so far
            </div>
          </SpacePanel>

          <SpacePanel tone="lavender">
            <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[#8f7aa0]">
              Greenhouse Memory
            </p>
            <p className="mt-4 text-sm leading-7 text-[#6d5f79]">
              {savedLog
                ? `Saved moment: ${savedLog.activityName || "A quiet hobby moment"} · ${savedLog.moodToday}`
                : "Your latest garden log will rest here, like a pressed leaf kept between gentle pages."}
            </p>
          </SpacePanel>
        </>
      }
    >
      <SpacePanel tone="sage">
        <SpaceSectionTitle
          eyebrow="Today’s Garden Log"
          title="Leave a small note before you wander"
          action={<SpaceBadge tone="sage">Soft Club Room</SpaceBadge>}
        />

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <SpaceField label="Activity Name">
            <SpaceInput
              type="text"
              value={activityName}
              onChange={(event) => setActivityName(event.target.value)}
              placeholder="Journaling, drawing, reading, dancing..."
            />
          </SpaceField>

          <div className="grid gap-4 md:grid-cols-[0.7fr_1.3fr]">
            <SpaceField label="Mood Today">
              <SpaceSelect
                value={moodToday}
                onChange={(event) => setMoodToday(event.target.value)}
                className="focus:border-[rgba(128,166,120,0.4)]"
              >
                <option>Calm</option>
                <option>Curious</option>
                <option>Playful</option>
                <option>Tired but here</option>
                <option>Softly happy</option>
              </SpaceSelect>
            </SpaceField>

            <SpaceField label="Small Note">
              <SpaceTextarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="What kind of little moment would you like to keep in the garden today?"
                rows={4}
                className="focus:border-[rgba(128,166,120,0.4)]"
              />
            </SpaceField>
          </div>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <SpaceButton type="submit" tone="sage">
              Log Today’s Moment
            </SpaceButton>
            <p className="text-sm leading-7 text-[#627363]">
              {successMessage || "The garden likes small updates too."}
            </p>
          </div>
        </form>
      </SpacePanel>

      <SpacePanel>
        <SpaceSectionTitle
          eyebrow="Garden Corners"
          title="Three places that feel lived in today"
          action={<SpaceBadge tone="amber">Light social</SpaceBadge>}
        />
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {activities.map((activity) => (
            <SpaceListItem
              key={activity.title}
              title={activity.title}
              description={activity.description}
              meta={activity.meta}
            />
          ))}
        </div>
      </SpacePanel>

      <SpacePanel tone="lavender">
        <SpaceSectionTitle
          eyebrow="Recent Garden Updates"
          title="What the club has been sharing"
          action={<SpaceBadge tone="lavender">Live board</SpaceBadge>}
        />
        <div className="mt-5 space-y-3">
          {recentGardenUpdates.map((update) => (
            <SpaceListItem
              key={update.title}
              title={update.title}
              description={update.description}
              meta={update.meta}
            />
          ))}
        </div>
      </SpacePanel>
    </SpacePageShell>
  );
}

function getInitialGardenLog() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedLog = window.sessionStorage.getItem(GARDEN_CHECKIN_STORAGE_KEY);

  if (!storedLog) {
    return null;
  }

  try {
    return JSON.parse(storedLog) as GardenCheckIn;
  } catch {
    window.sessionStorage.removeItem(GARDEN_CHECKIN_STORAGE_KEY);
    return null;
  }
}
