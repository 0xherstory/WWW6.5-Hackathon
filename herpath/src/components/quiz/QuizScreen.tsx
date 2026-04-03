"use client";

import { useState } from "react";
import PixelDialog from "@/components/ui/PixelDialog";
import { QUESTIONS } from "@/data/questions";
import type { Question } from "@/types/game";

interface QuizScreenProps {
  onComplete: (answers: Record<number, string>) => void;
}

export default function QuizScreen({ onComplete }: QuizScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);

  const question: Question = QUESTIONS[currentIndex];
  const isLast = currentIndex === QUESTIONS.length - 1;

  function handleSelect(optionId: string) {
    if (animating) return;
    setSelected(optionId);
  }

  function handleNext() {
    if (!selected || animating) return;
    const newAnswers = { ...answers, [question.id]: selected };
    setAnswers(newAnswers);

    if (isLast) {
      onComplete(newAnswers);
      return;
    }

    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setAnimating(false);
    }, 250);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
      {/* Progress dots */}
      <div className="flex gap-3 mb-2">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 border-2 border-game-border"
            style={{
              backgroundColor: i < currentIndex
                ? "#4a4a8a"
                : i === currentIndex
                ? "#a0a0ff"
                : "transparent",
            }}
          />
        ))}
      </div>

      <PixelDialog className="w-full max-w-lg animate-pixelIn">
        {/* Scene label */}
        <p className="text-game-muted text-[8px] mb-3 leading-relaxed">
          {question.scene}
        </p>

        {/* Question text */}
        <p className="text-game-text text-[10px] leading-loose mb-6 whitespace-pre-line">
          {question.text}
        </p>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {question.options.map((option) => {
            const isChosen = selected === option.id;
            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                className="pixel-btn text-left px-4 py-3 text-[8px] leading-loose whitespace-pre-line transition-colors"
                style={{
                  borderColor: isChosen ? "#a0a0ff" : "#4a4a8a",
                  backgroundColor: isChosen ? "#1e1e4a" : "#12122a",
                  color: isChosen ? "#c8c8ff" : "#e8e8f0",
                }}
              >
                {isChosen ? "▶ " : "  "}
                {option.text}
              </button>
            );
          })}
        </div>
      </PixelDialog>

      {/* Next button */}
      <button
        onClick={handleNext}
        disabled={!selected}
        className="pixel-btn px-8 py-3 text-[9px] disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          borderColor: selected ? "#a0a0ff" : "#4a4a8a",
          backgroundColor: "#12122a",
          color: "#a0a0ff",
        }}
      >
        {isLast ? "✦ 完成" : "继续 →"}
      </button>
    </div>
  );
}
