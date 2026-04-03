import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "疗愈庇护所 | Healing Sanctuary",
  description: "在 Web3 的世界里，种下属于你的疗愈之树 | Plant your healing tree in the Web3 world",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
