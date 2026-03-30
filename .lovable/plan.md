

## Rework Text-Heavy Fuel L2 Images — Targeted Fix

### Scope
Only regenerate the images most likely to have AI text artefacts, colour issues, or spelling mistakes — those with dense text labels, tables, or lists. All other images are left untouched.

### Images to rework (12 of 36)

**Unit 1**
1. `nutl2-u1-ch3-vitamins.png` — Vitamin chart with multiple names, sources, and functions
2. `nutl2-u1-ch3-minerals.png` — Mineral chart with multiple names, sources, and functions
3. `nutl2-u1-ch4-fibre-comparison.png` — Soluble vs insoluble fibre with food examples

**Unit 2**
4. `nutl2-u2-ch1-youth-nutrients.png` — Youth nutrient needs with multiple label rows
5. `nutl2-u2-ch2-elderly-nutrients.png` — Elderly nutrient needs with multiple label rows
6. `nutl2-u2-ch3-pregnancy-avoid.png` — Pregnancy foods to avoid (list-heavy)
7. `nutl2-u2-ch4-protein-combining.png` — Plant protein combining grid
8. `nutl2-u2-ch5-religious-diets.png` — Religious dietary practices (multi-column text)
9. `nutl2-u2-ch6-14-allergens.png` — UK 14 allergens (14 labelled items)

**Unit 3**
10. `nutl2-u3-ch1-bacteria.png` — Common foodborne bacteria names and details
11. `nutl2-u3-ch5-budget-foods.png` — Budget nutrition foods list
12. `nutl2-u3-ch7-cooking-methods.png` — Cooking methods comparison table

### Why these specifically
These images contain dense scientific/nutritional terminology where AI image models commonly produce:
- Misspelt scientific terms (e.g. "riboflavin", "thiamine", "campylobacter")
- Garbled text labels or letter artifacts
- Inconsistent colour application on multi-row layouts

### Approach
- Regenerate each one-at-a-time using the **premium model** (`google/gemini-3-pro-image-preview`)
- Dark charcoal (`#1a1a2e`) background, neon orange (`#ff6b35`) accents, clean vector labels, British English
- Overwrite existing files — no TypeScript changes needed
- Build check at end

### Files modified
- 12 PNG files in `src/assets/university/` overwritten in place

