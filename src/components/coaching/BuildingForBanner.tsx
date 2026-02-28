import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { X, UserCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface BuildingForBannerProps {
  forUserId: string;
}

export function BuildingForBanner({ forUserId }: BuildingForBannerProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', forUserId)
        .maybeSingle();
      setProfile(data);
    };
    load();
  }, [forUserId]);

  const handleCancel = () => {
    const params = new URLSearchParams(location.search);
    params.delete('for');
    navigate(`${location.pathname}${params.toString() ? `?${params.toString()}` : ''}`, { replace: true });
  };

  if (!profile) return null;

  return (
    <div className="mb-4 flex items-center gap-3 rounded-lg border-2 border-primary/40 bg-primary/5 px-4 py-3">
      <UserCheck className="w-5 h-5 text-primary shrink-0" />
      <Avatar className="h-8 w-8">
        <AvatarImage src={profile.avatar_url || undefined} />
        <AvatarFallback className="font-display text-xs">
          {(profile.display_name || '?')[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="font-display text-sm tracking-wide text-foreground">
        BUILDING FOR <span className="text-primary">{profile.display_name || 'Athlete'}</span>
      </span>
      <Button variant="ghost" size="sm" onClick={handleCancel} className="ml-auto h-7 px-2 text-xs">
        <X className="w-3 h-3 mr-1" />
        Cancel
      </Button>
    </div>
  );
}
