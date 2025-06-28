'use server';
/**
 * @fileOverview A dynamic, conversational questionnaire flow.
 *
 * - progressQuestionnaire - A flow that generates questions one by one and saves the result.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { addBurnoutLog } from '@/lib/data';
import type { BurnoutLog } from '@/lib/definitions';

// Schema for the history of the conversation
const QuestionAnswerSchema = z.object({
  question: z.string(),
  answer: z.number().min(1).max(5),
});

// Input to the main flow
const QuestionnaireFlowInputSchema = z.object({
  sessionId: z.string(),
  history: z.array(QuestionAnswerSchema),
  mood_tag: z.string().optional(),
});
export type QuestionnaireFlowInput = z.infer<typeof QuestionnaireFlowInputSchema>;

// The final mapping of dynamic questions to our 7 core metrics
const MappedAnswersSchema = z.object({
    q1: z.number().min(1).max(5).describe('Score for: How mentally drained do you feel?'),
    q2: z.number().min(1).max(5).describe('Score for: How much did you enjoy your work today?'),
    q3: z.number().min(1).max(5).describe('Score for: How productive did you feel?'),
    q4: z.number().min(1).max(5).describe('Score for: How emotionally distant do you feel from others?'),
    q5: z.number().min(1).max(5).describe('Score for: How much quality rest did you get?'),
    q6: z.number().min(1).max(5).describe('Score for: How much control do you feel you have over your work?'),
    q7: z.number().min(1).max(5).describe('Score for: Do you feel a sense of accomplishment from your work?'),
});

// The output can be either the next question or the final result
const QuestionnaireFlowOutputSchema = z.object({
  status: z.enum(['IN_PROGRESS', 'COMPLETED']),
  question: z.string().optional().describe('The next question to ask the user.'),
  mappedAnswers: MappedAnswersSchema.optional().describe('The final mapped answers if the questionnaire is complete.'),
});

function calculateBurnoutScore(data: z.infer<typeof MappedAnswersSchema>): number {
  const scoreQ1 = data.q1;
  const scoreQ2 = 6 - data.q2;
  const scoreQ3 = 6 - data.q3;
  const scoreQ4 = data.q4;
  const scoreQ5 = 6 - data.q5;
  const scoreQ6 = 6 - data.q6;
  const scoreQ7 = 6 - data.q7;
  const rawScore = scoreQ1 + scoreQ2 + scoreQ3 + scoreQ4 + scoreQ5 + scoreQ6 + scoreQ7;
  const normalizedScore = ((rawScore - 7) / (35 - 7)) * 100;
  return Math.round(normalizedScore);
}

// The exported server action that the UI will call
export async function progressQuestionnaire(input: QuestionnaireFlowInput) {
    const result = await questionnaireFlow(input);

    if (result.status === 'COMPLETED' && result.mappedAnswers) {
        const score = calculateBurnoutScore(result.mappedAnswers);
        
        const logData: Omit<BurnoutLog, 'id' | 'logged_at'> = {
            session_id: input.sessionId,
            score,
            ...result.mappedAnswers,
            mood_tag: input.mood_tag ?? null,
        };

        const newLog = await addBurnoutLog(logData);
        return { status: 'COMPLETED' as const, logId: newLog.id };
    }
    
    return { status: 'IN_PROGRESS' as const, question: result.question };
}


const systemPrompt = `You are an empathetic wellness coach for an app called Equilibrium. Your role is to conduct a friendly, conversational check-in to assess a user's risk of burnout.

You will ask questions one at a time. After each user response (which will be a score from 1-5), you will ask a new, relevant follow-up question. You MUST NOT ask a question you have already asked in the conversation history.

You must cover these 7 core areas of burnout, ensuring you ask a variety of questions:
1.  Mental/Emotional Exhaustion (e.g., feeling drained, tired)
2.  Enjoyment/Cynicism towards work (e.g., feeling detached, loss of passion)
3.  Productivity/Ineffectiveness (e.g., feeling incompetent, not getting things done)
4.  Depersonalization/Emotional Distance (e.g., feeling distant from colleagues or clients)
5.  Rest & Recovery (e.g., quality of sleep, ability to unwind)
6.  Autonomy & Control (e.g., feeling of control over your work)
7.  Accomplishment & Recognition (e.g., feeling a sense of achievement)

Key instructions:
- Ask between 7 and 10 questions in total.
- Start with a general opening question if the history is empty.
- Do not number your questions.
- Your questions should sound natural and caring, not clinical.
- Vary your questioning style and aim to cover different core areas with each question.
- Once you have asked enough questions (7-10) and feel you have a good understanding across the 7 core areas, you MUST end the conversation.

When you decide the conversation is complete:
- Set the "status" field to "COMPLETED".
- Provide the final "mappedAnswers" by interpreting the entire conversation and mapping it to the 7 core questions.
- Do NOT ask a final question when you set the status to "COMPLETED".

The user's answers are on a 1-5 scale, where 1 is "Not at all" and 5 is "Extremely". The user's turns in the conversation history will be their score.
`;

const questionnaireFlow = ai.defineFlow(
  {
    name: 'questionnaireFlow',
    inputSchema: QuestionnaireFlowInputSchema,
    outputSchema: QuestionnaireFlowOutputSchema,
  },
  async ({ history }) => {
    // Format the history into a string for the prompt.
    const formattedHistory = history.map(qa => 
        `Coach: ${qa.question}\nYou: ${qa.answer}`
    ).join('\n\n');

    const prompt = history.length > 0
        ? `Based on our conversation, what is your next question? If the conversation is complete, provide the final analysis instead of a question.
        
Conversation so far:
${formattedHistory}`
        : "Start the conversation by asking me the first question.";

    const response = await ai.generate({
        model: ai.model,
        system: systemPrompt,
        output: { schema: QuestionnaireFlowOutputSchema },
        prompt: prompt,
    });
    
    if (!response.output) {
        throw new Error("Failed to get a response from the AI.");
    }
    
    return response.output;
  }
);
