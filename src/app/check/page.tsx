import Questionnaire from '@/components/questionnaire';

export default function CheckPage() {
  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-headline font-bold">Your Daily Check-In</h1>
        <p className="text-muted-foreground mt-2">
          Let's see how you're doing. This conversational check-in takes about a minute.
        </p>
      </div>
      <Questionnaire />
    </div>
  );
}
