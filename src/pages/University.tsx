import { useState } from 'react';
import { motion } from 'framer-motion';
import { MainNavigation } from '@/components/MainNavigation';
import { UnifiedFooter } from '@/components/UnifiedFooter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Flame, BookOpen, Dumbbell, Brain, Apple, Download, FileText, UtensilsCrossed, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';
import unbreakableShield from '@/assets/unbreakable-shield.png';

const EBOOK_STORAGE_URL = `https://beqcnuqfxgghscbpxuxb.supabase.co/storage/v1/object/public/university-downloads/unbreakable-recipe-book.pdf`;

export default function University() {
  const { user } = useAuth();
  const { isDev, isCoach } = useUserRole();
  const [generating, setGenerating] = useState(false);

  const handleGenerateEbook = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-recipe-ebook');
      if (error) throw error;
      toast.success(`eBook generated! ${data.recipe_count} recipes, ${data.pages} pages.`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate eBook');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />

      {/* Hero */}
      <section className="pt-24 pb-16 md:pt-28 md:pb-20 border-b border-primary/20">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wide leading-none">
              <span className="text-primary neon-glow-subtle">UNBREAKABLE </span>
              <span className="text-foreground">UNIVERSITY</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Master the science behind the strength. Learn the principles that make you{' '}
              <span className="text-primary font-semibold">UNBREAKABLE</span> — from programming fundamentals
              to nutrition strategy, mindset conditioning, and beyond. Keep showing up.
            </p>
            <p className="text-primary font-display text-2xl tracking-wider neon-glow-subtle">
              #UNBREAKABLEUNIVERSITY
            </p>
          </motion.div>
        </div>
      </section>

      {/* Downloads Section */}
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto space-y-16">

          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-center space-y-2"
          >
            <h2 className="font-display text-3xl md:text-4xl tracking-wider">
              <span className="text-primary neon-glow-subtle">DOWNLOADS</span>
            </h2>
            <p className="text-muted-foreground">Free resources to fuel your journey</p>
          </motion.div>

          {/* Recipe eBook Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-2 border-primary/30 neon-border-subtle overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-[0_0_30px_hsl(var(--primary)/0.15)]">
              <div className="flex flex-col md:flex-row">
                {/* Left – visual */}
                <div className="md:w-1/3 bg-gradient-to-b from-primary/20 to-primary/5 flex flex-col items-center justify-center p-8 md:p-10 border-b md:border-b-0 md:border-r border-primary/20">
                  <img
                    src={unbreakableShield}
                    alt="Unbreakable shield logo"
                    className="w-28 h-28 md:w-32 md:h-32 object-contain mb-4 drop-shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
                  />
                  <p className="font-display text-primary text-lg tracking-wider neon-glow-subtle">
                    RECIPE BOOK
                  </p>
                </div>

                {/* Right – info */}
                <div className="flex-1 p-8 md:p-10 space-y-6">
                  <div>
                    <h3 className="font-display text-2xl md:text-3xl tracking-wide text-foreground">
                      UNBREAKABLE <span className="text-primary neon-glow-subtle">RECIPE BOOK</span>
                    </h3>
                    <p className="text-primary font-display text-sm tracking-widest mt-1">
                      FUEL YOUR RESULTS
                    </p>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">
                    198 high-protein recipes with full macro breakdowns. Categorised by meal type —
                    Breakfast, Lunch, Mains, Snacks, Desserts &amp; Shakes. Your complete nutrition playbook.
                  </p>

                  <p className="text-xs text-muted-foreground/70 italic">
                    All calorie &amp; macro values are reference estimates. For bespoke tracking,
                    scan your ingredients via the Store Cupboard in Fuel Planning for personalised accuracy.
                  </p>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-3">
                    {[
                      { icon: UtensilsCrossed, label: '198 Recipes' },
                      { icon: BookOpen, label: '7 Categories' },
                      { icon: FileText, label: 'Full Macros' },
                    ].map((stat) => (
                      <span
                        key={stat.label}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15 text-primary text-xs font-display tracking-wider border border-primary/20"
                      >
                        <stat.icon className="w-3.5 h-3.5" />
                        {stat.label}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Button
                      size="lg"
                      className="font-display tracking-wide gap-2"
                      asChild
                    >
                      <a href={EBOOK_STORAGE_URL} target="_blank" rel="noopener noreferrer">
                        <Download className="w-5 h-5" />
                        DOWNLOAD PDF
                      </a>
                    </Button>

                    {(isDev || isCoach) && (
                      <Button
                        variant="outline"
                        size="lg"
                        className="font-display tracking-wide gap-2 border-primary/30 text-primary"
                        onClick={handleGenerateEbook}
                        disabled={generating}
                      >
                        {generating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Flame className="w-4 h-4" />
                        )}
                        {generating ? 'GENERATING...' : 'REGENERATE'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Coming Soon – Other Categories */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="font-display text-2xl tracking-wider text-foreground">
                <span className="text-primary neon-glow-subtle">MORE</span> COMING SOON
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: Dumbbell, label: 'TRAINING SCIENCE', desc: 'Programming principles & periodisation' },
                { icon: Apple, label: 'NUTRITION MASTERY', desc: 'Fuel strategies & body composition' },
                { icon: Brain, label: 'MINDSET CONDITIONING', desc: 'Mental resilience & focus' },
                { icon: BookOpen, label: 'EXERCISE TECHNIQUE', desc: 'Movement mastery & injury prevention' },
              ].map((cat) => (
                <Card key={cat.label} className="p-5 border border-primary/20 bg-primary/5">
                  <cat.icon className="w-6 h-6 text-primary mb-2" />
                  <p className="font-display text-sm tracking-wider text-foreground">{cat.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{cat.desc}</p>
                </Card>
              ))}
            </div>

            <p className="text-center text-primary font-display text-xl tracking-wider neon-glow-subtle pt-4">
              KEEP SHOWING UP.
            </p>
          </motion.div>

        </div>
      </main>

      <UnifiedFooter className="mt-auto" />
    </div>
  );
}
