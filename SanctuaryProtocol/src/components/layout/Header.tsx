"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import LocaleSwitcher from "./LocaleSwitcher";
import WalletButton from "@/components/wallet/WalletButton";

export default function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="relative bg-background/80 backdrop-blur-sm border-b border-secondary/30">
      {/* 顶部装饰线 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="group flex items-center gap-2 sm:gap-3">
            {/* 几何 Logo 图标 */}
            <div className="relative w-6 h-6 sm:w-8 sm:h-8 border border-accent/40 rotate-45 transition-all duration-300 group-hover:border-accent group-hover:rotate-90">
              <div className="absolute inset-1 border border-accent/20" />
            </div>
            <span className="text-base sm:text-lg font-light tracking-wide text-text group-hover:text-accent transition-colors">
              {t('brand.name')}
            </span>
          </Link>

          {/* 桌面端导航 */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <NavLink href={`/${locale}/sanctuary`}>{t('nav.sanctuary')}</NavLink>
            
            {/* 分隔 */}
            <div className="w-px h-4 bg-accent/20" />
            
            {/* 语言切换 */}
            <LocaleSwitcher />
            
            {/* 分隔 */}
            <div className="w-px h-4 bg-accent/20" />
            
            {/* 钱包连接按钮 */}
            <WalletButton />
          </nav>

          {/* 移动端按钮组 */}
          <div className="flex md:hidden items-center gap-2">
            {/* 钱包按钮 - 移动端始终显示 */}
            <WalletButton />
            
            {/* 语言切换 - 移动端 */}
            <LocaleSwitcher />
            
            {/* 移动端菜单按钮 */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-text hover:text-accent transition-colors"
              aria-label={t('nav.toggleMenu')}
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* 移动端菜单 */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-secondary/30">
            <div className="flex flex-col gap-3">
              <MobileNavLink href={`/${locale}/sanctuary`} onClick={() => setIsMobileMenuOpen(false)}>
                {t('nav.sanctuary')}
              </MobileNavLink>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

// 桌面端导航链接组件
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="relative text-sm text-muted hover:text-text transition-colors duration-300 group"
    >
      <span>{children}</span>
      {/* 下划线装饰 */}
      <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}

// 移动端导航链接组件
function MobileNavLink({ 
  href, 
  children, 
  onClick 
}: { 
  href: string; 
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className="text-sm text-muted hover:text-text transition-colors duration-300 py-2"
    >
      {children}
    </Link>
  );
}
