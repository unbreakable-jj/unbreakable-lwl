
# Full Multi-Type Plan Building for Coaches & Devs

## Problem
Currently, the BUILD PLAN dropdown in `AthleteDataViewer` links to `/programming/create?for=`, `/tracker/create?for=`, and `/fuel/planning?for=` -- but **none of these pages actually read the `?for=` parameter**. They all hardcode `user.id` when saving. Additionally:
- Mindset programmes are missing from the BUILD PLAN dropdown
- Coaches cannot build plans for themselves from the coaching hub
- `mindset_programmes` table lacks INSERT/UPDATE RLS for coaches
- No user-search-based plan delivery exists

## Changes

### 1. Database: Add Coach RLS for Mindset Programmes

Add INSERT and UPDATE policies on `mindset_programmes` so coaches can create and edit mindset plans for their assigned athletes.

```
INSERT: WITH CHECK (is_coach_of(auth.uid(), user_id))
UPDATE: USING (is_coach_of(auth.uid(), user_id))
```

### 2. Save Hooks: Accept Optional `forUserId`

Modify four hooks to accept an optional `forUserId` parameter that overrides `user.id` when saving:

- **`useTrainingPrograms.tsx`** -- `saveProgram` mutation accepts optional `forUserId`
- **`useCardioPrograms.tsx`** -- `saveProgram` mutation accepts optional `forUserId`  
- **`useMealPlans.tsx`** -- `createMealPlan` mutation accepts optional `forUserId`
- **`useMindsetProgrammes.tsx`** -- `saveProgramme` mutation accepts optional `forUserId`

Each will use `forUserId || user.id` as the `user_id` in the INSERT. RLS already permits this for coaches via the `is_coach_of` policies.

### 3. Builder Pages: Read `?for=` Query Parameter

Modify three existing builder pages to detect `?for={userId}` from the URL and pass it through to the save hooks:

- **`ProgrammingCreate.tsx`** -- Read `searchParams.get('for')`, show a banner "Building for [athlete name]", pass `forUserId` to `saveProgram`
- **`TrackerCreate.tsx`** -- Same pattern for cardio programmes
- **`FuelPlanning.tsx`** -- Same pattern for meal plans

Additionally, create awareness in the Mindset builder page if one exists, or add a note that Mindset programmes use the same pattern.

### 4. AthleteDataViewer: Add Mindset to BUILD PLAN Dropdown

Add a fourth option to the BUILD PLAN dropdown:
- **Mindset Programme** -- navigates to `/mindset?for={athleteId}` (or the appropriate mindset builder route)

Also add EDIT buttons on cardio programmes and meal plans (currently only training programmes have EDIT), by fetching those from the database alongside `training_programs`.

### 5. Coach Hub: "Build for Myself" Action

Add a "BUILD MY OWN" section or button in the Coach Dashboard that navigates to the builders **without** a `?for=` param (i.e. saves to the coach's own account). This can be a simple action card at the top of the Athletes tab or a dedicated section.

### 6. Coach Hub: Search + Deliver Plan to Any Assigned Athlete

Add a "BUILD PLAN FOR..." flow accessible from the Coach Dashboard:
- Reuse the existing `ClientSearchPanel` user search but filter to only show **assigned athletes**
- Selecting an athlete opens the BUILD PLAN dropdown (same as in AthleteDataViewer)
- This lets coaches quickly navigate to a builder for any client without first going into the full AthleteDataViewer

### 7. "Building For" Banner Component

Create a small reusable `BuildingForBanner` component that:
- Fetches the target athlete's profile (display name, avatar) from the `?for=` param
- Displays "Building for [Name]" at the top of the builder page
- Shows a "Cancel" button to clear the param and build for yourself instead

---

## Files Summary

**Database migration:**
- Add INSERT + UPDATE RLS on `mindset_programmes` for coaches

**New file:**
- `src/components/coaching/BuildingForBanner.tsx` -- reusable "Building for [athlete]" banner

**Modified files:**
- `src/hooks/useTrainingPrograms.tsx` -- `forUserId` param on `saveProgram`
- `src/hooks/useCardioPrograms.tsx` -- `forUserId` param on `saveProgram`
- `src/hooks/useMealPlans.tsx` -- `forUserId` param on `createMealPlan`
- `src/hooks/useMindsetProgrammes.tsx` -- `forUserId` param on `saveProgramme`
- `src/pages/ProgrammingCreate.tsx` -- read `?for=`, show banner, pass to save
- `src/pages/TrackerCreate.tsx` -- read `?for=`, show banner, pass to save
- `src/pages/FuelPlanning.tsx` -- read `?for=`, show banner, pass to save
- `src/components/coaching/AthleteDataViewer.tsx` -- add Mindset to BUILD PLAN dropdown, fetch cardio/meal plans for EDIT buttons
- `src/pages/CoachDashboard.tsx` -- add "Build My Own" quick actions and "Build Plan For..." search flow
