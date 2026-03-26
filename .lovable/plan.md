

## Plan: Build Unbreakable University Course System (In-App)

This is a large feature. The plan covers the full architecture and content delivery system, with the course content built incrementally — starting with Level 2, Unit 1, Chapter 1 as confirmed before continuing.

---

### Architecture Overview

```text
University Landing (/university)
  └─ Level Selection (Level 2 / Level 3)
       └─ Unit List (/university/level-2)
            └─ Chapter View (/university/level-2/unit-1/chapter-1)
                 └─ Learning content + practical task
            └─ Unit Assessment (/university/level-2/unit-1/assessment)
       └─ Final Assessment (/university/level-2/final)
```

---

### 1. Database — Course Progress Tracking

New tables via migration:

- **`university_progress`** — tracks which chapters a user has completed  
  - `user_id`, `level` (2 or 3), `unit_number`, `chapter_number`, `completed_at`

- **`university_assessments`** — stores assessment attempts and scores  
  - `user_id`, `level`, `unit_number`, `is_final` (boolean), `score`, `total`, `answers` (jsonb), `passed` (boolean), `attempted_at`

RLS: users can only read/write their own rows.

---

### 2. Course Content — Static TypeScript Data

All course content lives in structured TS files (not the database) for instant loading and easy editing:

- `src/lib/university/courseStructure.ts` — master index of levels, units, chapters
- `src/lib/university/level2/unit1.ts` — Unit 1 chapters with full content
- `src/lib/university/level2/unit2.ts` — etc.
- `src/lib/university/level2/assessments.ts` — end-of-unit + final assessment questions
- `src/lib/university/level3/` — same structure

Each chapter object contains:
```text
{
  title, learningOutcome, assessmentCriteria[],
  content[] (sections with headings, paragraphs, bullet lists, image placeholders),
  unbreakableInsight (string),
  coachNote (string),
  practicalTask { title, instructions, reflection[] }
}
```

Each assessment contains:
```text
{
  questions[] { type: 'multiple_choice' | 'scenario',
    question, options[], correctAnswer, explanation }
}
```

---

### 3. Course Content — Full Curriculum

**Level 2 — Foundation (4 Units)**

| Unit | Title | Chapters |
|------|-------|----------|
| 1 | Understanding the Body | Basic Anatomy, Skeletal System, Muscular System, Cardiovascular System, Energy Systems |
| 2 | Principles of Nutrition | Macronutrients, Micronutrients, Hydration, Energy Balance & Calories, Reading Food Labels |
| 3 | Introduction to Exercise | Types of Training, Warm-Up & Cool-Down, Rep Ranges & Loading, Rest & Recovery, Exercise Selection |
| 4 | Building Your Foundation | Goal Setting, Programme Structure Basics, Training Frequency, Tracking Progress, Lifestyle Factors |

**Level 3 — Advanced Application (4 Units)**

| Unit | Title | Chapters |
|------|-------|----------|
| 1 | Advanced Nutrition | Macro Periodisation, Nutrient Timing, Supplements (Evidence-Based), Body Composition, Metabolic Adaptation |
| 2 | Muscle Growth Principles | Hypertrophy Science, Progressive Overload, Volume & Intensity, Deloading, Muscle Fibre Types |
| 3 | Programme Design | Periodisation Models, Exercise Order & Pairing, Auto-Regulation, Weak Point Training, Peaking & Testing |
| 4 | Behaviour & Lifestyle | Adherence Psychology, Habit Formation, Stress & Cortisol, Sleep Optimisation, Long-Term Sustainability |

Each unit ends with a 10–15 question assessment. Each level has a final case-study assessment.

---

### 4. New Pages & Components

**Pages:**
- Refactor `University.tsx` — becomes the landing/level selector with progress overview
- `src/pages/UniversityLevel.tsx` — unit list for a level, showing completion %
- `src/pages/UniversityChapter.tsx` — full chapter content viewer
- `src/pages/UniversityAssessment.tsx` — quiz interface with scoring

**Components (`src/components/university/`):**
- `CourseProgressBar.tsx` — overall and per-unit progress
- `ChapterContent.tsx` — renders learning content, insight boxes, coach notes, tasks
- `AssessmentQuiz.tsx` — question stepper with multiple choice + scenario questions
- `UnbreakableInsightBox.tsx` — branded callout box
- `CoachNoteBox.tsx` — branded guidance box
- `ImagePlaceholder.tsx` — styled placeholder for future imagery
- `LevelCard.tsx` — card for level selection on landing page
- `UnitAccordion.tsx` — expandable unit with chapter list and progress

**Routes (4 new):**
- `/university` (existing, refactored)
- `/university/:level` — unit list
- `/university/:level/:unit/:chapter` — chapter viewer
- `/university/:level/:unit/assessment` — quiz

---

### 5. Branding & Styling

- Consistent Unbreakable aesthetic: neon orange primary, dark backgrounds
- "Unbreakable Insight" boxes: orange left-border, dark bg, bold direct text
- "Coach's Note" boxes: subtle muted border, italic guidance text
- Practical Task sections: card with checklist-style instructions
- Image placeholders: dashed border boxes with description text
- All content in British English
- "Live Without Limits" and "#UNBREAKABLEUNIVERSITY" branding throughout

---

### 6. Implementation Order

Given the scale, this will be built incrementally:

1. **Database migration** — progress + assessment tables
2. **Course data files** — Level 2 Unit 1 content first (all 5 chapters + assessment)
3. **UI components** — chapter viewer, insight/coach boxes, quiz system
4. **Pages + routing** — landing refactor, level page, chapter page, assessment page
5. **Progress tracking** — mark chapters complete, calculate %, store assessment results
6. **Remaining content** — Level 2 Units 2-4, then Level 3 Units 1-4, then final assessments

Step 1-4 will be delivered together. Remaining content follows in subsequent messages.

---

### Technical Notes

- Course content as static TS keeps it fast, versionable, and editable without migrations
- Progress stored in DB so it persists across devices
- Assessment pass mark: 80% (industry standard for L2/L3)
- Users must complete all chapters in a unit before unlocking its assessment
- Users must pass all unit assessments before unlocking the final assessment
- Locked content shows but is greyed out with a lock icon

