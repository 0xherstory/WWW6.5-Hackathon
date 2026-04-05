import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Vote, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus,
  PenTool,
  Link as LinkIcon
} from "lucide-react";
import bgWillowLeaves from "@/assets/bg-willow-leaves.jpg";

interface Proposal {
  id: string;
  title: string;
  description: string;
  author: string;
  status: "active" | "passed" | "rejected" | "pending";
  votes: {
    yes: number;
    no: number;
    total: number;
  };
  endDate: string;
  category: "content" | "governance" | "features";
}

export const Web3Governance = () => {
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [showCreateProposal, setShowCreateProposal] = useState(false);
  const [newProposal, setNewProposal] = useState({
    title: "",
    description: "",
    category: "content"
  });
  const { toast } = useToast();

  const proposals: Proposal[] = [
    {
      id: "1",
      title: "将《聊斋志异》中的女性角色纳入重点改编对象",
      description: "建议将蒲松龄笔下的女性角色如婴宁、聂小倩等作为社区重点改编和讨论的对象，发掘她们被遮蔽的主体性。",
      author: "0x1234...5678",
      status: "active",
      votes: { yes: 156, no: 23, total: 179 },
      endDate: "2024-02-15",
      category: "content"
    },
    {
      id: "2", 
      title: "设立「女性历史研究」奖学金计划",
      description: "通过DAO资金池设立奖学金，支持年轻学者进行古代女性历史研究，推动学术界对女性议题的关注。",
      author: "0x5678...9abc",
      status: "active",
      votes: { yes: 298, no: 45, total: 343 },
      endDate: "2024-02-20",
      category: "governance"
    },
    {
      id: "3",
      title: "开发AI辅助的古代女性职业数据库",
      description: "建设一个包含各朝代女性职业信息的AI检索系统，帮助用户更好地了解古代女性的社会角色。",
      author: "0x9abc...def0",
      status: "passed",
      votes: { yes: 421, no: 67, total: 488 },
      endDate: "2024-01-30",
      category: "features"
    }
  ];

  const handleVote = (proposalId: string, vote: "yes" | "no") => {
    toast({
      title: "投票成功",
      description: `您已成功对提案 #${proposalId} 投票`,
    });
  };

  const handleCreateProposal = () => {
    if (!newProposal.title || !newProposal.description) {
      toast({
        title: "请完善提案信息",
        description: "标题和描述为必填项",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "提案已提交",
      description: "您的提案已提交至治理系统，等待社区审核",
    });
    
    setNewProposal({ title: "", description: "", category: "content" });
    setShowCreateProposal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-blue-500";
      case "passed": return "bg-green-500";
      case "rejected": return "bg-red-500";
      case "pending": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "投票中";
      case "passed": return "已通过";
      case "rejected": return "已否决";
      case "pending": return "待审核";
      default: return "未知";
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case "content": return "内容提案";
      case "governance": return "治理提案";
      case "features": return "功能提案";
      default: return "其他";
    }
  };

  return (
    <div 
      className="relative min-h-[600px] p-6 rounded-lg book-spine"
      style={{
        backgroundImage: `url(${bgWillowLeaves})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-background/85 backdrop-blur-sm rounded-lg" />
      
      {/* 内容 */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Vote className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold gradient-text font-fangsong">社区治理</h3>
          </div>
          
          <Dialog open={showCreateProposal} onOpenChange={setShowCreateProposal}>
            <DialogTrigger asChild>
              <Button className="font-fangsong book-spine">
                <Plus className="w-4 h-4 mr-2" />
                发起提案
              </Button>
            </DialogTrigger>
            <DialogContent className="ancient-card-dialog max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-fangsong flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-primary" />
                  发起新提案
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium font-fangsong mb-2 block">提案标题</label>
                  <Input
                    placeholder="请输入提案标题"
                    value={newProposal.title}
                    onChange={(e) => setNewProposal({...newProposal, title: e.target.value})}
                    className="font-fangsong"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium font-fangsong mb-2 block">提案类型</label>
                  <select 
                    value={newProposal.category}
                    onChange={(e) => setNewProposal({...newProposal, category: e.target.value})}
                    className="w-full p-2 rounded-md border border-input bg-background font-fangsong"
                  >
                    <option value="content">内容提案</option>
                    <option value="governance">治理提案</option>
                    <option value="features">功能提案</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium font-fangsong mb-2 block">提案描述</label>
                  <Textarea
                    placeholder="详细描述您的提案内容..."
                    value={newProposal.description}
                    onChange={(e) => setNewProposal({...newProposal, description: e.target.value})}
                    className="min-h-[120px] font-fangsong"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleCreateProposal} className="flex-1 font-fangsong">
                    提交提案
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateProposal(false)}
                    className="font-fangsong"
                  >
                    取消
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {proposals.map((proposal) => (
            <Card key={proposal.id} className="ancient-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="font-fangsong">
                        {getCategoryText(proposal.category)}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(proposal.status)} text-white border-none font-fangsong`}
                      >
                        {getStatusText(proposal.status)}
                      </Badge>
                    </div>
                    <CardTitle className="font-fangsong text-lg mb-2">
                      {proposal.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground font-fangsong">
                      发起人：{proposal.author} | 截止时间：{proposal.endDate}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-muted-foreground font-fangsong mb-4">
                  {proposal.description}
                </p>
                
                {/* 投票结果 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-fangsong">赞成票</span>
                    <span className="font-fangsong">{proposal.votes.yes} / {proposal.votes.total}</span>
                  </div>
                  <Progress 
                    value={(proposal.votes.yes / proposal.votes.total) * 100} 
                    className="h-2"
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span className="font-fangsong">共 {proposal.votes.total} 人参与投票</span>
                    </div>
                    
                    {proposal.status === "active" && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleVote(proposal.id, "no")}
                          className="font-fangsong"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          反对
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleVote(proposal.id, "yes")}
                          className="font-fangsong"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          赞成
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground font-fangsong">
            通过钱包签名参与社区治理，您的每一票都是对女性历史价值重构的支持
          </p>
        </div>
      </div>
    </div>
  );
};