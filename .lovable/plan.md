

## Plan: Chapter Mini-Quizzes with Strict Gating + Final Exam

### Structure

- **29 chapters** across 4 units (Unit 1: 5 chapters, Units 2-4: 8 chapters each)
- Each chapter gets a **10-question bank** — system randomly picks 5 per attempt
- **80% pass mark** (4/5 correct) to unlock the next chapter
- Failed? Retry immediately with a fresh random draw from the same 10-question pool
- **Existing unit assessments** kept as **optional revision** (relabelled, not required for progression)
- **Final 80-question exam** unlocks only when all 29 chapter quizzes are passed

### Content: 290 New Questions

| Unit | Chapters | Questions |
|------|----------|-----------|
| 1 — Understanding the Body | 5 | 50 |
| 2 — Principles of Nutrition | 8 | 80 |
| 3 — Introduction to Exercise | 8 | 80 |
| 4 — Building Your Foundation | 8 | 80 |
| **Total** | **29** | **290** |

Each question follows the existing `AssessmentQuestion` type (multiple choice or scenario-based, 4 options, explanation). All written in personal learner voice ("you/your").

### Database

New table: `university_chapter_quizzes`
- `id`, `user_id`, `level`, `unit_number`, `chapter_number`, `score`, `total`, `passed`, `answers` (jsonb), `attempted_at`
- RLS: users can insert/select their own rows

### Type Changes

**`src/lib/university/types.ts`** — add `ChapterQuiz` interface:
```
interface ChapterQuiz {
  unitNumber: number;
  chapterNumber: number;
  questionBank: AssessmentQuestion[]; // 10 questions
  pickCount: number; // 5
  passMarkPercent: number; // 80
}
```

Add `chapterQuizzes: ChapterQuiz[]` to `Level` interface.

### New Data Files (4 files)

- `src/lib/university/level2/unit1-chapter-quizzes.ts` — 50 questions
- `src/lib/university/level2/unit2-chapter-quizzes.ts` — 80 questions
- `src/lib/university/level2/unit3-chapter-quizzes.ts` — 80 questions
- `src/lib/university/level2/unit4-chapter-quizzes.ts` — 80 questions

### UI Changes

**`src/pages/UniversityChapter.tsx`**
- After "Mark as Complete", if chapter quiz exists and not yet passed, navigate to quiz instead of next chapter
- "Next Chapter" button locked with lock icon if quiz not passed
- Add quiz status indicator on the chapter page

**`src/components/university/ChapterQuizView.tsx`** (new component)
- Reuses `AssessmentQuiz` in mini-quiz mode (5 questions, compact layout)
- Shows "Retry with new questions" button on failure (re-randomises from bank)
- On pass: auto-navigates to next chapter or back to unit view

**`src/pages/UniversityChapterQuiz.tsx`** (new page)
- Route: `/university/level-:level/unit-:unit/chapter-:chapter/quiz`
- Pulls 5 random questions from the chapter's 10-question bank
- Submits results to `university_chapter_quizzes` table

**`src/pages/UniversityLevel.tsx`**
- Chapter list: show lock icon on chapters where previous chapter quiz not passed
- Disable navigation to locked chapters
- Unit assessment relabelled to "Optional Revision"
- Final exam button: only enabled when all 29 chapter quizzes passed

**`src/hooks/useUniversityProgress.tsx`**
- Add `chapterQuizzes` query from new table
- Add `hasPassedChapterQuiz(level, unit, chapter)` helper
- Add `submitChapterQuiz` mutation

**`src/lib/university/courseStructure.ts`**
- Import and wire all 4 chapter quiz files
- Add `getChapterQuiz(level, unit, chapter)` helper
- Add quiz data to level structure

**`src/App.tsx`**
- Add route for `/university/level-:level/unit-:unit/chapter-:chapter/quiz`

### Gating Logic

```text
Chapter 1 → read freely → complete → take quiz → pass (4/5) → Chapter 2 unlocks
Chapter 2 → read freely → complete → take quiz → pass → Chapter 3 unlocks
...
All 29 quizzes passed → Final Exam unlocks
```

- Chapter 1 of each unit is always accessible (no prior quiz needed)
- Unit boundaries: Unit 2 Ch1 unlocks after Unit 1's final chapter quiz is passed

### Execution Order

1. Database migration (new table + RLS)
2. Type updates
3. Quiz data files (unit by unit — largest deliverable)
4. Hook updates
5. New quiz page + component
6. Chapter page gating logic
7. Level page UI updates
8. Route registration

### Delivery

This is a large content task (290 questions). I will deliver unit by unit, ensuring quality and consistency before moving to the next.

