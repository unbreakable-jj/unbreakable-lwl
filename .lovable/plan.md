

# Coach/Dev Programme Management & AI Chat Refinements

## Overview

Four areas of work: (1) fix the Edit button in athlete programme view to open an inline editor instead of navigating to the auto builder, (2) refine the AI chat to number questions, always confirm before building, and give more conversational freedom, (3) add activate/deactivate/remove athlete controls to the Coach Dashboard, and (4) enforce per-category programme limits (max 2 per type, 8 total; unlimited for coaches/devs' own library).

---

## 1. Inline Programme Editor for Coach/Dev Athlete View

**Problem**: The "EDIT" button on athlete programmes in `AthleteDataViewer` navigates to `/programming/create?edit={id}&for={athleteId}`, but no page handles the `edit` query param. Clicking Edit effectively opens a blank auto builder.

**Solution**: Replace the navigation-based edit with an inline programme template editor that opens directly within `AthleteDataViewer`.

### Changes

**New component: `src/components/programming/InlineProgramEditor.tsx`**
- Receives a `TrainingProgram` object and `onSave`/`onClose` callbacks
- Renders the programme's `templateWeek.days` in an editable form
- Each exercise row becomes editable (name, sets, reps, intensity, rest, equipment) with dropdowns populated from the exercise library
- Add/remove exercise buttons per day
- Warmup, cooldown, and session type fields are editable text inputs
- "Save & Publish" button calls `updateProgram.mutateAsync()` from `useTrainingPrograms`
- Follows the existing neon/card design language

**Modified: `src/components/coaching/AthleteDataViewer.tsx`**
- Replace the `navigate(`/programming/create?edit=...`)` call with inline state: `editingProgramId`
- When set, render `InlineProgramEditor` in place of the programme list
- On save, the updated programme data is written back to `training_programs` via `useTrainingPrograms.updateProgram`
- Coach RLS policies already allow UPDATE on athlete programmes

---

## 2. AI Chat Conversation Flow Improvements

**Problem**: The coach sometimes starts auto-building mid-conversation before confirming. Questions aren't numbered. Need more natural conversational freedom with a mandatory final confirmation.

### Changes

**Modified: `supabase/functions/help-chat/index.ts`** (system prompt)
- Add to the PROGRAMME/MEAL PLAN BUILDING PROTOCOL section:
  - "Number your intake questions clearly (1, 2, 3...) so the user can reference them easily."
  - "CRITICAL: You MUST ask a final confirmation question before including ANY build tag. The exact phrasing should be: 'Happy for me to build this out?' or similar. NEVER include [BUILD_PROGRAMME], [BUILD_MEAL_PLAN], or [BUILD_MINDSET_PROGRAMME] tags unless the user has explicitly confirmed with a 'yes', 'go for it', 'build it', or similar affirmative response in their most recent message."
  - "You have FULL conversational freedom between questions. Discuss, advise, suggest alternatives, share insights. The intake is a conversation, not a form. Take detours if the user wants to discuss something. Return to the intake naturally."
- Remove any phrasing that suggests immediately outputting build tags after gathering info
- Ensure the same numbered-question and final-confirmation rules apply to all four plan types (Power, Movement, Fuel, Mindset)

---

## 3. Coach/Dev Athlete Management (Activate/Deactivate/Remove)

**Problem**: Coaches and devs cannot deactivate or remove athletes from their hub view. They should be able to end the coaching relationship (soft delete from their view) without deleting the athlete's account.

### Changes

**Modified: `src/pages/CoachDashboard.tsx`**
- Add a "Remove Athlete" option to the athlete card's dropdown menu (the existing `MoreHorizontal` dropdown)
- Add a "Deactivate" option that sets the coaching assignment status to `'ended'`
- Add an "Activate" option for ended assignments to re-enable them
- Use the existing `updateStatus(id, 'ended')` and `removeAssignment(id)` from `useCoachingAssignments`
- "Remove" triggers a confirmation dialog (using existing `DeleteConfirmModal`) explaining: "This will remove the athlete from your coaching hub. Their account and data remain intact."
- "Deactivate" sets status to `'ended'`, hiding them from the active athletes list but keeping the record
- Add a filter toggle to show/hide deactivated athletes

**Modified: `src/hooks/useCoachingAssignments.tsx`**
- `myAthletes` currently filters `status === 'active'` only -- add a new `endedAthletes` export filtering `status === 'ended'`
- No new DB changes needed; the `coaching_assignments` table already supports status values

---

## 4. Per-Category Programme Limits

**Problem**: Current limit is 2 active programmes total for Power. Need max 2 per category (Power, Movement, Mindset, Fuel) = 8 total max for users. Coaches/devs have unlimited stockpile for their own library.

### Changes

**Modified: `src/hooks/useTrainingPrograms.tsx`**
- In `startProgrammeExecution`, check active count against `MAX_ACTIVE_PROGRAMS` (2) only for strength/power programmes (already done)
- Add a role check: if user has `dev` or `coach` role and the programme's `user_id === auth.uid()` (building their own library, not for an athlete), skip the limit check entirely

**Modified: `src/hooks/useCardioPrograms.tsx`**
- Same pattern: keep max 2 active for regular users, unlimited for coach/dev's own library

**Modified: `src/hooks/useMindsetProgrammes.tsx`**
- Add activation limit check (max 2 active mindset programmes for users), unlimited for coach/dev

**Modified: `src/hooks/useMealPlans.tsx`**
- Add activation limit check (max 2 active meal plans for users), unlimited for coach/dev

Each hook will import `useUserRole` and check `isDev || isCoach` to bypass limits when the programme belongs to the coach/dev themselves (not a client's).

---

## 5. "Ask Coach" Label Consistency

**Audit and update** any remaining AI/coaching CTAs across the app to use "Ask Coach" labelling:
- `ProgrammeCTA` component's `label` prop
- Any navigation links or buttons referencing AI chat
- Quick action tiles in `Help.tsx` already say "Ask Coach" -- verify consistency across all pages

---

## Technical Summary

| File | Change |
|------|--------|
| `src/components/programming/InlineProgramEditor.tsx` | NEW -- editable programme template viewer for coaches |
| `src/components/coaching/AthleteDataViewer.tsx` | Replace navigate-to-builder with inline editor |
| `supabase/functions/help-chat/index.ts` | Numbered questions, mandatory final confirmation, more conversational freedom |
| `src/pages/CoachDashboard.tsx` | Add deactivate/remove athlete controls with confirmation |
| `src/hooks/useCoachingAssignments.tsx` | Add `endedAthletes` export |
| `src/hooks/useTrainingPrograms.tsx` | Coach/dev unlimited stockpile bypass |
| `src/hooks/useCardioPrograms.tsx` | Add role-based limit bypass |
| `src/hooks/useMindsetProgrammes.tsx` | Add activation limits (2 max for users) |
| `src/hooks/useMealPlans.tsx` | Add activation limits (2 max for users) |

No database migrations required -- all existing tables and RLS policies support these changes.

