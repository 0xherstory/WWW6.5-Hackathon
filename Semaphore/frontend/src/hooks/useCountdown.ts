import { useEffect, useState } from "react";

import { formatCountdown } from "../lib/format";

export function useCountdown(endTime: number | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!endTime) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [endTime]);

  const label = endTime ? formatCountdown(endTime - now) : "";

  return {
    label,
    isExpired: label === "已过期",
  };
}
