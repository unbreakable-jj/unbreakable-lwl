import trademarkBadge from '@/assets/trademark-badge.png';

interface UnifiedFooterProps {
  className?: string;
}

export function UnifiedFooter({ className = '' }: UnifiedFooterProps) {
  return (
    <footer className={`border-t border-border bg-card py-6 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <img 
            src={trademarkBadge} 
            alt="Unbreakable Badge" 
            className="h-8 object-contain logo-neon-glow"
          />
          <p className="text-sm text-muted-foreground text-center">
            © 2025 Unbreakable. Live Without Limits LTD. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
