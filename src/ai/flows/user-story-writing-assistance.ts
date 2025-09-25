'use server';

/**
 * @fileOverview An AI agent that provides feedback on user story writing.
 *
 * - userStoryWritingAssistance - A function that analyzes a user story and provides suggestions.
 * - UserStoryWritingAssistanceInput - The input type for the userStoryWritingAssistance function.
 * - UserStoryWritingAssistanceOutput - The return type for the userStoryWritingAssistance function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const UserStoryWritingAssistanceInputSchema = z.object({
  userStory: z.string().describe('The user story text to be analyzed.'),
});
export type UserStoryWritingAssistanceInput = z.infer<
  typeof UserStoryWritingAssistanceInputSchema
>;

const SuggestionSchema = z.object({
    category: z.enum(["Clarity", "Completeness", "Format", "Grammar"]).describe("The category of the suggestion."),
    suggestion: z.string().describe("The specific suggestion for improvement.")
});

const UserStoryWritingAssistanceOutputSchema = z.object({
  overallFeedback: z.string().describe("A brief, overall assessment of the user story's quality."),
  suggestions: z.array(SuggestionSchema).describe('A list of suggestions to improve the user story.'),
});
export type UserStoryWritingAssistanceOutput = z.infer<
  typeof UserStoryWritingAssistanceOutputSchema
>;

export async function userStoryWritingAssistance(
  input: UserStoryWritingAssistanceInput
): Promise<UserStoryWritingAssistanceOutput> {
  return userStoryWritingAssistanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'userStoryWritingAssistancePrompt',
  input: { schema: UserStoryWritingAssistanceInputSchema },
  output: { schema: UserStoryWritingAssistanceOutputSchema },
  prompt: `You are an expert Agile coach specializing in writing high-quality user stories.
Your task is to analyze the provided user story and give constructive feedback.

Analyze the following user story:
"{{{userStory}}}"

Provide feedback based on these criteria:
1.  **Format**: Does it follow the standard "As a [type of user], I want [an action] so that [a benefit]" structure?
2.  **Clarity**: Is the story clear, concise, and unambiguous?
3.  **Completeness**: Is it testable? Does it contain enough information for a developer to start working on it? Avoid being overly prescriptive.
4.  **Grammar**: Check for any spelling or grammatical errors.

First, provide a brief, one-sentence overall assessment of the user story.
Then, provide a list of specific, actionable suggestions for improvement, each categorized as "Format", "Clarity", "Completeness", or "Grammar". If the story is perfect, return an empty suggestions array.
`,
});

const userStoryWritingAssistanceFlow = ai.defineFlow(
  {
    name: 'userStoryWritingAssistanceFlow',
    inputSchema: UserStoryWritingAssistanceInputSchema,
    outputSchema: UserStoryWritingAssistanceOutputSchema,
  },
  async input => {
    if (!input.userStory) {
        return {
            overallFeedback: "No user story provided.",
            suggestions: []
        };
    }
    const { output } = await prompt(input);
    return output!;
  }
);
