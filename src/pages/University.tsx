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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto space-y-16">

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
