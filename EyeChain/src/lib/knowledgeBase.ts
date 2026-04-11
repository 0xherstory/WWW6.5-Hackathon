import { Eye, Sun, Monitor, Armchair, Droplets, Pill, ThermometerSun } from "lucide-react";
import type { ElementType } from "react";

export interface WisdomCard {
  id: string;
  icon: ElementType;
  title: string;
  titleCn: string;
  category: string;
  description: string;
  descriptionCn: string;
}

export const WISDOM_CARDS: WisdomCard[] = [
  {
    id: "20-20-20",
    icon: Eye,
    title: "20-20-20 Rule",
    titleCn: "20-20-20 法则",
    category: "Habits",
    description: "Every 20 minutes, look at something 20 feet away for 20 seconds. Reduces ciliary muscle fatigue and digital eye strain.",
    descriptionCn: "每20分钟，看20英尺远的物体20秒。减少睫状肌疲劳和数字视觉疲劳。",
  },
  {
    id: "posture",
    icon: Armchair,
    title: "Posture Correction",
    titleCn: "姿势矫正",
    category: "Habits",
    description: "Keep screen at eye level, 50-70cm distance. Lean back, not forward. Rest eyes closed for 5 minutes per hour.",
    descriptionCn: "保持屏幕与眼睛平齐，距离50-70厘米。向后靠，不要前倾。每小时闭眼休息5分钟。",
  },
  {
    id: "lutein",
    icon: Pill,
    title: "Lutein & Zeaxanthin",
    titleCn: "叶黄素与玉米黄质",
    category: "Supplements",
    description: "10-20mg daily lutein filters blue light at the macula. Found in kale, spinach, eggs. AREDS2 formula recommended.",
    descriptionCn: "每天10-20毫克叶黄素可过滤黄斑区蓝光。存在于羽衣甘蓝、菠菜、鸡蛋中。推荐AREDS2配方。",
  },
  {
    id: "hot-compress",
    icon: ThermometerSun,
    title: "Hot Compress Therapy",
    titleCn: "热敷疗法",
    category: "Supplements",
    description: "Apply 40-42°C warm compress for 10 minutes. Stimulates meibomian gland secretion, relieves dry eye symptoms.",
    descriptionCn: "以40-42°C温敷10分钟。刺激睑板腺分泌，缓解干眼症状。",
  },
  {
    id: "eye-drops",
    icon: Droplets,
    title: "Preservative-Free Eye Drops",
    titleCn: "不含防腐剂的眼药水",
    category: "Supplements",
    description: "Use preservative-free artificial tears 3-4 times daily. Avoid vasoconstrictors. Consult ophthalmologist for prescription drops.",
    descriptionCn: "每天使用3-4次不含防腐剂的人工泪液。避免血管收缩剂。处方眼药水请咨询眼科医生。",
  },
  {
    id: "lighting",
    icon: Sun,
    title: "Optimal Lighting",
    titleCn: "最佳照明",
    category: "Environment",
    description: "Incandescent lighting (白炽灯) is gentler than LED for prolonged use. Avoid direct screen glare. Use bias lighting behind monitors.",
    descriptionCn: "白炽灯照明在长时间使用时比LED更温和。避免屏幕直接眩光。在显示器后方使用偏置照明。",
  },
  {
    id: "screen",
    icon: Monitor,
    title: "LCD vs OLED Displays",
    titleCn: "LCD vs OLED 显示屏",
    category: "Environment",
    description: "OLED's PWM dimming causes flicker at low brightness (eye strain). LCD with DC dimming is better for extended sessions.",
    descriptionCn: "OLED在低亮度下的PWM调光会产生闪烁（视觉疲劳）。带DC调光的LCD更适合长时间使用。",
  },
];

export interface SmartAlert {
  type: "duration" | "posture" | "symptom";
  title: string;
  message: string;
  cardId: string;
}

export function getSmartAlerts(submission: { duration: number; posture: number; symptoms: number } | null): SmartAlert[] {
  if (!submission) return [];
  const alerts: SmartAlert[] = [];

  if (submission.duration >= 40) {
    alerts.push({
      type: "duration",
      title: "FMEA Detection: Prolonged Exposure",
      message: "Suggestion: Apply 20-20-20 Rule immediately.\nFMEA检测：长时间暴露。建议：立即应用20-20-20法则。",
      cardId: "20-20-20",
    });
  }

  if (submission.posture >= 40) {
    alerts.push({
      type: "posture",
      title: "FMEA Detection: High Posture Load",
      message: "Posture Reset: Lean back and rest eyes for 10 minutes.\nFMEA检测：高姿态负荷。姿势重置：向后靠并闭眼休息10分钟。",
      cardId: "posture",
    });
  }

  if (submission.symptoms > 0) {
    alerts.push({
      type: "symptom",
      title: "Symptoms Detected",
      message: "Recommended: Hot compress therapy & clinical consultation.\n检测到症状。建议：热敷疗法并咨询眼科医生。",
      cardId: "hot-compress",
    });
  }

  return alerts;
}
