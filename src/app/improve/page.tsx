'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/hooks/use-session';
import { getImprovementPlan } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { ImprovementPlanOutput } from '@/ai/flows/get-improvement-plan-flow';
import { Sparkles, ClipboardCheck } from 'lucide-react';

export default function ImprovePage() {
  const { sessionId } = useSession();
  const [plan, setPlan] = useState<ImprovementPlanOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      setLoading(true);
      getImprovementPlan(sessionId)
        .then((result) => {
          if (result.error) {
            setError(result.error);
          } else {
            setPlan(result.plan ?? null);
          }
        })
        .catch(() => {
          setError('An unexpected error occurred while fetching your plan.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [sessionId]);

  const renderLoading = () => (
    <>
      <Card className="mb-8">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
      <Accordion type="multiple" className="w-full space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
             <AccordionItem value={`item-${i}`} className="border-b-0">
                <AccordionTrigger className="p-6 text-lg font-semibold">
                    <Skeleton className="h-6 w-1/2" />
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <div className="space-y-3 pt-4">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                        </div>
                    </div>
                </AccordionContent>
             </AccordionItem>
          </Card>
        ))}
      </Accordion>
    </>
  );

  const renderNoData = () => (
     <div className="h-[350px] flex flex-col items-center justify-center text-center bg-muted/50 rounded-lg p-8">
        <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-xl font-semibold">Start Your Journey to Improvement</p>
        <p className="text-muted-foreground mt-2 max-w-md">
            Complete a daily check-in, and we'll generate a personalized AI-powered action plan for you right here.
        </p>
        <Button asChild className="mt-6">
            <Link href="/check">Complete Your First Check-In</Link>
        </Button>
    </div>
  )

  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-headline font-bold">Your Improvement Plan</h1>
        <p className="text-muted-foreground mt-2">
          An AI-powered action plan to help you find balance and well-being.
        </p>
      </div>

      {loading && renderLoading()}
      
      {!loading && error && <p className="text-destructive text-center">{error}</p>}

      {!loading && !error && !plan && renderNoData()}

      {!loading && plan && (
        <>
            <Card className="mb-8 bg-primary/5 border-primary/20 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                        <Sparkles className="w-6 h-6 text-primary" />
                        A Path Forward
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-lg text-foreground/80">{plan.introduction}</p>
                </CardContent>
            </Card>

            <Accordion type="multiple" defaultValue={['item-0']} className="w-full space-y-4">
              {plan.strategies.map((strategy, index) => (
                <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
                    <AccordionItem value={`item-${index}`} className="border-b-0">
                        <AccordionTrigger className="p-6 text-xl font-semibold hover:no-underline">
                            <div className="flex items-center gap-3">
                                <ClipboardCheck className="w-6 h-6 text-accent" />
                                {strategy.title}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                            <div className="space-y-4">
                                <p className="text-muted-foreground italic border-l-2 border-accent pl-4">{strategy.rationale}</p>
                                <div className="space-y-3 pt-4">
                                    {strategy.checklist.map((item, checkIndex) => (
                                        <div key={checkIndex} className="flex items-center space-x-3 bg-muted/50 p-3 rounded-md">
                                            <Checkbox id={`check-${index}-${checkIndex}`} />
                                            <label htmlFor={`check-${index}-${checkIndex}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                {item.text}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Card>
              ))}
            </Accordion>
        </>
      )}
    </div>
  );
}
