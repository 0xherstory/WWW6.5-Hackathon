import { useState } from "react";
import { PenTool, Users, Scroll, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ModuleContentProps {
  moduleType: 'writing' | 'activities' | 'resources';
}

const ModuleContent = ({ moduleType }: ModuleContentProps) => {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  
  const handleSubmit = () => {
    if (input.trim()) {
      toast({
        title: "提交成功",
        description: `您的${getModuleTitle(moduleType)}内容已记录`,
      });
      setInput("");
    }
  };

  const getModuleTitle = (type: string) => {
    switch (type) {
      case 'writing': return '女性写作';
      case 'activities': return '女性活动';
      case 'resources': return '女性历史资料';
      default: return '';
    }
  };

  const getModuleContent = () => {
    switch (moduleType) {
      case 'writing':
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground font-fangsong">
              通过AI辅助，重新改编古代女性故事，突破传统叙事的束缚。
            </p>
            <div className="space-y-3">
              <h4 className="font-medium text-primary font-fangsong">写作提示生成器</h4>
              <p className="text-sm font-fangsong">请输入您想要改编的古代女性人物名字：</p>
              <Input 
                placeholder="例如：妲己、西施、武则天..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="font-fangsong"
              />
              <Button onClick={handleSubmit} className="w-full font-fangsong">
                生成写作提示
              </Button>
            </div>
          </div>
        );
      
      case 'activities':
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground font-fangsong">
              参与线上讨论，与志同道合的伙伴一起探讨女性议题。
            </p>
            <div className="space-y-3">
              <h4 className="font-medium text-primary font-fangsong">加入讨论话题</h4>
              <Textarea 
                placeholder="分享您对某个古代女性人物的新解读..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="font-fangsong"
              />
              <Button onClick={handleSubmit} className="w-full font-fangsong">
                发布讨论
              </Button>
            </div>
          </div>
        );
        
      case 'resources':
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground font-fangsong">
              搜索和收藏古代女性历史资料，按朝代和职业分类浏览。
            </p>
            <div className="space-y-3">
              <h4 className="font-medium text-primary font-fangsong">资料检索</h4>
              <Input 
                placeholder="搜索朝代、人物、职业..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="font-fangsong"
              />
              <Button onClick={handleSubmit} className="w-full font-fangsong">
                搜索资料
              </Button>
            </div>
          </div>
        );
    }
  };

  return getModuleContent();
};

export const FunctionalModules = () => {
  const modules = [
    {
      id: 'writing',
      title: '女性写作',
      icon: PenTool,
      description: 'ChatGPT 辅助改编古代女性故事',
      color: 'text-primary'
    },
    {
      id: 'activities',
      title: '女性活动',
      icon: Users,
      description: '线上讨论与读书会活动',
      color: 'text-secondary'
    },
    {
      id: 'resources',
      title: '女性历史资料',
      icon: Scroll,
      description: '古代女性人物资料库',
      color: 'text-accent'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4">
      {modules.map((module) => {
        const IconComponent = module.icon;
        return (
          <Dialog key={module.id}>
            <DialogTrigger asChild>
              <div className="ancient-card p-4 cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IconComponent className={`w-6 h-6 ${module.color}`} />
                    <div>
                      <h3 className="font-medium font-fangsong">{module.title}</h3>
                      <p className="text-sm text-muted-foreground font-fangsong">{module.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-2xl ancient-card-dialog">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 font-fangsong">
                  <IconComponent className={`w-6 h-6 ${module.color}`} />
                  {module.title}
                </DialogTitle>
              </DialogHeader>
              <ModuleContent moduleType={module.id as 'writing' | 'activities' | 'resources'} />
            </DialogContent>
          </Dialog>
        );
      })}
    </div>
  );
};