import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { Coins, Clock, Shield, Star, User, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { contractActions } from "@/lib/contracts";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const initialMockBids = [
  { id: 1, bidder: "Alice", reputation: 4.8, resources: "10年HR经验 + 行业人脉", resourcesEn: "10yr HR + industry connections", share: "20%", deposit: 50, isMyBid: false },
  { id: 2, bidder: "Bob", reputation: 4.5, resources: "职业规划师 + 面试辅导", resourcesEn: "Career planner + interview coaching", share: "15%", deposit: 40, isMyBid: false },
  { id: 3, bidder: "Carol", reputation: 4.9, resources: "3次成功转型经验", resourcesEn: "3 successful transitions", share: "25%", deposit: 60, isMyBid: false },
];

type ChainGoal = {
  id: number;
  title: string;
  bounty: number;
  deadline: number;
  creator: string;
};

const BidPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [myBid, setMyBid] = useState({ resources: "", share: "", deposit: "" });
  const [goal, setGoal] = useState<ChainGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allBids, setAllBids] = useState(initialMockBids);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const isOwner = user && goal && user.address.toLowerCase() === goal.creator.toLowerCase();

  useEffect(() => {
    // Load existing local bids for this goal
    const savedBids = JSON.parse(localStorage.getItem("my_bids") || "[]");
    const existingBid = savedBids.find((b: any) => b.goalId === id);
    if (existingBid) {
      setHasSubmitted(true);
      const newBid = {
        id: Date.now(),
        bidder: user?.displayAddress || "Me",
        reputation: 5.0,
        resources: existingBid.resources,
        resourcesEn: existingBid.resources,
        share: `${existingBid.share}%`,
        deposit: Number(existingBid.deposit),
        isMyBid: true,
      };
      setAllBids(prev => [newBid, ...prev]);
    }

    // Load selected partner from localStorage
    const activeProjects = JSON.parse(localStorage.getItem("active_projects") || "[]");
    const currentProject = activeProjects.find((p: any) => p.id === id);
    if (currentProject) {
      setAllBids(prev => prev.map(b => 
        b.bidder === currentProject.partner ? { ...b, status: "Selected" } : b
      ));
    }

    const load = async () => {
      const numId = Number(id);
      if (!Number.isFinite(numId)) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const goals = await contractActions.getGoals();
        const found = goals.find((g) => g.id === numId) ?? null;
        setGoal(found);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async () => {
    if (!myBid.resources || !myBid.share || !myBid.deposit) {
      toast({
        title: language === "zh" ? "请填写完整信息" : "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate submission
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newBidData = {
        goalId: id,
        title: goal ? (goal.title.split("\n")[0] || goal.title) : (language === "zh" ? "30天内完成职场转型计划" : "30-Day Career Transformation Plan"),
        bounty: goal ? goal.bounty : 200,
        resources: myBid.resources,
        share: myBid.share,
        deposit: myBid.deposit,
        timestamp: Date.now(),
        status: "pending",
      };

      // Save to localStorage
      const savedBids = JSON.parse(localStorage.getItem("my_bids") || "[]");
      localStorage.setItem("my_bids", JSON.stringify([newBidData, ...savedBids.filter((b: any) => b.goalId !== id)]));

      // Update UI
      const newBidUI = {
        id: Date.now(),
        bidder: user?.displayAddress || "Me",
        reputation: 5.0,
        resources: myBid.resources,
        resourcesEn: myBid.resources,
        share: `${myBid.share}%`,
        deposit: Number(myBid.deposit),
        isMyBid: true,
      };

      setAllBids(prev => [newBidUI, ...prev]);
      setHasSubmitted(true);
      
      toast({
        title: language === "zh" ? "竞拍提交成功！" : "Bid submitted successfully!",
      });
    } catch (error) {
      toast({
        title: language === "zh" ? "提交失败" : "Submission failed",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectPartner = (bid: any) => {
    // 1. Update bid status in local mock (simulating contract state)
    setAllBids(prev => prev.map(b => 
      b.id === bid.id ? { ...b, status: "Selected" } : b
    ));

    // 2. Save to active projects for Growth page
    const activeProjects = JSON.parse(localStorage.getItem("active_projects") || "[]");
    const newProject = {
      id: id,
      title: goal ? (goal.title.split("\n")[0] || goal.title) : (language === "zh" ? "30天内完成职场转型计划" : "30-Day Career Transformation Plan"),
      partner: bid.bidder,
      bounty: goal ? goal.bounty : 200,
      timestamp: Date.now(),
      status: "in_progress",
      role: isOwner ? "publisher" : "partner"
    };
    
    // Avoid duplicates
    if (!activeProjects.find((p: any) => p.id === id)) {
      localStorage.setItem("active_projects", JSON.stringify([newProject, ...activeProjects]));
    }

    toast({
      title: language === "zh" ? "伙伴选择成功" : "Partner selected",
      description: language === "zh" ? `你已选择 ${bid.bidder} 作为你的成长伙伴，契约已生效。` : `You have selected ${bid.bidder} as your growth partner. The contract is now active.`,
    });

    // 3. Redirect to Growth page after a short delay
    setTimeout(() => {
      navigate("/growth");
    }, 1500);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="container mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-2">
            {language === "zh" ? "竞拍" : "Bid for "}
            <span className="text-gradient-primary">{language === "zh" ? "成长伙伴" : "Growth Partner"}</span>
          </h1>
          <p className="text-muted-foreground mb-8">
            {language === "zh" ? `需求 #${id} — 为这位用户提供你的资源与支持` : `Demand #${id} — Offer your resources and support`}
          </p>
        </motion.div>

        {/* Need summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-8"
        >
          <h2 className="font-display font-semibold text-xl mb-2">
            {goal
              ? (goal.title.split("\n")[0] || goal.title)
              : language === "zh"
                ? "30天内完成职场转型计划"
                : "30-Day Career Transformation Plan"}
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            {goal
              ? (goal.title.split("Description: ")[1]?.split("Goal: ")[0] || goal.title)
              : language === "zh"
                ? "从传统行业转向Web3，需要有经验的伙伴指导"
                : "Transitioning to Web3, need experienced partner guidance"}
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1 text-primary">
              <Coins className="w-4 h-4" /> {goal ? `${goal.bounty} AVAX` : "200 USDC"}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" /> {goal ? `${Math.max(0, Math.floor((goal.deadline - Math.floor(Date.now() / 1000)) / 86400))}天` : language === "zh" ? "14天" : "14 days"}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Shield className="w-4 h-4" /> {language === "zh" ? "双向质押" : "Dual Staking"}
            </span>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Existing bids */}
          <div className="lg:col-span-3">
            <h2 className="font-display font-semibold text-lg mb-4">
              {language === "zh" ? `当前竞拍 (${allBids.length})` : `Current Bids (${allBids.length})`}
            </h2>
            <div className="space-y-4">
              {allBids.map((bid, i) => (
                <motion.div
                  key={bid.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.1 }}
                  className={`glass-card p-5 transition-colors ${bid.isMyBid ? 'border-primary/50 bg-primary/5' : 'hover:border-primary/30'}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bid.isMyBid ? 'bg-gradient-to-br from-primary to-accent' : 'bg-gradient-to-br from-secondary to-accent'}`}>
                        <User className={`w-5 h-5 ${bid.isMyBid ? 'text-primary-foreground' : 'text-secondary-foreground'}`} />
                      </div>
                      <div>
                        <div className="font-display font-semibold flex items-center gap-2">
                          {bid.bidder}
                          {bid.isMyBid && (
                            <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full uppercase">
                              {language === "zh" ? "我的" : "Mine"}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-primary">
                          <Star className="w-3.5 h-3.5 fill-primary" />
                          {bid.reputation}
                        </div>
                      </div>
                    </div>
                    {isOwner && user?.role === "publisher" && !bid.isMyBid && (
                      <button 
                        onClick={() => handleSelectPartner(bid)}
                        disabled={(bid as any).status === "Selected"}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                          (bid as any).status === "Selected"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" 
                            : "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                        }`}
                      >
                        {(bid as any).status === "Selected" ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {language === "zh" ? "已选择" : "Selected"}
                          </>
                        ) : (
                          <>
                            {language === "zh" ? "选择" : "Select"}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    📦 {language === "zh" ? bid.resources : bid.resourcesEn}
                  </p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>{language === "zh" ? "分成" : "Share"}：{bid.share}</span>
                    <span>{language === "zh" ? "保证金" : "Deposit"}：{bid.deposit} USDC</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Place bid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <h2 className="font-display font-semibold text-lg mb-4">
              {language === "zh" ? "提交竞拍" : "Place Bid"}
            </h2>
            <div className="glass-card p-6 space-y-4">
              {isOwner ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                    <User className="w-8 h-8 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg">
                      {language === "zh" ? "你是发布者" : "You are the Publisher"}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {language === "zh" ? "作为此需求的发布者，你不能参与竞拍。请从左侧列表中选择最适合的成长伙伴。" : "As the publisher of this need, you cannot place a bid. Please select the best partner from the list."}
                    </p>
                  </div>
                </div>
              ) : hasSubmitted ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg">
                      {language === "zh" ? "竞拍已提交" : "Bid Submitted"}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {language === "zh" ? "你已成功参与此需求的竞拍，请等待发布者选择。" : "You've successfully joined the bid. Please wait for the publisher's selection."}
                    </p>
                  </div>
                  <button 
                    onClick={() => setHasSubmitted(false)}
                    className="text-xs text-primary hover:underline"
                  >
                    {language === "zh" ? "修改我的竞拍信息" : "Update my bid"}
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === "zh" ? "你的资源" : "Your Resources"}
                    </label>
                    <textarea
                      value={myBid.resources}
                      onChange={(e) => setMyBid((p) => ({ ...p, resources: e.target.value }))}
                      placeholder={language === "zh" ? "描述你能提供的时间、人脉、经验..." : "Describe your time, connections, experience..."}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === "zh" ? "分成比例 (%)" : "Share (%)"}
                    </label>
                    <input
                      type="number"
                      value={myBid.share}
                      onChange={(e) => setMyBid((p) => ({ ...p, share: e.target.value }))}
                      placeholder="20"
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === "zh" ? "保证金 (USDC)" : "Deposit (USDC)"}
                    </label>
                    <input
                      type="number"
                      value={myBid.deposit}
                      onChange={(e) => setMyBid((p) => ({ ...p, deposit: e.target.value }))}
                      placeholder="50"
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-secondary to-accent text-secondary-foreground font-display font-semibold glow-secondary hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      language === "zh" ? "提交竞拍" : "Submit Bid"
                    )}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BidPage;
