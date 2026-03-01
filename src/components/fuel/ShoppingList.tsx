import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MealPlanItem } from '@/lib/fuelTypes';
import { dayLabels } from '@/lib/fuelTypes';

// Supermarket aisle categories
const AISLE_KEYWORDS: Record<string, string[]> = {
  'Meat & Fish': ['chicken', 'beef', 'pork', 'turkey', 'salmon', 'tuna', 'fish', 'shrimp', 'prawn', 'steak', 'mince', 'lamb', 'cod', 'bacon', 'sausage', 'ham', 'liver', 'gammon', 'haddock', 'mackerel', 'venison', 'duck'],
  'Dairy & Eggs': ['milk', 'cheese', 'yogurt', 'yoghurt', 'butter', 'cream', 'egg', 'mozzarella', 'parmesan', 'cheddar', 'ricotta', 'cottage', 'quark', 'skyr', 'creme fraiche'],
  'Fruit & Veg': ['onion', 'garlic', 'tomato', 'pepper', 'broccoli', 'spinach', 'kale', 'carrot', 'celery', 'cucumber', 'lettuce', 'mushroom', 'courgette', 'zucchini', 'avocado', 'corn', 'pea', 'asparagus', 'cauliflower', 'cabbage', 'aubergine', 'eggplant', 'leek', 'swede', 'turnip', 'parsnip', 'sprout', 'banana', 'apple', 'berry', 'blueberry', 'strawberry', 'raspberry', 'mango', 'orange', 'lemon', 'lime', 'grape', 'pineapple', 'peach', 'pear', 'melon', 'coconut', 'potato', 'sweet potato', 'bean', 'lentil', 'chickpea'],
  'Bakery & Bread': ['bread', 'roll', 'wrap', 'tortilla', 'pitta', 'crumpet', 'muffin', 'bagel', 'naan', 'baguette', 'sourdough'],
  'Cupboard Staples': ['rice', 'pasta', 'oats', 'quinoa', 'noodle', 'flour', 'cereal', 'granola', 'couscous', 'stock', 'broth', 'tinned', 'canned', 'barley', 'pearl barley', 'baking powder', 'sugar', 'honey', 'maple syrup', 'cocoa', 'chocolate', 'whey', 'protein powder'],
  'Oils & Condiments': ['oil', 'olive oil', 'coconut oil', 'ghee', 'spray', 'sauce', 'soy sauce', 'vinegar', 'mustard', 'ketchup', 'mayo', 'mayonnaise', 'sriracha', 'hot sauce', 'dressing', 'salsa', 'pesto', 'gravy', 'worcestershire'],
  'Herbs & Spices': ['salt', 'pepper', 'cumin', 'paprika', 'oregano', 'basil', 'thyme', 'rosemary', 'cinnamon', 'turmeric', 'chili', 'ginger', 'parsley', 'cilantro', 'coriander', 'bay leaf', 'nutmeg', 'cayenne', 'mixed herbs', 'sage', 'mint'],
  'Nuts & Seeds': ['almond', 'walnut', 'cashew', 'peanut', 'seed', 'chia', 'flax', 'hemp', 'pistachio', 'pecan', 'nut butter', 'peanut butter', 'almond butter'],
  'Frozen': ['frozen', 'ice cream'],
};

