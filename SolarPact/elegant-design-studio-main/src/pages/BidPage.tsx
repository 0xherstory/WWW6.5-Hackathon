import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { Coins, Clock, Shield, Star, User, ArrowRight } from "lucide-react";
import { useState } from "react";

const mockBids = [
  { id: 1, bidder: "导师 Alice", reputation: 4.8, resources: "10年HR经验 + 行业人脉", share: "20%", deposit: 50 },
  { id: 2, bidder: "导师 Bob", reputation: 4.5, resources: "职业规划师 + 面试辅导", share: "15%", deposit: 40 },
  { id: 3, bidder: "导师 Carol", reputation: 4.9, resources: "3次成功转型经验", share: "25%", deposit: 60 },
];

const BidPage = () => {
  const { id } = useParams();
  const [myBid, setMyBid] = useState({ resources: "", share: "", deposit: "" });

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="container mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-2">
            竞拍<span className="text-gradient-primary">成长伙伴</span>
          </h1>
          <p className="text-muted-foreground mb-8">需求 #{id} — 为这位用户提供你的资源与支持</p>
        </motion.div>

        {/* Need summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-8"
        >
          <h2 className="font-display font-semibold text-xl mb-2">30天内完成职场转型计划</h2>
          <p className="text-muted-foreground text-sm mb-4">
            从传统行业转向Web3，需要有经验的导师指导
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1 text-primary">
              <Coins className="w-4 h-4" /> 200 USDC
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" /> 14天
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Shield className="w-4 h-4" /> 双向质押
            </span>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Existing bids */}
          <div className="lg:col-span-3">
            <h2 className="font-display font-semibold text-lg mb-4">当前竞拍 ({mockBids.length})</h2>
            <div className="space-y-4">
              {mockBids.map((bid, i) => (
                <motion.div
                  key={bid.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.1 }}
                  className="glass-card p-5 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                        <User className="w-5 h-5 text-secondary-foreground" />
                      </div>
                      <div>
                        <div className="font-display font-semibold">{bid.bidder}</div>
                        <div className="flex items-center gap-1 text-sm text-primary">
                          <Star className="w-3.5 h-3.5 fill-primary" />
                          {bid.reputation}
                        </div>
                      </div>
                    </div>
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-sm hover:bg-primary/20 transition-colors">
                      选择
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">📦 {bid.resources}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>分成：{bid.share}</span>
                    <span>保证金：{bid.deposit} USDC</span>
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
            <h2 className="font-display font-semibold text-lg mb-4">提交竞拍</h2>
            <div className="glass-card p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">你的资源</label>
                <textarea
                  value={myBid.resources}
                  onChange={(e) => setMyBid((p) => ({ ...p, resources: e.target.value }))}
                  placeholder="描述你能提供的时间、人脉、经验..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">分成比例 (%)</label>
                <input
                  type="number"
                  value={myBid.share}
                  onChange={(e) => setMyBid((p) => ({ ...p, share: e.target.value }))}
                  placeholder="20"
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">保证金 (USDC)</label>
                <input
                  type="number"
                  value={myBid.deposit}
                  onChange={(e) => setMyBid((p) => ({ ...p, deposit: e.target.value }))}
                  placeholder="50"
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <button className="w-full py-3 rounded-xl bg-gradient-to-r from-secondary to-accent text-secondary-foreground font-display font-semibold glow-secondary hover:scale-[1.02] transition-transform">
                提交竞拍
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BidPage;
