import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainNavigation } from '@/components/MainNavigation';
import { UnifiedFooter } from '@/components/UnifiedFooter';
import { Button } from '@/components/ui/button';
import { AssessmentQuiz } from '@/components/university/AssessmentQuiz';
import { ChevronLeft } from 'lucide-react';
import { getAssessment, getUnitData } from '@/lib/university/courseStructure';
import { useUniversityProgress } from '@/hooks/useUniversityProgress';
import { toast } from 'sonner';

export default function UniversityAssessment() {
  const { level, unit } = useParams();
  const navigate = useNavigate();
  const levelNum = parseInt(level?.replace('level-', '') || '2');
  const unitNum = parseInt(unit?.replace('unit-', '') || '1');

  const assessment = getAssessment(levelNum, unitNum);
  const unitData = getUnitData(levelNum, unitNum);
  const { submitAssessment, getBestAssessment } = useUniversityProgress();
  const best = getBestAssessment(levelNum, unitNum);

  if (!assessment || !assessment.questions.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Assessment not found</p>
      </div>
    );
  }

  const handleComplete = (score: number, total: number, passed: boolean, answers: number[]) => {
    submitAssessment.mutate(
      { level: levelNum, unitNumber: unitNum, isFinal: unitNum === 0, score, total, passed, answers },
      {
        onSuccess: () => {
          if (passed) {
            toast.success('Assessment passed! Well done.');
          } else {
            toast('Keep going — review the content and try again.');
          }
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />

      <div className="pt-24 pb-4 border-b border-primary/20">
        <div className="container mx-auto px-4 max-w-2xl">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/university/level-${levelNum}`)} className="mb-2 -ml-2 text-muted-foreground">
            <ChevronLeft className="w-4 h-4 mr-1" /> Unit {unitNum}: {unitData?.title}
          </Button>
          <p className="text-xs text-primary font-display tracking-wider">LEVEL {levelNum} — UNIT {unitNum} ASSESSMENT</p>
          <h1 className="font-display text-2xl tracking-wider text-foreground mt-1">{assessment.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {assessment.questions.length} questions — {assessment.passMarkPercent}% to pass
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AssessmentQuiz
              assessment={assessment}
              onComplete={handleComplete}
              bestScore={best ? { score: best.score, total: best.total, passed: best.passed } : null}
            />
          </motion.div>
        </div>
      </main>

      <UnifiedFooter className="mt-auto" />
    </div>
  );
}
