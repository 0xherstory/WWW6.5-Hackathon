import { beforeEach, describe, expect, it } from "vitest";
import type { OnChainPact } from "@/hooks/usePactaChain";
import { getPactJournalMap, recordCheckinToJournal, syncPactsToJournal } from "@/lib/pactaJournal";

const wallet = "0x1111111111111111111111111111111111111111";

const basePact: OnChainPact = {
  id: 7n,
  user: wallet,
  habitName: "喝水",
  dailyStakeWei: 10000000000000000n,
  totalStakeWei: 140000000000000000n,
  frequency: 0n,
  startTime: 1711929600n,
  lastCheckin: 1712016000n,
  durationDays: 14n,
  checkinCount: 1n,
  streak: 1n,
  completed: false,
  claimed: false,
};

describe("pactaJournal", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("同步链上契约后可生成阶段总结", () => {
    syncPactsToJournal(wallet, [basePact]);

    const journalMap = getPactJournalMap(wallet, [basePact]);
    const snapshot = journalMap[basePact.id.toString()];

    expect(snapshot).toBeDefined();
    expect(snapshot.category).toBe("diet");
    expect(snapshot.checkinCount).toBe(1);
    expect(snapshot.summary).toContain("你已经坚持了 1 天");
    expect(snapshot.summary).toContain("微习惯");
  });

  it("打卡后会写入鼓励语并更新连续天数", () => {
    syncPactsToJournal(wallet, [basePact]);

    const result = recordCheckinToJournal(wallet, {
      ...basePact,
      lastCheckin: 1712102400n,
    });

    const snapshot = getPactJournalMap(wallet, [
      {
        ...basePact,
        lastCheckin: 1712102400n,
      },
    ])[basePact.id.toString()];

    expect(result?.encouragement).toBeTruthy();
    expect(result?.payload.wallet).toBe(wallet);
    expect(snapshot.checkinCount).toBe(3);
    expect(snapshot.latestEncouragement).toBe(result?.encouragement);
  });
});
