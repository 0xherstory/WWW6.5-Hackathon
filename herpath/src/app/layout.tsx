import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HerPath — 她的轨迹",
  description: "一款以女性领袖成长叙事为核心的 Web3 像素游戏",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className="scanlines min-h-screen">{children}</body>
    </html>
  );
}
