import { Link, useLocation } from 'react-router-dom';
import logo from '@/assets/logo.webp';
import { cn } from '@/lib/utils';

export function Header() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'STRENGTH' },
    { path: '/fuel', label: 'FUEL' },
    { path: '/speed', label: 'SPEED' },
  ];

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col items-center gap-4">
          <Link to="/">
            <img
              src={logo}
              alt="Live Without Limits"
              className="h-20 md:h-24 object-contain"
            />
          </Link>
          
          <nav className="flex gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-6 py-2 rounded-md font-display text-lg tracking-wide transition-colors",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
