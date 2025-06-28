'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/hooks/use-session';
import { getTrendData } from '@/lib/actions';
import TrendChart from '@/components/trend-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type TrendData = {
  date: string;
  score: number;
};

export default function TrendPage() {
  const { sessionId } = useSession();
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      setLoading(true);
      getTrendData(sessionId)
        .then((trendData) => {
          setData(trendData);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [sessionId]);

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Your 7-Day Trend</CardTitle>
          <CardDescription>
            This chart shows your burnout scores over the last week.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : data.length > 1 ? (
            <TrendChart data={data} />
          ) : (
            <div className="h-[350px] flex flex-col items-center justify-center text-center bg-muted/50 rounded-lg">
                <p className="text-lg font-medium">Not enough data to show a trend.</p>
                <p className="text-muted-foreground mt-2">Complete a few more daily check-ins to see your chart.</p>
                <Button asChild className="mt-4">
                    <Link href="/check">Complete a Check-In</Link>
                </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
