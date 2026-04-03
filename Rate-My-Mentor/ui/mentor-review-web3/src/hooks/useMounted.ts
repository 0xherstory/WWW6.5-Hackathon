"use client";

import { useEffect, useState } from "react";

/** 避免钱包等客户端组件在 SSR 与首屏 hydration 不一致 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
