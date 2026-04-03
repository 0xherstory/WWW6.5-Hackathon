import type { Metadata } from "next";
import { Geist, Noto_Sans_SC } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoSansSC = Noto_Sans_SC({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "月经小屋 Menstrual Hut | No Uterus, No Opinion",
  description:
    "一个永远不会被删除的身体感受记录空间 — 去中心化、匿名、永恒保存在链上与 IPFS。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${notoSansSC.variable} font-sans min-h-screen`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
