'use client';

import { useEffect, useState } from 'react';

const ScoreCircle = ({ score }: { score: number }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate the progress bar on mount
    const timer = setTimeout(() => setProgress(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  let strokeColor = 'hsl(var(--accent))'; // Muted Teal for low scores
  if (score > 40) strokeColor = 'hsl(var(--chart-4))'; // Yellow for medium scores
  if (score > 70) strokeColor = 'hsl(var(--destructive))'; // Red for high scores

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-48 h-48" viewBox="0 0 140 140">
        <circle
          className="text-primary/20"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="70"
          cy="70"
        />
        <circle
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke={strokeColor}
          fill="transparent"
          r={radius}
          cx="70"
          cy="70"
          className="transition-all duration-1000 ease-out -rotate-90 origin-center"
        />
      </svg>
      <span className="absolute text-5xl font-bold font-headline text-foreground">
        {score}
      </span>
    </div>
  );
};

export default ScoreCircle;
