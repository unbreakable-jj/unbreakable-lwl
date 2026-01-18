import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { FuelResult } from '@/lib/fuelCalculations';
import { Flame, Zap, Wheat, Droplets } from 'lucide-react';

interface FuelResultsProps {
  result: FuelResult;
}

export function FuelResults({ result }: FuelResultsProps) {
  const totalMacroGrams = result.protein + result.carbs + result.fat;
  
  return (
    <div className="space-y-6">
      {/* Target Calories */}
      <Card className="bg-card border-primary">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Flame className="w-6 h-6 text-primary" />
            <span className="text-muted-foreground uppercase tracking-wide text-sm">Daily Calories</span>
          </div>
          <div className="font-display text-6xl text-primary tracking-wide">
            {result.targetCalories.toLocaleString()}
          </div>
          <p className="text-muted-foreground text-sm mt-2">calories per day</p>
        </CardContent>
      </Card>

      {/* Macro Breakdown */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h3 className="font-display text-2xl text-foreground mb-6 tracking-wide text-center">
            MACRO BREAKDOWN
          </h3>
          
          <div className="space-y-6">
            {/* Protein */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-red-500" />
                  <span className="font-medium">Protein</span>
                </div>
                <div className="text-right">
                  <span className="font-display text-2xl text-foreground">{result.protein}g</span>
                  <span className="text-muted-foreground ml-2 text-sm">{result.proteinPercent}%</span>
                </div>
              </div>
              <Progress value={result.proteinPercent} className="h-3 bg-muted [&>div]:bg-red-500" />
            </div>

            {/* Carbs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wheat className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">Carbohydrates</span>
                </div>
                <div className="text-right">
                  <span className="font-display text-2xl text-foreground">{result.carbs}g</span>
                  <span className="text-muted-foreground ml-2 text-sm">{result.carbPercent}%</span>
                </div>
              </div>
              <Progress value={result.carbPercent} className="h-3 bg-muted [&>div]:bg-yellow-500" />
            </div>

            {/* Fat */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Fat</span>
                </div>
                <div className="text-right">
                  <span className="font-display text-2xl text-foreground">{result.fat}g</span>
                  <span className="text-muted-foreground ml-2 text-sm">{result.fatPercent}%</span>
                </div>
              </div>
              <Progress value={result.fatPercent} className="h-3 bg-muted [&>div]:bg-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">BMR</p>
            <p className="font-display text-2xl text-foreground">{result.bmr.toLocaleString()}</p>
            <p className="text-muted-foreground text-xs">cal/day</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">TDEE</p>
            <p className="font-display text-2xl text-foreground">{result.tdee.toLocaleString()}</p>
            <p className="text-muted-foreground text-xs">cal/day</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Reference */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <p className="text-center text-sm text-muted-foreground">
            <span className="text-primary font-semibold">BMR</span> = Basal Metabolic Rate (calories at rest)
            <br />
            <span className="text-primary font-semibold">TDEE</span> = Total Daily Energy Expenditure
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
