

## Plan: Fix Exercise Swap Sheet + Finalise Live Session Flow

### Problems identified
1. **Swap sheet scroll broken** — `SheetContent side="bottom"` with `max-h-[75vh]` causes scroll issues on some devices; the inner `overflow-y-auto` div fights with the sheet's own scroll handling.
2. **Inconsistent configure step** — After selecting an exercise, the "configure" view pre-fills sets/reps from the old exercise. User wants blank targets instead.
3. **Z-index conflicts** — `ExerciseSwapSheet` at `z-[70]` sometimes renders behind the `DialogContent` of `ActiveWorkoutModal`.
4. **Two-step flow keeps configure step but sets/reps should be blank** — User confirmed: keep same set count, but blank target reps so they fill in manually during logging.

### Changes

**1. ExerciseSwapSheet.tsx — Simplify swap to one-step + fix scroll**
- Remove the "configure" step entirely (the `selectedExercise` state and its UI). When user taps an alternative, swap immediately: pass `sets: currentSets` (same count) and `reps: undefined` (blank targets).
- Replace the inner scroll div with proper mobile-safe scrolling: `overflow-y-auto` on a flex child with `max-h-[70vh]`, plus `touch-action: pan-y` to prevent gesture conflicts.
- Bump z-index to `z-[80]` to clear the dialog.
- Remove the `newSets`, `newReps`, `selectedExercise` state variables and the entire configure UI block (lines 143-196).
- Each suggestion card's `onClick` calls `onSwap` directly.

**2. useWorkoutSessions.tsx — Clear target reps on swap**
- When `newReps` is `undefined`, explicitly set `target_reps: null` in the update query instead of conditionally skipping it. This ensures swapped exercises show blank targets in the logging view.

**3. ActiveWorkoutModal.tsx — Clean up swap sheet rendering**
- Ensure `ExerciseSwapSheet` renders at portal level (already outside `Dialog`) — just confirm z-index bump matches.
- After swap completes, auto-expand the new exercise in the exercise list so the user sees it immediately.

**4. SessionLoggingView.tsx — Minor scroll safeguard**
- Add `touch-action: pan-y` to the main scroll container to prevent gesture conflicts on mobile when sheets are layered.

### Files to edit
- `src/components/programming/ExerciseSwapSheet.tsx` — Remove configure step, fix scroll, bump z-index, one-tap swap
- `src/hooks/useWorkoutSessions.tsx` — Set `target_reps: null` when reps undefined
- `src/components/programming/ActiveWorkoutModal.tsx` — Z-index alignment, auto-expand swapped exercise
- `src/components/programming/SessionLoggingView.tsx` — Touch-action scroll fix

