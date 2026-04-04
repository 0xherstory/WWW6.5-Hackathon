"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { appConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "首页" },
  { href: "/search", label: "评价广场" },
  { href: "/company-ranking", label: "企业榜单" },
] as const;

function NavLinks({
  className,
  onNavigate,
  variant = "desktop",
}: {
  className?: string;
  onNavigate?: () => void;
  variant?: "desktop" | "drawer";
}) {
  const pathname = usePathname();

  return (
    <ul
      className={cn(
        variant === "desktop" && "flex items-center gap-1",
        variant === "drawer" && "flex flex-col gap-1",
        className,
      )}
    >
      {NAV_LINKS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

        const link = (
          <Link
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "block rounded-lg px-3 py-2 text-sm transition-colors",
              variant === "desktop" && "whitespace-nowrap",
              active
                ? "bg-[#165DFF]/10 font-medium text-[#165DFF]"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );

        return (
          <li key={item.href}>
            {variant === "drawer" ? (
              <DrawerClose asChild>{link}</DrawerClose>
            ) : (
              link
            )}
          </li>
        );
      })}
    </ul>
  );
}

function NavSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      router.push(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative hidden items-center md:flex"
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="搜索企业名称/带教名字..."
        className="h-9 w-48 rounded-lg border-[#E5E6EB] bg-muted/50 pl-9 pr-9 text-sm focus-visible:ring-2 focus-visible:ring-[#165DFF]/50"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </form>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState("");
  const router = useRouter();

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearch.trim()) {
      router.push(`/search?q=${encodeURIComponent(mobileSearch.trim())}`);
      setMobileOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#165DFF]/40 to-transparent" />

      <div className="relative mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:h-16 sm:px-6">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5 rounded-lg outline-none ring-offset-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Avatar className="h-9 w-9 border border-border/80 shadow-sm ring-1 ring-[#165DFF]/20">
            <AvatarFallback className="bg-gradient-to-br from-[#165DFF] to-[#0E42D2] text-[11px] font-bold tracking-widest text-white">
              RM
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
              {appConfig.name}
            </span>
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground sm:block">
              去中心化职场Mentor/企业评价平台
            </span>
          </div>
        </Link>

        {/* <NavSearch /> */}

        <nav className="hidden flex-1 justify-center md:flex">
          <NavLinks variant="desktop" />
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="[&_button]:h-9 [&_button]:min-h-9 [&_button]:rounded-lg [&_button]:border-border/80 [&_button]:text-sm [&_button]:shadow-sm">
            <ConnectButton />
          </div>

          <Drawer
            direction="right"
            open={mobileOpen}
            onOpenChange={setMobileOpen}
            shouldScaleBackground={false}
          >
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 border-border/80 bg-background/50 md:hidden"
                aria-label="打开菜单"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="bg-background/95 backdrop-blur-xl">
              <DrawerHeader className="border-b border-border/80 text-left">
                <DrawerTitle className="font-semibold tracking-tight">
                  导航
                </DrawerTitle>
                <DrawerDescription className="text-muted-foreground">
                  选择页面 · {appConfig.name}
                </DrawerDescription>
              </DrawerHeader>

              {/* 移动端搜索 */}
              <form onSubmit={handleMobileSearch} className="px-2 py-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={mobileSearch}
                    onChange={(e) => setMobileSearch(e.target.value)}
                    placeholder="搜索企业名称/带教名字..."
                    className="h-10 w-full rounded-lg border-[#E5E6EB] pl-9 text-sm"
                  />
                </div>
              </form>

              <div className="flex-1 overflow-y-auto px-2 py-4">
                <NavLinks
                  variant="drawer"
                  onNavigate={() => setMobileOpen(false)}
                />
              </div>
              <DrawerFooter className="border-t border-border/80 py-4">
                <p className="text-center text-xs text-muted-foreground">
                  连接钱包请使用右上角按钮
                </p>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </header>
  );
}
