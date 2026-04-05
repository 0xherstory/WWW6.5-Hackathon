import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Users, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  MessageCircle,
  Video,
  BookOpen,
  Coffee
} from "lucide-react";
import lineActivity from "@/assets/line-activity.jpg";
import { Web3Governance } from "@/components/Web3Governance";
import { Web3Badge } from "@/components/Web3Badge";

const ActivityPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  const upcomingActivities = [
    {
      id: "1",
      title: "《红楼梦》中女性角色重新解读",
      date: "2024-01-15",
      time: "19:30 - 21:00",
      type: "线上讨论",
      participants: 23,
      maxParticipants: 30,
      host: "张教授",
      description: "深入探讨红楼梦中各个女性角色的现代意义和社会价值重构",
      tags: ["文学讨论", "角色分析"],
      status: "报名中"
    },
    {
      id: "2", 
      title: "古代女性职业探讨会",
      date: "2024-01-22",
      time: "14:00 - 16:00",
      type: "线下沙龙",
      participants: 18,
      maxParticipants: 25,
      host: "李博士",
      description: "从历史文献中挖掘古代女性的多元职业选择，探讨她们的社会贡献",
      tags: ["历史研究", "职业发展"],
      status: "报名中"
    },
    {
      id: "3",
      title: "女性历史故事改编分享",
      date: "2024-01-29", 
      time: "20:00 - 21:30",
      type: "线上分享",
      participants: 31,
      maxParticipants: 50,
      host: "社区成员",
      description: "分享原创的古代女性故事改编作品，互相交流创作心得",
      tags: ["创作分享", "同伴互助"],
      status: "进行中"
    }
  ];

  const pastActivities = [
    {
      title: "武则天政治智慧解析",
      date: "2024-01-08",
      participants: 45,
      rating: 4.8,
      highlights: ["政治策略", "女性领导力", "历史背景"],
      recordings: true
    },
    {
      title: "花木兰精神的现代诠释",
      date: "2024-01-01",
      participants: 38,
      rating: 4.6,
      highlights: ["女性勇气", "家庭责任", "个人选择"],
      recordings: true
    }
  ];

  const activityTypes = [
    { 
      type: "读书会", 
      icon: BookOpen, 
      description: "经典文学中的女性角色解读",
      count: 12
    },
    { 
      type: "专题讲座", 
      icon: Video, 
      description: "专家学者分享研究成果",
      count: 8
    },
    { 
      type: "创作沙龙", 
      icon: Coffee, 
      description: "原创作品分享与讨论",
      count: 15
    },
    { 
      type: "在线讨论", 
      icon: MessageCircle, 
      description: "主题讨论与观点交流",
      count: 20
    }
  ];

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
              <Users className="w-6 h-6 text-secondary" />
              <h1 className="text-2xl font-bold gradient-text font-fangsong">女性活动中心</h1>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* 左侧：活动日历 */}
          <div className="lg:col-span-1">
            <Card className="ancient-card sticky top-24">
              <CardHeader>
                <CardTitle className="font-fangsong">活动日历</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
                <div className="mt-4 space-y-4">
                  <div className="flex justify-center">
                    <img 
                      src={lineActivity} 
                      alt="女性活动线条画" 
                      className="w-16 h-16 object-cover rounded-lg border border-border/30 opacity-60"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground font-fangsong text-center">
                    加入我们，一起重新发现古代女性的智慧与力量
                  </p>
                  
                  {/* Web3 徽章展示 */}
                  <Web3Badge size="small" showTitle={false} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：活动内容 */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="upcoming" className="font-fangsong">即将开始</TabsTrigger>
                <TabsTrigger value="past" className="font-fangsong">往期回顾</TabsTrigger>
                <TabsTrigger value="types" className="font-fangsong">活动类型</TabsTrigger>
                <TabsTrigger value="governance" className="font-fangsong">社区治理</TabsTrigger>
              </TabsList>

              {/* 即将开始的活动 */}
              <TabsContent value="upcoming" className="space-y-6">
                <div className="grid gap-6">
                  {upcomingActivities.map((activity) => (
                    <Card key={activity.id} className="ancient-card">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="font-fangsong text-lg">
                              {activity.title}
                            </CardTitle>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4" />
                                {activity.date}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {activity.time}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {activity.type}
                              </div>
                            </div>
                          </div>
                          <Badge 
                            variant={activity.status === "报名中" ? "default" : "secondary"}
                            className="font-fangsong"
                          >
                            {activity.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground font-fangsong mb-4">
                          {activity.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {activity.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="font-fangsong">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs">
                                  {activity.host.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-fangsong">主持：{activity.host}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {activity.participants}/{activity.maxParticipants} 人
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="font-fangsong"
                              onClick={() => setSelectedActivity(activity.id)}
                            >
                              查看详情
                            </Button>
                            {activity.status === "报名中" && (
                              <Button size="sm" className="font-fangsong">
                                立即报名
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* 往期活动 */}
              <TabsContent value="past" className="space-y-6">
                <div className="grid gap-6">
                  {pastActivities.map((activity, index) => (
                    <Card key={index} className="ancient-card">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold font-fangsong text-lg">{activity.title}</h3>
                            <p className="text-sm text-muted-foreground">{activity.date}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm">⭐ {activity.rating}</div>
                            <div className="text-sm text-muted-foreground">
                              {activity.participants} 人参与
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {activity.highlights.map((highlight, idx) => (
                            <Badge key={idx} variant="secondary" className="font-fangsong">
                              {highlight}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {activity.recordings && (
                              <Badge variant="outline" className="font-fangsong">
                                <Video className="w-3 h-3 mr-1" />
                                有录播
                              </Badge>
                            )}
                          </div>
                          <Button size="sm" variant="outline" className="font-fangsong">
                            观看回放
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* 活动类型 */}
              <TabsContent value="types" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {activityTypes.map((type, index) => {
                    const IconComponent = type.icon;
                    return (
                      <Card key={index} className="ancient-card">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <IconComponent className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-bold font-fangsong">{type.type}</h3>
                              <p className="text-sm text-muted-foreground">
                                已举办 {type.count} 场
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground font-fangsong mb-4">
                            {type.description}
                          </p>
                          <Button size="sm" variant="outline" className="w-full font-fangsong">
                            查看该类型活动
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Web3 社区治理 */}
              <TabsContent value="governance" className="space-y-6">
                <Web3Governance />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ActivityPage;