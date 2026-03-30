

## Plan: Session Notes Media Upload + Fix Programme Progress Tracking

### Two tasks:

---

### Task 1: Add photo/video upload to Session Notes

**Problem**: Session notes only support text. Users want to upload photos/videos (e.g., form checks) that coaches can see.

**Changes**:

**File: `src/components/programming/SessionNotesView.tsx`**
- Add media upload UI below the textarea — reuse the existing `ChatMediaUpload` pattern or build a simple file picker
- Allow up to 3 images or 1 video per session note
- Upload files to `post-images` / `post-videos` storage buckets using `uploadMediaFile` from `src/lib/mediaUpload.ts`
- Store media URLs in the `onSave` callback alongside notes text
- Display uploaded media previews with remove buttons

**File: `src/components/programming/ActiveWorkoutModal.tsx`**
- Pass media URLs through from SessionNotesView to the completion handler

**File: `src/hooks/useWorkoutSessions.tsx`**
- Update `completeSession` mutation to save media URLs (likely as a JSON field on `workout_sessions` or session notes)

**Database migration**: Add `media_urls jsonb default '[]'` column to `workout_sessions` table to store attached media.

**File: `src/components/coaching/AthleteDataViewer.tsx`**
- Add a new "Session Media" section in the coach's session log viewer that displays any attached photos/videos from workout sessions
- Render images as thumbnails and videos with a player

---

### Task 2: Fix programme current_week/current_day not syncing with progress

**Problem**: `training_programs.current_week` and `current_day` never update because `updateProgress` is never called. The badge always shows "Week 1 • Day 1".

**Root cause**: In `ProgrammeExecutionView.tsx`, when `handleCompleteWorkout` runs, it calls `markComplete` on the planner and `completeSession` on the workout, but never calls `updateProgress` to sync `current_week`/`current_day` on the program record.

**Fix in `src/components/programming/ProgrammeExecutionView.tsx`**:
- Import `useTrainingPrograms` to access `updateProgress`
- After `markComplete.mutate(currentPlanner.id)` in `handleCompleteWorkout`, call `updateProgress.mutate()` with the **next pending session's** week/day numbers
- Similarly after `handleSkipSession`, update progress to reflect the new next session
- Derive the "current position" from the next pending planner rather than the stale `program.current_week`/`program.current_day` for the header badge display

**Also fix in `handleCardioSessionSaved`**: Same pattern — after marking complete, update progress.

**Display fix**: The badge in the header should show the next pending session's week/day (computed from planners) rather than the potentially stale `program.current_week`. This ensures the UI always reflects actual progress even if the DB update is in flight.

---

### Technical details

- Media upload reuses existing `uploadMediaFile()` and storage buckets — no new buckets needed
- The `media_urls` column stores an array of `{ url, type, thumbnailUrl? }` objects
- Progress sync is a simple `updateProgress.mutate({ programId, week: nextPlanner.week_number, day: nextPlanner.day_number })` call added to 3 handlers

