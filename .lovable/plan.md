
# AI Programme Builder: Exercise Library Integration, Editor Fix, and Programme Card Polish

## Overview
Three issues to fix:

1. **AI chat programme builder uses generic exercise data** instead of the existing EXERCISE_LIBRARY (with IDs, body parts, equipment, defaults, tips, alternatives, movement patterns). The generated programme JSON needs exercises linked to library IDs so the full coaching data (from exerciseCoachingData.ts) works when users execute sessions.

2. **EDIT PLAN button in chat only shows yes/no prompts** about the programme title -- it doesn't let users actually edit exercises or programme content. The AIPlanReviewModal needs a proper inline editor.

3. **Programme title and description in PlanDisplayCard need better spacing/layout** and the Scouse coaching tone should come through in the overview text.

---

## Changes

### 1. Exercise Library Integration in generate-ai-programme

**File: `supabase/functions/generate-ai-programme/index.ts`**

The current `EXERCISE_NAMES` constant is a flat string of names. The AI returns exercise names like "Back Squat" but these aren't linked to library IDs (like `back-squat`), which means the generated programme can't connect to coaching data, body part metadata, or alternatives.

**Fix:**
- Update the EXERCISE_NAMES constant to include the library ID alongside each name, formatted as `id:Name`. Example: `back-squat:Back Squat,front-squat:Front Squat,...`
- Update the system prompt to instruct the AI to return exercises with an `id` field matching the library ID, plus `bodyPart` and `equipment` fields
- Update the JSON schema in the prompt so each exercise includes: `{"id":"back-squat","name":"Back Squat","bodyPart":"legs","equipment":"barbell","sets":4,"reps":"6-8","intensity":"RPE 7","rest":"3 min","notes":"..."}`

**Post-processing step (in the edge function):**
After receiving the AI response, add a validation step that:
- Checks each exercise name against the library
- If an exercise has no `id` or a wrong one, attempts fuzzy matching against the known list
- Logs warnings for any exercises that couldn't be matched

This ensures the generated programme data is fully compatible with the existing `ActiveWorkoutModal`, `SessionLoggingView`, and `ExerciseCoachingPanel` which all look up exercises by name or ID.

### 2. Fix the EDIT PLAN Modal (AIPlanReviewModal)

**File: `src/components/ai/AIPlanReviewModal.tsx`**

Current problem: The "review" step shows the programme title and a collapsed schedule, but the "edit" step only shows generic yes/no prompts like "Would you like to swap any exercises?" with no actual way to do so.

**Fix -- replace the guided prompts with an inline editor:**

In the `review` step:
- Show each workout day expanded with its exercises listed
- Each exercise row gets an "X" button to remove it and a "swap" button that opens the existing `ScrollableExerciseLibrary` inline
- Programme name and overview become editable text fields
- Phase names and notes become editable

In the `edit` step (when user clicks MAKE ADJUSTMENTS):
- Enable editing mode on the same view (inline text inputs, swap buttons active)
- Add an "Add Exercise" button per day that opens the exercise library picker
- Selected exercises from the library automatically populate with the correct ID, body part, equipment, default sets/reps

Remove the generic yes/no prompt flow entirely -- it doesn't provide real editing capability.

### 3. Programme Card Layout and Tone

**File: `src/components/coaching/PlanDisplayCard.tsx`**

Current issues:
- Title and overview are cramped (title truncated, overview line-clamped to 2 lines)
- No coaching personality in the presentation

**Fix:**
- Give the programme name more breathing room: increase text size to `text-lg`, remove `truncate`, allow wrapping
- Give the overview more space: increase from `line-clamp-2` to `line-clamp-4`, add `mt-2` spacing
- Add a subtle coaching tagline below the "YOUR PROGRAMME IS READY" header, e.g. "Built for you. Stay patient with it." in muted text
- Improve the summary stats layout with slightly more padding

**File: `supabase/functions/generate-ai-programme/index.ts`**

Update the system prompt's tone instructions to tell the AI to write the `programName` and `overview` fields with the established Scouse coaching tone:
- Programme names should be direct and purposeful (e.g. "12-Week Strength Foundation" not "Your Custom Strength Programme")
- Overview should read like a coach talking to their athlete: "Right, here's the plan. We're building a solid foundation over 12 weeks..." -- measured, grounded, no hype

---

## Technical Details

### Files to modify:

1. **`supabase/functions/generate-ai-programme/index.ts`**
   - Expand EXERCISE_NAMES to include library IDs and body parts
   - Update JSON schema in system prompt to require `id`, `bodyPart`, `equipment` per exercise
   - Add post-parse validation that fuzzy-matches exercise names to library IDs
   - Update tone instructions for programName and overview fields

2. **`src/components/ai/AIPlanReviewModal.tsx`**
   - Replace generic yes/no prompt flow with inline exercise editor
   - Import and integrate `ScrollableExerciseLibrary` for exercise swapping
   - Make programme name, overview, and exercise details editable inline
   - Keep the 3-step flow (review -> edit -> confirm) but make edit actually functional

3. **`src/components/coaching/PlanDisplayCard.tsx`**
   - Improve title/overview spacing and sizing
   - Add coaching tone tagline
   - Better visual hierarchy

4. **`src/lib/programTypes.ts`**
   - Add optional `id` and `bodyPart` fields to the `Exercise` interface so the type system supports the enriched data

### No database changes required
All changes are to the edge function prompt, client-side UI, and type definitions.
