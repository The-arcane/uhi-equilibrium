import { getLogAndRecommendations } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import ScoreCircle from '@/components/score-circle';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, BarChart3, Quote } from 'lucide-react';

export default async function ResultPage({ params }: { params: { id: string } }) {
  const { log, level, recommendations } = await getLogAndRecommendations(params.id);

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="grid gap-8 lg:grid-cols-5">
        
        <div className="lg:col-span-2">
            <Card className="text-center shadow-lg sticky top-20">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">{level}</CardTitle>
                    <CardDescription>Your burnout score is</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center">
                    <ScoreCircle score={log.score} />
                    <p className="text-sm text-muted-foreground mt-4 max-w-md px-4">
                        This score is a snapshot of your current state. Use it as a guide, not a diagnosis.
                    </p>
                </CardContent>
                {log.mood_tag && (
                    <CardFooter className="flex-col gap-2 pt-4 border-t">
                        <p className="text-sm font-semibold text-muted-foreground">Your mood today:</p>
                        <div className="flex items-center gap-2">
                           <Quote className="w-4 h-4 text-muted-foreground" />
                           <p className="font-medium text-foreground italic">{log.mood_tag}</p>
                           <Quote className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </CardFooter>
                )}
            </Card>
        </div>

        <div className="lg:col-span-3">
            <div className="mb-8">
                <h2 className="text-3xl font-headline font-bold">Your Coping Strategies</h2>
                <p className="text-muted-foreground mt-1">Here are some AI-personalized suggestions to help you find balance.</p>
            </div>

            <div className="space-y-4">
              {recommendations.map((rec) => (
                <Card key={rec.title} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                    <div className="p-3 bg-accent/10 rounded-full">
                        <rec.icon className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">{rec.title}</CardTitle>
                        <CardDescription className="pt-1">{rec.description}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <div className="mt-8 text-center">
                <Button asChild variant="outline" className="shadow">
                    <Link href="/trend">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        View My 7-Day Trend
                    </Link>
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
