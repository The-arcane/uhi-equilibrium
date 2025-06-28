import type { LucideIcon } from 'lucide-react';

export type BurnoutLog = {
  id: string;
  session_id: string;
  score: number;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  q6: number | null;
  q7: number | null;
  logged_at: Date;
  mood_tag: string | null;
};

export type Recommendation = {
  icon: LucideIcon;
  title: string;
  description: string;
};
