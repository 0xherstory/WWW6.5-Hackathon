import { lightTheme } from "thirdweb/react";

/**
 * 与月经小屋粉紫顶栏一致的 ConnectButton 主题（含已连接态背景色）。
 */
export const hutConnectTheme = lightTheme({
  colors: {
    primaryText: "#4c1d95",
    secondaryText: "rgba(159, 18, 57, 0.78)",
    accentText: "#9f1239",
    borderColor: "rgba(249, 168, 212, 0.92)",
    connectedButtonBg: "rgba(255, 255, 255, 0.78)",
    connectedButtonBgHover: "rgba(255, 247, 251, 0.95)",
    modalBg: "#fff7fb",
    modalOverlayBg: "rgba(76, 29, 149, 0.35)",
    tertiaryBg: "rgba(243, 232, 255, 0.55)",
    separatorLine: "rgba(249, 168, 212, 0.5)",
    primaryButtonBg: "#d946ef",
    primaryButtonText: "#ffffff",
    accentButtonBg: "#f472b6",
    accentButtonText: "#ffffff",
    secondaryButtonBg: "rgba(255, 255, 255, 0.9)",
    secondaryButtonText: "#9f1239",
    secondaryButtonHoverBg: "rgba(255, 247, 251, 0.98)",
  },
});

/** 未连接时与首页渐变按钮一致 */
export const hutConnectButtonClassName =
  "!rounded-full !min-h-10 !border-0 !px-4 !text-sm !font-medium !text-white !shadow-sm !bg-gradient-to-r !from-[#f472b6] !to-[#d946ef] hover:!opacity-95 active:!scale-[0.99] !transition";
