import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, Loader2, Users, Check } from 'lucide-react';
import { useUserSearch } from '@/hooks/useUserSearch';
import { useCoachingAssignments } from '@/hooks/useCoachingAssignments';
import { useAuth } from '@/hooks/useAuth';

export function ClientSearchPanel() {
  const { user } = useAuth();
  const { results, loading: searchLoading, searchUsers, clearResults } = useUserSearch();
  const { myAthletes, assignCoach } = useCoachingAssignments();
  const [query, setQuery] = useState('');

  const existingAthleteIds = new Set(myAthletes.map(a => a.athlete_id));

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.length >= 2) {
      searchUsers(value);
    } else {
      clearResults();
    }
  };

  const handleAddClient = async (athleteId: string) => {
    if (!user) return;
    await assignCoach(user.id, athleteId);
    clearResults();
    setQuery('');
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search users by name or username..."
          className="pl-10"
        />
      </div>

      {/* Search Results */}
      {searchLoading && (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="font-display text-xs tracking-wide text-muted-foreground">SEARCH RESULTS</p>
          {results.map(r => {
            const isAlreadyClient = existingAthleteIds.has(r.user_id);
            return (
              <Card key={r.user_id} className="border-border">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={r.avatar_url || undefined} />
                        <AvatarFallback className="font-display text-sm">
                          {(r.display_name || '?')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-display text-sm text-foreground">{r.display_name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">@{r.username || 'unknown'}</p>
                      </div>
                    </div>
                    {isAlreadyClient ? (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Check className="w-3 h-3" /> CLIENT
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleAddClient(r.user_id)}
                        className="font-display text-xs"
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        ADD CLIENT
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {query.length >= 2 && !searchLoading && results.length === 0 && (
        <div className="text-center py-8">
          <Users className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">No users found for "{query}"</p>
        </div>
      )}

      {/* Current Clients List */}
      {myAthletes.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-border">
          <p className="font-display text-xs tracking-wide text-muted-foreground">
            YOUR CLIENTS ({myAthletes.length})
          </p>
          {myAthletes.map(a => (
            <Card key={a.id} className="border-border">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={a.athlete_profile?.avatar_url || undefined} />
                    <AvatarFallback className="font-display text-sm">
                      {(a.athlete_profile?.display_name || '?')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-display text-sm text-foreground">{a.athlete_profile?.display_name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">@{a.athlete_profile?.username || 'unknown'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
