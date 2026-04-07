import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import RandomPicker from "@/components/RandomPicker";
import PactaChainPanel from "@/components/PactaChainPanel";
import { categoryInfo, type HabitCategory } from "@/data/habitsData";

const categories = Object.entries(categoryInfo) as [HabitCategory, typeof categoryInfo[HabitCategory]][];

export default function CreateHabits() {
  return (
    <div className="space-y-10">
      <section className="journal-screen watercolor-wash pink-wash text-center max-w-4xl mx-auto min-h-[44vh] md:min-h-[40vh] py-8 md:py-10">
        <h1 className="text-4xl md:text-5xl font-hand text-[hsl(7_58%_56%)] watercolor-title">创建你的微习惯</h1>
        <p className="text-muted-foreground mt-3">在 Pacta，把每一个最小行动变成可追踪、可坚持的改变。</p>
        <div className="max-w-sm mx-auto mt-6">
          <RandomPicker compact />
        </div>
      </section>

      <div className="w-full">
        <h2 className="text-3xl font-hand font-bold text-foreground text-center mb-6">选择你的修行之路</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map(([key, info], i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link to={`/${key}`} className="block">
                <div className="paper-card p-6 text-center group cursor-pointer">
                  <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${info.color}`} aria-hidden />
                  <div className="relative">
                    <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform duration-300">{info.emoji}</span>
                    <h3 className="font-hand text-xl font-semibold text-foreground">{info.label}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{info.labelEn}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-3xl mx-auto">
        <PactaChainPanel variant="compact" title="链上挑战与奖励池" />
      </div>

    </div>
  );
}
