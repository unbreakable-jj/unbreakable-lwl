

## Plan: University Admin/Dev Control Panel

### Approach

Create a client-side admin context that the existing `useUserRole` hook feeds into. When a user has `dev` or `coach` role, they get access to an admin control panel overlay on all University pages. All controls are local state — no database changes needed.

### New Files

**1. `src/hooks/useUniversityAdmin.tsx`** — React context + provider

Manages 3 boolean toggles (persisted to localStorage):
- `adminMode` — master toggle (only available to dev/coach roles)
- `unlockAll` — bypasses all progression gating
- `showAnswers` — highlights correct answers in quizzes/assessments

Derived state:
- `isStudentPreview` — when adminMode is ON but user clicks "Preview as Student", all overrides are temporarily disabled

Exposes:
- `resetProgress()` — calls delete on `university_progress`, `university_assessments`, `university_chapter_quizzes` for the current user, then invalidates queries

**2. `src/components/university/AdminControlPanel.tsx`** — Floating control bar

Compact bar pinned to top of University pages (below nav), only rendered when user has dev/coach role. Contains:
- Admin Mode toggle (Switch)
- Unlock All toggle (Switch, disabled when admin mode off)
- Show Answers toggle (Switch, disabled when admin mode off)
- Preview as Student button (toggles student preview)
- Reset Progress button (with confirmation dialog)

Styling: dark card with `border-primary/20`, consistent with existing University UI. Collapsible to a small icon when not needed.

### Files to Edit

**3. `src/hooks/useUniversityProgress.tsx`**
- Import `useUniversityAdmin` context
- Wrap gating functions (`hasPassedChapterQuiz`, `hasPassedAssessment`, `isChapterComplete`, `allChapterQuizzesPassed`) to return `true` when `unlockAll` is active
- Add `resetAllProgress()` mutation that deletes all 3 tables' rows for current user

**4. `src/pages/UniversityLevel.tsx`**
- Import admin context; skip level lock check when `unlockAll` is true
- Render `AdminControlPanel` when user has dev/coach role

**5. `src/pages/University.tsx`**
- Render `AdminControlPanel`

**6. `src/pages/UniversityChapter.tsx`**
- Skip chapter gating when `unlockAll` is true

**7. `src/pages/UniversityChapterQuiz.tsx`**
- When `showAnswers` is true, highlight correct answer option with green border after each question is answered (or all at once)

**8. `src/pages/UniversityAssessment.tsx`**
- Same `showAnswers` logic for assessment/final exam

**9. `src/App.tsx`**
- Wrap University routes in `UniversityAdminProvider`

### How Gating Override Works

```text
useUniversityProgress
  ├── hasPassedChapterQuiz(level, unit, ch)
  │     └── if (adminContext.unlockAll) return true
  │     └── else → normal DB check
  ├── hasPassedAssessment(level, unit)
  │     └── same override
  └── allChapterQuizzesPassed(...)
        └── same override
```

### Reset Progress Flow

1. User clicks "Reset Progress"
2. Confirmation dialog appears (using existing `DeleteConfirmModal`)
3. On confirm: deletes all rows from `university_progress`, `university_assessments`, and `university_chapter_quizzes` for current user
4. Invalidates all university query keys
5. Toast: "Course progress reset"

### Security

- Admin panel only renders when `useUserRole()` returns `isDev` or `isCoach`
- No new RLS policies needed — users can already delete their own rows
- Controls are purely client-side overrides; no server-side admin bypass

### Files Summary

| # | File | Action |
|---|------|--------|
| 1 | `src/hooks/useUniversityAdmin.tsx` | Create — context + provider |
| 2 | `src/components/university/AdminControlPanel.tsx` | Create — floating control bar |
| 3 | `src/hooks/useUniversityProgress.tsx` | Edit — add unlock overrides + reset |
| 4 | `src/pages/UniversityLevel.tsx` | Edit — skip lock, render panel |
| 5 | `src/pages/University.tsx` | Edit — render panel |
| 6 | `src/pages/UniversityChapter.tsx` | Edit — skip gating |
| 7 | `src/pages/UniversityChapterQuiz.tsx` | Edit — show answers |
| 8 | `src/pages/UniversityAssessment.tsx` | Edit — show answers |
| 9 | `src/App.tsx` | Edit — wrap with provider |

