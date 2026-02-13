import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Search,
  Plus,
  ChevronDown,
  Lightbulb,
  MessageCircle,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  EXERCISE_LIBRARY,
  getExercisesByBodyPart,
  searchExercises,
  LibraryExercise,
  BodyPart,
} from '@/lib/exerciseLibrary';
import { BodyPartIcon, BODY_PART_ICONS } from './BodyPartIcon';
import { cn } from '@/lib/utils';
import { findCoachingDataByName } from '@/lib/exerciseCoachingData';
import { ExerciseCoachingPanel } from './ExerciseCoachingPanel';

interface InlineExerciseLibraryProps {
  onSelectExercise: (exercise: LibraryExercise) => void;
  onClose?: () => void;
  className?: string;
}

export function InlineExerciseLibrary({
  onSelectExercise,
  onClose,
  className,
}: InlineExerciseLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | 'all'>('all');
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  const filteredExercises = useMemo(() => {
    let exercises = EXERCISE_LIBRARY;

    if (searchQuery) {
      exercises = searchExercises(searchQuery);
    } else if (selectedBodyPart !== 'all') {
      exercises = getExercisesByBodyPart(selectedBodyPart);
    }

    return exercises;
  }, [searchQuery, selectedBodyPart]);

  // Group exercises by body part for sticky headers
  const groupedExercises = useMemo(() => {
    if (selectedBodyPart !== 'all' || searchQuery) {
      return { [selectedBodyPart === 'all' ? 'results' : selectedBodyPart]: filteredExercises };
    }
    
    const groups: Record<string, LibraryExercise[]> = {};
    BODY_PART_ICONS.forEach(({ value }) => {
      const exercises = filteredExercises.filter((ex) => ex.bodyPart === value);
      if (exercises.length > 0) {
        groups[value] = exercises;
      }
    });
    return groups;
  }, [filteredExercises, selectedBodyPart, searchQuery]);

  const handleSelect = useCallback((exercise: LibraryExercise) => {
    onSelectExercise(exercise);
  }, [onSelectExercise]);

  return (
    <div className={cn('flex flex-col border border-primary/30 rounded-lg bg-card overflow-hidden', className)}>
      {/* Header */}
      <div className="p-3 border-b border-border bg-primary/5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-display text-sm text-foreground flex items-center gap-2">
            <span className="text-primary">📚</span>
            EXERCISE LIBRARY
          </h4>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedBodyPart('all');
            }}
            className="pl-10 h-9 border-primary/40 focus:border-primary"
          />
        </div>

        {/* Body Part Tabs */}
        <div className="flex flex-wrap gap-1">
          <Button
            variant={selectedBodyPart === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedBodyPart('all');
              setSearchQuery('');
            }}
            className="h-7 text-xs"
          >
            All
          </Button>
          {BODY_PART_ICONS.map(({ value, label, Icon }) => (
            <Button
              key={value}
              variant={selectedBodyPart === value ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedBodyPart(value);
                setSearchQuery('');
              }}
              className={cn(
                'h-7 text-xs gap-1 px-2',
                selectedBodyPart === value && 'neon-border-subtle'
              )}
            >
              <Icon className="w-3 h-3" />
              <span className="hidden sm:inline">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Scrollable Exercise List */}
      <ScrollArea className="h-[300px] min-h-[200px]">
        <div className="p-2 space-y-1">
          {Object.entries(groupedExercises).map(([bodyPart, exercises]) => (
            <div key={bodyPart} className="mb-3">
              {/* Sticky Header */}
              {selectedBodyPart === 'all' && !searchQuery && (
                <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm py-1.5 px-1 mb-1.5 border-b border-primary/20">
                  <div className="flex items-center gap-2">
                    <BodyPartIcon bodyPart={bodyPart as BodyPart} size="sm" />
                    <span className="font-display text-xs text-primary uppercase tracking-wide">
                      {BODY_PART_ICONS.find(bp => bp.value === bodyPart)?.label || bodyPart}
                    </span>
                    <Badge variant="secondary" className="text-[10px] h-4">
                      {exercises.length}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Exercise Cards */}
              <div className="space-y-1">
                {exercises.map((exercise) => (
                  <Collapsible
                    key={exercise.id}
                    open={expandedExercise === exercise.id}
                    onOpenChange={(open) =>
                      setExpandedExercise(open ? exercise.id : null)
                    }
                  >
                    <div className="border border-border rounded-md overflow-hidden bg-card hover:border-primary/40 transition-colors">
                      <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <CollapsibleTrigger asChild>
                            <button className="flex items-center gap-2 flex-1 min-w-0 text-left">
                              <BodyPartIcon bodyPart={exercise.bodyPart} size="sm" showGlow={false} />
                              <div className="min-w-0">
                                <h5 className="font-medium text-xs truncate">{exercise.name}</h5>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Badge variant="outline" className="text-[9px] h-3.5 capitalize px-1">
                                    {exercise.equipment[0]}
                                  </Badge>
                                </div>
                              </div>
                              <ChevronDown
                                className={cn(
                                  'w-3 h-3 text-muted-foreground transition-transform shrink-0',
                                  expandedExercise === exercise.id && 'rotate-180'
                                )}
                              />
                            </button>
                          </CollapsibleTrigger>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSelect(exercise)}
                          className="gap-1 shrink-0 ml-2 h-6 text-xs px-2"
                        >
                          <Plus className="w-3 h-3" />
                          Add
                        </Button>
                      </div>

                      <CollapsibleContent>
                        <div className="px-2 pb-2 pt-0 border-t border-border mt-1 space-y-2">
                          <p className="text-xs text-muted-foreground pt-2">
                            {exercise.description}
                          </p>

                          {/* Full Coaching Panel or Fallback Tips */}
                          {(() => {
                            const coaching = findCoachingDataByName(exercise.name);
                            if (coaching) {
                              return (
                                <ExerciseCoachingPanel
                                  coachingData={coaching}
                                  exerciseName={exercise.name}
                                />
                              );
                            }
                            return (
                              <>
                                <div className="bg-surface/50 rounded p-2 border border-primary/10">
                                  <div className="flex items-center gap-1.5 text-primary text-xs font-medium mb-1">
                                    <Lightbulb className="w-3 h-3" />
                                    Tips
                                  </div>
                                  <ul className="text-xs text-muted-foreground space-y-0.5">
                                    {exercise.tips.slice(0, 2).map((tip, i) => (
                                      <li key={i}>• {tip}</li>
                                    ))}
                                  </ul>
                                </div>
                                <Link
                                  to={`/help?q=${encodeURIComponent(exercise.name)}`}
                                  className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  Coaching tips
                                </Link>
                              </>
                            );
                          })()}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            </div>
          ))}

          {filteredExercises.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-xs">
              No exercises found. Try a different search.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
