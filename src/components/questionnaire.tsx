'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { useToast } from '@/hooks/use-toast';
import { progressQuestionnaire } from '@/lib/actions';

import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowRight } from 'lucide-react';
import { Progress } from './ui/progress';


type QuestionAnswer = {
  question: string;
  answer: number;
};

const labels = ['1 (Not at all)', '2', '3', '4', '5 (Extremely)'];

export default function Questionnaire() {
  const { sessionId } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [history, setHistory] = useState<QuestionAnswer[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [isIntroStep, setIsIntroStep] = useState(true);
  const [moodTag, setMoodTag] = useState('');
  
  const progressPercentage = Math.min(((history.length) / 8) * 100, 100);

  // Fetch the first question
  useEffect(() => {
    if (!sessionId || isIntroStep) return;

    startTransition(async () => {
      try {
        const result = await progressQuestionnaire({ sessionId, history, mood_tag: moodTag });
        if (result.status === 'IN_PROGRESS' && result.question) {
          setCurrentQuestion(result.question);
        } else {
            toast({ title: 'Error', description: 'Could not start the questionnaire.', variant: 'destructive' });
        }
      } catch (error) {
        toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, isIntroStep]);


  const handleStart = () => {
    setIsIntroStep(false);
  }

  const handleNextQuestion = () => {
    if (!sessionId || !currentQuestion || !currentAnswer) {
      toast({ title: 'Please select an answer', variant: 'destructive' });
      return;
    }

    const newHistory: QuestionAnswer[] = [...history, { question: currentQuestion, answer: parseInt(currentAnswer, 10) }];
    setHistory(newHistory);
    setCurrentAnswer('');
    setCurrentQuestion(null); // Show loader while fetching next

    startTransition(async () => {
      try {
        const result = await progressQuestionnaire({ sessionId, history: newHistory, mood_tag: moodTag });

        if (result.status === 'IN_PROGRESS' && result.question) {
          setCurrentQuestion(result.question);
        } else if (result.status === 'COMPLETED' && result.logId) {
          router.push(`/result/${result.logId}`);
        } else {
          toast({ title: 'Error', description: 'Could not get the next question.', variant: 'destructive' });
          // Potentially add a retry button here
        }
      } catch (error) {
        console.error(error);
        toast({ title: 'Error', description: 'An unexpected error occurred while processing your answer.', variant: 'destructive' });
      }
    });
  };

  if (isIntroStep) {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>A Quick Check-In</CardTitle>
                <CardDescription>
                   Answer a few short questions to get a snapshot of your well-being.
                   It's fully conversational and takes about a minute.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Separator />
                <div className="space-y-2">
                    <Label htmlFor="mood-tag" className="text-base font-semibold">One more thing... (Optional)</Label>
                    <p className="text-sm text-muted-foreground">In one or two words, how are you feeling today? (e.g., "Optimistic", "Stressed")</p>
                    <Input 
                        id="mood-tag"
                        placeholder="I'm feeling..." 
                        value={moodTag}
                        onChange={(e) => setMoodTag(e.target.value)}
                    />
                </div>
                <Button onClick={handleStart} className="w-full" size="lg">
                    Start Check-In <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="w-full">
        <CardHeader>
             <Progress value={progressPercentage} className="mb-4" />
             <CardTitle>Conversational Check-In</CardTitle>
        </CardHeader>
        <CardContent className="p-6 min-h-[300px] flex flex-col justify-center">
            {isPending && !currentQuestion ? (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Thinking of the next question...</p>
                </div>
            ) : currentQuestion ? (
                <div className="space-y-6">
                    <p className="text-center text-xl font-semibold">{currentQuestion}</p>
                    <RadioGroup
                      onValueChange={setCurrentAnswer}
                      value={currentAnswer}
                      className="flex justify-between items-center pt-2 max-w-sm mx-auto"
                    >
                      {labels.map((label, i) => (
                        <div key={i} className="flex flex-col items-center space-y-2">
                           <RadioGroupItem value={`${i + 1}`} id={`r${i}`} />
                           <Label htmlFor={`r${i}`} className="font-normal text-xs text-muted-foreground">{label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                    <div className="flex justify-end pt-4">
                        <Button onClick={handleNextQuestion} disabled={isPending || !currentAnswer}>
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Next
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ) : null }
        </CardContent>
    </Card>
  );
}
