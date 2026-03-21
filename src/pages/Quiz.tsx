import { useState, useEffect, useCallback } from "react";
import { Brain, Clock, CheckCircle2, XCircle, RotateCcw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ScrollReveal";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct: number;
  difficulty: "basic" | "intermediate" | "pro";
  category: string;
  explanation: string;
}

const QUESTIONS: Question[] = [
  {
    id: "1",
    question: "What is the purpose of Angular's NgZone?",
    options: [
      "Manages component lifecycle",
      "Handles change detection triggers",
      "Provides dependency injection",
      "Manages routing guards",
    ],
    correct: 1,
    difficulty: "intermediate",
    category: "Angular",
    explanation: "NgZone helps Angular know when to trigger change detection by patching async APIs.",
  },
  {
    id: "2",
    question: "In SQL, what does COALESCE do?",
    options: [
      "Joins two tables",
      "Returns the first non-null value",
      "Counts distinct values",
      "Creates an index",
    ],
    correct: 1,
    difficulty: "basic",
    category: "SQL",
    explanation: "COALESCE returns the first non-null expression among its arguments.",
  },
  {
    id: "3",
    question: "What is middleware in .NET?",
    options: [
      "A database ORM",
      "Software in the request/response pipeline",
      "A testing framework",
      "A deployment tool",
    ],
    correct: 1,
    difficulty: "basic",
    category: ".NET",
    explanation: "Middleware is software assembled into a pipeline to handle requests and responses.",
  },
  {
    id: "4",
    question: "What does the 'trackBy' function do in Angular *ngFor?",
    options: [
      "Tracks HTTP requests",
      "Optimizes DOM re-rendering by identity",
      "Monitors component state",
      "Logs performance metrics",
    ],
    correct: 1,
    difficulty: "intermediate",
    category: "Angular",
    explanation: "trackBy helps Angular identify items to minimize DOM manipulation during list re-renders.",
  },
  {
    id: "5",
    question: "What is a CTE in SQL?",
    options: [
      "Cascading Table Expression",
      "Common Table Expression",
      "Computed Transaction Entity",
      "Cross-Table Evaluation",
    ],
    correct: 1,
    difficulty: "intermediate",
    category: "SQL",
    explanation: "A CTE (Common Table Expression) defines a temporary result set referenced within a query.",
  },
  {
    id: "6",
    question: "What pattern does Angular's HttpInterceptor implement?",
    options: [
      "Observer pattern",
      "Chain of responsibility",
      "Singleton pattern",
      "Factory pattern",
    ],
    correct: 1,
    difficulty: "pro",
    category: "Angular",
    explanation: "Interceptors form a chain where each can transform or handle the request/response.",
  },
];

const CATEGORIES = ["All", "Angular", "SQL", ".NET"];
const DIFFICULTIES = ["all", "basic", "intermediate", "pro"] as const;

const difficultyColors = {
  basic: "text-primary",
  intermediate: "text-amber",
  pro: "text-rose",
};

const QuizPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<typeof DIFFICULTIES[number]>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizStarted, setQuizStarted] = useState(false);

  const filteredQuestions = QUESTIONS.filter((q) => {
    const matchCat = selectedCategory === "All" || q.category === selectedCategory;
    const matchDiff = selectedDifficulty === "all" || q.difficulty === selectedDifficulty;
    return matchCat && matchDiff;
  });

  const currentQ = filteredQuestions[currentIndex];

  useEffect(() => {
    if (!timerEnabled || !quizStarted || selected !== null) return;
    if (timeLeft <= 0) {
      handleAnswer(-1);
      return;
    }
    const t = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, timerEnabled, quizStarted, selected]);

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowExplanation(true);
    setAnswered((p) => p + 1);
    if (idx === currentQ.correct) setScore((p) => p + 1);
  };

  const nextQuestion = () => {
    setSelected(null);
    setShowExplanation(false);
    setTimeLeft(30);
    setCurrentIndex((p) => (p + 1) % filteredQuestions.length);
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelected(null);
    setShowExplanation(false);
    setScore(0);
    setAnswered(0);
    setTimeLeft(30);
    setQuizStarted(false);
  };

  if (!quizStarted) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Quiz & Interview Prep</h1>
            <p className="text-sm text-muted-foreground">Sharpen your skills with MCQs</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="rounded-lg border border-border/50 bg-card p-6 space-y-5">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Category</p>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((c) => (
                  <Badge key={c} variant={selectedCategory === c ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedCategory(c)}>{c}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Difficulty</p>
              <div className="flex gap-2 flex-wrap">
                {DIFFICULTIES.map((d) => (
                  <Badge key={d} variant={selectedDifficulty === d ? "default" : "outline"} className="cursor-pointer capitalize" onClick={() => setSelectedDifficulty(d)}>{d}</Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={timerEnabled} onChange={(e) => setTimerEnabled(e.target.checked)} className="rounded" />
                <Clock className="h-4 w-4 text-muted-foreground" />
                30s timer per question
              </label>
            </div>
            <p className="text-sm text-muted-foreground">{filteredQuestions.length} questions available</p>
            <Button variant="glow" className="w-full" onClick={() => setQuizStarted(true)} disabled={filteredQuestions.length === 0}>
              Start Quiz <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </ScrollReveal>
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <Brain className="h-10 w-10 mx-auto mb-4 text-muted-foreground opacity-40" />
        <p className="text-muted-foreground">No questions match your filters.</p>
        <Button variant="outline" className="mt-4" onClick={resetQuiz}>Change filters</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quiz Mode</h1>
          <p className="text-sm text-muted-foreground">
            Score: <span className="font-mono text-primary">{score}/{answered}</span> · Question {currentIndex + 1}/{filteredQuestions.length}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {timerEnabled && (
            <span className={cn("font-mono text-lg font-bold", timeLeft <= 10 ? "text-destructive" : "text-muted-foreground")}>
              {timeLeft}s
            </span>
          )}
          <Button variant="ghost" size="icon" onClick={resetQuiz}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border/50 bg-card p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="secondary">{currentQ.category}</Badge>
          <span className={cn("text-xs font-medium capitalize", difficultyColors[currentQ.difficulty])}>
            {currentQ.difficulty}
          </span>
        </div>
        <h2 className="text-lg font-semibold leading-relaxed">{currentQ.question}</h2>

        <div className="space-y-2">
          {currentQ.options.map((opt, i) => {
            const isCorrect = i === currentQ.correct;
            const isSelected = i === selected;
            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={selected !== null}
                className={cn(
                  "w-full text-left rounded-lg border p-3.5 text-sm transition-all duration-200",
                  selected === null
                    ? "border-border/50 bg-secondary/30 hover:bg-secondary hover:border-border cursor-pointer active:scale-[0.98]"
                    : isCorrect
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : isSelected
                    ? "border-destructive/50 bg-destructive/10 text-destructive"
                    : "border-border/30 opacity-50"
                )}
              >
                <span className="flex items-center gap-2">
                  {selected !== null && isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                  {selected !== null && isSelected && !isCorrect && <XCircle className="h-4 w-4 shrink-0" />}
                  {opt}
                </span>
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="rounded-md bg-muted/50 border border-border/30 p-3 text-sm text-muted-foreground">
            💡 {currentQ.explanation}
          </div>
        )}

        {selected !== null && (
          <Button variant="glow" className="w-full" onClick={nextQuestion}>
            Next Question <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
