

## Pro Images for Fuel Level 3 — All 4 Units

### Current state
4 units × 6 chapters = 24 chapters. Each chapter has exactly 1 image (on the first content section). Each chapter has 3–4 content sections, leaving 2–3 sections per chapter without visuals. Target: 2 additional images per chapter = ~48 new images.

### Images to generate (2 per chapter, ~48 total, one at a time, premium model)

**Unit 1 — Advanced Macronutrients & Energy Systems**
- `nutl3-u1-ch1-glycolysis.png` — Glycolysis pathway: glucose → pyruvate → ATP, simple step diagram
- `nutl3-u1-ch1-glycogen-stores.png` — Glycogen storage diagram: muscle vs liver with capacity bars
- `nutl3-u1-ch2-leucine-threshold.png` — Leucine threshold comparison: whey 25g vs chicken 30g vs lentils 50g
- `nutl3-u1-ch2-protein-distribution.png` — Daily protein distribution: 4 meals × 30–40g vs 2 meals × 60g
- `nutl3-u1-ch3-omega-balance.png` — Omega-6:Omega-3 ratio comparison: Western diet 15:1 vs ideal 2–4:1
- `nutl3-u1-ch3-fat-guidelines.png` — Fat intake guidelines: 20–35% calories with source priorities
- `nutl3-u1-ch4-neat.png` — NEAT variability diagram showing unconscious movement types
- `nutl3-u1-ch4-adaptive-thermogenesis.png` — Adaptive thermogenesis: BMR drop, hormonal shifts, NEAT suppression
- `nutl3-u1-ch5-carb-periodisation.png` — Carb periodisation: heavy/moderate/rest day intake tiers
- `nutl3-u1-ch5-post-training.png` — Post-training nutrition window: protein + carbs timing
- `nutl3-u1-ch6-alcohol-metabolism.png` — Alcohol metabolism pathway and calorie priority disruption
- `nutl3-u1-ch6-alcohol-recovery.png` — Alcohol effects on recovery: sleep, MPS, hydration impacts

**Unit 2 — Micronutrients, Supplementation & Special Populations**
- `nutl3-u2-ch1-vitamin-d.png` — UK vitamin D deficiency: October–March UVB gap with supplement guidance
- `nutl3-u2-ch1-fat-soluble-aek.png` — Vitamins A, E, K: sources, functions, toxicity risks
- `nutl3-u2-ch2-iron-absorption.png` — Iron absorption: haem vs non-haem, enhancers vs inhibitors
- `nutl3-u2-ch2-zinc-magnesium.png` — Zinc and magnesium: roles, sources, deficiency signs
- `nutl3-u2-ch3-creatine.png` — Creatine monohydrate: mechanism, dosing, myths debunked
- `nutl3-u2-ch3-supplement-redflags.png` — Supplement marketing red flags checklist
- `nutl3-u2-ch4-pregnancy-foods.png` — Pregnancy foods to avoid with risk explanations
- `nutl3-u2-ch4-ageing-nutrition.png` — Older adult nutrition: sarcopenia, protein needs, key nutrients
- `nutl3-u2-ch5-protein-complementation.png` — Plant protein complementation: rice + beans, bread + hummus
- `nutl3-u2-ch5-allergens.png` — Food allergies vs intolerances: immune vs non-immune comparison
- `nutl3-u2-ch6-scope-boundaries.png` — Nutrition scope boundaries: when to refer
- `nutl3-u2-ch6-referral-pathway.png` — Referral pathway flowchart: concern → GP → specialist

**Unit 3 — Sports Nutrition & Performance Fuelling**
- `nutl3-u3-ch1-carb-performance.png` — Glycogen depletion during resistance training: 25–40% per session
- `nutl3-u3-ch1-meal-timing.png` — Pre/post training meal timing with food examples
- `nutl3-u3-ch2-intra-fuelling.png` — Intra-event fuelling rates: 30–60g/hr vs 90g/hr glucose-fructose
- `nutl3-u3-ch2-electrolytes.png` — Electrolyte losses during exercise: sodium, potassium ranges
- `nutl3-u3-ch3-deficit-range.png` — Caloric deficit sizing: 300–500 kcal sweet spot diagram
- `nutl3-u3-ch3-hunger-management.png` — Hunger management strategies: volume eating, fibre, hydration
- `nutl3-u3-ch4-lean-bulk.png` — Lean bulk vs dirty bulk: surplus size vs fat/muscle gain ratio
- `nutl3-u3-ch4-gain-rates.png` — Muscle gain rates by training experience: beginner → advanced
- `nutl3-u3-ch5-dehydration-scale.png` — Dehydration severity scale: 1% → 5%+ with symptoms
- `nutl3-u3-ch5-hydration-strategy.png` — Practical hydration protocol: pre/during/post training
- `nutl3-u3-ch6-body-comp-methods.png` — Body composition methods comparison: DEXA, BIA, skinfolds, mirror
- `nutl3-u3-ch6-progress-tracking.png` — Multi-metric progress tracking: weight trend, measurements, photos

**Unit 4 — Nutrition Psychology & Professional Practice**
- `nutl3-u4-ch1-environment.png` — Environmental eating influences: plate size, food visibility, distraction
- `nutl3-u4-ch1-food-framework.png` — Nutrient density framework replacing good/bad food labels
- `nutl3-u4-ch2-habit-stacking.png` — Habit stacking formula: existing habit → new behaviour chain
- `nutl3-u4-ch2-self-efficacy.png` — Self-efficacy building: mastery, modelling, persuasion, physiology
- `nutl3-u4-ch3-warning-signs.png` — Disordered eating warning signs: behavioural, psychological, physical
- `nutl3-u4-ch3-referral-support.png` — Support pathway: self → GP → Beat → specialist services
- `nutl3-u4-ch4-mi-principles.png` — Four MI principles: empathy, discrepancy, resistance, self-efficacy
- `nutl3-u4-ch4-change-talk.png` — Change talk vs sustain talk comparison with examples
- `nutl3-u4-ch5-batch-system.png` — Batch cooking system: protein + carb + veg bases → mix and match
- `nutl3-u4-ch5-budget-sources.png` — Budget nutrition: cheapest protein, carb, and vegetable sources
- `nutl3-u4-ch6-professional-titles.png` — UK nutrition titles: RD vs RNutr vs Coach with regulation status
- `nutl3-u4-ch6-evidence-hierarchy.png` — Evidence hierarchy: systematic reviews → RCTs → observational → anecdote

### Approach
- Generate each one-at-a-time using premium model (`google/gemini-3-pro-image-preview`)
- Dark charcoal (`#1a1a2e`) background, neon orange (`#ff6b35`) accents, clean vector labels, British English
- Wire each image immediately after generation (import + `imageUrl`/`imageAlt` on the matching content section)
- Work unit by unit: U1 → U2 → U3 → U4
- Build check at end

### Files modified
- `src/lib/university/nutrition-l3/unit1.ts` — ~12 new imports and imageUrl entries
- `src/lib/university/nutrition-l3/unit2.ts` — ~12 new imports and imageUrl entries
- `src/lib/university/nutrition-l3/unit3.ts` — ~12 new imports and imageUrl entries
- `src/lib/university/nutrition-l3/unit4.ts` — ~12 new imports and imageUrl entries
- `src/assets/university/` — ~48 new PNG files

### Execution
Continuous — generate, wire, next image. No stopping. Build check at end.

