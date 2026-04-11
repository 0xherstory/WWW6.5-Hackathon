import { useState, useEffect } from "react";
import DashboardPanel from "./DashboardPanel";
import type { RiskSubmission } from "./SubmitRiskEvent";
import { WISDOM_CARDS, getSmartAlerts } from "@/lib/knowledgeBase";
import { Search, AlertTriangle, X } from "lucide-react";

interface Props {
  lastSubmission?: RiskSubmission | null;
}

export default function HealthWisdomCenter({ lastSubmission }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [alerts, setAlerts] = useState(getSmartAlerts(null));

  useEffect(() => {
    setAlerts(getSmartAlerts(lastSubmission));
    setDismissedAlerts(new Set());
  }, [lastSubmission]);

  const filteredCards = WISDOM_CARDS.filter(card => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return card.title.toLowerCase().includes(q) || card.titleCn.includes(q) || card.category.toLowerCase().includes(q) || card.description.toLowerCase().includes(q);
  });

  const categories = [...new Set(WISDOM_CARDS.map(c => c.category))];

  return (
    <DashboardPanel title="Health Wisdom Center" titleCn="眼健康知识中心" tag="10 · Wiki 百科" tagColor="green">
      {alerts.filter(a => !dismissedAlerts.has(a.type)).length > 0 && (
        <div className="space-y-2 mb-5">
          {alerts.filter(a => !dismissedAlerts.has(a.type)).map(alert => (
            <div key={alert.type} className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0 animate-pulse" />
              <div className="flex-1">
                <p className="font-mono text-xs text-destructive font-bold">{alert.title}</p>
                <p className="font-mono text-[10px] text-destructive/80 whitespace-pre-line mt-1">{alert.message}</p>
              </div>
              <button onClick={() => setDismissedAlerts(prev => new Set(prev).add(alert.type))} className="text-destructive/50 hover:text-destructive">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search guidance... 搜索指导..." className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
      </div>

      {categories.map(category => {
        const cards = filteredCards.filter(c => c.category === category);
        if (cards.length === 0) return null;
        return (
          <div key={category} className="mb-5">
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-2">{category}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cards.map(card => (
                <div key={card.id} className="bg-muted rounded-lg p-4 border border-border hover:border-primary/40 transition-colors cursor-default">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <card.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground">{card.title}</p>
                      <p className="text-xs text-muted-foreground">{card.titleCn}</p>
                      <p className="font-mono text-[10px] text-muted-foreground mt-2 leading-relaxed">{card.description}</p>
                      <p className="font-mono text-[10px] text-muted-foreground/70 mt-1">{card.descriptionCn}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </DashboardPanel>
  );
}
