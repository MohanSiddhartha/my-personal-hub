import { useState, useEffect, useRef } from "react";
import { Brain, Clock, CheckCircle2, XCircle, RotateCcw, ChevronRight, Trophy, Loader2, RefreshCw, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ScrollReveal";
import { CyberCard } from "@/components/CyberCard";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Question {
  question: string;
  options: string[];
  correct: number;
  difficulty: "basic" | "intermediate" | "pro";
  category: string;
  explanation: string;
}

const POPULAR_STACKS = ["React", "Angular", "Vue", "Node.js", "Python", "Java", "SQL", ".NET", "TypeScript", "JavaScript", "Go", "Rust", "Docker", "Kubernetes", "AWS", "System Design", "Data Structures", "DevOps", "GraphQL", "MongoDB"];
const DIFFICULTIES = ["all", "basic", "intermediate", "pro"] as const;
const difficultyColors = { basic: "text-primary", intermediate: "text-amber", pro: "text-rose" };

const QuizPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<typeof DIFFICULTIES[number]>("all");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizStarted, setQuizStarted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pastResults, setPastResults] = useState<any[]>([]);

  const currentQ = questions[currentIndex];

  const fetchResults = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("quiz_results")
      .select("*")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false })
      .limit(10);
    setPastResults(data || []);
  };

  useEffect(() => { fetchResults(); }, [user]);

  useEffect(() => {
    if (!timerEnabled || !quizStarted || selected !== null) return;
    if (timeLeft <= 0) { handleAnswer(-1); return; }
    const t = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, timerEnabled, quizStarted, selected]);

  const generateQuestions = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: {
          category: selectedCategory,
          difficulty: selectedDifficulty,
          count: 10,
        },
      });
      if (error) throw error;
      if (data?.questions?.length) {
        setQuestions(data.questions);
        setQuizStarted(true);
        setCurrentIndex(0);
        setScore(0);
        setAnswered(0);
        setSelected(null);
        setShowExplanation(false);
        setTimeLeft(30);
      } else {
        throw new Error("No questions generated");
      }
    } catch (e: any) {
      toast({ title: "Failed to generate quiz", description: e.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowExplanation(true);
    setAnswered((p) => p + 1);
    if (idx === currentQ.correct) setScore((p) => p + 1);
  };

  const nextQuestion = () => {
    if (currentIndex >= questions.length - 1) {
      saveResult();
      return;
    }
    setSelected(null);
    setShowExplanation(false);
    setTimeLeft(30);
    setCurrentIndex((p) => p + 1);
  };

  const saveResult = async () => {
    if (!user) return;
    const finalScore = score + (selected === currentQ?.correct ? 1 : 0);
    await supabase.from("quiz_results").insert({
      user_id: user.id,
      category: selectedCategory,
      difficulty: selectedDifficulty,
      score: finalScore,
      total: questions.length,
    });
    toast({ title: "Quiz complete!", description: `Score: ${finalScore}/${questions.length}` });
    fetchResults();
    resetQuiz();
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelected(null);
    setShowExplanation(false);
    setScore(0);
    setAnswered(0);
    setTimeLeft(30);
    setQuizStarted(false);
    setQuestions([]);
  };

  if (!quizStarted) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Quiz & Interview Prep</h1>
            <p className="text-sm text-muted-foreground">AI-generated questions — fresh every time</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <CyberCard glowColor="amber">
            <div className="space-y-5">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">Category</p>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.map((c) => (
                    <Badge key={c} variant={selectedCategory === c ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedCategory(c)}>{c}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">Difficulty</p>
                <div className="flex gap-2 flex-wrap">
                  {DIFFICULTIES.map((d) => (
                    <Badge key={d} variant={selectedDifficulty === d ? "default" : "outline"} className="cursor-pointer capitalize" onClick={() => setSelectedDifficulty(d)}>{d}</Badge>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={timerEnabled} onChange={(e) => setTimerEnabled(e.target.checked)} className="rounded" />
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>30s timer per question</span>
              </label>
              <Button variant="glow" className="w-full" onClick={generateQuestions} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate & Start Quiz
                  </>
                )}
              </Button>
            </div>
          </CyberCard>
        </ScrollReveal>

        {pastResults.length > 0 && (
          <ScrollReveal delay={200}>
            <div>
              <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber" /> Recent Results
              </h2>
              <div className="space-y-2">
                {pastResults.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border border-border/20 bg-card/40 p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{r.category}</Badge>
                      <span className="text-xs text-muted-foreground capitalize">{r.difficulty}</span>
                    </div>
                    <span className="font-mono text-primary">{r.score}/{r.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <Brain className="h-10 w-10 mx-auto mb-4 text-muted-foreground opacity-40" />
        <p className="text-muted-foreground">No questions available.</p>
        <Button variant="outline" className="mt-4" onClick={resetQuiz}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quiz Mode</h1>
          <p className="text-sm text-muted-foreground">
            Score: <span className="font-mono text-primary">{score}/{answered}</span> · Question {currentIndex + 1}/{questions.length}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {timerEnabled && (
            <span className={cn("font-mono text-lg font-bold", timeLeft <= 10 ? "text-destructive" : "text-muted-foreground")}>{timeLeft}s</span>
          )}
          <Button variant="ghost" size="icon" onClick={resetQuiz}><RotateCcw className="h-4 w-4" /></Button>
        </div>
      </div>

      <CyberCard glowColor="amber">
        <div className="space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary">{currentQ.category}</Badge>
            <span className={cn("text-xs font-medium capitalize", difficultyColors[currentQ.difficulty] || "text-muted-foreground")}>{currentQ.difficulty}</span>
          </div>
          <h2 className="text-lg font-semibold leading-relaxed">{currentQ.question}</h2>

          <div className="space-y-2">
            {currentQ.options.map((opt, i) => {
              const isCorrect = i === currentQ.correct;
              const isSelected = i === selected;
              return (
                <button key={i} onClick={() => handleAnswer(i)} disabled={selected !== null}
                  className={cn(
                    "w-full text-left rounded-lg border p-3.5 text-sm transition-all duration-200",
                    selected === null
                      ? "border-border/30 bg-secondary/20 hover:bg-secondary hover:border-border cursor-pointer active:scale-[0.98]"
                      : isCorrect ? "border-primary/50 bg-primary/10 text-primary"
                      : isSelected ? "border-destructive/50 bg-destructive/10 text-destructive"
                      : "border-border/20 opacity-40"
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
            <div className="rounded-lg bg-muted/30 border border-border/20 p-3 text-sm text-muted-foreground">
              💡 {currentQ.explanation}
            </div>
          )}

          {selected !== null && (
            <Button variant="glow" className="w-full" onClick={nextQuestion}>
              {currentIndex >= questions.length - 1 ? "Finish Quiz" : "Next Question"} <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CyberCard>
    </div>
  );
};

export default QuizPage;
