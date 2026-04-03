import { useState } from "react";
import { QUIZ_WORDS, DEFAULT_QUIZ } from "@/lib/gameData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WordQuizProps {
  language: string;
  onAnswer: (correct: boolean) => void;
}

const WordQuiz = ({ language, onAnswer }: WordQuizProps) => {
  const quizPool = QUIZ_WORDS[language] || DEFAULT_QUIZ;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const question = quizPool[currentIndex % quizPool.length];
  const isAnswered = selected !== null;
  const isCorrect = selected === question.answer;

  const handleSelect = (option: string) => {
    if (isAnswered) return;
    setSelected(option);
    const correct = option === question.answer;
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    onAnswer(correct);
  };

  const nextQuestion = () => {
    setSelected(null);
    setCurrentIndex((i) => i + 1);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>🧠 Word Quiz</span>
          <span className="text-sm font-normal text-muted-foreground">
            {score.correct}/{score.total} correct
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-center py-3">
          <p className="text-xs text-muted-foreground mb-1">What is this?</p>
          <p className="text-2xl font-bold">{question.word}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {question.options.map((opt) => {
            let variant: "outline" | "default" | "destructive" | "secondary" = "outline";
            if (isAnswered) {
              if (opt === question.answer) variant = "secondary";
              else if (opt === selected && !isCorrect) variant = "destructive";
            }
            return (
              <Button
                key={opt}
                variant={variant}
                className="text-sm font-semibold h-auto py-3"
                onClick={() => handleSelect(opt)}
                disabled={isAnswered}
              >
                {opt}
              </Button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="text-center space-y-2">
            <p className={`text-sm font-bold ${isCorrect ? "text-secondary" : "text-destructive"}`}>
              {isCorrect ? "🎉 Correct! +25 XP" : `❌ It was: ${question.answer} (+5 XP)`}
            </p>
            <Button onClick={nextQuestion} size="sm" className="font-bold">
              Next Question →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WordQuiz;
