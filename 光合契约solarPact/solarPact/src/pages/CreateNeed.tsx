import { motion } from "framer-motion";
import { useState } from "react";
import { Sparkles, Info, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { contractActions } from "@/lib/contracts";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const categories = ["职场", "婚恋", "自我", "健康", "转型"];
const categoriesEn: Record<string, string> = {
  "职场": "Career", "婚恋": "Relationship", "自我": "Self", "健康": "Health", "转型": "Transformation",
};

const CreateNeed = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", category: "", description: "", goal: "", bounty: "", deadline: "", anonymous: true,
  });

  const update = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.bounty || !form.deadline) {
      toast({
        title: language === "zh" ? "请填写完整信息" : "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      // 构造合约描述：标题 + 详情 + 目标
      const fullDesc = `[${form.category}] ${form.title}\n\nDescription: ${form.description}\nGoal: ${form.goal}`;
      
      // 合约参数：
      // desc: 描述
      // duration: 持续时间（秒），将天数转换为秒
      // milestones: 里程碑数，默认 1
      // rewardEth: 奖励金额 (ETH)
      const durationSeconds = Number(form.deadline) * 24 * 60 * 60;
      
      await contractActions.createGoal(
        fullDesc,
        durationSeconds,
        1, // 默认 1 个里程碑
        form.bounty
      );

      toast({
        title: language === "zh" ? "发布成功！" : "Published Successfully!",
        description: language === "zh" ? "你的需求已铸造成 NFT 并上链。" : "Your demand has been minted as NFT and published.",
      });

      // 跳转到市场页面查看
      navigate("/marketplace");
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: language === "zh" ? "发布失败" : "Publication Failed",
        description: message || (language === "zh" ? "请检查钱包连接或余额" : "Please check wallet connection or balance"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="container mx-auto max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-2">
            {language === "zh" ? "发布" : "Publish "}
            <span className="text-gradient-primary">{language === "zh" ? "需求" : "Demand"}</span>
          </h1>
          <p className="text-muted-foreground mb-8">
            {language === "zh" ? "将你的恐惧转化为链上任务资产" : "Transform your fear into on-chain task assets"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 space-y-6"
        >
          <div>
            <label className="block text-sm font-medium mb-2">{language === "zh" ? "需求主题" : "Demand Title"}</label>
            <input type="text" value={form.title} onChange={(e) => update("title", e.target.value)}
              placeholder={language === "zh" ? "例如：30天内完成职场转型" : "e.g., Complete career transition in 30 days"}
              className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{language === "zh" ? "分类" : "Category"}</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button key={cat} onClick={() => update("category", cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    form.category === cat ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:text-foreground border border-border/50"
                  }`}>
                  {language === "zh" ? cat : categoriesEn[cat]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{language === "zh" ? "需求描述" : "Description"}</label>
            <textarea value={form.description} onChange={(e) => update("description", e.target.value)}
              placeholder={language === "zh" ? "详细描述你的需求和期望..." : "Describe your demand in detail..."}
              rows={4} className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {language === "zh" ? "目标行动" : "Goal Action"}
              <span className="text-muted-foreground font-normal ml-1">
                {language === "zh" ? "（可验证结果）" : "(Verifiable outcome)"}
              </span>
            </label>
            <input type="text" value={form.goal} onChange={(e) => update("goal", e.target.value)}
              placeholder={language === "zh" ? "例如：完成3次面试" : "e.g., Complete 3 interviews"}
              className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{language === "zh" ? "奖金 (AVAX)" : "Bounty (AVAX)"}</label>
              <input type="number" step="0.01" value={form.bounty} onChange={(e) => update("bounty", e.target.value)} placeholder="0.1"
                className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{language === "zh" ? "期限（天）" : "Deadline (Days)"}</label>
              <input type="number" value={form.deadline} onChange={(e) => update("deadline", e.target.value)} placeholder="30"
                className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/30">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{language === "zh" ? "匿名发布" : "Anonymous"}</span>
            </div>
            <button onClick={() => update("anonymous", !form.anonymous)}
              className={`w-11 h-6 rounded-full transition-colors relative ${form.anonymous ? "bg-primary" : "bg-muted"}`}>
              <div className={`w-5 h-5 rounded-full bg-foreground absolute top-0.5 transition-transform ${form.anonymous ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>

          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
            <p>📋 {language === "zh" ? "发布后将铸造「需求NFT」，奖金将锁入智能合约。" : "A Demand NFT will be minted and bounty locked in smart contract."}</p>
            <p className="mt-1">💡 {language === "zh" ? "伙伴不履约 → 扣保证金 | 发布者作弊 → 信誉扣分" : "Partner default → deposit slashed | Publisher fraud → reputation penalty"}</p>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-amber-400 text-primary-foreground font-display font-semibold text-lg glow-primary hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {language === "zh" ? "铸造需求 NFT 并发布" : "Mint Demand NFT & Publish"}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateNeed;
