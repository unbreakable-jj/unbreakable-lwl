import { useState, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shuffle, Loader2, Search, Dumbbell } from 'lucide-react';
import { getExerciseDetails, EXERCISE_LIBRARY, findExerciseByName } from '@/lib/exerciseLibrary';

interface ExerciseSwapSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseName: string;
  onSwap: (oldName: string, newExercise: { name: string; equipment: string }) => void;
  isSwapping?: boolean;
}

function getSmartSuggestions(exerciseName: string): Array<{ name: string; equipment: string; reason: string }> {
  const details = getExerciseDetails(exerciseName);
  const found = findExerciseByName(exerciseName);
  const suggestions: Array<{ name: string; equipment: string; reason: string }> = [];
  const addedNames = new Set<string>([exerciseName.toLowerCase()]);

  const addSuggestion = (name: string, equipment: string, reason: string) => {
    if (addedNames.has(name.toLowerCase())) return;
    addedNames.add(name.toLowerCase());
    suggestions.push({ name, equipment, reason });
  };

  // 1. Direct alternatives from the library
  if (details.exercise?.alternatives) {
    details.exercise.alternatives.forEach(alt => {
      const altEx = findExerciseByName(alt);
      addSuggestion(alt, altEx?.equipment?.[0] || 'bodyweight', 'Direct alternative — same movement pattern');
    });
  }

  // 2. Machine alternatives
  if (details.exercise?.machineAlternatives) {
    details.exercise.machineAlternatives.forEach(alt => {
      addSuggestion(alt, 'machine', 'Machine alternative — no spotter needed');
    });
  }

  // 3. Same body part & movement pattern
  if (found) {
    const samePart = EXERCISE_LIBRARY.filter(e =>
      e.bodyPart === found.bodyPart &&
      e.name !== exerciseName &&
      !addedNames.has(e.name.toLowerCase()) &&
      (found.movementPattern ? e.movementPattern === found.movementPattern : true)
    ).slice(0, 4);

    samePart.forEach(e => {
      addSuggestion(e.name, e.equipment[0], `Same muscle group (${e.bodyPart}) — ${e.equipment[0]}`);
    });
  }

  return suggestions.slice(0, 6);
}

export function ExerciseSwapSheet({
  open,
  onOpenChange,
  exerciseName,
  onSwap,
  isSwapping,
}: ExerciseSwapSheetProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const suggestions = useMemo(() => getSmartSuggestions(exerciseName), [exerciseName]);

  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return suggestions;
    const q = searchQuery.toLowerCase();
    return suggestions.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.equipment.toLowerCase().includes(q)
    );
  }, [suggestions, searchQuery]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="font-display tracking-wide flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-primary" />
            SWAP EXERCISE
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            Swap <span className="text-foreground font-medium">{exerciseName}</span> for an alternative:
          </p>
        </SheetHeader>

        <div className="space-y-4 pb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search alternatives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="max-h-[50vh]">
            <div className="space-y-2">
              {filteredSuggestions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No alternatives found. Try a different search.
                </p>
              )}
              {filteredSuggestions.map((suggestion) => (
                <Card
                  key={suggestion.name}
                  className="p-4 border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => !isSwapping && onSwap(exerciseName, { name: suggestion.name, equipment: suggestion.equipment })}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Dumbbell className="w-4 h-4 text-primary shrink-0" />
                        <h4 className="font-display text-sm text-foreground">
                          {suggestion.name}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.equipment}
                        </Badge>
                      </div>
                      <p className="text-xs text-primary italic">{suggestion.reason}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isSwapping}
                      className="shrink-0 gap-1 font-display tracking-wide"
                    >
                      {isSwapping ? <Loader2 className="w-3 h-3 animate-spin" /> : <Shuffle className="w-3 h-3" />}
                      SWAP
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
