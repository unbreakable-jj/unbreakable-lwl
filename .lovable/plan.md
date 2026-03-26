

## Plan: Build Level 2, Unit 4 — Building Your Foundation

Unit 4 does not exist yet. It needs the same full treatment as Units 1–3: complete NVQ-standard chapter content, branded diagrams, and a comprehensive assessment.

### Chapter Breakdown — 8 Chapters

| # | Title | Key Topics |
|---|-------|-----------|
| 1 | Setting SMART Goals | SMART framework, outcome vs process goals, short/medium/long-term, review cycles |
| 2 | Understanding Training Frequency | Split routines (full-body, upper/lower, PPL), weekly volume, recovery between sessions |
| 3 | Programme Structure & Periodisation | Mesocycles, linear vs undulating periodisation, progressive overload planning, deload weeks |
| 4 | Exercise Order & Session Design | Compound-first principle, warm-up sets, accessory placement, session duration |
| 5 | Tracking & Measuring Progress | Training logs, body measurements, performance metrics, when to change programme |
| 6 | Sleep & Stress Management | Sleep hygiene, circadian rhythm, cortisol, stress reduction, recovery quality |
| 7 | Lifestyle Factors & Adherence | Consistency, habit stacking, social support, managing setbacks, motivation vs discipline |
| 8 | Building Your First Programme | Selecting exercises, rep schemes, weekly layout, 4-week starter template |

### Deliverables

1. **`src/lib/university/level2/unit4.ts`** — 8 chapters, each with learning outcome, assessment criteria, content sections, Unbreakable Insight, Coach Note, Practical Task
2. **`src/lib/university/level2/unit4-assessments.ts`** — 48 questions (6 per chapter), mix of multiple choice and scenario-based, 80% pass mark
3. **8 diagrams** in `src/assets/university/` — dark technical style (neon orange on dark): SMART framework, training splits matrix, periodisation timeline, session structure flow, progress tracking methods, sleep/recovery cycle, habit formation loop, sample programme template
4. **`src/lib/university/courseStructure.ts`** — import and wire unit 4 + assessment, replace the empty placeholder unit 4

### Technical Notes
- Same proven pattern as Units 1–3: static TS content, image imports, existing components handle rendering
- No new components needed
- After this, the Level 2 Final Assessment (combined from all 4 units) is the next deliverable

