

# Conversational Intake for All 4 Coach Tiles (POWER, FUEL, MOVEMENT, MINDSET)

## Problem
Currently only POWER and FUEL have a conversational intake protocol in the system prompt. MOVEMENT ("Give me tips to improve my squat form") and MINDSET ("Help me build a mindset routine for consistency and focus") send generic prompts with no structured questioning or build capability.

## Solution
Extend the system prompt and quick action prompts so all 4 tiles trigger a conversational intake flow where the coach reviews profile data first, asks only what's missing, confirms a plan summary, then triggers a build.

---

## Changes

### 1. Update Quick Action Prompts (`src/pages/Help.tsx`)

Replace generic prompts with conversation starters:

| Tile | Current Prompt | New Prompt |
|------|---------------|------------|
| POWER | "I'd like to build a new training programme." | "I'd like to build a new training programme." (no change) |
| MOVEMENT | "Give me tips to improve my squat form." | "I'd like to build a movement and cardio plan." |
| FUEL | "I'd like to create a nutrition plan." | "I'd like to create a nutrition plan." (no change) |
| MINDSET | "Help me build a mindset routine for consistency and focus." | "I'd like to build a mindset and recovery routine." |

Update descriptions too:
- MOVEMENT: "Build a cardio & mobility plan"
- MINDSET: "Build a mindset & recovery routine"

### 2. Expand System Prompt (`supabase/functions/help-chat/index.ts`)

Add two new intake protocols alongside the existing programme/meal plan ones:

**MOVEMENT/CARDIO PLAN PROTOCOL (4-6 questions):**
1. Movement goal (improve running pace, general cardio fitness, flexibility/mobility, sport-specific conditioning)
2. Current cardio activity and frequency (if not in profile)
3. Available equipment/space (treadmill, outdoor, pool, bike, etc.)
4. Schedule (sessions per week, duration, preferred days)
5. Any race/event goals or target distances (if not in profile)
6. Injuries or mobility limitations (if not in profile)

When ready, coach uses: `[BUILD_MOVEMENT]{"goal":"...","sessionsPerWeek":...,"activities":"...","targetEvent":"...","preferences":"..."}`

**MINDSET/RECOVERY ROUTINE PROTOCOL (4-6 questions):**
1. Primary mindset goal (consistency, focus, stress management, pre-competition mental prep, sleep improvement)
2. Current habits (meditation, journaling, breathing exercises -- what they already do)
3. Available time per day for mindset work
4. Sleep situation (hours, quality, issues -- if not in profile)
5. Stress triggers and biggest mental challenge (if not in profile)
6. Preferences (guided vs unguided, morning vs evening, app-based vs manual)

When ready, coach uses: `[BUILD_MINDSET]{"goal":"...","dailyMinutes":...,"sleepFocus":...,"stressLevel":"...","preferences":"..."}`

The same rules apply: review profile data first, skip questions already answered, ask 1-2 at a time, confirm summary before building.

### 3. Add Tag Detection for MOVEMENT and MINDSET (`src/pages/Help.tsx`)

In the existing `useEffect` that scans for `[BUILD_PROGRAMME]` and `[BUILD_MEAL_PLAN]` tags, add detection for:

- `[BUILD_MOVEMENT]` -- For now, since there's no dedicated cardio plan generator, the coach will generate a structured text-based plan directly in chat (no hidden tag trigger needed yet). Instead, update the system prompt to instruct the coach to output a complete structured movement/cardio plan directly in chat when the user confirms, formatted with clear days, sessions, distances/durations, and progressions. No hidden tag needed.

- `[BUILD_MINDSET]` -- Same approach: the coach outputs a structured daily mindset/recovery routine directly in chat with clear time blocks, techniques, and weekly progression. No hidden tag needed.

This means POWER and FUEL use the existing automated builders, while MOVEMENT and MINDSET get rich structured text plans delivered in-chat. This avoids building new edge functions for plan types that don't have existing generators.

### 4. System Prompt Update Detail

Add after the existing meal plan protocol section:

```
MOVEMENT/CARDIO PLAN BUILDING PROTOCOL
When a user requests a cardio, running, or movement plan, DO NOT generate one immediately.
Conduct a structured intake of 4-6 questions.

Review the user's MOVEMENT PROFILE, CARDIO HISTORY, and PERSONAL RECORDS first.
Confirm what you know, then ask ONLY what's missing.

Once confirmed, output a complete structured plan directly in your response with:
- Weekly schedule (days, session types, durations)
- Specific sessions (warm-up, main work, cool-down)
- Progressive overload across weeks
- Target paces/distances where relevant

MINDSET/RECOVERY ROUTINE BUILDING PROTOCOL
When a user requests a mindset routine, mental performance plan, or recovery protocol, DO NOT generate one immediately.
Conduct a structured intake of 4-6 questions.

Review the user's MINDSET PROFILE (motivation, challenge, sleep, stress) first.
Confirm what you know, then ask ONLY what's missing.

Once confirmed, output a complete structured routine directly in your response with:
- Daily time blocks and techniques
- Morning and evening protocols
- Breathing exercises, journaling prompts, or visualization scripts
- Weekly progression or variation
```

---

## Files to Modify

1. **`src/pages/Help.tsx`** -- Update MOVEMENT and MINDSET quick action prompts and descriptions
2. **`supabase/functions/help-chat/index.ts`** -- Add MOVEMENT and MINDSET intake protocols to system prompt

## No Database Changes Required

All profile data (cardio preferences, sleep, stress, motivation) is already in `coaching_profiles` and already sent to the coach via context.
