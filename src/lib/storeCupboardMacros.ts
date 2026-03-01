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

// Normalise name for fuzzy matching
const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Build a lookup from store cupboard items for fuzzy matching.
 */
function buildCupboardMap(storeCupboard: SavedFood[]): Map<string, SavedFood> {
  const cupboardMap = new Map<string, SavedFood>();
  for (const item of storeCupboard) {
    cupboardMap.set(normalise(item.food_name), item);
    const words = normalise(item.food_name).slice(0, 20);
    if (!cupboardMap.has(words)) {
      cupboardMap.set(words, item);
    }
  }
  return cupboardMap;
}

/**
 * Find a matching store cupboard item for an ingredient name.
 */
function findMatch(key: string, cupboardMap: Map<string, SavedFood>): SavedFood | undefined {
  let match = cupboardMap.get(key);
  if (!match) {
    for (const [mapKey, item] of cupboardMap.entries()) {
      if (key.includes(mapKey) || mapKey.includes(key)) {
        match = item;
        break;
      }
    }
  }
  return match;
}

/**
 * Attempts to parse a serving size string like "100g", "per 100g", "1 slice (30g)"
 * into a gram value. Returns 100 as default (most barcode data is per 100g).
 */
function parseServingGrams(servingSize?: string | null): number {
  if (!servingSize) return 100;
  const match = servingSize.match(/(\d+\.?\d*)\s*g/i);
  if (match) return parseFloat(match[1]);
  return 100;
}

/**
 * Calculates bespoke macros for a recipe by matching its ingredients
 * against the user's store cupboard (saved_foods from barcode scans).
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

  const cupboardMap = buildCupboardMap(storeCupboard);

  let totalCal = 0;
  let totalP = 0;
  let totalC = 0;
  let totalF = 0;
  let matched = 0;

  for (const ing of ingredients) {
    const key = normalise(ing.name);
    const cupboardItem = findMatch(key, cupboardMap);

    if (cupboardItem && ing.quantity) {
      matched++;
      const servingGrams = parseServingGrams(cupboardItem.serving_size);
      const ratio = servingGrams > 0 ? ing.quantity / servingGrams : 1;

      totalCal += (cupboardItem.calories || 0) * ratio;
      totalP += (cupboardItem.protein_g || 0) * ratio;
      totalC += (cupboardItem.carbs_g || 0) * ratio;
      totalF += (cupboardItem.fat_g || 0) * ratio;
    }
  }

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

  return {
    ...fallbackMacros,
    matchedCount: 0,
    totalIngredients: ingredients.length,
  };
}

/**
 * Calculates depletion amounts for store cupboard items when a recipe is logged.
 * Returns a list of { foodId, amountUsed, unit } to apply via DB update.
 */
export function depleteStoreCupboard(
  ingredients: RecipeIngredientBasic[],
  storeCupboard: SavedFood[],
  recipeServings: number,
  servingsUsed: number
): { foodId: string; amountUsed: number; newRemaining: number | null }[] {
  if (!ingredients.length || !storeCupboard.length) return [];

  const cupboardMap = buildCupboardMap(storeCupboard);
  const depletions: { foodId: string; amountUsed: number; newRemaining: number | null }[] = [];
  const servingRatio = servingsUsed / (recipeServings || 1);

  for (const ing of ingredients) {
    if (!ing.quantity) continue;
    const key = normalise(ing.name);
    const cupboardItem = findMatch(key, cupboardMap);

    if (cupboardItem && (cupboardItem as any).quantity_remaining != null) {
      const amountUsed = ing.quantity * servingRatio;
      const currentRemaining = (cupboardItem as any).quantity_remaining as number;
      const newRemaining = Math.max(0, currentRemaining - amountUsed);

      depletions.push({
        foodId: cupboardItem.id,
        amountUsed,
        newRemaining,
      });
    }
  }

  return depletions;
}
