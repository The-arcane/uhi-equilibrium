'use server';
/**
 * @fileOverview An AI flow to generate burnout recommendations.
 *
 * - getAIRecommendations - A function that returns AI-driven analysis and recommendations.
 * - AIRecommendationsInput - The input type for the flow.
 * - AIRecommendationsOutput - The output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIRecommendationsInputSchema = z.object({
  score: z.number().describe('The calculated burnout score, from 0 to 100.'),
  answers: z.object({
    q1: z.number().describe('How mentally drained do you feel? (1-5)'),
    q2: z.number().describe('How much did you enjoy your work today? (1-5)'),
    q3: z.number().describe('How productive did you feel? (1-5)'),
    q4: z.number().describe('How emotionally distant do you feel from others? (1-5)'),
    q5: z.number().describe('How much quality rest did you get? (1-5)'),
    q6: z.number().optional().describe('How much control do you feel you have over your work? (1-5)'),
    q7: z.number().optional().describe('Do you feel a sense of accomplishment from your work? (1-5)'),
  }),
  mood_tag: z.string().optional().describe("A single word or short phrase describing the user's current mood, if they provided one."),
});
export type AIRecommendationsInput = z.infer<typeof AIRecommendationsInputSchema>;


const RecommendationSchema = z.object({
    iconName: z.string().describe("Name of a Lucide icon. Must be one of: 'Smile', 'Coffee', 'Leaf', 'Footprints', 'BrainCircuit', 'Bed'."),
    title: z.string().describe('A short, catchy title for the recommendation.'),
    description: z.string().describe('A concise, actionable description of the coping strategy.'),
});

const AIRecommendationsOutputSchema = z.object({
  level: z.string().describe("A short, encouraging assessment of the user's burnout level (e.g., 'In a Good Place', 'Mild Burnout Risk', 'High Burnout Risk')."),
  recommendations: z.array(RecommendationSchema).length(2).describe('An array of exactly two personalized coping strategies.'),
});
export type AIRecommendationsOutput = z.infer<typeof AIRecommendationsOutputSchema>;


export async function getAIRecommendations(input: AIRecommendationsInput): Promise<AIRecommendationsOutput> {
  return recommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getRecommendationsPrompt',
  input: {schema: AIRecommendationsInputSchema},
  output: {schema: AIRecommendationsOutputSchema},
  prompt: `You are a compassionate therapist specializing in workplace wellness and burnout prevention. Your tone is supportive, calm, and encouraging.

Analyze the user's burnout score and their answers to the following 5-point scale questions:
- q1: How mentally drained do you feel? (Higher is worse)
- q2: How much did you enjoy your work today? (Lower is worse)
- q3: How productive did you feel? (Lower is worse)
- q4: How emotionally distant do you feel from others? (Higher is worse)
- q5: How much quality rest did you get? (Lower is worse)
{{#if answers.q6}}- q6: How much control do you feel you have over your work? (Lower is worse){{/if}}
{{#if answers.q7}}- q7: Do you feel a sense of accomplishment from your work? (Lower is worse){{/if}}


User's Score: {{{score}}}
User's Answers:
- q1: {{{answers.q1}}}
- q2: {{{answers.q2}}}
- q3: {{{answers.q3}}}
- q4: {{{answers.q4}}}
- q5: {{{answers.q5}}}
{{#if answers.q6}}- q6: {{{answers.q6}}}{{/if}}
{{#if answers.q7}}- q7: {{{answers.q7}}}{{/if}}

{{#if mood_tag}}
User's Mood: {{{mood_tag}}}
Take this mood into account for your analysis and recommendations.
{{/if}}

Based on this data, provide a short, encouraging assessment of their burnout level (the 'level' field).

Then, generate two distinct, personalized, and actionable coping strategies ('recommendations' field). Each recommendation should have a title, a description, and an appropriate iconName from the allowed list.

For example, if rest (q5) is low, a good recommendation would be about sleep hygiene. If emotional distance (q4) is high, suggest connecting with someone. If control (q6) is low, suggest focusing on what you can control. If enjoyment (q2) is low, suggest a mindful break.

Do not sound like a robot. Be empathetic and provide genuine, helpful advice.`,
});

const recommendationsFlow = ai.defineFlow(
  {
    name: 'recommendationsFlow',
    inputSchema: AIRecommendationsInputSchema,
    outputSchema: AIRecommendationsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      return {
          level: "Analysis Complete",
          recommendations: [
              { iconName: 'Leaf', title: 'Take a mindful moment', description: 'Step away from your screen and take a few deep breaths. Focus on your senses.'},
              { iconName: 'Footprints', title: 'Stretch your legs', description: 'A short walk or a few stretches can help reset your mind and body.'}
          ]
      }
    }
    return output;
  }
);
