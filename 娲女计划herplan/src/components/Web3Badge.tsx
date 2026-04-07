import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Award, 
  Star, 
  BookOpen, 
  PenTool, 
  Users, 
  Crown,
  Shield,
  Gem,
  ExternalLink
} from "lucide-react";

interface NFTBadge {
  id: string;
  name: string;
  description: string;
  icon: any;
  rarity: "common" | "rare" | "epic" | "legendary";
  earned: boolean;
  earnedDate?: string;
  requirement: string;
  nftAddress?: string;
  tokenId?: string;
}

interface Web3BadgeProps {
  userAddress?: string;
  size?: "small" | "medium" | "large";
  showTitle?: boolean;
}

export const Web3Badge = ({ userAddress, size = "medium", showTitle = true }: Web3BadgeProps) => {
  const [selectedBadge, setSelectedBadge] = useState<NFTBadge | null>(null);
  const { toast } = useToast();

  const badges: NFTBadge[] = [
    {
      id: "newcomer",
      name: "社区新人",
      description: "欢迎加入娲女计划社区！这是您女性历史重构之旅的起点。",
      icon: Star,
      rarity: "common",
      earned: true,
      earnedDate: "2024-01-15",
      requirement: "成功连接钱包并加入社区",
      nftAddress: "0x1234...5678",
      tokenId: "001"
    },
    {
      id: "reader",
      name: "历史阅读者",
      description: "深入阅读古代女性历史资料，发现被遗忘的智慧。",
      icon: BookOpen,
      rarity: "common",
      earned: true,
      earnedDate: "2024-01-18",
      requirement: "阅读10篇历史资料",
      nftAddress: "0x1234...5678",
      tokenId: "002"
    },
    {
      id: "writer",
      name: "故事创作者",
      description: "运用AI辅助，重新改编古代女性故事，展现她们的真实面貌。",
      icon: PenTool,
      rarity: "rare",
      earned: false,
      requirement: "完成并发布3篇改编故事",
    },
    {
      id: "community_leader",
      name: "社区领袖",
      description: "积极参与社区讨论，引导有价值的对话和思考。",
      icon: Users,
      rarity: "rare",
      earned: false,
      requirement: "参与10次讨论且获得50个点赞",
    },
    {
      id: "governance_pioneer",
      name: "治理先锋",
      description: "积极参与DAO治理，为社区发展贡献智慧。",
      icon: Shield,
      rarity: "epic",
      earned: false,
      requirement: "参与5次治理投票",
    },
    {
      id: "historian",
      name: "女性史学家",
      description: "在女性历史研究领域做出卓越贡献的学者。",
      icon: Crown,
      rarity: "legendary",
      earned: false,
      requirement: "发表高质量研究并获得社区认可",
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "text-muted-foreground border-border";
      case "rare": return "text-primary border-primary/50";
      case "epic": return "text-secondary border-secondary/50";
      case "legendary": return "text-accent border-accent/50";
      default: return "text-muted-foreground border-border";
    }
  };

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case "common": return "普通";
      case "rare": return "稀有";
      case "epic": return "史诗";
      case "legendary": return "传说";
      default: return "普通";
    }
  };

  const handleViewOnChain = (badge: NFTBadge) => {
    if (badge.nftAddress && badge.tokenId) {
      toast({
        title: "查看链上信息",
        description: `打开区块链浏览器查看 NFT: ${badge.tokenId}`,
      });
    }
  };

  const earnedBadges = badges.filter(badge => badge.earned);
  const availableBadges = badges.filter(badge => !badge.earned);

  if (size === "small") {
    return (
      <div className="flex gap-1">
        {earnedBadges.slice(0, 3).map((badge) => {
          const IconComponent = badge.icon;
          return (
            <div 
              key={badge.id}
              className={`w-6 h-6 rounded-full border flex items-center justify-center ${getRarityColor(badge.rarity)} bg-muted/30`}
              title={badge.name}
            >
              <IconComponent className="w-3 h-3" />
            </div>
          );
        })}
        {earnedBadges.length > 3 && (
          <div className="w-6 h-6 rounded-full border border-border bg-muted/30 flex items-center justify-center text-xs">
            +{earnedBadges.length - 3}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="ancient-card">
      {showTitle && (
        <CardHeader>
          <CardTitle className="font-fangsong flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            数字徽章
          </CardTitle>
        </CardHeader>
      )}
      
      <CardContent>
        {earnedBadges.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium font-fangsong text-primary mb-3">已获得 ({earnedBadges.length})</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {earnedBadges.map((badge) => {
                const IconComponent = badge.icon;
                return (
                  <Dialog key={badge.id}>
                    <DialogTrigger asChild>
                      <div 
                        className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${getRarityColor(badge.rarity)} bg-muted/30`}
                      >
                        <div className="text-center">
                          <IconComponent className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-xs font-fangsong font-medium">{badge.name}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {getRarityText(badge.rarity)}
                          </Badge>
                        </div>
                      </div>
                    </DialogTrigger>
                    
                    <DialogContent className="ancient-card-dialog max-w-md">
                      <DialogHeader>
                        <DialogTitle className="font-fangsong flex items-center gap-2">
                          <IconComponent className={`w-6 h-6 ${getRarityColor(badge.rarity).split(' ')[0]}`} />
                          {badge.name}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="text-center p-4 bg-muted/30 rounded-lg">
                          <IconComponent className={`w-16 h-16 mx-auto mb-2 ${getRarityColor(badge.rarity).split(' ')[0]}`} />
                          <Badge variant="outline" className="mb-2">
                            {getRarityText(badge.rarity)}
                          </Badge>
                          <p className="text-sm font-fangsong text-muted-foreground">
                            获得时间：{badge.earnedDate}
                          </p>
                        </div>
                        
                        <div>
                          <h5 className="font-medium font-fangsong mb-2">描述</h5>
                          <p className="text-sm text-muted-foreground font-fangsong">
                            {badge.description}
                          </p>
                        </div>
                        
                        {badge.nftAddress && (
                          <div>
                            <h5 className="font-medium font-fangsong mb-2">链上信息</h5>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p>合约地址: {badge.nftAddress}</p>
                              <p>Token ID: {badge.tokenId}</p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleViewOnChain(badge)}
                              className="mt-2 font-fangsong"
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              查看链上信息
                            </Button>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <h4 className="font-medium font-fangsong text-muted-foreground mb-3">
            可获得 ({availableBadges.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableBadges.map((badge) => {
              const IconComponent = badge.icon;
              return (
                <div 
                  key={badge.id}
                  className="p-3 rounded-lg border border-border bg-muted/20 opacity-60"
                  title={badge.requirement}
                >
                  <div className="text-center">
                    <IconComponent className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs font-fangsong font-medium text-muted-foreground">{badge.name}</p>
                    <Badge variant="outline" className="mt-1 text-xs opacity-50">
                      {getRarityText(badge.rarity)}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground font-fangsong text-center">
            通过参与社区活动获得独特的NFT徽章，见证您的女性历史重构之旅
          </p>
        </div>
      </CardContent>
    </Card>
  );
};