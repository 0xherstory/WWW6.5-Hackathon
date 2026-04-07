import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Brush, Clock, Users, Trophy, Star } from "lucide-react";
import bgWillowPattern from "@/assets/bg-willow-pattern.jpg";

// 模拟排行榜数据
const mockLeaderboard = [
  { name: "文学爱好者", score: 18, avatar: "🎭" },
  { name: "历史学者", score: 16, avatar: "📚" },
  { name: "传统文化迷", score: 15, avatar: "🏮" },
  { name: "古典诗词人", score: 14, avatar: "✍️" },
  { name: "国学研究员", score: 13, avatar: "📜" },
  { name: "文史专家", score: 12, avatar: "🎨" },
  { name: "古代文明探索者", score: 11, avatar: "🔍" },
  { name: "传统艺术家", score: 10, avatar: "🖌️" }
];

export const ChallengeCard = () => {
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [isEasterEgg, setIsEasterEgg] = useState(false);
  const [showEasterEggPrompt, setShowEasterEggPrompt] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (answers.length > 0) {
        // 如果不是彩蛋挑战且答案超过5个，显示彩蛋提示
        if (!isEasterEgg && answers.length >= 5) {
          setShowEasterEggPrompt(true);
        } else {
          setShowCongrats(true);
        }
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, answers.length, isEasterEgg]);

  const startChallenge = (easterEgg: boolean = false) => {
    setAnswers([]);
    setCurrentAnswer("");
    setTimeLeft(60);
    setIsActive(true);
    setIsEasterEgg(easterEgg);
    setShowEasterEggPrompt(false);
  };

  const addAnswer = () => {
    if (currentAnswer.trim() && !answers.includes(currentAnswer.trim())) {
      setAnswers([...answers, currentAnswer.trim()]);
      setCurrentAnswer("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addAnswer();
    }
  };

  const progress = timeLeft > 0 ? ((60 - timeLeft) / 60) * 100 : 100;

  return (
    <div 
      className="space-y-4 relative overflow-hidden rounded-lg p-4"
      style={{
        backgroundImage: `url(${bgWillowPattern})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* 遮罩层确保文字可读性 */}
      <div className="absolute inset-0 bg-background/85 backdrop-blur-[1px]"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
        <Brush className="w-5 h-5 text-primary" />
        <h4 className="text-lg font-medium text-primary font-fangsong">历史女性挑战</h4>
      </div>
      
      <p className="text-sm text-muted-foreground font-fangsong">
        {isEasterEgg 
          ? "🎉 彩蛋挑战！难度增大：在一分钟内说出十个不同职业的历史女性名字！" 
          : "在一分钟内，尽可能多地说出你知道的历史女性人物名字！"
        }
      </p>
      
      {/* 水墨线条进度条 */}
      <div className="ink-progress">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-ink-dark via-primary to-ink-medium rounded-sm transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-fangsong">时间: {timeLeft}秒</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span className="text-sm font-fangsong">答案数: {answers.length}</span>
        </div>
      </div>
      
      {isActive ? (
        <div className="flex gap-2">
          <Input
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入历史女性人物名字..."
            className="font-fangsong"
          />
          <Button onClick={addAnswer} size="sm" className="font-fangsong">
            <Plus className="w-4 h-4 mr-1" />
            添加
          </Button>
        </div>
      ) : (
        <Button onClick={() => startChallenge(false)} className="w-full font-fangsong">
          {answers.length > 0 ? `开始新挑战 (上次得分: ${answers.length})` : "开始挑战"}
        </Button>
      )}
      
      {answers.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {answers.map((answer, index) => (
            <Badge key={index} variant="secondary" className="font-fangsong">
              {answer}
            </Badge>
          ))}
        </div>
      )}
      </div>

      {/* 恭喜弹窗 */}
      <Dialog open={showCongrats} onOpenChange={setShowCongrats}>
        <DialogContent className="max-w-md mx-auto bg-card/95 backdrop-blur-sm border border-border/50">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-primary font-fangsong flex items-center justify-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              恭喜完成挑战！
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="text-center">
              {isEasterEgg && (
                <div className="mb-3 text-2xl">
                  🎉 彩蛋成就解锁！
                </div>
              )}
              <div className="text-3xl font-bold text-primary mb-2">{answers.length}</div>
              <p className="text-muted-foreground font-fangsong">个历史女性人物</p>
              <div className="flex justify-center gap-1 mt-2">
                {[...Array(Math.min(5, Math.ceil(answers.length / 3)))].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-5 h-5 text-primary" />
                <h4 className="font-medium font-fangsong">答题排行榜</h4>
              </div>
              
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {/* 用户当前分数 */}
                  <div className="flex items-center justify-between bg-primary/10 rounded-lg p-2 border border-primary/20">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">👑</span>
                      <span className="font-medium font-fangsong text-primary">你的成绩</span>
                    </div>
                    <span className="font-bold text-primary">{answers.length}</span>
                  </div>
                  
                  {/* 排行榜数据 */}
                  {mockLeaderboard.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/20 transition-colors animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="flex items-center gap-2">
                        <span className="w-6 text-center text-sm font-medium text-muted-foreground">#{index + 1}</span>
                        <span className="text-lg">{entry.avatar}</span>
                        <span className="font-fangsong text-sm">{entry.name}</span>
                      </div>
                      <span className="font-medium">{entry.score}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            
            <Button 
              onClick={() => setShowCongrats(false)} 
              className="w-full font-fangsong"
            >
              继续探索
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 彩蛋挑战提示弹窗 */}
      <Dialog open={showEasterEggPrompt} onOpenChange={setShowEasterEggPrompt}>
        <DialogContent className="max-w-md mx-auto bg-card/95 backdrop-blur-sm border border-border/50">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-primary font-fangsong flex items-center justify-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              太棒了！发现彩蛋挑战！
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="text-center space-y-3">
              <div className="text-2xl">🎉</div>
              <p className="text-muted-foreground font-fangsong">
                恭喜你说出了 {answers.length} 个历史女性人物！
              </p>
              <p className="text-sm text-muted-foreground font-fangsong">
                是否接受彩蛋挑战？难度增大：在一分钟内说出十个<span className="font-bold text-primary">不同职业</span>的历史女性名字！
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  setShowEasterEggPrompt(false);
                  setShowCongrats(true);
                }} 
                variant="outline"
                className="flex-1 font-fangsong"
              >
                查看成绩
              </Button>
              <Button 
                onClick={() => startChallenge(true)} 
                className="flex-1 font-fangsong bg-gradient-to-r from-primary to-secondary"
              >
                接受挑战
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};