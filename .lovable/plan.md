

## Plan: Three Feature Removals/Fixes

### 1. Remove Shopping List

**What changes:**
- `src/pages/FuelPlanning.tsx` -- Remove the Shopping List tab entirely. The page becomes a single Meal Planner view (no Tabs wrapper needed). Remove the `ShoppingList` import and `ShoppingCart` icon import.
- `src/components/fuel/MealPlanExecutionView.tsx` -- Remove the `<ShoppingList planItems={allItems} />` rendering and its import.
- `src/components/fuel/ShoppingList.tsx` -- Delete the entire file.

Barcode scanning and Store Cupboard remain untouched.

---

### 2. Fix ExerciseSwapSheet Scroll + Add Exercise to Live Session

**Scroll Fix:**
The `ExerciseSwapSheet` uses a Radix `ScrollArea` inside a bottom `Sheet`. The issue is that `ScrollArea` with `max-h-[50vh]` inside a flex column within the sheet content doesn't properly allow touch scrolling on mobile. 

Fix in `src/components/programming/ExerciseSwapSheet.tsx`:
- Replace the `ScrollArea` with a plain `div` using `overflow-y-auto` and a fixed `max-h-[50vh]`. This gives native scroll behavior which works reliably on mobile touch devices.
- Add `overscrollBehavior: 'contain'` to prevent the sheet from intercepting scroll events.

**Add Exercise to Live Session:**

In `src/components/programming/ActiveWorkoutModal.tsx`:
- Add an "ADD EXERCISE" button to the session view.
- When tapped, open a new bottom sheet (`AddExerciseSheet`) with two options:
  1. **Library picker** -- reuse the `InlineExerciseLibrary` component to browse/search 230+ movements.
  2. **Quick custom entry** -- a simple form with exercise name, sets count, and target reps.
- On selection/submission, call a new `onAddExercise` callback prop.

In `src/hooks/useWorkoutSessions.tsx`:
- Add an `addExerciseToSession` mutation that inserts new `exercise_logs` rows into the active session with the next available set numbers.

In `src/components/programming/ProgrammeExecutionView.tsx`:
- Wire up the new `onAddExercise` prop when rendering `ActiveWorkoutModal`.

New file: `src/components/programming/AddExerciseSheet.tsx` -- bottom sheet with library picker tab and quick-add tab.

---

### 3. Remove Coach "Build for Athlete" Features

**What changes:**

- `src/pages/CoachDashboard.tsx` -- Remove the "BUILD FOR ATHLETE" dropdown button and the `buildPlanOptions` array. Remove the "Build [plan type]" menu items from athlete action dropdowns. Keep: athlete list, view data, message, assign/deactivate.
- `src/pages/ProgrammingCreate.tsx` -- Remove `forUserId` logic and `BuildingForBanner` usage. The `?for=` query param is no longer read.
- `src/pages/TrackerCreate.tsx` -- Same removal of `forUserId` and `BuildingForBanner`.
- `src/pages/FuelPlanning.tsx` -- Remove `forUserId` and `BuildingForBanner` (already simplified by shopping list removal).
- `src/pages/Help.tsx` -- Remove all `targetAthleteId`/`targetAthleteName` state, the `@mention` detection logic, the `BuildingForBanner` in chat, and the "Stop building for athlete" button. Plans generated in chat always save to the current user's own account. Remove the `forUserId` param from `saveProgram` and meal plan save calls.
- `src/components/coaching/BuildingForBanner.tsx` -- Delete the entire file (no longer used anywhere).

**What is preserved:**
- Coach assignment system (assign/deactivate athletes)
- `AthleteDataViewer` (view athlete info, programmes, logs)
- Coach feedback forms
- Direct messaging between coach and athlete
- All RLS policies for coach viewing athlete data remain in the database

---

### Technical Summary

| Area | Files Modified | Files Deleted | Files Created |
|------|---------------|--------------|---------------|
| Shopping List | 2 | 1 | 0 |
| Swap Scroll + Add Exercise | 3-4 | 0 | 1 |
| Coach Build Removal | 5 | 1 | 0 |

