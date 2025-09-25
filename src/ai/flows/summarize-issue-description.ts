'use server';

/**
 * @fileOverview A flow that summarizes a long Jira issue description into a concise summary using AI.
 *
 * - summarizeIssueDescription - A function that handles the summarization process.
 * - SummarizeIssueDescriptionInput - The input type for the summarizeIssueDescription function.
 * - SummarizeIssueDescriptionOutput - The return type for the summarizeIssueDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeIssueDescriptionInputSchema = z.object({
  description: z.string().describe('The Jira issue description to summarize.'),
});
export type SummarizeIssueDescriptionInput = z.infer<
  typeof SummarizeIssueDescriptionInputSchema
>;

const SummarizeIssueDescriptionOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the Jira issue description.'),
});
export type SummarizeIssueDescriptionOutput = z.infer<
  typeof SummarizeIssueDescriptionOutputSchema
>;

export async function summarizeIssueDescription(
  input: SummarizeIssueDescriptionInput
): Promise<SummarizeIssueDescriptionOutput> {
  return summarizeIssueDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeIssueDescriptionPrompt',
  input: {schema: SummarizeIssueDescriptionInputSchema},
  output: {schema: SummarizeIssueDescriptionOutputSchema},
  prompt: `Summarize the following Jira issue description in a concise manner:\n\n{{description}}`,
});

const summarizeIssueDescriptionFlow = ai.defineFlow(
  {
    name: 'summarizeIssueDescriptionFlow',
    inputSchema: SummarizeIssueDescriptionInputSchema,
    outputSchema: SummarizeIssueDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
