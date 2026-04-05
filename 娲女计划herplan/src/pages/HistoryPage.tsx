import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  BookOpen, 
  Search, 
  Filter,
  Eye,
  Heart,
  Star,
  Map,
  Clock
} from "lucide-react";
import lineHistory from "@/assets/line-history.jpg";
import { historicalFigures, dynasties, professions, HistoricalFigure } from "@/data/historicalFigures";

// Historical figures data management component
const HistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDynasty, setSelectedDynasty] = useState("");
  const [selectedProfession, setSelectedProfession] = useState("");
  const [selectedFigure, setSelectedFigure] = useState<HistoricalFigure | null>(null);
  const figureRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const filteredFigures = historicalFigures.filter(figure => {
    const matchesSearch = searchTerm === "" || figure.name.includes(searchTerm) || figure.description.includes(searchTerm);
    const matchesDynasty = selectedDynasty === "" || selectedDynasty === "all" || figure.dynasty === selectedDynasty;
    const matchesProfession = selectedProfession === "" || selectedProfession === "all" || figure.profession === selectedProfession;
    return matchesSearch && matchesDynasty && matchesProfession;
  });

  const handleViewDetails = useCallback((figure: HistoricalFigure) => {
    setSelectedFigure(figure);
  }, []);

  const handleBackToList = useCallback(() => {
    const figureId = selectedFigure?.id;
    setSelectedFigure(null);
    
    // 返回后滚动到之前的位置
    if (figureId) {
      setTimeout(() => {
        figureRefs.current[figureId]?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 100);
    }
  }, [selectedFigure]);

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
              <BookOpen className="w-6 h-6 text-accent" />
              <h1 className="text-2xl font-bold gradient-text font-fangsong">女性历史资料库</h1>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        {selectedFigure ? (
          /* 人物详情页面 */
          <div className="max-w-4xl mx-auto">
            <Button 
              onClick={handleBackToList}
              variant="outline" 
              className="mb-6 font-fangsong"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回人物列表
            </Button>
            
            <Card className="ancient-card">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <img 
                      src={selectedFigure.image} 
                      alt={selectedFigure.name}
                      className="w-full h-64 object-cover rounded-lg border border-border/30"
                    />
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-bold gradient-text font-fangsong">
                        {selectedFigure.name}
                      </h2>
                      <div className="flex justify-center gap-2">
                        <Badge className="font-fangsong">{selectedFigure.dynasty}朝</Badge>
                        <Badge variant="outline" className="font-fangsong">
                          {selectedFigure.profession}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedFigure.birth} - {selectedFigure.death}
                      </p>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <h3 className="text-lg font-bold font-fangsong mb-3">人物简介</h3>
                      <p className="text-muted-foreground font-fangsong leading-relaxed">
                        {selectedFigure.description}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold font-fangsong mb-3">主要成就</h3>
                      <ul className="space-y-2">
                        {selectedFigure.achievements.map((achievement: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 font-fangsong">
                            <Star className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold font-fangsong mb-3">现代意义</h3>
                      <p className="text-muted-foreground font-fangsong leading-relaxed">
                        {selectedFigure.modernRelevance}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold font-fangsong mb-3">相关标签</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedFigure.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary" className="font-fangsong">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 pt-4 border-t">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Eye className="w-4 h-4" />
                        {selectedFigure.viewCount} 浏览
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Heart className="w-4 h-4" />
                        {selectedFigure.likeCount} 喜欢
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* 人物列表页面 */
          <div className="grid lg:grid-cols-4 gap-8">
            {/* 左侧：搜索和筛选 */}
            <div className="lg:col-span-1">
              <Card className="ancient-card sticky top-24">
                <CardHeader>
                  <CardTitle className="font-fangsong">搜索筛选</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索人物姓名..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 font-fangsong"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 font-fangsong">朝代</label>
                    <Select value={selectedDynasty} onValueChange={setSelectedDynasty}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择朝代" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部朝代</SelectItem>
                        <SelectItem value="商">商朝</SelectItem>
                        <SelectItem value="汉">汉朝</SelectItem>
                        <SelectItem value="唐">唐朝</SelectItem>
                        <SelectItem value="宋">宋朝</SelectItem>
                        <SelectItem value="元">元朝</SelectItem>
                        <SelectItem value="明">明朝</SelectItem>
                        <SelectItem value="清">清朝</SelectItem>
                        <SelectItem value="北魏">北魏</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 font-fangsong">职业</label>
                    <Select value={selectedProfession} onValueChange={setSelectedProfession}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择职业" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部职业</SelectItem>
                        {professions.map((prof) => (
                          <SelectItem key={prof} value={prof}>{prof}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-center pt-4">
                    <img 
                      src={lineHistory} 
                      alt="历史资料线条画" 
                      className="w-16 h-16 object-cover rounded-lg border border-border/30 opacity-60"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右侧：内容区域 */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="figures" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="figures" className="font-fangsong">历史人物</TabsTrigger>
                  <TabsTrigger value="dynasties" className="font-fangsong">朝代概览</TabsTrigger>
                  <TabsTrigger value="timeline" className="font-fangsong">时间轴</TabsTrigger>
                </TabsList>

                {/* 历史人物列表 */}
                <TabsContent value="figures" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground font-fangsong">
                      找到 {filteredFigures.length} 位历史人物
                    </p>
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      <span className="text-sm font-fangsong">按热度排序</span>
                    </div>
                  </div>
                  
                  <div className="grid gap-6">
                    {filteredFigures.map((figure) => (
                      <Card 
                        key={figure.id} 
                        ref={(el) => { figureRefs.current[figure.id] = el; }}
                        className="ancient-card cursor-pointer hover:shadow-lg transition-shadow"
                      >
                        <CardContent className="pt-6">
                          <div className="flex gap-4">
                            <img 
                              src={figure.image} 
                              alt={figure.name}
                              className="w-20 h-24 object-cover rounded-lg border border-border/30 flex-shrink-0"
                            />
                            <div className="flex-1 space-y-2">
                              <div className="flex justify-between items-start">
                                <h3 className="font-bold font-fangsong text-lg">{figure.name}</h3>
                                <div className="flex gap-1">
                                  <Badge className="font-fangsong">{figure.dynasty}朝</Badge>
                                  <Badge variant="outline" className="font-fangsong">
                                    {figure.profession}
                                  </Badge>
                                </div>
                              </div>
                              
                              <p className="text-sm text-muted-foreground font-fangsong">
                                {figure.birth} - {figure.death}
                              </p>
                              
                              <p className="text-muted-foreground font-fangsong text-sm leading-relaxed">
                                {figure.description}
                              </p>
                              
                              <div className="flex justify-between items-center pt-2">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Eye className="w-4 h-4" />
                                    {figure.viewCount}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Heart className="w-4 h-4" />
                                    {figure.likeCount}
                                  </div>
                                </div>
                                <Button 
                                  size="sm" 
                                  className="font-fangsong"
                                  onClick={() => handleViewDetails(figure)}
                                >
                                  查看详情
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* 朝代概览 */}
                <TabsContent value="dynasties" className="space-y-6">
                  <div className="grid gap-6">
                    {dynasties.map((dynasty, index) => (
                      <Card key={index} className="ancient-card">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Map className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-bold font-fangsong text-lg">{dynasty.name}朝</h3>
                              <p className="text-sm text-muted-foreground">{dynasty.period}</p>
                            </div>
                          </div>
                          <p className="text-muted-foreground font-fangsong mb-4">
                            {dynasty.characteristics}
                          </p>
                          <Button size="sm" variant="outline" className="font-fangsong">
                            查看该朝代女性人物
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* 时间轴 */}
                <TabsContent value="timeline" className="space-y-6">
                    <Card className="ancient-card">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-6">
                          <Clock className="w-6 h-6 text-primary" />
                          <h3 className="font-bold font-fangsong text-lg">古代女性历史时间轴</h3>
                      </div>
                      
                      <div className="space-y-6">
                        {historicalFigures.sort((a, b) => parseInt(a.birth) - parseInt(b.birth)).map((figure, index) => (
                          <div key={figure.id} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 bg-primary rounded-full"></div>
                              {index < historicalFigures.length - 1 && (
                                <div className="w-px h-16 bg-border mt-2"></div>
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold font-fangsong">{figure.name}</span>
                                <Badge variant="outline" className="font-fangsong text-xs">
                                  {figure.birth} - {figure.death}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground font-fangsong">
                                {figure.dynasty}朝 {figure.profession} - {figure.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HistoryPage;