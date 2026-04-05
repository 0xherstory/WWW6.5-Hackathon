import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Calendar, 
  Star,
  Eye,
  Archive,
  Heart,
  BookOpen
} from "lucide-react";
import bgPinePattern from "@/assets/bg-pine-pattern.jpg";
import { historicalFigures, dynasties, professions } from "@/data/historicalFigures";

const WomenHistoryArchive = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDynasty, setSelectedDynasty] = useState("");
  const [selectedProfession, setSelectedProfession] = useState("");
  const [openDialogId, setOpenDialogId] = useState<number | null>(null);
  const figureRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const filters = [
    { key: "all", label: "全部", icon: Archive },
    { key: "dynasty", label: "按朝代", icon: Calendar },
    { key: "profession", label: "按职业", icon: BookOpen },
    { key: "popular", label: "热门", icon: Star }
  ];

  const filteredFigures = historicalFigures.filter(figure => {
    const matchesSearch = searchTerm === "" || 
      figure.name.includes(searchTerm) || 
      figure.description.includes(searchTerm) ||
      figure.tags.some(tag => tag.includes(searchTerm));
    const matchesDynasty = selectedDynasty === "" || selectedDynasty === "all" || figure.dynasty === selectedDynasty;
    const matchesProfession = selectedProfession === "" || selectedProfession === "all" || figure.profession === selectedProfession;
    return matchesSearch && matchesDynasty && matchesProfession;
  });

  return (
    <div 
      className="book-module relative overflow-hidden"
      style={{
        backgroundImage: `url(${bgPinePattern})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* 渐变遮罩层确保文字可读性 */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/85 to-background/95 backdrop-blur-[1px]"></div>
      
      <div className="relative z-10">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold gradient-text font-fangsong">女性历史资料库</h2>
            <Badge variant="default" className="font-fangsong">
              <Archive className="w-3 h-3 mr-1" />
              官方资料库
            </Badge>
          </div>
          <p className="text-muted-foreground font-fangsong">经筛选审核的高质量历史资料</p>
        </div>

        {/* 搜索和筛选 */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索人物姓名、标签..."
              className="pl-10 font-fangsong"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={selectedDynasty} onValueChange={setSelectedDynasty}>
              <SelectTrigger className="w-32 font-fangsong">
                <SelectValue placeholder="选择朝代" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部朝代</SelectItem>
                {dynasties.map((d) => (
                  <SelectItem key={d.name} value={d.name}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedProfession} onValueChange={setSelectedProfession}>
              <SelectTrigger className="w-32 font-fangsong">
                <SelectValue placeholder="选择职业" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部职业</SelectItem>
                {professions.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 人物列表 */}
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground font-fangsong mb-3">
            共找到 {filteredFigures.length} 位历史人物
          </div>
          
          {filteredFigures.map((figure) => (
            <Card 
              key={figure.id}
              ref={(el) => { figureRefs.current[figure.id] = el; }}
              className="border-border/50 bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-all duration-200 hover-scale"
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <img 
                    src={figure.image} 
                    alt={figure.name}
                    className="w-16 h-20 object-cover rounded border border-border/30 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="font-fangsong text-lg">{figure.name}</CardTitle>
                      <div className="flex gap-1">
                        <Badge className="font-fangsong text-xs">{figure.dynasty}朝</Badge>
                        <Badge variant="outline" className="font-fangsong text-xs">
                          {figure.profession}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground font-fangsong mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {figure.birth} - {figure.death}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {figure.viewCount}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {figure.likeCount}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-fangsong mb-3 line-clamp-2">
                  {figure.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {figure.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs font-fangsong">
                        {tag}
                      </Badge>
                    ))}
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
                          figureRefs.current[figure.id]?.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                          });
                        }, 100);
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="font-fangsong">
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WomenHistoryArchive;