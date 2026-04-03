// // import { motion } from "framer-motion";
// // import { useState } from "react";
// // import { Sparkles, Info } from "lucide-react";

// // const categories = ["职场", "婚恋", "自我", "健康", "转型"];

// // const CreateNeed = () => {
// //   const [form, setForm] = useState({
// //     title: "",
// //     category: "",
// //     description: "",
// //     goal: "",
// //     bounty: "",
// //     deadline: "",
// //     anonymous: true,
// //   });

// //   const update = (key: string, value: string | boolean) =>
// //     setForm((prev) => ({ ...prev, [key]: value }));

// //   return (
// //     <div className="min-h-screen pt-24 pb-12 px-6">
// //       <div className="container mx-auto max-w-2xl">
// //         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
// //           <h1 className="font-display text-3xl font-bold mb-2">
// //             发布<span className="text-gradient-primary">需求</span>
// //           </h1>
// //           <p className="text-muted-foreground mb-8">将你的恐惧转化为链上任务资产</p>
// //         </motion.div>

// //         <motion.div
// //           initial={{ opacity: 0, y: 20 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           transition={{ delay: 0.1 }}
// //           className="glass-card p-8 space-y-6"
// //         >
// //           {/* Title */}
// //           <div>
// //             <label className="block text-sm font-medium mb-2">需求主题</label>
// //             <input
// //               type="text"
// //               value={form.title}
// //               onChange={(e) => update("title", e.target.value)}
// //               placeholder="例如：30天内完成职场转型"
// //               className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
// //             />
// //           </div>

// //           {/* Category */}
// //           <div>
// //             <label className="block text-sm font-medium mb-2">分类</label>
// //             <div className="flex flex-wrap gap-2">
// //               {categories.map((cat) => (
// //                 <button
// //                   key={cat}
// //                   onClick={() => update("category", cat)}
// //                   className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
// //                     form.category === cat
// //                       ? "bg-primary text-primary-foreground"
// //                       : "bg-muted/50 text-muted-foreground hover:text-foreground border border-border/50"
// //                   }`}
// //                 >
// //                   {cat}
// //                 </button>
// //               ))}
// //             </div>
// //           </div>

// //           {/* Description */}
// //           <div>
// //             <label className="block text-sm font-medium mb-2">需求描述</label>
// //             <textarea
// //               value={form.description}
// //               onChange={(e) => update("description", e.target.value)}
// //               placeholder="详细描述你的需求和期望..."
// //               rows={4}
// //               className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
// //             />
// //           </div>

// //           {/* Goal */}
// //           <div>
// //             <label className="block text-sm font-medium mb-2">
// //               目标行动
// //               <span className="text-muted-foreground font-normal ml-1">（可验证结果）</span>
// //             </label>
// //             <input
// //               type="text"
// //               value={form.goal}
// //               onChange={(e) => update("goal", e.target.value)}
// //               placeholder="例如：完成3次面试"
// //               className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
// //             />
// //           </div>

// //           {/* Bounty & Deadline */}
// //           <div className="grid grid-cols-2 gap-4">
// //             <div>
// //               <label className="block text-sm font-medium mb-2">奖金 (USDC)</label>
// //               <input
// //                 type="number"
// //                 value={form.bounty}
// //                 onChange={(e) => update("bounty", e.target.value)}
// //                 placeholder="100"
// //                 className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
// //               />
// //             </div>
// //             <div>
// //               <label className="block text-sm font-medium mb-2">期限（天）</label>
// //               <input
// //                 type="number"
// //                 value={form.deadline}
// //                 onChange={(e) => update("deadline", e.target.value)}
// //                 placeholder="30"
// //                 className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
// //               />
// //             </div>
// //           </div>

// //           {/* Anonymous */}
// //           <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/30">
// //             <div className="flex items-center gap-2">
// //               <Info className="w-4 h-4 text-muted-foreground" />
// //               <span className="text-sm">匿名发布</span>
// //             </div>
// //             <button
// //               onClick={() => update("anonymous", !form.anonymous)}
// //               className={`w-11 h-6 rounded-full transition-colors relative ${
// //                 form.anonymous ? "bg-primary" : "bg-muted"
// //               }`}
// //             >
// //               <div
// //                 className={`w-5 h-5 rounded-full bg-foreground absolute top-0.5 transition-transform ${
// //                   form.anonymous ? "translate-x-5" : "translate-x-0.5"
// //                 }`}
// //               />
// //             </button>
// //           </div>

