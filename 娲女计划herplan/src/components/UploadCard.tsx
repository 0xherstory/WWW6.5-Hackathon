import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Heart, MapPin, Scroll } from "lucide-react";
import bgLotusPattern from "@/assets/bg-lotus-pattern.jpg";

export const UploadCard = () => {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [story, setStory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!name.trim() || !story.trim()) {
      toast({
        title: "请填写必要信息",
        description: "请至少填写人物姓名和故事内容",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // 模拟提交过程
    setTimeout(() => {
      toast({
        title: "故事提交成功！",
        description: "感谢您分享这个珍贵的历史故事",
      });
      
      // 重置表单
      setName("");
      setRegion("");
      setStory("");
      setIsSubmitting(false);
    }, 1500);
  };

  const progress = (() => {
    let completed = 0;
    if (name.trim()) completed += 33;
    if (region.trim()) completed += 33;
    if (story.trim()) completed += 34;
    return completed;
  })();

  return (
    <div 
      className="space-y-4 relative overflow-hidden rounded-lg p-4"
      style={{
        backgroundImage: `url(${bgLotusPattern})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* 遮罩层确保文字可读性 */}
      <div className="absolute inset-0 bg-background/85 backdrop-blur-[1px]"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
        <Scroll className="w-5 h-5 text-secondary" />
        <h4 className="text-lg font-medium text-secondary font-fangsong">分享历史女性故事</h4>
      </div>
      
      <p className="text-sm text-muted-foreground font-fangsong">
        分享您了解的历史女性人物及其故事
      </p>

      {/* 水墨线条进度条显示完成度 */}
      <div className="ink-progress">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-secondary via-accent to-secondary rounded-sm transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="space-y-3">
        <Input
          placeholder="人物姓名 *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="font-fangsong"
        />
        
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="地区/朝代"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="pl-10 font-fangsong"
          />
        </div>
        
        <Textarea
          placeholder="请分享她的故事... *"
          value={story}
          onChange={(e) => setStory(e.target.value)}
          className="min-h-[80px] font-fangsong"
        />
        
        <Button 
          onClick={handleSubmit} 
          className="w-full font-fangsong"
          disabled={isSubmitting}
        >
          <Heart className="w-4 h-4 mr-2" />
          {isSubmitting ? "提交中..." : "分享故事"}
        </Button>
      </div>
      </div>
    </div>
  );
};