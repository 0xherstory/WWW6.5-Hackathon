import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import traditionalPortraitBg from "@/assets/traditional-portrait-bg.jpg";
import newLogo from "@/assets/new-logo.jpg";
import { useState, useEffect, useRef } from "react";

const ProjectIntroPage = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 自动滚动效果 - 滚动一遍后停止
  useEffect(() => {
    if (!contentRef.current) return;

    const element = contentRef.current;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;
    const maxScroll = scrollHeight - clientHeight;

    if (maxScroll <= 0) return;

    let currentScroll = 0;
    const scrollSpeed = 30; // 滚动速度（像素/秒）
    const interval = 50; // 更新间隔（毫秒）
    const scrollStep = (scrollSpeed * interval) / 1000;

    const startScrolling = () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }

      scrollIntervalRef.current = setInterval(() => {
        if (isPaused) return;

        if (currentScroll >= maxScroll) {
          // 滚动到底部后停止
          if (scrollIntervalRef.current) {
            clearInterval(scrollIntervalRef.current);
            scrollIntervalRef.current = null;
          }
        } else {
          currentScroll += scrollStep;
          element.scrollTo({ top: currentScroll, behavior: 'auto' });
        }
      }, interval);
    };

    startScrolling();

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [isPaused]);

  // 鼠标悬停或点击时暂停滚动
  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const handleClick = () => {
    setIsPaused(prev => !prev);
  };
  return (
    <div className="min-h-screen rice-paper-bg ink-wash font-fangsong">
      {/* 导航栏和返回按钮 */}
      <div className="container mx-auto px-4 py-6">
        <Link to="/home">
          <Button variant="outline" size="sm" className="mb-6 font-fangsong">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Button>
        </Link>
        
        {/* Logo 置顶居中 - 大尺寸填充 */}
        <div className="text-center mb-12">
          <img 
            src={newLogo} 
            alt="娲女计划 Logo" 
            className="w-full max-w-2xl h-80 rounded-2xl object-cover border-2 border-border mx-auto shadow-lg"
          />
        </div>
        
        {/* 主要内容区域 */}
        <div className="max-w-6xl mx-auto">
          <div 
            className="ancient-card relative p-8 rounded-[20px] border border-border/30"
            style={{
              backgroundImage: `url(${traditionalPortraitBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* 半透明遮罩层确保文字可读性 */}
            <div className="absolute inset-0 bg-white/90 rounded-[20px]"></div>
            
            <div className="relative z-10">
              {/* Content */}
              <div 
                ref={contentRef}
                className="space-y-6 text-base font-fangsong leading-loose max-h-[60vh] overflow-y-auto pr-4 cursor-pointer"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
              >
                <p>
                  古事，就是人类的通用的经验和记忆的记载，可以是谚语，是民间故事，是英娥传奇，是神话传说。当我们目遇险境，身陷囹圄，我们会回溯自己和古老人类通用的智慧经验，这些古事会在我们的文化意识里发挥巨大的作用。而妗解的含义就是用如今我们的视角发出疑问：在近千年来由男性意志把控的记载中，这个世界大部分留下来的，对<strong><em>女性</em></strong>说的那些经验，真的是在为我们好吗？积腐陈旧的古事，是时候了，是时候该今天的<strong><em>女人</em></strong>重新定义它。娲女计划的由来，就是起源于我想"让我们<strong><em>女人</em></strong>重新构建，重新定义历史"的这种愿望。
                </p>
                
                <p>
                  今天的我想要一种可能性：我想要新故事可以给明年的<strong><em>女性</em></strong>，甚至是明天看到这些故事的<strong><em>女性</em></strong>，提供一种生命经验。也就能为<strong><em>她们</em></strong>提供一种全新的人生视角和无限的生命可能。改编古事，是突破也是审视，突破脑子里面既有的刻板文化，审视那些文化中藏在字与字之间的对所有<strong><em>女人</em></strong>的规训。改编好像很容易，同时又很难。
                </p>
                
                <p>
                  我很难列举我们要完成各自生命中的哪些出逃，完成对身上枷锁的哪些审视，要多冷峻地看待自己的欲望，要剔除哪些怯懦，要包容哪一部分自我。。。。我相信对每个人来说，课题都不同。
                </p>
                
                <p>
                  对我来说，改编最难的部分，就是在这个故事的结局，我无法落笔，我无法确定——这些<strong><em>女人</em></strong>要走向哪里？以前，在我笔下改编或者自创的人物中，我不知道要怎么写下去，我和我故事中的人一起卡在了人生的某一阶段。我有好几年一直认为，这是无解的，是一个娜拉难题。但是在我翻阅其他人写的原创故事中，我越来越得到更多的力量和可能。我在那些近乎真实的，文字创造的世界里找到了答案。
                </p>
                
                <p className="text-primary font-bold text-xl text-center my-6">寻找同伴，寻找同伴。</p>
                
                <p>
                  我相信现实中，在那些看不见的旧有结构内打转的<strong><em>女性</em></strong>，也拥有着自己的<strong><em>女性</em></strong>母系社会最小单位。而<strong><em>女人</em></strong>，只要<strong><em>她</em></strong>的自我认同也是<strong><em>女人</em></strong>，<strong><em>她</em></strong>就一定会寻找同伴。<strong><em>她</em></strong>也就会开始选择不把自己的人生希望，交付给父权家庭，这个转变非常，非常重要。娲女计划，我想要这个系列一直写下去，我想要不断挖掘<strong><em>女性</em></strong>自己的历史生命，直到我们能够从容地想象，一个完全没有男人的世界🌎。
                </p>
              </div>
            </div>
          </div>
          
          {/* 底部导航 */}
          <div className="text-center mt-8">
            <Link to="/writing">
              <Button className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 font-fangsong">
                开始<strong><em>女性</em></strong>写作
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectIntroPage;