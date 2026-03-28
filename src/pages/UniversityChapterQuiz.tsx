import { useNavigate, useParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MainNavigation } from '@/components/MainNavigation';
import { UnifiedFooter } from '@/components/UnifiedFooter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronLeft, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { getChapterData, getUnitData, getChapterQuiz } from '@/lib/university/courseStructure';
import { useUniversityProgress } from '@/hooks/useUniversityProgress';
import { useUniversityAdmin } from '@/hooks/useUniversityAdmin';
import { AdminControlPanel } from '@/components/university/AdminControlPanel';
import { toast } from 'sonner';
import type { AssessmentQuestion } from '@/lib/university/types';

function pickRandom(bank: AssessmentQuestion[], count: number): AssessmentQuestion[] {
  const shuffled = [...bank].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function UniversityChapterQuiz() {
  const { courseType, level, unit, chapter } = useParams();
  const navigate = useNavigate();
  const ct = courseType || 'gym';
  const levelNum = parseInt(level?.replace('level-', '') || '2');
  const unitNum = parseInt(unit?.replace('unit-', '') || '1');
  const chapterNum = parseInt(chapter?.replace('chapter-', '') || '1');

  const quiz = getChapterQuiz(levelNum, unitNum, chapterNum, ct);
  const chapterData = getChapterData(levelNum, unitNum, chapterNum, ct);
  const unitData = getUnitData(levelNum, unitNum, ct);
  const { submitChapterQuiz, hasPassedChapterQuiz } = useUniversityProgress();
  const { effectiveShowAnswers } = useUniversityAdmin();

  const [seed, setSeed] = useState(0);
  const questions = useMemo(() => {
    if (!quiz) return [];
    return pickRandom(quiz.questionBank, quiz.pickCount);
  }, [quiz, seed]);

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  if (!quiz || !chapterData || !unitData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Quiz not found</p>
      </div>
    );
  }

  const total = questions.length;
  const passMarkPercent = quiz.passMarkPercent;

  const handleSelect = (value: string) => {
    const updated = [...answers];
    updated[currentQ] = parseInt(value);
    setAnswers(updated);
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, i) => { if (answers[i] === q.correctAnswer) correct++; });
    setScore(correct);
    setSubmitted(true);
    const passed = Math.round((correct / total) * 100) >= passMarkPercent;
    submitChapterQuiz.mutate(
      { level: levelNum, unitNumber: unitNum, chapterNumber: chapterNum, score: correct, total, passed, answers: answers as number[], courseType: ct },
      { onSuccess: () => { passed ? toast.success('Quiz passed! Next chapter unlocked.') : toast('Not quite — try again with new questions.'); } }
    );
  };

  const handleRetry = () => {
    setSeed(s => s + 1);
    setAnswers(new Array(quiz.pickCount).fill(null));
    setCurrentQ(0);
    setSubmitted(false);
    setScore(0);
  };

  const handleContinue = () => {
    const totalChapters = unitData.chapters.length;
    if (chapterNum < totalChapters) {
      navigate(`/university/${ct}/level-${levelNum}/unit-${unitNum}/chapter-${chapterNum + 1}`);
    } else {
      navigate(`/university/${ct}/level-${levelNum}`);
    }
  };

  const allAnswered = answers.every(a => a !== null);
  const percent = Math.round((score / total) * 100);
  const passed = percent >= passMarkPercent;
  const question = questions[currentQ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavigation />
        <div className="pt-24 pb-4 border-b border-primary/20">
          <div className="container mx-auto px-4 max-w-2xl">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/university/${ct}/level-${levelNum}/unit-${unitNum}/chapter-${chapterNum}`)} className="mb-2 -ml-2 text-muted-foreground">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Chapter
            </Button>
            <p className="text-xs text-primary font-display tracking-wider">CHAPTER {chapterNum} QUIZ RESULTS</p>
            <h1 className="font-display text-xl tracking-wider text-foreground mt-1">{chapterData.title}</h1>
          </div>
        </div>
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className={`p-6 text-center border-2 ${passed ? 'border-green-500/50 bg-green-500/10' : 'border-destructive/50 bg-destructive/10'}`}>
              {passed ? <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" /> : <XCircle className="w-12 h-12 text-destructive mx-auto mb-3" />}
              <h3 className="font-display text-2xl tracking-wider text-foreground mb-1">{passed ? 'PASSED' : 'NOT YET'}</h3>
              <p className="text-muted-foreground text-sm mb-2">You scored {score}/{total} ({percent}%) — Pass mark: {passMarkPercent}%</p>
              {!passed && <p className="text-muted-foreground text-xs">Review the chapter content and try again. You'll get different questions next time.</p>}
            </Card>
            <div className="space-y-4">
              {questions.map((q, i) => {
                const isCorrect = answers[i] === q.correctAnswer;
                return (
                  <Card key={i} className={`p-4 border ${isCorrect ? 'border-green-500/30' : 'border-destructive/30'}`}>
                    <div className="flex items-start gap-2 mb-2">
                      {isCorrect ? <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /> : <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />}
                      <p className="text-sm text-foreground font-medium">{q.question}</p>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      {isCorrect ? 'Correct' : `Your answer: ${q.options[answers[i]!]}`}
                      {!isCorrect && ` → Correct: ${q.options[q.correctAnswer]}`}
                    </p>
                    <p className="text-xs text-primary/80 ml-6 mt-1">{q.explanation}</p>
                  </Card>
                );
              })}
            </div>
            {passed ? (
              <Button onClick={handleContinue} className="w-full gap-2"><CheckCircle className="w-4 h-4" /> Continue</Button>
            ) : (
              <Button onClick={handleRetry} className="w-full gap-2"><RotateCcw className="w-4 h-4" /> Try Again with New Questions</Button>
            )}
          </div>
        </main>
        <UnifiedFooter className="mt-auto" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <div className="pt-24 pb-4 border-b border-primary/20">
        <div className="container mx-auto px-4 max-w-2xl">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/university/${ct}/level-${levelNum}/unit-${unitNum}/chapter-${chapterNum}`)} className="mb-2 -ml-2 text-muted-foreground">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Chapter
          </Button>
          <p className="text-xs text-primary font-display tracking-wider">CHAPTER {chapterNum} QUIZ</p>
          <h1 className="font-display text-xl tracking-wider text-foreground mt-1">{chapterData.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{total} questions — {passMarkPercent}% to pass</p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Question {currentQ + 1} of {total}</span>
            <span>{answers.filter(a => a !== null).length} answered</span>
          </div>

          <motion.div key={`${seed}-${currentQ}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
            <Card className="p-5">
              {question.scenario && (
                <div className="bg-muted/50 rounded-lg p-3 mb-4">
                  <p className="text-xs font-display tracking-wider text-muted-foreground mb-1">SCENARIO</p>
                  <p className="text-sm text-foreground leading-relaxed">{question.scenario}</p>
                </div>
              )}
              <p className="text-foreground font-medium text-sm mb-4">{question.question}</p>
              <RadioGroup value={answers[currentQ]?.toString() ?? ''} onValueChange={handleSelect} className="space-y-3">
                {question.options.map((opt, i) => {
                  const isCorrectAnswer = effectiveShowAnswers && i === question.correctAnswer;
                  return (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${isCorrectAnswer ? 'border-green-500/50 bg-green-500/10' : 'border-primary/10 hover:border-primary/30'}`}>
                      <RadioGroupItem value={i.toString()} id={`q${currentQ}-o${i}`} className="mt-0.5" />
                      <Label htmlFor={`q${currentQ}-o${i}`} className="text-sm text-foreground cursor-pointer leading-relaxed">
                        {opt}
                        {isCorrectAnswer && <span className="ml-2 text-green-500 text-xs">✓ correct</span>}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </Card>
          </motion.div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0} className="flex-1">Previous</Button>
            {currentQ < total - 1 ? (
              <Button onClick={() => setCurrentQ(currentQ + 1)} disabled={answers[currentQ] === null} className="flex-1">Next</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!allAnswered} className="flex-1">Submit Quiz</Button>
            )}
          </div>

          <div className="flex justify-center gap-1.5 flex-wrap">
            {questions.map((_, i) => (
              <button key={i} onClick={() => setCurrentQ(i)} className={`w-7 h-7 rounded-full text-xs font-medium transition-colors ${
                i === currentQ ? 'bg-primary text-primary-foreground' : answers[i] !== null ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
              }`}>{i + 1}</button>
            ))}
          </div>
        </div>
      </main>
      <AdminControlPanel />
      <UnifiedFooter className="mt-auto" />
    </div>
  );
}
