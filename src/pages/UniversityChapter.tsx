import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainNavigation } from '@/components/MainNavigation';
import { UnifiedFooter } from '@/components/UnifiedFooter';
import { Button } from '@/components/ui/button';
import { ChapterContent } from '@/components/university/ChapterContent';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { getChapterData, getUnitData } from '@/lib/university/courseStructure';
import { useUniversityProgress } from '@/hooks/useUniversityProgress';
import { toast } from 'sonner';

export default function UniversityChapter() {
  const { level, unit, chapter } = useParams();
  const navigate = useNavigate();
  const levelNum = parseInt(level?.replace('level-', '') || '2');
  const unitNum = parseInt(unit?.replace('unit-', '') || '1');
  const chapterNum = parseInt(chapter?.replace('chapter-', '') || '1');

  const chapterData = getChapterData(levelNum, unitNum, chapterNum);
  const unitData = getUnitData(levelNum, unitNum);
  const { isChapterComplete, completeChapter } = useUniversityProgress();
  const isComplete = isChapterComplete(levelNum, unitNum, chapterNum);

  if (!chapterData || !unitData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Chapter not found</p>
      </div>
    );
  }

  const totalChapters = unitData.chapters.length;
  const hasNext = chapterNum < totalChapters;
  const hasPrev = chapterNum > 1;

  const handleComplete = () => {
    completeChapter.mutate(
      { level: levelNum, unitNumber: unitNum, chapterNumber: chapterNum },
      {
        onSuccess: () => {
          toast.success('Chapter completed!');
          if (hasNext) {
            navigate(`/university/level-${levelNum}/unit-${unitNum}/chapter-${chapterNum + 1}`);
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
            <ChevronLeft className="w-4 h-4 mr-1" /> Unit {unitNum}: {unitData.title}
          </Button>
          <div className="flex items-center gap-2">
            <p className="text-xs text-primary font-display tracking-wider">
              LEVEL {levelNum} — UNIT {unitNum} — CHAPTER {chapterNum}
            </p>
            {isComplete && <CheckCircle className="w-4 h-4 text-green-500" />}
          </div>
          <h1 className="font-display text-2xl tracking-wider text-foreground mt-1">{chapterData.title}</h1>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChapterContent chapter={chapterData} />
          </motion.div>

          {/* Bottom nav */}
          <div className="mt-10 pt-6 border-t border-primary/10 space-y-4">
            {!isComplete && (
              <Button
                onClick={handleComplete}
                className="w-full gap-2"
                disabled={completeChapter.isPending}
              >
                <CheckCircle className="w-4 h-4" />
                Mark as Complete {hasNext ? '& Continue' : ''}
              </Button>
            )}

            <div className="flex gap-3">
              {hasPrev && (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/university/level-${levelNum}/unit-${unitNum}/chapter-${chapterNum - 1}`)}
                  className="flex-1"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
              )}
              {hasNext && isComplete && (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/university/level-${levelNum}/unit-${unitNum}/chapter-${chapterNum + 1}`)}
                  className="flex-1"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
              {!hasNext && isComplete && (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/university/level-${levelNum}`)}
                  className="flex-1"
                >
                  Back to Unit List
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      <UnifiedFooter className="mt-auto" />
    </div>
  );
}
