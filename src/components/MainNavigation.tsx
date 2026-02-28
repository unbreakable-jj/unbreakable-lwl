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
} from 'lucide-react';

// Navigation structure based on current site content
const NAV_STRUCTURE = [
  {
    title: 'CALCULATORS',
    href: '/calculators',
    items: [
      { 
        title: 'Strength Calculator', 
        href: '/calculators?tab=strength', 
        description: 'Calculate your 1RM and strength level',
        icon: Dumbbell 
      },
      { 
        title: 'Fuel Calculator', 
        href: '/calculators?tab=fuel', 
        description: 'Get your calorie and macro targets',
        icon: Flame 
      },
      { 
        title: 'Speed Calculator', 
        href: '/calculators?tab=speed', 
        description: 'Analyze your race times and pace',
        icon: Timer 
      },
    ],
  },
  {
    title: 'POWER',
    href: '/programming',
    items: [
      { 
        title: 'Create', 
        href: '/programming/create', 
        description: 'Build a new programme with Auto or Manual builder',
        icon: Dumbbell 
      },
      { 
        title: 'Library', 
        href: '/programming/my-programmes', 
        description: 'View saved programmes, track progress, and log workouts',
        icon: BookOpen 
      },
    ],
  },
  {
    title: 'MOVEMENT',
    href: '/tracker',
    items: [
      { 
        title: 'Create', 
        href: '/tracker/create', 
        description: 'Build a new cardio programme',
        icon: Footprints 
      },
      { 
        title: 'Library', 
        href: '/tracker/my-programmes', 
        description: 'View saved programmes and activity logs',
        icon: BookOpen 
      },
    ],
  },
  {
    title: 'FUEL',
    href: '/fuel',
    items: [
      { 
        title: 'Food Tracker', 
        href: '/fuel', 
        description: 'Log meals and track daily nutrition',
        icon: UtensilsCrossed 
      },
      { 
        title: 'Nutrition History', 
        href: '/fuel/history', 
        description: 'View past nutrition logs',
        icon: History 
      },
      { 
        title: 'Recipe Library', 
        href: '/fuel/recipes', 
        description: 'Browse and save recipes',
        icon: BookOpen 
      },
      { 
        title: 'Meal Planning', 
        href: '/fuel/planning', 
        description: 'Build weekly meal plans',
        icon: Calendar 
      },
      { 
        title: 'Food Library', 
        href: '/fuel/foods', 
        description: 'Manage saved foods',
        icon: Apple 
      },
      { 
        title: 'My Fuel', 
        href: '/fuel/my-fuel', 
        description: 'Goals and progress overview',
        icon: BarChart3 
      },
    ],
  },
  {
    title: 'MINDSET',
    href: '/mindset',
    items: [
      { 
        title: 'Breathing Exercises', 
        href: '/mindset', 
        description: 'Mental conditioning through controlled breathing',
        icon: Heart 
      },
    ],
  },
  {
    title: 'COACHING',
    href: '/help',
    highlight: true,
    items: [
      { 
        title: 'Ask Your Coach', 
        href: '/help', 
        description: 'Get personalised guidance on training, nutrition, and mindset',
        icon: MessageCircle 
      },
    ],
  },
  {
    title: 'UNIVERSITY',
    href: '/university',
    items: [
      { 
        title: 'Unbreakable University', 
        href: '/university', 
        description: 'Learn the science behind the strength — coming soon',
        icon: GraduationCap 
      },
    ],
  },
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href.split('?')[0]);
  };

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
                {NAV_STRUCTURE.map((section) => (
                  <NavigationMenuItem key={section.title}>
                    <NavigationMenuTrigger 
                      className={cn(
                        'font-display tracking-wide text-sm',
                        isActive(section.href) && 'text-primary',
                        section.highlight && 'text-primary'
                      )}
                    >
                      {section.title}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        {section.items.map((item) => (
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
                ))}
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
