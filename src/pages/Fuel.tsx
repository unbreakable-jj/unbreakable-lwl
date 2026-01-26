import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ThemedLogo } from '@/components/ThemedLogo';
import { Button } from '@/components/ui/button';
import { NavigationDrawer } from '@/components/NavigationDrawer';
import { UnifiedFooter } from '@/components/UnifiedFooter';
import { PageNavigation, SwipeNavigationWrapper } from '@/components/PageNavigation';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FoodTracker } from '@/components/fuel/FoodTracker';
import { RecipeLibrary } from '@/components/fuel/RecipeLibrary';
import { MealPlanning } from '@/components/fuel/MealPlanning';
import { FoodLibrary } from '@/components/fuel/FoodLibrary';
import { MyFuel } from '@/components/fuel/MyFuel';
import { NutritionHistoryView } from '@/components/fuel/NutritionHistoryView';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/tracker/AuthModal';
import { 
  Flame,
  UtensilsCrossed,
  BookOpen,
  Calendar,
  Apple,
  BarChart3,
  History,
  ArrowRight
} from 'lucide-react';

export default function Fuel() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('track');
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <SwipeNavigationWrapper>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3">
                <ThemedLogo />
                <div className="hidden sm:block">
                  <span className="font-display text-lg tracking-wide text-foreground">
                    UNBREAKABLE
                  </span>
                  <span className="font-display text-sm tracking-wide text-primary ml-2">
                    FUEL
                  </span>
                </div>
              </Link>
              <div className="flex items-center gap-3">
                {!user && (
                  <Button
                    className="font-display tracking-wide"
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

        {/* Page Navigation */}
        <PageNavigation />

        {/* Hero */}
        <section className="py-12 md:py-16 border-b border-border">
          <div className="container mx-auto px-4 text-center">
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-5xl sm:text-6xl md:text-8xl tracking-wide leading-none mb-2">
              <span className="text-foreground">FUEL YOUR </span>
              <span className="text-primary neon-glow-subtle">UNBREAKABLE</span>
              <span className="text-foreground"> BODY</span>
            </h1>
            <p className="text-primary font-display text-xl md:text-2xl tracking-wide mt-6 neon-glow-subtle">
              LIVE WITHOUT LIMITS
            </p>
            <p className="text-muted-foreground text-base md:text-lg mt-4 max-w-2xl mx-auto">
              Plan meals, track food, explore recipes, and stay consistent with nutrition that supports your training, recovery, and lifestyle.
            </p>
            <p className="text-primary font-display text-lg mt-3 neon-glow-subtle">KEEP SHOWING UP.</p>
          </motion.div>
        </div>
      </section>

      {/* Coach Banner */}
      <div className="container mx-auto px-4 py-6">
        <Link to="/help" className="block">
          <Card className="border-2 border-primary/40 bg-primary/5 p-4 hover:bg-primary/10 transition-all neon-border-subtle">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-display text-lg tracking-wide text-foreground">
                    NEED HELP? <span className="text-primary">ASK YOUR COACH</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Get personalised guidance on nutrition, meal timing, food choices, and more
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-primary hidden sm:block" />
            </div>
          </Card>
        </Link>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {user ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-6 w-full max-w-3xl mx-auto mb-8">
              <TabsTrigger value="track" className="flex flex-col sm:flex-row items-center gap-1 text-xs sm:text-sm">
                <UtensilsCrossed className="w-4 h-4" />
                <span className="hidden sm:inline">Track</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex flex-col sm:flex-row items-center gap-1 text-xs sm:text-sm">
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
              <TabsTrigger value="recipes" className="flex flex-col sm:flex-row items-center gap-1 text-xs sm:text-sm">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Recipes</span>
              </TabsTrigger>
              <TabsTrigger value="planning" className="flex flex-col sm:flex-row items-center gap-1 text-xs sm:text-sm">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Plan</span>
              </TabsTrigger>
              <TabsTrigger value="foods" className="flex flex-col sm:flex-row items-center gap-1 text-xs sm:text-sm">
                <Apple className="w-4 h-4" />
                <span className="hidden sm:inline">Foods</span>
              </TabsTrigger>
              <TabsTrigger value="myfuel" className="flex flex-col sm:flex-row items-center gap-1 text-xs sm:text-sm">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">My Fuel</span>
              </TabsTrigger>
            </TabsList>

            <div className="max-w-4xl mx-auto">
              <TabsContent value="track">
                <FoodTracker />
              </TabsContent>

              <TabsContent value="history">
                <NutritionHistoryView />
              </TabsContent>

              <TabsContent value="recipes">
                <RecipeLibrary />
              </TabsContent>

              <TabsContent value="planning">
                <MealPlanning />
              </TabsContent>

              <TabsContent value="foods">
                <FoodLibrary />
              </TabsContent>

              <TabsContent value="myfuel">
                <MyFuel />
              </TabsContent>
            </div>
          </Tabs>
        ) : (
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 text-center border-2 border-primary/30 neon-border-subtle">
              <Flame className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="font-display text-2xl tracking-wide mb-4">
                SIGN IN TO ACCESS FUEL
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Track your nutrition, build meal plans, save recipes, and monitor your progress toward your goals.
              </p>
              <Button 
                size="lg" 
                className="font-display tracking-wide"
                onClick={() => setShowAuthModal(true)}
              >
                GET STARTED
              </Button>
            </Card>

            {/* Feature Preview */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card className="p-6 text-center">
                <UtensilsCrossed className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-display text-lg tracking-wide mb-2">FOOD TRACKING</h3>
                <p className="text-sm text-muted-foreground">
                  Log meals, track macros, and monitor daily nutrition with an easy-to-use interface.
                </p>
              </Card>
              
              <Card className="p-6 text-center">
                <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-display text-lg tracking-wide mb-2">RECIPE LIBRARY</h3>
                <p className="text-sm text-muted-foreground">
                  Discover and save recipes with full macro breakdowns and cooking instructions.
                </p>
              </Card>
              
              <Card className="p-6 text-center">
                <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-display text-lg tracking-wide mb-2">MEAL PLANNING</h3>
                <p className="text-sm text-muted-foreground">
                  Build weekly meal plans to stay consistent and hit your nutrition targets.
                </p>
              </Card>
            </div>
          </div>
        )}
      </main>

        <UnifiedFooter className="mt-auto" />
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    </SwipeNavigationWrapper>
  );
}
