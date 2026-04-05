import { ChallengeCard } from "@/components/ChallengeCard";
import { UploadCard } from "@/components/UploadCard";
import { Separator } from "@/components/ui/separator";

export const InteractiveSection = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold gradient-text font-fangsong mb-2">互动体验区</h3>
        <p className="text-sm text-muted-foreground font-fangsong">参与挑战，分享故事</p>
      </div>
      
      {/* 挑战赛区域 */}
      <div>
        <h4 className="text-lg font-medium text-primary font-fangsong mb-3">挑战赛</h4>
        <ChallengeCard />
      </div>
      
      <Separator className="my-4" />
      
      {/* 上传区域 */}
      <div>
        <h4 className="text-lg font-medium text-secondary font-fangsong mb-3">故事分享</h4>
        <UploadCard />
      </div>
    </div>
  );
};