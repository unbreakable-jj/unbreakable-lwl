import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemedLogo } from '@/components/ThemedLogo';
import { ThemeToggle } from '@/components/hub/ThemeToggle';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { AuthModal } from '@/components/tracker/AuthModal';
import { NavigationDrawer } from '@/components/NavigationDrawer';
import {
  Calculator,
  Dumbbell,
  Flame,
  Timer,
  Footprints,
  UtensilsCrossed,
  BookOpen,
  Calendar,
  Apple,
  BarChart3,
  Brain,
  Heart,
  History,
  MessageCircle,
  GraduationCap,
  User,
  Shield,
  UserCheck,
} from 'lucide-react';

// All hub items consolidated into one dropdown
const COACHING_HUB_ITEMS = [
  { title: 'Strength Calculator', href: '/calculators?tab=strength', description: 'Calculate your 1RM and strength level', icon: Dumbbell, group: 'Calculators' },
  { title: 'Fuel Calculator', href: '/calculators?tab=fuel', description: 'Get your calorie and macro targets', icon: Flame, group: 'Calculators' },
  { title: 'Speed Calculator', href: '/calculators?tab=speed', description: 'Analyze your race times and pace', icon: Timer, group: 'Calculators' },
  { title: 'Power: Create', href: '/programming/create', description: 'Build a new programme', icon: Dumbbell, group: 'Power' },
  { title: 'Power: Library', href: '/programming/my-programmes', description: 'View saved programmes', icon: BookOpen, group: 'Power' },
  { title: 'Movement: Create', href: '/tracker/create', description: 'Build a cardio programme', icon: Footprints, group: 'Movement' },
  { title: 'Movement: Library', href: '/tracker/my-programmes', description: 'View saved programmes', icon: BookOpen, group: 'Movement' },
  { title: 'Food Tracker', href: '/fuel', description: 'Log meals and track nutrition', icon: UtensilsCrossed, group: 'Fuel' },
  { title: 'Recipes', href: '/fuel/recipes', description: 'Browse and save recipes', icon: BookOpen, group: 'Fuel' },
  { title: 'Meal Planning', href: '/fuel/planning', description: 'Build weekly meal plans', icon: Calendar, group: 'Fuel' },
  { title: 'Mindset', href: '/mindset', description: 'Mental conditioning', icon: Brain, group: 'Mindset' },
  { title: 'AI Coaching', href: '/help', description: 'Personalised guidance', icon: MessageCircle, group: 'Coaching' },
  { title: 'University', href: '/university', description: 'Learn the science', icon: GraduationCap, group: 'Learn' },
];

interface ListItemProps extends React.ComponentPropsWithoutRef<'a'> {
  title: string;
  icon?: React.ElementType;
  href: string;
}

const ListItem = ({ className, title, children, icon: Icon, href, ...props }: ListItemProps) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          to={href}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-primary" />}
            <div className="text-sm font-display tracking-wide leading-none">{title}</div>
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
};

export function MainNavigation() {
  const { user } = useAuth();
  const { role } = useUserRole();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();

  const isCoach = role === 'coach';
  const isDev = role === 'dev';

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href.split('?')[0]);
  };

  const hubActive = ['/calculators', '/programming', '/tracker', '/fuel', '/mindset', '/help', '/university']
    .some(p => location.pathname.startsWith(p));

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-primary/15">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Theme Toggle + Logo */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link to="/" className="flex items-center gap-3">
                <ThemedLogo />
                <span className="font-display text-lg tracking-wide text-foreground hidden md:block">
                  UNBREAKABLE
                </span>
              </Link>
            </div>

            {/* Center: Desktop Navigation */}
            <NavigationMenu className="hidden lg:flex">
              <NavigationMenuList>
                {/* COACHING HUB mega dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      'font-display tracking-wide text-sm',
                      hubActive && 'text-primary'
                    )}
                  >
                    COACHING HUB
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[500px] gap-2 p-4 md:w-[600px] md:grid-cols-3 lg:w-[700px]">
                      {COACHING_HUB_ITEMS.map((item) => (
                        <ListItem
                          key={item.title}
                          title={item.title}
                          href={item.href}
                          icon={item.icon}
                        >
                          {item.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* MY PROFILE */}
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/profile"
                      className={cn(
                        'inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-display tracking-wide transition-colors hover:bg-accent hover:text-accent-foreground',
                        isActive('/profile') && 'text-primary'
                      )}
                    >
                      MY PROFILE
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* COACH - for coach role */}
                {(isCoach || isDev) && (
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/coach"
                        className={cn(
                          'inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-display tracking-wide transition-colors hover:bg-accent hover:text-accent-foreground text-primary',
                          isActive('/coach') && 'bg-primary/10'
                        )}
                      >
                        COACH
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}

                {/* DEV - for dev role only */}
                {isDev && (
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/admin"
                        className={cn(
                          'inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-display tracking-wide transition-colors hover:bg-accent hover:text-accent-foreground',
                          isActive('/admin') ? 'bg-accent/50 text-accent-foreground' : 'text-muted-foreground'
                        )}
                      >
                        DEV
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>

            {/* Right: Auth + Mobile Menu */}
            <div className="flex items-center gap-3">
              {!user && (
                <Button
                  size="sm"
                  className="font-display tracking-wide hidden sm:inline-flex"
                  onClick={() => setShowAuthModal(true)}
                >
                  SIGN IN
                </Button>
              )}
              <NavigationDrawer />
            </div>
          </div>
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
