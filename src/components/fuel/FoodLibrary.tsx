import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSavedFoods } from '@/hooks/useSavedFoods';
import { 
  Search, 
  Star,
  Trash2,
  Barcode,
  Package,
  Apple,
  Plus
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export function FoodLibrary() {
  const { savedFoods, favourites, isLoading, saveFood, toggleFavourite, deleteFood } = useSavedFoods();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  const [newFood, setNewFood] = useState({
    food_name: '',
    brand: '',
    barcode: '',
    serving_size: '',
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
  });

  const getFilteredFoods = () => {
    let filtered = activeTab === 'favourites' ? favourites : savedFoods;

    if (searchQuery) {
      filtered = filtered?.filter((f) =>
        f.food_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.brand?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered || [];
  };

  const handleAddFood = async () => {
    if (!newFood.food_name || newFood.calories <= 0) return;
    
    await saveFood.mutateAsync({
      ...newFood,
      is_favourite: false,
    });
    
    setShowAddModal(false);
    setNewFood({
      food_name: '',
      brand: '',
      barcode: '',
      serving_size: '',
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredFoods = getFilteredFoods();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search foods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button className="font-display tracking-wide">
              <Plus className="w-4 h-4 mr-2" />
              ADD FOOD
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display tracking-wide">ADD CUSTOM FOOD</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <Label>Food Name *</Label>
                <Input
                  placeholder="e.g., Chicken breast"
                  value={newFood.food_name}
                  onChange={(e) => setNewFood({ ...newFood, food_name: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Brand (optional)</Label>
                  <Input
                    placeholder="e.g., Aldi"
                    value={newFood.brand}
                    onChange={(e) => setNewFood({ ...newFood, brand: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Serving Size</Label>
                  <Input
                    placeholder="e.g., 100g"
                    value={newFood.serving_size}
                    onChange={(e) => setNewFood({ ...newFood, serving_size: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Calories *</Label>
                  <Input
                    type="number"
                    min={0}
                    value={newFood.calories || ''}
                    onChange={(e) => setNewFood({ ...newFood, calories: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Protein (g)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={newFood.protein_g || ''}
                    onChange={(e) => setNewFood({ ...newFood, protein_g: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Carbs (g)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={newFood.carbs_g || ''}
                    onChange={(e) => setNewFood({ ...newFood, carbs_g: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Fat (g)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={newFood.fat_g || ''}
                    onChange={(e) => setNewFood({ ...newFood, fat_g: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              
              <Button 
                className="w-full font-display tracking-wide"
                onClick={handleAddFood}
                disabled={!newFood.food_name || newFood.calories <= 0 || saveFood.isPending}
              >
                ADD FOOD
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-xs">
          <TabsTrigger value="all">All Foods</TabsTrigger>
          <TabsTrigger value="favourites">Favourites</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-2">
            {filteredFoods.map((food) => (
              <motion.div
                key={food.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="hover:border-primary/50 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{food.food_name}</h3>
                          {food.brand && (
                            <Badge variant="secondary" className="text-xs">
                              {food.brand}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {food.serving_size && `${food.serving_size} · `}
                          P: {food.protein_g || 0}g | C: {food.carbs_g || 0}g | F: {food.fat_g || 0}g
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="font-display text-primary">{food.calories} kcal</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleFavourite.mutate(food.id)}
                        >
                          <Star className={`w-4 h-4 ${food.is_favourite ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => deleteFood.mutate(food.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredFoods.length === 0 && (
            <div className="text-center py-12">
              <Apple className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {activeTab === 'favourites' 
                  ? 'No favourite foods yet. Star foods to add them here.'
                  : 'No foods in your library. Start logging to build your database.'}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
