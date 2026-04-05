import { Navigation } from "@/components/Navigation";
import { HistoryModule } from "@/components/HistoryModule";
import { ChallengeCard } from "@/components/ChallengeCard";
import { UploadCard } from "@/components/UploadCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Mail
} from "lucide-react";
import lineScholar from "@/assets/line-scholar.jpg";
import lineCourtLady from "@/assets/line-court-lady.jpg";
import lineWarrior from "@/assets/line-warrior.jpg";
import lineBooks from "@/assets/line-books.jpg";
import bgBambooPattern from "@/assets/bg-bamboo-pattern.jpg";

const HomePage = () => {
  return (
    <div className="min-h-screen rice-paper-bg ink-wash font-fangsong">
      {/* 导航栏 */}
      <Navigation />
      
      {/* 双页布局主体内容 */}
      <main className="dual-page-layout">
        {/* 左页 */}
        <div className="space-y-6">
          {/* 1. 项目概述 - 娲女计划 */}
          <section 
            className="book-module relative overflow-hidden"
            style={{
              backgroundImage: `url(${bgBambooPattern})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* 遮罩层确保文字可读性 */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px]"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold gradient-text font-fangsong mb-4">娲女计划</h2>
            
              <h3 className="text-xl font-medium text-secondary font-fangsong mb-3">重新讲述古代女性的真实故事</h3>
              
              <p className="text-muted-foreground font-fangsong leading-relaxed mb-6">
                让我们女人重新构建，重新定义历史。
              </p>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <Link to="/project">
                  <Button className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 font-fangsong">
                    了解项目详情
                  </Button>
                </Link>
              </div>
              
              {/* 古代女性线条插画背景 */}
              <div className="flex justify-center">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-70">
                  <img 
                    src={lineScholar} 
                    alt="古代女学者线条画" 
                    className="w-16 h-20 object-cover rounded-lg border border-border/30"
                  />
                  <img 
                    src={lineCourtLady} 
                    alt="宫廷女子线条画" 
                    className="w-16 h-20 object-cover rounded-lg border border-border/30"
                  />
                  <img 
                    src={lineWarrior} 
                    alt="女将军线条画" 
                    className="w-16 h-20 object-cover rounded-lg border border-border/30"
                  />
                  <img 
                    src={lineBooks} 
                    alt="古籍线条画" 
                    className="w-16 h-20 object-cover rounded-lg border border-border/30"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 2. 女性历史资料 */}
          <div className="book-module">
            <HistoryModule />
          </div>

          {/* 3. 故事分享 */}
          <div className="book-module">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold gradient-text font-fangsong mb-2">故事分享</h3>
              <p className="text-sm text-muted-foreground font-fangsong">上传你的故事</p>
            </div>
            <UploadCard />
          </div>

          {/* 4. 挑战赛 */}
          <div className="book-module">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold gradient-text font-fangsong mb-2">挑战赛</h3>
              <p className="text-sm text-muted-foreground font-fangsong">测试你的历史知识</p>
            </div>
            <ChallengeCard />
          </div>
        </div>

        {/* 右页 - 保留其他内容 */}
        <div className="space-y-6">
        </div>
      </main>

      {/* 页脚 */}
      <footer className="site-footer">
        <p className="font-fangsong">
          联系方式：
          <a href="mailto:zhangqnoo@gmail.com" className="footer-link">
            <Mail className="w-4 h-4 inline mr-1" />
            zhangqnoo@gmail.com
          </a>
        </p>
        <p className="text-sm text-muted-foreground font-fangsong mt-2">© 娲女计划</p>
      </footer>
    </div>
  );
};

export default HomePage;