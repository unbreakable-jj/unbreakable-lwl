import { SavedFood } from '@/lib/fuelTypes';

export interface RecipeIngredientBasic {
  name: string;
  quantity?: number | null;
  unit?: string | null;
}

interface BespokeMacros {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  matchedCount: number;
  totalIngredients: number;
}

/**
 * Calculates bespoke macros for a recipe by matching its ingredients
 * against the user's store cupboard (saved_foods from barcode scans).
 *
 * For each ingredient:
 *   - If a matching store cupboard item exists (by name), use its per-gram
 *     macros scaled to the recipe quantity.
 *   - Otherwise, fall back to the recipe's reference macros (per serving).
 *
 * Returns the bespoke per-serving macros + how many ingredients were matched.
 */
export function calculateBespokeMacros(
  ingredients: RecipeIngredientBasic[],
  storeCupboard: SavedFood[],
  recipeServings: number,
  fallbackMacros: { calories: number; protein_g: number; carbs_g: number; fat_g: number }
): BespokeMacros {
  if (!ingredients.length || !storeCupboard.length) {
    return {
      ...fallbackMacros,
      matchedCount: 0,
      totalIngredients: ingredients.length,
    };
  }

  // Normalise name for fuzzy matching
  const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Build a lookup from store cupboard
  const cupboardMap = new Map<string, SavedFood>();
  for (const item of storeCupboard) {
    cupboardMap.set(normalise(item.food_name), item);
    // Also index by first two words for partial matching
    const words = normalise(item.food_name).slice(0, 20);
    if (!cupboardMap.has(words)) {
      cupboardMap.set(words, item);
    }
  }

  let totalCal = 0;
  let totalP = 0;
  let totalC = 0;
  let totalF = 0;
  let matched = 0;

  for (const ing of ingredients) {
    const key = normalise(ing.name);

    // Try exact match, then partial
    let cupboardItem = cupboardMap.get(key);
    if (!cupboardItem) {
      // Try matching first significant word
      for (const [mapKey, item] of cupboardMap.entries()) {
        if (key.includes(mapKey) || mapKey.includes(key)) {
          cupboardItem = item;
          break;
        }
      }
    }

    if (cupboardItem && ing.quantity) {
      matched++;
      // Store cupboard items have macros per serving_size (usually per 100g or per item)
      // Parse serving size to get the gram base
      const servingGrams = parseServingGrams(cupboardItem.serving_size);
      const ratio = servingGrams > 0 ? ing.quantity / servingGrams : 1;

      totalCal += (cupboardItem.calories || 0) * ratio;
      totalP += (cupboardItem.protein_g || 0) * ratio;
      totalC += (cupboardItem.carbs_g || 0) * ratio;
      totalF += (cupboardItem.fat_g || 0) * ratio;
    }
    // Unmatched ingredients are ignored; we'll use fallback if no matches
  }

  // If we matched at least one ingredient, return bespoke per-serving macros
  if (matched > 0) {
    const servings = recipeServings || 1;
    return {
      calories: Math.round(totalCal / servings),
      protein_g: Math.round(totalP / servings),
      carbs_g: Math.round(totalC / servings),
      fat_g: Math.round(totalF / servings),
      matchedCount: matched,
      totalIngredients: ingredients.length,
    };
  }

  // No matches — use reference macros
  return {
    ...fallbackMacros,
    matchedCount: 0,
    totalIngredients: ingredients.length,
  };
}

/**
 * Attempts to parse a serving size string like "100g", "per 100g", "1 slice (30g)"
 * into a gram value. Returns 100 as default (most barcode data is per 100g).
 */
function parseServingGrams(servingSize?: string | null): number {
  if (!servingSize) return 100;
  const match = servingSize.match(/(\d+\.?\d*)\s*g/i);
  if (match) return parseFloat(match[1]);
  return 100; // Default assumption: per 100g
}
