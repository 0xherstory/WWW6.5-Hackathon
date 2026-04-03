export interface Stage {
  id: number;
  name: string;
  enName: string;
  description: string;
  enDescription: string;
  dayRange: [number, number];
  color: string;
}

export const STAGES: Stage[] = [
  {
    id: 1,
    name: "种子期",
    enName: "Seed Stage",
    description: "播下疗愈的种子，建立基础",
    enDescription: "Plant the seeds of healing, establish foundations",
    dayRange: [1, 7],
    color: "#8B4513",
  },
  {
    id: 2,
    name: "萌芽期",
    enName: "Sprout Stage",
    description: "开始觉察，小步探索",
    enDescription: "Begin awareness, small steps of exploration",
    dayRange: [8, 14],
    color: "#90EE90",
  },
  {
    id: 3,
    name: "生长期",
    enName: "Growth Stage",
    description: "深入疗愈，建立习惯",
    enDescription: "Deepen healing, establish habits",
    dayRange: [15, 21],
    color: "#32CD32",
  },
  {
    id: 4,
    name: "开花期",
    enName: "Bloom Stage",
    description: "看见改变，收获洞见",
    enDescription: "See changes, harvest insights",
    dayRange: [22, 28],
    color: "#FF69B4",
  },
  {
    id: 5,
    name: "结果期",
    enName: "Harvest Stage",
    description: "整合经验，分享智慧",
    enDescription: "Integrate experiences, share wisdom",
    dayRange: [29, 35],
    color: "#FFD700",
  },
];

export function getStageByDay(day: number): Stage | undefined {
  return STAGES.find((stage) => day >= stage.dayRange[0] && day <= stage.dayRange[1]);
}

export function getCurrentStage(startDate: Date): Stage {
  const now = new Date();
  const diffTime = now.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return getStageByDay(diffDays) || STAGES[STAGES.length - 1];
}
