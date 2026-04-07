import { Menu, X, BookOpen, Scroll, PenTool, Users, Home, FileText, Heart, Zap, Award, Shield } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Web3WalletConnect } from "@/components/Web3WalletConnect";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ActivityModule } from "@/components/ActivityModule";
import { Web3Badge } from "@/components/Web3Badge";
import { Button } from "@/components/ui/button";

export const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { to: "/home", label: "首页", icon: Home },
    { to: "/project", label: "项目介绍", icon: Scroll },
    { to: "/history", label: "历史资料", icon: BookOpen },
    { to: "/writing", label: "女性写作", icon: PenTool },
    { to: "/story", label: "故事分享", icon: FileText },
    { to: "/activity", label: "活动中心", icon: Users },
    { to: "/about", label: "致谢", icon: Heart },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <img 
              src="/logo.jpg" 
              alt="娲女计划 Logo" 
              className="w-12 h-12 rounded-lg object-cover border border-border book-spine"
            />
            <div>
              <h1 className="text-2xl font-bold gradient-text font-zhuanti">娲女计划</h1>
              <p className="text-sm text-muted-foreground font-fangsong">重新讲述古代女性的真实故事</p>
            </div>
          </Link>

          {/* Desktop Navigation - Bookmark Tabs */}
          <div className="hidden md:flex items-center gap-4">
            <nav className="flex items-end gap-1">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link 
                    key={item.to}
                    to={item.to} 
                    className={`bookmark-tab group flex items-center gap-2 text-sm font-fangsong transition-colors ${
                      isActive(item.to) 
                        ? 'active text-primary-foreground' 
                        : 'hover:text-primary'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            
            {/* 快捷入口 */}
            <div className="flex items-center gap-1 ml-2 border-l border-border pl-3">
              <Link to="/writing">
                <Button variant="ghost" size="sm" className="font-fangsong text-xs gap-1">
                  <PenTool className="w-3.5 h-3.5" />
                  写作
                </Button>
              </Link>
              <Link to="/activity">
                <Button variant="ghost" size="sm" className="font-fangsong text-xs gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  社区
                </Button>
              </Link>

              {/* 活动弹窗 */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="font-fangsong text-xs gap-1">
                    <Users className="w-3.5 h-3.5" />
                    活动
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <ActivityModule />
                </DialogContent>
              </Dialog>

              {/* 徽章弹窗 */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="font-fangsong text-xs gap-1">
                    <Award className="w-3.5 h-3.5" />
                    徽章
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <Web3Badge size="medium" showTitle={true} />
                </DialogContent>
              </Dialog>
            </div>

            {/* Web3 Wallet Connection */}
            <Web3WalletConnect />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 book-spine rounded-md"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 py-4 border-t border-border">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link 
                    key={item.to}
                    to={item.to} 
                    className={`flex items-center gap-3 transition-colors font-fangsong p-2 rounded-md ${
                      isActive(item.to)
                        ? 'text-primary bg-primary/10'
                        : 'text-foreground hover:text-primary hover:bg-muted'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <IconComponent className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};