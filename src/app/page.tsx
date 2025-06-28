import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 text-center overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-20"
      >
        <div className="blur-[106px] h-56 bg-gradient-to-br from-primary to-purple-400 "></div>
        <div className="blur-[106px] h-32 bg-gradient-to-r from-cyan-400 to-accent"></div>
      </div>
       <div className="relative max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight text-foreground">
          Feeling tired or overwhelmed?
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-lg mx-auto">
          Take a 30-second check-in to understand your burnout level and get personalized tips to find your balance.
        </p>
        <div className="mt-10">
          <Button asChild size="lg" className="shadow-md hover:shadow-lg transition-shadow">
            <Link href="/check">
              Start Your Check-In <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
