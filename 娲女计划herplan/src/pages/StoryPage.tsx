import { Navigation } from "@/components/Navigation";
import StorySubmissionModule from "@/components/StorySubmissionModule";
import WomenHistoryArchive from "@/components/WomenHistoryArchive";

const StoryPage = () => {
  return (
    <div className="min-h-screen rice-paper-bg ink-wash font-fangsong">
      <Navigation />
      
      <main className="dual-page-layout">
        {/* 左页 - 故事分享模块 */}
        <div className="space-y-6">
          <StorySubmissionModule />
        </div>

        {/* 右页 - 女性历史资料库 */}
        <div className="space-y-6">
          <WomenHistoryArchive />
        </div>
      </main>

      {/* 页脚 */}
      <footer className="site-footer">
        <p className="text-sm text-muted-foreground font-fangsong mt-2">© 娲女计划</p>
      </footer>
    </div>
  );
};

export default StoryPage;