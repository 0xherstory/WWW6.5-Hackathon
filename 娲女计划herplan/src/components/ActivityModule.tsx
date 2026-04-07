import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Users } from "lucide-react";
import lineActivity from "@/assets/line-activity.jpg";
import bgBirdsPattern from "@/assets/bg-birds-pattern.jpg";

export const ActivityModule = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const activities = [
    { date: "2024-01-15", title: "《红楼梦》中女性角色重新解读", participants: 23 },
    { date: "2024-01-22", title: "古代女性职业探讨会", participants: 18 },
    { date: "2024-01-29", title: "女性历史故事改编分享", participants: 31 }
  ];

  return (
    <section 
      className="bento-card relative overflow-hidden"
      style={{
        backgroundImage: `url(${bgBirdsPattern})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* 遮罩层确保文字可读性 */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px]"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
        <Users className="w-6 h-6 text-secondary" />
        <h3 className="text-lg font-bold gradient-text font-fangsong">女性活动</h3>
      </div>
      
      <p className="text-sm text-muted-foreground font-fangsong mb-4">
        线上讨论会、读书分享、主题沙龙
      </p>
      
      {/* 线条插画装饰 */}
      <div className="flex justify-center mb-4">
        <img 
          src={lineActivity} 
          alt="女性活动线条画" 
          className="w-20 h-20 object-cover rounded-lg border border-border/30 opacity-60"
        />
      </div>
      
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full font-fangsong">
            查看活动
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl font-fangsong">
          <DialogHeader>
            <DialogTitle className="font-fangsong">活动日历</DialogTitle>
          </DialogHeader>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium font-fangsong">近期活动</h4>
              {activities.map((activity, index) => (
                <div key={index} className="p-3 border rounded-lg space-y-2">
                  <div className="text-sm text-muted-foreground">{activity.date}</div>
                  <h5 className="font-medium font-fangsong text-sm">{activity.title}</h5>
                  <div className="text-xs text-muted-foreground">
                    {activity.participants} 人参与
                  </div>
                  <Button size="sm" variant="outline" className="w-full font-fangsong">
                    报名参加
                  </Button>
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