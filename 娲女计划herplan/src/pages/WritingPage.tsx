import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, PenTool, Lightbulb, BookOpen, Users, Heart } from "lucide-react";
import lineWriting from "@/assets/line-writing.jpg";
import lineScholar from "@/assets/line-scholar.jpg";
import lineCourtLady from "@/assets/line-court-lady.jpg";
import lineWarrior from "@/assets/line-warrior.jpg";
import lineBooks from "@/assets/line-books.jpg";
import { Web3ContentProof } from "@/components/Web3ContentProof";
import { Web3Badge } from "@/components/Web3Badge";

const WritingPage = () => {
  const [storyInput, setStoryInput] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const writingPrompts = [
    "假如你是唐朝的女官员，如何在朝堂上为女性发声？",
    "如果花木兰没有选择从军，她的人生会是什么样？",
    "宋朝女词人除了写词，还可能有哪些不为人知的才能？",
    "假如武则天不是皇帝，而是现代企业家会怎样？",
    "如果李清照生在今天，她会如何用新媒体表达情感？",
    "古代女医师除了治病救人，还可能承担什么社会责任？"
  ];

  const storyTemplates = [
    {
      title: "权力重构",
      description: "从权力角度重新审视古代女性的社会地位",
      example: "她不仅仅是皇帝的妃子，更是政治舞台上的智者..."
    },
    {
      title: "情感解构",
      description: "深入挖掘古代女性的内心世界和情感表达",
      example: "在那个女子无才便是德的年代，她选择了另一种声音..."
    },
    {
      title: "现代对话",
      description: "让古代女性与现代社会产生跨时空对话",
      example: "如果她生在今天，会如何看待现代女性的困境与突破..."
    }
  ];

  const featuredWorks = [
    {
      title: "重新定义武则天",
      author: "张小月",
      excerpt: "她不只是权力的追求者，更是女性价值的重新定义者...",
      likes: 42,
      category: "权力重构"
    },
    {
      title: "花木兰的另一种选择",
      author: "李文雅",
      excerpt: "如果她选择不从军，用文字和智慧为国效力...",
      likes: 38,
      category: "现代对话"
    },
    {
      title: "李清照的商业帝国",
      author: "王诗涵",
      excerpt: "才华横溢的她在现代会如何运用商业智慧...",
      likes: 31,
      category: "现代对话"
    }
  ];

  const handleGeneratePrompt = () => {
    const randomPrompt = writingPrompts[Math.floor(Math.random() * writingPrompts.length)];
    setGeneratedPrompt(randomPrompt);
  };

  return (
    <div className="min-h-screen rice-paper-bg ink-wash">
      {/* 头部导航 */}
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Link 
              to="/home" 
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-fangsong">返回首页</span>
            </Link>
            <div className="w-px h-6 bg-border mx-2" />
            <div className="flex items-center gap-3">
              <PenTool className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold gradient-text font-fangsong">女性写作工坊</h1>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左侧：写作区域 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 写作介绍 */}
            <Card className="ancient-card">
              <CardHeader>
                <CardTitle className="gradient-text font-fangsong">重新讲述她们的故事</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-fangsong leading-relaxed mb-4">
                  古代女性的故事往往被简化成几行文字，她们的智慧、勇气和创造力被历史的尘埃掩盖。
                  在这里，我们用现代的视角和AI的协助，重新构建她们的世界，让她们的声音再次响起。
                </p>
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
              </CardContent>
            </Card>

            {/* 写作工具 */}
            <Card className="ancient-card">
              <CardHeader>
                <CardTitle className="font-fangsong">创作工具</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="prompt" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="prompt" className="font-fangsong">灵感生成</TabsTrigger>
                    <TabsTrigger value="template" className="font-fangsong">故事模板</TabsTrigger>
                    <TabsTrigger value="write" className="font-fangsong">自由创作</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="prompt" className="space-y-4">
                    <div className="flex gap-2">
                      <Button onClick={handleGeneratePrompt} className="font-fangsong">
                        <Lightbulb className="w-4 h-4 mr-2" />
                        生成写作提示
                      </Button>
                    </div>
                    {generatedPrompt && (
                      <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                        <p className="font-fangsong">{generatedPrompt}</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="template" className="space-y-4">
                    <div className="grid gap-4">
                      {storyTemplates.map((template, index) => (
                        <div 
                          key={index}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedTemplate === template.title 
                              ? 'border-primary bg-primary/5' 
                              : 'hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedTemplate(template.title)}
                        >
                          <h4 className="font-medium font-fangsong mb-2">{template.title}</h4>
                          <p className="text-sm text-muted-foreground font-fangsong mb-2">
                            {template.description}
                          </p>
                          <p className="text-xs text-primary font-fangsong italic">
                            "{template.example}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="write" className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 font-fangsong">
                        你的故事：
                      </label>
                      <Textarea
                        value={storyInput}
                        onChange={(e) => setStoryInput(e.target.value)}
                        placeholder="在这里写下你对古代女性的重新诠释...

例如：
- 重新想象她们的职业选择
- 探索她们的内心世界
- 描述她们面对困境时的智慧
- 让她们与现代世界对话"
                        className="min-h-64 font-fangsong"
                      />
                    </div>
                    
                    {/* Web3 内容存证区域 */}
                    {storyInput.length > 100 && (
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <Web3ContentProof 
                          contentId="story-001"
                          title={storyInput.slice(0, 20) + "..."}
                          author="当前用户"
                          createdAt={new Date().toLocaleDateString()}
                          size="medium"
                        />
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button className="font-fangsong">
                        <BookOpen className="w-4 h-4 mr-2" />
                        保存草稿
                      </Button>
                      <Button variant="outline" className="font-fangsong">
                        发布作品
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：精选作品和社区 */}
          <div className="space-y-6">
            {/* 写作指导 */}
            <Card className="ancient-card">
              <CardHeader>
                <CardTitle className="font-fangsong text-lg">写作指导</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-center mb-4">
                  <img 
                    src={lineWriting} 
                    alt="女性写作线条画" 
                    className="w-20 h-20 object-cover rounded-lg border border-border/30 opacity-60"
                  />
                </div>
                <div className="space-y-2 text-sm font-fangsong">
                  <p>• <strong>打破刻板印象：</strong>避免将古代女性简化为美貌或悲情角色</p>
                  <p>• <strong>挖掘真实性：</strong>基于历史背景，合理想象她们的生活细节</p>
                  <p>• <strong>现代视角：</strong>用当代思维重新审视她们的选择和困境</p>
                  <p>• <strong>情感深度：</strong>探索她们作为独立个体的内心世界</p>
                </div>
              </CardContent>
            </Card>

            {/* 精选作品 */}
            <Card className="ancient-card">
              <CardHeader>
                <CardTitle className="font-fangsong text-lg">社区精选</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {featuredWorks.map((work, index) => (
                  <div key={index} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium font-fangsong text-sm">{work.title}</h4>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {work.category}
                        </Badge>
                        <Web3ContentProof
                          contentId={`work-${index}`}
                          title={work.title}
                          author={work.author}
                          size="small"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">作者：{work.author}</p>
                    <p className="text-sm text-muted-foreground font-fangsong italic">
                      "{work.excerpt}"
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Heart className="w-3 h-3" />
                        {work.likes}
                      </div>
                      <Button size="sm" variant="ghost" className="font-fangsong text-xs">
                        阅读全文
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Web3 用户徽章 */}
            <Web3Badge size="medium" showTitle={true} />

            {/* 社区活动 */}
            <Card className="ancient-card">
              <CardHeader>
                <CardTitle className="font-fangsong text-lg">写作活动</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-primary/5 rounded-lg border-l-4 border-primary">
                  <h4 className="font-medium font-fangsong text-sm">本月主题</h4>
                  <p className="text-sm text-muted-foreground font-fangsong">
                    "如果古代女性拥有现代科技"
                  </p>
                  <p className="text-xs text-muted-foreground">截止日期：本月底</p>
                </div>
                <Button variant="outline" className="w-full font-fangsong">
                  <Users className="w-4 h-4 mr-2" />
                  加入写作挑战
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WritingPage;