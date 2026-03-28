

## Plan: Build Full Level 3 Course — Advanced Application

### Structure (UK Level 3 Equivalent)

8 chapters per unit across all 4 units = **32 chapters** total. This aligns with UK NVQ Level 3 depth expectations (Active IQ / NCFE standard).

### Unit & Chapter Breakdown

**Unit 1 — Advanced Nutrition (8 chapters)**
1. Macro Periodisation — adjusting macros across training phases
2. Nutrient Timing — pre/intra/post-workout nutrition windows
3. Evidence-Based Supplementation — what works, what doesn't, what's marketing
4. Body Composition — understanding body fat, lean mass, recomposition
5. Metabolic Adaptation — adaptive thermogenesis, diet breaks, reverse dieting
6. Calorie Cycling — refeed days, high/low days, when to use them
7. Digestion & Gut Health — fibre, microbiome, food intolerances
8. Nutrition for Specific Goals — cutting, bulking, maintenance, endurance fuelling

**Unit 2 — Muscle Growth Principles (8 chapters)**
1. Hypertrophy Science — mechanical tension, metabolic stress, muscle damage
2. Progressive Overload in Practice — load, volume, density, range of motion
3. Training Volume & Intensity — MRV, MEV, MAV, managing fatigue
4. Muscle Fibre Types — Type I vs Type II, training implications
5. Time Under Tension & Tempo — eccentric, concentric, isometric emphasis
6. Deloading & Recovery Weeks — when, why, and how to programme them
7. Mind-Muscle Connection — internal vs external cueing, research findings
8. Advanced Rep Schemes — drop sets, rest-pause, cluster sets, myo-reps

**Unit 3 — Programme Design (8 chapters)**
1. Periodisation Models — linear, undulating, block, conjugate
2. Exercise Selection & Order — compound vs isolation, sequencing logic
3. Training Splits — push/pull/legs, upper/lower, full body, bro splits
4. Auto-Regulation — RPE, RIR, adjusting on the fly
5. Weak Point Training — identifying and addressing lagging muscle groups
6. Peaking & Tapering — preparing for a test, event, or peak performance
7. Programming for Different Training Ages — beginner, intermediate, advanced
8. Putting It All Together — building a full 12-week programme from scratch

**Unit 4 — Behaviour & Lifestyle (8 chapters)**
1. Adherence Psychology — why people quit and how to build consistency
2. Habit Formation — cue-routine-reward, habit stacking, environment design
3. Stress & the Nervous System — cortisol, sympathetic vs parasympathetic, HRV
4. Sleep Optimisation — sleep hygiene, circadian rhythm, impact on performance
5. Managing Training Around Life — work, travel, illness, motivation dips
6. Self-Talk & Mental Frameworks — identity-based habits, growth mindset
7. Social Influence & Accountability — gym partners, communities, comparison traps
8. Long-Term Sustainability — avoiding burnout, periodising life, the 80/20 rule

### Per Chapter Structure (identical to Level 2)
- Learning Outcome
- Assessment Criteria (3 items)
- Content sections with headings, paragraphs, bullets
- `imagePlaceholder` for each chapter (to be replaced with generated images later)
- Unbreakable Insight (blunt truth)
- Coach's Note (practical guidance)
- Practical Task with reflection questions

### Chapter Quizzes
- 10-question bank per chapter, pick 5, 80% pass mark
- Same gating logic as Level 2 (must pass to unlock next chapter)
- 320 quiz questions total (32 chapters × 10)

### Final Exam
- 120-question bank, pick 80, 80% pass mark
- Same retry/randomisation logic as Level 2

### Level Gating
- Level 3 locked until Level 2 final exam is passed
- UI shows lock icon and "Complete Level 2 to unlock" message

### Files to Create (12 new files)

| File | Content |
|------|---------|
| `src/lib/university/level3/unit1.ts` | 8 chapters, full content |
| `src/lib/university/level3/unit2.ts` | 8 chapters, full content |
| `src/lib/university/level3/unit3.ts` | 8 chapters, full content |
| `src/lib/university/level3/unit4.ts` | 8 chapters, full content |
| `src/lib/university/level3/unit1-chapter-quizzes.ts` | 80 questions |
| `src/lib/university/level3/unit2-chapter-quizzes.ts` | 80 questions |
| `src/lib/university/level3/unit3-chapter-quizzes.ts` | 80 questions |
| `src/lib/university/level3/unit4-chapter-quizzes.ts` | 80 questions |
| `src/lib/university/level3/assessments.ts` | Unit 1 optional revision |
| `src/lib/university/level3/unit2-assessments.ts` | Unit 2 optional revision |
| `src/lib/university/level3/unit3-assessments.ts` | Unit 3 optional revision |
| `src/lib/university/level3/unit4-assessments.ts` | Unit 4 optional revision |
| `src/lib/university/level3/final-assessment.ts` | 120-question bank |

### Files to Edit

| File | Change |
|------|--------|
| `src/lib/university/courseStructure.ts` | Import all Level 3 files, wire into `courseData`, add gating logic |
| `src/pages/UniversityLevel.tsx` | Add Level 3 lock check (must pass Level 2 final) |

### Voice & Quality
- All content in personal learner voice ("you/your")
- British English throughout
- No PT/instructor framing
- Image placeholders describe the diagram needed for later generation

### Delivery
Unit by unit — content first, then quizzes, then assessments, then final exam. Each unit fully polished before moving to the next.

