import type { Level, ChapterQuiz, CourseDefinition } from './types';
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

// Level 3 imports
import { level3Unit1 } from './level3/unit1';
import { level3Unit2 } from './level3/unit2';
import { level3Unit3 } from './level3/unit3';
import { level3Unit4 } from './level3/unit4';
import { level3Unit1Assessment } from './level3/assessments';
import { level3Unit2Assessment } from './level3/unit2-assessments';
import { level3Unit3Assessment } from './level3/unit3-assessments';
import { level3Unit4Assessment } from './level3/unit4-assessments';
import { level3FinalAssessment } from './level3/final-assessment';
import { level3Unit1ChapterQuizzes } from './level3/unit1-chapter-quizzes';
import { level3Unit2ChapterQuizzes } from './level3/unit2-chapter-quizzes';
import { level3Unit3ChapterQuizzes } from './level3/unit3-chapter-quizzes';
import { level3Unit4ChapterQuizzes } from './level3/unit4-chapter-quizzes';

// Nutrition Level 2 imports
import { nutritionL2Unit1 } from './nutrition-l2/unit1';
import { nutritionL2Unit2 } from './nutrition-l2/unit2';
import { nutritionL2Unit3 } from './nutrition-l2/unit3';
import { nutritionL2Unit4 } from './nutrition-l2/unit4';
import {
  nutritionL2Unit1Assessment, nutritionL2Unit2Assessment,
  nutritionL2Unit3Assessment, nutritionL2Unit4Assessment,
  nutritionL2FinalAssessment,
  nutritionL2Unit1ChapterQuizzes, nutritionL2Unit2ChapterQuizzes,
  nutritionL2Unit3ChapterQuizzes, nutritionL2Unit4ChapterQuizzes,
} from './nutrition-l2/assessments';

export const PASS_MARK_PERCENT = 80;

const level2ChapterQuizzes: ChapterQuiz[] = [
  ...unit1ChapterQuizzes,
  ...unit2ChapterQuizzes,
  ...unit3ChapterQuizzes,
  ...unit4ChapterQuizzes,
];

const level3ChapterQuizzes: ChapterQuiz[] = [
  ...level3Unit1ChapterQuizzes,
  ...level3Unit2ChapterQuizzes,
  ...level3Unit3ChapterQuizzes,
  ...level3Unit4ChapterQuizzes,
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
      level3Unit1,
      level3Unit2,
      level3Unit3,
      level3Unit4,
    ],
    assessments: [level3Unit1Assessment, level3Unit2Assessment, level3Unit3Assessment, level3Unit4Assessment],
    finalAssessment: level3FinalAssessment,
    chapterQuizzes: level3ChapterQuizzes,
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