// //           {/* Info */}
// //           <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
// //             <p>📋 发布后将铸造「需求NFT」，奖金将锁入智能合约。</p>
// //             <p className="mt-1">💡 伙伴不履约 → 扣保证金 | 发布者作弊 → 信誉扣分</p>
// //           </div>

// //           {/* Submit */}
// //           <button className="w-full flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-amber-400 text-primary-foreground font-display font-semibold text-lg glow-primary hover:scale-[1.02] transition-transform">
// //             <Sparkles className="w-5 h-5" />
// //             铸造需求 NFT 并发布
// //           </button>
// //         </motion.div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default CreateNeed;

// import { motion } from "framer-motion";
// import { useState } from "react";
// import { Sparkles, Info, Loader2 } from "lucide-react"; // 增加 Loader2 图标
// import { contractActions } from "../lib/contracts"; // 1. 引入你的合约逻辑
// import { useNavigate } from "react-router-dom"; // 如果需要跳转

// const categories = ["职场", "婚恋", "自我", "健康", "转型"];

// const CreateNeed = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false); // 2. 增加加载状态
  
//   const [form, setForm] = useState({
//     title: "",
//     category: "",
//     description: "",
//     goal: "",
//     bounty: "", // 这里的 bounty 对应合约的 reward
//     deadline: "", // 这里的 deadline 对应合约的 duration (秒)
//     anonymous: true,
//   });

//   const update = (key: string, value: string | boolean) =>
//     setForm((prev) => ({ ...prev, [key]: value }));

//   // 3. 核心：提交到区块链
//   const handleSubmit = async () => {
//     if (!form.title || !form.bounty || !form.deadline) {
//       alert("请填写完整信息");
//       return;
//     }

//     setLoading(true);
//     try {
//       // 合约函数签名: createGoal(string desc, uint duration, uint milestones)
//       // 注意：
//       // - desc: 我们把标题和描述拼接
//       // - duration: 前端填的是天数，合约需要秒数 (天 * 86400)
//       // - milestones: 这里暂时硬编码为 1，或者你可以在表单增加此字段
//       // - value: 奖金金额 (ETH/USDC)
      
//       const fullDesc = `[${form.category}] ${form.title}: ${form.description}`;
//       const durationInSeconds = Number(form.deadline) * 86400;
//       const milestoneCount = 1; 

//       console.log("正在发起交易...");
      
//       await contractActions.createGoal(
//         fullDesc,
//         durationInSeconds,
//         milestoneCount,
//         form.bounty // 这里会自动调用 ethers.parseEther
//       );

//       alert("🎉 需求 NFT 铸造成功！奖金已存入智能合约。");
//       navigate("/growth"); // 成功后跳转到列表页
//     } catch (error: any) {
//       console.error("发布失败:", error);
//       alert(`发布失败: ${error.reason || error.message || "未知错误"}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen pt-24 pb-12 px-6">
//       <div className="container mx-auto max-w-2xl">
//         {/* ... 省略中间的 UI 代码（保持不变） ... */}

//         {/* 4. 修改后的提交按钮 */}
//         <button 
//           onClick={handleSubmit}
//           disabled={loading}
//           className={`w-full flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-amber-400 text-primary-foreground font-display font-semibold text-lg glow-primary transition-all ${
//             loading ? "opacity-70 cursor-not-allowed" : "hover:scale-[1.02]"
//           }`}
//         >
//           {loading ? (
//             <Loader2 className="w-5 h-5 animate-spin" />
//           ) : (
//             <Sparkles className="w-5 h-5" />
//           )}
//           {loading ? "正在铸造 NFT..." : "铸造需求 NFT 并发布"}
//         </button>
        
//         {/* ... */}
//       </div>
//     </div>
//   );
// };

// export default CreateNeed;
import { motion } from "framer-motion";
import { useState } from "react";
// 1. 引入所需的图标和路由 hook
import { Sparkles, Info, Loader2 } from "lucide-react"; 
import { useNavigate } from "react-router-dom"; 
// 2. 引入你的合约交互逻辑 (假设已配置好ethers)
import { contractActions } from "../lib/contracts"; 

const categories = ["职场", "婚恋", "自我", "健康", "转型"];

