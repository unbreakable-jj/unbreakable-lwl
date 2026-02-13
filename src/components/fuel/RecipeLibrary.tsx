import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useRecipes } from '@/hooks/useRecipes';
import { Recipe, RecipeIngredient, dietaryTagOptions } from '@/lib/fuelTypes';
import { 
  Plus, 
  Search, 
  Clock, 
  Users, 
  Flame,
  Star,
  ChefHat,
  Filter,
  X,
  UtensilsCrossed,
  Beef,
  Leaf
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useFoodLogs } from '@/hooks/useFoodLogs';
import { toast } from 'sonner';

interface RecipeFormData {
  name: string;
  description: string;
  instructions: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  calories_per_serving: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  dietary_tags: string[];
  is_public: boolean;
}

const defaultFormData: RecipeFormData = {
  name: '',
  description: '',
  instructions: '',
  prep_time_minutes: 0,
  cook_time_minutes: 0,
  servings: 1,
  calories_per_serving: 0,
  protein_g: 0,
  carbs_g: 0,
  fat_g: 0,
  dietary_tags: [],
  is_public: false,
};

const CATEGORY_TABS = [
  { value: 'all', label: 'All' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snacks' },
  { value: 'treats', label: 'Treats' },
  { value: 'smoothie', label: 'Smoothies' },
];

const PACK_OPTIONS = [
  { value: 'all', label: 'All Packs' },
  { value: 'low-carb', label: 'Low-Carb Pack' },
  { value: 'high-protein', label: 'High Protein Pack' },
  { value: 'mine', label: 'My Recipes' },
  { value: 'favourites', label: 'Favourites' },
];

const DIETARY_TAG_MAP: Record<string, string> = {
  'GF': 'Gluten-Free',
  'DF': 'Dairy-Free',
  'LC': 'Low-Carb',
  'HP': 'High Protein',
  'V': 'Vegetarian',
  'VG': 'Vegan',
  'Q': 'Quick',
  'MP': 'Meal Prep',
  'N': 'Contains Nuts',
};

export function RecipeLibrary() {
  const { user } = useAuth();
  const { recipes, myRecipes, favouriteRecipes, isLoading, createRecipe, deleteRecipe, toggleFavourite } = useRecipes();
  const { addFoodLog } = useFoodLogs();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<RecipeFormData>(defaultFormData);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activePack, setActivePack] = useState('all');
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);

  // Fetch ingredients for the viewed recipe
  const { data: recipeIngredients } = useQuery({
    queryKey: ['recipe-ingredients', viewingRecipe?.id],
    queryFn: async () => {
      if (!viewingRecipe?.id) return [];
      const { data, error } = await supabase
        .from('recipe_ingredients')
        .select('*')
        .eq('recipe_id', viewingRecipe.id)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as RecipeIngredient[];
    },
    enabled: !!viewingRecipe?.id,
  });

  const getFilteredRecipes = () => {
    let filtered = recipes || [];

    // Pack filter
    if (activePack === 'mine') {
      filtered = myRecipes;
    } else if (activePack === 'favourites') {
      filtered = favouriteRecipes;
    } else if (activePack !== 'all') {
      filtered = filtered.filter((r) => r.pack === activePack);
    }

    // Category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter((r) => r.category === activeCategory);
    }

    // Search
    if (searchQuery) {
      filtered = filtered.filter((r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter((r) =>
        selectedTags.some((tag) => r.dietary_tags?.includes(tag))
      );
    }

    return filtered;
  };

  const handleCreateRecipe = async () => {
    await createRecipe.mutateAsync({
      ...formData,
      is_favourite: false,
    });
    setShowCreateModal(false);
    setFormData(defaultFormData);
  };

  const handleLogMeal = async (recipe: Recipe) => {
    try {
      await addFoodLog.mutateAsync({
        food_name: recipe.name,
        calories: recipe.calories_per_serving || 0,
        protein_g: recipe.protein_g || 0,
        carbs_g: recipe.carbs_g || 0,
        fat_g: recipe.fat_g || 0,
        meal_type: 'lunch',
        servings: 1,
        logged_at: new Date().toISOString(),
        recipe_id: recipe.id,
      });
      toast.success(`${recipe.name} logged as a meal`);
    } catch {
      toast.error('Failed to log meal');
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleFormTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      dietary_tags: prev.dietary_tags.includes(tag)
        ? prev.dietary_tags.filter((t) => t !== tag)
        : [...prev.dietary_tags, tag],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredRecipes = getFilteredRecipes();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 items-center">
          {/* Pack Filter */}
          <Select value={activePack} onValueChange={setActivePack}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PACK_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'border-primary' : ''}
          >
            <Filter className="w-4 h-4" />
          </Button>
          
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="font-display tracking-wide">
                <Plus className="w-4 h-4 mr-2" />
                CREATE
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display tracking-wide">CREATE RECIPE</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Recipe Name *</Label>
                  <Input
                    placeholder="e.g., High Protein Overnight Oats"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Brief description of the recipe..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Prep Time (min)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.prep_time_minutes || ''}
                      onChange={(e) => setFormData({ ...formData, prep_time_minutes: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Cook Time (min)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.cook_time_minutes || ''}
                      onChange={(e) => setFormData({ ...formData, cook_time_minutes: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Servings</Label>
                    <Input
                      type="number"
                      min={1}
                      value={formData.servings}
                      onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label>Calories/serving</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.calories_per_serving || ''}
                      onChange={(e) => setFormData({ ...formData, calories_per_serving: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Protein (g)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.protein_g || ''}
                      onChange={(e) => setFormData({ ...formData, protein_g: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Carbs (g)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.carbs_g || ''}
                      onChange={(e) => setFormData({ ...formData, carbs_g: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Fat (g)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.fat_g || ''}
                      onChange={(e) => setFormData({ ...formData, fat_g: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Instructions</Label>
                  <Textarea
                    placeholder="Step by step cooking instructions..."
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label>Dietary Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {dietaryTagOptions.map((tag) => (
                      <Badge
                        key={tag}
                        variant={formData.dietary_tags.includes(tag) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleFormTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button 
                  className="w-full font-display tracking-wide"
                  onClick={handleCreateRecipe}
                  disabled={!formData.name || createRecipe.isPending}
                >
                  {createRecipe.isPending ? 'CREATING...' : 'CREATE RECIPE'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Dietary Filters */}
      {showFilters && (
        <Card className="p-4">
          <p className="text-sm font-medium mb-2">Dietary Filters</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(DIETARY_TAG_MAP).map(([code, label]) => (
              <Badge
                key={code}
                variant={selectedTags.includes(code) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleTag(code)}
              >
                {code}
                {selectedTags.includes(code) && <X className="w-3 h-3 ml-1" />}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="w-full flex overflow-x-auto">
          {CATEGORY_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex-1 min-w-fit text-xs sm:text-sm">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          {/* Pack header when filtering */}
          {activePack !== 'all' && activePack !== 'mine' && activePack !== 'favourites' && (
            <div className="mb-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {activePack === 'low-carb' ? (
                  <Leaf className="w-5 h-5 text-primary" />
                ) : (
                  <Beef className="w-5 h-5 text-primary" />
                )}
                <h2 className="font-display text-xl tracking-wide">
                  <span className="text-primary neon-glow-subtle">UNBREAKABLE </span>
                  {activePack === 'low-carb' ? 'LOW-CARB PACK' : 'HIGH PROTEIN PACK'}
                </h2>
              </div>
              <p className="text-xs text-muted-foreground font-display tracking-wider">
                FUEL WITH REAL INTENT. KEEP SHOWING UP.
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecipes.map((recipe) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card 
                  className="cursor-pointer hover:border-primary/50 transition-all h-full neon-border-subtle overflow-hidden"
                  onClick={() => setViewingRecipe(recipe)}
                >
                  {/* Recipe Image */}
                  {recipe.image_url && (
                    <div className="w-full h-40 overflow-hidden">
                      <img 
                        src={recipe.image_url} 
                        alt={recipe.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  {!recipe.image_url && (
                    <div className="w-full h-32 bg-muted/30 flex items-center justify-center">
                      <UtensilsCrossed className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                  )}

                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-base tracking-wide line-clamp-1">{recipe.name}</h3>
                        {recipe.pack && (
                          <Badge variant="outline" className="text-[10px] mt-1 border-primary/40 text-primary">
                            {recipe.pack === 'low-carb' ? 'LOW-CARB' : 'HIGH PROTEIN'}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 -mt-1 -mr-2 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavourite.mutate(recipe.id);
                        }}
                      >
                        <Star className={`w-4 h-4 ${recipe.is_favourite ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                      </Button>
                    </div>
                    
                    {/* Prep Time */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      {(recipe.prep_time_minutes || recipe.cook_time_minutes) && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Prep {recipe.prep_time_minutes || 0}m</span>
                          {recipe.cook_time_minutes ? <span>• Cook {recipe.cook_time_minutes}m</span> : null}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {recipe.servings}
                      </div>
                    </div>
                    
                    {/* Full Macros */}
                    <div className="grid grid-cols-4 gap-2 text-center bg-muted/30 rounded-md p-2 mb-3">
                      <div>
                        <p className="font-display text-sm text-primary">{recipe.calories_per_serving || 0}</p>
                        <p className="text-[10px] text-muted-foreground">kcal</p>
                      </div>
                      <div>
                        <p className="font-display text-sm text-foreground">{recipe.protein_g || 0}g</p>
                        <p className="text-[10px] text-muted-foreground">Protein</p>
                      </div>
                      <div>
                        <p className="font-display text-sm text-foreground">{recipe.carbs_g || 0}g</p>
                        <p className="text-[10px] text-muted-foreground">Carbs</p>
                      </div>
                      <div>
                        <p className="font-display text-sm text-foreground">{recipe.fat_g || 0}g</p>
                        <p className="text-[10px] text-muted-foreground">Fat</p>
                      </div>
                    </div>
                    
                    {/* Dietary Tags */}
                    {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {recipe.dietary_tags.slice(0, 4).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {tag}
                          </Badge>
                        ))}
                        {recipe.dietary_tags.length > 4 && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            +{recipe.dietary_tags.length - 4}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredRecipes.length === 0 && (
            <div className="text-center py-12">
              <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recipes found</p>
              {activePack === 'mine' && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowCreateModal(true)}
                >
                  Create your first recipe
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Recipe Detail Modal */}
      <Dialog open={!!viewingRecipe} onOpenChange={(open) => !open && setViewingRecipe(null)}>
        {viewingRecipe && (
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl tracking-wide flex items-center gap-2">
                {viewingRecipe.name}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => toggleFavourite.mutate(viewingRecipe.id)}
                >
                  <Star className={`w-5 h-5 ${viewingRecipe.is_favourite ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                </Button>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-2">
              {/* Hero Image */}
              {viewingRecipe.image_url && (
                <div className="w-full h-48 sm:h-64 rounded-lg overflow-hidden">
                  <img 
                    src={viewingRecipe.image_url} 
                    alt={viewingRecipe.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Pack + Category badges */}
              <div className="flex gap-2 flex-wrap">
                {viewingRecipe.pack && (
                  <Badge className="text-xs">
                    {viewingRecipe.pack === 'low-carb' ? 'LOW-CARB PACK' : 'HIGH PROTEIN PACK'}
                  </Badge>
                )}
                {viewingRecipe.category && (
                  <Badge variant="secondary" className="text-xs capitalize">
                    {viewingRecipe.category}
                  </Badge>
                )}
              </div>

              {viewingRecipe.description && (
                <p className="text-muted-foreground">{viewingRecipe.description}</p>
              )}
              
              <div className="flex items-center gap-6 text-sm">
                {(viewingRecipe.prep_time_minutes || viewingRecipe.cook_time_minutes) && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Prep {viewingRecipe.prep_time_minutes || 0}m • Cook {viewingRecipe.cook_time_minutes || 0}m</p>
                      <p className="text-muted-foreground text-xs">
                        Total {(viewingRecipe.prep_time_minutes || 0) + (viewingRecipe.cook_time_minutes || 0)} min
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">{viewingRecipe.servings} servings</p>
                  </div>
                </div>
              </div>
              
              {/* Macros Card */}
              <Card className="p-4 bg-muted/30">
                <p className="text-xs font-display tracking-wide text-muted-foreground mb-2">PER SERVING</p>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="font-display text-lg text-primary">{viewingRecipe.calories_per_serving}</p>
                    <p className="text-xs text-muted-foreground">kcal</p>
                  </div>
                  <div>
                    <p className="font-display text-lg text-primary">{viewingRecipe.protein_g || 0}g</p>
                    <p className="text-xs text-muted-foreground">Protein</p>
                  </div>
                  <div>
                    <p className="font-display text-lg text-primary">{viewingRecipe.carbs_g || 0}g</p>
                    <p className="text-xs text-muted-foreground">Carbs</p>
                  </div>
                  <div>
                    <p className="font-display text-lg text-primary">{viewingRecipe.fat_g || 0}g</p>
                    <p className="text-xs text-muted-foreground">Fat</p>
                  </div>
                </div>
              </Card>

              {/* Ingredients */}
              {recipeIngredients && recipeIngredients.length > 0 && (
                <div>
                  <h4 className="font-display tracking-wide mb-3">INGREDIENTS</h4>
                  <div className="space-y-2">
                    {recipeIngredients.map((ing) => (
                      <div key={ing.id} className="flex items-center justify-between text-sm border-b border-border/50 pb-2">
                        <div>
                          <span className="font-medium">{ing.name}</span>
                          {ing.quantity && ing.unit && (
                            <span className="text-muted-foreground ml-2">{ing.quantity} {ing.unit}</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex gap-3">
                          {ing.calories != null && <span>{ing.calories} kcal</span>}
                          {ing.protein_g != null && <span>P:{ing.protein_g}g</span>}
                          {ing.carbs_g != null && <span>C:{ing.carbs_g}g</span>}
                          {ing.fat_g != null && <span>F:{ing.fat_g}g</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions */}
              {viewingRecipe.instructions && (
                <div>
                  <h4 className="font-display tracking-wide mb-2">INSTRUCTIONS</h4>
                  <div className="space-y-2">
                    {viewingRecipe.instructions.split('\n').filter(Boolean).map((step, i) => (
                      <div key={i} className="flex gap-3 text-sm">
                        <span className="font-display text-primary shrink-0 w-6">{i + 1}.</span>
                        <span className="text-muted-foreground">{step.replace(/^\d+\.\s*/, '')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Dietary Tags */}
              {viewingRecipe.dietary_tags && viewingRecipe.dietary_tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {viewingRecipe.dietary_tags.map((tag) => (
                    <Badge key={tag} variant="secondary" title={DIETARY_TAG_MAP[tag] || tag}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button 
                  className="flex-1 font-display tracking-wide"
                  onClick={() => handleLogMeal(viewingRecipe)}
                >
                  <Flame className="w-4 h-4 mr-2" />
                  LOG THIS MEAL
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
