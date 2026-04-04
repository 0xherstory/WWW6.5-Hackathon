import crownImg from "@/assets/accessories/crown.png";
import bowtieImg from "@/assets/accessories/bowtie.png";
import glassesImg from "@/assets/accessories/glasses.png";
import scarfImg from "@/assets/accessories/scarf.png";
import wizardHatImg from "@/assets/accessories/wizard-hat.png";

export interface Accessory {
  id: string;
  name: string;
  emoji: string;
  image: string;
  requiredXp: number;
  description: string;
}

export interface LanguageOption {
  value: string;
  label: string;
  nativeLabel: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { value: "Arabic", label: "Arabic", nativeLabel: "العربية" },
  { value: "Chinese", label: "Chinese", nativeLabel: "中文" },
  { value: "English", label: "English", nativeLabel: "English" },
  { value: "French", label: "French", nativeLabel: "Français" },
  { value: "Russian", label: "Russian", nativeLabel: "Русский" },
  { value: "Spanish", label: "Spanish", nativeLabel: "Español" },
];

export function getLanguageOptions(activeLanguage?: string): LanguageOption[] {
  if (!activeLanguage || SUPPORTED_LANGUAGES.some((option) => option.value === activeLanguage)) {
    return SUPPORTED_LANGUAGES;
  }

  return [
    ...SUPPORTED_LANGUAGES,
    { value: activeLanguage, label: activeLanguage, nativeLabel: activeLanguage },
  ];
}

export const ACCESSORIES: Accessory[] = [
  { id: "bowtie", name: "Scholar Bowtie", emoji: "🎀", image: bowtieImg, requiredXp: 50, description: "First steps reward" },
  { id: "glasses", name: "Nerd Glasses", emoji: "🤓", image: glassesImg, requiredXp: 150, description: "Bookworm badge" },
  { id: "scarf", name: "Cozy Scarf", emoji: "🧣", image: scarfImg, requiredXp: 300, description: "Dedicated learner" },
  { id: "crown", name: "Golden Crown", emoji: "👑", image: crownImg, requiredXp: 500, description: "Language royalty" },
  { id: "wizard-hat", name: "Wizard Hat", emoji: "🧙", image: wizardHatImg, requiredXp: 800, description: "Master of tongues" },
];

export const QUIZ_WORDS: Record<string, { word: string; answer: string; options: string[] }[]> = {
  Arabic: [
    { word: "Hello", answer: "مرحبا", options: ["مرحبا", "شكرا", "مع السلامة", "نعم"] },
    { word: "Book", answer: "كتاب", options: ["قلم", "كتاب", "بيت", "ماء"] },
    { word: "Cat", answer: "قطة", options: ["كلب", "قطة", "طائر", "سمكة"] },
  ],
  Chinese: [
    { word: "Hello", answer: "你好", options: ["你好", "谢谢", "再见", "请"] },
    { word: "Book", answer: "书", options: ["水", "书", "桌子", "学校"] },
    { word: "Cat", answer: "猫", options: ["狗", "猫", "鸟", "鱼"] },
  ],
  English: [
    { word: "你好", answer: "Hello", options: ["Hello", "Goodbye", "Thanks", "Sorry"] },
    { word: "谢谢", answer: "Thank you", options: ["Please", "Thank you", "Sorry", "Hello"] },
    { word: "再见", answer: "Goodbye", options: ["Hello", "Sorry", "Goodbye", "Yes"] },
    { word: "猫", answer: "Cat", options: ["Dog", "Cat", "Bird", "Fish"] },
    { word: "书", answer: "Book", options: ["Pen", "Book", "Desk", "Chair"] },
  ],
  Japanese: [
    { word: "Hello", answer: "こんにちは", options: ["こんにちは", "さようなら", "ありがとう", "すみません"] },
    { word: "Cat", answer: "猫 (ねこ)", options: ["犬", "猫 (ねこ)", "鳥", "魚"] },
    { word: "Water", answer: "水 (みず)", options: ["火", "水 (みず)", "風", "土"] },
  ],
  French: [
    { word: "Hello", answer: "Bonjour", options: ["Bonjour", "Merci", "Au revoir", "Oui"] },
    { word: "Cat", answer: "Chat", options: ["Chien", "Chat", "Oiseau", "Poisson"] },
    { word: "Book", answer: "Livre", options: ["Stylo", "Livre", "Table", "Chaise"] },
  ],
  Russian: [
    { word: "Hello", answer: "Привет", options: ["Привет", "Спасибо", "Пока", "Да"] },
    { word: "Cat", answer: "Кошка", options: ["Собака", "Кошка", "Птица", "Рыба"] },
    { word: "Book", answer: "Книга", options: ["Ручка", "Книга", "Стол", "Стул"] },
  ],
  Spanish: [
    { word: "Hello", answer: "Hola", options: ["Hola", "Adiós", "Gracias", "Por favor"] },
    { word: "Cat", answer: "Gato", options: ["Perro", "Gato", "Pájaro", "Pez"] },
    { word: "Book", answer: "Libro", options: ["Pluma", "Libro", "Mesa", "Silla"] },
  ],
};

// Fallback quiz for any language
export const DEFAULT_QUIZ = [
  { word: "🐱", answer: "Cat", options: ["Cat", "Dog", "Bird", "Fish"] },
  { word: "📖", answer: "Book", options: ["Pen", "Book", "Desk", "Phone"] },
  { word: "🌍", answer: "World", options: ["Sun", "Moon", "World", "Star"] },
  { word: "💧", answer: "Water", options: ["Fire", "Water", "Wind", "Ice"] },
  { word: "🏠", answer: "Home", options: ["School", "Home", "Park", "Shop"] },
];

export const XP_BABY = 100;
export const XP_TEENAGER = 300;
export const XP_ADULT = 600;

export function getStage(xp: number) {
  if (xp >= XP_ADULT) return 3;
  if (xp >= XP_TEENAGER) return 2;
  if (xp >= XP_BABY) return 1;
  return 0;
}

export function getUnlockedAccessories(xp: number): Accessory[] {
  return ACCESSORIES.filter((a) => xp >= a.requiredXp);
}
