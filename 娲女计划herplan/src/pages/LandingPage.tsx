import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import landingBg from "@/assets/landing-bg.jpg";

const LandingPage = () => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const handleLogoClick = () => {
    setShowContent(!showContent);
    setShowAbout(false); // 关闭关于我们显示
    setShowContact(false); // 关闭联系我们显示
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleEnter = () => {
    navigate("/home");
  };

  const handleAboutClick = () => {
    setShowAbout(!showAbout);
    setShowContent(false); // 关闭logo内容显示
    setShowContact(false); // 关闭联系我们显示
    setShowMenu(false); // 关闭菜单
  };

  const handleContactClick = () => {
    setShowContact(!showContact);
    setShowContent(false); // 关闭logo内容显示
    setShowAbout(false); // 关闭关于我们显示
    setShowMenu(false); // 关闭菜单
  };

  return (
    <div 
      className="min-h-screen font-fangsong relative"
      style={{
        backgroundImage: `url(${landingBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* 半透明遮罩层 */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-sm bg-black/30 border-b border-white/20 relative">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* 左侧 Logo + 名称 */}
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.jpg" 
              alt="娲女计划"
              className="h-10 w-10 object-cover rounded-md border border-primary/20"
            />
            <h1 className="text-xl font-bold gradient-text font-fangsong">娲女计划</h1>
          </div>
          
          {/* 右侧 Hamburger Menu */}
          <button
            onClick={toggleMenu}
            className="p-2 text-white hover:bg-white/10 rounded-md transition-colors"
          >
            {showMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          {/* 折叠菜单 */}
          {showMenu && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-black/90 backdrop-blur-sm rounded-lg border border-white/20 shadow-lg animate-fade-in">
              <div className="p-4 space-y-2">
                <button 
                  onClick={handleEnter}
                  className="w-full text-left font-fangsong px-3 py-2 rounded transition-all duration-300 medium-white-border hover:gradient-text"
                  style={{ color: 'hsl(var(--brick-red))' }}
                >
                  首页
                </button>
                <button 
                  onClick={handleAboutClick}
                  className="w-full text-left font-fangsong px-3 py-2 rounded transition-all duration-300 medium-white-border hover:gradient-text"
                  style={{ color: 'hsl(var(--brick-red))' }}
                >
                  关于我们
                </button>
                <button 
                  onClick={handleContactClick}
                  className="w-full text-left font-fangsong px-3 py-2 rounded transition-all duration-300 medium-white-border hover:gradient-text"
                  style={{ color: 'hsl(var(--brick-red))' }}
                >
                  联系我们
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] relative z-10">
        <div className="text-center space-y-8">
          {/* 居中放大的 Logo */}
          <div 
            onClick={handleLogoClick}
            className="cursor-pointer transition-all duration-300 hover:scale-105 group"
          >
            <img 
              src="/logo.jpg" 
              alt="娲女计划"
              className="w-96 h-96 mx-auto rounded-lg object-cover border-2 border-primary/20 group-hover:border-primary/40 transition-colors shadow-lg"
            />
          </div>
          
          {/* 项目标题 */}
          <h1 className="text-6xl font-bold enhanced-title font-fangsong">娲女计划</h1>
          
          {/* 点击Logo后显示的内容 */}
          {showContent && (
            <div className="animate-fade-in space-y-6">
              {/* 副标题 */}
              <h2 className="text-2xl text-white/90 font-fangsong medium-white-border">
                重新讲述古代女性的真实故事
              </h2>
              
              {/* 正文介绍 */}
              <div className="font-fangsong max-w-md mx-auto leading-relaxed medium-white-border space-y-4" style={{ color: 'hsl(var(--brick-red))' }}>
                <p>突破旧世界里女性单薄的形象</p>
                <p>让我们女人重新构建，重新定义历史</p>
              </div>
              
              {/* 进入网站按钮 */}
              <button
                onClick={handleEnter}
                className="px-8 py-3 bg-primary/80 hover:bg-primary text-white font-fangsong rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                开始探索
              </button>
            </div>
          )}
          
          {/* 关于我们内容 */}
          {showAbout && (
            <div className="animate-fade-in space-y-4 max-w-2xl mx-auto">
              <div className="bg-black/60 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 font-fangsong">关于我们</h3>
                <div className="font-fangsong leading-relaxed text-white/90 space-y-3">
                  <p>
                    本栏目始终招募有野心的创作者，如果您喜欢这个网站和app，欢迎加入我们组成创作队伍。
                    来吧，让我们先从旧有的故事角色开始，让我们的主角们不再倒下，让她们不再孤单，
                  </p>
                  <p className="text-lg font-bold">
                    让我们笔下的世界先一步到达我们能想象到的，最远的、最好的地方。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 联系我们内容 */}
          {showContact && (
            <div className="animate-fade-in space-y-4 max-w-2xl mx-auto">
              <div className="bg-black/60 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 font-fangsong">联系我们</h3>
                <div className="font-fangsong leading-relaxed text-white/90 space-y-2">
                  <p><span className="font-bold">联系方式：</span>zhangqnoo@gmail.com</p>
                </div>
              </div>
            </div>
          )}

          {/* 提示文字 */}
          {!showContent && !showAbout && !showContact && (
            <p className="text-sm text-white/60 font-fangsong animate-pulse medium-white-border">
              点击 Logo 了解更多
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;