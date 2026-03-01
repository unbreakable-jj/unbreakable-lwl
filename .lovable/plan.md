

# Coach/Dev AI Chat & Auto-Builder: Client-Aware Programming

## Overview

This plan enables Coaches and Devs to use the AI chat (Ask Coach) to build programmes, meal plans, and mindset plans **for their clients** -- with the client's profile data auto-filled and all generated plans saved directly to the client's account. It also makes the AI chat role-aware so it recognises coaches/devs on conversation start and offers them the choice of building for themselves or for a client.

---

## Current State

- The `?for={userId}` pattern already works in manual builders (`/programming/create`, `/tracker/create`, `/fuel/planning`, `/mindset`) -- saving plans to the athlete's account via RLS coach policies.
- The AI chat (`Help.tsx` / `useHelpChat`) always gathers the **logged-in user's** own context via `useCoachContext` and saves generated plans to the logged-in user's account.
- The AI chat system prompt has no awareness of whether the user is a coach/dev or a standard user.

## What Changes

### 1. Add `gatherContextForUser(userId)` to `useCoachContext`

Currently `gatherContext()` only fetches data for `auth.uid()`. We add a new function that accepts an arbitrary `userId` and fetches that user's profile, coaching profile, workout sessions, exercise logs, food logs, training programs, meal plans, progression history, and personal records using the service-role-level access coaches already have via RLS policies.

This function will be used when a coach/dev initiates a build for a specific client.

### 2. Make the AI Chat Role-Aware

**`useHelpChat.tsx`** changes:
- Accept a new optional `targetAthleteId` parameter in `sendMessage()`.
- When `targetAthleteId` is provided, call `gatherContextForUser(targetAthleteId)` instead of `gatherContext()` to populate the AI context with the **athlete's** data.
- Pass a `coachMode` flag and the target athlete's name to the edge function so the system prompt can be augmented.

**`help-chat/index.ts`** changes:
- Accept new optional fields in the request body: `coachMode: boolean`, `targetAthleteName: string`, `callerRole: 'dev' | 'coach' | 'user'`.
- When `coachMode` is true, prepend a role-awareness block to the system prompt:
  - "You are speaking with a Coach/Dev. They may be building plans for a client named {athleteName}. All programme/meal plan builds should be tailored to that client's data provided below."
- When `callerRole` is `dev` or `coach` and no `targetAthleteId` is set, the AI should ask on first message: "Are you building something for yourself or for one of your athletes?"

### 3. @mention Client Selection in Chat

**`Help.tsx`** changes:
- Add a `targetAthleteId` state variable.
- Detect `@username` patterns in user input. When detected:
  - Look up the username in the `profiles` table.
  - If found and the logged-in user is a coach/dev, set `targetAthleteId` to that user's ID.
  - Show the `BuildingForBanner` component at the top of the chat.
- Pass `targetAthleteId` through to `sendMessage()`.
- When saving generated plans (programme, meal plan, mindset), use `forUserId: targetAthleteId` so plans save to the athlete's account.

### 4. Auto-Fill Client Data on Build Start

When the chat triggers `[BUILD_PROGRAMME]`, `[BUILD_MEAL_PLAN]`, or `[BUILD_MINDSET_PROGRAMME]` and a `targetAthleteId` is set:
- `generateProgramme()` receives the athlete's context (gathered from their profile) as `additionalContext`.
- The `generate-ai-programme` edge function already accepts `userContext` with profile data -- we populate it with the athlete's data instead of the coach's.
- The `userId` field in `userContext` is set to the athlete's ID so the edge function references the correct person.

### 5. Save Plans to Athlete's Account

When `targetAthleteId` is set:
- `handleSavePlanToLibrary()` in `Help.tsx` passes `forUserId: targetAthleteId` to `saveProgram.mutateAsync()`, `saveMindsetProgramme.mutateAsync()`, and meal plan inserts.
- This already works because RLS policies grant coaches INSERT/UPDATE on their athletes' plans.

---

## Technical Details

### Files Modified

| File | Change |
|------|--------|
| `src/hooks/useCoachContext.tsx` | Add `gatherContextForUser(userId: string)` that fetches another user's data (profiles, coaching_profiles, workout_sessions, etc.) |
| `src/hooks/useHelpChat.tsx` | Accept `targetAthleteId` in `sendMessage()`, pass `coachMode`/`callerRole`/`targetAthleteName` to edge function, use athlete context when target is set |
| `src/hooks/useAIProgramme.tsx` | Accept optional `targetUserId` to set `userContext.userId` to the athlete's ID |
| `supabase/functions/help-chat/index.ts` | Handle `coachMode`, `callerRole`, `targetAthleteName` fields; augment system prompt with coach/dev role awareness |
| `src/pages/Help.tsx` | Add `targetAthleteId` state, @mention detection, `BuildingForBanner` display, pass `forUserId` to all plan save functions, fetch user role |
| `src/hooks/useUserRole.tsx` | No changes needed (already provides `isDev`/`isCoach`) |

### @mention Detection Logic

```text
1. User types "@john" in chat input
2. On submit, regex extracts @mentions: /@(\w+)/
3. Look up username in profiles table
4. If match found AND caller is coach/dev:
   - Set targetAthleteId = matched user's user_id
   - Show BuildingForBanner
   - Strip @mention from the message sent to AI
   - Add "[BUILDING FOR: {displayName}]" prefix to AI context
5. If no match or caller is regular user: ignore @mention
```

### Coach Role Detection in System Prompt

When `callerRole` is `dev` or `coach`, the system prompt gains:

```text
ROLE AWARENESS: You are speaking with a {Dev/Coach}. They have authority to build 
and manage plans for their athletes. If they reference a specific athlete or use 
@mention, all plans should be built using that athlete's data and saved to that 
athlete's account. If no athlete is specified, ask whether they're building for 
themselves or for a client.
```

### Security Considerations

- Coach RLS policies already permit coaches to read athlete profiles, coaching profiles, workout sessions, and progression history. The `gatherContextForUser()` function uses the authenticated client (not service role), so RLS naturally enforces access.
- The `targetAthleteId` is validated server-side: the `is_coach_of()` check ensures only assigned coaches can save to athlete accounts.
- @mention lookup only returns public profile data (username, display_name, user_id).