function categoriseIngredient(name: string): string {
  const lower = name.toLowerCase();
  for (const [category, keywords] of Object.entries(AISLE_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return category;
  }
  return 'Other';
}

// Normalise unit for aggregation
function normaliseUnit(unit: string | null | undefined): string {
  if (!unit) return '';
  const u = unit.toLowerCase().trim();
  if (['g', 'gram', 'grams'].includes(u)) return 'g';
  if (['kg', 'kilogram', 'kilograms'].includes(u)) return 'kg';
  if (['ml', 'millilitre', 'millilitres'].includes(u)) return 'ml';
  if (['l', 'litre', 'litres'].includes(u)) return 'l';
  if (['tbsp', 'tablespoon', 'tablespoons'].includes(u)) return 'tbsp';
  if (['tsp', 'teaspoon', 'teaspoons'].includes(u)) return 'tsp';
  if (['cup', 'cups'].includes(u)) return 'cups';
  return u;
}

// Convert to base unit (g or ml) for aggregation across compatible units
function toBaseUnit(qty: number, unit: string): { qty: number; baseUnit: string } {
  if (unit === 'kg') return { qty: qty * 1000, baseUnit: 'g' };
  if (unit === 'l') return { qty: qty * 1000, baseUnit: 'ml' };
  return { qty, baseUnit: unit };
}

// Format quantity for display — auto-convert large values
function formatQuantity(qty: number, unit: string): string {
  if (unit === 'g' && qty >= 1000) {
    return `${Math.round((qty / 1000) * 100) / 100}kg`;
  }
  if (unit === 'ml' && qty >= 1000) {
    return `${Math.round((qty / 1000) * 100) / 100}L`;
  }
  const rounded = Math.round(qty * 10) / 10;
  return unit ? `${rounded}${unit}` : `${rounded}`;
}

// Title-case a name for display
function titleCase(s: string): string {
  return s.replace(/\b\w/g, c => c.toUpperCase());
}

interface AggregatedItem {
  displayName: string;
  quantity: number;
  unit: string;
  category: string;
  count: number; // how many times it appears (for items without quantity)
}

interface ShoppingListProps {
  planItems: MealPlanItem[];
}

export function ShoppingList({ planItems }: ShoppingListProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set([0, 1, 2, 3, 4, 5, 6]));
  const [showDayFilter, setShowDayFilter] = useState(false);

  // Filter plan items by selected days
  const filteredPlanItems = useMemo(() => {
    return planItems.filter(item => selectedDays.has(item.day_of_week));
  }, [planItems, selectedDays]);

  // Get unique recipe IDs from filtered plan items
  const recipeIds = useMemo(() => {
    const ids = new Set<string>();
    filteredPlanItems.forEach(item => {
      if (item.recipe_id) ids.add(item.recipe_id);
    });
    return Array.from(ids);
  }, [filteredPlanItems]);

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

  // Build aggregated shopping list with proper deduplication
  const categorisedList = useMemo(() => {
    const itemMap = new Map<string, AggregatedItem>();

    // Aggregate ingredients across filtered plan items
    (allIngredients || []).forEach(ing => {
      const normName = ing.name.trim().toLowerCase();
      const normUnit = normaliseUnit(ing.unit);
      
      // Convert to base unit for aggregation (g/ml)
      const rawQty = (ing.quantity || 0);
      const { qty: baseQty, baseUnit } = toBaseUnit(rawQty, normUnit);
      
      // Key by normalised name + base unit
      const key = `${normName}-${baseUnit}`;

      // Count usages of this recipe across filtered plan days
      const recipeUsageCount = filteredPlanItems.filter(pi => pi.recipe_id === ing.recipe_id).length;
      const qty = baseQty * recipeUsageCount;

      const existing = itemMap.get(key);
      if (existing) {
        existing.quantity += qty;
        existing.count += recipeUsageCount;
      } else {
        itemMap.set(key, {
          displayName: titleCase(normName),
          quantity: qty,
          unit: baseUnit,
          category: categoriseIngredient(ing.name),
          count: recipeUsageCount,
        });
      }
    });

    // Add non-recipe plan items as standalone entries
    filteredPlanItems.forEach(item => {
      if (!item.recipe_id && item.food_name) {
        const normName = item.food_name.trim().toLowerCase();
        const key = `custom-${normName}`;
        const existing = itemMap.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          itemMap.set(key, {
            displayName: titleCase(normName),
            quantity: 0,
            unit: '',
            category: categoriseIngredient(item.food_name),
            count: 1,
          });
        }
      }
    });

    // Group by category
    const grouped: Record<string, AggregatedItem[]> = {};
    itemMap.forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    });

    // Sort: prioritise key aisles
    const aisleOrder = ['Meat & Fish', 'Dairy & Eggs', 'Fruit & Veg', 'Bakery & Bread', 'Cupboard Staples', 'Oils & Condiments', 'Herbs & Spices', 'Nuts & Seeds', 'Frozen', 'Other'];
    const sorted = Object.entries(grouped).sort(([a], [b]) => {
      const ai = aisleOrder.indexOf(a);
      const bi = aisleOrder.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
    sorted.forEach(([, items]) => items.sort((a, b) => a.displayName.localeCompare(b.displayName)));

    return sorted;
  }, [allIngredients, filteredPlanItems]);

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

  const toggleDay = (day: number) => {
    setSelectedDays(prev => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const selectAllDays = () => setSelectedDays(new Set([0, 1, 2, 3, 4, 5, 6]));
  const allSelected = selectedDays.size === 7;

  if (totalItems === 0 && !isLoading) {
    return (
      <Card className="border-2 border-primary/20 neon-border-subtle">
        <CardContent className="py-8 text-center">
          <ShoppingCart className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No items to show for selected days</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20 neon-border-subtle">
      <CardHeader className="pb-3">
        <CardTitle className="font-display tracking-wide flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            SHOPPING LIST
          </div>
          <div className="flex items-center gap-2">
            {totalItems > 0 && (
              <Badge variant="secondary" className="font-display text-xs">
                {checkedCount}/{totalItems}
              </Badge>
            )}
            <Button
              variant={showDayFilter ? 'default' : 'outline'}
              size="sm"
              className="font-display text-[10px] tracking-wide h-7 px-2"
              onClick={() => setShowDayFilter(!showDayFilter)}
            >
              <Filter className="w-3 h-3 mr-1" />
              DAYS
            </Button>
          </div>
        </CardTitle>

        {/* Day Filter */}
        <AnimatePresence>
          {showDayFilter && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-1.5 pt-3">
                {dayLabels.map((day, index) => (
                  <Button
                    key={day}
                    variant={selectedDays.has(index) ? 'default' : 'outline'}
                    size="sm"
                    className="font-display text-[10px] tracking-wide h-7 px-2.5"
                    onClick={() => toggleDay(index)}
                  >
                    {day.slice(0, 3).toUpperCase()}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-display text-[10px] tracking-wide h-7 px-2.5 text-primary"
                  onClick={selectAllDays}
                  disabled={allSelected}
                >
                  ALL
                </Button>
              </div>
              {!allSelected && (
                <p className="text-[10px] text-muted-foreground mt-2">
                  Showing: {Array.from(selectedDays).sort().map(d => dayLabels[d].slice(0, 3)).join(', ')}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          categorisedList.map(([category, items]) => {
            const isCollapsed = collapsedCategories.has(category);
            const catChecked = items.filter(i => checkedItems.has(`${i.displayName}-${i.unit}`)).length;

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
                          const key = `${item.displayName}-${item.unit}`;
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
                                {item.displayName}
                              </span>
                              <span className={`text-xs font-display ${checked ? 'text-muted-foreground' : 'text-primary'}`}>
                                {item.quantity > 0
                                  ? `${formatQuantity(item.quantity, item.unit)} total`
                                  : item.count > 1
                                    ? `x${item.count}`
                                    : ''
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
