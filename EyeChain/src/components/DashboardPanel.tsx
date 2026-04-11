import React from "react";

interface DashboardPanelProps {
  title: string;
  titleCn?: string;
  tag: string;
  tagColor?: "cyan" | "magenta" | "green" | "amber";
  children: React.ReactNode;
  className?: string;
}

const tagStyles = {
  cyan: "text-cyan border-cyan bg-cyan/10",
  magenta: "text-magenta border-magenta bg-magenta/10",
  green: "text-neon-green border-neon-green bg-neon-green/10",
  amber: "text-amber border-amber bg-amber/10",
};

const panelBefore = {
  cyan: "",
  magenta: "panel-magenta",
  green: "panel-green",
  amber: "panel-amber",
};

export default function DashboardPanel({ title, titleCn, tag, tagColor = "cyan", children, className = "" }: DashboardPanelProps) {
  return (
    <div className={`border-glow bg-card rounded-lg p-6 mb-5 animate-fade-in-up ${panelBefore[tagColor]} ${className}`}>
      <span className={`inline-block font-mono text-xs px-3 py-1 rounded border mb-4 tracking-widest uppercase ${tagStyles[tagColor]}`}>
        {tag}
      </span>
      <h2 className="font-heading text-lg tracking-wider text-primary uppercase mb-1">{title}</h2>
      {titleCn && <p className="font-mono text-xs text-muted-foreground mb-5">{titleCn}</p>}
      {!titleCn && <div className="mb-5" />}
      {children}
    </div>
  );
}
