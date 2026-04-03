import Link from "next/link";
import { GitBranch, Globe } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { appConfig } from "@/lib/config";

const footerLinks = [
  { label: "写评价", href: "/review" },
  { label: "企业榜单", href: "/companies" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/80 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <Avatar className="h-8 w-8 border border-border/80 shadow-sm">
                <AvatarFallback className="bg-gradient-to-br from-[#165DFF] to-[#0E42D2] text-[10px] font-bold tracking-widest text-white">
                  RM
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-semibold">{appConfig.name}</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              连接钱包，为优秀企业留下可验证评价。所有评价上链存证，不可篡改。
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-4 text-sm font-medium">快速链接</h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h3 className="mb-4 text-sm font-medium">平台说明</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>评价数据写入区块链</li>
              <li>AI 提取结构化评分</li>
              <li>钱包地址作为身份锚点</li>
              <li>数据可验证、不可篡改</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border/80 pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            {appConfig.name} · Hackathon Demo · Built with Next.js + RainbowKit
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <GitBranch className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Globe className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
