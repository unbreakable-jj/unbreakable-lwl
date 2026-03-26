

## Plan: Build Level 2, Unit 3 — Introduction to Exercise

8 chapters, 48-question assessment. Same proven pattern as Units 1 and 2.

### Chapter Breakdown

| # | Title | Key Topics |
|---|-------|-----------|
| 1 | Types of Training | Resistance, cardiovascular, flexibility, HIIT — definitions, benefits, applications |
| 2 | Warm-Up & Cool-Down | Physiological purpose, RAMP protocol, dynamic vs static stretching, cool-down structure |
| 3 | Resistance Training Fundamentals | Reps, sets, tempo, rest periods, rep range continuum (strength/hypertrophy/endurance) |
| 4 | Cardiovascular Training Principles | Steady-state vs interval, heart rate zones, FITT principle, RPE scale |
| 5 | Flexibility & Mobility | ROM, PNF stretching, foam rolling, mobility drills, injury prevention |
| 6 | Exercise Selection & Technique | Compound vs isolation, movement patterns, bilateral/unilateral, common faults |
| 7 | Recovery & Adaptation | SAID principle, supercompensation curve, sleep, overtraining signs, deload |
| 8 | Training for Special Populations | Beginners, older adults, pre/postnatal, medical referral awareness |

### Deliverables

1. `src/lib/university/level2/unit3.ts` — 8 chapters with full NVQ-standard content
2. `src/lib/university/level2/unit3-assessments.ts` — 48 questions (6 per chapter), 80% pass mark
3. 8 AI-generated dark technical diagrams in `src/assets/university/`
4. `src/lib/university/courseStructure.ts` — wire in unit 3 data and assessment

### Diagrams (neon orange on dark)
- Training types comparison matrix
- RAMP warm-up protocol flow
- Rep range continuum
- Heart rate training zones
- Flexibility/mobility types diagram
- Movement patterns chart
- Supercompensation curve
- Special populations considerations

### Technical Notes
- No new components — existing `ChapterContent` and `AssessmentQuiz` handle everything
- Same static TS pattern as Units 1 and 2
- Progress tracking already works via existing DB schema

