// 

import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Search, Filter, Clock, Coins, Users, ArrowRight } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { contractActions } from "../lib/contracts";
import { fetchGoals } from "../lib/contracts";
// 静态分类数据
const CATEGORIES = ["全部", "职场", "婚恋", "自我", "健康", "转型"];

const Marketplace = () => {
  const [needs, setNeeds] = useState([]); // 存储合并后的数据
  const [activeCategory, setActiveCategory] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const location = useLocation();

  // 1. 定义获取数据的逻辑
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // const data = await contractActions.getGoals();
      const data = await fetchGoals();
      // const formatted = data.map((g) => ({
      //   id: g.id,
      //   title: g.title,
      //   category: "链上", 
      //   description: g.title,
      //   bounty: g.bounty,
      //   bids: 0,
      //   deadline: Math.floor(g.deadline / 86400) + "天",
      //   level: "🔥",
      //   author: g.creator.slice(0, 6) + "...",
      //   status: "竞拍中",
      // }));

      const fetchData = async () => {
        setIsLoading(true);
        try {
          const data = await fetchGoals();
      
          const formatted = data.map((g) => ({
            id: g.id,
            title: g.desc,
            category: "链上",
            description: g.desc,
            bounty: Number(g.rewardEth),
            bids: 0,
            deadline: Math.max(
              0,
              Math.floor((g.deadline - Date.now() / 1000) / 86400)
            ) + "天",
            level: g.isOpen ? "🔥" : "⚡",
            author: g.creator.slice(0, 6) + "...",
            status:
              g.isOpen
                ? "竞拍中"
                : g.isInProgress
                ? "进行中"
                : g.isCompleted
                ? "已完成"
                : "已结束",
          }));
      
          // setNeeds([...mockNeeds, ...formatted]);
        
        // ✅ 防止 id 冲突版本
        setNeeds([
          ...mockNeeds,
          ...formatted.map((item) => ({
            ...item,
            id: `onchain-${item.id}`,
          })),
        ]);
                
        } catch (err) {
          console.error("Fetch data error:", err);
          setNeeds(mockNeeds);
        } finally {
          setIsLoading(false);
        }
      };

      // 这里可以选择是将链上数据替换 mock，还是合并
      // 假设我们先展示 mock 数据，再合并链上数据
      // setNeeds([...mockNeeds, ...formatted]);
    } catch (err) {
      console.error("Fetch data error:", err);
      setNeeds(mockNeeds); // 出错时至少展示 mock 数据
    } finally {
      setIsLoading(false);
    }
  };

  // 2. 只有在组件挂载或路由状态改变时触发
  useEffect(() => {
    fetchData();
  }, [location.state]); // 监听 location.state 以便手动刷新

  // 3. 使用 useMemo 优化搜索和筛选逻辑，避免每次渲染都重新计算
  const filteredNeeds = useMemo(() => {
    return needs.filter((n) => {
      const matchCat = activeCategory === "全部" || n.category === activeCategory;
      const matchSearch = 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        n.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [needs, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="container mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            需求<span className="text-gradient-primary">市场</span>
          </h1>
          <p className="text-muted-foreground mb-8">
            {isLoading ? "正在加载链上需求..." : "发现正在等待投资的成长需求"}
          </p>
        </motion.div>

        {/* 搜索栏 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索需求..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Filter className="w-4 h-4" /> 筛选
          </button>
        </div>

        {/* 分类切换 */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 需求列表 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNeeds.map((need, i) => (
            <motion.div
              key={`${need.id}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-6 hover:border-primary/30 transition-all group"
            >
               {/* ... 保持你的卡片渲染内容不变 ... */}
               <div className="flex items-center justify-between mb-3">
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                  {need.category}
                </span>
                <span className="text-sm">{need.level}</span>
              </div>
              <h3 className="font-display font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                {need.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{need.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1"><Coins className="w-3.5 h-3.5 text-primary" />{need.bounty} USDC</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{need.bids} 竞拍</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{need.deadline}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{need.author}</span>
                <Link to={`/bid/${need.id}`} className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80">
                  {need.status === "竞拍中" ? "参与竞拍" : "查看进度"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Mock 数据移出组件外部或放入单独文件
const mockNeeds = [
  { id: 1, title: "30天内完成职场转型计划", category: "职场", description: "从传统行业转向Web3...", bounty: 200, bids: 5, deadline: "14天", level: "🔥 烈焰", author: "匿名用户 #3847", status: "竞拍中" },

  { id: 2, title: "提升英语口语到雅思7分", category: "自我", description: "需要系统训练口语表达与逻辑...", bounty: 150, bids: 8, deadline: "20天", level: "⚡ 闪电", author: "匿名用户 #1290", status: "竞拍中" },

  { id: 3, title: "减脂10斤并养成健身习惯", category: "健康", description: "希望制定饮食+训练计划...", bounty: 120, bids: 6, deadline: "30天", level: "💧 水滴", author: "匿名用户 #6672", status: "进行中" },

  { id: 4, title: "设计个人品牌定位与账号内容", category: "转型", description: "打造小红书/推特个人IP...", bounty: 300, bids: 12, deadline: "10天", level: "🔥 烈焰", author: "匿名用户 #8831", status: "竞拍中" },

  { id: 5, title: "制定高效学习编程路线（0基础）", category: "自我", description: "目标3个月能做项目...", bounty: 180, bids: 9, deadline: "21天", level: "⚡ 闪电", author: "匿名用户 #4521", status: "竞拍中" },

  { id: 6, title: "帮助走出情感低谷", category: "婚恋", description: "刚分手，需要情绪整理与重建...", bounty: 220, bids: 4, deadline: "15天", level: "🔥 烈焰", author: "匿名用户 #9912", status: "进行中" },

  { id: 7, title: "副业从0到月入3000路径规划", category: "职场", description: "希望探索适合自己的副业...", bounty: 260, bids: 7, deadline: "25天", level: "⚡ 闪电", author: "匿名用户 #3108", status: "竞拍中" },

  { id: 8, title: "建立每日自律作息系统", category: "自我", description: "早睡早起+高效时间管理...", bounty: 100, bids: 3, deadline: "14天", level: "💧 水滴", author: "匿名用户 #7754", status: "已完成" },

  { id: 9, title: "学习基础投资理财知识", category: "自我", description: "基金/股票/加密资产入门...", bounty: 140, bids: 5, deadline: "18天", level: "⚡ 闪电", author: "匿名用户 #2201", status: "竞拍中" },

  { id: 10, title: "改善社交恐惧，提升表达能力", category: "自我", description: "希望在公众场合更自信...", bounty: 190, bids: 6, deadline: "20天", level: "🔥 烈焰", author: "匿名用户 #6439", status: "进行中" },

  { id: 11, title: "从0开始运营Twitter账号涨粉1k", category: "转型", description: "Web3内容方向，持续输出...", bounty: 210, bids: 11, deadline: "12天", level: "🔥 烈焰", author: "匿名用户 #8888", status: "竞拍中" },

  { id: 12, title: "制定一套可执行的留学申请计划", category: "职场", description: "目标2026秋入学，需要全流程规划...", bounty: 280, bids: 10, deadline: "30天", level: "⚡ 闪电", author: "匿名用户 #5566", status: "竞拍中" }
];

export default Marketplace;