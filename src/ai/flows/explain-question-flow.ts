'use server';
/**
 * @fileOverview An AI flow to explain questionnaire questions.
 *
 * - explainQuestion - A function that handles the question explanation process.
 * - ExplainQuestionInput - The input type for the explainQuestion function.
 * - ExplainQuestionOutput - The return type for the explainQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatMessageSchema = z.object({
    role: z.enum(['user', 'model']),
    text: z.string(),
});

const ExplainQuestionInputSchema = z.object({
  question: z.string().describe('The questionnaire question to explain.'),
  history: z.array(ChatMessageSchema).optional().describe('The chat history between the user and the model.'),
});
export type ExplainQuestionInput = z.infer<typeof ExplainQuestionInputSchema>;

const ExplainQuestionOutputSchema = z.object({
  explanation: z.string().describe('The AI-generated explanation or response.'),
});
export type ExplainQuestionOutput = z.infer<typeof ExplainQuestionOutputSchema>;

export async function explainQuestion(input: ExplainQuestionInput): Promise<ExplainQuestionOutput> {
  return explainQuestionFlow(input);
}

const explainQuestionFlow = ai.defineFlow(
  {
    name: 'explainQuestionFlow',
    inputSchema: ExplainQuestionInputSchema,
    outputSchema: ExplainQuestionOutputSchema,
  },
  async ({ question, history }) => {
    const systemPrompt = `You are a helpful and empathetic assistant in a mental wellness app called Equilibrium.
A user is asking for clarification on a questionnaire question about burnout.

Your task is to explain the question clearly and concisely, focusing on why it's relevant for assessing burnout.
If there is no chat history, provide an initial explanation for the question.
If there is a chat history, act as a chatbot and continue the conversation, answering the user's follow-up questions.

The question you are explaining is: "${question}"

Maintain a supportive and non-clinical tone. Keep your initial explanation to 2-3 sentences.
    `;

    const genkitHistory = (history || []).map(msg => ({
        role: msg.role,
        content: [{ text: msg.text }]
    }));
    
    // The `generate` function needs a prompt. If history is provided, the last message is the prompt.
    // If history is empty, we must provide an explicit prompt.
    const response = await ai.generate({
      model: ai.model,
      system: systemPrompt,
      ...(genkitHistory.length > 0 
          ? { history: genkitHistory } 
          : { prompt: "Please explain this question." }),
    });

    return { explanation: response.text! };
  }
);
