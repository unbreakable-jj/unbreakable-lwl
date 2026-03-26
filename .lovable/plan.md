

## Plan: Build Level 2, Unit 2 — Principles of Nutrition

**7 chapters** — nutrition warrants more depth than anatomy given the breadth of topics (macros, micros, hydration, energy balance, food labels, meal timing, and practical application).

### Chapter Breakdown

| # | Title | Key Topics |
|---|-------|-----------|
| 1 | Understanding Macronutrients | Protein, carbohydrates, fats — roles, sources, caloric values, quality |
| 2 | Micronutrients & Their Role | Vitamins, minerals, deficiency signs, food sources vs supplements |
| 3 | Hydration & Fluid Balance | Water's role, electrolytes, dehydration signs, intake guidelines, exercise hydration |
| 4 | Energy Balance & Body Composition | TDEE, BMR, caloric surplus/deficit, thermic effect, practical tracking |
| 5 | Reading Food Labels | Serving sizes, ingredient lists, nutritional claims, spotting hidden sugars/fats |
| 6 | Nutrient Timing & Meal Structure | Pre/post workout nutrition, meal frequency myths, practical meal building |
| 7 | Putting It All Together | Building a balanced day of eating, common mistakes, sustainable habits |

### Deliverables

1. **Content file** — `src/lib/university/level2/unit2.ts` — 7 chapters, each with learning outcome, assessment criteria, content sections, Unbreakable Insight, Coach Note, and Practical Task
2. **AI-generated diagrams** — 7 dark technical illustrations (same brand style: neon orange on dark background):
   - Macronutrient breakdown chart
   - Micronutrient sources diagram
   - Hydration balance visual
   - Energy balance equation diagram
   - Food label anatomy
   - Nutrient timing timeline
   - Balanced plate composition
3. **Assessment file** — `src/lib/university/level2/unit2-assessments.ts` — 42 questions (6 per chapter), mix of multiple choice and scenario-based, 80% pass mark
4. **Course structure update** — `src/lib/university/courseStructure.ts` — wire in unit2 data and assessment

### Files to create/edit
- Create `src/assets/university/` — 7 new diagram PNGs
- Create `src/lib/university/level2/unit2.ts`
- Create `src/lib/university/level2/unit2-assessments.ts`
- Edit `src/lib/university/courseStructure.ts` — import and wire unit 2
- Edit `src/lib/university/level2/assessments.ts` — export unit 2 assessment alongside unit 1

### Technical Notes
- Same pattern as Unit 1: static TS content, image imports, progress tracked in DB
- No new components needed — existing `ChapterContent`, `AssessmentQuiz` handle everything
- 42 questions = 6 per chapter × 7 chapters

