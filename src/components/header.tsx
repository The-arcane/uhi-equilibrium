import Link from 'next/link';
import { BarChart3, HeartPulse, Settings, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <HeartPulse className="h-6 w-6 text-accent" />
            <span className="font-bold font-headline text-xl">Equilibrium</span>
          </Link>
        </div>
        <nav className="flex flex-1 items-center justify-end space-x-1">
          <Button variant="ghost" asChild>
            <Link href="/check">
              Check-In
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/trend">
              <BarChart3 className="h-4 w-4 mr-2" />
              Trends
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/improve">
              <Sparkles className="h-4 w-4 mr-2" />
              Improve
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
