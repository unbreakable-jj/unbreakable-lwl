import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainNavigation } from '@/components/MainNavigation';
import { UnifiedFooter } from '@/components/UnifiedFooter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CourseProgressBar } from '@/components/university/CourseProgressBar';
import { ChevronLeft, ChevronRight, BookOpen, ClipboardCheck, Lock, CheckCircle } from 'lucide-react';
import { getLevelData } from '@/lib/university/courseStructure';
import { useUniversityProgress } from '@/hooks/useUniversityProgress';

export default function UniversityLevel() {
  const { level } = useParams();
  const navigate = useNavigate();
  const levelNum = parseInt(level?.replace('level-', '') || '2');
  const levelData = getLevelData(levelNum);
  const {
    getUnitCompletedChapters,
    isChapterComplete,
    hasPassedAssessment,
    getBestAssessment,
  } = useUniversityProgress();

  if (!levelData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Level not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />

      <div className="pt-24 pb-6 border-b border-primary/20">
        <div className="container mx-auto px-4 max-w-2xl">
          <Button variant="ghost" size="sm" onClick={() => navigate('/university')} className="mb-3 -ml-2 text-muted-foreground">
            <ChevronLeft className="w-4 h-4 mr-1" /> University
          </Button>
          <h1 className="font-display text-3xl tracking-wider leading-none">
            <span className="text-primary neon-glow-subtle">{levelData.title.toUpperCase()}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{levelData.subtitle} — {levelData.units.length} Units</p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-4">
          {levelData.units.map((unit) => {
            const hasChapters = unit.chapters.length > 0;
            const completedCount = getUnitCompletedChapters(levelNum, unit.number);
            const allComplete = hasChapters && completedCount >= unit.chapters.length;
            const assessment = getLevelData(levelNum)?.assessments.find(a => a.unitNumber === unit.number);
            const passed = hasPassedAssessment(levelNum, unit.number);
            const best = getBestAssessment(levelNum, unit.number);

            return (
              <motion.div
                key={unit.number}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: unit.number * 0.05 }}
              >
                <Card className="p-5 border-primary/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <span className="font-display text-sm text-primary">{unit.number}</span>
                    </div>
                    <div className="flex-1">
                      <h2 className="font-display text-base tracking-wider text-foreground">{unit.title}</h2>
                      <p className="text-xs text-muted-foreground">{unit.chapters.length} Chapters</p>
                    </div>
                    {passed && <CheckCircle className="w-5 h-5 text-green-500" />}
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{unit.description}</p>

                  {hasChapters && (
                    <>
                      <CourseProgressBar
                        label="Chapters"
                        completed={completedCount}
                        total={unit.chapters.length}
                      />

                      <div className="mt-4 space-y-2">
                        {unit.chapters.map((ch) => {
                          const done = isChapterComplete(levelNum, unit.number, ch.number);
                          return (
                            <button
                              key={ch.number}
                              onClick={() => navigate(`/university/level-${levelNum}/unit-${unit.number}/chapter-${ch.number}`)}
                              className="w-full flex items-center gap-3 p-3 rounded-lg border border-primary/10 hover:border-primary/30 transition-colors text-left"
                            >
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                                done ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'
                              }`}>
                                {done ? '✓' : ch.number}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground truncate">{ch.title}</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                            </button>
                          );
                        })}
                      </div>

                      {/* Unit Assessment */}
                      {assessment && assessment.questions.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-primary/10">
                          <button
                            onClick={() => allComplete ? navigate(`/university/level-${levelNum}/unit-${unit.number}/assessment`) : undefined}
                            disabled={!allComplete}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                              allComplete
                                ? 'border-primary/20 hover:border-primary/40 cursor-pointer'
                                : 'border-muted/20 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            {!allComplete ? (
                              <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
                            ) : passed ? (
                              <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                            ) : (
                              <ClipboardCheck className="w-5 h-5 text-primary shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">Unit Assessment</p>
                              <p className="text-xs text-muted-foreground">
                                {!allComplete
                                  ? 'Complete all chapters to unlock'
                                  : best
                                  ? `Best: ${best.score}/${best.total} (${Math.round((best.score / best.total) * 100)}%)`
                                  : `${assessment.questions.length} questions — ${assessment.passMarkPercent}% to pass`}
                              </p>
                            </div>
                            {allComplete && <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {!hasChapters && (
                    <p className="text-xs text-primary font-display tracking-wider">COMING SOON</p>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </main>

      <UnifiedFooter className="mt-auto" />
    </div>
  );
}
