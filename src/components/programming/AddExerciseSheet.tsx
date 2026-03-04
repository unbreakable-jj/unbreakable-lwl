import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Plus, Search, Dumbbell, Loader2 } from 'lucide-react';
import { EXERCISE_LIBRARY } from '@/lib/exerciseLibrary';

interface AddExerciseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExercise: (exercise: { name: string; equipment: string; sets: number; reps: string }) => void;
  isAdding?: boolean;
}

export function AddExerciseSheet({ open, onOpenChange, onAddExercise, isAdding }: AddExerciseSheetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [customName, setCustomName] = useState('');
  const [customSets, setCustomSets] = useState('3');
  const [customReps, setCustomReps] = useState('10');

  const filteredExercises = searchQuery.trim()
    ? EXERCISE_LIBRARY.filter(e =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.bodyPart.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.equipment.some(eq => eq.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 30)
    : [];

  const [librarySets, setLibrarySets] = useState<Record<string, string>>({});
  const [libraryReps, setLibraryReps] = useState<Record<string, string>>({});

  const handleLibrarySelect = (exercise: typeof EXERCISE_LIBRARY[0]) => {
    onAddExercise({
      name: exercise.name,
      equipment: exercise.equipment[0],
      sets: parseInt(librarySets[exercise.name]) || 3,
      reps: libraryReps[exercise.name] || '10',
    });
    setSearchQuery('');
    setLibrarySets({});
    setLibraryReps({});
  };

  const handleCustomAdd = () => {
    if (!customName.trim()) return;
    onAddExercise({
      name: customName.trim(),
      equipment: 'bodyweight',
      sets: parseInt(customSets) || 3,
      reps: customReps || '10',
    });
    setCustomName('');
    setCustomSets('3');
    setCustomReps('10');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[80vh] flex flex-col z-[60]">
        <SheetHeader className="pb-4 shrink-0">
          <SheetTitle className="font-display tracking-wide flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            ADD EXERCISE
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="library" className="flex-1 min-h-0 flex flex-col">
          <TabsList className="w-full shrink-0">
            <TabsTrigger value="library" className="flex-1 font-display text-xs tracking-wide gap-1">
              <Search className="w-3 h-3" />
              LIBRARY
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex-1 font-display text-xs tracking-wide gap-1">
              <Dumbbell className="w-3 h-3" />
              CUSTOM
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="flex-1 min-h-0 flex flex-col gap-3 mt-3">
            <div className="relative shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search 230+ exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex-1 min-h-0 max-h-[40vh] overflow-y-auto space-y-2 pb-4" style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
              {searchQuery.trim() === '' ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Start typing to search exercises
                </p>
              ) : filteredExercises.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No exercises found. Try the Custom tab.
                </p>
              ) : (
                filteredExercises.map((exercise) => (
                  <Card
                    key={exercise.name}
                    className="p-3 border border-border bg-card hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Dumbbell className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-sm font-display text-foreground truncate">{exercise.name}</span>
                        <Badge variant="outline" className="text-[10px] shrink-0">{exercise.bodyPart}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Input
                          type="number"
                          inputMode="numeric"
                          placeholder="Sets"
                          value={librarySets[exercise.name] || ''}
                          onChange={(e) => setLibrarySets(prev => ({ ...prev, [exercise.name]: e.target.value }))}
                          className="h-8 text-center text-xs"
                          min="1"
                          max="10"
                        />
                        <span className="text-[10px] text-muted-foreground text-center block">Sets</span>
                      </div>
                      <div className="flex-1">
                        <Input
                          placeholder="Reps"
                          value={libraryReps[exercise.name] || ''}
                          onChange={(e) => setLibraryReps(prev => ({ ...prev, [exercise.name]: e.target.value }))}
                          className="h-8 text-center text-xs"
                        />
                        <span className="text-[10px] text-muted-foreground text-center block">Reps</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isAdding}
                        onClick={() => !isAdding && handleLibrarySelect(exercise)}
                        className="shrink-0 gap-1 text-xs font-display h-8"
                      >
                        {isAdding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                        ADD
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="mt-3 space-y-4 pb-6">
            <div>
              <Label className="text-xs font-display tracking-wide">EXERCISE NAME</Label>
              <Input
                placeholder="e.g. Hammer Curls"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-display tracking-wide">SETS</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={customSets}
                  onChange={(e) => setCustomSets(e.target.value)}
                  className="mt-1"
                  min="1"
                  max="10"
                />
              </div>
              <div>
                <Label className="text-xs font-display tracking-wide">TARGET REPS</Label>
                <Input
                  placeholder="e.g. 10"
                  value={customReps}
                  onChange={(e) => setCustomReps(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <Button
              onClick={handleCustomAdd}
              disabled={!customName.trim() || isAdding}
              className="w-full gap-2 font-display tracking-wide"
            >
              {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              ADD TO SESSION
            </Button>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
