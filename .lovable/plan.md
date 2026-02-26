

# Profile Tracker System Overhaul

## Overview
Upgrade the profile's tracking system: add PR reset capability, clean up the overview tab, ensure all 5 cardio types are tracked in PRs and stats, and build the best possible consistency tracker for workouts.

---

## 1. Reset/Save Personal Records

**File: `src/components/tracker/CombinedRecordsView.tsx`**

Add a reset button per individual PR record and a "Reset All" option per activity type:
- Each PR card gets a small trash/reset icon button
- Clicking shows a confirmation dialog ("Reset your 5K PR?")
- On confirm, deletes the record from `personal_records` table
- Add a "Reset All [ACTIVITY] PRs" button at the bottom of each cardio sub-tab

**File: `src/hooks/usePersonalRecords.tsx`**

Add two new functions:
- `resetPR(recordId: string)` -- deletes a single PR from the database
- `resetAllPRsForActivity(activityType: string)` -- deletes all PRs matching the activity type

Need a database migration to add DELETE policy for `personal_records` (currently missing -- users can INSERT and UPDATE but not DELETE).

**Database migration:**
```sql
CREATE POLICY "Users can delete their own records"
ON public.personal_records FOR DELETE
USING (auth.uid() = user_id);
```

---

## 2. Clean Up Overview Tab

**File: `src/components/tracker/ProfileView.tsx`**

Remove from the overview tab:
- The "RECENT ACTIVITY" card (lines 500-539) -- the session list showing recent runs
- Keep the 3 quick stat cards (Sessions, km, Time) at the top
- Keep "MY PROGRAMMES" section

This makes the overview tab a clean summary: identity + quick stats + programmes only.

---

## 3. Cardio PRs: All 5 Activity Types

**File: `src/components/tracker/CombinedRecordsView.tsx`**

Currently the cardio sub-selector only shows Walk, Run, Cycle (line 187). Update to include all 5 types: Walk, Run, Cycle, Row, Swim.

Change:
```typescript
{(['walk', 'run', 'cycle'] as CardioActivityType[]).map(type => {
```
To:
```typescript
{(Object.keys(CARDIO_ACTIVITY_CONFIG) as CardioActivityType[]).map(type => {
```

This uses the already-defined `CARDIO_ACTIVITY_CONFIG` which includes all 5 types.

---

## 4. Stats Tab: Cardio Linked to Session Records

**File: `src/components/tracker/CombinedStatsView.tsx`**

The cardio stats sub-selector already shows all 5 types (line 267). Stats are already computed per activity type from runs data. This is working correctly.

Enhancement: Add a "View Records" link button at the bottom of each cardio stats view that switches to the Records tab's cardio section with the same activity type pre-selected. This requires lifting the tab state or using a callback.

**Implementation:** Add an optional `onViewRecords` prop to `CombinedStatsView` that triggers a tab switch in the parent `ProfileView`.

---

## 5. Workout Stats: Programme Consistency Tracker

**File: `src/components/tracker/CombinedStatsView.tsx`**

Rework the Workouts tab to focus on programme consistency rather than raw volume:

Remove:
- "Sets Completed" stat card

Replace with:
- **Programme Adherence %** -- sessions completed vs sessions planned (based on active programme's days_per_week)
- **Current Streak** (already exists, keep it)
- **Total Workouts** (keep)
- **Total Time** (keep)
- **Avg Duration** (keep)
- **Weekly Attendance** chart (already exists, keep it)
- **Programme Progress** -- a progress bar showing current_week out of total weeks for the active programme

---

## 6. PR Tab Linked to Trackers

Ensure the Records tab properly links to data sources:
- **Cardio PRs** already pull from `personal_records` table which is populated by the cardio tracker (`usePersonalRecords.checkAndUpdatePRs`). This works for all activity types since `activity_type` is stored on each record.
- **Strength PRs** already pull from `exercise_logs` via `workout_sessions`. This is working.
- No changes needed here beyond the 5-type fix in point 3.

---

## Files to Modify

1. `src/hooks/usePersonalRecords.tsx` -- Add `resetPR` and `resetAllPRsForActivity` functions
2. `src/components/tracker/CombinedRecordsView.tsx` -- Add reset buttons with confirmation, expand cardio selector to all 5 types
3. `src/components/tracker/ProfileView.tsx` -- Remove recent activity section from overview tab, add cross-tab navigation support
4. `src/components/tracker/CombinedStatsView.tsx` -- Remove total sets, add programme adherence %, add programme progress bar, add "View Records" link

## Database Migration

Add DELETE policy for `personal_records` table so users can reset their PRs.

