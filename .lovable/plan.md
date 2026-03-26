

## Plan: Rewrite All University Content — Personal Learner Voice

### Problem
All 4 units and all 4 assessments use PT-instructor language ("a client", "personal trainer", "your client"). The course is for people learning for **themselves**, not to become trainers.

### Voice Shift
- "A client reports knee pain" → "You notice knee pain during squats"
- "A personal trainer asks a client to perform..." → "You are performing..."
- "How would you advise a client..." → "What approach would work best for you..."
- "my clients" → "your own training"
- "Build rapport with nervous clients" → "Build confidence in the gym"

### Files to Edit (8 files)

| File | What Changes |
|------|-------------|
| `src/lib/university/level2/unit1.ts` | Coach notes, practical tasks — reframe from teaching others to self-learning |
| `src/lib/university/level2/unit2.ts` | Content paragraphs, coach notes — personal nutrition perspective |
| `src/lib/university/level2/unit3.ts` | Heaviest rewrite — Ch8 "Special Populations" reframed to "Understanding Individual Differences" for self-awareness |
| `src/lib/university/level2/unit4.ts` | Coach notes, practical tasks — already mostly self-focused but has stray PT references |
| `src/lib/university/level2/assessments.ts` | All scenario questions reframed to "you" perspective |
| `src/lib/university/level2/unit2-assessments.ts` | Scenario questions reframed |
| `src/lib/university/level2/unit3-assessments.ts` | Scenario questions reframed |
| `src/lib/university/level2/unit4-assessments.ts` | Scenario questions reframed |

### What Stays the Same
- All chapter structures, topics, learning outcomes, diagram references
- Question counts and pass marks unchanged
- No new files or components

### Execution Order
1. All 4 unit content files (unit1–4.ts) — rewrite all PT language to personal learner voice
2. All 4 assessment files — rewrite all scenario/question framing to "you" perspective
3. Consistency pass across all 8 files

