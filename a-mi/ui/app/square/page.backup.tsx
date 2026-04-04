"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const notices = [
  "New amies can begin their first promise today.",
  "The weekend garden circle opens softly at 7 PM.",
  "Check in gently to keep your growth visible.",
];

export default function SquarePage() {
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);

  return (
    <>
      <main className="min-h-screen overflow-hidden bg-[#F7F3EF] text-[#5F5A5A]">
        <div className="relative mx-auto min-h-screen w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[42%] bg-[linear-gradient(180deg,#FDFBFA_0%,#F8F3F3_45%,rgba(247,243,239,0)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-[55%] bg-[linear-gradient(180deg,rgba(232,245,233,0.14)_0%,rgba(232,245,233,0.34)_45%,rgba(255,243,224,0.46)_100%)]" />
            <div className="absolute left-[-8%] top-[6%] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(252,228,236,0.85),rgba(252,228,236,0)_72%)] blur-2xl" />
            <div className="absolute right-[-6%] top-[12%] h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(232,222,248,0.8),rgba(232,222,248,0)_72%)] blur-2xl" />
            <div className="absolute left-[18%] bottom-[8%] h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(232,245,233,0.85),rgba(232,245,233,0)_72%)] blur-2xl" />
            <div className="absolute right-[10%] bottom-[6%] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,243,224,0.8),rgba(255,243,224,0)_72%)] blur-2xl" />
          </div>

          <div className="relative z-10 flex items-center justify-between px-1 py-1">
            <div className="rounded-full border border-white/60 bg-white/55 px-4 py-2 text-sm uppercase tracking-[0.22em] text-[#8A7780] shadow-[0_10px_30px_rgba(140,128,130,0.08)] backdrop-blur-md">
              a.mi square
            </div>
            <Link
              href="/"
              className="rounded-full border border-white/60 bg-white/55 px-4 py-2 text-sm text-[#756D70] shadow-[0_10px_30px_rgba(140,128,130,0.06)] transition duration-300 hover:-translate-y-0.5 hover:bg-white/75"
            >
              Back to a.mi landing
            </Link>
          </div>

          <section className="relative mt-4 min-h-[840px] overflow-hidden rounded-[36px] border border-white/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.42)_0%,rgba(255,255,255,0.2)_100%)] shadow-[0_30px_80px_rgba(126,118,120,0.08)] backdrop-blur-[6px] sm:min-h-[900px] lg:min-h-[960px]">
            <CloudStatus />

            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-[8%] top-[16%] h-64 w-[28rem] rounded-[48%] bg-[#FCE4EC]/22 blur-3xl" />
              <div className="absolute left-[27%] top-[42%] h-80 w-[42rem] rounded-[48%] bg-[#E8F5E9]/20 blur-3xl" />
              <div className="absolute right-[8%] bottom-[6%] h-72 w-[34rem] rounded-[48%] bg-[#FFF3E0]/22 blur-3xl" />
            </div>

            <div className="pointer-events-none absolute inset-0 hidden md:block">
              <svg
                viewBox="0 0 1200 900"
                className="absolute inset-0 h-full w-full"
                aria-hidden="true"
              >
                <path
                  d="M 610 520 C 566 492, 492 448, 416 396 C 350 350, 280 290, 214 236"
                  fill="none"
                  stroke="rgba(255,243,224,0.88)"
                  strokeWidth="54"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 618 536 C 682 578, 758 638, 836 708 C 885 752, 922 780, 966 804"
                  fill="none"
                  stroke="rgba(255,243,224,0.88)"
                  strokeWidth="58"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <div className="absolute left-[13%] top-[25%] h-20 w-[19%] rounded-[48%] border border-[#EAD8CD]/52 bg-[#FFF3E0]/78 shadow-[inset_0_2px_10px_rgba(255,255,255,0.8),0_10px_24px_rgba(181,160,149,0.08)]" />
              <div className="absolute left-[35%] top-[49%] h-32 w-[32%] rounded-[49%] border border-[#DCE9D7]/58 bg-[#E8F5E9]/82 shadow-[inset_0_2px_12px_rgba(255,255,255,0.84),0_14px_28px_rgba(156,177,149,0.1)]" />
              <div className="absolute right-[13%] bottom-[9%] h-24 w-[24%] rounded-[49%] border border-[#DDD2E8]/56 bg-[#E8DEF8]/82 shadow-[inset_0_2px_12px_rgba(255,255,255,0.84),0_14px_28px_rgba(160,145,182,0.1)]" />
              <div className="absolute right-[10%] top-[24%] h-14 w-[9%] rounded-[46%] border border-[#EAD8CD]/48 bg-[#FFF3E0]/78 shadow-[inset_0_2px_8px_rgba(255,255,255,0.8),0_8px_18px_rgba(181,160,149,0.08)]" />
            </div>

            <div className="relative h-full min-h-[840px] sm:min-h-[900px] lg:min-h-[960px]">
              <Link
                href="/study"
                className="group absolute left-[6%] top-[18%] z-20 w-[18.5%] min-w-[175px] max-w-[235px] transition duration-500 hover:-translate-y-2 hover:scale-[1.02]"
              >
                <div className="relative">
                  <Image
                    src="/assets/world/buildings/study-hall.png"
                    alt="Study Hall"
                    width={520}
                    height={520}
                    className="relative z-10 h-auto w-full drop-shadow-[0_22px_34px_rgba(153,129,118,0.2)] transition duration-500 group-hover:drop-shadow-[0_28px_40px_rgba(153,129,118,0.24)]"
                    priority
                  />
                </div>
                <span className="mt-5 block text-center text-sm font-medium tracking-[0.14em] text-[#7D6861]">
                  Study Hall
                </span>
              </Link>

              <Link
                href="/garden"
                className="group absolute left-1/2 top-[31%] z-30 w-[26%] min-w-[220px] max-w-[340px] -translate-x-1/2 transition duration-500 hover:-translate-y-2 hover:scale-[1.02]"
              >
                <div className="relative">
                  <Image
                    src="/assets/world/buildings/garden-club.png"
                    alt="Garden Club"
                    width={640}
                    height={640}
                    className="relative z-10 h-auto w-full drop-shadow-[0_22px_36px_rgba(127,159,121,0.22)] transition duration-500 group-hover:drop-shadow-[0_28px_42px_rgba(127,159,121,0.26)]"
                    priority
                  />
                </div>
                <span className="mt-5 block text-center text-sm font-medium tracking-[0.14em] text-[#688066]">
                  Garden Club
                </span>
              </Link>

              <button
                type="button"
                onClick={() => setIsNoticeOpen(true)}
                className="group absolute right-[9%] top-[22%] z-20 w-[10%] min-w-[105px] max-w-[145px] transition duration-500 hover:-translate-y-2 hover:scale-[1.02]"
              >
                <div className="relative mx-auto h-28 w-full max-w-[110px]">
                  <Image
                    src="/assets/world/buildings/notice-board.png"
                    alt="Notice Board"
                    fill
                    className="object-contain drop-shadow-[0_18px_28px_rgba(145,121,96,0.18)] transition duration-500 group-hover:drop-shadow-[0_24px_34px_rgba(145,121,96,0.22)]"
                  />
                </div>
                <span className="mt-5 block text-center text-sm font-medium tracking-[0.14em] text-[#8A7054]">
                  Notice Board
                </span>
              </button>

              <Link
                href="/profile"
                className="group absolute bottom-[6%] right-[8%] z-30 w-[23%] min-w-[205px] max-w-[300px] transition duration-500 hover:-translate-y-2 hover:scale-[1.03]"
              >
                <div className="relative">
                  <Image
                    src="/assets/world/buildings/my-cottage.png"
                    alt="My Cottage"
                    width={560}
                    height={560}
                    className="relative z-10 h-auto w-full drop-shadow-[0_24px_38px_rgba(145,124,165,0.22)] transition duration-500 group-hover:drop-shadow-[0_30px_46px_rgba(145,124,165,0.26)]"
                    priority
                  />
                </div>
                <span className="mt-5 block text-center text-sm font-medium tracking-[0.14em] text-[#877694]">
                  My Cottage
                </span>
              </Link>
            </div>
          </section>
        </div>
      </main>

      {isNoticeOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(95,90,90,0.18)] px-6 backdrop-blur-sm"
          onClick={() => setIsNoticeOpen(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-md rounded-[32px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,247,238,0.96)_0%,rgba(255,252,249,0.94)_100%)] p-6 shadow-[0_28px_60px_rgba(160,138,112,0.14)]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="notice-board-title"
          >
            <p className="text-[0.72rem] uppercase tracking-[0.2em] text-[#A2856A]">
              Notice Board
            </p>
            <h2
              id="notice-board-title"
              className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#665C57]"
            >
              Notes Around the Square
            </h2>
            <div className="mt-5 space-y-3">
              {notices.map((notice) => (
                <div
                  key={notice}
                  className="rounded-[18px] bg-white/70 px-4 py-3 text-sm leading-6 text-[#706763] shadow-[0_10px_24px_rgba(184,166,145,0.08),inset_0_1px_4px_rgba(255,255,255,0.72)]"
                >
                  {notice}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIsNoticeOpen(false)}
              className="mt-5 inline-flex rounded-full bg-white/72 px-5 py-2.5 text-sm text-[#7B6D62] shadow-[0_10px_24px_rgba(184,166,145,0.08),inset_0_1px_4px_rgba(255,255,255,0.76)] transition hover:bg-white"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function CloudStatus() {
  return (
    <div className="group absolute left-1/2 top-4 z-30 -translate-x-1/2">
      <div className="relative h-[160px] w-[min(94vw,560px)] transition duration-500 group-hover:-translate-y-1 group-hover:scale-[1.02]">
        <Image
          src="/assets/world/ui/cloud.png"
          alt="Cloud status"
          fill
          className="object-contain drop-shadow-[0_18px_28px_rgba(180,168,172,0.14)] transition duration-500 group-hover:drop-shadow-[0_24px_36px_rgba(180,168,172,0.18)]"
          priority
        />
        <div className="relative flex h-full flex-col items-center justify-center px-20 pb-2 text-center text-[#756D70] sm:px-24">
          <p className="text-sm font-medium tracking-[0.06em] sm:text-[0.98rem]">
            Today · 2026-04-01
          </p>
          <p className="mt-1 text-sm tracking-[0.08em] text-[#7B8F74] sm:text-[0.94rem]">
            128 amies online
          </p>
        </div>
      </div>
    </div>
  );
}
