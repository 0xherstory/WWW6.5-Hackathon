import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import { useMicroHabitStore } from "@/store/microHabitStore";
import { cn } from "@/lib/utils";
import {
  getPagedHabits,
  moduleMeta,
  type ReferenceHabit,
  type ReferenceModuleKey,
} from "@/data/microHabitReference";

type Props = {
  enabled: boolean;
};

export default function MicroHabitReferenceSidebar({ enabled }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState<ReferenceModuleKey>("behavior");
  const [page, setPage] = useState(0);
  const [quoteFor, setQuoteFor] = useState<string | null>(null);
  const { addHabit, hasHabit } = useMicroHabitStore();

  const current = useMemo(() => moduleMeta[active], [active]);
  const pageCount = current.pages.length;
  const notes = useMemo(() => getPagedHabits(active, page), [active, page]);
  const totalSteps = current.pages.reduce((acc, v) => acc + v, 0);
  const currentStep = current.pages.slice(0, page).reduce((a, b) => a + b, 0) + notes.length;
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  const onChangeModule = (key: ReferenceModuleKey) => {
    setActive(key);
    setPage(0);
    setQuoteFor(null);
  };

  const onAdd = (note: ReferenceHabit) => {
    if (hasHabit(note.id)) {
      toast("已在我的挑战中", { description: "这个参考微习惯已经添加过啦。" });
      return;
    }
    addHabit({
      id: note.id,
      title: note.title,
      module: active,
      methodNo: note.methodNo,
      quote: note.quote,
    });
    toast.success("已添加到我的微习惯", {
      description: "可在「我的挑战」页看到已添加参考项。",
    });
  };

  return (
    <aside
      className={cn(
        "reference-sidebar paper-card sticky top-20 self-start hidden xl:flex",
        !enabled && "hidden",
        collapsed ? "w-[82px]" : "w-[300px]",
      )}
    >
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center justify-between px-3 py-3 border-b border-border/70">
          {!collapsed && <h3 className="font-hand text-2xl text-[hsl(29_84%_31%)]">65种微习惯全库</h3>}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="journal-collapse-btn"
            aria-label={collapsed ? "展开参考栏" : "折叠参考栏"}
          >
            <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>

        <div className={cn("grid gap-2 p-3", collapsed ? "grid-cols-1" : "grid-cols-4")}>
          {(Object.keys(moduleMeta) as ReferenceModuleKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onChangeModule(key)}
              className={cn(
                "ref-nav-btn",
                moduleMeta[key].buttonClass,
                active === key && "ref-nav-btn-active",
                collapsed && "justify-center px-0",
              )}
            >
              <span>{moduleMeta[key].icon}</span>
              {!collapsed && <span className="font-hand text-sm">{moduleMeta[key].name}</span>}
            </button>
          ))}
        </div>

        {!collapsed && (
          <div className="px-3 pb-1">
            <select
              className="w-full h-9 rounded-xl border border-border bg-[hsl(40_55%_97%_/0.85)] px-3 text-sm"
              value={active}
              onChange={(e) => onChangeModule(e.target.value as ReferenceModuleKey)}
            >
              <option value="behavior">行为模块</option>
              <option value="mindset">思维模块</option>
              <option value="emotion">情绪模块</option>
              <option value="environment">环境模块</option>
            </select>
          </div>
        )}

        {!collapsed && (
          <div className="px-3 pb-2">
            <h4 className={cn("ref-module-title", current.themeClass)}>
              65种微习惯全库 · {current.icon} {current.name}
            </h4>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5 }}
              className="space-y-3"
            >
              {notes.map((note, index) => {
                const added = hasHabit(note.id);
                return (
                  <motion.article
                    key={note.id}
                    onClick={() => setQuoteFor((prev) => (prev === note.id ? null : note.id))}
                    className={cn(
                      "ref-note-card",
                      current.themeClass,
                      index % 2 === 0 ? "rotate-[0.25deg]" : "-rotate-[0.3deg]",
                    )}
                  >
                    <p className="text-xs text-muted-foreground mb-1">方法 {note.methodNo} · {note.icon}</p>
                    <p className="font-hand text-xl text-[hsl(29_84%_31%)]">{note.title}</p>
                    {!collapsed && <p className="text-sm text-[hsl(217_19%_35%)] leading-6 mt-1">{note.content}</p>}
                    <div className="flex justify-end mt-2">
                      <button
                        type="button"
                        disabled={added}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAdd(note);
                        }}
                        className={cn("ref-add-btn", added && "opacity-70 cursor-default")}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {added ? "已添加" : "添加到我的微习惯"}
                      </button>
                    </div>
                    {quoteFor === note.id && (
                      <div className="ref-quote-bubble left">
                        <span className="text-xs">书籍金句</span>
                        <p className="text-sm mt-1">“{note.quote}”</p>
                      </div>
                    )}
                  </motion.article>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="px-3 pb-3">
          {!collapsed && (
            <>
              <div className="flex items-center justify-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="ref-page-btn"
                >
                  上一页
                </button>
                <button type="button" onClick={() => setPage(0)} className="ref-page-btn">
                  首页
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                  className="ref-page-btn"
                >
                  下一页
                </button>
              </div>
              <p className="text-center text-xs text-muted-foreground mb-1">
                第 {page + 1} / {pageCount} 页 · {progressPercent}%
              </p>
              <div className="ref-progress-bar">
                <span style={{ width: `${progressPercent}%` }} />
              </div>
            </>
          )}
          <div className="ref-bottom-tape" />
          {!collapsed && <p className="text-right text-lg mt-1">🌱</p>}
        </div>
      </div>
    </aside>
  );
}

