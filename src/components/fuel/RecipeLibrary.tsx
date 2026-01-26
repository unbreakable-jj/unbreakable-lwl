import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useRecipes } from '@/hooks/useRecipes';
import { Recipe, dietaryTagOptions } from '@/lib/fuelTypes';
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
  Trash2,
  Edit
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

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

export function RecipeLibrary() {
  const { recipes, myRecipes, publicRecipes, favouriteRecipes, isLoading, createRecipe, deleteRecipe, toggleFavourite } = useRecipes();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<RecipeFormData>(defaultFormData);
  const [activeTab, setActiveTab] = useState('all');
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);

  const getFilteredRecipes = () => {
    let filtered = activeTab === 'mine' ? myRecipes 
      : activeTab === 'favourites' ? favouriteRecipes 
      : activeTab === 'public' ? publicRecipes
      : recipes;

    if (searchQuery) {
      filtered = filtered?.filter((r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered?.filter((r) =>
        selectedTags.some((tag) => r.dietary_tags?.includes(tag))
      );
    }

    return filtered || [];
  };

  const handleCreateRecipe = async () => {
    await createRecipe.mutateAsync({
      ...formData,
      is_favourite: false,
    });
    setShowCreateModal(false);
    setFormData(defaultFormData);
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
        
        <div className="flex gap-2">
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
                CREATE RECIPE
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

      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <p className="text-sm font-medium mb-2">Dietary Filters</p>
          <div className="flex flex-wrap gap-2">
            {dietaryTagOptions.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {tag}
                {selectedTags.includes(tag) && <X className="w-3 h-3 ml-1" />}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="mine">My Recipes</TabsTrigger>
          <TabsTrigger value="favourites">Favourites</TabsTrigger>
          <TabsTrigger value="public">Community</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecipes.map((recipe) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card 
                  className="cursor-pointer hover:border-primary/50 transition-all h-full"
                  onClick={() => setViewingRecipe(recipe)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-display text-lg tracking-wide line-clamp-1">{recipe.name}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 -mt-1 -mr-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavourite.mutate(recipe.id);
                        }}
                      >
                        <Star className={`w-4 h-4 ${recipe.is_favourite ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                      </Button>
                    </div>
                    
                    {recipe.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {recipe.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      {(recipe.prep_time_minutes || recipe.cook_time_minutes) && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {(recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)} min
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {recipe.servings} servings
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Flame className="w-4 h-4 text-primary" />
                        <span className="font-display text-primary">{recipe.calories_per_serving} kcal</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        P: {recipe.protein_g || 0}g | C: {recipe.carbs_g || 0}g | F: {recipe.fat_g || 0}g
                      </div>
                    </div>
                    
                    {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {recipe.dietary_tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {recipe.dietary_tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{recipe.dietary_tags.length - 3}
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
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowCreateModal(true)}
              >
                Create your first recipe
              </Button>
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
            
            <div className="space-y-4 mt-4">
              {viewingRecipe.description && (
                <p className="text-muted-foreground">{viewingRecipe.description}</p>
              )}
              
              <div className="flex items-center gap-6 text-sm">
                {(viewingRecipe.prep_time_minutes || viewingRecipe.cook_time_minutes) && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Total Time</p>
                      <p className="text-muted-foreground">
                        {(viewingRecipe.prep_time_minutes || 0) + (viewingRecipe.cook_time_minutes || 0)} min
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Servings</p>
                    <p className="text-muted-foreground">{viewingRecipe.servings}</p>
                  </div>
                </div>
              </div>
              
              <Card className="p-4 bg-muted/30">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="font-display text-lg text-primary">{viewingRecipe.calories_per_serving}</p>
                    <p className="text-xs text-muted-foreground">Calories</p>
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
              
              {viewingRecipe.instructions && (
                <div>
                  <h4 className="font-display tracking-wide mb-2">INSTRUCTIONS</h4>
                  <p className="text-muted-foreground whitespace-pre-line">{viewingRecipe.instructions}</p>
                </div>
              )}
              
              {viewingRecipe.dietary_tags && viewingRecipe.dietary_tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {viewingRecipe.dietary_tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
