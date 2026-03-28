import type { Level, ChapterQuiz } from './types';
import { level2Unit1 } from './level2/unit1';
import { level2Unit2 } from './level2/unit2';
import { level2Unit3 } from './level2/unit3';
import { level2Unit4 } from './level2/unit4';
import { level2Unit1Assessment } from './level2/assessments';
import { level2Unit2Assessment } from './level2/unit2-assessments';
import { level2Unit3Assessment } from './level2/unit3-assessments';
import { level2Unit4Assessment } from './level2/unit4-assessments';
import { level2FinalAssessment } from './level2/final-assessment';
import { unit1ChapterQuizzes } from './level2/unit1-chapter-quizzes';
import { unit2ChapterQuizzes } from './level2/unit2-chapter-quizzes';
import { unit3ChapterQuizzes } from './level2/unit3-chapter-quizzes';
import { unit4ChapterQuizzes } from './level2/unit4-chapter-quizzes';

export const PASS_MARK_PERCENT = 80;

const level2ChapterQuizzes: ChapterQuiz[] = [
  ...unit1ChapterQuizzes,
  ...unit2ChapterQuizzes,
  ...unit3ChapterQuizzes,
  ...unit4ChapterQuizzes,
];

export const courseData: Level[] = [
  {
    level: 2,
    title: 'Level 2 Certificate',
    subtitle: 'Foundation',
    description: 'Master the fundamentals of anatomy, nutrition, exercise science, and programme building. This level provides the essential knowledge every serious gym user needs.',
    units: [
      level2Unit1,
      level2Unit2,
      level2Unit3,
      level2Unit4,
    ],
    assessments: [level2Unit1Assessment, level2Unit2Assessment, level2Unit3Assessment, level2Unit4Assessment],
    finalAssessment: level2FinalAssessment,
    chapterQuizzes: level2ChapterQuizzes,
  },
  {
    level: 3,
    title: 'Level 3 Certificate',
    subtitle: 'Advanced Application',
    description: 'Take your knowledge further with advanced nutrition strategies, hypertrophy science, periodised programme design, and the psychology of long-term adherence.',
    units: [
      {
        number: 1,
        title: 'Advanced Nutrition',
        description: 'Macro periodisation, nutrient timing, evidence-based supplementation, body composition, and metabolic adaptation.',
        chapters: [],
      },
      {
        number: 2,
        title: 'Muscle Growth Principles',
        description: 'Hypertrophy science, progressive overload, volume and intensity management, deloading, and fibre types.',
        chapters: [],
      },
      {
        number: 3,
        title: 'Programme Design',
        description: 'Periodisation models, exercise order, auto-regulation, weak point training, and peaking strategies.',
        chapters: [],
      },
      {
        number: 4,
        title: 'Behaviour & Lifestyle',
        description: 'Adherence psychology, habit formation, stress management, sleep optimisation, and long-term sustainability.',
        chapters: [],
      },
    ],
    assessments: [],
    finalAssessment: {
      unitNumber: 0,
      title: 'Level 3 Final Assessment',
      passMarkPercent: 80,
      questions: [],
    },
    chapterQuizzes: [],
  },
];

export function getLevelData(level: number): Level | undefined {
  return courseData.find(l => l.level === level);
}

export function getUnitData(level: number, unitNumber: number) {
  const levelData = getLevelData(level);
  return levelData?.units.find(u => u.number === unitNumber);
}

export function getChapterData(level: number, unitNumber: number, chapterNumber: number) {
  const unit = getUnitData(level, unitNumber);
  return unit?.chapters.find(c => c.number === chapterNumber);
}

export function getAssessment(level: number, unitNumber: number) {
  const levelData = getLevelData(level);
  if (unitNumber === 0) return levelData?.finalAssessment;
  return levelData?.assessments.find(a => a.unitNumber === unitNumber);
}

export function getChapterQuiz(level: number, unitNumber: number, chapterNumber: number): ChapterQuiz | undefined {
  const levelData = getLevelData(level);
  return levelData?.chapterQuizzes.find(
    q => q.unitNumber === unitNumber && q.chapterNumber === chapterNumber
  );
}

export function getTotalChapters(level: number): number {
  const levelData = getLevelData(level);
  if (!levelData) return 0;
  return levelData.units.reduce((sum, u) => sum + u.chapters.length, 0);
}
