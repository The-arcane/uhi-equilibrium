'use server';

import { redirect } from 'next/navigation';
import { getBurnoutLogById, getBurnoutLogsBySessionId } from '@/lib/data';
import type { Recommendation } from './definitions';
import { getAIRecommendations } from '@/ai/flows/get-recommendations-flow';
import { getAIImprovementPlan, type ImprovementPlanInput } from '@/ai/flows/get-improvement-plan-flow';
import { progressQuestionnaire as progressQuestionnaireFlow } from '@/ai/flows/questionnaire-flow';
import type { QuestionnaireFlowInput } from '@/ai/flows/questionnaire-flow';
import { BrainCircuit, Coffee, Bed, Smile, Leaf, Footprints, LucideIcon, AlertCircle } from 'lucide-react';

export async function progressQuestionnaire(input: QuestionnaireFlowInput) {
    // This function calls the new dynamic questionnaire flow, which handles all logic,
    // including data storage when the conversation is complete.
    return await progressQuestionnaireFlow(input);
}

// Map icon names from AI to actual Lucide components
const iconMap: { [key: string]: LucideIcon } = {
  Smile,
  Coffee,
  Leaf,
  Footprints,
  BrainCircuit,
  Bed,
};


export async function getLogAndRecommendations(id: string) {
    const log = await getBurnoutLogById(id);
    if (!log) {
        redirect('/check');
    }

    const { q1, q2, q3, q4, q5, q6, q7, score, mood_tag } = log;
    
    // Call the AI flow
    const aiResponse = await getAIRecommendations({
        score,
        answers: { q1, q2, q3, q4, q5, q6: q6 ?? undefined, q7: q7 ?? undefined },
        mood_tag: mood_tag || undefined
    });

    // Map AI recommendations to include the icon component
    const recommendations: Recommendation[] = aiResponse.recommendations.map(rec => ({
      ...rec,
      icon: iconMap[rec.iconName] || AlertCircle, // Use a fallback icon
    }));

    return { log, level: aiResponse.level, recommendations };
}


export async function getTrendData(sessionId: string) {
    if (!sessionId) return [];
    const logs = await getBurnoutLogsBySessionId(sessionId);
    const last7DaysLogs = logs.slice(0, 7);

    return last7DaysLogs.map(log => ({
        date: new Date(log.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: log.score
    })).reverse(); // reverse to show oldest to newest
}

export async function getImprovementPlan(sessionId:string) {
     if (!sessionId) {
        return { plan: null, error: 'Session ID is required.' };
    }
    const logs = await getBurnoutLogsBySessionId(sessionId);

    if (logs.length === 0) {
        // No logs yet, so no plan can be generated. This is not an error.
        return { plan: null, error: null };
    }
    
    const latestLog = logs[0]; // The logs are sorted by date descending

    const { q1, q2, q3, q4, q5, q6, q7, score } = latestLog;

    try {
        const planInput: ImprovementPlanInput = {
            score,
            answers: { q1, q2, q3, q4, q5, q6: q6 ?? undefined, q7: q7 ?? undefined },
        };
        const plan = await getAIImprovementPlan(planInput);
        return { plan, error: null };
    } catch (error) {
        console.error("Failed to generate improvement plan:", error);
        return { plan: null, error: "Sorry, we couldn't generate your improvement plan at this time. Please try again later."};
    }
}
