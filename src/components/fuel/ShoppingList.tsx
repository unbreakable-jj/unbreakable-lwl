import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MealPlanItem } from '@/lib/fuelTypes';

// Category mapping based on common ingredient keywords
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Protein': ['chicken', 'beef', 'pork', 'turkey', 'salmon', 'tuna', 'fish', 'shrimp', 'prawn', 'egg', 'tofu', 'tempeh', 'steak', 'mince', 'lamb', 'cod', 'whey', 'protein'],
  'Dairy': ['milk', 'cheese', 'yogurt', 'yoghurt', 'butter', 'cream', 'mozzarella', 'parmesan', 'cheddar', 'ricotta', 'cottage', 'quark', 'skyr'],
  'Grains & Carbs': ['rice', 'pasta', 'bread', 'oats', 'quinoa', 'tortilla', 'wrap', 'noodle', 'flour', 'cereal', 'granola', 'couscous', 'potato', 'sweet potato'],
  'Vegetables': ['onion', 'garlic', 'tomato', 'pepper', 'broccoli', 'spinach', 'kale', 'carrot', 'celery', 'cucumber', 'lettuce', 'mushroom', 'courgette', 'zucchini', 'avocado', 'corn', 'pea', 'bean', 'asparagus', 'cauliflower', 'cabbage', 'aubergine', 'eggplant'],
  'Fruits': ['banana', 'apple', 'berry', 'blueberry', 'strawberry', 'raspberry', 'mango', 'orange', 'lemon', 'lime', 'grape', 'pineapple', 'peach', 'pear', 'melon', 'coconut'],
  'Oils & Fats': ['oil', 'olive oil', 'coconut oil', 'ghee', 'lard', 'spray'],
  'Nuts & Seeds': ['almond', 'walnut', 'cashew', 'peanut', 'seed', 'chia', 'flax', 'hemp', 'pistachio', 'pecan', 'nut butter', 'peanut butter', 'almond butter'],
  'Herbs & Spices': ['salt', 'pepper', 'cumin', 'paprika', 'oregano', 'basil', 'thyme', 'rosemary', 'cinnamon', 'turmeric', 'chili', 'ginger', 'parsley', 'cilantro', 'coriander', 'bay leaf', 'nutmeg', 'cayenne'],
  'Condiments & Sauces': ['sauce', 'soy sauce', 'vinegar', 'honey', 'mustard', 'ketchup', 'mayo', 'mayonnaise', 'sriracha', 'hot sauce', 'maple syrup', 'dressing', 'salsa', 'pesto'],
};

function categoriseIngredient(name: string): string {
  const lower = name.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return category;
  }
  return 'Other';
}

interface ShoppingItem {
  name: string;
  quantity?: number;
  unit?: string;
  category: string;
}

interface ShoppingListProps {
  planItems: MealPlanItem[];
}

export function ShoppingList({ planItems }: ShoppingListProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // Get unique recipe IDs from plan items
  const recipeIds = useMemo(() => {
    const ids = new Set<string>();
    planItems.forEach(item => {
      if (item.recipe_id) ids.add(item.recipe_id);
    });
    return Array.from(ids);
  }, [planItems]);

  // Fetch ingredients for all recipes in the plan
  const { data: allIngredients, isLoading } = useQuery({
    queryKey: ['shopping-list-ingredients', recipeIds],
    queryFn: async () => {
      if (recipeIds.length === 0) return [];
      const { data, error } = await supabase
        .from('recipe_ingredients')
        .select('*')
        .in('recipe_id', recipeIds)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: recipeIds.length > 0,
  });

  // Build aggregated shopping list — merge ALL occurrences across the entire week
  const categorisedList = useMemo(() => {
    const itemMap = new Map<string, ShoppingItem>();

    // Aggregate ingredients across ALL plan items (entire 7-day plan)
    (allIngredients || []).forEach(ing => {
      // Normalise key: lowercase name + unit so "Chicken Breast 200g" merges everywhere
      const normName = ing.name.trim().toLowerCase();
      const normUnit = (ing.unit || '').trim().toLowerCase();
      const key = `${normName}-${normUnit}`;

      // Count total usages of this recipe across the whole plan
      const recipeUsageCount = planItems.filter(pi => pi.recipe_id === ing.recipe_id).length;
      const qty = (ing.quantity || 0) * recipeUsageCount;

      const existing = itemMap.get(key);
      if (existing) {
        existing.quantity = (existing.quantity || 0) + qty;
      } else {
        itemMap.set(key, {
          name: ing.name,
          quantity: qty || undefined,
          unit: ing.unit || undefined,
          category: categoriseIngredient(ing.name),
        });
      }
    });

    // Also add non-recipe plan items as standalone entries (deduplicated)
    planItems.forEach(item => {
      if (!item.recipe_id && item.food_name) {
        const normName = item.food_name.trim().toLowerCase();
        const key = `custom-${normName}`;
        if (!itemMap.has(key)) {
          itemMap.set(key, {
            name: item.food_name,
            category: categoriseIngredient(item.food_name),
          });
        }
      }
    });

    // Group by category
    const grouped: Record<string, ShoppingItem[]> = {};
    itemMap.forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    });

    // Sort categories and items
    const sorted = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
    sorted.forEach(([, items]) => items.sort((a, b) => a.name.localeCompare(b.name)));

    return sorted;
  }, [allIngredients, planItems]);

  const totalItems = categorisedList.reduce((sum, [, items]) => sum + items.length, 0);
  const checkedCount = checkedItems.size;

  const toggleItem = (itemKey: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemKey)) next.delete(itemKey);
      else next.add(itemKey);
      return next;
    });
  };

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  if (totalItems === 0 && !isLoading) return null;

  return (
    <Card className="border-2 border-primary/20 neon-border-subtle">
      <CardHeader className="pb-3">
        <CardTitle className="font-display tracking-wide flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            SHOPPING LIST
          </div>
          {totalItems > 0 && (
            <Badge variant="secondary" className="font-display text-xs">
              {checkedCount}/{totalItems} done
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          categorisedList.map(([category, items]) => {
            const isCollapsed = collapsedCategories.has(category);
            const catChecked = items.filter(i => checkedItems.has(`${i.name}-${i.unit || ''}`)).length;

            return (
              <div key={category}>
                <button
                  className="w-full flex items-center justify-between py-2 text-left"
                  onClick={() => toggleCategory(category)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-display tracking-wide text-sm text-foreground">{category.toUpperCase()}</span>
                    <span className="text-xs text-muted-foreground">({catChecked}/{items.length})</span>
                  </div>
                  {isCollapsed ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1 pl-1">
                        {items.map(item => {
                          const key = `${item.name}-${item.unit || ''}`;
                          const checked = checkedItems.has(key);
                          return (
                            <label
                              key={key}
                              className={`flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer transition-colors ${
                                checked ? 'bg-primary/5' : 'hover:bg-muted/30'
                              }`}
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() => toggleItem(key)}
                              />
                              <span className={`flex-1 text-sm ${checked ? 'line-through text-muted-foreground' : ''}`}>
                                {item.quantity && item.quantity > 0
                                  ? `${item.name} — ${Math.round(item.quantity * 10) / 10}${item.unit ? ` ${item.unit}` : ''} (total)`
                                  : item.name
                                }
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
