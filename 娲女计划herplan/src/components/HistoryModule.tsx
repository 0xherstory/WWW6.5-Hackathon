import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search, Eye, Heart } from "lucide-react";
import lineHistory from "@/assets/line-history.jpg";
import bgPinePattern from "@/assets/bg-pine-pattern.jpg";
import { historicalFigures, dynasties } from "@/data/historicalFigures";

export const HistoryModule = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDynasty, setSelectedDynasty] = useState("");
  const [openDialogId, setOpenDialogId] = useState<number | null>(null);
  const figureRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const listContainerRef = useRef<HTMLDivElement>(null);

  const filteredFigures = historicalFigures.filter(figure => {
    const matchesSearch = searchTerm === "" || figure.name.includes(searchTerm) || figure.description.includes(searchTerm);
    const matchesDynasty = selectedDynasty === "" || selectedDynasty === "all" || figure.dynasty === selectedDynasty;
    return matchesSearch && matchesDynasty;
  });

  return (
    <section 
      className="bento-card relative overflow-hidden"
      style={{
        backgroundImage: `url(${bgPinePattern})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* 遮罩层确保文字可读性 */}
      <div className="absolute inset-0 bg-background/75 backdrop-blur-[1px]"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
        <BookOpen className="w-6 h-6 text-accent" />
        <h3 className="text-lg font-bold gradient-text font-fangsong">女性历史资料</h3>
      </div>
      
      <p className="text-sm text-muted-foreground font-fangsong mb-4">
        可搜索的古代女性人物库，按朝代职业分类
      </p>
      
      {/* 线条插画装饰 */}
      <div className="flex justify-center mb-4">
        <img 
          src={lineHistory} 
          alt="历史资料线条画" 
          className="w-40 h-40 object-cover rounded-lg border border-border/30 opacity-60"
        />
      </div>
      
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full font-fangsong">
            探索资料
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl font-fangsong">
          <DialogHeader>
            <DialogTitle className="font-fangsong">女性历史人物库</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* 搜索和筛选 */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索人物姓名..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 font-fangsong"
                />
              </div>
              <Select value={selectedDynasty} onValueChange={setSelectedDynasty}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="朝代" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  {dynasties.map((d) => (
                    <SelectItem key={d.name} value={d.name}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* 人物列表 */}
            <div ref={listContainerRef} className="grid gap-3 max-h-96 overflow-y-auto">
              {filteredFigures.map((figure) => (
                <div 
                  key={figure.id} 
                  ref={(el) => { figureRefs.current[figure.id] = el; }}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex gap-3">
                    <img 
                      src={figure.image} 
                      alt={figure.name}
                      className="w-24 h-28 object-cover rounded border border-border/30 flex-shrink-0"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold font-fangsong">{figure.name}</h4>
                        <div className="flex gap-1">
                          <Badge className="text-xs font-fangsong">{figure.dynasty}朝</Badge>
                          <Badge variant="outline" className="text-xs font-fangsong">
                            {figure.profession}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {figure.birth} - {figure.death}
                      </p>
                      <p className="text-sm text-muted-foreground font-fangsong leading-relaxed">
                        {figure.description}
                      </p>
                       <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {figure.viewCount}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {figure.likeCount}
                          </div>
                        </div>
                        <Dialog
                          open={openDialogId === figure.id}
                          onOpenChange={(open) => {
                            if (open) {
                              setOpenDialogId(figure.id);
                            } else {
                              setOpenDialogId(null);
                              // 关闭对话框后滚动到卡片位置
                              setTimeout(() => {
                                const element = figureRefs.current[figure.id];
                                if (element && listContainerRef.current) {
                                  const container = listContainerRef.current;
                                  const elementTop = element.offsetTop;
                                  const containerHeight = container.clientHeight;
                                  const scrollPosition = elementTop - (containerHeight / 2) + (element.clientHeight / 2);
                                  
                                  container.scrollTo({ 
                                    top: scrollPosition, 
                                    behavior: 'smooth' 
                                  });
                                }
                              }, 100);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="font-fangsong text-xs">
                              查看详情
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl font-fangsong max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="font-fangsong text-xl">{figure.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="flex gap-4">
                                <img 
                                  src={figure.image} 
                                  alt={figure.name}
                                  className="w-32 h-40 object-cover rounded-lg border border-border/30"
                                />
                                <div className="flex-1 space-y-3">
                                  <div className="flex gap-2 flex-wrap">
                                    <Badge className="font-fangsong">{figure.dynasty}朝</Badge>
                                    <Badge variant="outline" className="font-fangsong">{figure.profession}</Badge>
                                    {figure.tags.map((tag) => (
                                      <Badge key={tag} variant="secondary" className="text-xs font-fangsong">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    <p>{figure.birth} - {figure.death}</p>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Eye className="w-4 h-4" />
                                      <span>{figure.viewCount} 浏览</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Heart className="w-4 h-4" />
                                      <span>{figure.likeCount} 点赞</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <div>
                                  <h4 className="font-bold text-sm mb-2 font-fangsong">人物简介</h4>
                                  <p className="text-sm text-muted-foreground leading-relaxed font-fangsong">
                                    {figure.description}
                                  </p>
                                </div>
                                
                                <div>
                                  <h4 className="font-bold text-sm mb-2 font-fangsong">主要成就</h4>
                                  <ul className="space-y-1">
                                    {figure.achievements.map((achievement, idx) => (
                                      <li key={idx} className="text-sm text-muted-foreground font-fangsong flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>{achievement}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div>
                                  <h4 className="font-bold text-sm mb-2 font-fangsong">现代意义</h4>
                                  <p className="text-sm text-muted-foreground leading-relaxed font-fangsong">
                                    {figure.modernRelevance}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </section>
  );
};