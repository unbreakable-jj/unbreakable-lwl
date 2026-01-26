import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Edit3,
  ExternalLink,
  Dumbbell,
  UtensilsCrossed,
  Check,
  Calendar,
  Flame,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { GeneratedProgram, WorkoutDay } from '@/lib/programTypes';

type PlanType = 'programme' | 'meal_plan';

interface PlanDisplayCardProps {
  planType: PlanType;
  planData: GeneratedProgram | any;
  planId: string;
  savedToHub: boolean;
  onEdit: () => void;
  onViewInHub: () => void;
}

export function PlanDisplayCard({
  planType,
  planData,
  planId,
  savedToHub,
  onEdit,
  onViewInHub,
}: PlanDisplayCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const isProgramme = planType === 'programme';
  const Icon = isProgramme ? Dumbbell : UtensilsCrossed;
  const hubLabel = isProgramme ? 'My Programmes' : 'My Meal Plans';
  const navLabel = isProgramme ? 'POWER' : 'FUEL';

  const planName = planData.programName || planData.planName || 'Your Plan';
  const overview = planData.overview || planData.description || '';

  // Get summary stats
  const getSummary = () => {
    if (isProgramme) {
      const days = planData.templateWeek?.days || planData.weeks?.[0]?.days || [];
      const phases = planData.phases?.length || 3;
      return {
        primary: `${days.length} training days/week`,
        secondary: `${phases} phases over 12 weeks`,
      };
    } else {
      const days = planData.days?.length || 7;
      const avgCals = planData.weeklyCalories 
        ? Math.round(planData.weeklyCalories / 7) 
        : planData.days?.[0]?.totalCalories || 0;
      return {
        primary: `${days} days planned`,
        secondary: `~${avgCals.toLocaleString()} kcal/day`,
      };
    }
  };

  const summary = getSummary();

  return (
    <Card className="border-2 border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 neon-border-subtle">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center neon-glow shrink-0">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-primary" />
              <span className="text-xs font-display tracking-wide text-primary">
                YOUR {isProgramme ? 'PROGRAMME' : 'MEAL PLAN'} IS READY
              </span>
            </div>
            <h3 className="font-display text-lg tracking-wide text-foreground truncate">
              {planName}
            </h3>
          </div>
          {savedToHub && (
            <Badge variant="outline" className="shrink-0 border-primary/50 text-primary">
              <Check className="w-3 h-3 mr-1" />
              Saved
            </Badge>
          )}
        </div>

        {/* Overview */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {overview}
        </p>

        {/* Summary Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{summary.primary}</span>
          </div>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{summary.secondary}</span>
        </div>

        {/* Expandable Details */}
        <Collapsible open={showDetails} onOpenChange={setShowDetails}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between text-muted-foreground">
              <span>{showDetails ? 'Hide Details' : 'Show Details'}</span>
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="space-y-2 text-sm bg-muted/30 rounded-lg p-3">
              {isProgramme && planData.templateWeek?.days && (
                <>
                  <p className="font-medium text-foreground mb-2">Weekly Structure:</p>
                  {planData.templateWeek.days.map((day: WorkoutDay, idx: number) => (
                    <div key={idx} className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
                      <span className="text-primary font-medium">{day.day}</span>
                      <span className="text-muted-foreground">{day.sessionType}</span>
                    </div>
                  ))}
                </>
              )}
              {!isProgramme && planData.days && (
                <>
                  <p className="font-medium text-foreground mb-2">Daily Overview:</p>
                  {planData.days.slice(0, 3).map((day: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
                      <span className="text-primary font-medium">{day.dayName}</span>
                      <span className="text-muted-foreground">
                        {day.totalCalories} kcal • {day.totalProtein}g protein
                      </span>
                    </div>
                  ))}
                  {planData.days.length > 3 && (
                    <p className="text-muted-foreground text-center text-xs pt-1">
                      + {planData.days.length - 3} more days
                    </p>
                  )}
                </>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1 gap-2 border-primary/40 hover:border-primary"
            onClick={onEdit}
          >
            <Edit3 className="w-4 h-4" />
            EDIT PLAN
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={onViewInHub}
          >
            <ExternalLink className="w-4 h-4" />
            VIEW IN {navLabel}
          </Button>
        </div>

        {/* Hub Link Note */}
        <p className="text-xs text-muted-foreground text-center">
          Your plan is saved to <strong>{hubLabel}</strong> with status "Not Started"
        </p>
      </CardContent>
    </Card>
  );
}
