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

const STUDY_CHECKIN_STORAGE_KEY = "ami-study-checkin";

type StudyCheckIn = {
  goal: string;
  focusTime: string;
  note: string;
  createdAt: string;
};

const studyStats = [
  { label: "Today Focused", value: "2h 10m", hint: "A gentle pace, still visible." },
  { label: "Current Streak", value: "9 days", hint: "You have been returning softly." },
  { label: "Hall Mood", value: "14 amies", hint: "Studying in the room right now." },
];

const recentSessions = [
  {
    title: "Reading for treasury basics",
    description: "45 minutes of slow reading, with notes left beside the window.",
    meta: "Today · 08:20",
  },
  {
    title: "Revision round",
    description: "Wrapped one small topic before lunch and marked it complete.",
    meta: "Yesterday · 21:10",
  },
  {
    title: "Writing warm-up",
    description: "A short 25-minute session to get back into rhythm.",
    meta: "Mar 31 · 19:40",
  },
];

const gentleNotes = [
  "Small focus still counts in this room.",
  "You do not need to rush to be growing.",
  "A short return is better than waiting for a perfect day.",
];

const deskMoments = [
  {
    title: "Lamp Corner",
    description: "A warm light is set aside for your next deep-focus block.",
  },
  {
    title: "Peer Whisper",
    description: "Two amies just began a 30-minute reading sprint together.",
  },
  {
    title: "Today’s Hall Tip",
    description: "Choose one task small enough to finish before the tea cools.",
  },
];

export default function StudySpacePage() {
  const initialCheckIn = getInitialStudyCheckIn();
  const [goal, setGoal] = useState(initialCheckIn?.goal ?? "");
  const [focusTime, setFocusTime] = useState(initialCheckIn?.focusTime ?? "45 min");
  const [note, setNote] = useState(initialCheckIn?.note ?? "");
  const [successMessage, setSuccessMessage] = useState("");
  const [savedCheckIn, setSavedCheckIn] = useState<StudyCheckIn | null>(initialCheckIn);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextCheckIn: StudyCheckIn = {
      goal,
      focusTime,
      note,
      createdAt: new Date().toISOString(),
    };

    window.sessionStorage.setItem(STUDY_CHECKIN_STORAGE_KEY, JSON.stringify(nextCheckIn));
    setSavedCheckIn(nextCheckIn);
    setSuccessMessage("Your study desk has recorded today’s focus.");
  };

  return (
    <SpacePageShell
      eyebrow="a.mi square · Study Hall"
      title="Study Hall"
      description="A quiet room for learning, check-ins, and visible focus. This space keeps your study rhythm gentle, warm, and easy to return to."
      status="Quiet Session Open"
      meta={["Morning light in the east wing", "Best for study sprints and streaks", "Tea is still warm on the desk"]}
      stats={studyStats}
      navLinks={[
        { href: "/square", label: "Back to a.mi square" },
        { href: "/garden", label: "Visit Garden Club", tone: "sage" },
        { href: "/profile", label: "Go to My Cottage", tone: "lavender" },
      ]}
      aside={
        <>
          <SpacePanel tone="amber">
            <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[#b08d69]">
              Hall Notes
            </p>
            <div className="mt-5 space-y-3">
              {gentleNotes.map((entry) => (
                <div
                  key={entry}
                  className="rounded-[20px] border border-[rgba(214,197,174,0.14)] bg-[rgba(255,251,246,0.82)] px-4 py-3 text-sm leading-7 text-[#6d5a4c]"
                >
                  {entry}
                </div>
              ))}
            </div>
          </SpacePanel>

          <SpacePanel tone="sage">
            <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[#7c9975]">
              Around The Room
            </p>
            <div className="mt-5 space-y-3">
              {deskMoments.map((moment) => (
                <SpaceListItem
                  key={moment.title}
                  title={moment.title}
                  description={moment.description}
                />
              ))}
            </div>
          </SpacePanel>

          <SpacePanel tone="lavender">
            <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[#8f7aa0]">
              Desk Lamp Memory
            </p>
            <p className="mt-4 text-sm leading-7 text-[#6d5f79]">
              {savedCheckIn
                ? `Saved goal: ${savedCheckIn.goal || "A quiet focus session"} · ${savedCheckIn.focusTime}`
                : "Your latest check-in will rest here, so the hall remembers what you came to do."}
            </p>
          </SpacePanel>
        </>
      }
    >
      <SpacePanel>
        <SpaceSectionTitle
          eyebrow="Today’s Check-In Desk"
          title="Settle in before your focus begins"
          action={<SpaceBadge tone="rose">Study Ritual</SpaceBadge>}
        />

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <SpaceField label="Study Goal">
            <SpaceInput
              type="text"
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              placeholder="What would you like to keep your focus on today?"
            />
          </SpaceField>

          <div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
            <SpaceField label="Focus Time">
              <SpaceSelect
                value={focusTime}
                onChange={(event) => setFocusTime(event.target.value)}
              >
                <option>25 min</option>
                <option>45 min</option>
                <option>1 hour</option>
                <option>2 hours</option>
              </SpaceSelect>
            </SpaceField>

            <SpaceField label="Optional Note">
              <SpaceTextarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="A quiet note to leave on your desk before you begin."
                rows={4}
              />
            </SpaceField>
          </div>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <SpaceButton type="submit">Start Study Session</SpaceButton>
            <p className="text-sm leading-7 text-[#7d6771]">
              {successMessage || "Leave a small trace here before you begin."}
            </p>
          </div>
        </form>
      </SpacePanel>

      <SpacePanel tone="lavender">
        <SpaceSectionTitle
          eyebrow="Recent Learning Record"
          title="What the hall has seen lately"
          action={<SpaceBadge tone="lavender">3 latest</SpaceBadge>}
        />
        <div className="mt-5 space-y-3">
          {recentSessions.map((session) => (
            <SpaceListItem
              key={session.title}
              title={session.title}
              description={session.description}
              meta={session.meta}
            />
          ))}
        </div>
      </SpacePanel>
    </SpacePageShell>
  );
}

function getInitialStudyCheckIn() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedCheckIn = window.sessionStorage.getItem(STUDY_CHECKIN_STORAGE_KEY);

  if (!storedCheckIn) {
    return null;
  }

  try {
    return JSON.parse(storedCheckIn) as StudyCheckIn;
  } catch {
    window.sessionStorage.removeItem(STUDY_CHECKIN_STORAGE_KEY);
    return null;
  }
}
