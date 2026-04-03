"use client";

import Link from "next/link";
import { useEffect } from "react";
import PageWalletBar from "@/components/PageWalletBar";
import MusicFloatingToggle from "@/components/MusicFloatingToggle";
import { useBackgroundAudio } from "@/components/BackgroundAudioProvider";

export default function Home() {
  const { playTrack } = useBackgroundAudio();

  useEffect(() => {
    playTrack("home", {
      loop: true,
      reset: false,
    });
  }, [playTrack]);

  return (
    <main className="relative min-h-screen bg-[#f7f4ee] text-[#33413a]">
      <PageWalletBar />
      <MusicFloatingToggle track="home" />

      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-10 md:px-10 lg:px-16">
        <div className="mb-10 flex flex-col gap-4">
          <p className="text-sm uppercase tracking-[0.28em] text-[#7b8b7f]">
            Life &amp; Co-Existence
          </p>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-semibold md:text-6xl">
                HerRhythm
              </h1>
              <p className="mt-4 max-w-2xl text-base text-[#6b7a70] md:text-lg">
                给身体一点温柔的秩序。练习、呼吸、打卡，再收下一张属于今天的鼓励签。
              </p>
            </div>

            <div className="text-right leading-none text-[#b8c3b7]">
              <p className="font-serif text-[30px] italic tracking-[-0.02em]">
                gentle rhythm
              </p>
              <p className="mt-1 text-[13px] italic tracking-[0.08em] text-[#a8b3a7]">
                for body &amp; mind
              </p>
            </div>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-2">
          <Link
            href="/kegel"
            className="group relative overflow-hidden rounded-[32px] border border-[#d7dfd3] bg-gradient-to-br from-[#dfe9dc] via-[#edf3ea] to-[#f5f7f2] p-8 shadow-[0_12px_35px_rgba(97,122,101,0.10)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(97,122,101,0.14)]"
          >
            <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/35 blur-3xl transition group-hover:scale-110" />

            <div className="pointer-events-none absolute inset-0 flex items-center p-8">
              <div className="max-w-[75%] translate-y-6 text-5xl font-medium leading-[1.08] tracking-tight text-[#c7d3c6]/0 opacity-0 transition-all duration-500 group-hover:translate-y-10 group-hover:text-[#b8c7b6]/60 group-hover:opacity-100 md:text-6xl">
                把力量
                <br />
                轻轻
                <br />
                放回身体里
              </div>
            </div>

            <div className="relative flex h-full flex-col justify-between">
              <div>
                <span className="inline-flex rounded-full border border-white/50 bg-white/50 px-3 py-1 text-xs text-[#6b7a70]">
                  Kegel Exercise
                </span>

                <h2 className="mt-8 text-4xl font-semibold md:text-5xl">
                  凯格尔训练
                </h2>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <div className="flex gap-2 text-xs text-[#6b7a70]">
                  <span className="rounded-full bg-white/55 px-3 py-1">站姿</span>
                  <span className="rounded-full bg-white/55 px-3 py-1">坐姿</span>
                  <span className="rounded-full bg-white/55 px-3 py-1">卧姿</span>
                </div>

                <span className="text-sm font-medium">进入 →</span>
              </div>
            </div>
          </Link>

          <Link
            href="/breathing"
            className="group relative overflow-hidden rounded-[32px] border border-[#e4e7e1] bg-gradient-to-br from-[#f6f6f2] via-[#fafaf7] to-[#ffffff] p-8 shadow-[0_10px_30px_rgba(120,120,110,0.10)] transition duration-700 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(120,120,110,0.12)]"
          >
            <div className="absolute -left-12 top-10 h-44 w-44 rounded-full bg-white/40 blur-3xl transition group-hover:scale-110" />

            <div className="pointer-events-none absolute inset-0 flex items-center p-8">
              <div className="max-w-[75%] translate-y-8 text-5xl font-medium leading-[1.08] tracking-tight text-[#d8ddd5]/0 opacity-0 transition-all duration-500 group-hover:translate-y-10 group-hover:text-[#d8ddd5]/60 group-hover:opacity-100 md:text-6xl">
                让呼吸
                <br />
                带你
                <br />
                回到自己
              </div>
            </div>

            <div className="relative flex h-full flex-col justify-between">
              <div>
                <span className="inline-flex rounded-full border border-[#e3e6e0] bg-white/70 px-4 py-1.5 text-[11px] text-[#7a857c]">
                  Diaphragmatic Breathing
                </span>

                <h2 className="mt-8 text-4xl font-semibold md:text-5xl">
                  腹式呼吸
                </h2>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <div className="flex gap-2 text-xs text-[#7a857c]">
                  <span className="rounded-full bg-white/70 px-3 py-1">1 min</span>
                  <span className="rounded-full bg-white/70 px-3 py-1">3 min</span>
                  <span className="rounded-full bg-white/70 px-3 py-1">5 min</span>
                </div>

                <span className="text-sm font-medium">进入 →</span>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-8 border-t border-[#e2e6df] pt-6 text-center text-sm text-[#6b7a70]">
          <p>Breathing Practice · Kegel Exercise · Daily Check-In</p>
        </div>
      </section>
    </main>
  );
}