import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainNavigation } from '@/components/MainNavigation';
import { UnifiedFooter } from '@/components/UnifiedFooter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CourseProgressBar } from '@/components/university/CourseProgressBar';
import { GraduationCap, Lock, ChevronRight, Flame, Dumbbell, Apple, Brain } from 'lucide-react';
import { allCourses, getTotalChapters } from '@/lib/university/courseStructure';
import { useUniversityProgress } from '@/hooks/useUniversityProgress';
import { AdminControlPanel } from '@/components/university/AdminControlPanel';
import type { CourseType } from '@/lib/university/types';

const courseTabs: { key: CourseType; label: string; icon: React.ReactNode; description: string }[] = [
  { key: 'gym', label: 'Power', icon: <Dumbbell className="w-4 h-4" />, description: 'Applied Fitness & Exercise Science' },
  { key: 'nutrition', label: 'Fuel', icon: <Apple className="w-4 h-4" />, description: 'Healthy Eating & Nutritional Science' },
  { key: 'mindset', label: 'Mindset', icon: <Brain className="w-4 h-4" />, description: 'Mental Performance & Wellbeing' },
];

export default function University() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('course') as CourseType) || 'gym';
  const { getLevelCompletedChapters, hasPassedAssessment } = useUniversityProgress();

  const courseData = allCourses[activeTab] || [];

  const setActiveTab = (tab: CourseType) => {
    setSearchParams({ course: tab });
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />

      {/* Hero */}
      <section className="pt-24 pb-12 md:pt-28 md:pb-16 border-b border-primary/20">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-wide leading-none">
              <span className="text-primary neon-glow-subtle">UNBREAKABLE </span>
              <span className="text-foreground">UNIVERSITY</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              Level 2 &amp; Level 3 Certificates in Applied Fitness, Nutrition &amp; Mindset.
              Certified standard — not an officially accredited NVQ qualification.
              Master the science. Apply the knowledge. Live without limits.
            </p>
            <p className="text-primary font-display text-lg tracking-wider neon-glow-subtle">
              #UNBREAKABLEUNIVERSITY
            </p>
          </motion.div>
        </div>
      </section>

      {/* Course Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2 p-1 bg-muted/30 rounded-xl">
            {courseTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-display tracking-wider transition-all ${
                  activeTab === tab.key
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            {courseTabs.find(t => t.key === activeTab)?.description}
          </p>
        </div>
      </div>

      {/* Level Cards */}
      <main className="container mx-auto px-4 pb-10 md:pb-16">
        <div className="max-w-2xl mx-auto space-y-6">
          {courseData.length === 0 && (
            <Card className="p-6 border-primary/20 text-center">
              <Flame className="w-8 h-8 text-primary mx-auto mb-3" />
              <h2 className="font-display text-lg tracking-wider text-foreground mb-2">COMING SOON</h2>
              <p className="text-sm text-muted-foreground">
                The {courseTabs.find(t => t.key === activeTab)?.label} course is being developed. Check back soon.
              </p>
            </Card>
          )}

          {courseData.map((level) => {
            const totalChapters = getTotalChapters(level.level, activeTab);
            const completedChapters = getLevelCompletedChapters(level.level, activeTab);
            const hasContent = level.units.some(u => u.chapters.length > 0);
            const isLocked = level.level === 3 && !hasPassedAssessment(2, 0, activeTab);

            return (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: level.level * 0.1 }}
              >
                <Card
                  className={`p-6 border transition-all ${
                    isLocked
                      ? 'border-muted/30 opacity-60'
                      : 'border-primary/20 hover:border-primary/40 cursor-pointer'
                  }`}
                  onClick={() => !isLocked && hasContent && navigate(`/university/${activeTab}/level-${level.level}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isLocked ? 'bg-muted/30' : 'bg-primary/20'
                      }`}>
                        {isLocked ? (
                          <Lock className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <GraduationCap className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <h2 className="font-display text-lg tracking-wider text-foreground">{level.title}</h2>
                        <p className="text-xs text-primary font-display tracking-wider">{level.subtitle}</p>
                      </div>
                    </div>
                    {!isLocked && hasContent && (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{level.description}</p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span>{level.units.length} Units</span>
                    <span>{totalChapters} Chapters</span>
                    <span>80% Pass Mark</span>
                  </div>

                  {hasContent && totalChapters > 0 && (
                    <CourseProgressBar
                      label="Course Progress"
                      completed={completedChapters}
                      total={totalChapters}
                    />
                  )}

                  {!hasContent && !isLocked && (
                    <div className="flex items-center gap-2 text-xs text-primary">
                      <Flame className="w-3 h-3" />
                      <span className="font-display tracking-wider">COMING SOON</span>
                    </div>
                  )}

                  {isLocked && (
                    <p className="text-xs text-muted-foreground italic">Complete Level 2 to unlock</p>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-primary font-display text-lg tracking-wider neon-glow-subtle mt-12">
          LIVE WITHOUT LIMITS.
        </p>
      </main>

      <AdminControlPanel />
      <UnifiedFooter className="mt-auto" />
    </div>
  );
}
