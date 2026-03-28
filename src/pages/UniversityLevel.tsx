import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainNavigation } from '@/components/MainNavigation';
import { UnifiedFooter } from '@/components/UnifiedFooter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CourseProgressBar } from '@/components/university/CourseProgressBar';
import { ChevronLeft, ChevronRight, BookOpen, ClipboardCheck, Lock, CheckCircle, Trophy } from 'lucide-react';
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
    hasPassedChapterQuiz,
    allChapterQuizzesPassed,
  } = useUniversityProgress();

  if (!levelData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Level not found</p>
      </div>
    );
  }

  // Level 3 requires Level 2 final exam to be passed
  const isLevelLocked = levelNum === 3 && !hasPassedAssessment(2, 0);
  if (isLevelLocked) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavigation />
        <div className="pt-24 pb-6 container mx-auto px-4 max-w-2xl text-center">
          <Button variant="ghost" size="sm" onClick={() => navigate('/university')} className="mb-3 -ml-2 text-muted-foreground">
            <ChevronLeft className="w-4 h-4 mr-1" /> University
          </Button>
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl tracking-wider text-foreground mb-2">LEVEL 3 LOCKED</h1>
          <p className="text-muted-foreground text-sm">Pass the Level 2 Final Assessment to unlock Level 3.</p>
          <Button className="mt-6" onClick={() => navigate('/university/level-2')}>Go to Level 2</Button>
        </div>
        <UnifiedFooter className="mt-auto" />
      </div>
    );
  }

  // Build chapter info for gating check
  const unitChapterCounts = levelData.units
    .filter(u => u.chapters.length > 0)
    .map(u => ({ unitNumber: u.number, chapters: u.chapters.length }));
  const allQuizzesPassed = allChapterQuizzesPassed(levelNum, unitChapterCounts);

  // Check if a chapter is accessible (Chapter 1 of each unit has special rules)
  const isChapterAccessible = (unitNumber: number, chapterNumber: number): boolean => {
    // Chapter 1 of Unit 1 is always accessible
    if (unitNumber === 1 && chapterNumber === 1) return true;
    
    // Chapter 1 of other units: requires previous unit's last chapter quiz to be passed
    if (chapterNumber === 1) {
      const prevUnit = levelData.units.find(u => u.number === unitNumber - 1);
      if (!prevUnit || prevUnit.chapters.length === 0) return true;
      return hasPassedChapterQuiz(levelNum, unitNumber - 1, prevUnit.chapters.length);
    }

    // Other chapters: requires previous chapter's quiz to be passed
    return hasPassedChapterQuiz(levelNum, unitNumber, chapterNumber - 1);
  };

  // Count passed quizzes for a unit
  const getUnitQuizzesPassed = (unitNumber: number, totalChapters: number): number => {
    let count = 0;
    for (let i = 1; i <= totalChapters; i++) {
      if (hasPassedChapterQuiz(levelNum, unitNumber, i)) count++;
    }
    return count;
  };

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
            const quizzesPassed = hasChapters ? getUnitQuizzesPassed(unit.number, unit.chapters.length) : 0;
            const allUnitQuizzesPassed = hasChapters && quizzesPassed >= unit.chapters.length;
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
                    {allUnitQuizzesPassed && <CheckCircle className="w-5 h-5 text-green-500" />}
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{unit.description}</p>

                  {hasChapters && (
                    <>
                      <CourseProgressBar
                        label="Quizzes Passed"
                        completed={quizzesPassed}
                        total={unit.chapters.length}
                      />

                      <div className="mt-4 space-y-2">
                        {unit.chapters.map((ch) => {
                          const done = isChapterComplete(levelNum, unit.number, ch.number);
                          const qPassed = hasPassedChapterQuiz(levelNum, unit.number, ch.number);
                          const accessible = isChapterAccessible(unit.number, ch.number);
                          return (
                            <button
                              key={ch.number}
                              onClick={() => accessible ? navigate(`/university/level-${levelNum}/unit-${unit.number}/chapter-${ch.number}`) : undefined}
                              disabled={!accessible}
                              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                                accessible
                                  ? 'border-primary/10 hover:border-primary/30 cursor-pointer'
                                  : 'border-muted/20 opacity-50 cursor-not-allowed'
                              }`}
                            >
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                                qPassed ? 'bg-green-500/20 text-green-500' : done ? 'bg-primary/20 text-primary' : !accessible ? 'bg-muted text-muted-foreground' : 'bg-muted text-muted-foreground'
                              }`}>
                                {!accessible ? <Lock className="w-3 h-3" /> : qPassed ? '✓' : ch.number}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground truncate">{ch.title}</p>
                                {qPassed && <p className="text-xs text-green-500">Quiz passed</p>}
                                {done && !qPassed && accessible && <p className="text-xs text-primary">Quiz pending</p>}
                              </div>
                              {accessible && <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Unit Assessment — Optional Revision */}
                      {assessment && assessment.questions.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-primary/10">
                          <button
                            onClick={() => navigate(`/university/level-${levelNum}/unit-${unit.number}/assessment`)}
                            className="w-full flex items-center gap-3 p-3 rounded-lg border border-primary/10 hover:border-primary/20 cursor-pointer transition-colors text-left"
                          >
                            {passed ? (
                              <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                            ) : (
                              <BookOpen className="w-5 h-5 text-muted-foreground shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">Optional Revision — Unit Assessment</p>
                              <p className="text-xs text-muted-foreground">
                                {best
                                  ? `Best: ${best.score}/${best.total} (${Math.round((best.score / best.total) * 100)}%)`
                                  : `${assessment.questions.length} questions — practice only`}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
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

          {/* Final Assessment */}
          {levelData.finalAssessment && levelData.finalAssessment.questions.length > 0 && (
            <Card className={`p-5 border-2 ${allQuizzesPassed ? 'border-primary/40' : 'border-muted/20'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-base tracking-wider text-foreground">Final Assessment</h2>
                  <p className="text-xs text-muted-foreground">
                    {allQuizzesPassed
                      ? `${levelData.finalAssessment.questions.length} questions — ${levelData.finalAssessment.passMarkPercent}% to pass`
                      : 'Pass all chapter quizzes to unlock'}
                  </p>
                </div>
                {!allQuizzesPassed && <Lock className="w-5 h-5 text-muted-foreground" />}
                {allQuizzesPassed && hasPassedAssessment(levelNum, 0) && <CheckCircle className="w-5 h-5 text-green-500" />}
              </div>
              <Button
                onClick={() => navigate(`/university/level-${levelNum}/unit-0/assessment`)}
                disabled={!allQuizzesPassed}
                className="w-full mt-2"
                variant={allQuizzesPassed ? 'default' : 'outline'}
              >
                {allQuizzesPassed ? 'Start Final Assessment' : 'Complete All Chapter Quizzes First'}
              </Button>
            </Card>
          )}
        </div>
      </main>

      <UnifiedFooter className="mt-auto" />
    </div>
  );
}
