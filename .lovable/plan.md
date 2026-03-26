

## Plan: Expand Unit 1 Assessment to 30 Questions

Currently 12 questions. Will expand to 30 — 6 per chapter, with a mix of multiple choice and scenario-based questions maintaining UK NVQ-standard depth.

### Question Distribution

| Chapter | Topic | Questions |
|---------|-------|-----------|
| 1 — Basic Anatomy | Planes, directional terms, body regions | 6 (keep 2 existing + 4 new) |
| 2 — Skeletal System | Bone types, joint classification, functions | 6 (keep 1 existing + 5 new) |
| 3 — Muscular System | Contraction types, agonist/antagonist, fibre types | 6 (keep 2 existing + 4 new) |
| 4 — Cardiovascular System | Heart, blood flow, acute/chronic responses | 6 (keep 3 existing + 3 new) |
| 5 — Energy Systems | ATP-PC, glycolysis, aerobic, application | 6 (keep 4 existing + 2 new) |

### Question Type Mix
- ~20 multiple choice (knowledge recall)
- ~10 scenario-based (applied understanding)

### File to edit
- `src/lib/university/level2/assessments.ts` — Replace the 12-question array with 30 questions

No other files need changing — the `AssessmentQuiz` component already handles any question count dynamically.

