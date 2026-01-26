import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSavedFoods } from '@/hooks/useSavedFoods';
import { useFoodLogs } from '@/hooks/useFoodLogs';
import { useNutritionFeedback } from '@/hooks/useNutritionFeedback';
import { MealType, mealTypeLabels } from '@/lib/fuelTypes';
import { 
  Barcode, 
  Search, 
  Loader2,
  Flame,
  CheckCircle,
  MessageSquare,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  mealType?: MealType;
}

// Mock barcode database - in production, would use Open Food Facts API
const mockBarcodeDb: Record<string, {
  name: string;
  brand: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}> = {
  '5000112611793': {
    name: 'Skyr Natural',
    brand: 'Arla',
    servingSize: '150g',
    calories: 99,
    protein: 17,
    carbs: 6,
    fat: 0.2,
    sugar: 4,
  },
  '5010029215809': {
    name: 'Chicken Breast Fillets',
    brand: 'Tesco',
    servingSize: '100g',
    calories: 106,
    protein: 24,
    carbs: 0,
    fat: 1.1,
  },
  '5018374350114': {
    name: 'Rolled Oats',
    brand: 'Flahavans',
    servingSize: '40g',
    calories: 149,
    protein: 5,
    carbs: 26,
    fat: 3.2,
    fiber: 4,
  },
};

export function BarcodeScanner({ isOpen, onClose, mealType = 'snack' }: BarcodeScannerProps) {
  const { saveFood } = useSavedFoods();
  const { addFoodLog } = useFoodLogs();
  const { analyzeFood, isAnalyzing } = useNutritionFeedback();
  
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannedItem, setScannedItem] = useState<typeof mockBarcodeDb[string] | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealType>(mealType);

  const handleSearch = async () => {
    if (!barcodeInput.trim()) return;
    
    setIsSearching(true);
    setNotFound(false);
    setAnalysis(null);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const item = mockBarcodeDb[barcodeInput.trim()];
    
    if (item) {
      setScannedItem(item);
    } else {
      setNotFound(true);
      setScannedItem(null);
    }
    
    setIsSearching(false);
  };

  const handleGetFeedback = async () => {
    if (!scannedItem) return;
    
    const result = await analyzeFood('barcode', {
      name: `${scannedItem.brand} ${scannedItem.name}`,
      calories: scannedItem.calories,
      protein: scannedItem.protein,
      carbs: scannedItem.carbs,
      fat: scannedItem.fat,
      fiber: scannedItem.fiber,
      sugar: scannedItem.sugar,
      sodium: scannedItem.sodium,
      servingSize: scannedItem.servingSize,
    });
    
    if (result) {
      setAnalysis(result.analysis);
    }
  };

  const handleAddToLog = async () => {
    if (!scannedItem) return;
    
    await addFoodLog.mutateAsync({
      food_name: scannedItem.name,
      brand: scannedItem.brand,
      barcode: barcodeInput,
      serving_size: scannedItem.servingSize,
      calories: scannedItem.calories,
      protein_g: scannedItem.protein,
      carbs_g: scannedItem.carbs,
      fat_g: scannedItem.fat,
      fiber_g: scannedItem.fiber,
      sugar_g: scannedItem.sugar,
      sodium_mg: scannedItem.sodium,
      meal_type: selectedMeal,
      servings: 1,
      logged_at: new Date().toISOString(),
    });
    
    // Save to food library
    saveFood.mutate({
      food_name: scannedItem.name,
      brand: scannedItem.brand,
      barcode: barcodeInput,
      serving_size: scannedItem.servingSize,
      calories: scannedItem.calories,
      protein_g: scannedItem.protein,
      carbs_g: scannedItem.carbs,
      fat_g: scannedItem.fat,
      fiber_g: scannedItem.fiber,
      sugar_g: scannedItem.sugar,
      sodium_mg: scannedItem.sodium,
      is_favourite: false,
    });
    
    onClose();
  };

  const resetScanner = () => {
    setBarcodeInput('');
    setScannedItem(null);
    setAnalysis(null);
    setNotFound(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wide flex items-center gap-2">
            <Barcode className="w-5 h-5 text-primary" />
            SCAN BARCODE
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Barcode Input */}
          <div className="space-y-2">
            <Label>Enter Barcode Number</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., 5000112611793"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                onClick={handleSearch} 
                disabled={isSearching || !barcodeInput.trim()}
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Try: 5000112611793 (Skyr), 5010029215809 (Chicken), 5018374350114 (Oats)
            </p>
          </div>

          {/* Not Found Message */}
          <AnimatePresence>
            {notFound && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card className="border-destructive/50 bg-destructive/5">
                  <CardContent className="p-4 text-center">
                    <X className="w-8 h-8 text-destructive mx-auto mb-2" />
                    <p className="font-medium">Product not found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adding it manually in the Food Library
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scanned Item */}
          <AnimatePresence>
            {scannedItem && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <Card className="border-primary/50 bg-primary/5">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="secondary" className="mb-1">{scannedItem.brand}</Badge>
                        <CardTitle className="font-display text-lg">{scannedItem.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{scannedItem.servingSize}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-2xl text-primary">{scannedItem.calories}</p>
                        <p className="text-xs text-muted-foreground">kcal</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-2 bg-muted/30 rounded-lg">
                        <p className="font-display text-primary">{scannedItem.protein}g</p>
                        <p className="text-xs text-muted-foreground">Protein</p>
                      </div>
                      <div className="p-2 bg-muted/30 rounded-lg">
                        <p className="font-display text-primary">{scannedItem.carbs}g</p>
                        <p className="text-xs text-muted-foreground">Carbs</p>
                      </div>
                      <div className="p-2 bg-muted/30 rounded-lg">
                        <p className="font-display text-primary">{scannedItem.fat}g</p>
                        <p className="text-xs text-muted-foreground">Fat</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Meal Type Selection */}
                <div className="space-y-2">
                  <Label>Add to meal</Label>
                  <div className="flex flex-wrap gap-2">
                    {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((meal) => (
                      <Badge
                        key={meal}
                        variant={selectedMeal === meal ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setSelectedMeal(meal)}
                      >
                        {mealTypeLabels[meal]}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* AI Feedback Button */}
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleGetFeedback}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MessageSquare className="w-4 h-4" />
                  )}
                  GET COACH FEEDBACK
                </Button>

                {/* AI Analysis */}
                <AnimatePresence>
                  {analysis && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Card className="border-primary/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-display flex items-center gap-2">
                            <Flame className="w-4 h-4 text-primary" />
                            COACH ANALYSIS
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="max-h-48">
                            <div className="prose prose-sm dark:prose-invert">
                              <ReactMarkdown>{analysis}</ReactMarkdown>
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={resetScanner}>
                    Scan Another
                  </Button>
                  <Button 
                    className="flex-1 gap-2 font-display" 
                    onClick={handleAddToLog}
                    disabled={addFoodLog.isPending}
                  >
                    <CheckCircle className="w-4 h-4" />
                    ADD TO LOG
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
