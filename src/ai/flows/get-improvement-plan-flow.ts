'use server';
/**
 * @fileOverview An AI flow to generate a personalized improvement plan.
 *
 * - getAIImprovementPlan - A function that returns an AI-driven improvement plan.
 * - ImprovementPlanInput - The input type for the flow.
 * - ImprovementPlanOutput - The output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImprovementPlanInputSchema = z.object({
  score: z.number().describe("The user's most recent burnout score (0-100)."),
  answers: z.object({
    q1: z.number().describe('How mentally drained do you feel? (1-5)'),
    q2: z.number().describe('How much did you enjoy your work today? (1-5)'),
    q3: z.number().describe('How productive did you feel? (1-5)'),
    q4: z.number().describe('How emotionally distant do you feel from others? (1-5)'),
    q5: z.number().describe('How much quality rest did you get? (1-5)'),
    q6: z.number().optional().describe('How much control do you feel you have over your work? (1-5)'),
    q7: z.number().optional().describe('Do you feel a sense of accomplishment from your work? (1-5)'),
  }),
});
export type ImprovementPlanInput = z.infer<typeof ImprovementPlanInputSchema>;

const ChecklistItemSchema = z.object({
  text: z.string().describe('A single, actionable checklist item.'),
});

const StrategySchema = z.object({
  title: z.string().describe('A short, encouraging title for the strategy.'),
  rationale: z.string().describe("A brief explanation of why this strategy is helpful based on the user's data."),
  checklist: z.array(ChecklistItemSchema).min(3).max(5).describe('An array of 3-5 actionable checklist items for this strategy.'),
});

const ImprovementPlanOutputSchema = z.object({
  introduction: z.string().describe("A brief, empathetic introduction to the plan, acknowledging the user's current state."),
  strategies: z.array(StrategySchema).length(3).describe('An array of exactly three distinct improvement strategies.'),
});
export type ImprovementPlanOutput = z.infer<typeof ImprovementPlanOutputSchema>;

export async function getAIImprovementPlan(input: ImprovementPlanInput): Promise<ImprovementPlanOutput> {
  return improvementPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getImprovementPlanPrompt',
  input: {schema: ImprovementPlanInputSchema},
  output: {schema: ImprovementPlanOutputSchema},
  prompt: `You are a world-class wellness coach and therapist creating a personalized action plan for a user of the Equilibrium app who is dealing with burnout. Your tone should be encouraging, empathetic, and highly practical.

Analyze the user's burnout score and their specific answers to the questionnaire. Based on their key problem areas, create a comprehensive improvement plan with three distinct strategies.

User's Score: {{{score}}}
User's Answers (1-5 scale):
- Mentally drained: {{{answers.q1}}} (Higher is worse)
- Enjoyment of work: {{{answers.q2}}} (Lower is worse)
- Productivity feeling: {{{answers.q3}}} (Lower is worse)
- Emotional distance: {{{answers.q4}}} (Higher is worse)
- Quality rest: {{{answers.q5}}} (Lower is worse)
{{#if answers.q6}}- Sense of control: {{{answers.q6}}} (Lower is worse){{/if}}
{{#if answers.q7}}- Sense of accomplishment: {{{answers.q7}}} (Lower is worse){{/if}}

First, write a brief, empathetic introduction that acknowledges their situation without being alarming.

Then, devise three unique strategies. For each strategy:
1.  Give it a short, encouraging title.
2.  Write a 'rationale' explaining WHY this strategy is important for them, directly linking it to their specific answers (e.g., "Because your rest score was low, focusing on sleep is crucial...").
3.  Create a checklist of 3-5 small, concrete, and actionable steps they can take. These should be easy to start. For example, instead of "Get more sleep," use "Set a 'bedtime' alarm for 10 PM." or "Avoid screens for 30 minutes before bed."

Focus on a holistic approach covering areas like stress management, setting boundaries, improving rest, reconnecting with values, and enhancing control over their work environment.
`,
});

const improvementPlanFlow = ai.defineFlow(
  {
    name: 'improvementPlanFlow',
    inputSchema: ImprovementPlanInputSchema,
    outputSchema: ImprovementPlanOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("Failed to generate an improvement plan.");
    }
    return output;
  }
);
