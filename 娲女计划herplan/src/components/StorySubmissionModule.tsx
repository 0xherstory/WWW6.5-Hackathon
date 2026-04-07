import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  FileText, 
  MapPin, 
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import bgWillowPattern from "@/assets/bg-willow-pattern.jpg";

const StorySubmissionModule = () => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    region: "",
    source: ""
  });
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "submitted" | "approved">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast({
        title: "请完善信息",
        description: "请填写故事标题和内容",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // 模拟提交
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmissionStatus("submitted");
      toast({
        title: "提交成功",
        description: "您的故事已提交审核，感谢您的分享！"
      });
      setFormData({ title: "", content: "", region: "", source: "" });
    }, 2000);
  };

  const getStatusInfo = () => {
    switch (submissionStatus) {
      case "submitted":
        return {
          icon: <Clock className="w-4 h-4" />,
          text: "审核中",
          variant: "secondary" as const
        };
      case "approved":
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          text: "已通过",
          variant: "default" as const
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div 
      className="book-module relative overflow-hidden"
      style={{
        backgroundImage: `url(${bgWillowPattern})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* 渐变遮罩层确保文字可读性 */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/85 to-background/95 backdrop-blur-[1px]"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold gradient-text font-fangsong mb-2">故事分享</h2>
            <p className="text-muted-foreground font-fangsong">分享您了解的女性传说与故事</p>
          </div>
          {statusInfo && (
            <Badge variant={statusInfo.variant} className="font-fangsong">
              {statusInfo.icon}
              <span className="ml-1">{statusInfo.text}</span>
            </Badge>
          )}
        </div>

        <Card className="border-border/50 bg-background/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-fangsong">
              <FileText className="w-5 h-5" />
              上传须知
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground font-fangsong">
            <p>• 请分享您了解的各地区非官方、民间口述的女性神话、传说与故事</p>
            <p>• 所有提交内容将进入审核队列，审核通过后将收录至女性历史资料库</p>
            <p>• 请尊重历史文化，确保内容真实可靠</p>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium font-fangsong mb-2 block">故事标题 *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="请输入故事标题"
                className="font-fangsong"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium font-fangsong mb-2 block">地区/朝代</label>
                <Input
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  placeholder="如：江南地区、明朝"
                  className="font-fangsong"
                />
              </div>
              <div>
                <label className="text-sm font-medium font-fangsong mb-2 block">故事来源</label>
                <Input
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder="如：家族口述、地方志"
                  className="font-fangsong"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium font-fangsong mb-2 block">故事内容 *</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="请详细描述这位女性的故事..."
                className="min-h-[120px] font-fangsong"
              />
            </div>

            <div className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-fangsong mb-1">可选：上传相关图片或音频</p>
              <p className="text-xs text-muted-foreground font-fangsong">支持 JPG、PNG、MP3 格式</p>
              <Button variant="outline" size="sm" className="mt-2 font-fangsong" type="button">
                选择文件
              </Button>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 font-fangsong"
          >
            {isSubmitting ? "提交中..." : "提交故事"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default StorySubmissionModule;