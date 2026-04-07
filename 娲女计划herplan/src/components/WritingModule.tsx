import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { PenTool } from "lucide-react";
import lineWriting from "@/assets/line-writing.jpg";
import bgFlyingBirds from "@/assets/bg-flying-birds.jpg";

export const WritingModule = () => {
  const [storyInput, setStoryInput] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");

  const handleGeneratePrompt = () => {
    const prompts = [
      "假如你是唐朝的女官员，如何在朝堂上为女性发声？",
      "如果花木兰没有选择从军，她的人生会是什么样？",
      "宋朝女词人除了写词，还可能有哪些不为人知的才能？",
      "假如武则天不是皇帝，而是现代企业家会怎样？"
    ];
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setGeneratedPrompt(randomPrompt);
  };

  return (
    <section 
      className="bento-card relative overflow-hidden"
      style={{
        backgroundImage: `url(${bgFlyingBirds})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* 遮罩层确保文字可读性 */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px]"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
        <PenTool className="w-6 h-6 text-primary" />
        <h3 className="text-lg font-bold gradient-text font-fangsong">女性写作</h3>
      </div>
      
      <p className="text-sm text-muted-foreground font-fangsong mb-4">
        AI 协助改编古代女性故事，突破传统叙述框架
      </p>
      
      {/* 线条插画装饰 */}
      <div className="flex justify-center mb-4">
        <img 
          src={lineWriting} 
          alt="女性写作线条画" 
          className="w-20 h-20 object-cover rounded-lg border border-border/30 opacity-60"
        />
      </div>
      
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full font-fangsong">
            开始写作
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl font-fangsong">
          <DialogHeader>
            <DialogTitle className="font-fangsong">女性写作工坊</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Button onClick={handleGeneratePrompt} className="mb-2 font-fangsong">
                生成写作提示
              </Button>
              {generatedPrompt && (
                <div className="p-3 bg-muted rounded border-l-4 border-primary">
                  <p className="font-fangsong text-sm">{generatedPrompt}</p>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 font-fangsong">你的故事：</label>
              <Textarea
                value={storyInput}
                onChange={(e) => setStoryInput(e.target.value)}
                placeholder="在这里写下你对古代女性的重新诠释..."
                className="min-h-32 font-fangsong"
              />
            </div>
            
            <Button className="w-full font-fangsong">
              提交作品
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </section>
  );
};