const CreateNeed = () => {
  const navigate = useNavigate(); // 用于交易成功后跳转
  const [loading, setLoading] = useState(false); // 3. 增加加载状态

  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    goal: "",
    bounty: "", 
    deadline: "", 
    anonymous: true,
  });

  const update = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // 4. 核心：提交到区块链的逻辑
  const handleSubmit = async () => {
    // 基础校验
    if (!form.title || !form.category || !form.bounty || !form.deadline) {
      alert("请填写完整信息（分类、标题、奖金和期限是必需的）");
      return;
    }

    setLoading(true); // 开始加载，禁用按钮

    try {
      // 逻辑拼接和类型转换
      const fullDesc = `[${form.category}] ${form.title}: ${form.description}`;
      const durationInSeconds = Number(form.deadline) * 86400; // 天 -> 秒
      const milestoneCount = 1; // 硬编码为 1 个里程碑，视合约而定

      console.log("正在发起交易...", { fullDesc, durationInSeconds, bounty: form.bounty });
      
      // 调用你的 lib/contracts.ts 中的 createGoal 方法
      // 提示：contractActions.createGoal 内部应当处理 ethers.parseEther(form.bounty)
      const tx = await contractActions.createGoal(
        fullDesc,
        durationInSeconds,
        milestoneCount,
        form.bounty 
      );

      // 5. 重要：等待交易被链上确认
      if (tx && tx.wait) {
          console.log("等待网络确认...");
          await tx.wait(); // 如果不等待，跳转后可能数据未更新
      }

      alert("🎉 需求 NFT 铸造成功！奖金已存入智能合约。");
      navigate("/growth"); // 成功后跳转到列表页
    } catch (error: any) {
      console.error("发布失败:", error);
      // 优化报错信息，识别用户取消交易
      if (error.code === 'ACTION_REJECTED') {
        alert("用户取消了交易签名");
      } else {
        alert(`发布失败: ${error.reason || error.message || "未知错误"}`);
      }
    } finally {
      setLoading(false); // 结束加载
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="container mx-auto max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-2">
            发布<span className="text-gradient-primary">需求</span>
          </h1>
          <p className="text-muted-foreground mb-8">将你的恐惧转化为链上任务资产</p>
        </motion.div>

        {/* --- 6. 这里保留了你之前的所有 UI 选项 --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 space-y-6"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">需求主题</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="例如：30天内完成职场转型"
              className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Category - 恢复了选项按钮 */}
          <div>
            <label className="block text-sm font-medium mb-2">分类</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => update("category", cat)}
                  // 7. 修正了分类高亮的判断逻辑
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    form.category === cat
                      ? "bg-primary text-primary-foreground" // 选中状态
                      : "bg-muted/50 text-muted-foreground hover:text-foreground border border-border/50" // 未选中状态
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">需求描述</label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="详细描述你的需求和期望..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {/* Goal */}
          <div>
            <label className="block text-sm font-medium mb-2">
              目标行动
              <span className="text-muted-foreground font-normal ml-1">（可验证结果）</span>
            </label>
            <input
              type="text"
              value={form.goal}
              onChange={(e) => update("goal", e.target.value)}
              placeholder="例如：完成3次面试"
              className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Bounty & Deadline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">奖金 (USDC)</label>
              <input
                type="number"
                value={form.bounty}
                onChange={(e) => update("bounty", e.target.value)}
                placeholder="100"
                className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">期限（天）</label>
              <input
                type="number"
                value={form.deadline}
                onChange={(e) => update("deadline", e.target.value)}
                placeholder="30"
                className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Anonymous - 恢复了开关 UI */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/30">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">匿名发布</span>
            </div>
            <button
              onClick={() => update("anonymous", !form.anonymous)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                form.anonymous ? "bg-primary" : "bg-muted"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-foreground absolute top-0.5 transition-transform ${
                  form.anonymous ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* Info */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
            <p>📋 发布后将铸造「需求NFT」，奖金将锁入智能合约。</p>
            <p className="mt-1">💡 伙伴不履约 → 扣保证金 | 发布者作弊 → 信誉扣分</p>
          </div>

          {/* --- 8. 修改后的提交按钮 (带 Loading 状态) --- */}
          <button 
            onClick={handleSubmit}
            disabled={loading} // 加载时禁用
            className={`w-full flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-amber-400 text-primary-foreground font-display font-semibold text-lg glow-primary transition-all ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" /> // 显示 Loading 图标
            ) : (
              <Sparkles className="w-5 h-5" /> // 显示闪烁图标
            )}
            {loading ? "正在铸造 NFT..." : "铸造需求 NFT 并发布"}
          </button>
        </motion.div>
        {/* --- UI 选项恢复完毕 --- */}
      </div>
    </div>
  );
};

export default CreateNeed;
