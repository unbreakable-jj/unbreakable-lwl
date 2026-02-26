
# Unbreakable Coach: Full Data Access + Conversational Programme Building

## Overview
Two major upgrades to the coaching chat:

1. **Full Data Access** -- The coach gains the ability to view, discuss, and appraise all user content: full programme details (exercises, sets, reps, weights per day per week), session logs (every set logged), nutrition logs, meal plans, and progression history.

2. **Conversational Building Flow** -- Instead of auto-generating a programme or meal plan on the first prompt, the coach asks 4-6 targeted questions to gather requirements before building. Only once it has enough information does it trigger the generation.

---

## Part 1: Enriched Coach Context (Full Data Access)

### What changes

**File: `src/hooks/useCoachContext.tsx`**

Expand `gatherContext()` to fetch and include:

- **Full programme details** -- Query `training_programs` and include the full `program_data` JSON (exercise names, sets, reps, intensity, rest, per day). Limited to 3 most recent programmes.
- **Session logs with granular data** -- Query `exercise_logs` joined with `workout_sessions` for the last 14 days (up from 7). Include per-set data: `weight_kg`, `actual_reps`, `rpe`, `confidence_rating`, `pain_flag`.
- **Meal plans** -- Query `meal_plans` + `meal_plan_items` for active plans. Include day, meal type, food name, calories, macros.
- **Progression history** -- Query `progression_history` for recent adjustments (last 30 days). Include exercise name, old/new weight, old/new reps, adjustment reason.
- **Personal records** -- Query `personal_records` for the Big 5 + bodyweight maxes.

Expand `formatContextForAI()` to serialize this data into the context string sent to the edge function, structured under clear headings like `PROGRAMME DETAILS`, `SESSION LOGS`, `ACTIVE MEAL PLANS`, `PROGRESSION HISTORY`, `PERSONAL RECORDS`.

**File: `supabase/functions/help-chat/index.ts`**

Update the system prompt to instruct the coach that it has full access to user programmes, logs, meal plans, and progression data, and should reference specific data points when the user asks about their training.

---

## Part 2: Conversational Programme/Meal Plan Building

### Current problem
When a user says "build me a programme", the system immediately calls `generateProgramme()` which hits the `generate-ai-programme` edge function and auto-builds. No questions asked.

### New flow

**File: `src/pages/Help.tsx`**

Remove the automatic `detectProgrammeRequest` / `detectMealPlanRequest` interception from `handleSubmit`. Instead, let the message go through to the normal chat flow so the coach can respond conversationally.

**File: `supabase/functions/help-chat/index.ts`**

Add a new section to the system prompt instructing the coach on the conversational intake flow:

```
PROGRAMME/MEAL PLAN BUILDING PROTOCOL:
When a user requests a programme or meal plan, DO NOT generate one immediately.
Instead, conduct a structured intake of 4-6 questions:

For programmes:
1. Training goal (strength, hypertrophy, fat loss, athletic performance)
2. Available equipment and training environment
3. Schedule (days per week, session length, any fixed days)
4. Experience level and current lifts (if not in profile)
5. Injuries or limitations (if not in profile)
6. Any specific preferences (exercises they enjoy/dislike, split preference)

For meal plans:
1. Nutrition goal (fat loss, muscle gain, maintenance, performance)
2. Dietary restrictions or preferences
3. Meals per day and cooking ability
4. Budget considerations
5. Foods they enjoy or dislike

Review the user's profile data first. Skip questions where you already have the answer from their profile. Confirm what you know, then ask only what's missing.

Once you have enough information, respond with a summary of the plan you'll build and ask "Ready for me to build this?" 

When the user confirms, include the tag [BUILD_PROGRAMME] or [BUILD_MEAL_PLAN] at the very end of your response (hidden from the user), along with a JSON summary of gathered requirements.
```

**File: `src/pages/Help.tsx` (streaming response handling)**

After the coach's streamed response completes, scan the final assistant message for the `[BUILD_PROGRAMME]` or `[BUILD_MEAL_PLAN]` tag. If found:
- Strip the tag from the displayed message
- Extract the requirements JSON
- Trigger `generateProgramme()` or `generateMealPlan()` with the gathered context
- Show the existing generation UI (progress indicator, then plan display card)

This keeps the conversational flow natural while still using the existing programme/meal plan generation infrastructure.

---

## Part 3: Quick Action Tile Updates

**File: `src/pages/Help.tsx`**

Update the POWER and FUEL quick action prompts to be conversation starters rather than direct build triggers:
- POWER: "I'd like to build a new training programme" (instead of "Build me a bespoke training programme based on my profile")
- FUEL: "I'd like to create a nutrition plan" (instead of "Create a meal plan for my current calorie and macro goals")

---

## Technical Details

### Files to modify:
1. `src/hooks/useCoachContext.tsx` -- Expand data fetching and formatting
2. `supabase/functions/help-chat/index.ts` -- Update system prompt with full data access instructions and conversational building protocol
3. `src/pages/Help.tsx` -- Remove auto-detect interception, add post-stream tag detection, update quick action prompts

### No database changes required
All data is already stored in existing tables. We're just querying more of it.

### Token management
The expanded context will be larger. To manage this:
- Programme data will be summarized (exercise names + sets/reps only, no full coaching cues)
- Session logs limited to last 14 days, max 10 sessions
- Meal plans limited to active plans only
- Progression history limited to last 30 days
